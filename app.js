// اكتبي اسم الإدارية جنب كل منطقة
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

// الأصوات داخل مجلد audio باسم المنطقة مثل eastern.m4a
const types = ["m4a", "mp3", "wav"];
const sounds = {};

const map = document.getElementById("map");
const info = document.getElementById("info");
let sound = null;
let playingAll = false;

document.getElementById("defs").innerHTML = Object.values(naqshat).join("");

// رسم المناطق
regions.forEach(r => {
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("class", "area");
  g.id = "a-" + r.id;
  g.innerHTML = `<path d="${r.d}" fill="url(#p-${r.id})"></path>`;
  g.onclick = () => { stopAll(); openArea(r); };
  document.getElementById("shapes").appendChild(g);

  const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
  t.setAttribute("class", "name");
  t.setAttribute("x", r.lx);
  t.setAttribute("y", r.ly);
  t.setAttribute("font-size", r.size);
  t.textContent = r.name;
  document.getElementById("names").appendChild(t);
});

// ندور على ملف الصوت لكل منطقة
regions.forEach(async r => {
  for (const ext of types) {
    const src = `audio/${r.file}.${ext}`;
    try {
      const res = await fetch(src, { method: "HEAD" });
      if (res.ok) { sounds[r.id] = src; break; }
    } catch (e) {}
  }
});

function startCard() {
  info.className = "info start";
  info.innerHTML = `<h2>اضغطي على أي منطقة</h2><p>كل منطقة بنقشها وصوت من إدارة المدرسة</p>`;
}

function openArea(r) {
  if (sound) { sound.pause(); sound = null; }

  map.classList.add("picked");
  document.querySelectorAll(".area").forEach(a => a.classList.remove("now"));
  const el = document.getElementById("a-" + r.id);
  el.classList.add("now");
  el.parentNode.appendChild(el);

  const who = names[r.file];
  info.className = "info";
  info.innerHTML = `
    <div class="strip"><svg viewBox="0 0 300 60" preserveAspectRatio="xMidYMid slice"><rect width="300" height="60" fill="url(#p-${r.id})"/></svg></div>
    <h2>${r.name}</h2>
    <div class="naqsh">${r.naqsh}</div>
    <div class="about">${r.about}</div>
    ${sounds[r.id] && who ? `<div class="voice" id="voice">بصوت أ. ${who}</div>` : ""}`;

  return new Promise(done => {
    if (!sounds[r.id]) { setTimeout(done, 3000); return; }
    sound = new Audio(sounds[r.id]);
    sound.onended = done;
    sound.onerror = done;
    sound.play().then(() => {
      const v = document.getElementById("voice");
      if (v) v.classList.add("on");
    }).catch(done);
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
  if (sound) { sound.pause(); sound = null; }
  document.getElementById("playAll").classList.remove("hide");
  document.getElementById("stop").classList.add("hide");
}

function clearMap() {
  if (sound) { sound.pause(); sound = null; }
  map.classList.remove("picked");
  document.querySelectorAll(".area").forEach(a => a.classList.remove("now"));
  startCard();
}

document.getElementById("playAll").onclick = playAll;
document.getElementById("stop").onclick = stopAll;
document.getElementById("again").onclick = () => { stopAll(); clearMap(); };
document.getElementById("full").onclick = () => {
  if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
};

startCard();
