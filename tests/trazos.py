import asyncio,math
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        for name,vp in [('ipad',{'width':1080,'height':810}),('iphone',{'width':393,'height':852})]:
            ctx=await b.new_context(viewport=vp,has_touch=True);pg=await ctx.new_page()
            errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
            await pg.goto(__import__('h').ROOT);await pg.wait_for_timeout(300)
            await pg.click('#goTrace');await pg.wait_for_timeout(500)
            cdp=await ctx.new_cdp_session(pg)
            async def guide_pts():
                return await pg.evaluate("()=>{const r=document.querySelector('#trInk').getBoundingClientRect(),c=document.querySelector('#trInk'),d=c.width/r.width,m=trMap();return trGuide().filter((_,i)=>i%4==0).map(p=>[r.left+(m.ox+p[0]*m.s)/d,r.top+(m.oy+p[1]*m.s)/d])}")
            async def pen(pts,force):
                await cdp.send('Input.dispatchMouseEvent',{'type':'mousePressed','x':pts[0][0],'y':pts[0][1],'button':'left','clickCount':1,'pointerType':'pen','force':force})
                for q in pts[1:]:
                    await cdp.send('Input.dispatchMouseEvent',{'type':'mouseMoved','x':q[0],'y':q[1],'button':'left','buttons':1,'pointerType':'pen','force':force});await pg.wait_for_timeout(8)
                await cdp.send('Input.dispatchMouseEvent',{'type':'mouseReleased','x':pts[-1][0],'y':pts[-1][1],'button':'left','clickCount':1,'pointerType':'pen','force':force})
            pts=await guide_pts()
            # trazo suave con lápiz
            await pen(pts,0.35);await pg.wait_for_timeout(1300)
            print(name,'after soft pen: rep',await pg.evaluate("()=>[tr.rep,tr.pen,!document.querySelector('#trMeter').classList.contains('hidden')]"))
            # trazo fuerte con lápiz (debe avisar)
            pts=await guide_pts()
            await cdp.send('Input.dispatchMouseEvent',{'type':'mousePressed','x':pts[0][0],'y':pts[0][1],'button':'left','clickCount':1,'pointerType':'pen','force':.95})
            for q in pts[1:len(pts)//2]:
                await cdp.send('Input.dispatchMouseEvent',{'type':'mouseMoved','x':q[0],'y':q[1],'button':'left','buttons':1,'pointerType':'pen','force':.95});await pg.wait_for_timeout(20)
            await pg.screenshot(path=f'/tmp/v70_{name}_strong.png')
            print(name,'strong: warn shown',await pg.evaluate("()=>[document.querySelector('#trWarn').classList.contains('show'),document.querySelector('#trMeter').classList.contains('strong'),tr.strong>0]"))
            for q in pts[len(pts)//2:]:
                await cdp.send('Input.dispatchMouseEvent',{'type':'mouseMoved','x':q[0],'y':q[1],'button':'left','buttons':1,'pointerType':'pen','force':.95});await pg.wait_for_timeout(5)
            await cdp.send('Input.dispatchMouseEvent',{'type':'mouseReleased','x':pts[-1][0],'y':pts[-1][1],'button':'left','clickCount':1,'pointerType':'pen'})
            await pg.wait_for_timeout(1200)
            pts=await guide_pts();await pen(pts,.3);await pg.wait_for_timeout(1500)
            print(name,'sheet done -> stars',await pg.evaluate("()=>[JSON.stringify(save.trace),save.coins,tr.rep]"))
            # dedo en otra hoja (círculo) sin pencil: recargar para resetear tr.pen
            await pg.evaluate("()=>{tr.pen=false;trOpen(5)}");await pg.wait_for_timeout(300)
            pts=await guide_pts()
            await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':pts[0][0],'y':pts[0][1]}]})
            for q in pts[1:]: await cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':q[0],'y':q[1]}]});await pg.wait_for_timeout(8)
            await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});await pg.wait_for_timeout(1300)
            print(name,'finger circle rep',await pg.evaluate("()=>[tr.rep,tr.pen,document.querySelector('#trMeter').classList.contains('hidden')]"))
            await pg.screenshot(path=f'/tmp/v70_{name}_circle.png')
            await pg.evaluate("()=>trOpen(7)");await pg.wait_for_timeout(300);await pg.screenshot(path=f'/tmp/v70_{name}_color.png')
            print(name,'errs',errs);await ctx.close()
        await b.close()
asyncio.run(main())
