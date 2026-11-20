import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        for name,vp in [('ipad',{'width':1080,'height':810}),('iphone',{'width':393,'height':852})]:
            ctx=await b.new_context(viewport=vp,has_touch=True);pg=await ctx.new_page()
            errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
            await pg.goto(__import__('h').ROOT);await pg.wait_for_timeout(300)
            await pg.click('#goChars');await pg.wait_for_timeout(300)
            await pg.screenshot(path=f'/tmp/v61_{name}_empty.png')
            for tab,idx in [('head',4),('face',0),('hat',5),('body',4),('ropa',5),('arms',3),('legs',5),('acc',0)]:
                await pg.click(f'.chtab[data-t="{tab}"]');await pg.wait_for_timeout(120)
                await pg.click(f'.chopt >> nth={idx}');await pg.wait_for_timeout(120)
            await pg.wait_for_timeout(1700)
            await pg.screenshot(path=f'/tmp/v61_{name}_built.png')
            cdp=await ctx.new_cdp_session(pg)
            async def drag(x0,y0,x1,y1):
                await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x0,'y':y0}]})
                for i in range(1,13): await cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x0+(x1-x0)*i/12,'y':y0+(y1-y0)*i/12}]});await pg.wait_for_timeout(16)
                await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});await pg.wait_for_timeout(120)
            # girar brazo derecho (antebrazo)
            box=await pg.evaluate("()=>{const g=document.querySelector('.limb[data-j=\"ar\"][data-seg=\"1\"]');const r=g.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]}")
            await drag(box[0],box[1],box[0]+80,box[1]-60)
            box=await pg.evaluate("()=>{const g=document.querySelector('.limb[data-j=\"ll\"][data-seg=\"0\"]');const r=g.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height*.4]}")
            await drag(box[0],box[1],box[0]-70,box[1]-20)
            print(name,'pose after drags',await pg.evaluate("()=>JSON.stringify(save.char.pose)"))
            await pg.screenshot(path=f'/tmp/v61_{name}_posed.png')
            # jalar el cordón
            ring=await pg.evaluate("()=>{const r=document.querySelector('.ringhit').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]}")
            await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':ring[0],'y':ring[1]}]})
            for i in range(1,10): await cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':ring[0],'y':ring[1]+i*8}]});await pg.wait_for_timeout(16)
            await pg.screenshot(path=f'/tmp/v61_{name}_pulled.png')
            print(name,'pulled',await pg.evaluate("()=>[save.char.pull|0, save.char.pose.al[0]|0]"))
            await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});await pg.wait_for_timeout(1500)
            print(name,'after spring',await pg.evaluate("()=>[save.char.pull|0, save.char.pose.al[0]|0]"))
            await pg.click('#chDance');await pg.wait_for_timeout(700);await pg.screenshot(path=f'/tmp/v61_{name}_dance.png')
            await pg.click('#chRand');await pg.wait_for_timeout(800);await pg.screenshot(path=f'/tmp/v61_{name}_rand.png')
            print(name,'errs',errs);await ctx.close()
        await b.close()
asyncio.run(main())
