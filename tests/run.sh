#!/bin/bash
# Pruebas antes de publicar:   bash tests/run.sh          (rápidas: editor, recorridos, arreglos, 3D)
#                               bash tests/run.sh full     (además juega TODOS los modelos completos)
# Si algo falla, NO se publica.
cd "$(dirname "$0")/.." || exit 1
python3 src/build.py >/dev/null || { echo "❌ build falló"; exit 1; }
cd tests
fail=0
run(){ out=$("$@" 2>&1 | grep -v agent-proxy); line=$(echo "$out" | grep -E "SUMMARY|\"pass\"|3D" | tail -1)
  echo "• $* → ${line:-sin resumen}"; echo "$out" | grep -E "^FAIL|PAGEERROR|Traceback|Error:" | head -5
  if echo "$out" | grep -qE "^FAIL|PAGEERROR|Traceback|[0-9]+ pass [1-9][0-9]* fail|pass [0-9]+ fail [1-9]|\"fail\": [1-9]"; then fail=1; echo "   ↳ falla detectada aquí"; fi; }
for vp in ipad iphone; do
  run python3 ed2.py $vp index.html
  run python3 flow.py $vp
done
out=$(python3 checks.py 2>&1 | grep -v agent-proxy); echo "• checks.py"; echo "$out" | sed 's/^/    /'
echo "$out" | grep -q "errors \[\]" || fail=1
run python3 t3d.py iphone
run python3 coins.py
run python3 personajes.py
run python3 trazos.py
run python3 mundo.py
if [ "$1" = "full" ]; then run python3 play.py iphone; run python3 play.py ipad; fi
[ $fail = 0 ] && echo "✅ TODO BIEN — se puede publicar" || { echo "❌ HAY FALLAS — no publicar"; exit 1; }
