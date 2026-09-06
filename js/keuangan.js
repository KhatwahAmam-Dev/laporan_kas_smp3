// ===== KEUANGAN =====
function loadKeu() {
  try { return JSON.parse(localStorage.getItem(KEU_KEY) || '[]'); } catch(e) { return []; }
}

function saveKeu(d) {
  localStorage.setItem(KEU_KEY, JSON.stringify(d));
}

function hitungJumlah() {
  const q = Number(document.getElementById('keuQty').value) || 0;
  const h = Number(document.getElementById('keuHarga').value) || 0;
  document.getElementById('keuJumlah').value = q * h;
}

function tambahDetail() {
  if (!window.isAdmin) { toast('Login admin dulu di tab Iuran', 'warning'); goPage('iuran'); return; }
  const tgl = document.getElementById('keuTgl').value;
  const nama = document.getElementById('keuNama').value.trim();
  const qty = Number(document.getElementById('keuQty').value) || 0;
  const harga = Number(document.getElementById('keuHarga').value) || 0;
  const jumlah = qty * harga;
  const vendor = document.getElementById('keuVendor').value.trim();
  const kat = document.getElementById('keuKategori').value;
  const cat = document.getElementById('keuCatatan').value.trim();
  if (!tgl || !nama || qty <= 0 || harga <= 0) { toast('Lengkapi tanggal/nama/qty/harga', 'warning'); return; }
  const d = loadKeu();
  d.push({ id: Date.now(), tanggal: tgl, nama, qty, harga, jumlah, vendor, kategori: kat, catatan: cat });
  saveKeu(d);
  postGAS('addPengeluaran', {
    keperluan: `${nama} x${qty} @${formatRupiah(harga)} [${kat}] ${vendor}`,
    nominal: jumlah,
    detail: { tanggal: tgl, nama, qty, harga, vendor }
  });
  document.getElementById('keuNama').value = '';
  document.getElementById('keuQty').value = 1;
  document.getElementById('keuHarga').value = '';
  document.getElementById('keuJumlah').value = '';
  document.getElementById('keuCatatan').value = '';
  renderKeu();
  toast('Pengeluaran ditambahkan');
}

function hapusKeu(id) {
  if (!confirm('Hapus?')) return;
  let d = loadKeu();
  d = d.filter(x => x.id !== id);
  saveKeu(d);
  renderKeu();
  toast('Dihapus');
}

