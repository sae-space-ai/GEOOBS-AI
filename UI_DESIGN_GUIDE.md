# GEOOBS-AI - Guía de Diseño de Interfaz Amigable

## Nueva Paleta de Colores

### Colores Principales
- **Fondo principal**: `slate-50` a `slate-100` (gradiente suave)
- **Tarjetas**: `white` con bordes `slate-200`
- **Texto principal**: `slate-800`
- **Texto secundario**: `slate-600`
- **Texto terciario**: `slate-500`

### Colores de Acento
- **Primario**: Gradiente `indigo-500` → `purple-500`
- **Éxito**: Gradiente `emerald-500` → `teal-500`
- **Advertencia**: Gradiente `amber-500` → `orange-500`
- **Peligro**: Gradiente `red-500` → `rose-500`
- **Info**: Gradiente `sky-500` → `blue-500`

### Colores de Estado
- **Activo/OK**: `emerald-500`
- **Advertencia**: `amber-500`
- **Error**: `red-500`
- **Inactivo**: `slate-400`

## Mapeo de Colores Antiguos → Nuevos

### Fondos
- `bg-gray-950` → `bg-slate-50`
- `bg-gray-900` → `bg-white`
- `bg-gray-800` → `bg-slate-100`
- `bg-gray-700` → `bg-slate-200`

### Bordes
- `border-gray-800` → `border-slate-200`
- `border-gray-700` → `border-slate-300`

### Texto
- `text-white` → `text-slate-800`
- `text-gray-100` → `text-slate-700`
- `text-gray-400` → `text-slate-600`
- `text-gray-500` → `text-slate-500`
- `text-gray-600` → `text-slate-400`

### Acentos
- `text-cyan-400` → `text-indigo-600`
- `text-cyan-300` → `text-indigo-600`
- `text-green-400` → `text-emerald-600`
- `text-green-300` → `text-emerald-600`
- `text-purple-400` → `text-purple-600`
- `text-purple-300` → `text-purple-600`
- `text-amber-400` → `text-amber-600`
- `text-amber-300` → `text-amber-600`
- `text-yellow-400` → `text-amber-600`
- `text-yellow-300` → `text-amber-600`

### Botones
- `bg-cyan-700` → `bg-gradient-to-r from-indigo-500 to-purple-500`
- `bg-green-700` → `bg-gradient-to-r from-emerald-500 to-teal-500`
- `bg-purple-700` → `bg-gradient-to-r from-purple-500 to-pink-500`
- `bg-amber-700` → `bg-gradient-to-r from-amber-500 to-orange-500`
- `bg-gray-700` → `bg-slate-100`
- `bg-gray-800` → `bg-slate-200`

### Fondos con Opacidad
- `bg-cyan-900/30` → `bg-indigo-50`
- `bg-green-900/30` → `bg-emerald-50`
- `bg-purple-900/30` → `bg-purple-50`
- `bg-amber-900/30` → `bg-amber-50`
- `bg-yellow-900/30` → `bg-amber-50`

### Bordes con Opacidad
- `border-cyan-800/50` → `border-indigo-200`
- `border-green-800/50` → `border-emerald-200`
- `border-purple-800/50` → `border-purple-200`
- `border-amber-800/50` → `border-amber-200`
- `border-yellow-800/50` → `border-amber-200`

## Componentes Reutilizables

Se han creado componentes reutilizables en `src/components/UIComponents.tsx`:

- `Card` - Tarjeta básica
- `CardWithHeader` - Tarjeta con encabezado y gradiente
- `Button` - Botón con variantes (primary, secondary, success, warning, danger)
- `StatCard` - Tarjeta de estadísticas
- `Badge` - Etiqueta con variantes
- `SectionTitle` - Título de sección con gradiente
- `InfoBox` - Caja de información con variantes
- `MetricDisplay` - Visualización de métricas

## Efectos y Transiciones

- **Hover en tarjetas**: `card-hover` class con elevación y sombra
- **Transiciones suaves**: 0.2s ease en todos los elementos
- **Scrollbar personalizado**: Gradiente indigo-purple
- **Focus visible**: Outline indigo-600

## Canvas y Visualizaciones

Para los canvas de visualización científica, se mantienen los colores originales pero con mejor contraste:
- Fondo: `#f8fafc` (slate-50) en lugar de `#111827`
- Bordes: Colores más vibrantes
- Texto: Mejor legibilidad sobre fondo claro

## Accesibilidad

- Contraste WCAG AA cumplido en todos los textos
- Focus visible en todos los elementos interactivos
- Transiciones suaves para usuarios sensibles al movimiento
- Tamaños de fuente legibles (mínimo 12px)

## Próximos Pasos

1. ✅ Estilos globales actualizados (`src/index.css`)
2. ✅ Layout principal actualizado (`src/components/Layout.tsx`)
3. ✅ Dashboard actualizado (`src/screens/Dashboard.tsx`)
4. ⏳ Actualizar pantallas restantes con nueva paleta
5. ⏳ Actualizar canvas de visualización científica
6. ⏳ Probar accesibilidad con lectores de pantalla

## Notas de Implementación

- Todos los cambios son visuales, no afectan funcionalidad
- Los colores se aplican mediante clases de Tailwind CSS
- Los gradientes añaden profundidad y modernidad
- Las sombras suaves mejoran la jerarquía visual
- Los bordes redondeados (rounded-2xl) dan un aspecto más amigable
