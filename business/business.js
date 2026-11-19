// PawConnect for business (EXPLORE6, 19 Nov 2026): a business's page from a computer.
// Sign in: this page asks the server for a 6-letter code; the owner types it in the app (Explore, Your business, Open on a computer); the page
// then gets its own 30-day session (kept in this browser only). Every change goes through the same server handlers as the app, which clean
// the data and republish the page. Photos go straight to PawConnect's media store with a short-lived write token. No other site is called.
"use strict";

// The live server; on this computer's own preview (localhost) `?api=` points at the demo stub instead (scripts/demo/functions_stub.js).
const API = (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && new URLSearchParams(location.search).get("api"))
  || "https://asia-southeast1-pawconnect-72d74.cloudfunctions.net/exploreWeb";
const KEY = "pc-biz-session";
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// ---- Language: the site's choice (pc-lang), else the browser's -------------------------------------------------------------------------
const ZH = (() => { try { const l = localStorage.getItem("pc-lang"); if (l) return l === "zh"; } catch (e) { /* private mode */ } return /^zh/i.test(navigator.language || ""); })();
document.documentElement.lang = ZH ? "zh-Hans" : "en";
const T = (en) => (ZH && ZHS[en]) || en;
const F = (en, ...a) => T(en).replace(/%(\d)\$@|%@/g, (m, n) => (n ? a[Number(n) - 1] : a.shift()));
const ZHS = {
  "For business": "商家版", "Run your PawConnect page from your computer": "在电脑上管理你的 PawConnect 页面",
  "Edit your menu and prices, add photos, post offers and see how pet owners find you. Everything you change shows in the app straight away.": "编辑价目表、添加照片、发布优惠，看看宠物主人怎样找到你。你的改动会立刻显示在应用里。",
  "Prices by size, with photos for every service": "按体型定价，每项服务都能配照片", "Your numbers for the last 30 days": "过去 30 天的数据",
  "No password: your phone lets this computer in": "无需密码：用手机让这台电脑登录", "Sign in with your phone": "用手机登录",
  "Open PawConnect on your phone": "在手机上打开 PawConnect", "Go to Explore, Your business, Open on a computer": "进入“探索”、“你的商家”、“在电脑上打开”",
  "Type this code": "输入这个代码", "Waiting for your phone": "正在等你的手机", "This code has expired.": "这个代码已过期。", "Get a new code": "换一个新代码",
  "Signed in": "已登录", "Opening your page…": "正在打开你的页面…", "Your code expires in %@": "代码将在 %@ 后过期",
  "Only a phone signed in to PawConnect can approve this code. This computer stays signed in for 30 days, or until you sign it out in the app.": "只有登录了 PawConnect 的手机才能批准这个代码。这台电脑会保持登录 30 天，或直到你在应用里让它退出。",
  "Don't run a business on PawConnect yet? Find it in Explore and tap Is this your business?": "还没在 PawConnect 上认领你的商家？在“探索”里找到它，点“这是你的商家吗？”",
  "Overview": "概览", "Menu": "价目表", "Photos": "照片", "Offers": "优惠", "Hours and details": "营业时间和详情", "Contacts": "联系方式", "Sign out": "退出登录",
  "Last 30 days": "过去 30 天", "Page views": "页面浏览", "Taps to contact": "联系点击", "Saves": "收藏", "Pets' posts": "宠物帖子", "vs the 30 days before": "对比前 30 天",
  "would go back": "会再去", "%@ owners": "%@ 位主人", "Page strength": "页面完整度", "Your page is complete": "你的页面已完整",
  "Complete pages show higher in Explore and get more messages.": "资料完整的页面在探索里排得更前，收到的消息也更多。",
  "Add %@ more photos": "再加 %@ 张照片", "Add at least 3 services with prices": "至少添加 3 项带价格的服务", "Add your opening hours": "添加营业时间",
  "Add WhatsApp or a phone number": "添加 WhatsApp 或电话", "Make a first-visit offer": "设一个首次优惠", "Say a little about your business": "简单介绍你的商家",
  "New from pet owners": "宠物主人的新动态", "Would come back": "会再来", "Wouldn't come back": "不会再来", "Shared what they paid": "分享了花费",
  "Visits are shared anonymously: you see what was paid and whether they'd come back, never who.": "体验是匿名分享的：你能看到花费和是否会再来，但看不到是谁。",
  "Nothing new yet. Pets' posts from your shop and shared visits show here.": "暂时没有新动态。宠物在你店里发的帖子和分享的体验会显示在这里。",
  "Team": "团队", "Owner": "店主", "Manager": "管理员", "Invite managers from the app: Your business, Team.": "在应用里邀请管理员：你的商家 → 团队。",
  "Recent changes": "最近修改", "on the website": "在网站上", "in the app": "在应用里",
  "Changed the menu": "修改了价目表", "Changed the offers": "修改了优惠", "Changed photos, hours or details": "修改了照片、营业时间或详情", "Changed the contacts": "修改了联系方式",
  "Changed the name": "修改了名称", "Changed the page": "修改了页面", "Joined the team": "加入了团队", "Left the team": "退出了团队", "Removed someone from the team": "从团队移除了一位成员",
  "Menu and prices": "价目表", "Tap a service to edit it. Photos sell a service best: before and after works well.": "点一项服务即可编辑。照片最能打动人：美容前后对比效果很好。",
  "Add a service": "添加服务", "Bring in your menu": "导入价目表", "Add-ons": "加购项", "Most booked": "最多人预约", "Ask": "询价",
  "No services yet. Add your first, or bring in your menu from your website.": "还没有服务。添加第一项，或从你的网站导入价目表。",
  "Service": "服务", "Name": "名称", "For example: Full groom": "例如：全套美容", "What's included": "包含内容", "For": "适用", "Dogs": "狗狗", "Cats": "猫咪", "Other pets": "其他宠物",
  "Different price by size": "不同体型不同价格", "Price": "价格", "Small": "小型", "Medium": "中型", "Large": "大型", "Extra large": "特大型",
  "Under 7 kg": "7 公斤以下", "7 to 15 kg": "7 至 15 公斤", "15 to 30 kg": "15 至 30 公斤", "Over 30 kg": "30 公斤以上",
  "Leave a size empty if you don't offer it.": "不提供的体型留空即可。", "Takes about (minutes)": "大约需要（分钟）", "Show \"Most booked\"": "显示“最多人预约”",
  "Add-on to another service": "作为其他服务的加购项", "Delete": "删除", "Cancel": "取消", "Save": "保存", "Done": "完成",
  "Add photos": "添加照片", "Drop photos here or click to choose": "把照片拖到这里，或点击选择", "Remove": "移除", "Make cover": "设为封面", "Cover": "封面",
  "Your first photo leads your page and earns the big card in Explore. Up to 20.": "第一张照片会放在页面最前面，也能让你在探索里显示大卡片。最多 20 张。",
  "New offer": "新优惠", "For example: 15% off your first groom": "例如：首次美容 85 折", "Details (optional)": "详情（可选）", "Ends on": "结束日期",
  "Post this offer": "发布优惠", "End this offer": "结束优惠", "No end date": "无结束日期", "Until %@": "截至 %@",
  "Offers show on your page and in Explore's Offers near you. One at a time works best.": "优惠会显示在你的页面和探索的“附近优惠”里。一次一个效果最好。",
  "About": "简介", "A few words about your business": "简单介绍一下你的商家", "Opening hours": "营业时间", "Copy Monday to every day": "把星期一的时间套用到每天",
  "Closed": "休息", "Open": "营业", "Notes (optional)": "备注（可选）", "For example: closed on public holidays": "例如：公共假期休息",
  "Good to know": "须知", "For example: vaccination card needed": "例如：需要疫苗卡", "Add": "添加", "The team on your page": "页面上的团队", "Role": "职位",
  "Pets you look after": "服务的宠物", "Rabbits": "兔子",
  "WhatsApp number": "WhatsApp 号码", "Phone number": "电话号码", "Website": "网站", "Booking page": "预约页面",
  "Pet owners see WhatsApp first: most people in Singapore and Malaysia message before they book.": "宠物主人会先看到 WhatsApp：新加坡和马来西亚的大多数人都会先发消息再预约。",
  "You have changes": "你有未保存的修改", "Discard": "放弃", "Saved. It's on your page now.": "已保存，页面已更新。", "Couldn't save. Please try again.": "未能保存，请重试。",
  "Uploading…": "正在上传…", "Couldn't upload that photo.": "未能上传这张照片。",
  "From your website": "从你的网站导入", "Your website, for example pawandglow.sg/prices": "你的网站，例如 pawandglow.sg/prices", "Read my website": "读取我的网站",
  "Reading your prices… This takes about 10 seconds.": "正在读取价格…大约需要 10 秒。", "We found %@ services. Tick what's right.": "找到 %@ 项服务。勾选正确的。",
  "Add %@ to my menu": "把 %@ 项加入价目表", "We can't read Instagram, Facebook or TikTok. Use your website.": "我们无法读取 Instagram、Facebook 或 TikTok，请使用你的网站。",
  "See your page": "查看你的页面", "Something went wrong. Please try again.": "出了点问题，请重试。", "Please sign in again.": "请重新登录。",
  "Switch theme": "切换主题", "Choose a business": "选择商家", "Signed out.": "已退出登录。", "minutes": "分钟", "%@ services": "%@ 项服务",
  "Sun": "周日", "Mon": "周一", "Tue": "周二", "Wed": "周三", "Thu": "周四", "Fri": "周五", "Sat": "周六",
  "Monday": "星期一", "Tuesday": "星期二", "Wednesday": "星期三", "Thursday": "星期四", "Friday": "星期五", "Saturday": "星期六", "Sunday": "星期日",
  "to": "至", "Calls": "电话", "From %@": "%@ 起", "just now": "刚刚", "%@ min ago": "%@ 分钟前", "%@ h ago": "%@ 小时前", "%@ days ago": "%@ 天前", "Read the menu from this page": "从这个页面读取价目表",
};

