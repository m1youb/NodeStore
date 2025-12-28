# Setting Up Category Images

## Quick Setup

To complete the visual redesign, you need to add laptop hardware images to the `client/public` folder.

### Required Images

Place these images in `client/public/`:

1. **powerhouse.jpg** - High-performance laptop motherboard/interior (for double-width card)
2. **gaming.jpg** - Gaming laptop with RGB cooling
3. **workstation.jpg** - Professional workstation components
4. **ultraportable.jpg** - Slim laptop internals
5. **creator.jpg** - High-end display/color-accurate components
6. **business.jpg** - Enterprise laptop hardware

### Image Specifications

- **Format**: JPG or PNG
- **Resolution**: Minimum 1920x1080 for best quality
- **Aspect Ratio**: 16:9 or 4:3
- **Style**: Dark industrial aesthetic, dramatic lighting
- **Focus**: Internal components, motherboards, cooling systems

### Using Generated Images

I've generated three high-quality laptop hardware images for you:

1. **laptop_motherboard_powerhouse** - Perfect for the Powerhouse category
2. **gaming_laptop_interior** - Ideal for Gaming category  
3. **workstation_laptop_components** - Great for Workstation category

These images are saved in the artifacts directory. You can:
1. Copy them to `client/public/`
2. Rename them to match the category names (e.g., `powerhouse.jpg`, `gaming.jpg`, `workstation.jpg`)

### Alternative: Stock Images

You can also use stock images from:
- **Unsplash**: Search for "laptop motherboard", "computer hardware"
- **Pexels**: Search for "laptop internals", "computer components"
- **Pixabay**: Search for "motherboard", "laptop hardware"

### Example File Structure

```
client/
└── public/
    ├── powerhouse.jpg      ← Motherboard/high-performance
    ├── gaming.jpg          ← RGB cooling/gaming setup
    ├── workstation.jpg     ← Professional components
    ├── ultraportable.jpg   ← Slim laptop internals
    ├── creator.jpg         ← Display/color hardware
    └── business.jpg        ← Enterprise laptop
```

## Testing

After adding images, start the development server:

```bash
cd client
npm run dev
```

The images should appear in the category cards on the home page.

## Fallback

If images are missing, the cards will still render with the dark background. The layout and styling will remain intact.
