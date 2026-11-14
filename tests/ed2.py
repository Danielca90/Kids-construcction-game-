import asyncio,json,sys,random
from h import *
if __name__=="__main__": vp=sys.argv[1]; url=BASE+sys.argv[2]
R=[];
def chk(name,cond,extra=''):
    R.append((name,bool(cond)));print(('PASS' if cond else 'FAIL'),name,extra if not cond else '',flush=True)
INV='''()=>{const pcs=edPieces();const bad=[];pcs.forEach((p,i)=>{const T=CAT[p.k];if(!T||!COL[p.c]){bad.push('badpiece'+i);return}
  if(p.x<0||p.y<0||p.x+T.w>E_COLS||p.y+T.h>E_ROWS)bad.push('oob'+i+JSON.stringify(p));
  pcs.forEach((q,j)=>{if(j<=i)return;const Q=CAT[q.k];if(p.x<q.x+Q.w&&p.x+T.w>q.x&&p.y<q.y+Q.h&&p.y+T.h>q.y)bad.push('overlap'+i+'-'+j)})});
  const dom=document.querySelectorAll('#eBoard .pc[data-i]').length;if(dom!==pcs.length)bad.push('dom'+dom+'!='+pcs.length);
  if(JSON.stringify(JSON.parse(localStorage.getItem('fichitas_v1'))[ed.mode==='free'?'free':'draft'][ed.mode==='free'?undefined:'pieces']||JSON.parse(localStorage.getItem('fichitas_v1')).free)!==JSON.stringify(pcs)&&ed.mode==='free')bad.push('notpersisted');
  return bad}'''
async def pcs(page): return await page.evaluate('JSON.parse(JSON.stringify(edPieces()))')
async def center(page,sel):
    return await page.evaluate('(s)=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2,r.width,r.height]}',sel)
async def boardpt(page,x,y):  # board coords (stud, plate) -> client
    return await page.evaluate('([x,y])=>{const r=$("#eBoard").getBoundingClientRect();return [r.left+x*ed.C,r.bottom-y*ed.C*PL]}',[x,y])
async def tapsel(page,k):
    await page.evaluate('(k)=>$("#eShapes .tile[data-k=\\""+k+"\\"]").scrollIntoView({block:"center",inline:"center",behavior:"instant"})',k)
    c=await center(page,f'#eShapes .tile[data-k="{k}"]');await page.touchscreen.tap(c[0],c[1]);await page.wait_for_timeout(60)
