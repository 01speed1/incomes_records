import { IconBase } from "./IconBase";
import type { IconProps } from "./types";

export function ArrowRightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
      />
    </IconBase>
  );
}
