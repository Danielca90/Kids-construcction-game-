"""Regressions for the first construction and the mobile free-build toolbar."""
import asyncio
from playwright.async_api import async_playwright
from h import start


async def main():
    async with async_playwright() as playwright:
        browser, _, page, errors = await start(playwright, 'iphone')
        await page.tap('#diffs .diff[data-n="1"]')
        await page.evaluate('''() => {
          const observer = new MutationObserver(records => {
            for(const record of records) {
              for(const node of record.addedNodes) {
                if(node.classList?.contains('guideHand')) window.demoRuns++;
              }
            }
          });
          window.demoRuns = 0;
          observer.observe(document.body, {childList: true});
        }''')
        await page.locator('#levels .card').first.tap()
        await page.wait_for_function('window.demoRuns === 1')
        await page.tap('#gameTarget')
        assert await page.locator('#tray .guidedLook').count() == 1
        await page.locator('#tray .tile:not(.next):not(.used)').first.tap()
        assert await page.evaluate('[st.placed, st.score, busy]') == [0, 0, False]
        await page.locator('#tray .next').press('Enter')
        await page.wait_for_function('st.placed === 1')
        for placed in (2, 3):
            await page.tap('#gameHint')
            await page.locator('#tray .next').first.tap()
            await page.wait_for_function('st.placed === '+str(placed))
        await page.locator('#win').wait_for()
        assert await page.locator('#winModel .pc').count() == 3
        assert await page.locator('#winTransfer').is_visible()
        await page.tap('#next')
        assert await page.locator('#tray .next').count() == 0
        assert await page.evaluate('window.demoRuns') == 1
        await page.tap('#gameHint')
        assert await page.locator('#tray .next').count() == 1

        await page.tap('#homeBtn')
        await page.tap('#back')
        await page.tap('#goFree')
        assert await page.locator('#eColors .sw:visible').count() == 6
        assert await page.locator('#eShapes .tile:visible').count() == 4
        assert await page.locator('#eUndo').is_disabled()
        await page.tap('#ePalette')
        assert await page.locator('#eShapes .tile:visible').count() == 29
        await page.tap('#ePalette')
        board = await page.locator('#eBoard').bounding_box()
        await page.touchscreen.tap(board['x']+board['width']/2, board['y']+board['height']-12)
        original = await page.evaluate('save.free')
        assert len(original) == 1
        await page.tap('#eBack')
        await page.tap('#goFree')
        assert await page.locator('#eUndo').is_enabled()
        await page.tap('#eClear')
        assert await page.locator('#eClearCount').inner_text() == '🧱 1 ficha'
        await page.press('#eClearNo', 'Escape')
        assert await page.evaluate('save.free') == original
        await page.tap('#eClear')
        await page.tap('#eClearYes')
        assert await page.evaluate('save.free') == []
        await page.reload()
        await page.tap('#goFree')
        await page.locator('#eUndo').press('Space')
        assert await page.evaluate('save.free') == original
        assert not errors, errors
        await browser.close()
        print('SUMMARY first build, transfer, palette and persistent undo passed')


if __name__ == '__main__':
    asyncio.run(main())
