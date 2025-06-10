import { IconBase } from "./IconBase";
import type { IconProps } from "./types";

export function ArrowDownIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
      />
    </IconBase>
  );
}
