FastF1 proxy service

This small FastAPI service uses the community FastF1 library to download F1 session telemetry
and expose a tiny JSON endpoint your Next.js frontend can call.

Quick start (macOS / zsh):

1. Create a virtual environment and install deps:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Run the service (development):

```bash
uvicorn main:app --reload --port 5000
```

3. Example request (Race session for season 2025 round 1):

GET http://localhost:5000/telemetry/session?season=2025&round=1

Notes
- FastF1 downloads session data from public timing sources. It is community-maintained and not an official licensed feed.
- The endpoint returns a small summary to keep the payload small. Extend as needed.
