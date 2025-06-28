# Components Directory

This directory contains all React components organized by category:

## Structure

- **ui/**: Reusable UI components (buttons, inputs, modals, etc.)
- **layout/**: Layout-specific components (header, sidebar, footer)
- **charts/**: Data visualization components
- **forms/**: Form-related components

## Guidelines

1. Each component should be in its own file
2. Use TypeScript interfaces for props
3. Follow accessibility guidelines (WCAG 2.1 AA)
4. Include proper JSDoc comments
5. Export components using named exports
6. Use forwardRef for components that need ref forwarding

## Naming Conventions

- Component files: PascalCase (e.g., `WaterQualityChart.tsx`)
- Component names: PascalCase
- Props interfaces: `ComponentNameProps`
- Hook files: camelCase starting with "use" (e.g., `useWaterData.ts`)