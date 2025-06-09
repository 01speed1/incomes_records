import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ChartErrorProps {
  error: {
    hasError: boolean;
    errorMessage?: string;
    errorCode?: string;
    canRetry: boolean;
    retryCount: number;
    lastAttempt?: Date;
  };
  onRetry: () => void;
  onClear?: () => void;
  className?: string;
}

export function ChartError({ 
  error, 
  onRetry, 
  onClear,
  className = "" 
}: ChartErrorProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      // Delay para mostrar el estado de retry
      setTimeout(() => setIsRetrying(false), 500);
    }
  };

  const getErrorIcon = () => {
    if (!isOnline) return WifiOff;
    if (error.errorCode?.includes('NETWORK')) return Wifi;
    return AlertTriangle;
  };

  const getErrorTitle = () => {
    if (!isOnline) return 'Sin conexión a internet';
    if (error.errorCode?.includes('NETWORK')) return 'Error de conexión';
    if (error.errorCode?.includes('DATA')) return 'Error al cargar datos';
    return 'Error inesperado';
  };

  const getErrorMessage = () => {
    if (!isOnline) return 'Verifica tu conexión a internet e intenta nuevamente.';
    if (error.errorMessage) return error.errorMessage;
    return 'Ha ocurrido un error. Por favor, intenta nuevamente.';
  };

  const getRetryDelay = () => {
    if (error.retryCount === 0) return 0;
    return Math.pow(2, error.retryCount - 1) * 1000; // Exponential backoff
  };

  const ErrorIcon = getErrorIcon();

  if (!error.hasError) return null;

  return (
    <div className={`chart-error bg-white rounded-lg shadow-sm border border-red-200 ${className}`}>
      <div className="chart-error__content p-6">
        {/* Error header */}
        <div className="chart-error__header flex items-start space-x-3 mb-4">
          <div className="flex-shrink-0">
            <ErrorIcon 
              className={`w-6 h-6 ${
                !isOnline ? 'text-gray-500' : 'text-red-500'
              }`} 
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {getErrorTitle()}
            </h3>
            <p className="text-sm text-gray-600">
              {getErrorMessage()}
            </p>
          </div>
        </div>

        {/* Error details */}
        {error.retryCount > 0 && (
          <div className="chart-error__details bg-gray-50 rounded-md p-3 mb-4">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Intentos fallidos: {error.retryCount}</span>
              {error.lastAttempt && (
                <span>
                  Último intento: {error.lastAttempt.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Offline indicator */}
        {!isOnline && (
          <div className="chart-error__offline bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
            <div className="flex items-center">
              <WifiOff className="w-4 h-4 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-800">
                Trabajando sin conexión. Los datos se sincronizarán cuando te conectes.
              </span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="chart-error__actions flex flex-col sm:flex-row gap-3">
          {error.canRetry && (
            <button
              onClick={handleRetry}
              disabled={isRetrying || (!isOnline && error.errorCode?.includes('NETWORK'))}
              className="chart-error__retry-btn inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw 
                className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} 
              />
              {isRetrying ? 'Reintentando...' : 'Reintentar'}
            </button>
          )}

          {onClear && (
            <button
              onClick={onClear}
              className="chart-error__clear-btn inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cerrar
            </button>
          )}
        </div>

        {/* Auto-retry countdown */}
        {error.canRetry && getRetryDelay() > 0 && (
          <div className="chart-error__countdown mt-3 text-xs text-gray-500">
            <AutoRetryCountdown 
              delay={getRetryDelay()} 
              onComplete={handleRetry}
            />
          </div>
        )}
      </div>
    </div>
  );
}

interface AutoRetryCountdownProps {
  delay: number;
  onComplete: () => void;
}

function AutoRetryCountdown({ delay, onComplete }: AutoRetryCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(Math.ceil(delay / 1000));

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, onComplete]);

  if (timeLeft <= 0) return null;

  return (
    <div className="flex items-center space-x-2">
      <div className="w-3 h-3 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      <span>Reintentando automáticamente en {timeLeft}s...</span>
    </div>
  );
}

export default ChartError;
