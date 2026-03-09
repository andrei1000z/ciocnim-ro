# 🎨 Ciocnim.ro - Design System Guide

## Color Palette

### Primary Colors
- **Red Primary**: #dc2626 - Main action color, egg color
- **Red Dark**: #991b1b - Hover states, traditional egg
- **Gold/Chihlimbar**: #d97706 - Accents, warmth
- **Amber**: #f59e0b - Light accents, glow effects

### Background
- **Gradient**: amber-50 → orange-50 → red-50
- **Light backgrounds**: #fef8f3 (warm beige)
- **White**: #ffffff with 85-90% opacity for cards

### Text
- **Dark**: #1f2937 (gray-800) - Main text
- **Red**: #dc2626 - Headings, emphasis
- **Muted**: #6b7280 (gray-500) - Secondary text

---

## Typography

### Font Family
**Outfit** - Warm, friendly, geometric sans-serif
- Weights: 100, 300, 400, 500, 700, 900
- Used across entire app for consistency

### Sizing
- **H1**: 2rem - 4rem (responsive)
- **H2**: 1.5rem - 2.25rem (responsive)
- **Body**: 0.875rem - 1rem (responsive)
- **Small**: 0.75rem - 0.875rem (secondary info)

---

## Components

### 🔘 Buttons

#### Primary Action (Red)
```html
class="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg 
       border-2 border-red-500 hover:from-red-600 hover:to-red-700 
       transition-all active:scale-95 shadow-lg"
```
- Used for: Main actions, game start, save changes
- Colors: Red gradient with darker hover state
- Feedback: Scale down on click for tactile feel

#### Secondary Action (Gold)
```html
class="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-lg"
```
- Used for: Secondary actions, optional choices
- Colors: Gold/amber gradient

#### Ghost Button (Text)
```html
class="bg-transparent text-red-600 hover:bg-red-50 px-6 py-3 rounded-lg"
```
- Used for: Cancel, back, dismissive actions
- Colors: Text-only with hover background

### 💳 Cards

#### Premium Glass Card
```html
class="bg-white/85 backdrop-blur-lg p-8 rounded-3xl border-2 border-red-200 
       shadow-xl hover:shadow-2xl transition-all duration-300"
```
- Used for: Main content containers
- Effect: Translucent with blur backdrop
- Interaction: Elevation on hover

#### Easter Card
```html
class="bg-gradient-to-br from-red-100 to-orange-100 p-6 rounded-3xl 
       border-4 border-red-700 shadow-xl"
```
- Used for: Festive sections, traditions
- Colors: Warm red/orange gradients
- Special: Subtle shine effect on top

### 🎯 Input Fields

#### Text Input
```html
class="p-4 border-2 border-red-500 rounded-xl font-semibold text-gray-800 
       outline-none focus:border-red-700 focus:ring-2 focus:ring-red-100 
       transition-all bg-white/90"
```
- Colors: Red border with soft red ring on focus
- Feedback: Gentle color transition
- Mobile: 16px font to prevent zoom on iOS

### 🏆 Leaderboard Items

#### Player Ranking
```html
class="flex justify-between items-center p-5 rounded-2xl border-2 shadow-lg
       hover:shadow-xl transition-all duration-300 bg-white/70"
```
- Current player: Gold background with yellow border
- Others: White with gray border, red hover
- Rank badge: Circular gradient (gold/silver/bronze/red)

---

## Animations

### 🎈 Float (Gentle)
```css
animation: float-gentle 6s ease-in-out infinite;
/* Floating up/down with subtle rotation */
```
- Duration: 6 seconds
- Used for: Egg floating, decorative elements
- Effect: Gentle up/down motion with rotation

### ⚡ Impact (Shake)
```css
animation: impact-shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
/* Left-right shaking on impact */
```
- Duration: 0.4 seconds
- Used for: When egg hits opponent
- Effect: Rapid left-right vibration

### 💥 Pop (Crack)
```css
animation: pop-smash 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
/* Explosive scale up then settle */
```
- Duration: 0.5 seconds
- Used for: Egg crack animation, victory effects
- Effect: Burst up then settle with brightness

### 🌟 Glow (Pulse)
```css
animation: glow-pulse 2s ease-in-out infinite;
/* Pulsing outer glow */
```
- Duration: 2 seconds
- Used for: Highlighted items, special eggs
- Effect: Breathing glow effect

### ⭐ Star (Twinkle)
```css
animation: star-twinkle 1.5s ease-in-out infinite;
/* Scaling and rotating twinkle */
```
- Duration: 1.5 seconds
- Used for: Victory indicator, #1 ranking
- Effect: Scale and rotation combined

---

## Responsive Breakpoints

### Mobile First
- **Extra Small**: 320px - 380px
  - Font shrink, gap reduction
  - Single column layouts
  - Simplified navigation

- **Small**: 381px - 640px
  - Standard mobile layout
  - 2-column grids where needed
  - Touch-friendly spacing

- **Tablet**: 641px - 1024px
  - 2-3 column layouts
  - Larger cards and buttons
  - Desktop sidebar preparation

- **Desktop**: 1025px+
  - Full multi-column layouts
  - Large spacing and padding
  - Advanced interactions

