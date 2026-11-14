import asyncio,json,sys,time
from h import *
vp=sys.argv[1]
async def state(page):
    return await page.evaluate('''()=>{const F=fig();const N=F.steps.length;const k=st.placed<N?key(F.steps[st.placed]):null;
      const t=k?[...document.querySelectorAll('#tray .tile')].find(t=>t.dataset.k===k):null;
      let r=null,pr=null;if(t){const b=t.getBoundingClientRect();r=[b.left,b.top,b.width,b.height];const pc=t.querySelector('.pc');if(pc){const q=pc.getBoundingClientRect();pr=[q.width,q.height]}}
      return {placed:st.placed,N,k,busy,bag:$('#bag').classList.contains('show'),win:$('#win').classList.contains('show'),tile:r,pc:pr,used:t?t.classList.contains('used'):null,
        ntiles:document.querySelectorAll('#tray .tile').length,score:st.score,streak:st.streak,opened:st.opened,z:cam.z,C,screen,
        nodes:document.querySelectorAll('#game *').length,wait:tray.classList.contains('wait')}}''')
async def main():
    res={'pass':0,'fail':0,'fails':[],'minTile':[1e9,1e9,''],'minPc':[1e9,1e9,''],'maxNodes':0,'maxTiles':0,'bagsOpened':0,'wrongTaps':0}
    async with async_playwright() as p:
        b,ctx,page,errs=await start(p,vp,rate=25)
        n=await page.evaluate('FIGS.length')
        for i in range(int(sys.argv[2]) if len(sys.argv)>2 else 0,n):
            ok=True;why=''
            pre=await page.evaluate('({coins:save.coins||0,stars:Object.assign({},save.stars)})')
            await page.evaluate(f'openFig({i})');await page.wait_for_timeout(120)
            info=await page.evaluate('({id:fig().id,N:fig().steps.length,bags:fig().bags.length})')
            taps=0;wrongdone=False;expscore=0;streak=0
            t0=time.time()
            while True:
                s=await state(page)
                if s['win']:break
                if time.time()-t0>240: ok=False;why='timeout at %d/%d %s'%(s['placed'],s['N'],json.dumps(s));break
                if s['bag']:
                    await page.touchscreen.tap(VP[vp]['viewport']['width']/2,VP[vp]['viewport']['height']/2-20)
                    await page.wait_for_timeout(520);res['bagsOpened']+=1;continue
                if s['busy'] or s['placed']>=s['N']:
                    await page.wait_for_timeout(40);continue
                if not s['tile'] or s['used'] or not s['pc']:
                    ok=False;why='no usable tile for next piece at %d: %s'%(s['placed'],json.dumps(s));break
                x,y,w,h=s['tile']
                vw=VP[vp]['viewport']['width'];vh=VP[vp]['viewport']['height']
                if x<0 or y<0 or x+w>vw+1 or y+h>vh+1 or w<5 or h<5:
                    ok=False;why='tile offscreen %s'%json.dumps(s);break
                res['maxNodes']=max(res['maxNodes'],s['nodes']);res['maxTiles']=max(res['maxTiles'],s['ntiles'])
                if w*h<res['minTile'][0]*res['minTile'][1]:res['minTile']=[round(w),round(h),info['id']]
                if s['pc'][0]*s['pc'][1]<res['minPc'][0]*res['minPc'][1]:res['minPc']=[round(s['pc'][0],1),round(s['pc'][1],1),info['id']+'@'+str(s['placed'])+' '+s['k']]
                # one deliberate wrong tap per model (at piece 3) if another tile exists
                if s['placed']==3 and not wrongdone and s['ntiles']>1:
                    wrongdone=True
                    wr=await page.evaluate('''()=>{const k=key(fig().steps[st.placed]);const t=[...document.querySelectorAll('#tray .tile')].find(t=>t.dataset.k!==k&&!t.classList.contains('used'));if(!t)return null;const b=t.getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]}''')
                    if wr:
                        sc0=s['score']
                        tw0=await page.evaluate('performance.now()');await page.touchscreen.tap(*wr);res['wrongTaps']+=1
                        s2=await state(page)
                        if not(s2['busy'] and s2['wait'] and s2['placed']==s['placed'] and s2['streak']==0 and s2['score']==max(0,sc0-15)):
                            ok=False;why='wrong tap state bad %s'%json.dumps(s2);break
                        # tap correct while locked: must be ignored
                        await page.touchscreen.tap(x+w/2,y+h/2)
                        s3=await state(page)
                        if s3['placed']!=s['placed']: ok=False;why='tap during lockout accepted';break
                        t1=None
                        for _ in range(100):
                            bz=await page.evaluate('[busy,performance.now()]')
                            if not bz[0]: t1=bz[1];break
                            await page.wait_for_timeout(25)
                        if t1 is None or not (1450<=t1-tw0<=1750): ok=False;why='lockout duration %s'%(t1 and t1-tw0);break
                        streak=0;expscore=s2['score'];continue
                await page.touchscreen.tap(x+w/2,y+h/2);taps+=1
                for _ in range(80):
                    s2=await state(page)
                    if s2['placed']!=s['placed']:break
                    await page.wait_for_timeout(15)
                if s2['placed']!=s['placed']+1:
                    ok=False;why='placed went %d -> %d'%(s['placed'],s2['placed']);break
                streak+=1;m=4 if streak>=10 else 3 if streak>=6 else 2 if streak>=3 else 1;expscore+=10*m
                if s2['score']!=expscore: ok=False;why='score %s expected %s at %d'%(s2['score'],expscore,s2['placed']);break
                if s2['placed']>=s2['N']:
                    await page.wait_for_function("$('#win').classList.contains('show')",timeout=8000)
            if ok:
                post=await page.evaluate('({coins:save.coins||0,stars:Object.assign({},save.stars),prog:save.prog[fig().id]||null,earn:$("#earn").textContent,sl:$("#scoreLine").textContent,stored:JSON.parse(localStorage.getItem("fichitas_v1"))})')
                first=not pre['stars'].get(info['id'])
                base=max(3,info['N']) if first else max(1,-(-info['N']//3))
                exp=base+expscore//50
                if post['coins']-pre['coins']!=exp: ok=False;why='coins +%d expected +%d'%(post['coins']-pre['coins'],exp)
                elif post['stars'].get(info['id'],0)!=pre['stars'].get(info['id'],0)+1: ok=False;why='stars'
                elif post['prog'] is not None: ok=False;why='prog not cleared'
                elif post['stored']['coins']!=post['coins'] or post['stored']['stars'].get(info['id'])!=post['stars'].get(info['id']): ok=False;why='not persisted'
                elif taps!=info['N']: ok=False;why='taps %d != N %d'%(taps,info['N'])
            e=[x for x in errs];errs.clear()
            if e: ok=False;why+=' ERRORS:'+' | '.join(e[:3])
            if ok:res['pass']+=1
            else:res['fail']+=1;res['fails'].append((info['id'],why))
            print(vp,i,info['id'],info['N'],'OK' if ok else 'FAIL '+why,round(time.time()-t0,1),flush=True)
            # leave via home button on win overlay
            if await page.evaluate("$('#win').classList.contains('show')"):
                await page.tap('#home2')
            else:
                await page.evaluate("goModels()")
            await page.wait_for_timeout(120)
        print(json.dumps(res))
        await b.close()
asyncio.run(main())
