import { IconBase } from "./IconBase";
import type { IconProps } from "./types";

export function XMarkIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </IconBase>
  );
}
