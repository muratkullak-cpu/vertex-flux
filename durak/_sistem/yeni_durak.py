#!/usr/bin/env python3
"""Bir durak bilgisi JSON'undan yayına hazır klasör üretir.
Kullanım: python3 yeni_durak.py durak.json  ->  durak/<kod>/index.html + rehber.vcf
"""
import json, re, sys, html
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT_ROOT = HERE.parent

def fail(msg):
    sys.exit(f"HATA: {msg}")

def main(path):
    d = json.loads(Path(path).read_text(encoding="utf-8"))
    for k in ("kod", "ad", "telefon", "adres", "harita"):
        if not d.get(k):
            fail(f"'{k}' boş olamaz")
    if not re.fullmatch(r"[a-z0-9-]{3,40}", d["kod"]):
        fail("kod sadece küçük harf, rakam ve tire olmalı (örn. konyaalti-sahil)")
    digits = re.sub(r"\D", "", d["telefon"])
    if digits.startswith("0"):
        digits = "90" + digits[1:]
    if not re.fullmatch(r"90[2-5]\d{9}", digits):
        fail(f"telefon geçersiz: {d['telefon']} (örn. 0532 123 45 67)")
    wa = re.sub(r"\D", "", d.get("whatsapp") or digits)
    if wa.startswith("0"):
        wa = "90" + wa[1:]
    if not re.fullmatch(r"90\d{10}", wa):
        fail(f"whatsapp geçersiz: {d.get('whatsapp')}")
    if not d["harita"].startswith("https://"):
        fail("harita linki https:// ile başlamalı")
    bekleme = d.get("bekleme") or None
    if bekleme and not re.fullmatch(r"\d{1,2}(-\d{1,2})?", str(bekleme)):
        fail("bekleme '5-10' gibi olmalı ya da boş")
    saat = d.get("saat") or "24"
    if saat not in ("24", "gizli") and not re.fullmatch(r"\d{2}:\d{2}[–-]\d{2}:\d{2}", saat):
        fail("saat '24' ya da '08:00-02:00' gibi olmalı")

    gorunen = f"+90 {digits[2:5]} {digits[5:8]} {digits[8:10]} {digits[10:12]}"
    durak = {
        "ad": d["ad"], "telefon": "+" + digits, "telefonGorunen": gorunen, "whatsapp": wa,
        "adres": d["adres"], "harita": d["harita"], "saat": saat.replace("-", "–"),
        "bekleme": str(bekleme) if bekleme else None, "logo": d.get("logo") or None,
        "gorsel": d.get("gorsel") or None,
    }
    css = (HERE / "_css.txt").read_text(encoding="utf-8")
    body = (HERE / "_body.html").read_text(encoding="utf-8")
    js = json.dumps(durak, ensure_ascii=False).replace("</", "<\\/")
    head = ('<!doctype html><html lang="tr"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
            f'<title>{html.escape(d["ad"])} · Taksi</title><meta name="robots" content="noindex">'
            '<style>:root{box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style></head><body>\n')
    page = head + css + "\n" + body.replace("/*__DURAK__*/null", js)

    def vesc(s):
        return s.replace("\\", "\\\\").replace(",", "\\,").replace(";", "\\;").replace("\n", "\\n")
    vcf = ("BEGIN:VCARD\r\nVERSION:3.0\r\n"
           f"N:;{vesc(d['ad'])};;;\r\nFN:{vesc(d['ad'])}\r\nORG:{vesc(d['ad'])}\r\n"
           f"TEL;TYPE={'CELL' if digits[2]=='5' else 'WORK'},VOICE:+{digits}\r\n"
           + (f"TEL;TYPE=CELL,VOICE:+{wa}\r\n" if wa != digits else "") +
           f"ADR;TYPE=WORK:;;{vesc(d['adres'])};;;;\r\n"
           f"URL:{d['harita']}\r\nNOTE:Taksi · VERTEX\r\nEND:VCARD\r\n")

    out = OUT_ROOT / d["kod"]
    out.mkdir(parents=True, exist_ok=True)
    (out / "index.html").write_text(page, encoding="utf-8")
    (out / "rehber.vcf").write_text(vcf, encoding="utf-8")
    print(f"OK: {out}")

if __name__ == "__main__":
    main(sys.argv[1])
