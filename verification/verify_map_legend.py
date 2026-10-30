from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    page.goto("http://localhost:5173")
    page.wait_for_timeout(1000)

    # Click Expand Map Legend / Copy Symbology button
    copy_btn = page.get_by_role("button", name="Copy Map Symbology legend to clipboard")
    if copy_btn.is_visible():
        copy_btn.click()
        page.wait_for_timeout(1000)

    page.screenshot(path="/home/jules/verification/screenshots/map_legend_copy.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
