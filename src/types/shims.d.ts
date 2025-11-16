// Minimal shims to silence TypeScript errors when optional deps are not installed.
declare module 'framer-motion' {
  // Lightweight shim: export `motion` as any so the build can use the library without full types.
  // If you install `@types/framer-motion` or rely on the library's types, remove or refine this shim.
  export const motion: any;
}

declare module 'lucide-react' {
  import type { ComponentType, SVGProps } from 'react';

  // Export a few commonly used icons as simple SVG component types.
  export const Trophy: ComponentType<SVGProps<SVGSVGElement>>;
  export const Users: ComponentType<SVGProps<SVGSVGElement>>;
  export const Gauge: ComponentType<SVGProps<SVGSVGElement>>;
  export const MapPin: ComponentType<SVGProps<SVGSVGElement>>;
  export const Activity: ComponentType<SVGProps<SVGSVGElement>>;
  export const Menu: ComponentType<SVGProps<SVGSVGElement>>;
  export const X: ComponentType<SVGProps<SVGSVGElement>>;

  const _default: ComponentType<SVGProps<SVGSVGElement>>;
  export default _default;
}
