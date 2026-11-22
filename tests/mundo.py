import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        for name,vp in [('ipad',{'width':1080,'height':810}),('iphone',{'width':393,'height':852})]:
            ctx=await b.new_context(viewport=vp,has_touch=True);pg=await ctx.new_page()
            errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
            await pg.goto(__import__('h').ROOT);await pg.wait_for_timeout(300)
            await pg.evaluate("()=>{save.char={v:2,head:'gato',face:'feliz',hat:'corona',body:'estrella',ropa:'heroe',arms:'recto',legs:'botas',col:{head:'#f6a04d',body:'#2f6fdb',arms:'#e63b2e',legs:'#4cb54a'},pose:CH_REST};persist()}")
            await pg.click('#goWorld');await pg.wait_for_timeout(900)
            await pg.screenshot(path=f'/tmp/v80_{name}_start.png')
            async def tapcell(x,y):
                pt=await pg.evaluate(f"()=>{{const r=document.querySelector('#mwCv').getBoundingClientRect(),d=document.querySelector('#mwCv').width/r.width;return [r.left+(mw.ox+({x}+.5)*mw.s)/d, r.top+(mw.oy+({y}+.5)*mw.s*1.2)/d]}}")
                await pg.touchscreen.tap(*pt)
            # caminar 5 columnas a la derecha (sobre el suelo)
            st=await pg.evaluate("()=>[Math.round(mw.x),Math.round(mw.f)]")
            await tapcell(st[0]+5,st[1]);await pg.wait_for_timeout(2500)
            st2=await pg.evaluate("()=>[Math.round(mw.x),Math.round(mw.f)]");print(name,'walk',st,'->',st2)
            # romper el ladrillo bajo los pies del lado derecho
            x,f=st2;c0=await pg.evaluate(f"()=>mwAt({x+1},{f+1})")
            await tapcell(x+1,f+1);await pg.wait_for_timeout(800)
            print(name,'break',c0,'->',await pg.evaluate(f"()=>mwAt({x+1},{f+1})"),'inv',await pg.evaluate("()=>JSON.stringify(mw.inv)"))
            # escoger rojo y poner un ladrillo arriba a la izquierda
            await pg.click('.mwb[data-k="r"]');await pg.wait_for_timeout(200)
            await tapcell(x-1,f-2);await pg.wait_for_timeout(900)
            print(name,'place ->',await pg.evaluate(f"()=>mwAt({x-1},{f-2})"),'inv r',await pg.evaluate("()=>mw.inv.r"))
            # caminar lejos (con ruta)
            await pg.click('.mwb[data-k=""]');await tapcell(x-4,f);await pg.wait_for_timeout(2200)
            print(name,'walk back ->',await pg.evaluate("()=>[Math.round(mw.x),Math.round(mw.f)]"))
            await pg.screenshot(path=f'/tmp/v80_{name}_play.png')
            # volver al inicio y entrar otra vez (persistencia)
            await pg.click('#mwBack');await pg.wait_for_timeout(300);await pg.click('#goWorld');await pg.wait_for_timeout(500)
            print(name,'persist red',await pg.evaluate(f"()=>mwAt({x-1},{f-2})"),'errs',errs)
            await ctx.close()
        await b.close()
asyncio.run(main())
