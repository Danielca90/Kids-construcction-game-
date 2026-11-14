# Monedas: el botón ▶ nunca entra a un nivel sin pagar; al ganar se muestra el precio y se puede abrir
import asyncio
from h import *
async def main():
  async with async_playwright() as p:
    b,ctx,page,errs=await start(p,'iphone',ROOT);ok=True
    async def win_at(idx_expr,coins):
        await page.evaluate(f"()=>{{save.lvlOwned=[1];save.unlockAll=false;save.coins={coins};save.stars={{}};persist();goModels();openFig({idx_expr})}}");await page.wait_for_timeout(400)
        await page.evaluate("()=>{st.placed=fig().steps.length;celebrate()}");await page.wait_for_timeout(3700)
        return await page.evaluate("()=>[$('#win').classList.contains('show'),!$('#next').classList.contains('hidden'),$('#lockInfo').classList.contains('hidden')?'':$('#lockInfo').innerText.replace(/\\n/g,' | '),nextIdx()>=0?fig().lvl+'->'+FIGS[nextIdx()].lvl:'none']")
    last1="FIGS.map((F,i)=>[F,i]).filter(([F])=>!F.set&&!F.custom&&F.lvl===1).pop()[1]"
    r=await win_at(last1,0);print('último del nivel 1, sin monedas:',r)
    ok&=r[0] and not r[1] and 'cuesta' in r[2]
    first1="FIGS.findIndex(F=>!F.set&&!F.custom&&F.lvl===1)"
    r=await win_at(first1,0);print('primer modelo nivel 1:',r);ok&=r[1] and r[3]=='1->1'
    r=await win_at(last1,500);print('último del nivel 1, con monedas:',r);ok&=('Abrir' in r[2])
    await page.click('#winBuy');await page.wait_for_timeout(200);await page.click('#buyOk');await page.wait_for_timeout(300)
    r2=await page.evaluate("()=>[save.lvlOwned.includes(2),!$('#next').classList.contains('hidden'),$('#lockInfo').classList.contains('hidden'),FIGS[nextIdx()].lvl]")
    print('después de comprar:',r2);ok&=r2[0] and r2[1] and r2[2] and r2[3]==2
    print('errors',errs);print('SUMMARY coins','1 pass 0 fail []' if ok and not errs else '0 pass 1 fail [coins]')
    await b.close()
asyncio.run(main())
