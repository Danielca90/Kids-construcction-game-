import asyncio,json,sys,time
from h import *
async def main():
  async with async_playwright() as p:
    for vp in [sys.argv[1]]:
        b,ctx,page,errs=await start(p,vp,BASE+'3d/index.html')
        await page.evaluate("localStorage.setItem('fichitas_v1',JSON.stringify({coins:7,stars:{a:1},lvlOwned:[1],muted:true,noEnglish:true}))");await page.reload();await page.wait_for_timeout(300)
        n=await page.evaluate('MODELS3D.length');ok=0;fails=[]
        # static validity
        val=await page.evaluate('''()=>MODELS3D.map(M=>{const g=new Map(),ov=[],oob=[],fl=[];M.steps.forEach((p,i)=>{let sup=false;
          for(let x=p.x;x<p.x+p.w;x++)for(let z=p.z;z<p.z+p.d;z++){if(x<0||z<0||x>=M.N||z>=M.N)oob.push(i);if(p.y===1||g.has(x+','+(p.y-1)+','+z))sup=true;}
          for(let x=p.x;x<p.x+p.w;x++)for(let z=p.z;z<p.z+p.d;z++)for(let y=p.y;y<p.y+p.h;y++){const k=x+','+y+','+z;if(g.has(k))ov.push(i);g.set(k,i)}
          if(!sup)fl.push(i);if(!COL[p.c]||!CNAME[p.c])ov.push('col'+i)});return [M.id,M.steps.length,[...new Set(ov)],[...new Set(oob)],fl]})''')
        print(vp,'3D model validity (id,n,overlap,oob,floating-or-out-of-order):',[v for v in val if v[2] or v[3] or v[4]] or 'all clean',[ (v[0],v[1]) for v in val])
        for i in range(0 if len(sys.argv)<3 else n,n):
            pre=await page.evaluate("[JSON.parse(localStorage.getItem('fichitas_v1')).coins,save3.stars[MODELS3D[%d].id]||0,MODELS3D[%d].steps.length]"%(i,i))
            c=await page.evaluate("(i)=>{const e=document.querySelector('.card[data-i=\"'+i+'\"]');e.scrollIntoView();const r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]}",i)
            await page.touchscreen.tap(*c);await page.wait_for_timeout(250)
            t0=time.time();why=''
            while True:
                s=await page.evaluate('''()=>{const k=placed<STEPS.length?KEY(STEPS[placed]):null;const t=k&&[...document.querySelectorAll('#tray .tile')].find(t=>t.dataset.k===k&&!t.classList.contains('used'));const r=t&&t.getBoundingClientRect();
                   return {placed,N:STEPS.length,busy,win:$('#win').classList.contains('show'),t:r&&[r.left+r.width/2,r.top+r.height/2,r.width,r.height],nt:document.querySelectorAll('#tray .tile').length}}''')
                if s['win']:break
                if time.time()-t0>60: why='timeout '+json.dumps(s);break
                if s['busy'] or s['placed']>=s['N']: await page.wait_for_timeout(40);continue
                if not s['t']: why='no tile '+json.dumps(s);break
                await page.touchscreen.tap(s['t'][0],s['t'][1]);await page.wait_for_timeout(560)
            post=await page.evaluate("[JSON.parse(localStorage.getItem('fichitas_v1')),save3.stars[M.id]||0]")
            exp=max(3,pre[2]) if not pre[1] else max(1,-(-pre[2]//3))
            if not why and post[0]['coins']-pre[0]!=exp: why='coins %d exp %d'%(post[0]['coins']-pre[0],exp)
            if not why and post[1]!=pre[1]+1: why='stars'
            if not why and (post[0].get('stars')!={'a':1} or post[0].get('lvlOwned')!=[1]): why='main save clobbered'
            if errs: why+=' ERR '+str(errs[:2]);errs.clear()
            print(vp,'3D',i,pre[2],'OK' if not why else 'FAIL '+why,flush=True)
            if why: fails.append(why)
            else: ok+=1
            await page.tap('#toMenu') if await page.evaluate("$('#win').classList.contains('show')") else await page.evaluate('toMenu()')
            await page.wait_for_timeout(150)
        print(vp,'3D pass',ok,'fail',len(fails))
        # settings respected? count speak() and oscillators while muted+noEnglish in main save
        await page.evaluate("(()=>{window._sp=0;speechSynthesis.speak=u=>{_sp++};window._osc=0;const co=BaseAudioContext.prototype.createOscillator;BaseAudioContext.prototype.createOscillator=function(){_osc++;return co.call(this)}})()")
        await page.evaluate("openModel(0)");await page.wait_for_timeout(300)
        t=await page.evaluate("(()=>{const k=KEY(STEPS[placed]);const r=[...document.querySelectorAll('#tray .tile')].find(t=>t.dataset.k===k).getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]})()")
        await page.touchscreen.tap(*t);await page.wait_for_timeout(700)
        print(vp,'3D with main save muted+noEnglish: speak calls',await page.evaluate('_sp'),'oscillators',await page.evaluate('_osc'))
        # race: finish, press back during victory spin
        while await page.evaluate('placed<STEPS.length-1'):
            t=await page.evaluate("(()=>{const k=KEY(STEPS[placed]);const r=[...document.querySelectorAll('#tray .tile')].find(t=>t.dataset.k===k).getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]})()")
            await page.touchscreen.tap(*t);await page.wait_for_timeout(600)
        t=await page.evaluate("(()=>{const k=KEY(STEPS[placed]);const r=[...document.querySelectorAll('#tray .tile')].find(t=>t.dataset.k===k).getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]})()")
        await page.touchscreen.tap(*t);await page.wait_for_timeout(750)
        await page.tap('#back');await page.wait_for_timeout(1800)
        print(vp,'3D back during victory spin: win overlay over menu:',await page.evaluate("$('#win').classList.contains('show')&&!$('#menu3d').classList.contains('hidden')"))
        if await page.evaluate("$('#win').classList.contains('show')"):
            await page.tap('#again');await page.wait_for_timeout(300);print('   tapping ↻ there ->',errs[:1]);errs.clear()
        # frame cost
        await page.evaluate('toMenu()');await page.wait_for_timeout(200)
        cdp=await ctx.new_cdp_session(page);await cdp.send('Emulation.setCPUThrottlingRate',{'rate':4})
        await page.evaluate("openModel(MODELS3D.length-1);placed=STEPS.length-2");await page.wait_for_timeout(500)
        fr=await page.evaluate("new Promise(r=>{let n=0,t0=performance.now();const f=()=>{n++;if(performance.now()-t0<2000)requestAnimationFrame(f);else r(n/2)};requestAnimationFrame(f)})")
        cost=await page.evaluate("(()=>{const t=performance.now();for(let i=0;i<10;i++)frame(1000);return (performance.now()-t)/10})()")
        print(vp,'3D castle idle render loop @4x CPU throttle: fps',fr,'ms/frame',round(cost,1))
        await b.close()
asyncio.run(main())
