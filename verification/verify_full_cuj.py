from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    print("Navigating to dashboard...")
    page.goto("http://localhost:4173")
    page.wait_for_timeout(3000)
    page.screenshot(path="verification/screenshots/1_dashboard.png")

    print("Opening Chat Interface...")
    # Find the floating blue button at bottom right (last button usually)
    page.locator('button').last.click()
    page.wait_for_timeout(1000)
    page.screenshot(path="verification/screenshots/2_chat_open.png")

    print("Testing mobile responsiveness...")
    page.set_viewport_size({"width": 390, "height": 844})
    page.wait_for_timeout(1500)
    page.screenshot(path="verification/screenshots/3_mobile_view.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(record_video_dir="verification/videos")
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
