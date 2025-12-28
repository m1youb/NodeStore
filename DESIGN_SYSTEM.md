# CORE SYSTEMS - Industrial High-Tech Laptop Boutique

## 🎨 Design System

### Visual Identity
- **Brand**: CORE SYSTEMS - Premium High-Performance Computing
- **Aesthetic**: Industrial High-Tech / Engineering-Focused
- **Target Audience**: Engineers, Tech Professionals, Performance Enthusiasts

### Color Palette
```css
--color-void: #0A0A0A          /* Deep black background */
--color-carbon: #121212         /* Card backgrounds */
--color-steel: #1A1A1A          /* Secondary surfaces */
--color-border: #222222         /* Sharp borders */
--color-primary: #00D9FF        /* Cyan accent */
--color-secondary: #FF3366      /* Pink accent */
--color-success: #00FF88        /* Green (status/price) */
--color-warning: #FFB800        /* Yellow */
```

### Typography
- **Headings**: Inter (Bold, Tracking-tight, Uppercase)
- **Body**: Inter (Regular, Clean)
- **Technical/Mono**: JetBrains Mono (Status badges, specs, prices)

### Key Design Elements

#### 1. **Bento Grid Layout**
- Responsive grid system
- "Powerhouse" category spans 2 columns (double-width)
- Clean gaps, no rounded corners

#### 2. **Hardware Cards**
- Dark background (#0A0A0A)
- Sharp 1px borders (#222222)
- Hover effects: Border glow + subtle lift
- Status badges in corners

#### 3. **Status Badges**
- Monospace font
- Glowing animation
- Examples: "IN STOCK", "8-CORE", "RTX READY"
- Position: Top-right corner

#### 4. **Action Links**
- No chunky buttons
- Simple text with geometric arrow (→)
- Animated slide on hover
- Underline animation

#### 5. **Glassmorphism Navigation**
- Floating bar at top
- Blur effect backdrop
- Icon-only navigation
- Minimalist design

#### 6. **Spec Summaries**
- Displayed under category names
- Monospace font
- Technical specifications
- Example: "Starting at 3.2GHz / 32GB RAM"

## 📁 Project Structure

```
client/
├── src/
│   ├── index.css              # Core design system
│   ├── pages/
│   │   └── Home.jsx           # Bento grid layout
│   ├── components/
│   │   ├── Navbar.jsx         # Glassmorphism nav
│   │   ├── FeaturedProducts.jsx
│   │   └── FeaturedProduct.jsx
│   └── constants/
│       └── categories.js      # Laptop categories
└── public/
    └── [category images]      # Hardware images
```

## 🚀 Categories

1. **Powerhouse** (Double-width)
   - Specs: Up to 8-Core / 64GB RAM / RTX 4090
   - Status: IN STOCK

2. **Gaming**
   - Specs: Starting at 3.2GHz / 32GB RAM
   - Status: RTX READY

3. **Workstation**
   - Specs: Professional Grade / ECC Memory
   - Status: PRO SERIES

4. **Ultraportable**
   - Specs: Under 1kg / 20hr Battery
   - Status: AVAILABLE

5. **Creator**
   - Specs: 4K OLED / Color Accurate
   - Status: IN STOCK

6. **Business**
   - Specs: Enterprise Security / vPro
   - Status: CERTIFIED

## 🎯 Key Features

### Navigation
- **Floating glassmorphism bar**
- **Icon-only design** (Home, Cart, Profile, Dashboard)
- **Cart counter badge** with green accent
- **Hover effects** on all icons

### Product Cards
- **Hardware aesthetic** with sharp borders
- **Status badges** with pulse animation
- **Spec summaries** in monospace font
- **Action links** with animated arrows
- **Price display** in green monospace

### Interactions
- **Smooth transitions** (300ms cubic-bezier)
- **Hover glows** on cards and buttons
- **Scale effects** on images
- **Animated arrows** on links

## 🛠️ Technical Implementation

### CSS Custom Properties
All design tokens are defined as CSS variables for easy theming and consistency.

### Responsive Design
- Mobile-first approach
- Bento grid adapts to screen size
- Double-width cards stack on mobile

### Performance
- Hardware-accelerated animations
- Optimized image loading
- Minimal re-renders

## 📸 Image Requirements

Category images should be:
- High-quality laptop hardware photos
- Dark industrial aesthetic
- Dramatic lighting
- Focus on components (motherboards, cooling, etc.)
- Aspect ratio: 16:9 or 4:3

## 🎨 Design Philosophy

> "Designed by engineers, for engineers"

- **Zero fluff**: Every element serves a purpose
- **High contrast**: Easy to read, professional
- **Sharp corners**: No rounded edges (industrial aesthetic)
- **Monospace data**: Technical information stands out
- **Minimal color**: Strategic use of cyan, green, and pink accents

## 🔧 Development Notes

### Tailwind CSS Warnings
The `@tailwind` directive warnings in the CSS linter are expected and safe to ignore. These directives are processed during the build step by PostCSS.

### Mock Services
The backend has been configured with mock services for:
- Stripe (payment processing)
- Cloudinary (image storage)
- Redis (caching)

This allows the project to run without external API keys for demonstration purposes.

---

**Built with precision. Engineered for performance.**
