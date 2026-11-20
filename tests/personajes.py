import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        for name,vp in [('ipad',{'width':1080,'height':810}),('iphone',{'width':393,'height':852})]:
            ctx=await b.new_context(viewport=vp,has_touch=True);pg=await ctx.new_page()
            errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
            await pg.goto(''+__import__('h').ROOT+'');await pg.wait_for_timeout(300)
            await pg.screenshot(path=f'v60_{name}_home.png')
            await pg.click('#goChars');await pg.wait_for_timeout(400)
            await pg.screenshot(path=f'v60_{name}_empty.png')
            # tocar una cara
            c=await pg.evaluate("()=>{const r=document.querySelector('.chopt').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]}")
            await pg.touchscreen.tap(*c);await pg.wait_for_timeout(300)
            # arrastrar ropa, piernas, brazos, pelo, cosa
            for tab,idx in [('body',3),('legs',2),('arms',4),('hat',1),('acc',0)]:
                await pg.click(f'.chtab[data-t="{tab}"]');await pg.wait_for_timeout(150)
                s=await pg.evaluate(f"()=>{{const r=document.querySelectorAll('.chopt')[{idx}].getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]}}")
                t=await pg.evaluate("()=>{const r=document.querySelector('#chStage').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]}")
                cdp=await ctx.new_cdp_session(pg)
                async def touch(tp,x=None,y=None):
                    await cdp.send('Input.dispatchTouchEvent',{'type':tp,'touchPoints':[] if tp=='touchEnd' else [{'x':x,'y':y}]})
                await touch('touchStart',*s)
                for i in range(1,11): await touch('touchMove',s[0]+(t[0]-s[0])*i/10,s[1]+(t[1]-s[1])*i/10);await pg.wait_for_timeout(16)
                await touch('touchEnd');await pg.wait_for_timeout(250)
            print(name,'char',await pg.evaluate("()=>JSON.stringify(save.char)"))
            await pg.wait_for_timeout(600)
            await pg.screenshot(path=f'v60_{name}_built.png')
            await pg.click('#chSave');await pg.click('#chRand');await pg.wait_for_timeout(500)
            await pg.screenshot(path=f'v60_{name}_rand.png')
            await pg.click('#chGal');await pg.wait_for_timeout(300)
            print(name,'gallery',await pg.evaluate("()=>document.querySelectorAll('.chgl').length"))
            await pg.click('.chgl');await pg.wait_for_timeout(300)
            await pg.click('#chClear');await pg.click('#chClear');await pg.wait_for_timeout(200)
            print(name,'after clear',await pg.evaluate("()=>JSON.stringify(save.char)"),'errs',errs)
            await ctx.close()
        await b.close()
asyncio.run(main())
