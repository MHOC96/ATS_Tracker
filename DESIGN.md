Design System Analysis

name: ATS
colors:
  primary: '#171717'
  primary-text: '#ffffff'
  secondary: '#ffffff'
  secondary-text: '#171717'
  background: '#ffffff'
  surface: '#fafafa'
  text-primary: '#171717'
  text-secondary: '#4d4d4d'
  text-muted: '#666666'
  border: '#ebebeb'
  accent: '#0070f3'
  dark-surface: '#171717'
  dark-text: '#ffffff'
typography:
  display:
    family: 'Geist Mono'
    size: 48px
    weight: 400
    line-height: 1.2
  heading:
    family: 'Geist Mono'
    size: 32px
    weight: 400
    line-height: 1.2
  body:
    family: 'Geist'
    size: 14px
    weight: 400
    line-height: 1.5
  code:
    family: 'Geist Mono'
    size: 14px
    weight: 400
    line-height: 1.5
spacing:
  base: 4px
  scale: [4, 8, 12, 16, 24, 32, 40, 48, 64]
radius:
  sm: 4px
  md: 6px
  full: 9999px
elevation:
  card: '0 0 0 1px #ebebeb, 0px 1px 2px 0px rgba(0, 0, 0, 0.05)'
  hover: '0 0 0 1px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.08) (inferred from screenshot)'
  popover: '0 4px 4px 0 rgba(0, 0, 0, 0.05)'
  focus: '0 0 0 2px #ffffff, 0 0 0 4px #0070f3'
components:
  button-primary:
    bg: '{colors.primary}'
    text: '{colors.primary-text}'
    radius: '{radius.md}'
    padding: '8px 14px'
    border: '1px solid {colors.primary}'
  card:
    bg: '{colors.background}'
    radius: '{radius.md}'
    shadow: '{elevation.card}'
    padding: '24px'
---

## 1. Visual Theme & Atmosphere
ATS's design system projects precision and performance, built on a stark monochrome foundation of `#171717` (black) and `#ffffff` (white). This high-contrast world is softened by subtle background grids and a signature hero element: a vibrant, soft-focus gradient, often transitioning from orange to a teal green (inferred from screenshot). The typography is a key differentiator, pairing the technical, clean lines of `Geist Mono` for all headings with the highly legible sans-serif `Geist` for body copy. This dual-font approach establishes a clear, developer-centric voice that is both authoritative and modern.

The system's geometry is defined by sharp `6px` corner radii on interactive elements and containers, contrasted with fully-rounded `9999px` "pill" shapes for standalone calls-to-action. While the overall aesthetic is minimalist, it avoids feeling sterile through these careful typographic choices, subtle shadows, and the burst of color in its hero gradients. Micro-interactions are handled with quick, non-intrusive CSS transitions, typically around `200ms`, reinforcing the platform's focus on speed.

**Key Characteristics:**
*   **Monochrome Core:** A strict palette of `#171717` black, `#ffffff` white, and grays like `#4d4d4d`.
*   **Dual-Font System:** `Geist Mono` for headings and `Geist` for body text.
*   **Geometric Precision:** A subtle background grid and sharp `6px` radii on UI elements.
*   **Gradient Accents:** Soft, vibrant gradients provide the primary visual flourish in hero sections.
*   **Pill & Rectangle UI:** A mix of sharp `6px` rectangles and fully-rounded `9999px` pill buttons.
*   **Subtle Depth:** Elevation is achieved through fine 1px borders and soft, minimal box-shadows.
*   **Minimalist Iconography:** Line-based, monochrome icons with a consistent stroke weight.

## 2. Color Palette & Roles

### Primary
*   **Primary (`#171717`)**: The core brand black. Used for primary buttons, dark backgrounds, and headline text.
*   **Primary Text (`#ffffff`)**: Pure white, used as text color on primary (`#171717`) backgrounds for maximum contrast.

