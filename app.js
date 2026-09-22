// اكتبي اسم صاحبة الصوت جنب كل منطقة (اختياري)
const names = {
  riyadh: "",
  makkah: "",
  madinah: "",
  qassim: "",
  hail: "",
  jouf: "",
  "northern-borders": "",
  tabuk: "",
  baha: "",
  asir: "",
  jazan: "",
  najran: "",
  eastern: ""
};

const SVG = "http://www.w3.org/2000/svg";
const DEPTH = 14;   // سماكة الخريطة
const LIFT = 22;    // ارتفاع المنطقة لما تنضغط

const map = document.getElementById("map");
const info = document.getElementById("info");
const player = new Audio();
player.preload = "auto";
let playingAll = false;

// تحويل الأصوات المدمجة لروابط يقدر المتصفح يشغلها
const urls = {};
Object.keys(sounds).forEach(k => {
  const bin = atob(sounds[k]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  urls[k] = URL.createObjectURL(new Blob([bytes], { type: "audio/mpeg" }));
});

document.getElementById("defs").innerHTML =
  Object.values(naqshat).join("") +
  `<path id="whole" d="${regions.map(r => r.d).join(" ")}"></path>`;

// سماكة الخريطة: طبقات تحت بعض
const depth = document.getElementById("depth");
for (let i = DEPTH; i >= 1; i--) {
  const u = document.createElementNS(SVG, "use");
  u.setAttribute("href", "#whole");
  u.setAttribute("y", i);
  u.setAttribute("fill", i === DEPTH ? "#06291b" : (i % 2 ? "#0b4a30" : "#0d5436"));
  depth.appendChild(u);
}

// رسم المناطق
regions.forEach(r => {
  const g = document.createElementNS(SVG, "g");
  g.setAttribute("class", "area");
  g.id = "a-" + r.id;
  g.innerHTML = `<path d="${r.d}" fill="url(#p-${r.id})"></path>`;
  g.onclick = () => { stopAll(); openArea(r); };
  document.getElementById("shapes").appendChild(g);

  const t = document.createElementNS(SVG, "text");
  t.setAttribute("class", "name");
  t.id = "n-" + r.id;
  t.setAttribute("x", r.lx);
  t.setAttribute("y", r.ly);
  t.setAttribute("font-size", r.size);
  t.textContent = r.name;
  document.getElementById("names").appendChild(t);
});

// المنطقة المختارة ترتفع فوق الخريطة
function liftArea(r) {
  const up = document.getElementById("lifted");
  up.innerHTML = "";
  const g = document.createElementNS(SVG, "g");
  g.setAttribute("class", "rise");
  let html = "";
  for (let i = LIFT; i >= 1; i--) {
    html += `<path d="${r.d}" transform="translate(0 ${i})" fill="${i === LIFT ? "#06291b" : "#0e5a3a"}"></path>`;
  }
  html += `<path class="top" d="${r.d}" fill="url(#p-${r.id})"></path>`;
  html += `<text class="name" x="${r.lx}" y="${r.ly}" font-size="${r.size + 4}">${r.name}</text>`;
  g.innerHTML = html;
  g.onclick = () => { stopAll(); openArea(r); };
  up.appendChild(g);
}

function playSound(r) {
  return new Promise(done => {
    if (!urls[r.file]) { done(false); return; }
    player.src = urls[r.file];
    player.onended = () => done(true);
    player.onerror = () => done(false);
    player.play().catch(() => done(false));
  });
}

function startCard() {
  info.className = "info start";
  info.innerHTML = `<h2>اضغطي على أي منطقة</h2><p>كل منطقة بنسيجها وصوت من منسوبات المدرسة</p>`;
}

function openArea(r) {
  player.pause();
  map.classList.add("picked");
  document.querySelectorAll(".area").forEach(a => a.classList.remove("now"));
  document.getElementById("a-" + r.id).classList.add("now");
  liftArea(r);

  const who = names[r.file] ? "بصوت أ. " + names[r.file] : "";
  const count = r.file === "qassim" ? "مشاركتان" : "";

  info.className = "info";
  info.innerHTML = `
    <div class="strip"><svg viewBox="0 0 300 60" preserveAspectRatio="xMidYMid slice"><rect width="300" height="60" fill="url(#p-${r.id})"/></svg></div>
    <h2>${r.name}</h2>
    <div class="naqsh">${r.naqsh}</div>
    <div class="about">${r.about}</div>
    <div class="voice on" id="voice">🔊 ${[who, count].filter(Boolean).join(" · ")}</div>`;

  return playSound(r).then(ok => {
    if (ok) return;
    return new Promise(w => setTimeout(w, 3000));
  });
}

async function playAll() {
  clearMap();
  playingAll = true;
  document.getElementById("playAll").classList.add("hide");
  document.getElementById("stop").classList.remove("hide");

  for (const r of regions) {
    if (!playingAll) break;
    await openArea(r);
    await new Promise(w => setTimeout(w, 800));
  }

  if (playingAll) {
    clearMap();
    info.className = "info start";
    info.innerHTML = `<h2>دام عزك يا وطن</h2>`;
  }
  stopAll();
}

function stopAll() {
  playingAll = false;
  player.pause();
  document.getElementById("playAll").classList.remove("hide");
  document.getElementById("stop").classList.add("hide");
}

function clearMap() {
  player.pause();
  map.classList.remove("picked");
  document.querySelectorAll(".area").forEach(a => a.classList.remove("now"));
  document.getElementById("lifted").innerHTML = "";
  startCard();
}

document.getElementById("playAll").onclick = playAll;
document.getElementById("stop").onclick = stopAll;
document.getElementById("again").onclick = () => { stopAll(); clearMap(); };
document.getElementById("full").onclick = () => {
  const d = document.documentElement;
  if (d.requestFullscreen) d.requestFullscreen();
  else if (d.webkitRequestFullscreen) d.webkitRequestFullscreen();
};

startCard();
