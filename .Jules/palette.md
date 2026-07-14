# Palette's Journal

## 2025-02-18 - Keyboard Navigation and ARIA completeness in ChatInterface
**Learning:** Overlays and floating widgets (like `ChatInterface`) need `Escape` keyboard shortcuts and comprehensive ARIA labels to be truly accessible to screen reader and keyboard-only users.
**Action:** Always implement `Escape` key listeners to close interactive floating interfaces, and use `<label className="sr-only">` for inputs and explicit `aria-label`s on icon-only action buttons.