function renderKeu() {
  const detail = loadKeu();
  const totalMasuk = siswaData.reduce((a,b) => a + (Number(b.nominal) || 0), 0);
  const grandKredit = detail.reduce((a,b) => a + (Number(b.jumlah) || 0), 0);
  const saldoAkhir = totalMasuk - grandKredit;

  document.getElementById('keuSaldoAwal').textContent = formatRupiah(totalMasuk);
  document.getElementById('keuTotalKredit').textContent = formatRupiah(grandKredit);
  document.getElementById('keuKreditInfo').textContent = `${detail.length} item • Qty ${detail.reduce((a,b) => a + (b.qty || 0), 0)}`;
  document.getElementById('keuSaldoAkhir').textContent = formatRupiah(saldoAkhir);
  document.getElementById('keuDebitInfo').textContent = siswaData.length + ' siswa';

  const statusInfo = document.getElementById('keuStatusInfo');
  if (saldoAkhir < 0) { statusInfo.textContent = 'DEFISIT! Kurangi pengeluaran'; statusInfo.style.color = '#ef4444'; }
  else if (saldoAkhir < totalMasuk * 0.1) { statusInfo.textContent = 'MENIPIS (<10%)'; statusInfo.style.color = '#f59e0b'; }
  else { statusInfo.textContent = 'AMAN'; statusInfo.style.color = '#10b981'; }

  const q = (document.getElementById('keuSearch')?.value || '').toLowerCase();
  const f = document.getElementById('keuFilter')?.value || 'all';
  let rows = [];

  if (f !== 'kredit') {
    siswaData.forEach(s => {
      if (q && !String(s.nama).toLowerCase().includes(q) && !String(s.nis).toLowerCase().includes(q)) return;
      rows.push({
        tanggal: s.tglTerakhir || new Date().toISOString(),
        jenis: 'DEBIT',
        nama: `Iuran ${s.nama} (${s.nis})`,
        qty: 1,
        harga: s.nominal,
        jumlah: s.nominal,
        vendor: 'Siswa',
        saldo: null,
        isDebit: true
      });
    });
  }

  if (f !== 'debit') {
    detail.forEach(d => {
      if (q && !String(d.nama).toLowerCase().includes(q) && !String(d.vendor).toLowerCase().includes(q)) return;
      rows.push({
        tanggal: d.tanggal,
        jenis: 'KREDIT',
        nama: d.nama,
        qty: d.qty,
        harga: d.harga,
        jumlah: d.jumlah,
        vendor: d.vendor,
        kategori: d.kategori,
        catatan: d.catatan,
        isDebit: false,
        id: d.id
      });
    });
  }

  rows.sort((a,b) => new Date(a.tanggal) - new Date(b.tanggal));
  let jalan = 0;
  rows = rows.map(r => {
    if (r.isDebit) jalan += Number(r.jumlah) || 0;
    else jalan -= Number(r.jumlah) || 0;
    return { ...r, saldo: jalan };
  });

  document.getElementById('keuBody').innerHTML = rows.map(r => `
    <tr>
      <td>${new Date(r.tanggal).toLocaleDateString('id-ID')}</td>
      <td><span style="font-size:.65rem;padding:2px 8px;border-radius:999px;font-weight:700;background:${r.isDebit ? '#dcfce7;color:#166534' : '#fee2e2;color:#991b1b'}">${r.jenis}</span></td>
      <td>${r.nama}${r.catatan ? `<br><small style="color:#5b6e8a"><a href="${r.catatan}" target="_blank">${r.catatan.slice(0,30)}...</a></small>` : ''}</td>
      <td>${r.qty}</td>
      <td>${formatRupiah(r.harga)}</td>
      <td style="font-weight:700">${formatRupiah(r.jumlah)}</td>
      <td>${r.vendor || '-'}</td>
      <td style="font-weight:700">${formatRupiah(r.saldo)}</td>
      <td>${!r.isDebit && r.id ? `<button class="btn" style="padding:3px 8px" onclick="hapusKeu(${r.id})"><i class="fas fa-trash"></i></button>` : ''}</td>
    </tr>
  `).join('');

  document.getElementById('keuFoot').innerHTML = `
    <tr style="font-weight:800;background:#f8fafc">
      <td colspan="5" style="text-align:right">Grand Total Kredit</td>
      <td>${formatRupiah(grandKredit)}</td>
      <td colspan="2"></td>
      <td>${formatRupiah(saldoAkhir)}</td>
    </tr>
  `;

  document.getElementById('rekapBox').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
      <div>Saldo Awal (Iuran)</div>
      <div style="text-align:right;font-weight:800">${formatRupiah(totalMasuk)}</div>
      <div>Total Kredit (Grand Total Belanja Detail)</div>
      <div style="text-align:right;color:#991b1b;font-weight:700">${formatRupiah(grandKredit)}</div>
      <div style="border-top:1px solid #e2e8f0;padding-top:6px;font-weight:800">Saldo Akhir = Awal - Kredit Detail</div>
      <div style="border-top:1px solid #e2e8f0;padding-top:6px;text-align:right;font-weight:800">${formatRupiah(saldoAkhir)}</div>
    </div>
    <p style="margin-top:8px;font-size:.7rem;color:#5b6e8a">Hanya pengeluaran detail dari form yang dipotong. Legacy Rp ${formatRupiah(kasKeluarTotal)} di halaman Iuran tetap tersimpan sebagai arsip, tidak dipotong lagi di sini.</p>
  `;
  try { if (typeof renderTable === 'function') renderTable(); } catch(e) {}
}

// Set default tanggal
document.getElementById('keuTgl').valueAsDate = new Date();
