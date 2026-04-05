# Design System Specification: The Architectural Flow

## 1. Overview & Creative North Star
This design system is built upon the Creative North Star of **"The Precise Architect."** In high-productivity SaaS environments, users don't need more "features"; they need more cognitive space. This system moves away from the claustrophobic, border-heavy layouts of traditional enterprise software. Instead, it embraces an editorial, high-end feel characterized by intentional white space, tonal layering, and sophisticated typography.

We break the "template" look by treating the interface as a digital canvas where depth is communicated through light and material rather than lines. By leveraging the contrast between the technical precision of Inter and the expressive authority of Manrope, we create an environment that feels both human and impeccably organized.

---

## 2. Colors & Surface Philosophy
The palette is a sophisticated range of deep indigos and cool grays, designed to reduce eye strain during long working sessions while maintaining a high-authority brand presence.

### The "No-Line" Rule
**Explicit Instruction:** 1px solid borders are strictly prohibited for sectioning. We do not use "boxes" to contain content. Instead, boundaries are defined through:
- **Background Shifts:** Placing a `surface-container-low` component against a `surface` background.
- **Tonal Transitions:** Using the hierarchy of the `surface-container` tiers to guide the eye.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Hierarchy is achieved through "Tonal Stacking":
1.  **Level 0 (Base):** `surface` (#faf8ff) - The canvas.
2.  **Level 1 (Navigation/Sidebars):** `surface-container-low` (#f2f3ff) - Subtle recession.
3.  **Level 2 (Main Workspace):** `surface-container-lowest` (#ffffff) - The highest point of focus for task lists.
4.  **Level 3 (Interactive Elements):** `surface-container-high` (#e2e7ff) - For active states or temporary panels.

### The "Glass & Gradient" Rule
To add a "soul" to the professional rigour, use **Glassmorphism** for floating elements (Modals, Popovers). Apply `surface_container_low` with 80% opacity and a `20px` backdrop-blur. 
**Signature Textures:** For primary CTAs and high-level dashboard summaries, use a linear gradient from `primary` (#3525cd) to `primary_container` (#4f46e5) at a 135-degree angle to provide depth.

---

## 3. Typography: The Editorial Edge
We utilize a dual-font strategy to balance character with utility.

*   **Display & Headlines (Manrope):** This is our "Editorial" voice. Use `display-lg` and `headline-md` with tight letter-spacing (-0.02em) to create a sense of authoritative calm.
*   **Utility & UI (Inter):** All `title`, `body`, and `label` roles use Inter. It is chosen for its exceptional legibility in dense data environments.
*   **Hierarchy Tip:** Use `on_surface_variant` (#464555) for secondary body text to create a clear visual distinction from primary headers in `on_surface` (#131b2e).

---

## 4. Elevation & Depth
Depth is a functional tool, not a stylistic flourish.

### The Layering Principle
Forget shadows for static components. A `surface-container-lowest` card sitting on a `surface-container-low` background provides enough "lift" for the user to understand the object's boundaries without visual clutter.

### Ambient Shadows
For floating Modals or Dropdowns, use "Atmospheric Shadows":
*   **Shadow Color:** Hex `#131b2e` at 6% opacity.
*   **Blur:** `32px` to `64px`.
*   **Spread:** `-4px`.
This mimics a natural light source, making the UI feel light and airy.

### The "Ghost Border" Fallback
If a border is required for accessibility (e.g., input fields), use the **Ghost Border**:
*   **Token:** `outline-variant` (#c7c4d8) at **20% opacity**.
*   **Rule:** Never use 100% opaque borders.

---

## 5. Components

### Buttons
*   **Primary:** Linear gradient (`primary` to `primary_container`). Border radius `md` (0.375rem). No shadow.
*   **Secondary:** `surface-container-high` background with `on_primary_fixed_variant` text.
*   **Tertiary:** Ghost style. No background, `primary` text. Use for low-priority actions like "Cancel."

### Cards & Lists
*   **Rule:** Zero dividers. Separate list items using `8px` of vertical white space or a subtle hover state shift to `surface-container-lowest`.
*   **Task Cards:** Use `surface-container-lowest` with a 4px left-accent bar using the "Board Accent" colors for categorization.

### Input Fields
*   **Resting:** `surface-container-low` background, no border.
*   **Focus:** `surface-container-lowest` background with a 1px "Ghost Border" using `primary`.
*   **Typography:** Use `body-md` for input text and `label-sm` for caps-lock helper text.

### High-Productivity Additions
*   **The Command Palette:** A semi-transparent modal (`surface` at 90% + blur) that sits in the top-center, using `headline-sm` for the input to signify its power.
*   **Status Indicators:** Use `tertiary` (#00505f) for "In Progress" to move away from the "generic blue" and provide a distinct visual anchor.

---

## 6. Do’s and Don'ts

### Do
*   **Do** use asymmetrical margins (e.g., wider left padding in headers) to create an editorial feel.
*   **Do** use `surface-tint` (#4d44e3) at 5% opacity for large background areas to keep the "clean blue" vibe alive without it becoming overwhelming.
*   **Do** prioritize `label-md` for metadata (dates, tags) to keep the UI clean.

### Don’t
*   **Don't** use pure black (#000000) for text. Always use `on_surface` (#131b2e).
*   **Don't** use "Drop Shadows" on cards. Use tonal layering (`surface` levels) instead.
*   **Don't** use standard 1px gray dividers. If you need a separator, use a `12px` gap or a background color change.
*   **Don't** use high-saturation colors for status indicators; stick to the `tertiary` and `error` containers to maintain the "Professional/Trustworthy" vibe.