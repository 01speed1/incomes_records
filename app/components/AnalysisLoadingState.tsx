interface AnalysisLoadingStateProps {
  className?: string;
  showTimeline?: boolean;
  showMetrics?: boolean;
}

export function AnalysisLoadingState({
  className = "",
  showTimeline = true,
  showMetrics = true,
}: AnalysisLoadingStateProps) {
  return (
    <div className={`analysis-loading-state ${className}`}>
      {/* Header skeleton */}
      <div className="analysis-loading-state__header flex justify-between items-center mb-6">
        <div>
          <div className="analysis-loading-state__title-skeleton bg-gray-200 h-6 w-64 rounded animate-pulse mb-2"></div>
          <div className="analysis-loading-state__subtitle-skeleton bg-gray-200 h-4 w-48 rounded animate-pulse"></div>
        </div>
        <div className="analysis-loading-state__button-skeleton bg-gray-200 h-10 w-32 rounded animate-pulse"></div>
      </div>

      {/* Metrics skeleton */}
      {showMetrics && (
        <div className="analysis-loading-state__metrics mb-6">
          <div className="analysis-loading-state__metrics-header mb-4">
            <div className="bg-gray-200 h-5 w-48 rounded animate-pulse mb-1"></div>
            <div className="bg-gray-200 h-4 w-72 rounded animate-pulse"></div>
          </div>
          <div className="analysis-loading-state__metrics-cards grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="analysis-loading-state__metric-card bg-white rounded-lg p-4 shadow-sm border border-gray-100"
              >
                <div className="bg-gray-200 h-4 w-24 rounded animate-pulse mb-2"></div>
                <div className="bg-gray-200 h-8 w-32 rounded animate-pulse mb-1"></div>
                <div className="bg-gray-200 h-3 w-28 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
          <div className="analysis-loading-state__stats">
            <div className="bg-gray-200 h-px w-full mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center">
                  <div className="bg-gray-200 h-6 w-12 rounded animate-pulse mx-auto mb-1"></div>
                  <div className="bg-gray-200 h-3 w-16 rounded animate-pulse mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Timeline skeleton */}
      {showTimeline && (
        <div className="analysis-loading-state__timeline">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="analysis-loading-state__timeline-header mb-4">
                <div className="bg-gray-200 h-5 w-40 rounded animate-pulse mb-1"></div>
                <div className="bg-gray-200 h-4 w-56 rounded animate-pulse"></div>
              </div>

              {/* Timeline grid skeleton */}
              <div className="analysis-loading-state__timeline-grid space-y-4">
                {[2023, 2024].map((year) => (
                  <div
                    key={year}
                    className="analysis-loading-state__year-group"
                  >
                    <div className="bg-gray-200 h-4 w-16 rounded animate-pulse mb-2"></div>
                    <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                      {Array.from({ length: 12 }, (_, i) => (
                        <div
                          key={i}
                          className="analysis-loading-state__month-indicator"
                        >
                          <div className="bg-gray-200 h-8 w-8 rounded animate-pulse mx-auto mb-1"></div>
                          <div className="bg-gray-200 h-2 w-8 rounded animate-pulse mx-auto"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend skeleton */}
              <div className="analysis-loading-state__legend mt-4 flex flex-wrap gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="bg-gray-200 h-4 w-4 rounded animate-pulse"></div>
                    <div className="bg-gray-200 h-3 w-20 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline stats skeleton */}
            <div className="lg:col-span-1">
              <div className="analysis-loading-state__timeline-stats bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="bg-gray-200 h-5 w-24 rounded animate-pulse mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="bg-gray-200 h-4 w-16 rounded animate-pulse"></div>
                      <div className="bg-gray-200 h-4 w-8 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AnalysisErrorState({
  error,
  onRetry,
  className = "",
}: {
  error: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={`analysis-error-state bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <svg
          className="w-6 h-6 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.76 0L4.054 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-red-800">Analysis Error</h3>
      </div>

      <p className="text-red-700 mb-4">{error}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="analysis-error-state__retry-btn bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
