# Holographic Laser Hero Component

A stunning full-viewport hero section with animated holographic laser beam effects for the CampusAI landing page.

## Features

- ✨ **Holographic laser beams** with gradient colors (purple, cyan, magenta)
- 🌊 **Smooth animations**: drift, pulse, and parallax effects
- 🎨 **Additive blending** for bright, glowing beams on dark background
- ♿ **Fully accessible**: respects `prefers-reduced-motion`, includes toggle button
- 📱 **Mobile optimized**: reduces beam count and animation complexity
- 🎯 **Two implementations**: SVG (default) and Canvas (high-performance)

## Files

- `LaserHero.jsx` - SVG-based implementation (recommended for most use cases)
- `LaserHeroCanvas.jsx` - Canvas-based implementation (for high beam counts 20+)
- `LASER_HERO_README.md` - This file

## Usage

### Basic Usage (SVG Implementation)

```jsx
import LaserHero from './components/LaserHero';

function App() {
  return <LaserHero />;
}
```

### High-Performance Usage (Canvas Implementation)

```jsx
import LaserHeroCanvas from './components/LaserHeroCanvas';

function App() {
  return <LaserHeroCanvas />;
}
```

## Tuning Knobs

### SVG Implementation (`LaserHero.jsx`)

Edit these constants at the top of the component:

```javascript
const BEAM_COUNT = 8;           // Number of laser beams (2-3 for mobile, 8-12 for desktop)
const BLUR_STRENGTH = 6;        // SVG blur intensity (3-10)
const PULSE_SPEED = 1;          // Animation speed multiplier (0.5-2)
const DRIFT_AMPLITUDE = 100;    // Horizontal movement range in pixels (50-200)
```

### Canvas Implementation (`LaserHeroCanvas.jsx`)

```javascript
const BEAM_COUNT = 12;          // Can handle 50+ beams
const PARTICLE_COUNT = 3;       // Particles per beam for glow (1-5)
const BLUR_RADIUS = 8;          // Canvas blur intensity (4-12)
const DRIFT_SPEED = 0.001;      // Animation speed (0.0005-0.002)
```

### Color Customization

#### SVG Version
Edit the `linearGradient` in the SVG defs:

```jsx
<linearGradient id="laserGradient" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.8" />   {/* Purple */}
    <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.6" />  {/* Cyan */}
    <stop offset="100%" stopColor="#EC4899" stopOpacity="0.8" /> {/* Magenta */}
</linearGradient>
```

#### Canvas Version
Edit the `getGradientColor` method in the `Beam` class:

```javascript
getGradientColor(t) {
    if (t < 0.5) {
        return this.lerpColor('#7C3AED', '#06B6D4', t * 2);  // Purple to Cyan
    } else {
        return this.lerpColor('#06B6D4', '#EC4899', (t - 0.5) * 2);  // Cyan to Magenta
    }
}
```

## Performance Optimization

### Mobile
- Automatically reduces beam count to 2-3 (CSS media query in SVG version)
- Simplifies animations
- Reduces blur intensity

### Low-Power Mode
- Respects `prefers-reduced-motion` system setting
- Provides toggle button to disable all effects
- Falls back to static content

### When to Use Canvas vs SVG

**Use SVG (LaserHero.jsx) when:**
- Beam count < 15
- Need better browser compatibility
- Prefer simpler code
- Want CSS-based animations

**Use Canvas (LaserHeroCanvas.jsx) when:**
- Beam count > 20
- Need more complex particle effects
- Want additive blending with multiple passes
- Performance is critical

## Accessibility

- All text content is in the DOM (not rendered in Canvas/SVG)
- High contrast text (white on black)
- Keyboard accessible navigation
- Toggle button to disable visual effects
- Respects `prefers-reduced-motion` system preference

## Integration with Existing Landing Page

Replace your current `LandingPage.jsx` with:

```jsx
import LaserHero from './components/LaserHero';

function LandingPage() {
  return <LaserHero />;
}

export default LandingPage;
```

Or import it into your existing page structure.

## Customization Examples

### Increase Intensity
```javascript
const BEAM_COUNT = 12;
const BLUR_STRENGTH = 8;
const PULSE_SPEED = 1.5;
```

### Subtle Effect
```javascript
const BEAM_COUNT = 4;
const BLUR_STRENGTH = 4;
const PULSE_SPEED = 0.7;
const DRIFT_AMPLITUDE = 50;
```

### Extreme (Canvas recommended)
```javascript
const BEAM_COUNT = 30;
const PARTICLE_COUNT = 5;
const BLUR_RADIUS = 12;
```

## Browser Support

- **SVG Version**: All modern browsers (Chrome, Firefox, Safari, Edge)
- **Canvas Version**: All modern browsers with Canvas 2D support
- **Fallback**: Static content with effects disabled

## License

Part of the CampusAI project.
