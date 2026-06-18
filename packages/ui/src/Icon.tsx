import type { SVGProps } from "react";

/* Inline stroke icons — union of the public + admin sets from the design. */
export const ICONS: Record<string, string> = {
  bike: "M5.5 17.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm13 0a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM5.5 14h6l4-7m-2 0h3m-9 0 5 7",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  arrowUR: "M7 17 17 7m0 0H8m9 0v9",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.3-4.3",
  phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z",
  chat: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z",
  pin: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Zm-9 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-16v6l4 2",
  wrench: "M14.7 6.3a4 4 0 0 0-5.4 5.3L3 18l3 3 6.4-6.3a4 4 0 0 0 5.3-5.4l-2.6 2.6-2.3-.4-.4-2.3 2.6-2.6Z",
  star: "M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 18.9 6.1 20.9l1.2-6.5L2.5 9.4l6.6-.9L12 2.5Z",
  sliders: "M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0M14 4v4M6 10v4M16 16v4",
  check: "M20 6 9 17l-5-5",
  close: "M18 6 6 18M6 6l12 12",
  menu: "M3 6h18M3 12h18M3 18h18",
  mail: "M4 4h16v16H4zM4 6l8 6 8-6",
  globe: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm-8-10h16M12 2a14 14 0 0 1 0 20 14 14 0 0 1 0-20Z",
  chevron: "M6 9l6 6 6-6",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z",
  spark: "M12 3v4m0 10v4M3 12h4m10 0h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18",
  wheel: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-6a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-8V2m0 20v-6m4-4h6M2 12h6",
  /* admin set */
  dashboard: "M4 13h7V4H4v9Zm0 7h7v-5H4v5Zm9 0h7v-9h-7v9Zm0-16v5h7V4h-7Z",
  inbox: "M22 12h-6l-2 3h-4l-2-3H2m20 0-3.5-7a2 2 0 0 0-1.8-1H7.3a2 2 0 0 0-1.8 1L2 12m20 0v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 0-.1-1.4l2-1.6-2-3.4-2.4 1a7.3 7.3 0 0 0-2.4-1.4L14 2h-4l-.5 2.8A7.3 7.3 0 0 0 7.1 6.2l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.8l-2 1.6 2 3.4 2.4-1a7.3 7.3 0 0 0 2.4 1.4L10 22h4l.5-2.8a7.3 7.3 0 0 0 2.4-1.4l2.4 1 2-3.4-2-1.6c.06-.46.1-.93.1-1.4Z",
  plus: "M12 5v14M5 12h14",
  edit: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z",
  trash: "M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14ZM10 11v6M14 11v6",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  eyeOff: "M9.9 4.2A9.1 9.1 0 0 1 12 4c6.5 0 10 7 10 7a13.2 13.2 0 0 1-2.2 2.9M6.6 6.6A13.2 13.2 0 0 0 2 11s3.5 7 10 7a9.1 9.1 0 0 0 3.4-.6M3 3l18 18M9.5 9.5a3 3 0 0 0 4 4",
  alert: "M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z",
  box: "M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16ZM3.3 7 12 12l8.7-5M12 22V12",
  tag: "M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 2.8 12V4a1.2 1.2 0 0 1 1.2-1.2h8a2 2 0 0 1 1.4.6l7.2 7.2a2 2 0 0 1 0 2.8ZM7 7h.01",
  image: "M3 5h18v14H3zM3 15l5-5 4 4 3-3 6 6M9 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
  save: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2ZM17 21v-8H7v8M7 3v5h8",
  external: "M7 17 17 7m0 0H8m9 0v9",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  user: "M20 21a8 8 0 1 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
};

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: keyof typeof ICONS | string;
  size?: number;
}

export function Icon({ name, size, width, height, style, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      width={size ?? width}
      height={size ?? height}
      style={style}
      {...rest}
    >
      <path d={ICONS[name] ?? ""} />
    </svg>
  );
}