// ---- Server ----------------------------------------------------------------------------------------------------------------------------
const store = {
  get() { try { const s = JSON.parse(localStorage.getItem(KEY) || "null"); return s && s.expiresAt > Date.now() ? s : null; } catch (e) { return null; } },
  set(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* private mode: this tab only */ } memory = v; },
  clear() { try { localStorage.removeItem(KEY); } catch (e) { /* nothing kept */ } memory = null; },
};
let memory = store.get();

async function call(action, body = {}) {
  const headers = { "Content-Type": "application/json" };
  if (memory && memory.session) headers.Authorization = `Session ${memory.session}`;
  const res = await fetch(API, { method: "POST", headers, body: JSON.stringify({ action, ...body }) });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && data.signedOut) { store.clear(); showSignin(); throw new Error(T("Please sign in again.")); }
  if (!res.ok) throw new Error(data.error || T("Something went wrong. Please try again."));
  return data;
}

// ---- Toast -----------------------------------------------------------------------------------------------------------------------------
let toastTimer;
function toast(text, bad = false) {
  const el = $("#toast");
  el.textContent = text; el.classList.toggle("bad", bad); el.classList.add("on");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("on"), 2600);
}

// ---- Sign in ---------------------------------------------------------------------------------------------------------------------------
let pollTimer; let tickTimer; let link;
function showSignin() {
  $("#app").hidden = true; $("#signin").hidden = false; $("#me").hidden = true;
  startLink();
}
async function startLink() {
  clearInterval(pollTimer); clearInterval(tickTimer);
  const box = $("#codebox");
  box.innerHTML = `<div class="code" aria-hidden="true">${"<span class='skeleton'></span>".repeat(6)}</div>`;
  try {
    link = await call("start");
  } catch (e) { box.innerHTML = `<p>${esc(e.message)}</p><p><button class="btn small" id="retry">${T("Get a new code")}</button></p>`; $("#retry").onclick = startLink; return; }
  const letters = link.code.split("").map((c) => `<span>${esc(c)}</span>`).join("");
  box.innerHTML = `<div class="code" aria-label="${esc(link.code.split("").join(" "))}" role="img">${letters}</div>
    <div class="timer"><svg viewBox="0 0 24 24" aria-hidden="true"><circle class="track" cx="12" cy="12" r="10"/><circle class="run" id="run" cx="12" cy="12" r="10" stroke-dasharray="62.8" stroke-dashoffset="0"/></svg>
    <span id="left"></span><span class="waiting" aria-hidden="true"><i></i><i></i><i></i></span></div>
    <p class="sr" aria-live="polite">${T("Waiting for your phone")}</p>`;
  const total = link.expiresAt - Date.now();
  const tick = () => {
    const left = Math.max(0, link.expiresAt - Date.now());
    const m = Math.floor(left / 60000); const s = Math.floor((left % 60000) / 1000);
    $("#left").textContent = F("Your code expires in %@", `${m}:${String(s).padStart(2, "0")}`);
    $("#run").style.strokeDashoffset = String(62.8 * (1 - left / total));
    if (left <= 0) expired();
  };
  tick(); tickTimer = setInterval(tick, 1000);
  pollTimer = setInterval(poll, 2500);
}
function expired() {
  clearInterval(pollTimer); clearInterval(tickTimer);
  $("#codebox").innerHTML = `<p style="margin:22px 0 14px;font-weight:700">${T("This code has expired.")}</p><button class="btn small" id="again">${T("Get a new code")}</button>`;
  $("#again").onclick = startLink;
}
async function poll() {
  if (!link || document.hidden) return;
  try {
    const r = await call("poll", { linkId: link.linkId, secret: link.secret });
    if (r.state === "approved") {
      clearInterval(pollTimer); clearInterval(tickTimer);
      store.set({ session: r.session, expiresAt: r.expiresAt });
      $("#codebox").innerHTML = `<div class="success"><div class="tick"><svg viewBox="0 0 24 24" width="38" height="38"><path d="M5.5 12.5l4.2 4.2 8.8-9.4" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <b>${T("Signed in")}</b><p>${T("Opening your page…")}</p></div>`;
      setTimeout(boot, 900);
    } else if (r.state === "expired") expired();
  } catch (e) { /* the next poll tries again */ }
}