### Safe Areas (Notches/Dynamic Island)
```css
padding-left: max(1rem, env(safe-area-inset-left));
padding-right: max(1rem, env(safe-area-inset-right));
padding-top: max(0.5rem, env(safe-area-inset-top));
padding-bottom: max(1rem, env(safe-area-inset-bottom));
```

---

## Accessibility Features

### Focus States
```css
*:focus-visible {
  outline: 3px solid #dc2626;
  outline-offset: 2px;
}
```
- Red outline for keyboard navigation
- Works with screen readers

### Selection
```css
::selection {
  background-color: rgba(153, 27, 27, 0.7);
  color: #fbbf24;
}
```
- Dark red background with gold text
- Traditional color combination

### Touch Targets
- Minimum 44x44px for buttons
- Adequate spacing between interactive elements
- No hover-only actions on mobile

---

## Shadow System

### Soft Shadow (sm)
```css
box-shadow: 0 5px 15px -3px rgba(0, 0, 0, 0.1);
```
- Used for: Cards, buttons
- Effect: Subtle depth

### Medium Shadow (lg)
```css
box-shadow: 0 10px 30px -5px rgba(220, 38, 38, 0.15);
```
- Used for: Modal-like components
- Effect: Noticeable depth with red tint

### Large Shadow (xl)
```css
box-shadow: 0 20px 40px -10px rgba(153, 27, 27, 0.25);
```
- Used for: Prominent cards on hover
- Effect: Strong shadow on interaction

---

## Spacing Scale

- **xs**: 0.25rem (4px)
- **sm**: 0.5rem (8px)
- **base**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)
- **2xl**: 3rem (48px)
- **3xl**: 4rem (64px)

---

## Border Radius

- **sm**: 0.5rem (8px) - Small elements
- **base**: 1rem (16px) - Standard cards
- **lg**: 1.5rem (24px) - Large cards
- **2xl**: 2rem (32px) - Extra large containers
- **3xl**: 3rem (48px) - Modal-like components
- **full**: 9999px - Circular elements

---

## Z-Index Hierarchy

- **-10**: Ambient glow backgrounds
- **0**: Regular content
- **1**: UI overlays
- **10**: Tooltips, popovers
- **50**: Modals, dropdowns
- **99999**: Global modals, alerts

---

## Mobile Touch Gestures

### Tap
- 44x44px minimum target size
- Immediate visual feedback (scale 0.97)
- No 300ms delay

### Swipe
- Register on element drag
- Used for: Navigation, carousel
- Smooth transition animations

### Long Press
- Hold 500ms+ to trigger
- Used for: Context menu, special actions
- Haptic feedback if supported

### Pinch
- Zoom between min (1) and max (5) scale
- For detailed inspections
- Smooth scaling animation

---

## Performance Considerations

### Animations
- Use `will-change: transform` for CPU optimization
- 60 FPS target (16.67ms per frame)
- GPU-accelerated transforms preferred
- Reduced motion support: `prefers-reduced-motion: reduce`

### Mobile Optimization
- Font size 16px minimum (prevents iOS zoom)
- `-webkit-appearance: none` for custom inputs
- `touch-action: manipulation` for instant response
- Avoid 100vh (use 100dvh instead)

### Layouts
- Fluid grid system (no fixed widths when possible)
- Mobile-first CSS approach
- Responsive images with lazy loading
- CSS Grid and Flexbox for modern layout

---

## Dark Mode Ready

While current version uses light theme, the system supports dark mode:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-light: #1f1f1f;
    --text-color: #f0f0f0;
  }
}
```

Future versions can easily implement dark theme using CSS variables.

---

## Usage Examples

### Create a New Button
```html
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 
             rounded-xl border-2 border-red-500 hover:from-red-600 hover:to-red-700 
             transition-all active:scale-95 shadow-lg hover:shadow-xl"
  onClick={handleClick}
>
  Click Me!
</motion.button>
```

### Create a New Card
```html
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="bg-white/85 backdrop-blur-lg p-8 rounded-3xl border-2 border-red-200 
             shadow-xl hover:shadow-2xl transition-all duration-300"
>
  Content here
</motion.div>
```

### Apply Float Animation
```html
<div className="animate-float-v9">
  🥚
</div>
```

---

## Brand Voice

### Visual Language
- **Warm**: Embracing, traditional
- **Playful**: Fun, interactive Easter spirit
- **Accessible**: Clear, easy to use for all ages
- **Modern**: Contemporary web design standards
- **Romanian**: Celebrating local traditions

### Tone in Copy
- **Friendly**: "Ciocnește ouă online!" (not "Initiate egg collision")
- **Encouraging**: "Fii campion!" (not "Become the winner")
- **Cultural**: Reference traditions respectfully
- **Festive**: Celebrate the Easter spirit

---

## Future Enhancements

### Coming Soon
- Dark mode variant
- More egg skins (cosmic, limited edition)
- Sound effects (optional)
- Haptic feedback on mobile
- Social sharing features
- Multiplayer tournaments

### Design Phase
- Animated backgrounds for seasonal events
- Custom cursor designs
- Page transition animations
- Advanced gestures
- Accessibility improvements

---

## Resources

- **Font**: [Outfit](https://fonts.google.com/specimen/Outfit)
- **Icons**: Emoji (:))
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Color Inspiration**: Traditional Romanian Easter colors

---

**Design System Version**: 31.0  
**Last Updated**: March 2026  
**Made with ❤️ for tradition**
