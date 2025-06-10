import { IconBase } from "./IconBase";
import type { IconProps } from "./types";

export function TrendingUpIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      />
    </IconBase>
  );
}