// ---- App -------------------------------------------------------------------------------------------------------------------------------
const S = { businesses: [], id: null, data: null, view: "overview", draft: null, me: null };
const NAV = [["overview", "Overview", "M3 12l9-8 9 8v8a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"], ["menu", "Menu", "M4 6h16M4 12h16M4 18h10"],
  ["photos", "Photos", "M4 6h16v12H4zM8 13l3-3 5 5M15 10h.01"], ["offers", "Offers", "M4 10h16v10H4zM3 6h18v4H3zM12 6v14M12 6c-2-4-6-3-5 0M12 6c2-4 6-3 5 0"],
  ["details", "Hours and details", "M12 7v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z"], ["contacts", "Contacts", "M4 5h16v11H8l-4 4z"]];

async function boot() {
  try {
    const r = await call("businesses");
    S.businesses = r.businesses || []; S.me = r.me || {};
    if (!S.businesses.length) { store.clear(); toast(T("Don't run a business on PawConnect yet? Find it in Explore and tap Is this your business?"), true); showSignin(); return; }
    let last = null; try { last = localStorage.getItem("pc-biz-last"); } catch (e) { /* none */ }
    S.id = (S.businesses.find((b) => b.id === last) || S.businesses[0]).id;
    // "/business/#menu", "#photos", "#offers", "#details", "#contacts", or "#menu/<service id>" opens that service's editor.
    const [view, item] = location.hash.slice(1).split("/");
    if (NAV.some(([id]) => id === view)) { S.view = view; S.openItem = item || null; }
    $("#signin").hidden = true; $("#app").hidden = false; $("#me").hidden = false;
    $("#me").innerHTML = `<span class="avatar">${S.me.photoURL ? `<img src="${esc(S.me.photoURL)}" alt="">` : esc((S.me.name || "?").slice(0, 1))}</span><span>${esc(S.me.name || "")}</span>
      <button class="pill" id="signout">${T("Sign out")}</button>`;
    $("#signout").onclick = signOut;
    await load();
  } catch (e) { if (memory) toast(e.message, true); }
}
async function load() {
  $("#main").innerHTML = `<div class="grid cols-4">${"<div class='skeleton' style='height:140px'></div>".repeat(4)}</div><div class="skeleton" style="height:320px;margin-top:16px"></div>`;
  const r = await call("get", { providerId: S.id });
  S.data = r; S.draft = null;
  try { localStorage.setItem("pc-biz-last", S.id); } catch (e) { /* none */ }
  side(); render();
}
async function signOut() { try { await call("signOut"); } catch (e) { /* signed out anyway */ } store.clear(); toast(T("Signed out.")); showSignin(); }

function side() {
  const p = S.data.provider; const b = S.businesses.find((x) => x.id === S.id) || {};
  const photo = (p.profile.photos || [])[0] || p.postPhoto;
  const switcher = S.businesses.length > 1 ? `<label class="sr" for="bizpick">${T("Choose a business")}</label><select id="bizpick">${S.businesses.map((x) => `<option value="${esc(x.id)}" ${x.id === S.id ? "selected" : ""}>${esc(x.name)}</option>`).join("")}</select>` : "";
  $("#side").innerHTML = `<div class="biz"><div class="thumb">${photo ? `<img src="${esc(photo)}" alt="">` : "🐾"}</div><div style="min-width:0;flex:1"><b>${esc(p.name)}</b>
    <small>${esc([p.areaName, T(b.role === "manager" ? "Manager" : "Owner")].filter(Boolean).join(" · "))}</small>${switcher}</div></div>
    <nav class="nav" aria-label="${esc(p.name)}">${NAV.map(([id, label, d]) => `<button data-view="${id}" ${S.view === id ? 'aria-current="page"' : ""}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>${T(label)}
      ${id === "overview" && S.data.inbox && S.data.inbox.posts.length ? `<span class="count">${S.data.inbox.posts.length}</span>` : ""}</button>`).join("")}</nav>`;
  $("#side").querySelectorAll("[data-view]").forEach((btn) => btn.onclick = () => go(btn.dataset.view));
  const pick = $("#bizpick"); if (pick) pick.onchange = () => { if (confirmLeave()) { S.id = pick.value; load(); } else pick.value = S.id; };
}
function go(view) { if (!confirmLeave()) return; S.view = view; S.draft = null; savebar(false); side(); render(); window.scrollTo({ top: 0, behavior: "smooth" }); }
function confirmLeave() { return !S.draft || window.confirm(T("You have changes") + ". " + T("Discard") + "?"); }

function render() {
  $("#main").oninput = null;
  const views = { overview, menu, photos, offers, details, contacts };
  $("#main").innerHTML = `<div class="view">${views[S.view]()}</div>`;
  const after = { overview: wireOverview, menu: wireMenu, photos: wirePhotos, offers: wireOffers, details: wireDetails, contacts: wireContacts }[S.view];
  after && after();
  history.replaceState(null, "", S.view === "overview" ? location.pathname + location.search : `#${S.view}`);
  if (S.openItem && S.view === "menu") { const s = S.data.provider.menu.find((x) => x.id === S.openItem); S.openItem = null; if (s) editService(s); }
}

