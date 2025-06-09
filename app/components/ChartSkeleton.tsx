import { useEffect, useState } from 'react';

interface ChartSkeletonProps {
  className?: string;
  showProgress?: boolean;
  progress?: number;
  loadingMessage?: string;
}

export function ChartSkeleton({ 
  className = "", 
  showProgress = false,
  progress = 0,
  loadingMessage = "Cargando datos..."
}: ChartSkeletonProps) {
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep(prev => (prev + 1) % 3);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  const getAnimationClass = (index: number) => {
    return animationStep === index ? 'animate-pulse' : 'opacity-60';
  };

  return (
    <div className={`chart-skeleton bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header skeleton */}
      <div className="chart-skeleton__header mb-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className={`h-6 bg-gray-200 rounded w-48 ${getAnimationClass(0)}`} />
            <div className={`h-4 bg-gray-100 rounded w-32 ${getAnimationClass(1)}`} />
          </div>
          <div className="flex space-x-2">
            <div className={`h-8 w-8 bg-gray-200 rounded ${getAnimationClass(2)}`} />
            <div className={`h-8 w-8 bg-gray-200 rounded ${getAnimationClass(0)}`} />
            <div className={`h-8 w-8 bg-gray-200 rounded ${getAnimationClass(1)}`} />
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {showProgress && (
        <div className="chart-skeleton__progress mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">{loadingMessage}</span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Chart area skeleton */}
      <div className="chart-skeleton__content relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div 
              key={i} 
              className={`h-3 bg-gray-200 rounded w-12 ${getAnimationClass(i % 3)}`} 
            />
          ))}
        </div>

        {/* Chart content */}
        <div className="ml-16 mr-4">
          {/* Chart bars/lines simulation */}
          <div className="h-64 flex items-end justify-between space-x-2">
            {Array.from({ length: 12 }).map((_, i) => {
              const height = Math.random() * 60 + 20;
              return (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div 
                    className={`bg-gradient-to-t from-blue-200 to-blue-100 rounded-t ${getAnimationClass(i % 3)}`}
                    style={{ height: `${height}%` }}
                  />
                  <div className={`h-3 bg-gray-200 rounded w-8 mt-2 ${getAnimationClass((i + 1) % 3)}`} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend skeleton */}
      <div className="chart-skeleton__legend mt-6 flex justify-center space-x-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded ${getAnimationClass(i)} ${
              i === 0 ? 'bg-blue-200' : i === 1 ? 'bg-green-200' : 'bg-purple-200'
            }`} />
            <div className={`h-4 bg-gray-200 rounded w-20 ${getAnimationClass((i + 1) % 3)}`} />
          </div>
        ))}
      </div>

      {/* Loading dots animation */}
      <div className="flex justify-center mt-4">
        <div className="flex space-x-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 bg-blue-400 rounded-full ${
                animationStep === i ? 'animate-bounce' : ''
              }`}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ChartSkeleton;
