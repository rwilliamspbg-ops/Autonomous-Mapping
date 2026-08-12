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

## 2026-08-15 - Synchronized Accessible Dynamic Descriptions for Maps and Interactive Charts
**Learning:** Screen reader and keyboard-only users navigating map projections or complex data charts often miss visual tooltips entirely. To prevent information asymmetry, dynamic properties (like capitals and calculated risk indices) shown visually on hover must be packed directly into each interactive node's accessible label (such as `aria-label`).
**Action:** When creating hover/focus-based tooltips, ensure that the corresponding interactive element's `aria-label` dynamically constructs and announces the same structured data (e.g., `<Name> (Capital: <Capital>). Risk Level: <Risk>.`).

## 2026-09-02 - High-Fidelity Tactical Map Zoom Controls and Keyboard-driven Navigation
**Learning:** Relying purely on scroll wheel, trackpad, or double click behaviors for map navigation causes severe interaction friction for keyboard-only and screen-reader users, as well as users with motor disabilities. Dedicated map-zoom HUD control panels with high-contrast, glowing cyberpunk-themed button designs and proper semantic markup satisfy visual delight while drastically improving navigation options.
**Action:** Always complement custom D3 SVG zoom/pan interactions with vertically stacked focus-visible zoom control buttons, complete with explicit 'aria-label', 'title', and active physical transformations.

## 2026-09-10 - Global Hotkey Integrations and Focusing Safeties
**Learning:** Adding global keydown keyboard shortcuts (like `+` / `-` / `r` for map zoom levels) provides high-speed efficiency for power-users, but must explicitly skip triggers when inputs, textareas, or contenteditables are focused. This prevents layout operations from conflicting with typing or texting tasks within adjacent chat interfaces or terminals.
**Action:** When implementing global window listeners for layout-altering keyboard shortcuts, always guard execution by checking `document.activeElement` for editable or input tag names.

## 2026-09-15 - Interactive System Status Displays & Keyboard Hotkey Transparency
**Learning:** Static system headers/indicators (like "LIVE_NODE_SYNC") are excellent candidates for micro-UX conversion. Changing them into interactive `<button>` overlays with clear focus indicators, `title` hotkey hints, and screen-reader friendly `aria-label` descriptions unlocks secret or deep UI layers (such as advanced logging terminals) instantly. This bridges visual satisfaction with keyboard-driven workflow efficiency.
**Action:** Always complement key panel toggles with dedicated global keys (e.g., 't', 'c', 'm', 's') paired with input-focus guards, and style headers as semantic, focus-visible interactive triggers where appropriate.

## 2026-09-18 - Explicit External Link Announce Contexts & Comprehensive Focus Outline Rings
**Learning:** Truncated list links (like Grounding Sources) lack screen reader and hover context when limited by fixed text boundaries. Informing assistive technology users explicitly about new tab/window transitions via `aria-label`s, indicating this visually via an external link glyph (e.g., `↗`), and setting the full text as the native `title` avoids information asymmetry. Additionally, secondary key CTA triggers in deep modals (such as the "Use This Demo" action inside the `Manifesto` window) can be missed by keyboard tab orders without custom high-contrast focus rings.
**Action:** Always supply explicit `aria-label`s detailing external target attributes, complement links with visible and screen-reader hidden directional glyphs, and verify that secondary interactive items implement high-contrast focus outline rings.

## 2026-10-01 - Dynamic Action Button Indicators and Semantic Loading States
**Learning:** Standard form submissions inside compact floating layouts (like `ChatInterface`) feel unresponsive when loading unless the trigger action itself provides direct visual and semantic cues. Integrating a miniature, high-fidelity spinner inside the send button and dynamically updating its `aria-label` (e.g., to "Sending message...") when `isLoading` is active ensures both visually tracking and screen reader users instantly receive clear, contextual state updates at the exact point of interaction.
**Action:** Always replace trigger buttons' content with animated loading indicators and update their accessibility labels dynamically during loading states.

## 2026-10-15 - Graceful Degradation & Actionable Error States for Hardware APIs
**Learning:** Silently failing and closing a complex visual simulation modal when hardware access is denied (like camera permission for ORB-SLAM3 or Geolocation) severely disrupts cognitive flow and leaves users disoriented. Gracefully transitioning to a dedicated themed error screen with actionable options (e.g., Retry and Dismiss) with proper ARIA attributes turns hardware failures into clear, supportive guidance.
**Action:** Always capture hardware/permission errors inside modals and render accessible error states with direct interactive retry/dismiss options matching the application design system.

## 2026-10-25 - Live-Region Crypto Statuses & Auto-Focused Error Recovery Actions
**Learning:** Multi-stage cryptographic proofs or ZK verification workflows are completely silent to screen readers without standard live-region announcements, leaving users guessing when and if verification finishes. Adding standard polite live regions for progress steps and final states ensures everyone tracks progress equally. Furthermore, when hardware failures trigger styled error overlays, auto-focusing the "Retry" action immediately makes recovery instantaneous and fluid for keyboard-only users.
**Action:** Add polite screen-reader status regions to multi-step proofing panels, and use React refs to dynamically auto-focus primary retry/recovery triggers when error boundaries or screens are entered.

