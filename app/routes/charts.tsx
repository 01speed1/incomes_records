import type { MetaFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, Link } from "react-router";
import { SavingsGoalService } from "../services/savingsGoal.server";
import { AdvancedChartSystem } from "../components/AdvancedChartSystem";
import * as ClientTransforms from "../lib/client-transforms";
import type {
  SavingsGoalWithContributions,
  SerializedSavingsGoalWithContributions,
} from "../types/financial";

type LoaderData = {
  goals: SerializedSavingsGoalWithContributions[];
};

export const meta: MetaFunction = () => {
  return [
    { title: "Income Management - Advanced Charts" },
    {
      name: "description",
      content: "Advanced visualization and analytics for your income data",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const goals = await SavingsGoalService.getAllGoals();
    return Response.json({ goals });
  } catch (error) {
    console.error("Error loading goals for charts:", error);
    return Response.json({ goals: [] });
  }
}

export default function ChartsPage() {
  const { goals: rawGoals } = useLoaderData<LoaderData>();

  // Transform serialized data back to Decimal objects
  const goals = ClientTransforms.transformGoalsDataFromJSON(rawGoals);

  return (
    <div className="charts-page">
      <div className="charts-page__container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="charts-page__header mb-8">
          <div className="charts-page__header-content">
            <div className="charts-page__breadcrumb mb-4">
              <nav className="charts-page__breadcrumb-nav flex items-center space-x-2 text-sm text-gray-500">
                <Link
                  to="/"
                  className="charts-page__breadcrumb-link hover:text-gray-700 transition-colors duration-200"
                >
                  Dashboard
                </Link>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                <span className="charts-page__breadcrumb-current text-gray-900 font-medium">
                  Gráficos Avanzados
                </span>
              </nav>
            </div>

            <div className="charts-page__title-section">
              <h1 className="charts-page__title text-3xl font-bold text-gray-900 mb-2">
                Análisis Avanzado de Ingresos
              </h1>
              <p className="charts-page__subtitle text-lg text-gray-600">
                Visualización interactiva y análisis detallado de tus objetivos
                de ahorro
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="charts-page__main">
          {goals.length === 0 ? (
            <div className="charts-page__empty-state">
              <div className="charts-page__empty-container bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="charts-page__empty-icon mx-auto h-16 w-16 text-gray-400 mb-6">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="charts-page__empty-title text-xl font-semibold text-gray-900 mb-3">
                  No hay datos para mostrar
                </h3>
                <p className="charts-page__empty-description text-gray-500 mb-8 max-w-md mx-auto">
                  Para ver los gráficos avanzados, necesitas crear al menos un
                  objetivo de ahorro y agregar algunas contribuciones.
                </p>
                <div className="charts-page__empty-actions space-x-4">
                  <Link
                    to="/goals/new"
                    className="charts-page__empty-action-primary inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                  >
                    Crear Objetivo de Ahorro
                  </Link>
                  <Link
                    to="/"
                    className="charts-page__empty-action-secondary inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                  >
                    Volver al Dashboard
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="charts-page__chart-system">
              <AdvancedChartSystem
                goals={goals}
                height={500}
                showControls={true}
                showStats={true}
                initialConfig={{
                  period: "MONTHLY",
                  type: "BAR",
                  autoRefresh: {
                    enabled: false,
                    intervalMs: 60000,
                    maxRetries: 3,
                    exponentialBackoff: true,
                  },
                  performance: {
                    enableMemoization: true,
                    lazyLoad: false, // Disable lazy load on dedicated page
                    debounceMs: 500,
                  },
                  responsive: {
                    breakpoints: {
                      mobile: 640,
                      tablet: 768,
                      desktop: 1024,
                    },
                    adaptiveHeight: true,
                  },
                }}
              />
            </div>
          )}
        </main>

        {/* Additional Information */}
        {goals.length > 0 && (
          <aside className="charts-page__info mt-12">
            <div className="charts-page__info-container bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="charts-page__info-title text-lg font-semibold text-blue-900 mb-3">
                Funcionalidades del Gráfico Avanzado
              </h3>
              <div className="charts-page__info-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="charts-page__info-item">
                  <div className="charts-page__info-item-icon text-blue-600 mb-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <h4 className="charts-page__info-item-title font-medium text-blue-900 mb-1">
                    Zoom y Pan
                  </h4>
                  <p className="charts-page__info-item-description text-sm text-blue-700">
                    Usa la rueda del ratón para hacer zoom y arrastra para
                    desplazarte por los datos.
                  </p>
                </div>

                <div className="charts-page__info-item">
                  <div className="charts-page__info-item-icon text-blue-600 mb-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </div>
                  <h4 className="charts-page__info-item-title font-medium text-blue-900 mb-1">
                    Auto-actualización
                  </h4>
                  <p className="charts-page__info-item-description text-sm text-blue-700">
                    Activa la actualización automática para mantener los datos
                    siempre actualizados.
                  </p>
                </div>

                <div className="charts-page__info-item">
                  <div className="charts-page__info-item-icon text-blue-600 mb-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h4 className="charts-page__info-item-title font-medium text-blue-900 mb-1">
                    Exportar
                  </h4>
                  <p className="charts-page__info-item-description text-sm text-blue-700">
                    Descarga el gráfico como imagen PNG para incluir en reportes
                    o presentaciones.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
