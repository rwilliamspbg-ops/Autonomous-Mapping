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

## 2026-03-30 - Interactive Live Status Indicators and Multi-state Toggle Feedback
**Learning:** Dynamic layout controls (like lane switches) must provide explicit semantic state feedback using `aria-pressed` attributes so assistive technologies can instantly perceive toggled state. Additionally, real-time spatial loaders or panel refreshes should implement `role="status"`, `aria-live="polite"`, and `aria-busy="true"` to ensure screen readers announce loading phases without disrupting context flow.
**Action:** Always complement active visual styles with `aria-pressed` or `aria-selected` attributes and use live region status boundaries for asynchronous fetching states.

## 2026-06-15 - Access-by-default Data Legends and Active Processing State Feedback
**Learning:** Interactive charts (like recharts or D3 circles) that only show detailed metrics (such as severity percentages) on hover or active cursor interaction are completely inaccessible to screen reader and keyboard-only users. Replicating essential metrics directly within flat text legends satisfies the double-A accessibility requirement while keeping cognitive load low. Additionally, multi-stage status checkers are more intuitive when active/processing items pulse dynamically to indicate a working background task.
**Action:** Always complement graphical data representations with clear textual metrics in their static legends, and use a contrasting pulsing state with screen-reader friendly status text for active steps in sequential workflows.

## 2026-07-20 - Accessible Focus Management (Auto-focus & Focus Restoration) across Overlays
**Learning:** For overlay components (modals, drawers, sliding panels), keyboard and screen-reader accessibility requires moving focus to the newly opened panel (either onto an input, main body, or close button) upon mount, and cleanly restoring focus back to the triggering element when closed. This keeps keyboard navigation context intact and prevents focus loss.
**Action:** Implement `lastActiveElementRef` and `closeButtonRef` / `inputRef` patterns using `useEffect` to manage focus transitions whenever a modal opens and closes.
