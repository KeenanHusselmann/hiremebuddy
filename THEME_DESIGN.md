# HireMeBuddy Theme Design System

## Overview
HireMeBuddy uses a clean, modern design system inspired by Yango's mobile app aesthetic with off-white backgrounds and teal accents. The theme system supports both light and dark modes with comprehensive color tokens and glassmorphism effects.

## Color Palette

### Primary Colors
- **Primary Teal**: `hsl(180, 100%, 35%)` - Main brand color
- **Primary Hover**: `hsl(180, 100%, 30%)` - Interactive states
- **Primary Foreground**: `hsl(0, 0%, 98%)` - Text on primary backgrounds

### Background Colors
- **Background**: `hsl(0, 0%, 98%)` - Main app background (off-white)
- **Card**: `hsl(0, 0%, 100%)` - Card backgrounds (pure white)
- **Muted**: `hsl(180, 10%, 94%)` - Subtle background areas

### Accent Colors
- **Secondary**: `hsl(180, 50%, 90%)` - Light teal for secondary elements
- **Accent**: `hsl(180, 90%, 40%)` - Vibrant teal for highlights

### Neutral Colors
- **Foreground**: `hsl(180, 8%, 15%)` - Primary text color
- **Muted Foreground**: `hsl(180, 5%, 45%)` - Secondary text

## Dark Mode Colors

### Backgrounds
- **Background**: `hsl(180, 15%, 8%)` - Dark app background
- **Card**: `hsl(180, 15%, 10%)` - Dark card backgrounds
- **Muted**: `hsl(180, 15%, 15%)` - Dark muted areas

### Teal Accents (Dark)
- **Primary**: `hsl(180, 90%, 50%)` - Brighter teal for dark mode
- **Primary Hover**: `hsl(180, 90%, 55%)` - Interactive states
- **Accent**: `hsl(180, 80%, 55%)` - Bright accent for dark mode

## Gradients

### Light Mode
- **Gradient Teal**: Linear gradient from `hsl(180, 100%, 35%)` to `hsl(180, 80%, 45%)`
- **Gradient Light**: Subtle background gradient from `hsl(0, 0%, 98%)` to `hsl(180, 10%, 96%)`

### Dark Mode
- **Gradient Teal**: Darker teal gradient from `hsl(180, 80%, 25%)` to `hsl(180, 60%, 35%)`
- **Gradient Light**: Dark background gradient from `hsl(180, 15%, 12%)` to `hsl(180, 15%, 8%)`

## Glassmorphism Effects

### Glass Cards
- **Background**: Semi-transparent with backdrop blur
- **Border**: Subtle teal-tinted borders
- **Shadow**: Soft teal-tinted shadows with appropriate opacity
- **Backdrop Filter**: 16px blur for frosted glass effect

### Glass Components
- **Glass Background**: `hsl(180, 15%, 97%)` - Light mode glass effect
- **Glass Border**: `hsl(180, 20%, 90%)` - Subtle border color
- **Glass Shadow**: `hsla(180, 100%, 35%, 0.1)` - Teal-tinted shadow

## Typography

### Font Stack
- **Primary**: Inter, system-ui, sans-serif
- **Fallback**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto

### Text Colors
- **Primary Text**: Uses `--foreground` token
- **Secondary Text**: Uses `--muted-foreground` token
- **Link Text**: Uses `--primary` token

## Component Styling

### Buttons
- **Primary Button**: Uses `gradient-teal` background
- **Glass Button**: Glassmorphism effect with backdrop blur
- **Hover States**: Subtle transform and shadow changes

### Cards
- **Standard Card**: White background with subtle border
- **Glass Card**: Glassmorphism effect with teal accents
- **Hover Effects**: Slight elevation and border color changes

### Inputs
- **Background**: Light glass effect
- **Border**: Teal accent on focus
- **Placeholder**: Muted foreground color

## Accessibility Features

### High Contrast Mode
- Automatic high contrast variants for accessibility
- Enhanced border and text contrast ratios
- Supports both light and dark high contrast themes

### Color Blindness Support
- Sufficient contrast ratios (WCAG AA compliant)
- Alternative visual indicators beyond color
- Pattern and shape differentiation

## Theme Implementation

### CSS Custom Properties
All colors are implemented using CSS custom properties with HSL values:
```css
:root {
  --primary: 180 100% 35%;
  --background: 0 0% 98%;
  /* ... more tokens */
}
```

### Tailwind Integration
Colors are integrated into Tailwind config for utility classes:
```typescript
colors: {
  primary: 'hsl(var(--primary))',
  background: 'hsl(var(--background))',
  // ... more utilities
}
```

### Theme Toggle
- Located in Profile Settings page
- Supports light, dark, and system preference modes
- Persistent storage of user preference

## Design Inspiration

### Yango Mobile App
The theme draws inspiration from Yango's clean, modern design:
- **Minimalist Approach**: Clean layouts with plenty of whitespace
- **Teal Accents**: Strategic use of teal for important actions
- **Card-Based UI**: Elevated cards with subtle shadows
- **Professional Feel**: Business-appropriate color scheme

### Mobile-First Design
- Optimized for mobile viewing
- Touch-friendly interactive elements
- Glassmorphism effects that work well on mobile
- Responsive typography and spacing

## Usage Guidelines

### Do's
- Use teal sparingly for important actions and highlights
- Maintain sufficient contrast between text and backgrounds
- Apply glassmorphism effects consistently
- Follow the established color hierarchy

### Don'ts
- Avoid overusing bright teal - it should be an accent
- Don't mix the teal theme with other color schemes
- Avoid low contrast combinations
- Don't break the established visual hierarchy

## Browser Support
- Modern browsers with CSS custom properties support
- Backdrop-filter support for glassmorphism (graceful degradation)
- Automatic fallbacks for older browsers

## Future Considerations
- Potential expansion to other accent colors
- Additional theme variants for different user types
- Seasonal theme variations
- Enhanced accessibility features