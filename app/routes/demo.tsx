import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { useState } from "react";
import { getSavingsGoalsWithContributions } from "../services/savingsGoal.server";
import ResponsiveChart from "../components/ResponsiveChart";
import ChartSkeleton from "../components/ChartSkeleton";
import ChartError from "../components/ChartError";
import type { SavingsGoalWithContributions } from "../types/financial";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const goals = await getSavingsGoalsWithContributions();
    return { goals, error: null };
  } catch (error) {
    console.error("Error loading goals:", error);
    return { goals: [], error: "Failed to load data" };
  }
}

export default function ChartDemo() {
  const { goals, error: loaderError } = useLoaderData<typeof loader>();
  const [selectedDemo, setSelectedDemo] = useState<
    "responsive" | "skeleton" | "error"
  >("responsive");
  const [chartType, setChartType] = useState<"line" | "bar" | "doughnut">(
    "line"
  );
  const [errorToShow, setErrorToShow] = useState({
    hasError: true,
    errorMessage: "Error de demostración para mostrar el manejo de errores",
    errorCode: "DEMO_ERROR",
    canRetry: true,
    retryCount: 1,
    lastAttempt: new Date(),
  });

  const handleRetryDemo = () => {
    setErrorToShow((prev) => ({ ...prev, retryCount: prev.retryCount + 1 }));
  };

  const handleClearError = () => {
    setSelectedDemo("responsive");
  };

  return (
    <div className="chart-demo">
      <div className="chart-demo__container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="chart-demo__header mb-8">
          <h1 className="chart-demo__title text-3xl font-bold text-gray-900 mb-4">
            Demostración del Sistema de Gráficos Avanzado
          </h1>
          <p className="chart-demo__subtitle text-gray-600 mb-6">
            Explora todas las funcionalidades avanzadas implementadas en el Paso
            6: estados de carga, manejo de errores, actualizaciones automáticas
            y responsividad completa.
          </p>

          {/* Demo Controls */}
          <div className="chart-demo__controls bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Controles de Demostración
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Demo Type Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Demostración
                </label>
                <select
                  value={selectedDemo}
                  onChange={(e) => setSelectedDemo(e.target.value as any)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="responsive">
                    📊 Gráfico Responsive Completo
                  </option>
                  <option value="skeleton">
                    ⏳ Estado de Carga (Skeleton)
                  </option>
                  <option value="error">❌ Manejo de Errores</option>
                </select>
              </div>

              {/* Chart Type Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Gráfico
                </label>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value as any)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  disabled={selectedDemo !== "responsive"}
                >
                  <option value="line">📈 Líneas</option>
                  <option value="bar">📊 Barras</option>
                  <option value="doughnut">🍩 Donut</option>
                </select>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Funcionalidades Implementadas:
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span>Estados de carga avanzados</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span>Manejo robusto de errores</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span>Actualizaciones automáticas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span>Responsividad completa</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span>Optimización de rendimiento</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span>Zoom y pan interactivo</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span>Exportación de gráficos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span>Retry automático con backoff</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Demo Content */}
        <section className="chart-demo__content">
          {selectedDemo === "responsive" && (
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Gráfico Responsive con Todas las Funcionalidades
                </h3>
                <ResponsiveChart
                  goals={goals}
                  chartType={chartType}
                  height={450}
                  showControls={true}
                  showStats={true}
                  autoRefresh={true}
                  className="w-full"
                />
              </div>

              {/* Mobile Preview */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Vista Previa Móvil (Simulada)
                </h3>
                <div className="max-w-sm mx-auto border-2 border-gray-300 rounded-lg overflow-hidden">
                  <ResponsiveChart
                    goals={goals}
                    chartType={chartType}
                    height={300}
                    showControls={true}
                    showStats={true}
                    autoRefresh={false}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedDemo === "skeleton" && (
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Estados de Carga Avanzados (Skeleton Loaders)
                </h3>

                {/* Different loading states */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-800 mb-3">
                      Carga Inicial
                    </h4>
                    <ChartSkeleton
                      showProgress={true}
                      progress={25}
                      loadingMessage="Inicializando componentes..."
                      className="h-80"
                    />
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-800 mb-3">
                      Carga de Datos
                    </h4>
                    <ChartSkeleton
                      showProgress={true}
                      progress={75}
                      loadingMessage="Procesando datos financieros..."
                      className="h-80"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedDemo === "error" && (
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Manejo Robusto de Errores
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Network Error */}
                  <div>
                    <h4 className="text-md font-medium text-gray-800 mb-3">
                      Error de Red
                    </h4>
                    <ChartError
                      error={{
                        hasError: true,
                        errorMessage:
                          "No se pudo conectar al servidor. Verifica tu conexión a internet.",
                        errorCode: "NETWORK_ERROR",
                        canRetry: true,
                        retryCount: 2,
                        lastAttempt: new Date(Date.now() - 30000),
                      }}
                      onRetry={handleRetryDemo}
                      onClear={handleClearError}
                      className="h-80"
                    />
                  </div>

                  {/* Data Error */}
                  <div>
                    <h4 className="text-md font-medium text-gray-800 mb-3">
                      Error de Datos
                    </h4>
                    <ChartError
                      error={errorToShow}
                      onRetry={handleRetryDemo}
                      onClear={handleClearError}
                      className="h-80"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Technical Details */}
        <section className="chart-demo__tech-details mt-12">
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Detalles Técnicos de Implementación
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">
                  🚀 Optimización de Rendimiento
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Memoización de datos y configuraciones</li>
                  <li>• Carga diferida de Chart.js</li>
                  <li>• Debouncing de actualizaciones</li>
                  <li>• Cancelación de requests pendientes</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">
                  📱 Responsividad
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Detección automática de viewport</li>
                  <li>• Configuraciones adaptativas</li>
                  <li>• Controles táctiles optimizados</li>
                  <li>• Layouts flexibles</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">
                  🔄 Auto-actualización
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Polling configurable</li>
                  <li>• Retry con backoff exponencial</li>
                  <li>• Detección de estado online/offline</li>
                  <li>• Limpieza automática de recursos</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <section className="chart-demo__navigation mt-8 flex justify-center space-x-4">
          <a
            href="/"
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            ← Volver al Dashboard
          </a>
          <a
            href="/charts"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Ver Gráficos de Producción →
          </a>
        </section>
      </div>
    </div>
  );
}
