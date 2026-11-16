/* menu-tema3-journal — Journal 3 tarzı header menü.
   Ana nav: page.json (category bos veya yok, status play).
   Kategori dropdown: category.json SSOT → page.json menu fallback yok. */

html = html;

function t3jLang(val) {
  if (val == null) return "";
  if (typeof val === "object") {
    if (val[json.lang] != null) return val[json.lang];
    if (val.tr != null) return val.tr;
    var keys = Object.keys(val);
    return keys.length ? (val[keys[0]] || "") : "";
  }
  return String(val);
}

var backhtml = "";
var catHtml = "";
var mobileNavHtml = "";
var mobileCatHtml = "";

try {
  var pi;
  var pages = webmakerdata["page"].data || [];
  for (pi = 0; pi < pages.length; pi++) {
    var iterator = pages[pi];
    if (iterator.status !== "play") continue;
    if (iterator.category && iterator.category !== "") continue;

    var linkName = t3jLang(iterator.name);
    var linkHref = wxLangInternalHref(iterator.pathnext || iterator.path);
    var isActive = page.path == iterator.path;
    var activeNavClass = isActive ? ' class="t3jNavActive"' : "";
    var activeMobileClass = isActive ? ' class="t3jMobileActive"' : "";

    backhtml += "<a" + activeNavClass + ' href="' + linkHref + '">' + linkName + "</a>";
    mobileNavHtml += "<a" + activeMobileClass + ' href="' + linkHref + '">' + linkName + "</a>";
  }

  var catItems = [];
  var catBucket = webmakerdata.category && webmakerdata.category.data;
  if (catBucket && catBucket.length > 0) {
    catItems = catBucket;
  }

  var ci;
  for (ci = 0; ci < catItems.length; ci++) {
    var catRow = catItems[ci];
    if (catRow.status && catRow.status !== "play") continue;
    var catName = t3jLang(catRow.name);
    var catHref = wxLangInternalHref(catRow.pathnext || catRow.path);
    var catActive = page.path == catRow.path;
    var catActiveClass = catActive ? ' class="t3jNavActive"' : "";
    var catMobileActive = catActive ? ' class="t3jMobileActive"' : "";

    catHtml += "<a" + catActiveClass + ' href="' + catHref + '">' + catName + "</a>";
    mobileCatHtml += "<a" + catMobileActive + ' href="' + catHref + '">' + catName + "</a>";
  }

  var mobileHtml = mobileNavHtml;
  var catLabel = "";
  if (json.desing && json.desing.categoriesText) {
    if (typeof json.desing.categoriesText === "object") {
      catLabel = json.desing.categoriesText[json.lang] || json.desing.categoriesText.tr || "";
    } else {
      catLabel = json.desing.categoriesText;
    }
  }
  if (mobileCatHtml && catLabel) {
    mobileHtml += '<span class="t3jMobileCatLabel">' + catLabel + "</span>" + mobileCatHtml;
  } else if (mobileCatHtml) {
    mobileHtml += mobileCatHtml;
  }

  html = html.replace(new RegExp("\\{\\{html\\}\\}", "g"), backhtml);
  html = html.replace(new RegExp("\\{\\{categoryMenuHtml\\}\\}", "g"), catHtml);
  html = html.replace(new RegExp("\\{\\{mobileMenuHtml\\}\\}", "g"), mobileHtml);
} catch (error) {
  html = html.replace(new RegExp("\\{\\{html\\}\\}", "g"), "");
  html = html.replace(new RegExp("\\{\\{categoryMenuHtml\\}\\}", "g"), "");
  html = html.replace(new RegExp("\\{\\{mobileMenuHtml\\}\\}", "g"), "");
}
