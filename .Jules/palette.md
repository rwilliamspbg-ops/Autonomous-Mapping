# Palette's Journal

## 2025-02-18 - Keyboard Navigation and ARIA completeness in ChatInterface
**Learning:** Overlays and floating widgets (like `ChatInterface`) need `Escape` keyboard shortcuts and comprehensive ARIA labels to be truly accessible to screen reader and keyboard-only users.
**Action:** Always implement `Escape` key listeners to close interactive floating interfaces, and use `<label className="sr-only">` for inputs and explicit `aria-label`s on icon-only action buttons.

## 2025-07-15 - Overlay Resilience and Complete Interactive Keyboard and Touch Support
**Learning:** Adding Escape listeners, backdrop-dismissal events, and explicit `aria-label`s to full-screen overlays makes the spatial simulation interface feel highly responsive and professional. Furthermore, always ensure that fallback configurations or missing API keys (like Gemini) return fully structured data matching type requirements to prevent rendering component crashes inside dashboard views.
**Action:** Provide robust default data schemas with all visualization fields (e.g., arrays and sub-objects) on service fallbacks, and bind click-outside listeners alongside Escape key hooks for overlays.

## 2025-10-24 - D3 SVG Keyboard Accessibility and Semantic Interactivity
**Learning:** Interactive D3 SVG map paths are completely invisible to keyboard-only and screen reader users unless tabindex="0", role="button", and accessible labels are explicitly injected. They can be made accessible by attaching 'focus', 'blur', and 'keydown' (Enter/Space) event listeners directly during the D3 selection lifecycle.
**Action:** Always map hover and click events to focus and keydown handlers in SVG/D3 charts to support keyboard navigation, and apply a focus highlight state using fill and stroke.