// ---- Helpers ---------------------------------------------------------------------------------------------------------------------------
const cur = () => S.data.provider.currencyCode || "SGD";
const money = (minor, currency = cur()) => `${currency === "MYR" ? "RM" : "S$"}${(minor / 100) % 1 === 0 ? minor / 100 : (minor / 100).toFixed(2)}`;
const SIZES = [["S", "Small", "Under 7 kg"], ["M", "Medium", "7 to 15 kg"], ["L", "Large", "15 to 30 kg"], ["XL", "Extra large", "Over 30 kg"]];
const ago = (ms) => { if (!ms) return ""; const m = Math.round((Date.now() - ms) / 60000); if (m < 2) return T("just now"); if (m < 60) return F("%@ min ago", m); const h = Math.round(m / 60); if (h < 24) return F("%@ h ago", h); return F("%@ days ago", Math.round(h / 24)); };
const priceLine = (s) => { const a = s.prices.filter((p) => p.amountMinor != null).map((p) => p.amountMinor); if (!a.length) return T("Ask"); const lo = Math.min(...a); return s.prices.length > 1 ? F("From %@", money(lo)) : money(lo); };
function head(title, sub, actions = "") { return `<div class="head"><div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ""}</div><div class="actions">${actions}</div></div>`; }

async function save(patch, after) {
  const btn = $("#savebtn"); if (btn) btn.setAttribute("aria-busy", "true");
  try {
    await call("save", { providerId: S.id, patch });
    toast(T("Saved. It's on your page now."));
    S.draft = null; savebar(false);
    const r = await call("get", { providerId: S.id }); S.data = r; side(); render(); after && after();
  } catch (e) { toast(e.message || T("Couldn't save. Please try again."), true); }
  finally { if (btn) btn.removeAttribute("aria-busy"); }
}
function savebar(on, onSave) {
  const bar = $("#savebar"); bar.classList.toggle("on", on);
  if (on) { $("#savebtn").onclick = onSave; $("#discard").onclick = () => { S.draft = null; savebar(false); render(); }; }
}

/// A photo: scaled to 1600 px, JPEG, then straight to PawConnect's media store with a write token from the server.
async function upload(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas"); canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.85));
  const { token, url } = await call("uploadToken", { providerId: S.id });
  const res = await fetch(url, { method: "PUT", headers: { "Content-Type": "image/jpeg", "X-Upload-Token": token }, body: blob });
  if (!res.ok) throw new Error(T("Couldn't upload that photo."));
  return url;
}
function dropzone(el, onFiles) {
  const input = el.querySelector("input");
  el.addEventListener("click", (e) => { if (e.target !== input) input.click(); });
  el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); } });
  input.addEventListener("change", () => { onFiles([...input.files]); input.value = ""; });
  el.addEventListener("dragover", (e) => { e.preventDefault(); el.classList.add("over"); });
  el.addEventListener("dragleave", () => el.classList.remove("over"));
  el.addEventListener("drop", (e) => { e.preventDefault(); el.classList.remove("over"); onFiles([...e.dataTransfer.files].filter((f) => f.type.startsWith("image/"))); });
}

