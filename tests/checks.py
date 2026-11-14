import asyncio,json
from h import *
async def main():
  async with async_playwright() as p:
    b,ctx,page,errs=await start(p,'iphone',BASE+'index.html')
    # #3 avance guardado con clave que ya no existe
    r=await page.evaluate("""()=>{const i=FIGS.findIndex(F=>F.id==='casa');const F=FIGS[i];
      save.prog[F.id]={v:5,fig:F.id,placed:2,extra:[],opened:0,order:['zz9','b2r'],score:0,streak:0,miniEnd:5};persist();openFig(i);
      return new Promise(r=>setTimeout(()=>r([document.querySelectorAll('#tray .tile').length,st.placed,st.order.join()]),600))}""")
    print('#3 stale key -> tiles,placed,order',r)
    r=await page.evaluate("""()=>{const i=FIGS.findIndex(F=>F.id==='casa');const F=FIGS[i];const k=key(F.steps[3]);
      const other=[...new Set(F.steps.map(key))].filter(x=>x!==k).slice(0,2);
      goModels();save.prog[F.id]={v:5,sig:sigOf(F),fig:F.id,placed:3,extra:[],opened:0,order:other,score:0,streak:0,miniEnd:9};persist();openFig(i);
      return new Promise(r=>setTimeout(()=>r([st.order.includes(k),document.querySelectorAll('#tray .tile').length]),600))}""")
    print('#3 missing next key -> fixed, tiles',r)
    # #7 win timer cancelado
    r=await page.evaluate("""()=>{goModels();const i=FIGS.findIndex(F=>F.id==='torre');openFig(i);
      return new Promise(res=>setTimeout(()=>{st.placed=fig().steps.length;celebrate();setTimeout(()=>{goModels();setTimeout(()=>res([screen,$('#win').classList.contains('show')]),3800)},300)},500))}""")
    print('#7 win after leaving -> screen, winShown',r)
    # #12 wrong reset
    r=await page.evaluate("()=>{wrong=3;const i=FIGS.findIndex(F=>F.id==='torre');openFig(i);return wrong}")
    print('#12 wrong after openFig',r)
    # #4 copia profunda
    r=await page.evaluate("""()=>{save.draft={id:null,pieces:[{k:'b2',c:'r',x:3,y:0}]};openEditor('papa');$('#sName').value='T';$('#sOk').click();
      edPieces()[0].x=9;return save.custom[save.custom.length-1].pieces[0].x}""")
    print('#4 saved x stays 3 ->',r)
    # #5 botones visibles en iPhone vertical
    await page.wait_for_timeout(300)
    r=await page.evaluate("()=>['eImport','eSave','eClear'].map(id=>{const e=document.getElementById(id).getBoundingClientRect();return [id,Math.round(e.right),innerWidth]})")
    print('#5 header right edges',r)
    await page.screenshot(path='fix_papa_iphone.png')
    # #6 restaurar copia con mezcla y copia vieja
    for f in ['bk_mix.json','bk_old.json']:
        await page.evaluate("()=>{show('home')}");await page.wait_for_timeout(200)
        await page.set_input_files('#pRestore',TESTS+f);await page.wait_for_timeout(500)
        r=await page.evaluate("()=>[$('#pMsg').textContent,document.querySelectorAll('#diffs .diff').length,Array.isArray(save.lvlOwned),save.mix.every(m=>COL[m.k])]")
        await page.evaluate("()=>openEditor('free')");await page.wait_for_timeout(300)
        print('#6',f,r)
    print('errors',errs);await b.close()
asyncio.run(main())
