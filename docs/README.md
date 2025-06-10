# Documentación - Income Management Application

Esta carpeta contiene toda la documentación técnica y guías de uso para la aplicación de gestión de ingresos.

## 📁 Estructura de Documentación

### 📋 **Documentación Principal**

- **[PROJECT.md](./PROJECT.md)** - Instrucciones generales del proyecto y arquitectura
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Guía completa para desarrolladores
- **[README.md](../README.md)** - Guía de instalación y configuración inicial

### 🎯 **Características y Funcionalidades**

- **[CONTRIBUTION_FORM_IMPROVEMENTS.md](./CONTRIBUTION_FORM_IMPROVEMENTS.md)** - Mejoras del formulario de contribuciones
- **[RETROACTIVE_ANALYSIS.md](./RETROACTIVE_ANALYSIS.md)** - Sistema de análisis retroactivo

### 🎨 **Componentes y UI**

- **[ICON_SYSTEM.md](./ICON_SYSTEM.md)** - Sistema de iconos reutilizables
- **[PERFORMANCE_ICONS_MIGRATION.md](./PERFORMANCE_ICONS_MIGRATION.md)** - Migración de iconos de texto a SVG

## 🚀 **Inicio Rápido**

1. **Configuración del Proyecto**: Lee [PROJECT.md](./PROJECT.md)
2. **Setup de Desarrollo**: Sigue [DEVELOPMENT.md](./DEVELOPMENT.md)
3. **Instalación**: Sigue las instrucciones en [README.md](../README.md)
4. **Características**: Explora las funcionalidades específicas en cada documento

## 📊 **Stack Tecnológico**

- **Framework**: React Router 7 (full-stack)
- **Base de Datos**: SQLite con Prisma ORM
- **Runtime**: Node.js
- **Package Manager**: pnpm
- **Styling**: Tailwind CSS
- **Tipos**: TypeScript

## 🎯 **Propósito de la Aplicación**

Sistema de gestión de metas de ahorro que permite:

- Crear y gestionar objetivos financieros
- Registrar contribuciones mensuales reales vs proyectadas
- Analizar rendimiento y tendencias
- Visualizar progreso con gráficos y métricas

## 📖 **Guías de Desarrollo**

### Formularios y Validación

- [Mejoras del Formulario de Contribuciones](./CONTRIBUTION_FORM_IMPROVEMENTS.md)

### Análisis y Métricas

- [Sistema de Análisis Retroactivo](./RETROACTIVE_ANALYSIS.md)

### Componentes UI

- [Sistema de Iconos](./ICON_SYSTEM.md)

## 🔧 **Estructura del Proyecto**

```
app/
├── components/          # Componentes React reutilizables
├── hooks/              # Custom hooks
├── lib/                # Librerías y utilidades
├── routes/             # Rutas de React Router 7
├── schemas/            # Esquemas de validación
├── services/           # Servicios del servidor
└── types/              # Definiciones de tipos TypeScript

docs/                   # Documentación técnica
prisma/                 # Base de datos y migraciones
public/                 # Archivos estáticos
```

## 📝 **Convenciones de Código**

- **Componentes**: PascalCase con sufijo descriptivo
- **Archivos**: camelCase para funciones, PascalCase para componentes
- **CSS**: Metodología BEM con clases de Tailwind
- **TypeScript**: Tipado estricto y interfaces bien definidas

## 🤝 **Contribuciones**

Para añadir nueva documentación:

1. Crea el archivo `.md` en la carpeta `docs/`
2. Actualiza este README.md con el enlace correspondiente
3. Sigue el formato y estructura existente
4. Incluye ejemplos de código cuando sea apropiado

## 📧 **Contacto y Soporte**

Para preguntas específicas sobre la implementación o funcionalidades, consulta los archivos de documentación correspondientes o revisa el código fuente en los directorios mencionados.

---

_Última actualización: Junio 2025_