### Neutral Scale
*   **Background (`#ffffff`)**: The default page background, providing a bright and clean canvas.
*   **Surface (`#fafafa`)**: A slightly off-white used for subtle differentiation in page sections or card backgrounds.
*   **Text Primary (`#171717`)**: The primary text color for headlines and important copy on light backgrounds.
*   **Text Secondary (`#4d4d4d`)**: The standard for all body copy, offering high but comfortable readability.
*   **Text Muted (`#666666`)**: Used for secondary information, captions, and disabled states.

### Surface & Borders
*   **Border (`#ebebeb`)**: The primary border color, derived from `rgb(235, 235, 235)`. Used for inputs, cards, and subtle dividers.

### Accent
*   **Accent (`#0070f3`)**: A vibrant blue used for status indicators, focus rings, and occasional text links.
*   **Link (`#0068d6`)**: The default color for inline text links, a slightly darker shade of the primary accent.

## 3. Typography Rules

- **Font Family**:
    - **Primary**: `Geist`, with a standard fallback stack: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`.
    - **Monospace**: `Geist Mono`, with a standard fallback stack: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`.

- **Hierarchy**:
| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | Geist Mono | 48px | 400 | 1.2 | -0.02em (inferred) | Reserved for primary page hero headlines. |
| **H1** | Geist Mono | 32px | 400 | 1.2 | -0.02em (inferred) | Section titles and major headings. |
| **H2** | Geist Mono | 24px | 400 | 1.3 | -0.01em (inferred) | Sub-section titles. |
| **H3** | Geist | 20px | 500 | 1.4 | normal | Card titles and minor headings. |
| **Body (Large)** | Geist | 16px | 400 | 1.5 | normal | Used for introductory paragraphs. |
| **Body (Default)** | Geist | 14px | 400 | 1.5 | normal | The standard for all paragraph text. |
| **Caption** | Geist | 12px | 400 | 1.5 | normal | Used for metadata, labels, and legal text. |
| **Code/Mono** | Geist Mono | 14px | 400 | 1.5 | normal | Used for inline code snippets and labels. |

- **Principles**:
    - **Purposeful Pairing**: `Geist Mono` is used exclusively for headings to create a technical, structured feel, while `Geist` is used for all body copy for optimal readability.
    - **High Contrast**: Text color is almost always `#171717` or `#4d4d4d` on a white/off-white background, ensuring excellent clarity.
    - **Consistent Weight**: The system heavily favors a regular (400) weight across both font families, using size and family as the primary means of establishing hierarchy. Medium (500) weight is used sparingly for emphasis.

## 4. Component Stylings

### Buttons

**Primary Button**
The primary call-to-action is a solid black button with white text. It uses a sharp 6px radius for standard buttons or a fully-rounded pill shape for major CTAs.

```css
.button-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  font-family: 'Geist', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-primary-text, #ffffff);
  background-color: var(--color-primary, #171717);
  border: 1px solid var(--color-primary, #171717);
  border-radius: var(--radius-md, 6px);
  cursor: pointer;
  transition: opacity 0.2s ease-out;
}

.button-primary:hover {
  opacity: 0.8; /* inferred from screenshot */
}

.button-primary:active {
  opacity: 0.7; /* inferred from screenshot */
}

.button-primary:disabled {
  background-color: #fafafa; /* inferred from screenshot */
  color: #8f8f8f; /* inferred from screenshot */
  border-color: #ebebeb; /* inferred from screenshot */
  cursor: not-allowed;
}
```

**Secondary Button**
The secondary button is an outlined style with a white background, black text, and a thin black border.

```css
.button-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  font-family: 'Geist', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-secondary-text, #171717);
  background-color: var(--color-secondary, #ffffff);
  border: 1px solid var(--color-border, #ebebeb);
  border-radius: var(--radius-md, 6px);
  cursor: pointer;
  transition: border-color 0.2s ease-out, color 0.2s ease-out;
}

.button-secondary:hover {
  border-color: var(--color-primary, #171717);
  color: var(--color-primary, #171717);
}

.button-secondary:active {
  background-color: var(--color-surface, #fafafa);
  border-color: var(--color-primary, #171717);
}

.button-secondary:disabled {
  color: #8f8f8f; /* inferred from screenshot */
  border-color: #ebebeb; /* inferred from screenshot */
  cursor: not-allowed;
}
```

