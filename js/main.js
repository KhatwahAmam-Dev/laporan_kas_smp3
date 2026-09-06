// ===== MAIN =====
function goPage(n) {
  if (n !== 'stamp' && window.isCamOn) { stopCam(); }
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-links button').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + n).classList.add('active');
  document.getElementById('b' + (n === 'iuran' ? 1 : n === 'stamp' ? 2 : 3)).classList.add('active');
  if (n === 'stamp' && !window.stampInit) initStamp();
  if (n === 'keu') renderKeu();
  if (n === 'iuran') setTimeout(() => { renderTable(); }, 100);
}

// QR Scanner
function onScanSuccess(d) {
  document.getElementById('editNis').value = d;
  document.getElementById('scanResult').textContent = '✅ ' + d;
  toast('QR: ' + d);
  setTimeout(stopScanner, 800);
}

function stopScanner() {
  if (qrScannerInstance) {
    try {
      qrScannerInstance.stop().then(() => { qrScannerInstance.clear(); qrScannerInstance = null; }).catch(() => {});
    } catch(e) {}
  }
  document.getElementById('scannerContainer').style.display = 'none';
}

document.getElementById('scanQrBtn').addEventListener('click', async function() {
  if (!window.isAdmin) { toast('Login dulu', 'warning'); return; }
  document.getElementById('scannerContainer').style.display = 'block';
  if (qrScannerInstance) await stopScanner();
  qrScannerInstance = new Html5Qrcode('qr-reader');
  qrScannerInstance.start(
    { facingMode: 'environment' },
    { fps: 10, qrbox: 250 },
    onScanSuccess,
    () => {}
  ).catch(() => toast('Kamera gagal', 'error'));
});

// Header Date
document.getElementById('headerDate').textContent = new Date().toLocaleDateString('id-ID', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
});

// Init
loadData();
checkLogin();
const savedUrl = localStorage.getItem(GAS_KEY);
if (savedUrl) {
  document.getElementById('gasUrlInput').value = savedUrl;
  document.getElementById('gasStatus').textContent = '✅ URL tersimpan';
}

// QR Button listener tambahan
document.getElementById('scanQrBtn').addEventListener('click', function() {
  if (!window.isAdmin) { toast('Login dulu', 'warning'); return; }
  document.getElementById('scannerContainer').style.display = 'block';
  if (qrScannerInstance) stopScanner();
  qrScannerInstance = new Html5Qrcode('qr-reader');
  qrScannerInstance.start(
    { facingMode: 'environment' },
    { fps: 10, qrbox: 250 },
    onScanSuccess,
    () => {}
  ).catch(() => toast('Kamera gagal', 'error'));
});
