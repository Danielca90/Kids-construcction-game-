import asyncio,sys,json
from h import *
async def nexttile(page,wrong=False):
    return await page.evaluate('''(w)=>{const k=key(fig().steps[st.placed]);const t=[...document.querySelectorAll('#tray .tile')].find(t=>(w?t.dataset.k!==k:t.dataset.k===k)&&!t.classList.contains('used'));if(!t)return null;const b=t.getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]}''',wrong)
async def finish(page,leave=0):
    while True:
        s=await page.evaluate('[st.placed,fig().steps.length,busy]')
        if s[0]>=s[1]-leave:break
        if s[2]: await page.wait_for_timeout(30);continue
        await page.touchscreen.tap(*(await nexttile(page)));await page.wait_for_timeout(60)
async def main():
  async with async_playwright() as p:
    for vp in ['ipad','iphone']:
        print('=====',vp)
        # R1: ghost click after #home2
        b,ctx,page,errs=await start(p,vp,rate=25)
        await page.evaluate("document.addEventListener('click',e=>{(window._cl=window._cl||[]).push(e.target.id||e.target.className)},true)")
        await page.evaluate('openFig(4)');await page.wait_for_timeout(200)   # torre (lvl1)
        await finish(page);await page.wait_for_function("$('#win').classList.contains('show')",timeout=8000)
        await page.evaluate('window._cl=[]')
        await page.tap('#home2');await page.wait_for_timeout(500)
        print('R1 after home2 tap: screen=',await page.evaluate('screen'),'fig',await page.evaluate('fig().id'),'clicks',await page.evaluate('_cl'))
        await b.close()
        # R2: tap last piece then home immediately -> win overlay over menu?
        b,ctx,page,errs=await start(p,vp)
        await page.evaluate('openFig(4)');await page.wait_for_timeout(200)
        await finish(page,leave=1);await page.wait_for_timeout(900)
        await page.touchscreen.tap(*(await nexttile(page)));await page.wait_for_timeout(100)
        await page.tap('#homeBtn');await page.wait_for_timeout(4500)
        print('R2 screen',await page.evaluate('screen'),'win overlay shown over it:',await page.evaluate("$('#win').classList.contains('show')"),'busy',await page.evaluate('busy'),'coins',await page.evaluate('save.coins'),errs)
        await page.screenshot(path=f'r2_{vp}.png')
        await b.close()
        # R3: stale lockout timer -> double placement
        b,ctx,page,errs=await start(p,vp)
        await page.evaluate('openFig(16)');await page.wait_for_timeout(200)  # casita 12
        await page.touchscreen.tap(*(await nexttile(page)));await page.wait_for_timeout(900)
        await page.touchscreen.tap(*(await nexttile(page,True)));await page.wait_for_timeout(100)   # wrong -> 1.5 s lock
        t0=await page.evaluate('performance.now()')
        await page.tap('#homeBtn');await page.wait_for_timeout(250)
        await page.evaluate('openFig(16)');await page.wait_for_timeout(250)
        print('R3 back in game; tray still shows wait class:',await page.evaluate("tray.classList.contains('wait')"),'busy',await page.evaluate('busy'))
        # wait until ~1.3s after wrong tap then tap right piece, and tap again 350ms later (after stale timer fired, mid-flight)
        el=await page.evaluate('performance.now()')-t0
        await page.wait_for_timeout(max(0,1250-el))
        pl0=await page.evaluate('st.placed');c=await nexttile(page)
        await page.touchscreen.tap(*c);await page.wait_for_timeout(330)
        print('   mid-flight busy=',await page.evaluate('busy'),'(should be true)')
        await page.touchscreen.tap(*c);await page.wait_for_timeout(1500)
        print('R3 placed before',pl0,'after 2 taps on same tile during one flight:',await page.evaluate('st.placed'),errs)
        await b.close()
        # R4: stale prog referencing key not in model -> crash?
        b,ctx,page,errs=await start(p,vp)
        await page.evaluate('''()=>{const F=FIGS[16];save.prog[F.id]={v:5,fig:F.id,placed:2,extra:[],opened:0,order:['b9z','b2y'],miniEnd:5,score:20,streak:2};save.last=F.id;persist()}''')
        await page.reload();await page.wait_for_timeout(300)
        vis=await page.evaluate("!$('#cont').classList.contains('hidden')")
        if vis: await page.tap('#cont')
        await page.wait_for_timeout(400)
        print('R4 stale-key prog: cont visible',vis,'screen',await page.evaluate('screen'),'tray tiles',await page.evaluate("document.querySelectorAll('#tray .tile').length"),'with piece',await page.evaluate("document.querySelectorAll('#tray .tile .pc').length"),'errors',errs[:2])
        await b.close()
        # R4b: prog saved with more pieces than a shrunken model / bag index mismatch
        b,ctx,page,errs=await start(p,vp)
        await page.evaluate('''()=>{const F=FIGS[30];save.prog[F.id]={v:5,fig:F.id,placed:20,extra:[],opened:9,order:[key(F.steps[0])],miniEnd:22,score:0,streak:0};save.last=F.id;persist()}''')
        await page.reload();await page.wait_for_timeout(300);await page.tap('#cont');await page.wait_for_timeout(400)
        nt=await nexttile(page)
        print('R4b prog whose order lacks the needed key: next tile available:',nt is not None,'placed',await page.evaluate('st.placed'),'order',await page.evaluate('st.order'),errs[:2])
        await b.close()
if __name__=="__main__":asyncio.run(main())
