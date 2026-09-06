// ===== DATA CORE =====
const GAS_KEY = 'gas_webapp_url';
const KEU_KEY = 'keu_detail';

let siswaData = [];
let kasKeluarTotal = 0;
let editIndex = null;
let qrScannerInstance = null;

function loadData() {
  try { siswaData = JSON.parse(localStorage.getItem('siswaData') || '[]'); } catch(e) { siswaData = []; }
  try { kasKeluarTotal = Number(localStorage.getItem('kasKeluarTotal') || 0); } catch(e) { kasKeluarTotal = 0; }
}

function saveData() {
  localStorage.setItem('siswaData', JSON.stringify(siswaData));
  localStorage.setItem('kasKeluarTotal', String(kasKeluarTotal));
}

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0);
}

function toast(m, t = 'success') {
  const el = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = m;
  el.className = 'toast show';
  setTimeout(() => el.className = 'toast', 3000);
}

function setGasUrl() {
  const u = document.getElementById('gasUrlInput').value.trim();
  localStorage.setItem(GAS_KEY, u);
  document.getElementById('gasStatus').textContent = '✅ Tersimpan';
  toast('URL GAS disimpan');
}

async function postGAS(action, payload) {
  const url = localStorage.getItem(GAS_KEY) || document.getElementById('gasUrlInput').value.trim();
  if (!url) return;
  try {
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'SMP_TABUNGAN_2026', action: action, payload: payload })
    });
  } catch(e) {}
}

async function syncData() {
  const url = localStorage.getItem(GAS_KEY) || document.getElementById('gasUrlInput').value.trim();
  if (!url) { toast('Isi URL GAS', 'warning'); return; }
  document.getElementById('gasStatus').textContent = '⏳ Sync...';
  try {
    const r = await fetch(url + '?action=read&token=SMP_TABUNGAN_2026');
    const j = await r.json();
    if (j.success && j.data.siswa) {
      siswaData = j.data.siswa.map(s => ({
        nis: s.nis, nama: s.nama, gender: s.gender,
        nominal: s.nominal, ket: s.ket, status: s.status,
        tglTerakhir: s.tglTerakhir, qr: s.qr
      }));
      kasKeluarTotal = j.data.totalKeluar || 0;
      saveData();
      if (typeof renderTable === 'function') renderTable();
      document.getElementById('gasStatus').textContent = '✅ Sync berhasil ' + new Date().toLocaleTimeString('id-ID');
      toast('Sync berhasil');
    } else {
      document.getElementById('gasStatus').textContent = '❌ ' + (j.error || 'gagal');
    }
  } catch(e) {
    document.getElementById('gasStatus').textContent = '❌ ' + e.message;
  }
}