## 2026-11-10 - Keyboard Scrollability and Focus Accessibility for Overflow Containers
**Learning:** Elements styled with standard `overflow-y-auto` are completely inaccessible to keyboard-only users because they cannot be focused by tab order, rendering them unscrollable without a mouse pointer. Adding `tabIndex={0}`, descriptive `aria-label`s, and custom `focus-visible:ring-2` styling ensures everyone can access, focus, and navigate long content blocks effortlessly using keyboard arrow keys.
**Action:** Always complement `overflow-y-auto` elements with a logical `tabIndex={0}`, focus rings, and proper descriptive `aria-label` annotations.

## 2026-12-05 - Character Limits & Dynamic Color-Shifting Accessible Counters on Floating Text Inputs
**Learning:** Long inputs in compact floating dialogs can disrupt layout bounds or overwhelm backend parsing if left unconstrained. Standard input constraint is most delightful when paired with a dynamic, color-shifting counter (green/slate to orange warning to red critical) aligned nicely within the input padding, and fully bound to assistive technologies using `aria-describedby` and `aria-live` elements to alert screen reader users of approaching constraints.
**Action:** Always supply inputs in small overlays with a `maxLength` property, a color-shifting inline indicator, and corresponding `aria-describedby` reference.

## 2027-01-10 - Copy-to-Clipboard Accessibility & Dynamic State Feedback for Cryptographic Proof Trails
**Learning:** Adding a custom copy-to-clipboard button for finalized hashes or public keys (like ZK proofs) delivers high interaction satisfaction and reduces human typing error. For maximum accessibility, pair the action button with standard keyboard `focus-visible` ring indicators, clear visual confirmation text ("Copied! ✓") that returns to default after a brief delay, explicit `aria-label` screen reader annotations, and reset copy success flags cleanly whenever the active view context changes to avoid lingering states.
**Action:** Always bind a 2-second timeout to reset copy-state feedback, supply comprehensive target `aria-label` and `title` tooltips, and reset state flags during country/view unmount or selection transitions.

## 2027-02-15 - Cyberpunk Holographic Loading and Semantic Initialisation Feedback for Async Device APIs
**Learning:** Initiating asynchronous hardware streams (like WebRTC camera streams) can result in a disorienting, static black screen while waiting for hardware permissions and wakeup. Replacing this empty transition state with a styled, themed loader that utilizes `role="status"` and `aria-live="polite"` prevents cognitive discontinuity and makes the application feel alive and responsive.
**Action:** Always provide dedicated, high-fidelity loading visual blocks with proper ARIA attributes for asynchronous hardware initialization workflows.

## 2027-02-20 - Multi-Stage Async Telemetry & Live-Region Screen Reader Accessibility
**Learning:** Multi-stage background operations (such as generating and finalizing ZK proofs or tracking geospatial states) leave assistive technology users in an informational vacuum unless every transition phase (including loading, committing, success, and error states) is backed by dedicated live regions (`role="status"`, `aria-live="polite"`, `aria-busy`). In addition, visual-only interactions like copying a proof hash to the clipboard must be mirrored as textual state announcements within active status containers.
**Action:** Always map interactive stage transitions to dynamic aria-live regions, ensure buttons have descriptive, clean screen-reader targets, and feed temporary transaction feedback directly into screen-reader announcements.

## 2027-02-21 - Copy-to-Clipboard for Summaries and Avoiding Text Match Ambiguity in Tests
**Learning:** Multiple text-based "Copy" or "Copied! ✓" buttons inside the same dashboard panel can trigger ambiguity or matching collisions when writing testing-library unit tests. To avoid text-match errors, use specific `aria-label` or class/attribute properties when querying elements, and assert on target button node text-contents directly.
**Action:** When adding multiple copy-to-clipboard buttons, always query by unique target labels (e.g., `screen.getByLabelText('<unique_label_for_button>')`) and assert on its individual text content rather than query globally.

## 2027-02-22 - Copy-to-Clipboard for Chat Messages and Inline Accessible Interaction Feedback
**Learning:** Adding a copy-to-clipboard action directly on chat message elements delivers excellent utility but can be easily missed if not keyboard-accessible. Making the copy button focusable (`focus-visible:ring-2`), hover-revealed with opacity transitions, and backed by a screen-reader-only polite live-region (`role="status" aria-live="polite"`) guarantees that both sighted and assistive technology users get immediate feedback.
**Action:** Pair hover-revealed copy buttons in message groups with clear focus-visible outline indicators, explicit role/aria-label properties, and a shared status live-region to announce success.
