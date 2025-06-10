import type { IconProps } from "./types";

interface IconBaseProps extends IconProps {
  children: React.ReactNode;
  viewBox?: string;
}

export function IconBase({
  children,
  className = "",
  size = "md",
  color,
  viewBox = "0 0 24 24",
}: IconBaseProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-10 h-10",
  };

  const colorClass = color || "text-current";

  return (
    <svg
      className={`${sizeClasses[size]} ${colorClass} ${className}`}
      fill="none"
      stroke="currentColor"
      viewBox={viewBox}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}
