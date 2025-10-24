# Hero Image Setup

## Required: hero.webp

For optimal LCP performance, place a hero image at:

```
public/images/hero.webp
```

### Recommended Specifications

- **Dimensions:** 1280x720 (16:9 aspect ratio)
- **Format:** WebP (AVIF fallback handled by next/image)
- **File size target:** < 100 KB after optimization
- **Subject:** Abstract gradient, quantum visualization, or technology theme

### Quick Setup with Placeholder

If you don't have a hero image yet, create a gradient placeholder:

```bash
# Using ImageMagick (if installed)
convert -size 1280x720 gradient:#06b6d4-#8b5cf6 public/images/hero.webp

# Or download a free image from:
# - https://unsplash.com (search: "abstract gradient" or "technology")
# - https://www.pexels.com (search: "technology background")
```

### Usage in Components

```tsx
<Hero
  title="Your Title"
  subtitle="Your Subtitle"
  heroImage={{
    src: '/images/hero.webp',
    alt: 'Abstract quantum computing visualization',
    width: 1280,
    height: 720,
    sizes: '(max-width: 768px) 100vw, 1280px',
  }}
/>
```

### Performance Notes

- Only the hero image should use `priority` flag
- All other images should lazy-load by default
- next/image automatically serves AVIF/WebP based on browser support
