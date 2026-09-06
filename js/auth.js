// ===== AUTH =====
const AKUN_KEY = 'akunAdmin';

function getAkun() {
  try {
    const s = localStorage.getItem(AKUN_KEY);
    if (s) return JSON.parse(s);
  } catch(e) {}
  return { user: 'admin', pass: 'admin123' };
}

function checkLogin() {
  const is = localStorage.getItem('isAdmin') === 'true';
  window.isAdmin = is;
  document.getElementById('loginOverlay').classList.remove('show');
  document.getElementById('logoutBtn').style.display = is ? 'inline-flex' : 'none';
  document.getElementById('loginToggleBtn').style.display = is ? 'none' : 'inline-flex';
  document.getElementById('adminPanel').className = is ? 'show' : '';
  document.getElementById('loginInfo').style.display = is ? 'none' : 'block';
  if (typeof renderTable === 'function') renderTable();
}

function generatePass() {
  const cs = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  let p = '';
  const a = new Uint32Array(14);
  crypto.getRandomValues(a);
  for (let i = 0; i < 14; i++) p += cs[a[i] % cs.length];
  document.getElementById('akunPassBaru').value = p;
  toast('Password: ' + p);
  document.getElementById('akunStatus').textContent = 'Password baru: ' + p + ' — catat sebelum simpan';
}

function gantiAkun() {
  if (!window.isAdmin) { toast('Login dulu', 'warning'); return; }
  const ak = getAkun();
  const ub = document.getElementById('akunUserBaru').value.trim();
  const pl = document.getElementById('akunPassLama').value;
  const pb = document.getElementById('akunPassBaru').value;
  if (pl !== ak.pass) { document.getElementById('akunStatus').textContent = '❌ Password lama salah'; return; }
  if (!ub && !pb) { document.getElementById('akunStatus').textContent = 'Isi username/password baru'; return; }
  const nb = { user: ub || ak.user, pass: pb || ak.pass };
  localStorage.setItem(AKUN_KEY, JSON.stringify(nb));
  toast('Akun diperbarui');
  document.getElementById('akunStatus').textContent = '✅ Akun diperbarui';
  document.getElementById('akunUserBaru').value = '';
  document.getElementById('akunPassLama').value = '';
  document.getElementById('akunPassBaru').value = '';
}

// Event Login
document.getElementById('loginBtn').addEventListener('click', function() {
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value.trim();
  const akun = getAkun();
  if (u === akun.user && p === akun.pass) {
    localStorage.setItem('isAdmin', 'true');
    checkLogin();
    toast('Login berhasil');
    document.getElementById('loginError').textContent = '';
    document.getElementById('loginOverlay').classList.remove('show');
  } else {
    document.getElementById('loginError').textContent = '❌ Username atau password salah. Default admin/admin123';
  }
});

document.getElementById('loginToggleBtn').addEventListener('click', function() {
  document.getElementById('loginOverlay').classList.add('show');
});

document.getElementById('logoutBtn').addEventListener('click', function() {
  localStorage.removeItem('isAdmin');
  window.isAdmin = false;
  checkLogin();
  toast('Logout');
});
