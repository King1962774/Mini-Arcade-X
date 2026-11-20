import type { SVGProps } from 'react';

const paths: Record<string, React.ReactNode> = {
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  back: <path d="m15 18-6-6 6-6M20 12H9" />,
  sound: <><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="M15 9a5 5 0 0 1 0 6m3-9a9 9 0 0 1 0 12" /></>,
  mute: <><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="m17 9 5 6m0-6-5 6" /></>,
  star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />,
  controller: <><path d="M6.5 9h11a4 4 0 0 1 3.9 4.8l-.7 3.2a2 2 0 0 1-3.2 1.1L14 15h-4l-3.5 3.1a2 2 0 0 1-3.2-1.1l-.7-3.2A4 4 0 0 1 6.5 9Z" /><path d="M8 11v4m-2-2h4m5-1h.01M18 14h.01" /></>,
  spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z" /><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" /></>,
  monitor: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8m-4-4v4m-6-9 3-3 2 2 4-4 3 3" /></>,
  bolt: <path d="m13 2-3 8h7L9 22l2-9H5l8-11Z" />,
  crosshair: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="2" /><path d="M12 2v3m0 14v3M2 12h3m14 0h3" /></>,
};

export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: keyof typeof paths }) {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
