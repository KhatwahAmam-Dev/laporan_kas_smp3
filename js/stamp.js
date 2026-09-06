// ===== STAMP CAM =====
let video = null, canvas = null, ctx = null;
let currentPos = null, currentAddress = 'Mencari lokasi...';
let currentWeather = null;
let isCamOn = false;
let currentStream = null;

function initStamp() {
  window.stampInit = true;
  video = document.getElementById('camera');
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  startClock();
  refreshLocation();
  renderGalleryStamp();
  updateCamUI();
}

function updateCamUI() {
  const btn = document.getElementById('camToggleBtn');
  const placeholder = document.getElementById('camOffPlaceholder');
  const vid = document.getElementById('camera');
  const shutter = document.getElementById('shutterBtn');
  const status = document.getElementById('camStatus');
  
  if (isCamOn) {
    if (btn) { btn.innerHTML = '<i class="fas fa-video-slash"></i> Kamera ON'; btn.style.background = '#ef4444'; btn.style.borderColor = '#ef4444'; }
    if (placeholder) placeholder.style.display = 'none';
    if (vid) vid.style.display = 'block';
    if (shutter) { shutter.style.opacity = '1'; shutter.style.pointerEvents = 'auto'; shutter.title = 'Ambil foto'; }
    if (status) status.innerHTML = '<i class="fas fa-circle" style="color:#10b981"></i> Kamera aktif — klik tombol untuk matikan & hemat baterai';
  } else {
    if (btn) { btn.innerHTML = '<i class="fas fa-video"></i> Kamera OFF'; btn.style.background = '#0f1a2f'; btn.style.borderColor = '#0f1a2f'; }
    if (placeholder) placeholder.style.display = 'block';
    if (vid) vid.style.display = 'none';
    if (shutter) { shutter.style.opacity = '.4'; shutter.style.pointerEvents = 'none'; shutter.title = 'Aktifkan kamera dulu'; }
    if (status) status.innerHTML = '<i class="fas fa-battery-three-quarters"></i> Mode hemat: kamera OFF — klik ON saat mau foto';
  }
}

async function startCam() {
  try {
    const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    currentStream = s;
    video.srcObject = s;
    isCamOn = true;
    window.isCamOn = true;
    updateCamUI();
    toast('Kamera ON');
  } catch(e) { toast('Kamera gagal: ' + e.message, 'error'); }
}

function stopCam() {
  try {
    if (currentStream) { currentStream.getTracks().forEach(t => t.stop()); currentStream = null; }
    if (video && video.srcObject) { video.srcObject.getTracks().forEach(t => t.stop()); video.srcObject = null; }
  } catch(e) {}
  isCamOn = false;
  window.isCamOn = false;
  updateCamUI();
  toast('Kamera OFF — hemat baterai', 'info');
}

function toggleCam() {
  if (isCamOn) { stopCam(); }
  else { startCam(); }
}

function startClock() {
  setInterval(() => {
    const el = document.getElementById('liveTime');
    if (el) el.textContent = new Date().toLocaleString('id-ID');
  }, 1000);
}

async function refreshLocation() {
  if (!navigator.geolocation) { toast('Geolocation tidak support', 'warning'); return; }
  navigator.geolocation.getCurrentPosition(async pos => {
    currentPos = { lat: pos.coords.latitude.toFixed(6), lon: pos.coords.longitude.toFixed(6), accuracy: Math.round(pos.coords.accuracy) };
    document.getElementById('statCoord').textContent = `${currentPos.lat}, ${currentPos.lon} (±${currentPos.accuracy}m)`;
    document.getElementById('liveLoc').textContent = `${currentPos.lat}, ${currentPos.lon}`;
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentPos.lat}&lon=${currentPos.lon}`);
      const j = await r.json();
      currentAddress = j.display_name || '';
      document.getElementById('statLoc').textContent = currentAddress.slice(0, 80);
      document.getElementById('liveLoc').textContent = currentAddress.slice(0, 80);
    } catch(e) {}
    try {
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${currentPos.lat}&longitude=${currentPos.lon}&current_weather=true`);
      const j = await r.json();
      currentWeather = { temp: j.current_weather.temperature };
      document.getElementById('statWeather').textContent = j.current_weather.temperature + '°C';
    } catch(e) {}
  }, e => toast('Lokasi gagal', 'error'), { enableHighAccuracy: true });
}

function loadHistory() {
  try { return JSON.parse(localStorage.getItem('stamp_history') || '[]'); } catch(e) { return []; }
}

function saveHistory(h) {
  localStorage.setItem('stamp_history', JSON.stringify(h));
}