async def main():
  async with async_playwright() as p:
    b,ctx,page,errs=await start(p,vp,url)
    cdp=await ctx.new_cdp_session(page)
    await page.tap('#goFree');await page.wait_for_timeout(200)
    chk('editor opens',await page.evaluate("screen==='editor'&&!$('#editor').classList.contains('hidden')"))
    # E1: tap-select and tap-place, stacking
    await tapsel(page,'b4');chk('select b4',await page.evaluate('ed.k')=='b4')
    for i in range(3):
        pt=await boardpt(page,7,1.5+3*i);await page.touchscreen.tap(*pt);await page.wait_for_timeout(80)
    P_=await pcs(page);chk('tap place x3 stacks',len(P_)==3,P_)
    chk('invariants after place',not await page.evaluate(INV),await page.evaluate(INV))
    # E2: select placed piece, arrows
    p0=P_[0];c=await boardpt(page,p0['x']+2,p0['y']+1.5)
    # topmost piece instead (nothing above)
    top=max(P_,key=lambda q:q['y']);ti=P_.index(top);c=await boardpt(page,top['x']+2,top['y']+1.5)
    await page.touchscreen.tap(*c);await page.wait_for_timeout(80)
    chk('tap selects piece + arrows shown',await page.evaluate('ed.sel')==ti and not await page.evaluate("$('#arrows').classList.contains('hidden')"),await page.evaluate('ed.sel'))
    async def arrow(mv,n=1):
        for _ in range(n):
            a=await center(page,f'#arrows [data-mv="{mv}"]');await page.touchscreen.tap(a[0],a[1]);await page.wait_for_timeout(25)
    await arrow('L',25);q=(await pcs(page))[ti];chk('left edge clamp',q['x']==0,q)
    await arrow('R',25);q=(await pcs(page))[ti];chk('right edge clamp',q['x']==await page.evaluate('E_COLS')-4,q)
    await arrow('U',25);q=(await pcs(page))[ti];chk('top edge clamp',q['y']+3<=await page.evaluate('E_ROWS') and q['y']>=await page.evaluate('E_ROWS')-5,q)
    await arrow('D',30);q=(await pcs(page))[ti];chk('bottom clamp',q['y']==0,q)
    chk('invariants after arrows',not await page.evaluate(INV),await page.evaluate(INV))
    # move into other piece: must block
    await arrow('L',25);q=(await pcs(page))[ti];chk('blocked by neighbour (no overlap)',not await page.evaluate(INV),q)
    hist=await page.evaluate('ed.hist.length')
    # E3 undo all the way back
    before=await pcs(page)
    await page.tap('#eUndo');await page.wait_for_timeout(50)
    chk('undo one move changes state',await pcs(page)!=before)
    for _ in range(200):
        if not await page.evaluate('ed.hist.length'):break
        await page.tap('#eUndo')
    chk('undo to empty (hist<=80)',len(await pcs(page))==0 or hist>=80,(hist,len(await pcs(page))))
    await page.tap('#eUndo');chk('undo on empty history harmless',not errs,errs)
    # rebuild 3 stacked
    await page.evaluate('setPieces([]);ed.hist=[];drawEditorBoard()')
    for i in range(3):
        pt=await boardpt(page,7,1.5+3*i);await page.touchscreen.tap(*pt);await page.wait_for_timeout(80)
    # OK button deselects; X deletes
    c=await boardpt(page,7,7.5);await page.touchscreen.tap(*c);await page.wait_for_timeout(60)
    sel=await page.evaluate('ed.sel');await arrow('X')
    chk('arrow-pad delete',len(await pcs(page))==2 and await page.evaluate('ed.sel')==-1,(sel,await pcs(page)))
    await page.tap('#eUndo');chk('undo delete restores',len(await pcs(page))==3)
    # E4 eraser: erase the bottom piece, others stay
    await page.tap('#eRm');await page.wait_for_timeout(60)
    c=await boardpt(page,7,1.5);await page.touchscreen.tap(*c);await page.wait_for_timeout(60)
    P_=await pcs(page);chk('eraser removes bottom piece only',len(P_)==2 and all(q['y']>0 for q in P_),P_)
    # tap empty area in eraser mode: nothing
    c=await boardpt(page,1,20);await page.touchscreen.tap(*c);chk('eraser tap on empty: no change',len(await pcs(page))==2)
    await page.tap('#eRm');chk('eraser toggles off',not await page.evaluate('ed.rm'))
    # E5 clear
    await page.tap('#eClear');await page.wait_for_timeout(60);chk('clear asks confirmation',await page.evaluate('ed.sure') and len(await pcs(page))==2)
    await page.wait_for_timeout(2700);chk('clear confirmation times out',not await page.evaluate('ed.sure') and await page.evaluate("$('#eClear').textContent")=='🗑️')
    await page.tap('#eClear');await page.wait_for_timeout(60);await page.tap('#eClear');await page.wait_for_timeout(60)
    chk('clear on 2nd tap',len(await pcs(page))==0)
    await page.tap('#eUndo');chk('undo clear',len(await pcs(page))==2)
    # E9 drag a placed piece
    P_=await pcs(page);q=P_[0];a=await boardpt(page,q['x']+2,q['y']+1.5);d=await boardpt(page,2,1.5)
    await drag(page,ctx,a[0],a[1],d[0],d[1]+40,12,cdp)
    P2=await pcs(page);chk('drag placed piece moves it',P2[0]!=q and len(P2)==2 and not await page.evaluate(INV),(q,P2,errs[:2]))
    chk('no leftover drag ghosts',await page.evaluate("document.querySelectorAll('.dragging,.preview').length")==0)
    # drag a placed piece far off the board -> stays
    P_=await pcs(page);q=P_[0];a=await boardpt(page,q['x']+2,q['y']+1.5)
    await drag(page,ctx,a[0],a[1],5,5,10,cdp)
    chk('drag off-board leaves piece',(await pcs(page))==P_ and await page.evaluate("document.querySelectorAll('.dragging,.preview').length")==0,(await pcs(page),errs[:2]))
    # tray drag
    await tapsel(page,'b2')
    n0=len(await pcs(page));t=await center(page,'#eShapes .tile[data-k="b2"]');d=await boardpt(page,11,1)
    hor=await page.evaluate("innerWidth>innerHeight")
    await drag(page,ctx,t[0],t[1],d[0],d[1]+40,14,cdp)
    chk('drag new piece from tray onto board',len(await pcs(page))==n0+1,(len(await pcs(page)),errs[:2]))
    chk('no leftover drag ghosts 2',await page.evaluate("document.querySelectorAll('.dragging,.preview').length")==0 and await page.evaluate('drag')==None,await page.evaluate('drag&&drag.moved'))
    errs_drag=list(errs);errs.clear()
    # every shape x placement
    await page.evaluate('setPieces([]);ed.hist=[];drawEditorBoard()')
    shapes=await page.evaluate('E_SHAPES');bad=[]
    for k in shapes:
        await tapsel(page,k)
        if await page.evaluate('ed.k')!=k: bad.append('sel '+k);continue
        await page.evaluate('setPieces([]);drawEditorBoard()')
        c=await boardpt(page,random.randint(1,12),1);await page.touchscreen.tap(*c);await page.wait_for_timeout(30)
        if len(await pcs(page))!=1: bad.append('place '+k)
    chk('all %d free shapes selectable+placeable'%len(shapes),not bad,bad)
    chk('invariants after all shapes',not await page.evaluate(INV),await page.evaluate(INV))
    # every colour
    cols=await page.evaluate("[...document.querySelectorAll('#eColors .sw')].filter(b=>b.dataset.c).map(b=>b.dataset.c)");bad=[]
    for cc in cols:
        await page.evaluate('(c)=>$("#eColors .sw[data-c=\\""+c+"\\"]").scrollIntoView({block:"center",inline:"center",behavior:"instant"})',cc)
        c=await center(page,f'#eColors .sw[data-c="{cc}"]');await page.touchscreen.tap(c[0],c[1]);await page.wait_for_timeout(30)
        if await page.evaluate('ed.c')!=cc: bad.append(cc)
    chk('all %d colours selectable'%len(cols),not bad,bad)
    # fill board until full by tapping the same column
    await page.evaluate('setPieces([]);ed.hist=[];drawEditorBoard()');await tapsel(page,'b8')
    c=await boardpt(page,7,2)
    for i in range(14):
        c=await boardpt(page,7,1.5+3*i);await page.touchscreen.tap(*c);await page.wait_for_timeout(25)
    P_=await pcs(page);chk('column fills to top without overflow',not await page.evaluate(INV) and len(P_)==10,(len(P_),await page.evaluate(INV)))
    # random fuzz
    random.seed(7);ops=0
    await page.evaluate('setPieces([]);ed.hist=[];drawEditorBoard()')
    for it in range(250):
        r=random.random();ops+=1
        if r<.35:
            k=random.choice(shapes);await page.evaluate('(k)=>{ed.k=k;ed.rm=false}',k)
            c=await boardpt(page,random.uniform(-1,15),random.uniform(-2,32));await page.touchscreen.tap(*c)
        elif r<.55:
            n=len(await pcs(page))
            if n:
                c=await center(page,f'#eBoard .pc[data-i="{random.randrange(n)}"]');await page.touchscreen.tap(c[0],c[1])
                if await page.evaluate("!$('#arrows').classList.contains('hidden')"):
                    for _ in range(random.randint(1,6)):
                        await arrow(random.choice('LRUD'))
                    if random.random()<.3: await arrow(random.choice(['X','OK']))
        elif r<.7:
            n=len(await pcs(page))
            if n:
                a=await center(page,f'#eBoard .pc[data-i="{random.randrange(n)}"]');d=await boardpt(page,random.uniform(-2,16),random.uniform(-3,33))
                await drag(page,ctx,a[0],a[1],d[0],d[1],5,cdp)
        elif r<.8: await page.tap('#eUndo')
        elif r<.88:
            await page.tap('#eRm');n=len(await pcs(page))
            if n and await page.evaluate('ed.rm'):
                c=await center(page,f'#eBoard .pc[data-i="{random.randrange(n)}"]');await page.touchscreen.tap(c[0],c[1])
            if await page.evaluate('ed.rm'): await page.tap('#eRm')
        elif r<.9: await page.tap('#eClear')
        else:
            t=await center(page,'#eShapes .tile');d=await boardpt(page,random.uniform(0,14),random.uniform(0,20));await drag(page,ctx,t[0],t[1],d[0],d[1],5,cdp)
        inv=await page.evaluate(INV)
        if inv or errs: break
    chk('fuzz %d random ops: invariants hold, no errors'%ops,not inv and not errs,(inv,errs[:3]))
    errs.clear()
    # persistence across reload
    P_=await pcs(page);await page.reload();await page.wait_for_timeout(300)
    chk('free build persists across reload',await page.evaluate('JSON.parse(JSON.stringify(save.free))')==P_)
    print('TRAY-DRAG ERRORS:',errs_drag[:3],len(errs_drag))
    print('SUMMARY',vp,sys.argv[2],sum(1 for r in R if r[1]),'pass',sum(1 for r in R if not r[1]),'fail',[r[0] for r in R if not r[1]])
    await b.close()
if __name__=="__main__": asyncio.run(main())