**Ghost Button**
A text-only button used for tertiary actions, often in navigation or toolbars. It has no border or background.

```css
.button-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  font-family: 'Geist', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: var(--color-text-secondary, #4d4d4d);
  background-color: transparent;
  border: none;
  border-radius: var(--radius-md, 6px);
  cursor: pointer;
  transition: color 0.2s ease-out;
}

.button-ghost:hover {
  color: var(--color-text-primary, #171717);
}

.button-ghost:active {
  color: var(--color-text-primary, #171717);
}

.button-ghost:disabled {
  color: #8f8f8f; /* inferred from screenshot */
  cursor: not-allowed;
}
```

### Cards & Containers
Cards are simple, clean containers with sharp corners, a subtle border, and a light shadow that lifts on hover.

```css
.card {
  background-color: var(--color-background, #ffffff);
  border-radius: var(--radius-md, 6px);
  padding: 24px;
  border: 1px solid var(--color-border, #ebebeb);
  box-shadow: var(--elevation-card, 0px 1px 2px 0px rgba(0, 0, 0, 0.05));
  transition: box-shadow 0.2s ease-out, transform 0.2s ease-out;
}

.card:hover {
  transform: translateY(-2px); /* inferred from screenshot */
  box-shadow: var(--elevation-hover, 0 0 0 1px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.08)); /* inferred from screenshot */
}
```

### Inputs & Forms

**Text Input**
Inputs are minimal, with a light gray border that darkens on hover and receives a blue focus ring.

```css
.form-label {
  display: block;
  font-family: 'Geist', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary, #171717);
  margin-bottom: 8px;
}

.text-input {
  width: 100%;
  padding: 8px 12px;
  font-family: 'Geist', sans-serif;
  font-size: 14px;
  color: var(--color-text-primary, #171717);
  background-color: var(--color-background, #ffffff);
  border: 1px solid var(--color-border, #ebebeb);
  border-radius: var(--radius-md, 6px);
  transition: border-color 0.2s ease-out, box-shadow 0.2s ease-out;
}

.text-input:focus {
  outline: none;
  border-color: var(--color-accent, #0070f3);
  box-shadow: var(--elevation-focus, 0 0 0 2px #ffffff, 0 0 0 4px #0070f3);
}

.text-input:disabled {
  background-color: var(--color-surface, #fafafa);
  color: var(--color-text-muted, #666666);
  cursor: not-allowed;
}
```

### Navigation

**Navigation Link**
Header navigation links are simple text elements that darken on hover. The active state is indicated by bold text.

```css
.nav-link {
  padding: 8px 12px;
  font-family: 'Geist', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: var(--color-text-secondary, #4d4d4d);
  text-decoration: none;
  transition: color 0.15s ease-in-out;
}

.nav-link:hover {
  color: var(--color-text-primary, #171717);
}

.nav-link[aria-current="page"],
.nav-link.active {
  color: var(--color-text-primary, #171717);
  font-weight: 500;
}
```

### Links

**Standard Link**
Inline links are colored with the brand's secondary blue accent and underline on hover.

```css
a.link-standard {
  color: var(--color-link, #0068d6);
  text-decoration: none;
  transition: text-decoration-color 0.2s ease-out;
}

a.link-standard:hover {
  text-decoration: underline;
  text-decoration-color: var(--color-link, #0068d6);
}

a.link-standard:visited {
  color: #7820bc; /* From extracted tokens */
}
```

### Badges

**Status Badge**
Small, inline badges used to indicate status, such as "NEW". They feature a thin border and uppercase text.

```css
.status-badge {
  display: inline-block;
  padding: 2px 6px;
  font-family: 'Geist Mono', monospace;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--color-text-primary, #171717);
  background-color: var(--color-background, #ffffff);
  border: 1px solid var(--color-text-primary, #171717);
  border-radius: var(--radius-sm, 4px);
  text-transform: uppercase;
}
```