// ---- Overview --------------------------------------------------------------------------------------------------------------------------
function spark(daily) {
  const max = Math.max(1, ...daily); const w = 600; const h = 86; const step = w / (daily.length - 1 || 1);
  const pts = daily.map((v, i) => [i * step, h - 6 - (v / max) * (h - 12)]);
  const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="sparkfade" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ff7f6e" stop-opacity=".3"/><stop offset="1" stop-color="#ff7f6e" stop-opacity="0"/></linearGradient></defs>
    <path class="spark-fill" d="${d} L ${w} ${h} L 0 ${h} Z"/><path class="spark-line" pathLength="1000" d="${d}"/></svg>`;
}
const trend = (now, before) => { if (!before) return ""; const c = Math.round(((now - before) / before) * 100); return `<span class="trend ${c >= 0 ? "up" : "down"}">${c >= 0 ? "↑" : "↓"} ${Math.abs(c)}%</span>`; };
const TODO = { photos: (m) => F("Add %@ more photos", m.count || 1), menu: () => T("Add at least 3 services with prices"), hours: () => T("Add your opening hours"),
  contact: () => T("Add WhatsApp or a phone number"), offer: () => T("Make a first-visit offer"), about: () => T("Say a little about your business") };
const TODO_VIEW = { photos: "photos", menu: "menu", hours: "details", contact: "contacts", offer: "offers", about: "details" };
const CHANGE = { menu: "Changed the menu", offers: "Changed the offers", profile: "Changed photos, hours or details", channels: "Changed the contacts", name: "Changed the name",
  "team.joined": "Joined the team", "team.left": "Left the team", "team.removed": "Removed someone from the team" };

function overview() {
  const { stats: s, strength, inbox, team, changes, provider: p } = S.data;
  const rate = s.returnRate;
  const score = strength.score;
  return head(esc(p.name), T("Last 30 days")) + `
  <div class="grid cols-4">
    <div class="card stat hero-stat"><div><div class="label">${T("Page views")}</div><div class="value" data-count="${s.views}">0</div>${trend(s.views, s.viewsBefore)} <small style="color:var(--muted)">${T("vs the 30 days before")}</small></div>${spark(s.daily || [])}</div>
    <div class="card stat"><div class="label">${T("Taps to contact")}</div><div class="value" data-count="${s.contacts}">0</div>${trend(s.contacts, s.contactsBefore)}
      <div style="margin-top:8px;color:var(--muted);font-size:13px">${Object.entries(s.contactsByChannel || {}).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${esc(k === "whatsapp" ? "WhatsApp" : T(k === "phone" ? "Calls" : k === "website" ? "Website" : "Booking page"))} ${v}`).join(" · ")}</div></div>
    <div class="card stat"><div class="label">${T("Saves")}</div><div class="value" data-count="${s.saves}">0</div><div class="label" style="margin-top:12px">${T("Pets' posts")}</div><div class="value" style="font-size:26px" data-count="${s.visitCount || 0}">0</div></div>
  </div>
  <div class="grid cols-2" style="margin-top:16px">
    <div class="card"><div class="strength"><div class="ring"><svg viewBox="0 0 84 84"><circle class="track" cx="42" cy="42" r="36"/><circle class="run" id="ringrun" cx="42" cy="42" r="36" stroke-dasharray="226.2" stroke-dashoffset="226.2" data-score="${score}"/></svg><b data-count="${score}" data-suffix="%">0%</b></div>
      <div><h2>${score >= 100 ? T("Your page is complete") : T("Page strength")}</h2><p class="sub" style="margin:0">${T("Complete pages show higher in Explore and get more messages.")}</p></div></div>
      ${strength.missing.length ? `<ul class="todo">${strength.missing.map((m) => `<li><button data-go="${TODO_VIEW[m.key] || "details"}">${esc((TODO[m.key] || TODO.about)(m))}</button></li>`).join("")}</ul>` : ""}
      ${rate ? `<div style="margin-top:20px"><div style="display:flex;justify-content:space-between;font-weight:800"><span>${rate.percent}% ${T("would go back")}</span><small style="color:var(--muted)">${F("%@ owners", rate.count)}</small></div><div class="bar"><i data-w="${rate.percent}"></i></div></div>` : ""}
    </div>
    <div class="card"><h2>${T("New from pet owners")}</h2><p class="sub">${T("Visits are shared anonymously: you see what was paid and whether they'd come back, never who.")}</p>
      ${inbox.posts.length ? `<div class="posts">${inbox.posts.map((x) => `<img src="${esc(x.imageURL)}" alt="${esc(x.petName || "")}" loading="lazy">`).join("")}</div>` : ""}
      <div class="rows">${inbox.visits.slice(0, 5).map((v) => `<div class="row"><div class="grow"><b>${T(v.wouldReturn === true ? "Would come back" : v.wouldReturn === false ? "Wouldn't come back" : "Shared what they paid")}</b>
        <small>${esc([v.serviceLabel && v.amountMinor != null ? `${v.serviceLabel} ${money(v.amountMinor, v.currencyCode)}` : null, ago(v.at)].filter(Boolean).join(" · "))}</small></div></div>`).join("")}</div>
      ${!inbox.posts.length && !inbox.visits.length ? `<p class="empty">${T("Nothing new yet. Pets' posts from your shop and shared visits show here.")}</p>` : ""}
    </div>
    <div class="card"><h2>${T("Team")}</h2><p class="sub">${T("Invite managers from the app: Your business, Team.")}</p><div class="rows">${team.map((m) => `<div class="row"><span class="avatar">${m.photoURL ? `<img src="${esc(m.photoURL)}" alt="">` : esc((m.name || "?").slice(0, 1))}</span><div class="grow"><b>${esc(m.name || (m.username ? "@" + m.username : ""))}</b><small>${T(m.role === "owner" ? "Owner" : "Manager")}</small></div></div>`).join("")}</div></div>
    <div class="card"><h2>${T("Recent changes")}</h2><div class="rows">${changes.length ? changes.slice(0, 6).map((c) => `<div class="row"><div class="grow"><b>${T(CHANGE[c.parts[0]] || "Changed the page")}</b><small>${esc([c.name, T(c.via === "web" ? "on the website" : "in the app"), ago(c.at)].filter(Boolean).join(" · "))}</small></div></div>`).join("") : `<p class="empty">—</p>`}</div></div>
  </div>`;
}
function countUp(el) {
  const target = Number(el.dataset.count) || 0; const suffix = el.dataset.suffix || ""; const start = performance.now(); const dur = 900;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const step = (t) => { const k = reduce ? 1 : Math.min(1, (t - start) / dur); const e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(target * e).toLocaleString() + suffix; if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
function wireOverview() {
  document.querySelectorAll("[data-count]").forEach(countUp);
  requestAnimationFrame(() => {
    const ring = $("#ringrun"); if (ring) ring.style.strokeDashoffset = String(226.2 * (1 - Math.min(100, Number(ring.dataset.score)) / 100));
    document.querySelectorAll(".bar i").forEach((i) => { i.style.width = i.dataset.w + "%"; });
  });
  document.querySelectorAll("[data-go]").forEach((b) => b.onclick = () => go(b.dataset.go));
}

// ---- Menu ------------------------------------------------------------------------------------------------------------------------------
function menu() {
  const list = S.data.provider.menu;
  const mains = list.filter((s) => !s.addOn); const adds = list.filter((s) => s.addOn);
  const row = (s) => `<div class="row click" tabindex="0" role="button" data-edit="${esc(s.id)}"><div class="thumb64">${(s.photos && s.photos[0]) || s.photoURL ? `<img src="${esc((s.photos && s.photos[0]) || s.photoURL)}" alt="" loading="lazy">` : "＋"}</div>
    <div class="grow"><b>${esc(s.name)}${s.popular ? `<span class="tag">${T("Most booked")}</span>` : ""}</b><small>${esc([s.description, s.durationMinutes ? `${s.durationMinutes} ${T("minutes")}` : null].filter(Boolean).join(" · "))}</small></div><span class="price">${esc(priceLine(s))}</span></div>`;
  return head(T("Menu and prices"), T("Tap a service to edit it. Photos sell a service best: before and after works well."),
    `<button class="btn small ghost" id="importbtn">${T("Bring in your menu")}</button><button class="btn small" id="addbtn">${T("Add a service")}</button>`) +
    `<div class="card">${list.length ? `<div class="rows">${mains.map(row).join("")}</div>${adds.length ? `<h2 style="margin:22px 0 4px;font-size:15px;color:var(--muted)">${T("Add-ons")}</h2><div class="rows">${adds.map(row).join("")}</div>` : ""}`
      : `<p class="empty">${T("No services yet. Add your first, or bring in your menu from your website.")}</p>`}</div>`;
}
function wireMenu() {
  document.querySelectorAll("[data-edit]").forEach((el) => { const open = () => editService(S.data.provider.menu.find((s) => s.id === el.dataset.edit)); el.onclick = open; el.onkeydown = (e) => { if (e.key === "Enter") open(); }; });
  $("#addbtn").onclick = () => editService(null);
  $("#importbtn").onclick = importMenu;
}
function editService(service) {
  const s = service ? JSON.parse(JSON.stringify(service)) : { id: "svc" + (Date.now() % 1e8), name: "", description: "", group: "dog", prices: [{ size: "any", amountMinor: null, kind: "exact" }], durationMinutes: 60, photos: [], addOn: false, popular: false, source: "owner" };
  s.photos = s.photos && s.photos.length ? s.photos : (s.photoURL ? [s.photoURL] : []);
  const bySize = s.prices.some((p) => p.size !== "any");
  const amt = (size) => { const p = s.prices.find((x) => x.size === size); return p && p.amountMinor != null ? p.amountMinor / 100 : ""; };
  const sym = cur() === "MYR" ? "RM" : "S$";
  const dlg = $("#drawer");
  dlg.innerHTML = `<form method="dialog"><header><h2>${esc(s.name || T("Add a service"))}</h2><button class="iconbtn" value="cancel" aria-label="${T("Cancel")}">✕</button></header><div class="body">
    <label class="field"><span>${T("Name")}</span><input class="input" name="name" required maxlength="80" placeholder="${T("For example: Full groom")}" value="${esc(s.name)}"></label>
    <label class="field"><span>${T("What's included")}</span><textarea class="input" name="description" maxlength="400">${esc(s.description || "")}</textarea></label>
    <div class="field"><span>${T("Photos")}</span><div class="thumbs" id="svcphotos"></div></div>
    <div class="field"><span>${T("For")}</span><div class="chips" id="group">${[["dog", "Dogs"], ["cat", "Cats"], ["other", "Other pets"]].map(([k, l]) => `<button type="button" class="chip" data-g="${k}" aria-pressed="${s.group === k}">${T(l)}</button>`).join("")}</div></div>
    <label class="check"><input type="checkbox" class="switch" id="bysize" ${bySize ? "checked" : ""}> ${T("Different price by size")}</label>
    <div id="pricebox"></div>
    <label class="field" style="margin-top:12px"><span>${T("Takes about (minutes)")}</span><input class="input" type="number" min="5" max="600" step="5" name="minutes" value="${s.durationMinutes || ""}"></label>
    <label class="check"><input type="checkbox" class="switch" name="popular" ${s.popular ? "checked" : ""}> ${T("Show \"Most booked\"")}</label>
    <label class="check"><input type="checkbox" class="switch" name="addOn" ${s.addOn ? "checked" : ""}> ${T("Add-on to another service")}</label>
  </div><footer>${service ? `<button type="button" class="btn small danger" id="delsvc">${T("Delete")}</button>` : "<span></span>"}<button class="btn small ghost" value="cancel">${T("Cancel")}</button><button type="button" class="btn small" id="savesvc">${T("Save")}</button></footer></form>`;
  const prices = () => {
    const on = $("#bysize").checked;
    $("#pricebox").innerHTML = on ? `<div class="sizes">${SIZES.map(([k, l, w]) => `<label class="field"><span>${T(l)}</span><div class="money" data-symbol="${sym}"><input class="input" inputmode="decimal" data-size="${k}" value="${amt(k)}"></div><small>${T(w)}</small></label>`).join("")}</div><small style="color:var(--muted)">${T("Leave a size empty if you don't offer it.")}</small>`
      : `<label class="field"><span>${T("Price")}</span><div class="money" data-symbol="${sym}"><input class="input" inputmode="decimal" data-size="any" value="${amt("any") || amt("S")}"></div></label>`;
  };
  const photos = () => {
    $("#svcphotos").innerHTML = s.photos.map((u, i) => `<div class="photo"><img src="${esc(u)}" alt=""><div class="tools"><button type="button" data-rm="${i}">${T("Remove")}</button></div></div>`).join("")
      + (s.photos.length < 6 ? `<div class="drop" tabindex="0" role="button" id="svcdrop">＋ ${T("Add photos")}<input type="file" accept="image/*" multiple></div>` : "");
    $("#svcphotos").querySelectorAll("[data-rm]").forEach((b) => b.onclick = () => { s.photos.splice(Number(b.dataset.rm), 1); photos(); });
    const drop = $("#svcdrop"); if (drop) dropzone(drop, async (files) => {
      for (const f of files.slice(0, 6 - s.photos.length)) {
        drop.innerHTML = `<div class="spinner"></div>`;
        try { s.photos.push(await upload(f)); } catch (e) { toast(e.message, true); }
      }
      photos();
    });
  };
  prices(); photos();
  $("#bysize").onchange = prices;
  dlg.querySelectorAll("[data-g]").forEach((b) => b.onclick = () => { s.group = b.dataset.g; dlg.querySelectorAll("[data-g]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); });
  $("#savesvc").onclick = () => {
    const f = dlg.querySelector("form");
    s.name = f.name.value.trim(); s.description = f.description.value.trim() || null; s.durationMinutes = Number(f.minutes.value) || null;
    s.popular = f.popular.checked; s.addOn = f.addOn.checked; s.photoURL = s.photos[0] || null;
    s.prices = [...dlg.querySelectorAll("[data-size]")].map((i) => ({ size: i.dataset.size, amountMinor: i.value.trim() ? Math.round(Number(i.value.replace(",", ".")) * 100) : null, kind: "exact" })).filter((p) => p.amountMinor > 0);
    if (!s.name || !s.prices.length) { toast(T("Name") + " · " + T("Price"), true); return; }
    const list = S.data.provider.menu.slice(); const at = list.findIndex((x) => x.id === s.id);
    if (at >= 0) list[at] = s; else list.push(s);
    dlg.close(); save({ menu: list });
  };
  const del = $("#delsvc"); if (del) del.onclick = () => { dlg.close(); save({ menu: S.data.provider.menu.filter((x) => x.id !== s.id) }); };
  dlg.showModal();
}
function importMenu() {
  const dlg = $("#drawer");
  const site = (S.data.provider.channels.find((c) => c.kind === "website") || {}).value || (S.data.provider.importedFrom || {}).url || "";
  dlg.innerHTML = `<form method="dialog"><header><h2>${T("Bring in your menu")}</h2><button class="iconbtn" value="cancel" aria-label="${T("Cancel")}">✕</button></header><div class="body" id="impbody">
    <label class="field"><span>${T("From your website")}</span><input class="input" id="impurl" placeholder="${T("Your website, for example pawandglow.sg/prices")}" value="${esc(site)}"><small>${T("We can't read Instagram, Facebook or TikTok. Use your website.")}</small></label>
    <button type="button" class="btn" id="impgo">${T("Read my website")}</button></div><footer><span></span><button class="btn small ghost" value="cancel">${T("Cancel")}</button></footer></form>`;
  $("#impgo").onclick = async () => {
    let url = $("#impurl").value.trim(); if (!url) return; if (!/^https?:/i.test(url)) url = "https://" + url;
    $("#impbody").insertAdjacentHTML("beforeend", `<div class="empty" id="impwait"><div class="spinner" style="margin:0 auto 12px"></div>${T("Reading your prices… This takes about 10 seconds.")}</div>`);
    $("#impgo").setAttribute("aria-busy", "true");
    try {
      const r = await call("import", { providerId: S.id, url });
      const found = r.services || []; const chosen = new Set(found.filter((x) => !x.needsCheck).map((x) => x.id));
      $("#impbody").innerHTML = `<p style="font-weight:800">${F("We found %@ services. Tick what's right.", found.length)}</p><div class="rows">${found.map((x) => `<label class="row check"><input type="checkbox" data-id="${esc(x.id)}" ${chosen.has(x.id) ? "checked" : ""}><span class="grow"><b>${esc(x.name)}</b></span><span class="price">${esc(priceLine(x))}</span></label>`).join("")}</div>`;
      dlg.querySelector("footer").innerHTML = `<span></span><button class="btn small ghost" value="cancel">${T("Cancel")}</button><button type="button" class="btn small" id="impadd">${F("Add %@ to my menu", chosen.size)}</button>`;
      const label = () => { $("#impadd").textContent = F("Add %@ to my menu", dlg.querySelectorAll("[data-id]:checked").length); };
      dlg.querySelectorAll("[data-id]").forEach((c) => c.onchange = label);
      $("#impadd").onclick = () => {
        const picked = found.filter((x) => dlg.querySelector(`[data-id="${CSS.escape(x.id)}"]`).checked).map((x) => ({ ...x, source: "owner", needsCheck: undefined }));
        const key = (n) => n.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
        const merged = S.data.provider.menu.filter((o) => !picked.some((p) => key(p.name) === key(o.name))).concat(picked);
        dlg.close(); save({ menu: merged });
      };
    } catch (e) { const w = $("#impwait"); if (w) w.remove(); toast(e.message, true); }
    finally { const g = $("#impgo"); if (g) g.removeAttribute("aria-busy"); }
  };
  dlg.showModal();
}

// ---- Photos ----------------------------------------------------------------------------------------------------------------------------
function photos() {
  const list = S.draft ? S.draft.photos : S.data.provider.profile.photos;
  return head(T("Photos"), T("Your first photo leads your page and earns the big card in Explore. Up to 20.")) +
    `<div class="photos">${list.map((u, i) => `<div class="photo"><img src="${esc(u)}" alt="" loading="lazy">${i === 0 ? `<span class="cover">${T("Cover")}</span>` : ""}
      <div class="tools">${i ? `<button data-cover="${i}">${T("Make cover")}</button>` : ""}<button data-rm="${i}">${T("Remove")}</button></div></div>`).join("")}
      ${list.length < 20 ? `<div class="drop" tabindex="0" role="button" id="pdrop"><div>＋<br>${T("Drop photos here or click to choose")}</div><input type="file" accept="image/*" multiple></div>` : ""}</div>`;
}
function wirePhotos() {
  const list = () => (S.draft ? S.draft.photos : S.data.provider.profile.photos.slice());
  const change = (next) => { S.draft = { photos: next }; render(); savebar(true, () => save({ profile: { ...S.data.provider.profile, photos: S.draft.photos } })); };
  document.querySelectorAll("[data-rm]").forEach((b) => b.onclick = () => { const l = list(); l.splice(Number(b.dataset.rm), 1); change(l); });
  document.querySelectorAll("[data-cover]").forEach((b) => b.onclick = () => { const l = list(); const [x] = l.splice(Number(b.dataset.cover), 1); l.unshift(x); change(l); });
  const drop = $("#pdrop"); if (drop) dropzone(drop, async (files) => {
    const l = list(); drop.innerHTML = `<div class="spinner"></div><span class="sr">${T("Uploading…")}</span>`;
    for (const f of files.slice(0, 20 - l.length)) { try { l.push(await upload(f)); } catch (e) { toast(e.message, true); } }
    change(l);
  });
}

// ---- Offers ----------------------------------------------------------------------------------------------------------------------------
function offers() {
  const list = S.data.provider.offers;
  const end = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
  return head(T("Offers"), T("Offers show on your page and in Explore's Offers near you. One at a time works best.")) + `<div class="grid cols-2">
    <div class="card"><h2>${T("New offer")}</h2><p class="sub"></p>
      <label class="field"><span>${T("Name")}</span><input class="input" id="otitle" maxlength="60" placeholder="${T("For example: 15% off your first groom")}"></label>
      <label class="field"><span>${T("Details (optional)")}</span><input class="input" id="odetail" maxlength="160"></label>
      <label class="field"><span>${T("Ends on")}</span><input class="input" type="date" id="oend" value="${end}" min="${new Date().toISOString().slice(0, 10)}"></label>
      <button class="btn" id="opost">${T("Post this offer")}</button></div>
    <div class="card"><div class="rows">${list.length ? list.map((o) => `<div class="row"><div class="grow"><b>${esc(o.title)}</b><small>${esc([o.detail, o.endsAt ? F("Until %@", new Date(o.endsAt).toLocaleDateString(ZH ? "zh-CN" : "en-SG", { day: "numeric", month: "short" })) : T("No end date")].filter(Boolean).join(" · "))}</small></div>
      <button class="btn small danger" data-end="${esc(o.id)}">${T("End this offer")}</button></div>`).join("") : `<p class="empty">—</p>`}</div></div></div>`;
}
function wireOffers() {
  $("#opost").onclick = () => {
    const title = $("#otitle").value.trim(); if (!title) { $("#otitle").focus(); return; }
    const endsAt = $("#oend").value ? new Date($("#oend").value + "T23:59:00").getTime() : null;
    save({ offers: [{ id: "off" + (Date.now() % 1e8), title, detail: $("#odetail").value.trim() || null, endsAt }, ...S.data.provider.offers] });
  };
  document.querySelectorAll("[data-end]").forEach((b) => b.onclick = () => save({ offers: S.data.provider.offers.filter((o) => o.id !== b.dataset.end) }));
}

// ---- Hours and details -----------------------------------------------------------------------------------------------------------------
const DAYS = [[1, "Monday"], [2, "Tuesday"], [3, "Wednesday"], [4, "Thursday"], [5, "Friday"], [6, "Saturday"], [0, "Sunday"]];
function details() {
  const p = S.draft ? S.draft.profile : S.data.provider.profile;
  const h = (d) => p.hours.find((x) => x.day === d);
  return head(T("Hours and details")) + `<div class="grid" style="max-width:760px">
    <div class="card"><h2>${T("Opening hours")}</h2><p class="sub"></p><div class="hours">${DAYS.map(([d, name]) => { const x = h(d); const open = x && !x.closed;
      return `<div class="hour ${open ? "" : "closed"}" data-day="${d}"><b>${T(name)}</b><input type="checkbox" class="switch" aria-label="${T(name)} ${T("Open")}" ${open ? "checked" : ""}>
        <div class="times"><input class="input" type="time" value="${(x && x.open) || "10:00"}" aria-label="${T(name)}"> ${T("to")} <input class="input" type="time" value="${(x && x.close) || "19:00"}" aria-label="${T(name)}"></div></div>`; }).join("")}</div>
      <button class="link" id="copymon">${T("Copy Monday to every day")}</button>
      <label class="field" style="margin-top:10px"><span>${T("Notes (optional)")}</span><input class="input" id="hnote" placeholder="${T("For example: closed on public holidays")}" value="${esc(p.hoursText || "")}"></label></div>
    <div class="card"><label class="field"><span>${T("About")}</span><textarea class="input" id="about" maxlength="600" placeholder="${T("A few words about your business")}">${esc(p.about || "")}</textarea></label>
      <div class="field"><span>${T("Pets you look after")}</span><div class="chips">${[["dog", "Dogs"], ["cat", "Cats"], ["rabbit", "Rabbits"], ["other", "Other pets"]].map(([k, l]) => `<button type="button" class="chip" data-sp="${k}" aria-pressed="${p.species.includes(k)}">${T(l)}</button>`).join("")}</div></div>
      <div class="field"><span>${T("Good to know")}</span><div class="list-edit" id="pols">${p.policies.map((x, i) => `<div class="item"><input class="input" data-pol="${i}" value="${esc(x)}"><button type="button" class="pill" data-delpol="${i}">${T("Remove")}</button></div>`).join("")}</div>
        <div class="item" style="display:flex;gap:8px"><input class="input" id="newpol" placeholder="${T("For example: vaccination card needed")}"><button type="button" class="pill" id="addpol">${T("Add")}</button></div></div>
      <div class="field"><span>${T("The team on your page")}</span><div class="list-edit">${p.team.map((m, i) => `<div class="item"><input class="input" data-tn="${i}" value="${esc(m.name)}" aria-label="${T("Name")}"><input class="input" data-tr="${i}" value="${esc(m.role || "")}" aria-label="${T("Role")}" placeholder="${T("Role")}"><button type="button" class="pill" data-delteam="${i}">${T("Remove")}</button></div>`).join("")}</div>
        <div class="item" style="display:flex;gap:8px"><input class="input" id="newtn" placeholder="${T("Name")}"><input class="input" id="newtr" placeholder="${T("Role")}"><button type="button" class="pill" id="addteam">${T("Add")}</button></div></div>
    </div></div>`;
}
function wireDetails() {
  const base = () => JSON.parse(JSON.stringify(S.draft ? S.draft.profile : S.data.provider.profile));
  const read = () => {
    const p = base();
    p.hours = DAYS.map(([d]) => { const el = document.querySelector(`[data-day="${d}"]`); const [a, b] = el.querySelectorAll("input[type=time]");
      return el.querySelector(".switch").checked ? { day: d, open: a.value, close: b.value } : { day: d, closed: true }; });
    p.hoursText = $("#hnote").value.trim() || null; p.about = $("#about").value.trim() || null;
    p.policies = [...document.querySelectorAll("[data-pol]")].map((i) => i.value.trim()).filter(Boolean);
    p.team = [...document.querySelectorAll("[data-tn]")].map((i) => ({ name: i.value.trim(), role: document.querySelector(`[data-tr="${i.dataset.tn}"]`).value.trim() || null })).filter((m) => m.name);
    p.species = [...document.querySelectorAll("[data-sp][aria-pressed=true]")].map((b) => b.dataset.sp);
    return p;
  };
  const dirty = (rerender) => { S.draft = { profile: read() }; if (rerender) render(); savebar(true, () => save({ profile: S.draft.profile })); };
  $("#main").oninput = () => dirty(false);
  document.querySelectorAll(".hour .switch").forEach((s) => s.onchange = () => { s.closest(".hour").classList.toggle("closed", !s.checked); dirty(false); });
  document.querySelectorAll("[data-sp]").forEach((b) => b.onclick = () => { b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true")); dirty(false); });
  $("#copymon").onclick = () => { const p = read(); const mon = p.hours.find((x) => x.day === 1); p.hours = p.hours.map((x) => ({ ...mon, day: x.day })); S.draft = { profile: p }; render(); savebar(true, () => save({ profile: S.draft.profile })); };
  $("#addpol").onclick = () => { const v = $("#newpol").value.trim(); if (!v) return; const p = read(); p.policies.push(v); S.draft = { profile: p }; render(); savebar(true, () => save({ profile: S.draft.profile })); };
  document.querySelectorAll("[data-delpol]").forEach((b) => b.onclick = () => { const p = read(); p.policies.splice(Number(b.dataset.delpol), 1); S.draft = { profile: p }; render(); savebar(true, () => save({ profile: S.draft.profile })); });
  $("#addteam").onclick = () => { const n = $("#newtn").value.trim(); if (!n) return; const p = read(); p.team.push({ name: n, role: $("#newtr").value.trim() || null }); S.draft = { profile: p }; render(); savebar(true, () => save({ profile: S.draft.profile })); };
  document.querySelectorAll("[data-delteam]").forEach((b) => b.onclick = () => { const p = read(); p.team.splice(Number(b.dataset.delteam), 1); S.draft = { profile: p }; render(); savebar(true, () => save({ profile: S.draft.profile })); });
  if (S.draft) savebar(true, () => save({ profile: S.draft.profile }));
}

// ---- Contacts --------------------------------------------------------------------------------------------------------------------------
function contacts() {
  const c = (k) => (S.data.provider.channels.find((x) => x.kind === k) || {}).value || "";
  const f = (k, label, type, mode) => `<label class="field"><span>${T(label)}</span><input class="input" data-ch="${k}" type="${type}" inputmode="${mode}" value="${esc(c(k))}"></label>`;
  return head(T("Contacts"), T("Pet owners see WhatsApp first: most people in Singapore and Malaysia message before they book.")) +
    `<div class="card" style="max-width:640px">${f("whatsapp", "WhatsApp number", "tel", "tel")}${f("phone", "Phone number", "tel", "tel")}${f("website", "Website", "url", "url")}${f("booking", "Booking page", "url", "url")}</div>`;
}
function wireContacts() {
  $("#main").oninput = () => {
    const list = [...document.querySelectorAll("[data-ch]")].filter((i) => i.value.trim()).map((i) => {
      let v = i.value.trim(); if ((i.dataset.ch === "website" || i.dataset.ch === "booking") && !/^https?:/i.test(v)) v = "https://" + v;
      return { kind: i.dataset.ch, value: v, verified: true, preferred: i.dataset.ch === "whatsapp" };
    });
    S.draft = { channels: list }; savebar(true, () => save({ channels: S.draft.channels }));
  };
}

// ---- Start -----------------------------------------------------------------------------------------------------------------------------
document.querySelectorAll("[data-t]").forEach((el) => { el.textContent = T(el.dataset.t); });
document.querySelectorAll("[data-tp]").forEach((el) => { el.setAttribute("placeholder", T(el.dataset.tp)); });
$("#discard").textContent = T("Discard"); $("#savebtn").textContent = T("Save"); $("#savetext").textContent = T("You have changes");
$("#theme").setAttribute("aria-label", T("Switch theme"));
$("#theme").onclick = () => {
  const dark = document.documentElement.getAttribute("data-theme") === "dark" || (!document.documentElement.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
  const next = dark ? "light" : "dark"; document.documentElement.setAttribute("data-theme", next); try { localStorage.setItem("pc-theme", next); } catch (e) { /* none */ }
};
addEventListener("scroll", () => $(".top").classList.toggle("scrolled", scrollY > 4), { passive: true });
addEventListener("beforeunload", (e) => { if (S.draft) { e.preventDefault(); e.returnValue = ""; } });
document.addEventListener("visibilitychange", () => { if (!document.hidden && link && !memory) poll(); });
if (memory) boot(); else showSignin();
