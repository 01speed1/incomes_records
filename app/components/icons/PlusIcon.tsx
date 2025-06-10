import { IconBase } from "./IconBase";
import type { IconProps } from "./types";

export function PlusIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </IconBase>
  );
}
