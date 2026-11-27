import asyncio,sys,json,os
from h import *
from race import nexttile,finish
vp=sys.argv[1]
R=[]
def chk(name,cond,extra=''):
    R.append((name,bool(cond)));print(('PASS' if cond else 'FAIL'),name,extra if not cond else '',flush=True)
async def pin(page,code):
    for d in code: await page.tap(f'#pkeys [data-k="{d}"]')
    await page.wait_for_timeout(80)
async def tp(page,sel):
    c=await page.evaluate('(s)=>{const r=document.querySelector(s).getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]}',sel);await page.touchscreen.tap(*c)
async def main():
  async with async_playwright() as p:
    b,ctx,page,errs=await start(p,vp,rate=25)
    # ---------- home, locks, buying ----------
    chk('home: 7 difficulty tiles',await page.evaluate("document.querySelectorAll('#diffs .diff').length")==7)
    chk('fresh save: only level 1 unlocked',await page.evaluate("[...document.querySelectorAll('#diffs .diff')].map(d=>d.classList.contains('locked'))")==[False]+[True]*6)
    await page.evaluate("""() => {
        const observer = new MutationObserver(records => {
          if (records.some(r => [...r.addedNodes].some(n => n.classList?.contains('toast')))) {
            window.lockToastShown = true;
            observer.disconnect();
          }
        });
        observer.observe(document.body, {childList: true});
    }""")
    await page.locator('#diffs .diff[data-n="2"]').tap()
    chk('locked level tap -> toast, stays home',await page.evaluate("screen==='home' && window.lockToastShown"))
    hit=await page.evaluate("(()=>{const r=$('#diffs .diff[data-n=\"1\"]').getBoundingClientRect();const e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return e.className})()")
    chk('toast does not cover level tile centre',hit!='toast',hit)
    await page.wait_for_timeout(2800)
    await tp(page,'#diffs .diff[data-n="1"]');await page.wait_for_timeout(200)
    chk('level 1 menu shows 8 cards',await page.evaluate("document.querySelectorAll('#levels .card').length")==8)
    await page.tap('#levels .card');await page.wait_for_timeout(200)
    chk('card opens game',await page.evaluate('screen')=='game')
    fid=await page.evaluate('fig().id')
    # resume: place 1 piece, reload
    await page.touchscreen.tap(*(await nexttile(page)));await page.wait_for_timeout(200)
    await page.reload();await page.wait_for_timeout(300)
    chk('resume: Seguir button visible after reload',await page.evaluate("!$('#cont').classList.contains('hidden')"),await page.evaluate("$('#cont').textContent"))
    await page.tap('#cont');await page.wait_for_timeout(200)
    chk('resume: same model, 1 placed, score kept',await page.evaluate('[fig().id,st.placed,st.score]')==[fid,1,10],await page.evaluate('[fig().id,st.placed,st.score]'))
    cdp=await ctx.new_cdp_session(page);await cdp.send('Animation.enable');await cdp.send('Animation.setPlaybackRate',{'playbackRate':25})
    await finish(page);await page.wait_for_function("$('#win').classList.contains('show')",timeout=8000)
    chk('win: coins = max(3,N)+bonus',await page.evaluate('save.coins')==3,await page.evaluate('save.coins'))
    await page.tap('#next');await page.wait_for_timeout(200)
    chk('next button opens following model',await page.evaluate('fig().id')!=fid and await page.evaluate('screen')=='game')
    await finish(page);await page.wait_for_function("$('#win').classList.contains('show')",timeout=8000)
    await page.tap('#again');await page.wait_for_timeout(200)
    chk('again restarts model',await page.evaluate('st.placed')==0 and not await page.evaluate("$('#win').classList.contains('show')"))
    await finish(page);await page.wait_for_function("$('#win').classList.contains('show')",timeout=8000)
    c=await page.evaluate('save.coins')
    chk('replay gives ceil(N/3) coins',c==3+3+1,c)
    await page.tap('#home2');await page.wait_for_timeout(300);await page.evaluate("show('home')");await page.wait_for_timeout(200)
    await page.evaluate('save.coins=15;persist();renderHome()')
    chk('level 2 buyable at 15 coins',await page.evaluate("$('#diffs .diff[data-n=\"2\"]').classList.contains('can')"))
    await tp(page,'#diffs .diff[data-n="2"]');await page.wait_for_timeout(100);await page.tap('#buyNo');await page.wait_for_timeout(50)
    chk('buy cancel keeps coins',await page.evaluate('save.coins')==15)
    await tp(page,'#diffs .diff[data-n="2"]');await page.wait_for_timeout(100);await page.tap('#buyOk');await page.wait_for_timeout(100)
    chk('buy level 2 deducts coins and unlocks',await page.evaluate('[save.coins,save.lvlOwned]')==[0,[1,2]],await page.evaluate('[save.coins,save.lvlOwned]'))
    await tp(page,'#diffs .diff[data-n="4"]');await page.wait_for_timeout(100)
    chk('cannot skip levels',await page.evaluate("screen")=='home' and 4 not in await page.evaluate('save.lvlOwned'))
    # rescue set
    await page.tap('#goRescue');await page.wait_for_timeout(200)
    chk('rescue menu: 7 models, none locked',await page.evaluate("[document.querySelectorAll('#levels .card').length,document.querySelectorAll('#levels .card.locked').length]")==[7,0],await page.evaluate("[document.querySelectorAll('#levels .card').length,document.querySelectorAll('#levels .card.locked').length]"))
    await page.tap('#back');await page.wait_for_timeout(200)
    # ---------- parent panel ----------
    await page.tap('#gear');await page.wait_for_timeout(80)
    await pin(page,'1111');await page.wait_for_timeout(500)
    chk('wrong PIN rejected',await page.evaluate("$('#popts').classList.contains('hidden')"))
    await pin(page,'1234')
    chk('PIN 1234 opens options',not await page.evaluate("$('#popts').classList.contains('hidden')"))
    box=await page.evaluate("(()=>{const b=$('#parents .box');const r=b.getBoundingClientRect();return [r.top,r.bottom,innerHeight,b.scrollHeight,b.clientHeight]})()")
    chk('parent panel fits/scrolls in viewport',box[0]>=0 and box[1]<=box[2],box)
    await page.tap('#pUnlock');chk('unlock all',await page.evaluate("save.unlockAll&&document.querySelectorAll('#diffs .diff.locked').length===0"))
    await page.tap('#pUnlock');chk('re-lock',await page.evaluate("!save.unlockAll&&document.querySelectorAll('#diffs .diff.locked').length===5"))
    await page.tap('#pEnglish');chk('english off',await page.evaluate('save.noEnglish===true'));await page.tap('#pEnglish')
    await page.tap('#pHaptic');chk('haptic off',await page.evaluate('save.noHaptic===true'));await page.tap('#pHaptic')
    # backup (download fallback)
    snap=await page.evaluate("localStorage.setItem('fichitas3d',JSON.stringify({stars:{t3_torre:2}}));save.free=[{k:'b2',c:'r',x:1,y:0}];persist();JSON.stringify(save)")
    async with page.expect_download() as dl:
        await page.tap('#pBackup')
    d=await dl.value;path=TESTS+'backup_%s.json'%vp;await d.save_as(path)
    data=json.load(open(path))
    chk('backup file has app/save/save3d',data.get('app')=='fichitas' and json.dumps(data['save'],sort_keys=True)==json.dumps(json.loads(snap),sort_keys=True) and data['save3d']=={'stars':{'t3_torre':2}})
    # reset then restore
    await page.tap('#pReset');await page.tap('#pReset')
    chk('reset clears stars/coins/levels',await page.evaluate('[Object.keys(save.stars).length,save.coins,save.lvlOwned]')==[0,0,[1]])
    await page.evaluate("localStorage.removeItem('fichitas3d')")
    await page.set_input_files('#pRestore',path);await page.wait_for_timeout(200)
    chk('restore round-trip equals backup',json.dumps(json.loads(await page.evaluate('JSON.stringify(save)')),sort_keys=True)==json.dumps(json.loads(snap),sort_keys=True) and await page.evaluate("localStorage.getItem('fichitas3d')")==json.dumps({'stars':{'t3_torre':2}},separators=(',',':')),await page.evaluate('$("#pMsg").textContent'))
    open(TESTS+'bad.json','w').write('{"foo":1}')
    await page.set_input_files('#pRestore',TESTS+'bad.json');await page.wait_for_timeout(150)
    chk('restore rejects foreign file',(await page.evaluate('$("#pMsg").textContent')).startswith('⚠️') and await page.evaluate('save.coins')==0)
    chk('no errors so far',not errs,errs[:3]);errs.clear()
    # ---------- dad mode ----------
    await page.tap('#pBuild');await page.wait_for_timeout(250)
    chk('dad editor opens with 39 shapes, 20x45 board',await page.evaluate("[screen,ed.mode,document.querySelectorAll('#eShapes .tile').length,E_COLS,E_ROWS]")==['editor','papa',39,20,45],await page.evaluate("[screen,ed.mode,document.querySelectorAll('#eShapes .tile').length,E_COLS,E_ROWS]"))
    async def bp(x,y): return await page.evaluate('([x,y])=>{const r=$("#eBoard").getBoundingClientRect();return [r.left+x*ed.C,r.bottom-y*ed.C*PL]}',[x,y])
    for i,(x,y) in enumerate([(3,1.5),(3,4.5),(8,1.5),(3,7.5)]):
        await page.touchscreen.tap(*(await bp(x,y)));await page.wait_for_timeout(60)
    chk('dad: 4 pieces placed',await page.evaluate('save.draft.pieces.length')==4,await page.evaluate('JSON.stringify(save.draft.pieces)'))
    await page.tap('#eImport');await page.wait_for_timeout(80)
    chk('import free build replaces draft',await page.evaluate('JSON.stringify(save.draft.pieces)')==await page.evaluate('JSON.stringify(save.free)'))
    await page.tap('#eUndo');chk('undo import',await page.evaluate('save.draft.pieces.length')==4)
    await page.tap('#eSave');await page.wait_for_timeout(120)
    await page.fill('#sName','Mi <b>carro</b>');await page.tap('#sEmos button:nth-child(3)');await page.tap('#sOk');await page.wait_for_timeout(150)
    chk('save custom model',await page.evaluate('save.custom.length')==1 and await page.evaluate('save.custom[0].pieces.length')==4)
    saved=await page.evaluate('JSON.stringify(save.custom[0].pieces)')
    # aliasing: move a piece after saving, without saving again
    await page.touchscreen.tap(*(await bp(8.9,1.5)));await page.wait_for_timeout(80)
    a=await page.evaluate("(()=>{const r=$('#arrows [data-mv=\"R\"]').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]})()")
    await page.touchscreen.tap(*a);await page.touchscreen.tap(*a);await page.wait_for_timeout(60)
    now=await page.evaluate('JSON.stringify(save.custom[0].pieces)');stored=await page.evaluate("JSON.stringify(JSON.parse(localStorage.getItem('fichitas_v1')).custom[0].pieces)")
    chk('BUG-CHECK saved model unchanged by later unsaved edits',now==saved and stored==saved,'saved model silently changed: %s -> %s'%(saved,stored))
    await page.tap('#eBack');await page.wait_for_timeout(200)
    chk('home shows "De papá (1)"',await page.evaluate("$('#goPapa').textContent")=='👨 De papá (1)' and not await page.evaluate("$('#goPapa').classList.contains('hidden')"))
    await page.tap('#goPapa');await page.wait_for_timeout(200)
    chk('custom name is not interpreted as HTML in menu',await page.evaluate("document.querySelectorAll('#levels .foot b').length")==0,'name rendered via innerHTML')
    await page.tap('#levels .card');await page.wait_for_timeout(200)
    await finish(page);await page.wait_for_function("$('#win').classList.contains('show')",timeout=8000)
    chk('custom model playable to win',True)
    await page.tap('#home2');await page.wait_for_timeout(300);await page.evaluate("show('home')");await page.wait_for_timeout(200)
    await page.tap('#gear');await pin(page,'1234')
    await page.tap('#pList [data-ed]');await page.wait_for_timeout(200)
    chk('edit custom opens editor with its pieces',await page.evaluate('[screen,save.draft.pieces.length]')==['editor',4])
    await page.tap('#eBack');await page.wait_for_timeout(200)
    await page.tap('#gear');await pin(page,'1234')
    await page.tap('#pList [data-del]');chk('delete asks confirm',await page.evaluate('save.custom.length')==1)
    await page.tap('#pList [data-del]');await page.wait_for_timeout(80)
    chk('delete custom removes model + home button',await page.evaluate('save.custom.length')==0 and await page.evaluate("$('#goPapa').classList.contains('hidden')"))
    await page.tap('#pClose')
    # free mode after dad mode
    await page.tap('#goFree');await page.wait_for_timeout(200)
    chk('free mode after dad mode: 29 shapes 14x30, free pieces intact',await page.evaluate("[ed.mode,document.querySelectorAll('#eShapes .tile').length,E_COLS,E_ROWS,save.free.length]")==['free',29,14,30,1],await page.evaluate("[ed.mode,document.querySelectorAll('#eShapes .tile').length,E_COLS,E_ROWS,save.free.length]"))
    # ---------- mixer ----------
    await page.tap('#ePalette')
    await page.evaluate("$('#mixOpen').scrollIntoView()");await page.tap('#mixOpen');await page.wait_for_timeout(100)
    chk('mixer opens, save disabled when empty',await page.evaluate("$('#mixer').classList.contains('show')&&$('#mixOk').disabled"))
    await page.tap('#mixPal .sw[data-c="r"]');await page.tap('#mixPal .sw[data-c="y"]')
    pot=await page.evaluate("$('#mixPot').style.background");
    await page.tap('#mixOk');await page.wait_for_timeout(100)
    mix=await page.evaluate('save.mix');chk('mix red+yellow saved & selected (orange-ish)',len(mix)==1 and await page.evaluate('ed.c')=='c0',(mix,pot))
    print('   red+yellow ->',mix)
    await page.touchscreen.tap(*(await bp(8,1.5)));await page.wait_for_timeout(80)
    await page.reload();await page.wait_for_timeout(300);await page.tap('#goFree');await page.wait_for_timeout(200)
    chk('mixed-colour piece survives reload',await page.evaluate("save.free.some(p=>p.c==='c0')&&!!COL.c0"))
    await page.tap('#ePalette')
    # 13 mixes: eviction of unused / limit
    for i in range(13):
        await page.evaluate("$('#mixOpen').scrollIntoView()");await page.tap('#mixOpen');await page.wait_for_timeout(40)
        await page.evaluate("(i)=>{const el=$('#mixPick');el.value='#'+(0x101010*(i+1)).toString(16).padStart(6,'0');el.dispatchEvent(new Event('input',{bubbles:true}))}",i)
        await page.tap('#mixOk');await page.wait_for_timeout(40)
    chk('mix list capped at 12, used colour kept',await page.evaluate("save.mix.length")==12 and await page.evaluate("save.mix.some(m=>m.k==='c0')"),await page.evaluate('save.mix'))
    chk('no errors in flow',not errs,errs[:4])
    print('SUMMARY',vp,sum(1 for r in R if r[1]),'pass',sum(1 for r in R if not r[1]),'fail',[r[0] for r in R if not r[1]])
    await b.close()
asyncio.run(main())