## 5. Layout Principles

- **Spacing System**: The system is built on a 4px base unit. All padding, margins, and gaps should use multiples of this base.
    - **Scale**: `[4, 8, 12, 16, 24, 32, 40, 48, 64]`
    - **Usage Context**:
        - `4px`: Micro-spacing, icon-to-text gaps.
        - `8px`: Small gaps, padding inside small components like badges.
        - `12px`, `16px`: Standard padding for inputs and buttons.
        - `24px`: Content padding inside cards and containers.
        - `32px`: Gaps between distinct UI elements or cards.
        - `48px`, `64px`: Large-scale spacing for separating page sections.

- **Grid & Container**:
    _Note: Container widths and column counts are not extracted from the source. The values below are reasonable defaults inferred from the visible layout density._
    - **Max Width**: `1200px` (inferred)
    - **Columns**: 12-column grid system.
    - **Gutter**: `24px` (inferred)
    - **Section Padding**: `64px` vertical padding for major sections, `32px` for subsections.

- **Whitespace Philosophy**: Whitespace is used generously to create focus and separation. The underlying grid provides structure, but content rarely feels cramped. Ample padding within components and significant margins between sections are key to the clean, uncluttered feel.

- **Border Radius Scale**:
    - `4px (sm)`: Used for small, inline elements like badges.
    - `6px (md)`: The default radius for all primary containers, including cards, inputs, and standard buttons.
    - `9999px (full)`: Reserved for pill-shaped buttons and toggles, creating a strong visual distinction.

## 6. Depth & Elevation
ATS's elevation system is subtle, relying more on borders than heavy shadows for depth at lower levels. Shadows become more prominent for transient, overlay elements like menus and modals. Z-index values are sourced directly from the live site.

| Level | Treatment | Use | z-index |
| :--- | :--- | :--- | :--- |
| **z-0 (Flat)** | `border: 1px solid #ebebeb;` | Default state for inputs, secondary buttons. | `1` |
| **z-1 (Card)** | `box-shadow: 0 0 0 1px #ebebeb, 0 1px 2px rgba(0,0,0,0.05);` | Default card, static containers. | `1-2` |
| **z-2 (Hover)** | `box-shadow: 0 0 0 1px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.08);` | Hovered cards and interactive elements. | `2` |
| **z-3 (Header)** | `border-bottom: 1px solid rgba(0,0,0,0.1);` | Sticky navigation header. | `75` |
| **z-4 (Popover)** | `box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.05);` | Dropdown menus, tooltips. | `100` |
| **z-5 (Modal)** | `box-shadow: 0 8px 16px -4px rgba(0,0,0,0.05), 0 24px 32px -8px rgba(0,0,0,0.1);` | Modals and critical overlays. | `1000+` |

**Shadow Philosophy**: The philosophy is "border-first." Most static elements are defined by a 1px border (`#ebebeb`). True `box-shadow` is reserved for interactive states (like hover) or for elements that need to appear visually above the main content plane, such as popovers and modals. This keeps the default UI exceptionally clean and flat.

## 7. Do's and Don'ts

### Do
*   **Do** use `Geist Mono` for all headings and `Geist` for all body text.
*   **Do** use `#171717` for primary buttons and `#ffffff` with a 1px `#ebebeb` border for secondary buttons.
*   **Do** apply the `6px` border radius to all cards, inputs, and standard buttons.
*   **Do** use the 4px-based spacing scale, especially `24px` for internal padding and `32px` for gaps.
*   **Do** ensure body text is `#4d4d4d` on `#fafafa` or `#ffffff` backgrounds.
*   **Do** use the primary accent color `#0070f3` for focus rings and status indicators only.
*   **Do** use a `1px` border of `#ebebeb` as the primary method of separating elements.
*   **Do** use fully-rounded `9999px` radius exclusively for high-priority "pill" buttons.

