# -*- coding: utf-8 -*-
"""
Importa el catálogo de Treinta (catalogo.treinta.co/nicvaliamakeupstore)
y regenera productos.js + descarga las imágenes a images/catalogo/.

Uso:  python importar-catalogo.py
"""
import json, os, re, subprocess, sys, time, unicodedata, urllib.parse
import concurrent.futures

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

SLUG = "nicvaliamakeupstore"
STORE_ID = "27519eb3-8383-59b7-a104-75b4833acca4"
# Server action "getProductsAction" del catálogo de Treinta (Next.js).
# Si Treinta despliega una versión nueva, este ID puede cambiar: se saca del
# chunk JS que define createServerReference(..., "getProductsAction").
ACTION_ID = "406c948135b23515e58eb10e01221f370fcf3f2403"
BASE = f"https://catalogo.treinta.co/{SLUG}"
OUTDIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "images", "catalogo")
PRODUCTS_JS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "productos.js")

CATEGORIAS = [
    "Kit Maquillaje", "Bases", "Sombras", "Capilar", "Ramos Personalizados",
    "Cejas", "Bolsos", "Correctores", "Labios", "Skincare", "Delineadores",
    "Primer", "Peluches", "Corporal", "Contornos", "Fijador de maquillaje",
    "Brochas", "Iluminador", "Accesorios", "Rubores", "Polvos", "Pestañas",
]


def action(payload):
    """Invoca el server action de Next.js y devuelve el JSON de la línea '1:'."""
    r = subprocess.run(
        ["curl", "-s", BASE, "-X", "POST",
         "-H", f"Next-Action: {ACTION_ID}",
         "-H", "Content-Type: text/plain;charset=UTF-8",
         "-H", "User-Agent: Mozilla/5.0",
         "--data", json.dumps([payload])],
        capture_output=True, text=True, encoding="utf-8", errors="replace")
    for line in r.stdout.splitlines():
        if line.startswith("1:"):
            return json.loads(line[2:])
    return None


def descargar(p):
    url = p.get("imageUrl")
    if not url:
        return p["id"], None
    ext = url.rsplit(".", 1)[-1].lower()
    if ext not in ("jpeg", "jpg", "png", "webp"):
        ext = "jpeg"
    fname = p["id"] + "." + ext
    path = os.path.join(OUTDIR, fname)
    if os.path.exists(path) and os.path.getsize(path) > 1000:
        return p["id"], fname  # ya descargada
    proxy = ("https://imgproxy.treinta.co/sig/size:600:::/quality:80/plain/"
             + urllib.parse.quote(url, safe=""))
    subprocess.run(["curl", "-s", "-o", path, proxy], capture_output=True)
    if not (os.path.exists(path) and os.path.getsize(path) > 1000):
        subprocess.run(["curl", "-s", "-o", path, url], capture_output=True)
    ok = os.path.exists(path) and os.path.getsize(path) > 1000
    return p["id"], (fname if ok else None)


def norm(s):
    return unicodedata.normalize("NFKD", s.lower()).encode("ascii", "ignore").decode()


def main():
    os.makedirs(OUTDIR, exist_ok=True)

    print("Descargando lista completa…")
    res = action({"storeId": STORE_ID, "page": 1, "limit": 500})
    if not res or "data" not in res:
        sys.exit("ERROR: no se pudo leer el catálogo (¿cambió el ACTION_ID?)")
    prods = res["data"]
    print(f"  {len(prods)} productos")

    print("Mapeando categorías…")
    mapping = {}
    for cname in CATEGORIAS:
        r = action({"storeId": STORE_ID, "page": 1, "limit": 500, "category": cname})
        for p in (r["data"] if r else []):
            mapping[p["id"]] = cname
        time.sleep(0.2)
    print(f"  {len(mapping)} con categoría")

    print("Descargando imágenes (las nuevas)…")
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
        imgs = dict(ex.map(descargar, prods))
    print(f"  {sum(1 for v in imgs.values() if v)} imágenes")

    out = [{
        "id": p["id"],
        "nombre": p["name"].strip(),
        "precio": p["price"],
        "cat": mapping.get(p["id"], "Otros"),
        "img": (f"images/catalogo/{imgs[p['id']]}" if imgs.get(p["id"]) else None),
        "stock": max(0, p["stock"] or 0),
    } for p in prods]
    out.sort(key=lambda p: (0 if p["stock"] > 0 else 1, norm(p["nombre"])))

    with open(PRODUCTS_JS, "w", encoding="utf-8") as f:
        f.write("/* ============ NicValia Make up — catálogo (importado de catalogo.treinta.co) ============ */\n")
        f.write("window.NV_PRODUCTS = ")
        json.dump(out, f, ensure_ascii=False, indent=1)
        f.write(";\n")

    disp = sum(1 for p in out if p["stock"] > 0)
    print(f"Listo: productos.js regenerado — {len(out)} productos ({disp} disponibles)")


if __name__ == "__main__":
    main()
