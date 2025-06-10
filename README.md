# Income Management Application

Una aplicación de gestión de metas de ahorro construida con React Router 7 y SQLite que permite trackear y analizar el progreso hacia objetivos financieros.

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- pnpm (recomendado) o npm

### Instalación

1. **Clonar e instalar dependencias:**

```sh
git clone <repository>
cd incomes
pnpm install
```

2. **Configurar la base de datos:**

```sh
pnpm prisma migrate dev
```

3. **Iniciar el servidor de desarrollo:**

```sh
pnpm dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📖 Documentación

Toda la documentación técnica está organizada en la carpeta [`docs/`](./docs/):

- **[📋 Índice General](./docs/INDEX.md)** - Navegación rápida por toda la documentación
- **[🛠️ Guía de Desarrollo](./docs/DEVELOPMENT.md)** - Setup, convenciones y mejores prácticas
- **[🏗️ Arquitectura del Proyecto](./docs/PROJECT.md)** - Estructura y diseño del sistema
- **[📝 Formularios Mejorados](./docs/CONTRIBUTION_FORM_IMPROVEMENTS.md)** - Sistema de contribuciones
- **[📊 Análisis Retroactivo](./docs/RETROACTIVE_ANALYSIS.md)** - Métricas y visualizaciones
- **[🎨 Sistema de Iconos](./docs/ICON_SYSTEM.md)** - Componentes de UI reutilizables

## ⚡ Stack Tecnológico

- **Framework**: React Router 7 (full-stack)
- **Base de Datos**: SQLite + Prisma ORM
- **Styling**: Tailwind CSS
- **Tipos**: TypeScript
- **Runtime**: Node.js
- **Package Manager**: pnpm

## 🎯 Características Principales

- ✅ Gestión de metas de ahorro
- ✅ Registro de contribuciones mensuales
- ✅ Análisis de rendimiento vs objetivos
- ✅ Visualizaciones y gráficos
- ✅ Exportación de datos
- ✅ Diseño responsivo

## Development

## 🛠️ Scripts de Desarrollo

### Desarrollo

```sh
pnpm dev          # Servidor de desarrollo
pnpm build        # Build de producción
pnpm start        # Servidor de producción
```

### Base de Datos

```sh
pnpm prisma migrate dev     # Aplicar migraciones
pnpm prisma studio         # Interfaz visual de BD
pnpm prisma generate       # Generar cliente
```

### Calidad de Código

```sh
pnpm typecheck    # Verificar tipos TypeScript
pnpm lint         # Linter (si está configurado)
```

## 📁 Estructura del Proyecto

```
app/
├── components/           # Componentes React reutilizables
│   ├── icons/           # Sistema de iconos
│   └── ...              # Otros componentes
├── hooks/               # Custom hooks
├── lib/                 # Utilidades y librerías
├── routes/              # Rutas de React Router 7
├── schemas/             # Validación con Joi
├── services/            # Lógica de negocio
└── types/               # Tipos TypeScript

docs/                    # 📖 Documentación técnica
prisma/                  # 🗄️ Esquemas y migraciones
public/                  # 📁 Archivos estáticos
```

## 🤝 Contribuir

1. Lee la [documentación del proyecto](./docs/PROJECT.md)
2. Revisa las [guías de implementación](./docs/INDEX.md)
3. Sigue las convenciones de código establecidas
4. Actualiza la documentación según sea necesario

## 📚 Recursos Adicionales

- [React Router 7 Docs](https://reactrouter.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

_Para más información detallada, consulta la [documentación completa](./docs/README.md)._

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever css framework you prefer. See the [Vite docs on css](https://vitejs.dev/guide/features.html#css) for more information.
