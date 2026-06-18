import type { CSSProperties } from "react";

/** Neutral striped placeholder for not-yet-uploaded photos (ported from design). */
export function Placeholder({
  label = "bike photo",
  className = "",
  style,
}: {
  label?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return <div className={`ph ${className}`.trim()} data-label={label} style={style} />;
}
