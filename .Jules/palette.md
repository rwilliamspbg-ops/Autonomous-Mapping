# Palette's Journal

## 2025-02-18 - Keyboard Navigation and ARIA completeness in ChatInterface
**Learning:** Overlays and floating widgets (like `ChatInterface`) need `Escape` keyboard shortcuts and comprehensive ARIA labels to be truly accessible to screen reader and keyboard-only users.
**Action:** Always implement `Escape` key listeners to close interactive floating interfaces, and use `<label className="sr-only">` for inputs and explicit `aria-label`s on icon-only action buttons.

## 2025-07-15 - Overlay Resilience and Complete Interactive Keyboard and Touch Support
**Learning:** Adding Escape listeners, backdrop-dismissal events, and explicit `aria-label`s to full-screen overlays makes the spatial simulation interface feel highly responsive and professional. Furthermore, always ensure that fallback configurations or missing API keys (like Gemini) return fully structured data matching type requirements to prevent rendering component crashes inside dashboard views.
**Action:** Provide robust default data schemas with all visualization fields (e.g., arrays and sub-objects) on service fallbacks, and bind click-outside listeners alongside Escape key hooks for overlays.
