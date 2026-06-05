# AVEMS Design Governance Standard v1.0

This document defines the visual standards, experience hierarchy, layout paradigms, and screen acceptance rules for the **Ajanta Venue & Event Management System (AVEMS)**. 

All future UI development, component modifications, and implementation plans must comply with these guidelines.

---

## 1. Visual Identity Rule

AVEMS is designed and built specifically as a **Premium Corporate Event Planning & Decision-Support Platform**. It must feel like a modern, consumer-grade travel/event tool tailored for corporate operations.

*   **AVEMS IS:** A premium, intuitive space to explore, compare, and select venues, coordinate timelines, and organize corporate meetings.
*   **AVEMS IS NOT:**
    *   A generic SAP/Oracle ERP system.
    *   A dense government portal or compliance registry.
    *   A developer administration dashboard.
    *   A generic, unstyled bootstrap/developer admin template.

Every feature, page, or modal must be evaluated against this core principle.

---

## 2. Typography Standard (Global)

### Approved Font Stack
Only the following font stack is permitted across the entire application:
```css
font-family: "Nunito Sans", "Segoe UI", sans-serif;
```
*   **Prohibited Fonts:** `Inter`, `Manrope`, `Poppins`, `Roboto` (unless explicitly approved in writing).

### Typography Scale
Ensure all font rendering uses the defined tokens. Hardcoded pixel font-sizes are strictly prohibited:

| Token / Role | Target Size | Font Weight | Usage |
| :--- | :--- | :--- | :--- |
| **Page Title** | `32px` | `700` (Bold) | Root page headers |
| **Section Title** | `22px` | `700` (Bold) | Large section/card headers |
| **Card Title** | `18px` | `700` (Bold) | Subsections, inner card headers |
| **Body Text** | `15px` | `400` (Regular) | Primary copy, descriptive paragraphs |
| **Labels** | `14px` | `600` (Semi-Bold) | Input form labels, table headers |
| **Meta Text** | `13px` | `400` (Regular) | Captions, hints, breadcrumbs, logs |

---

## 3. Experience Standard

Avoid treating pages as static repositories of records. Optimize elements to influence the user's emotional experience:

*   **The User SHOULD feel:** Planning, Exploring, Comparing, and Selecting.
*   **The User should NOT feel:** Submitting data, Registering, entering raw database rows, or filling tedious forms.

---

## 4. Form Design Standard

*   **Avoid:**
    *   Monolithic, long vertical scrolling forms.
    *   High-density, stacked input fields with no separation.
    *   Dense database/spreadsheet style layouts.
*   **Preferred Layout Paradigms:**
    *   Section-based Cards grouping related configurations.
    *   Visual Selectors (clickable illustration cards, tiles).
    *   Search-first comboboxes.
    *   Self-cleaning option selection chips.
    *   Dynamic, interactive stepper units for numeric values.

---

## 5. Input Hierarchy Standard

When building forms or page filters, select inputs using this strict hierarchy:

1.  **Best (Visual Cards / Selection Tiles):**
    *   Use when there are $\le 6$ distinct choices.
    *   *Examples:* Meeting Types (Cycle Meeting, Launch, Training), Accommodation Flag (Residential vs Day Event).
2.  **Good (Searchable Combobox):**
    *   Use for dynamic, medium-to-large arrays.
    *   *Examples:* Target Cities, Hotels, Venues, Divisions.
3.  **Acceptable (Standard Dropdowns):**
    *   Use only when choices are static, predictable, and exceed 20+ elements.
4.  **Strictly Prohibited:**
    *   Browser-native `<select>` boxes.

---

## 6. Layout Standard (Main vs. Live Context)

All business workflows (such as creating meeting requests, reviewing bids, or managing hotels) must implement a dual-panel layout on desktop screens:

```text
┌───────────────────────────────────────────┬─────────────────────────────────────┐
│                                           │                                     │
│  Main Workflow Panel (70% Width)          │  Live Context Panel (30% Width)     │
│  - Multi-section cards                    │  - Sticky sidebar container         │
│  - Forms, Steppers, & Search controls    │  - Real-time Draft Summary          │
│  - Inline validation feedback             │  - Dynamic Venue Suggestions        │
│                                           │  - Actions, Status, and Insights    │
└───────────────────────────────────────────┴─────────────────────────────────────┘
```

---

## 7. Color & Branding Standard

*   **Allowed Visual Language:** Soft, professional corporate tones. High-end subtle gradients, pastel backgrounds for highlight states, soft borders, and thin outlines.
*   **Prohibited Visual Directions:**
    *   Neon/Cyberpunk styling.
    *   Dark/Hacker mode themes.
    *   Hyperactive startup gradients splashed on every button.
    *   Heavy gaming-style shadow effects.

---

## 8. White Space Standard

*   **Padding:** All container panels and specification cards must have a minimum of `24px` padding on all sides.
*   **Spacing:** Group sections with generous margins. Never pack fields tightly or compress margins to fit more fields above the fold. 
*   **Radii:** Standardized card border radius is `16px`. Standardized control border radius is `8px` to `12px`.

---

## 9. Dashboard Standard

Dashboards are visual portals to decision-making, not databases:
*   **Dashboards must answer:**
    1.  *What requires my attention?* (e.g. pending approvals, incomplete bids).
    2.  *What action should I take next?* (e.g. upload quotation).
    3.  *What decisions are currently bottlenecked?*
*   **Dashboards must NOT focus on:** Static, raw record counters (e.g., "Total Records: 410") or generic, meaningless KPI grids.

---

## 10. Screen Acceptance Test (Evaluation Checklist)

Before approving any UI design or staging view for production, evaluate it against these three questions:

1.  **Comfort Test:** Would this interface look comfortable and premium on Ajanta's modern corporate intranet?
    *   *YES:* Pass
    *   *NO:* Redesign
2.  **ERP Test:** Does this look like an ERP or a government form?
    *   *YES:* Fail
    *   *NO:* Pass
3.  **Utility Test:** Does this feel like an active planning and decision-support tool?
    *   *YES:* Pass
    *   *NO:* Redesign
