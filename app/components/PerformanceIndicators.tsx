import type { PerformanceStatus } from "../types/retroactiveAnalysis";
import type { Decimal } from "decimal.js";
import { CurrencyFormatter } from "../lib/financial";
import {
  TrendingUpIcon,
  ArrowRightIcon,
  ArrowDownIcon,
  XMarkIcon,
} from "./icons";

interface PerformanceIndicatorProps {
  status: PerformanceStatus;
  percentage: number;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  tooltip?: string;
  theoreticalAmount?: Decimal;
  showTheoreticalAmount?: boolean;
}

export function PerformanceIndicator({
  status,
  percentage,
  size = "md",
  showTooltip = false,
  tooltip,
  theoreticalAmount,
  showTheoreticalAmount = false,
}: PerformanceIndicatorProps) {
  const getStatusConfig = (status: PerformanceStatus) => {
    switch (status) {
      case "ahead":
        return {
          color: "bg-green-500",
          textColor: "text-green-600",
          label: "Ahead",
          IconComponent: TrendingUpIcon,
        };
      case "on-track":
        return {
          color: "bg-blue-500",
          textColor: "text-blue-600",
          label: "On Track",
          IconComponent: ArrowRightIcon,
        };
      case "behind":
        return {
          color: "bg-yellow-500",
          textColor: "text-yellow-600",
          label: "Behind",
          IconComponent: ArrowDownIcon,
        };
      case "no-contribution":
        return {
          color: "bg-red-300",
          textColor: "text-red-600",
          label: "No Contribution",
          IconComponent: XMarkIcon,
        };
      default:
        return {
          color: "bg-gray-300",
          textColor: "text-gray-600",
          label: "Unknown",
          IconComponent: XMarkIcon,
        };
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case "sm":
        return "w-3 h-3 text-xs";
      case "lg":
        return "w-6 h-6 text-lg";
      default:
        return "w-4 h-4 text-sm";
    }
  };

  const getIconSize = (size: string): "sm" | "md" | "lg" | "xl" => {
    switch (size) {
      case "sm":
        return "sm";
      case "lg":
        return "md";
      default:
        return "sm";
    }
  };

  const config = getStatusConfig(status);
  const sizeClasses = getSizeClasses(size);
  const iconSize = getIconSize(size);
  const { IconComponent } = config;

  const indicator = (
    <div
      className={`performance-indicator inline-flex items-center justify-center rounded-sm ${
        config.color
      } ${sizeClasses} ${
        showTooltip ? "cursor-help hover:scale-110 hover:shadow-md" : ""
      } transition-all duration-200 ease-in-out`}
      title={
        showTooltip ? tooltip || `${config.label}: ${percentage}%` : undefined
      }
    >
      <IconComponent
        size={iconSize}
        color="text-white"
        className="drop-shadow-sm"
      />
    </div>
  );

  // If we should show the theoretical amount, wrap in a container
  if (showTheoreticalAmount && theoreticalAmount) {
    return (
      <div className="performance-indicator-with-amount flex items-center gap-2">
        {indicator}
        <div className="theoretical-amount-info">
          <div className="text-xs text-gray-500 leading-tight">Should have</div>
          <div className="text-sm font-medium text-gray-700 leading-tight">
            {CurrencyFormatter.formatCompact(theoreticalAmount)}
          </div>
        </div>
      </div>
    );
  }

  return indicator;
}

interface PerformanceBarProps {
  percentage: number;
  status: PerformanceStatus;
  className?: string;
}

export function PerformanceBar({
  percentage,
  status,
  className = "",
}: PerformanceBarProps) {
  const getBarColor = (status: PerformanceStatus) => {
    switch (status) {
      case "ahead":
        return "bg-green-500";
      case "on-track":
        return "bg-blue-500";
      case "behind":
        return "bg-yellow-500";
      case "no-contribution":
        return "bg-red-300";
      default:
        return "bg-gray-300";
    }
  };

  const displayPercentage = Math.min(percentage, 100);
  const barColor = getBarColor(status);

  return (
    <div className={`performance-bar w-full ${className}`}>
      <div className="performance-bar__track bg-gray-200 rounded-full h-2 relative overflow-hidden">
        <div
          className={`performance-bar__fill ${barColor} h-full rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${displayPercentage}%` }}
        />
        {percentage > 100 && (
          <div className="performance-bar__overflow absolute inset-0 flex items-center justify-end pr-1">
            <span className="text-xs font-semibold text-green-700">
              {percentage.toFixed(0)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
