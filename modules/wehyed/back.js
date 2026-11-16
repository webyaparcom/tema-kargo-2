/* kargo-desi-hesap — Kargo Desi Hesap — ölçü/ağırlık hesaplayıcı + bölge × desi ücret matrisi (16 Kas 2026 · mcp:webmaker/20261116-113510-tlwf · D17).
   Solda giriş ve vurgu zeminli hesaplayıcı: en · boy · yükseklik (cm) ve ağırlık (kg) → desi (÷ `bolen`, varsayılan 3000), ücretlendirilen = desi ile kg'ın büyüğü; bölge çipleri; canlı tahmini ücret ve döküm satırı. Sağda kayıtlardan (bölge: `fiyat` taban, `desiUcret` ek desi başı, `sure` teslim) üretilen bölge × desi kademesi ücret matrisi; hesaplanan bölge satırı ve desi sütunu vurgulanır. JS yokken matris tek başına okunur; fiyatsız (eski) veride bölge listesi.
   Üretici: scripts/modul-fabrika (aile module) — elle düzenleme yerine tanımı değiştirip yeniden üret.
   Veri: desing: ust · baslik · metin · img · img2 · cta_ad/cta_url · cta2_ad/cta2_url; data (maddeler): [{ ikon?, baslik, metin?, url? }] — metinler dil sözlüğü. */
