import { IconBase } from './IconBase';
import type { IconProps } from './types';

export function ArrowLeftIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 19l-7-7m0 0l7-7m-7 7h18"
      />
    </IconBase>
  );
}
