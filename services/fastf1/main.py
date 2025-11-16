from fastapi import FastAPI, HTTPException
from typing import Optional, List, Dict, Any
import fastf1

app = FastAPI(title="FastF1 Proxy")

# Enable local cache directory to avoid repeated downloads (optional)
try:
    # fastf1 exposes a cache helper; guard in case the runtime fastf1 version differs
    fastf1.cache.enable_cache(".fastf1_cache")
except Exception:
    try:
        fastf1.Cache.enable_cache(".fastf1_cache")
    except Exception:
        # not critical; continue without cache
        pass


def safe_seconds(val):
    try:
        return val.total_seconds()
    except Exception:
        try:
            # handle numpy timedeltas
            return float(val)
        except Exception:
            return None


@app.get("/telemetry/session")
async def get_session_telemetry(season: int, round: int, detail: Optional[str] = None):
    """Return telemetry for a session.

    If `detail` is omitted, returns a compact summary (fastest lap per driver).
    If `detail=full`, returns per-driver lap lists including lapNumber and lapTimeSeconds.
    """
    try:
        session = fastf1.get_session(season, round, 'R')
        # load laps only; telemetry (big) can be optionally loaded by clients
        session.load(laps=True, telemetry=False)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    laps = getattr(session, 'laps', None)
    if laps is None or laps.empty:
        return { 'source': 'fastf1', 'season': season, 'round': round, 'drivers': [] }

    # compact response: fastest lap per driver
    try:
        fastest_idx = laps.groupby('Driver')['LapTime'].idxmin()
        fastest = laps.loc[fastest_idx.dropna().astype(int)]
    except Exception:
        # fallback: take min by lap time within DataFrame safely
        fastest = laps

    if detail == 'full':
        drivers: List[Dict[str, Any]] = []
        grouped = laps.groupby('Driver')
        for driver, group in grouped:
            grp_sorted = group.sort_values('LapNumber')
            laps_list: List[Dict[str, Any]] = []
            for _, row in grp_sorted.iterrows():
                lap_time = row.get('LapTime') if hasattr(row, 'get') else row['LapTime']
                laps_list.append({
                    'lapNumber': int(row['LapNumber']) if row['LapNumber'] is not None else None,
                    'lapTimeSeconds': safe_seconds(lap_time),
                    'lapTimeStr': str(lap_time)
                })

            drivers.append({
                'driver': driver,
                'driverNumber': int(group['DriverNumber'].iloc[0]) if 'DriverNumber' in group.columns else None,
                'laps': laps_list
            })

        return { 'source': 'fastf1', 'season': season, 'round': round, 'drivers': drivers }

    out = []
    for _, row in fastest.reset_index(drop=True).iterrows():
        lap_time = row['LapTime'] if 'LapTime' in row else None
        out.append({
            'driver': row.get('Driver') or row.get('DriverNumber'),
            'lapNumber': int(row['LapNumber']) if row.get('LapNumber') is not None else None,
            'lapTime': str(lap_time),
            'lapTimeSeconds': safe_seconds(lap_time)
        })

    return { 'source': 'fastf1', 'season': season, 'round': round, 'drivers': out }