const P = "modulex-kargo-desi-hesap";
const IMG_KOK = `/img/${json.id}/`;
/* --- ortak ön ek (scripts/modul-fabrika/on-ek.js) — dil · güvenlik · sayı yardımcıları --- */
const pick = (v) => {
  if (v == null) return "";
  if (typeof v !== "object") return String(v);
  if (typeof wmPickLang === "function") { try { return wmPickLang(v, json.lang) || ""; } catch (e) { /* alt satır */ } }
  return String(v[json.lang] ?? Object.values(v)[0] ?? "");
};
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const medyaUrl = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|file):/i.test(s)) return "";
  if (/^data:/i.test(s)) return /^data:(image|video|audio)\//i.test(s) ? s : "";
  if (s.startsWith("/") || /^https?:\/\//i.test(s)) return s;
  return `${IMG_KOK}${s}`;
};
const href = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|data):/i.test(s)) return "";
  if (/^(https?:)?\/\//i.test(s) || /^(mailto:|tel:|#)/i.test(s)) return s;
  return wxLangInternalHref(s);
};
const dogru = (v, d) => (v === undefined || v === null || v === "") ? d : !(v === false || v === "false" || v === 0 || v === "0");
const ikonAd = (v) => String(v ?? "").trim().replace(/[^a-z0-9_]/gi, "");
const satirlar = (s) => esc(s).replace(/\r?\n/g, "<br />");
/* ilk dolu alan: yeni ad önce, eski kuşak şablonun adı yedek (G6 yalnız path değiştirerek takas eder) */
const ilk = (o, ks) => {
  for (const k of ks) {
    const v = o == null ? undefined : o[k];
    if (v == null || v === "") continue;
    if (typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length) continue;
    return v;
  }
  return "";
};
const metinAl = (o, ks) => pick(ilk(o, ks)).trim();
const { desing: des = {} } = json;
const setting = webmakerdata?.setting ?? {};
const veri = Array.isArray(json.data) ? json.data : [];
const dil = String(json.lang || "");
const sayiBicim = (v, ondalik) => {
  try { return new Intl.NumberFormat(dil || undefined, { minimumFractionDigits: ondalik, maximumFractionDigits: ondalik }).format(v); } catch (e) { return String(v); }
};
const ikonH = (ad, sinif) => (ad ? `<span class="${sinif} material-symbols-outlined" aria-hidden="true">${ad}</span>` : "");
const no = (i) => String(i + 1).padStart(2, "0");
const ctaHtml = () => {
  const a1 = metinAl(des, ["cta_ad", "button"]); const u1 = href(ilk(des, ["cta_url", "buttonurl", "url"]));
  const a2 = metinAl(des, ["cta2_ad"]); const u2 = href(ilk(des, ["cta2_url"]));
  const d = (a, u, ek) => (a && u ? `<a class="${P}-dugme${ek}" href="${esc(u)}">${esc(a)}<span class="material-symbols-outlined mx-flip" aria-hidden="true">arrow_forward</span></a>` : "");
  const ic = d(a1, u1, "") + d(a2, u2, ` ${P}-dugme--ikincil`);
  return ic ? `<div class="${P}-cta">${ic}</div>` : "";
};
const basHtml = (B, ek) => {
  if (!B.ust && !B.baslik && !B.metin && !ek) return "";
  return `<header class="${P}-bas">`
    + (B.ust ? `<p class="${P}-ust">${esc(B.ust)}</p>` : "")
    + (B.baslik ? `<h2 class="${P}-baslik" id="${P}-{{id}}-b">${esc(B.baslik)}</h2>` : "")
    + (B.metin ? `<p class="${P}-metin">${satirlar(B.metin)}</p>` : "")
    + (ek || "")
    + "</header>";
};
/* --- aile: module --- */
const yeniMadde = veri.map((o) => ({
  ikon: ikonAd(ilk(o, ["ikon", "icon"])), baslik: metinAl(o, ["baslik", "name", "title"]),
  metin: metinAl(o, ["metin", "text", "description", "spot"]), url: href(ilk(o, ["url", "link"])),
})).filter((k) => k.baslik);
/* module-1 eski şeması: name2/spot2/icon2 … name4 → madde */
const eskiMadde = [2, 3, 4].map((n) => ({ ikon: ikonAd(des["icon" + n]), baslik: metinAl(des, ["name" + n]), metin: metinAl(des, ["spot" + n]), url: "" })).filter((k) => k.baslik);
const kayitlar = yeniMadde.length ? yeniMadde : eskiMadde;
const G1 = medyaUrl(ilk(des, ["img", "image"]));
const G2 = medyaUrl(ilk(des, ["img2", "image2"]));
const gH = (src, s, w, h) => (src ? `<img class="${P}-${s}" src="${esc(src)}" alt="" width="${w || 1200}" height="${h || 900}" loading="lazy" decoding="async" />` : "");
const ustH = (B) => (B.ust ? `<p class="${P}-ust">${esc(B.ust)}</p>` : "");
const basH = (B) => (B.baslik ? `<h2 class="${P}-baslik" id="${P}-{{id}}-b">${esc(B.baslik)}</h2>` : "");
const metH = (B) => (B.metin ? `<p class="${P}-metin">${satirlar(B.metin)}</p>` : "");
const listeH = (ic) => (ic ? `<ul class="${P}-maddeler" role="list">${ic}</ul>` : "");
const maddeVar = (k, i) => `<li class="${P}-madde">${ikonH(k.ikon || "check_circle", `${P}-mikon`)}<div class="${P}-myazi"><h3 class="${P}-mbaslik">${k.url ? `<a class="${P}-bag" href="${esc(k.url)}">${esc(k.baslik)}</a>` : esc(k.baslik)}</h3>${k.metin ? `<p class="${P}-mmetin">${satirlar(k.metin)}</p>` : ""}</div></li>`;
/* --- modül: kargo-desi-hesap --- */
const kart = () => "";
const sar = (ic, A, B) => {
    const R = yeniMadde.length ? veri.filter((o) => metinAl(o, ["baslik", "name", "title"])) : [];
    const x = (i, ks) => metinAl(R[i] || {}, ks);
    const sy = (i, ks) => {
      const v = ilk(R[i] || {}, ks);
      if (typeof v === "number") return v;
      let t = pick(v).replace(/[^\d.,]/g, "");
      t = /,\d{1,2}$/.test(t) ? t.replace(/\./g, "").replace(",", ".") : t.replace(/[.,](?=\d{3}(\D|$))/g, "").replace(",", ".");
      const n = t ? Number(t) : NaN;
      return Number.isFinite(n) ? n : NaN;
    };
    const PB = /^[A-Za-z]{3}$/.test(metinAl(des, ["paraBirimi"])) ? metinAl(des, ["paraBirimi"]).toUpperCase() : "";
    const para = (v) => { try { return new Intl.NumberFormat(dil || undefined, PB ? { style: "currency", currency: PB, maximumFractionDigits: v % 1 ? 2 : 0 } : { maximumFractionDigits: 2 }).format(v); } catch (e) { return String(v); } };
    const BOL = Math.max(1, Number(pick(des.bolen)) || 3000);
    const TAB = Math.max(0, Number(pick(des.tabanDesi)) || 0);
    let KD = (Array.isArray(des.kademeler) ? des.kademeler : String(pick(des.kademeler) || "").split(",")).map(Number).filter((n) => Number.isFinite(n) && n > 0);
    if (!KD.length) KD = [1, 5, 10, 20, 30];
    KD = [...new Set(KD)].sort((a, b) => a - b).slice(0, 8);
    const BA = metinAl(des, ["bolgeAd"]);
    const DA = metinAl(des, ["desiAd"]);
    const BL = A.map((k, i) => ({ k, i, f: sy(i, ["fiyat", "price", "taban"]), d: sy(i, ["desiUcret", "ekDesi", "desiFiyat"]), sure: x(i, ["sure", "teslim", "duration"]) }));
    const HF = BL.filter((b) => Number.isFinite(b.f));
    const ucret = (b, d) => b.f + Math.max(0, Math.ceil(d) - TAB) * (Number.isFinite(b.d) ? b.d : 0);
    const bas = (b) => `<span class="${P}-bad">${ikonH(b.k.ikon, `${P}-bikon`)}${esc(b.k.baslik)}</span>${b.k.metin ? `<span class="${P}-bkapsam">${satirlar(b.k.metin)}</span>` : ""}${b.sure ? `<span class="${P}-bsure"><span class="material-symbols-outlined" aria-hidden="true">schedule</span>${esc(b.sure)}</span>` : ""}`;
    const olc = [["en", "@width-cm@", "30", "1"], ["boy", "@depth-cm@", "20", "1"], ["yuk", "@height-cm@", "15", "1"], ["kg", "@weight-kg@", "2", "0.1"]];
    const hnot = metinAl(des, ["hesapNot"]);
    const hesap = HF.length ? `<form class="${P}-hesap" data-hesap hidden data-bolen="${BOL}" data-taban="${TAB}" data-para="${PB}" data-desi-ad="${esc(DA || "@calculated-volume@")}"><div class="${P}-olculer">${olc.map((o) => `<label class="${P}-olcu"><span class="${P}-oet">${o[1]}</span><input class="${P}-ogirdi" type="number" name="${o[0]}" min="0" step="${o[3]}" inputmode="decimal" value="${o[2]}" /></label>`).join("")}</div><fieldset class="${P}-bsec"><legend class="${P}-oet">${esc(BA || "@category@")}</legend>${HF.map((b, j) => `<label class="${P}-bcip"><input class="${P}-radyo" type="radio" name="bolge" value="${b.i}"${j === 0 ? " checked" : ""} data-f="${b.f}" data-d="${Number.isFinite(b.d) ? b.d : 0}" /><span>${esc(b.k.baslik)}</span></label>`).join("")}</fieldset><div class="${P}-sonuc"><p class="${P}-setiket">${esc(metinAl(des, ["sonucAd"]) || "@total@")}</p><p class="${P}-tutar" data-tutar aria-live="polite">—</p><p class="${P}-dokum" data-dokum></p>${hnot ? `<p class="${P}-hnot">${esc(hnot)}</p>` : ""}</div></form>` : "";
    const matris = HF.length ? `<div class="${P}-tkap"><table class="${P}-matris"${B.baslik ? ` aria-labelledby="${P}-{{id}}-b"` : ""}><thead><tr><th scope="col" class="${P}-kose">${esc(BA)}</th>${KD.map((d, j) => `<th scope="col" data-k="${j}" data-desi="${d}"><bdi>${sayiBicim(d, 0)}</bdi>${DA ? ` <span class="${P}-birim">${esc(DA)}</span>` : ""}</th>`).join("")}</tr></thead><tbody>${BL.map((b) => `<tr data-b="${b.i}"><th scope="row">${bas(b)}</th>${KD.map((d, j) => `<td data-k="${j}"><bdi>${Number.isFinite(b.f) ? esc(para(ucret(b, d))) : "—"}</bdi></td>`).join("")}</tr>`).join("")}</tbody></table></div>` : `<ul class="${P}-bolgeler" role="list">${BL.map((b) => `<li class="${P}-bolge">${bas(b)}</li>`).join("")}</ul>`;
    return `<div class="${P}-duzen"><div class="${P}-sol"><div class="${P}-giris">${ustH(B)}${basH(B)}${metH(B)}</div>${hesap}${ctaHtml()}</div>${matris}</div>`;
  };
const B = { ust: metinAl(des, ["ust","title","badge"]), baslik: metinAl(des, ["baslik","name"]), metin: metinAl(des, ["metin","description"]) };
/* veri yoksa gövde hiç kurulmaz (sarmalayıcı boş listeye dokunmaz) */
const BOS = !B.baslik && !B.metin;
const govde = BOS ? "" : sar(kayitlar.map((k, i) => kart(k, i, kayitlar.length, kayitlar)).join(""), kayitlar, B);
const bas = "";
const sinif = (bas || B.ust || B.baslik || B.metin ? "" : ` ${P}--bassiz`);
html = html
  .replaceAll("{{fbsinif}}", () => sinif)
  .replaceAll("{{fbetiket}}", () => (B.baslik ? `aria-labelledby="${P}-{{id}}-b"` : ""))
  .replaceAll("{{fbbas}}", () => bas)
  .replaceAll("{{fbgovde}}", () => govde);
if (BOS) html = "";
