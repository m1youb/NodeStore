# 🚀 CORE SYSTEMS - Quick Start Guide

## Prerequisites

- Node.js installed
- MongoDB running (local or Atlas)

---

## 🏃 Running the Application

### 1. Start the Backend

```bash
cd server
node src/index.js
```

✅ Server should start on `http://localhost:5000`  
✅ MongoDB should connect successfully  
✅ No API keys required (mock services enabled)

### 2. Start the Frontend

Open a new terminal:

```bash
cd client
npm run dev
```

✅ Frontend should start on `http://localhost:5173`  
✅ Open browser to see CORE SYSTEMS

---

## 🎨 What You'll See

### Home Page
- **CORE SYSTEMS** branding with gradient text
- **Bento Grid** layout with 6 laptop categories
- **Powerhouse** category (double-width) with motherboard image
- **Status badges** on each card (IN STOCK, RTX READY, etc.)
- **Spec summaries** under each category name
- **Action links** with animated arrows
- **Featured Systems** section at the bottom

### Navigation
- **Floating glassmorphism bar** at the top
- **Icon-only design** (Home, Cart, Profile)
- **Cart counter** with green badge
- **Hover effects** on all icons

---

## 🖼️ Adding Images (Optional)

To see the full design with laptop hardware images:

1. Copy the generated images from artifacts to `client/public/`
2. Rename them:
   - `laptop_motherboard_powerhouse.png` → `powerhouse.jpg`
   - `gaming_laptop_interior.png` → `gaming.jpg`
   - `workstation_laptop_components.png` → `workstation.jpg`

Or use your own laptop hardware images!

---

## 🧪 Testing Features

### User Flow
1. **Sign Up** - Create a new account
2. **Browse** - Explore laptop categories
3. **Add to Cart** - Click "ADD TO CART" on featured products
4. **Checkout** - Mock payment (no real transaction)

### Admin Flow (if you have admin access)
1. **Dashboard** - Click dashboard icon
2. **Create Products** - Add new laptop products
3. **Analytics** - View sales data

---

## 🎯 Key Features to Demo

### Design System
- ✨ **Industrial high-tech aesthetic**
- ✨ **Glassmorphism navigation**
- ✨ **Hardware-style cards**
- ✨ **Status badges with glow**
- ✨ **Monospace technical specs**

### Interactions
- ✨ **Hover effects** on cards and buttons
- ✨ **Animated arrows** on action links
- ✨ **Smooth transitions** throughout
- ✨ **Staggered card animations**

### Layout
- ✨ **Bento grid** with double-width featured card
- ✨ **Responsive design** (works on all devices)
- ✨ **Floating navigation**

---

## 🐛 Troubleshooting

### Backend won't start
- **Check MongoDB**: Make sure MongoDB is running
- **Check port**: Port 5000 should be available
- **Check .env**: Environment variables have defaults

### Frontend won't start
- **Run**: `npm install` in client folder
- **Check port**: Port 5173 should be available
- **Clear cache**: Delete `node_modules` and reinstall

### Images not showing
- **Check path**: Images should be in `client/public/`
- **Check names**: Must match category names exactly
- **Check format**: Use .jpg or .png

### Styling looks wrong
- **Check Tailwind**: Make sure PostCSS is processing
- **Clear cache**: Hard refresh browser (Ctrl+Shift+R)
- **Check console**: Look for CSS errors

---

## 📚 Documentation

- **DESIGN_SYSTEM.md** - Complete design system documentation
- **REDESIGN_SUMMARY.md** - All changes made
- **IMAGE_SETUP.md** - Image requirements and setup

---

## 🎓 For Your School Demo

### Talking Points

1. **Full-Stack MERN Application**
   - MongoDB for data
   - Express.js backend
   - React frontend
   - Node.js runtime

2. **Modern Design System**
   - Custom CSS variables
   - Glassmorphism effects
   - Responsive bento grid
   - Industrial aesthetic

3. **Advanced Features**
   - User authentication (JWT)
   - Shopping cart functionality
   - Mock payment processing
   - Admin dashboard
   - Product management

4. **Professional Code**
   - Component-based architecture
   - State management (Zustand)
   - Mock services for demo
   - Clean, maintainable code

### Demo Flow

1. **Show Home Page** - Explain the bento grid and design
2. **Browse Categories** - Show the laptop categories
3. **Add to Cart** - Demonstrate shopping functionality
4. **Show Navigation** - Highlight glassmorphism design
5. **Admin Features** - If applicable, show dashboard

---

## 🎉 You're Ready!

Your **CORE SYSTEMS** laptop boutique is ready to impress. The industrial high-tech design, combined with the full-stack functionality, makes for an excellent school project demonstration.

**Good luck with your demo! 🚀**
