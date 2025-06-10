# Guía de Desarrollo

Esta guía contiene toda la información necesaria para desarrolladores que trabajen en el proyecto Income Management Application.

## 🛠️ Configuración del Entorno

### Prerrequisitos

- Node.js 18+
- pnpm (recomendado)
- Git
- SQLite

### Setup Inicial

```bash
# Clonar el repositorio
git clone <repository>
cd incomes

# Instalar dependencias
pnpm install

# Configurar base de datos
pnpm prisma migrate dev

# Iniciar desarrollo
pnpm dev
```

## 📁 Estructura del Proyecto

```
incomes/
├── app/
│   ├── components/        # Componentes reutilizables
│   │   ├── icons/        # Sistema de iconos
│   │   └── ui/           # Componentes base
│   ├── routes/           # Rutas de React Router 7
│   ├── services/         # Lógica de negocio
│   ├── hooks/            # React hooks personalizados
│   └── types/            # Definiciones TypeScript
├── prisma/               # Esquemas y migraciones
├── docs/                 # Documentación técnica
└── public/               # Archivos estáticos
```

## 🎯 Convenciones de Código

### TypeScript

- Usar tipos explícitos para props y funciones
- Crear archivos `.d.ts` para tipos complejos
- Evitar `any`, usar `unknown` cuando sea necesario

### React Router 7

- Un archivo por ruta en `app/routes/`
- Usar loaders para data fetching
- Implementar actions para mutaciones
- Seguir convenciones de naming

### Componentes

- Usar metodología BEM para clases CSS
- Crear componentes reutilizables antes de vistas específicas
- Documentar props complejas con JSDoc

### Base de Datos

- Usar Prisma para todas las operaciones
- Validar datos antes de persistir
- Manejar errores específicos de constrains

## 🧪 Testing

```bash
# Ejecutar tests
pnpm test

# Test con coverage
pnpm test:coverage

# Test en modo watch
pnpm test:watch
```

## 📊 Manejo de Datos Financieros

### Principios Importantes

- **Precisión**: Usar Decimal para cálculos monetarios
- **Validación**: Validar todos los inputs financieros
- **Auditoría**: Mantener historial de cambios
- **Seguridad**: Sanitizar datos sensibles

### Ejemplo de Servicio

```typescript
import { Decimal } from "@prisma/client/runtime/library";

export class FinancialService {
  static validateAmount(amount: string): Decimal {
    const decimal = new Decimal(amount);
    if (decimal.lessThan(0)) {
      throw new Error("Amount must be positive");
    }
    return decimal;
  }
}
```

## 🎨 Sistema de Iconos

### Uso Básico

```typescript
import { ChartBarIcon, CurrencyDollarIcon } from "~/components/icons";

// Tamaños disponibles: sm, md, lg, xl
<ChartBarIcon size="md" color="text-blue-600" />;
```

### Crear Nuevo Icono

1. Crear archivo en `app/components/icons/[IconName].tsx`
2. Extender de `IconBase`
3. Exportar en `app/components/icons/index.ts`

## 🔄 Flujo de Contribución

### Git Workflow

```bash
# Crear rama feature
git checkout -b feature/nueva-funcionalidad

# Hacer commits descriptivos
git commit -m "feat: agregar validación de contribuciones duplicadas"

# Actualizar desde main
git rebase main

# Push y crear PR
git push origin feature/nueva-funcionalidad
```

### Mensajes de Commit

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Cambios de formato
- `refactor:` Refactoring de código
- `test:` Agregar tests

## 🚀 Despliegue

### Build de Producción

```bash
# Construir aplicación
pnpm build

# Verificar build local
pnpm start
```

### Variables de Entorno

```env
DATABASE_URL="file:./data.db"
SESSION_SECRET="your-secret-key"
NODE_ENV="production"
```

## 🐛 Debugging

### Herramientas Útiles

- **Prisma Studio**: `pnpm prisma studio`
- **Database Reset**: `pnpm prisma migrate reset`
- **Type Check**: `pnpm tsc --noEmit`

### Logs Comunes

```typescript
// Logging financiero
console.log(
  `Processing contribution: ${contribution.amount} for goal ${goalId}`
);

// Error handling
try {
  await savingsGoalService.addContribution(data);
} catch (error) {
  console.error("Contribution error:", error.message);
}
```

## 📋 Checklist de Features

Antes de completar una feature, verificar:

- [ ] Tests pasando
- [ ] Tipos TypeScript correctos
- [ ] Manejo de errores implementado
- [ ] Documentación actualizada
- [ ] Performance optimizada
- [ ] Accesibilidad considerada
- [ ] Responsive design
- [ ] Datos financieros validados

## 🔗 Enlaces Útiles

- [React Router 7 Docs](https://reactrouter.com/en/main)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## 🆘 Soporte

Para preguntas específicas:

1. Revisar esta documentación
2. Buscar en issues existentes
3. Crear nuevo issue con template apropiado
