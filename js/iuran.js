// ===== IURAN =====
function siapkanBaru() {
  editIndex = null;
  document.getElementById('editNis').value = '';
  document.getElementById('editNama').value = '';
  document.getElementById('editNominal').value = '';
  document.getElementById('editTanggal').valueAsDate = new Date();
  document.getElementById('editStatus').value = 'Belum Bayar';
}

function pilihEdit(i) {
  editIndex = i;
  const s = siswaData[i];
  document.getElementById('editNis').value = s.nis;
  document.getElementById('editNama').value = s.nama;
  document.getElementById('editGender').value = s.gender || 'L';
  document.getElementById('editNominal').value = s.nominal;
  document.getElementById('editTanggal').value = s.tglTerakhir ? new Date(s.tglTerakhir).toISOString().slice(0,10) : '';
  document.getElementById('editStatus').value = s.status;
}

function simpanEdit() {
  if (!window.isAdmin) { toast('Login dulu', 'warning'); return; }
  const nis = document.getElementById('editNis').value.trim();
  const nama = document.getElementById('editNama').value.trim();
  if (!nis || !nama) { toast('NIS & Nama wajib', 'warning'); return; }
  const obj = {
    nis, nama,
    gender: document.getElementById('editGender').value,
    nominal: Number(document.getElementById('editNominal').value) || 0,
    tglTerakhir: document.getElementById('editTanggal').value ? new Date(document.getElementById('editTanggal').value).toISOString() : new Date().toISOString(),
    status: document.getElementById('editStatus').value,
    ket: '', qr: ''
  };
  if (editIndex === null) {
    siswaData.push(obj);
    postGAS('addSiswa', obj);
  } else {
    siswaData[editIndex] = obj;
    postGAS('editSiswa', { oldNis: obj.nis, nis: obj.nis, nama: obj.nama, gender: obj.gender, nominal: obj.nominal, status: obj.status });
  }
  saveData();
  if (typeof renderTable === 'function') renderTable();
  toast('Disimpan');
}

function tambahSetoran() {
  if (!window.isAdmin) { toast('Login dulu', 'warning'); return; }
  if (editIndex === null) { toast('Pilih siswa dulu', 'warning'); return; }
  const s = siswaData[editIndex];
  const add = 10000;
  s.nominal = (Number(s.nominal) || 0) + add;
  s.status = 'Sudah Bayar';
  s.tglTerakhir = new Date().toISOString();
  saveData();
  postGAS('addSetoran', { nis: s.nis, nama: s.nama, tambahan: add, totalNominal: s.nominal });
  if (typeof renderTable === 'function') renderTable();
  toast('Setoran 10k ditambahkan');
}

function hapusTerpilih() {
  if (!window.isAdmin) { toast('Login dulu', 'warning'); return; }
  const cs = document.querySelectorAll('.rowCheck:checked');
  if (cs.length === 0) { toast('Pilih data', 'warning'); return; }
  if (!confirm('Hapus ' + cs.length + ' data?')) return;
  const idxs = Array.from(cs).map(c => Number(c.dataset.idx)).sort((a,b) => b-a);
  idxs.forEach(i => {
    postGAS('deleteSiswa', { nis: siswaData[i].nis });
    siswaData.splice(i, 1);
  });
  editIndex = null;
  saveData();
  if (typeof renderTable === 'function') renderTable();
  toast('Dihapus');
}

function resetData() {
  if (!window.isAdmin) { toast('Login dulu', 'warning'); return; }
  if (!confirm('Reset semua data lokal?')) return;
  siswaData = [];
  kasKeluarTotal = 0;
  saveData();
  if (typeof renderTable === 'function') renderTable();
  toast('Reset');
}

function tambahKasKeluar() {
  if (!window.isAdmin) { toast('Login dulu', 'warning'); return; }
  const v = Number(document.getElementById('kasKeluarInput').value) || 0;
  if (v <= 0) { toast('Nominal >0', 'warning'); return; }
  kasKeluarTotal += v;
  saveData();
  postGAS('addPengeluaran', { keperluan: 'Pengeluaran Legacy', nominal: v });
  document.getElementById('kasKeluarInput').value = '';
  if (typeof renderTable === 'function') renderTable();
  toast('Pengeluaran legacy dicatat');
}

function renderTable() {
  const tbody = document.getElementById('tableBody');
  const tfoot = document.getElementById('tableFooter');
  if (!tbody) return;
  const q = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const f = document.getElementById('statusFilter')?.value || 'all';
  let filtered = siswaData.filter(s => {
    const ms = !q || String(s.nama).toLowerCase().includes(q) || String(s.nis).toLowerCase().includes(q);
    const mf = f === 'all' || s.status === f;
    return ms && mf;
  });
  let total = filtered.reduce((a,b) => a + (Number(b.nominal) || 0), 0);
  
  tbody.innerHTML = filtered.map((s, i) => {
    const idx = siswaData.indexOf(s);
    return `<tr>
      <td>${i+1}</td>
      <td>${s.nis}</td>
      <td>${s.nama}</td>
      <td>${s.gender || 'L'}</td>
      <td>${formatRupiah(s.nominal)}</td>
      <td>${s.tglTerakhir ? new Date(s.tglTerakhir).toLocaleDateString('id-ID') : ''}</td>
      <td><span style="font-size:.7rem;padding:2px 8px;border-radius:999px;font-weight:700;background:${String(s.status).includes('Sudah') ? '#dcfce7;color:#166534' : '#fee2e2;color:#991b1b'}">${s.status}</span></td>
      <td><input type="checkbox" class="rowCheck" data-idx="${idx}"/> <button class="btn" style="padding:3px 8px;font-size:.7rem" onclick="pilihEdit(${idx})">Edit</button></td>
    </tr>`;
  }).join('');

  tfoot.innerHTML = `<tr><td colspan="4" style="font-weight:700;text-align:right">Total (${filtered.length})</td><td style="font-weight:800">${formatRupiah(total)}</td><td colspan="3"></td></tr>`;

  // Stats
  document.getElementById('totalSiswa').textContent = siswaData.length;
  const sudah = siswaData.filter(s => String(s.status).includes('Sudah')).length;
  const belum = siswaData.length - sudah;
  document.getElementById('sudahBayar').textContent = sudah;
  document.getElementById('belumBayar').textContent = belum;
  document.getElementById('sudahP').textContent = siswaData.length ? Math.round(sudah/siswaData.length * 100) + '%' : '0%';
  document.getElementById('belumP').textContent = siswaData.length ? Math.round(belum/siswaData.length * 100) + '%' : '0%';

  const totalMasuk = siswaData.reduce((a,b) => a + (Number(b.nominal) || 0), 0);
  const keuDetail = JSON.parse(localStorage.getItem(KEU_KEY) || '[]');
  const grandKeu = keuDetail.reduce((a,b) => a + (Number(b.jumlah) || 0), 0);

  document.getElementById('totalMasuk').textContent = formatRupiah(totalMasuk);
  document.getElementById('totalKeluar').textContent = formatRupiah(grandKeu);
  document.getElementById('saldo').textContent = formatRupiah(totalMasuk - grandKeu);

  if (typeof renderCharts === 'function') renderCharts();
  try { if (document.getElementById('page-keu').classList.contains('active') && typeof renderKeu === 'function') renderKeu(); } catch(e) {}
}