function renderGalleryStamp() {
  const g = document.getElementById('gallery');
  const c = document.getElementById('galleryCount');
  const h = loadHistory();
  if (c) c.textContent = h.length + ' foto';
  if (!g) return;
  g.innerHTML = '';
  if (h.length === 0) {
    g.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:20px;color:#8d90ac;border:1px dashed #2b2e4a;border-radius:12px">Belum ada foto</div>';
    return;
  }
  h.slice().reverse().forEach((d, ri) => {
    const idx = h.length - 1 - ri;
    const div = document.createElement('div');
    div.className = 'gallery-item';
    div.innerHTML = `<img src="${d.image}"/><button style="position:absolute;top:4px;right:4px;width:20px;height:20px;border-radius:50%;background:rgba(0,0,0,.6);color:#fff;border:none">×</button>`;
    div.querySelector('img').onclick = () => { document.getElementById('modalImg').src = d.image; document.getElementById('modal').style.display = 'flex'; };
    div.querySelector('button').onclick = (e) => {
      e.stopPropagation();
      const hh = loadHistory();
      hh.splice(idx, 1);
      saveHistory(hh);
      renderGalleryStamp();
    };
    g.appendChild(div);
  });
}

// Event Shutter
document.getElementById('shutterBtn').onclick = function() {
  if (!video || !video.videoWidth) { toast('Kamera belum siap', 'warning'); return; }
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);
  const img = canvas.toDataURL('image/jpeg', 0.85);
  const h = loadHistory();
  h.push({ timestamp: new Date().toISOString(), location: currentAddress, coords: currentPos, image: img });
  saveHistory(h);
  renderGalleryStamp();
  toast('Foto diambil');
  this.style.opacity = '.5';
  setTimeout(() => this.style.opacity = '1', 150);
};

// Event Flip Camera
document.getElementById('flipCamBtn').onclick = async function() {
  if (!isCamOn) { toast('Aktifkan kamera dulu', 'warning'); return; }
  if (video.srcObject) video.srcObject.getTracks().forEach(t => t.stop());
  const curFacing = currentStream ? (currentStream.getVideoTracks()[0].getSettings().facingMode || 'environment') : 'environment';
  const nextFacing = curFacing === 'environment' ? 'user' : 'environment';
  try {
    const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: nextFacing } });
    currentStream = s;
    video.srcObject = s;
  } catch(e) { toast('Gagal flip kamera: ' + e.message, 'error'); }
};

// Event Modal
document.getElementById('modal').onclick = function() { this.style.display = 'none'; };

async function kirimBelanja() {
  const h = loadHistory();
  if (h.length === 0) { toast('Belum ada foto', 'warning'); return; }
  const last = h[h.length - 1];
  const nama = document.getElementById('belanjaNama').value.trim();
  const harga = Number(document.getElementById('belanjaHarga').value) || 0;
  const vendor = document.getElementById('belanjaVendor').value.trim();
  const kat = document.getElementById('belanjaKategori').value.trim();
  const adm = document.getElementById('belanjaAdmin').value.trim();
  if (!nama) { toast('Isi nama barang', 'warning'); return; }
  const base64 = last.image.split(',')[1] || '';
  const url = localStorage.getItem(GAS_KEY) || document.getElementById('gasUrlInput').value.trim();
  if (!url) { toast('Set URL GAS dulu di Iuran', 'warning'); goPage('iuran'); return; }
  
  document.getElementById('belanjaStatus').textContent = '⏳ Mengirim...';
  const payload = {
    itemName: nama, price: harga, vendor, adminName: adm,
    category: kat, location: last.location || currentAddress,
    lat: currentPos?.lat || '', lon: currentPos?.lon || '',
    accuracy: currentPos?.accuracy || '', imageBase64: base64
  };
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'SMP_TABUNGAN_2026', action: 'addBelanja', payload })
    });
    const j = await r.json().catch(() => ({}));
    document.getElementById('belanjaStatus').innerHTML = '✅ Terkirim! ' + (j.fileUrl ? `<a href="${j.fileUrl}" target="_blank" style="color:#06b6d4">Lihat Drive</a>` : '');
    document.getElementById('keuTgl').value = new Date().toISOString().slice(0,10);
    document.getElementById('keuNama').value = nama;
    document.getElementById('keuQty').value = 1;
    document.getElementById('keuHarga').value = harga;
    document.getElementById('keuVendor').value = vendor;
    document.getElementById('keuCatatan').value = j.fileUrl || '';
    if (typeof hitungJumlah === 'function') hitungJumlah();
    toast('Masuk laporan keuangan, cek tab Keuangan');
  } catch(e) {
    document.getElementById('belanjaStatus').textContent = '❌ Gagal: ' + e.message;
    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'SMP_TABUNGAN_2026', action: 'addBelanja', payload })
      });
      document.getElementById('belanjaStatus').textContent = '✅ Terkirim (no-cors)';
    } catch(e2) {}
  }
}