### Don't
*   **Don't** mix `Geist` and `Geist Mono` within the same text block.
*   **Don't** use a border-radius other than `4px`, `6px`, or `9999px`.
*   **Don't** apply heavy box-shadows to static, non-interactive cards. Use the `elevation.card` spec.
*   **Don't** use colors other than `#171717`, `#ffffff`, or `#4d4d4d` for button text.
*   **Don't** use custom spacing values; adhere to the `[4, 8, 12, 16, 24, 32, 40, 48, 64]` scale.
*   **Don't** use text color `#8f8f8f` on a `#fafafa` background for normal-sized text; its 3.1 ratio fails AA contrast.
*   **Don't** create a new shade of gray; stick to the provided `#4d4d4d` and `#666666` tokens.
*   **Don't** use underline text decoration on links except on `:hover`.

## 8. Responsive Behavior
_Note: The breakpoints below are measured directly from the source CSS files._

- **Breakpoints**:
| Breakpoint Name | Width | Key Changes |
| :--- | :--- | :--- |
| **Mobile** | `< 600px` | Single-column layout. Main navigation collapses into a hamburger menu. Font sizes may decrease by ~2px. Padding is reduced to `16px`. |
| **Tablet** | `600px - 960px` | Two or three-column layouts become possible. Navigation may remain collapsed or expand. Card grids reflow. |
| **Desktop** | `> 960px` | Full multi-column layout. Max container width of `1200px` is applied. Full navigation is visible. |

- **Touch Targets**:
    - All interactive elements, including buttons and links, must have a minimum touch target size of `44px` by `44px`.
    - Ensure at least `8px` of space between adjacent touch targets to prevent accidental taps.

- **Collapsing Strategy**:
    - **Navigation**: The primary horizontal navigation bar collapses into a hamburger-triggered drawer menu on screens narrower than `960px`.
    - **Cards**: Card grids transition from 3-4 columns on desktop to 2 columns on tablet and a single stacked column on mobile.
    - **Typography**: Display (`48px`) and H1 (`32px`) font sizes are reduced on mobile to prevent awkward wrapping and maintain hierarchy.
    - **Padding**: Section padding is reduced from `64px` on desktop to `32px` on mobile. Component padding is reduced from `24px` to `16px`.

## 9. Agent Prompt Guide

- **Quick Color Reference**:
    - Primary Button BG: `#171717`
    - Primary Button Text: `#ffffff`
    - Secondary Button BG: `#ffffff`
    - Secondary Button Text: `#171717`
    - Main Background: `#ffffff`
    - Card/Surface Background: `#fafafa`
    - Headline Text: `#171717`
    - Body Text: `#4d4d4d`
    - Border Color: `#ebebeb`
    - Accent/Focus Color: `#0070f3`

- **Iteration Guide**:
    1.  **CTAs**: Always use the Primary Button (`#171717` background) for the main action on a page.
    2.  **Typography**: All headings use `Geist Mono` (400 weight). All body text uses `Geist` (400 weight).
    3.  **Sizing**: Default body font size is `14px`. Default heading (`H2`) is `24px`.
    4.  **Spacing**: Use the 4px scale: `[4, 8, 12, 16, 24, 32, 48, 64]`. Default card padding is `24px`.
    5.  **Radius**: Default border-radius for cards and inputs is `6px`. Use `9999px` only for pill buttons.
    6.  **Cards**: Cards must have a `1px` solid `#ebebeb` border and the `elevation.card` box-shadow.
    7.  **Inputs**: Inputs must have a `1px` solid `#ebebeb` border and use the `#0070f3` focus ring.
    8.  **Shadows**: Use `elevation.card` for static elements. Reserve stronger shadows for hover states or popovers.
    9.  **Contrast**: Body text (`#4d4d4d`) on the main background (`#ffffff`) passes AAA. Never use `#8f8f8f` for small text.
    10. **Mobile**: On viewports under `600px`, switch to a single-column layout and reduce padding to `16px`.