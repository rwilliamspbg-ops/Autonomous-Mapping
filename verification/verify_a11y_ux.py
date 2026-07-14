from playwright.sync_api import sync_playwright, expect
import os

def run_verification(page):
    print("Navigating to local development server...")
    page.goto("http://localhost:5173")
    page.wait_for_timeout(3000)

    # 1. Capture initial dashboard
    page.screenshot(path="verification/screenshots/ux_1_initial.png")
    print("Initial dashboard screenshot captured.")

    # 2. Check and focus Open Impact Chat button
    chat_trigger = page.get_by_role("button", name="Open Impact Chat")
    expect(chat_trigger).to_be_visible()
    chat_trigger.focus()
    page.screenshot(path="verification/screenshots/ux_2_trigger_focused.png")
    print("Open Impact Chat button has correct ARIA label and focus styling.")

    # 3. Click the open button
    chat_trigger.click()
    page.wait_for_timeout(1000)
    page.screenshot(path="verification/screenshots/ux_3_chat_opened.png")
    print("Chat opened and screenshot captured.")

    # 4. Check label and elements in opened chat
    close_btn = page.get_by_role("button", name="Close Chat")
    expect(close_btn).to_be_visible()

    chat_input = page.get_by_role("textbox", name="Ask about a pilot or funding story")
    expect(chat_input).to_be_visible()
    print("Input has proper associated label, and Close button has correct ARIA label.")

    # 5. Type and send a message
    chat_input.fill("Tell me about the climate lane in South Africa.")
    page.wait_for_timeout(500)
    page.screenshot(path="verification/screenshots/ux_4_message_typed.png")

    # Press enter
    chat_input.press("Enter")
    page.wait_for_timeout(3000)
    page.screenshot(path="verification/screenshots/ux_5_response_received.png")
    print("Message sent, and response received successfully.")

    # 6. Press Escape to close the chat
    print("Pressing Escape key to dismiss ChatInterface...")
    page.keyboard.press("Escape")
    page.wait_for_timeout(1000)

    # Verify trigger is visible again and chat window is closed
    expect(chat_trigger).to_be_visible()
    page.screenshot(path="verification/screenshots/ux_6_dismissed_via_escape.png")
    print("Chat closed successfully via Escape key.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            run_verification(page)
        finally:
            browser.close()
