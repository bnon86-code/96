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
const types = ["m4a", "mp3", "wav", "aac", "mp4", "ogg", "opus", "M4A", "MP3", "WAV"];
const found = {};
const player = new Audio();
player.preload = "auto";

const map = document.getElementById("map");
const info = document.getElementById("info");
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

// يجرب الامتدادات وحدة وحدة لين يلقى الملف
function playSound(r) {
  return new Promise(done => {
    const list = found[r.id] ? [found[r.id]] : types.slice();
    let i = 0;

    const next = () => {
      if (i >= list.length) { done(false); return; }
      const ext = list[i++];
      player.src = `audio/${r.file}.${ext}`;
      player.onplaying = () => {
        found[r.id] = ext;
        const v = document.getElementById("voice");
        if (v) { v.classList.add("on"); v.textContent = names[r.file] ? "بصوت أ. " + names[r.file] : "🔊"; }
      };
      player.play().catch(err => {
        if (err.name === "NotAllowedError") done(false);
      });
    };

    player.onended = () => done(true);
    player.onerror = next;
    next();
  });
}

function startCard() {
  info.className = "info start";
  info.innerHTML = `<h2>اضغطي على أي منطقة</h2><p>كل منطقة بنقشها وصوت من إدارة المدرسة</p>`;
}

function openArea(r) {
  player.pause();

  map.classList.add("picked");
  document.querySelectorAll(".area").forEach(a => a.classList.remove("now"));
  const el = document.getElementById("a-" + r.id);
  el.classList.add("now");
  el.parentNode.appendChild(el);

  info.className = "info";
  info.innerHTML = `
    <div class="strip"><svg viewBox="0 0 300 60" preserveAspectRatio="xMidYMid slice"><rect width="300" height="60" fill="url(#p-${r.id})"/></svg></div>
    <h2>${r.name}</h2>
    <div class="naqsh">${r.naqsh}</div>
    <div class="about">${r.about}</div>
    <div class="voice" id="voice"></div>`;

  return playSound(r).then(ok => {
    if (ok) return;
    const v = document.getElementById("voice");
    if (v && !v.classList.contains("on")) v.textContent = `ما لقيت ملف الصوت audio/${r.file}`;
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
  startCard();
}

document.getElementById("playAll").onclick = playAll;
document.getElementById("stop").onclick = stopAll;
document.getElementById("again").onclick = () => { stopAll(); clearMap(); };
document.getElementById("full").onclick = () => {
  if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
};

startCard();
