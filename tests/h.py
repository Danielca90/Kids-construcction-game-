import asyncio, json, sys
from playwright.async_api import async_playwright
import pathlib as _pl
REPO=_pl.Path(__file__).resolve().parent.parent
BASE='file://'+str(REPO)+'/'
TESTS=str(REPO/'tests')+'/'
ROOT=BASE+'index.html'
VP={'ipad':dict(viewport={'width':1080,'height':810},has_touch=True,is_mobile=True,device_scale_factor=2),
    'ipadp':dict(viewport={'width':810,'height':1080},has_touch=True,is_mobile=True,device_scale_factor=2),
    'iphone':dict(viewport={'width':393,'height':852},has_touch=True,is_mobile=True,device_scale_factor=3),
    'iphonel':dict(viewport={'width':852,'height':393},has_touch=True,is_mobile=True,device_scale_factor=3)}
async def start(p,vp='ipad',url=ROOT,init=None,rate=None):
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
    ctx=await b.new_context(**VP[vp])
    if init: await ctx.add_init_script(init)
    page=await ctx.new_page()
    errs=[]
    page.on('pageerror',lambda e:errs.append('PAGEERROR: '+str(e)))
    page.on('console',lambda m:errs.append('CONSOLE: '+m.text) if m.type=='error' else None)
    await page.goto(url)
    await page.wait_for_timeout(300)
    if rate:
        cdp=await ctx.new_cdp_session(page)
        await cdp.send('Animation.enable');await cdp.send('Animation.setPlaybackRate',{'playbackRate':rate})
    return b,ctx,page,errs
async def touch(cdp,typ,x=None,y=None):
    pts=[] if typ=='touchEnd' else [{'x':x,'y':y,'id':1}]
    await cdp.send('Input.dispatchTouchEvent',{'type':typ,'touchPoints':pts})
async def drag(page,ctx,x0,y0,x1,y1,steps=10,cdp=None):
    cdp=cdp or await ctx.new_cdp_session(page)
    await touch(cdp,'touchStart',x0,y0)
    for i in range(1,steps+1):
        await touch(cdp,'touchMove',x0+(x1-x0)*i/steps,y0+(y1-y0)*i/steps);await page.wait_for_timeout(16)
    await touch(cdp,'touchEnd');await page.wait_for_timeout(60)
