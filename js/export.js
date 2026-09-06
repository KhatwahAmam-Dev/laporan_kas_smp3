// ===== EXPORT =====
function exportExcel() {
  if (siswaData.length === 0) { toast('Data kosong', 'warning'); return; }
  const exportData = siswaData.map((s, i) => {
    let tglFormatted = '';
    if (s.tglTerakhir) {
      try {
        const d = new Date(s.tglTerakhir);
        if (!isNaN(d)) tglFormatted = d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        else tglFormatted = String(s.tglTerakhir).split('T')[0];
      } catch(e) { tglFormatted = String(s.tglTerakhir); }
    }
    return { no: i+1, nis: s.nis, nama: s.nama, gender: s.gender || '', nominal: Number(s.nominal) || 0, ket: s.ket || '', status: s.status || '', tglTerakhir: tglFormatted, qr: '' };
  });

  const totalMasuk = siswaData.reduce((a,b) => a + (Number(b.nominal) || 0), 0);
  const keuDetail = JSON.parse(localStorage.getItem(KEU_KEY) || '[]');
  const grandKredit = keuDetail.reduce((a,b) => a + (Number(b.jumlah) || 0), 0);
  const saldoAkhir = totalMasuk - grandKredit;

  exportData.push({});
  exportData.push({ nis: 'REKAP KEUANGAN', nama: '', gender: '', nominal: '', ket: '', status: '', tglTerakhir: '', qr: '' });
  exportData.push({ nis: 'Saldo Awal (Total Iuran Masuk)', nama: formatRupiah(totalMasuk), gender: '', nominal: '', ket: '', status: '', tglTerakhir: '', qr: '' });
  exportData.push({ nis: 'Total Pengeluaran (Grand Total)', nama: formatRupiah(grandKredit), gender: '', nominal: '', ket: '', status: '', tglTerakhir: '', qr: '' });
  exportData.push({ nis: 'Saldo Akhir', nama: formatRupiah(saldoAkhir), gender: '', nominal: '', ket: '', status: '', tglTerakhir: '', qr: '' });

  const ws = XLSX.utils.json_to_sheet(exportData);
  ws['!cols'] = [{ wch: 5 }, { wch: 14 }, { wch: 28 }, { wch: 8 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 18 }, { wch: 8 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Iuran Kelas 7F');
  XLSX.writeFile(wb, 'Laporan_Iuran_Kelas_7F_' + new Date().toISOString().slice(0,10) + '.xlsx');
  toast('Excel selesai', 'success');
}

function exportPDF() {
  if (siswaData.length === 0) { toast('Data kosong', 'warning'); return; }
  const totalMasuk = siswaData.reduce((a,b) => a + (Number(b.nominal) || 0), 0);
  const keuDetail = JSON.parse(localStorage.getItem(KEU_KEY) || '[]');
  const grandKredit = keuDetail.reduce((a,b) => a + (Number(b.jumlah) || 0), 0);
  const saldoAkhir = totalMasuk - grandKredit;
  const sudahCount = siswaData.filter(s => String(s.status).toLowerCase().includes('sudah')).length;
  const belumCount = siswaData.length - sudahCount;

  const c = document.getElementById('pdf-export-container');
  c.innerHTML = `
    <div id="pdfContent" style="font-family:Inter,Arial,sans-serif;padding:16px 18px;background:#fff;color:#000;width:210mm;min-height:297mm;box-sizing:border-box">
      <div style="text-align:center;border-bottom:3px solid #0f1a2f;padding-bottom:10px;margin-bottom:10px">
        <h1 style="margin:0;font-size:18px;font-weight:800;letter-spacing:.5px">Laporan Keuangan SMP Pasundan 3, Kelas 7F</h1>
        <div style="font-size:11px;color:#334155;margin-top:4px">Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })} - ${new Date().toLocaleTimeString('id-ID')}</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px;font-size:10px">
        <div style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:8px;padding:8px;text-align:center"><div style="font-weight:700;color:#64748b;text-transform:uppercase;font-size:9px">Saldo Awal</div><div style="font-size:13px;font-weight:800;margin-top:2px">${formatRupiah(totalMasuk)}</div><div style="font-size:9px;color:#64748b">${siswaData.length} siswa • ${sudahCount} sudah bayar</div></div>
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:8px;text-align:center"><div style="font-weight:700;color:#991b1b;text-transform:uppercase;font-size:9px">Pengeluaran (Grand Total)</div><div style="font-size:13px;font-weight:800;margin-top:2px;color:#991b1b">${formatRupiah(grandKredit)}</div><div style="font-size:9px;color:#64748b">${keuDetail.length} item pengeluaran</div></div>
        <div style="background:${saldoAkhir < 0 ? '#fef2f2' : '#f0fdf4'};border:1px solid ${saldoAkhir < 0 ? '#fecaca' : '#bbf7d0'};border-radius:8px;padding:8px;text-align:center"><div style="font-weight:700;color:${saldoAkhir < 0 ? '#991b1b' : '#166534'};text-transform:uppercase;font-size:9px">Saldo Akhir</div><div style="font-size:13px;font-weight:800;margin-top:2px;color:${saldoAkhir < 0 ? '#991b1b' : '#166534'}">${formatRupiah(saldoAkhir)}</div><div style="font-size:9px;color:#64748b">Saldo Awal - Pengeluaran</div></div>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:9px;border:1px solid #94a3b8;table-layout:fixed">
        <thead><tr style="background:#0f1a2f;color:#fff"><th style="padding:5px 4px;border:1px solid #334155;width:30px">No</th><th style="padding:5px 4px;border:1px solid #334155;width:70px">NIS</th><th style="padding:5px 6px;border:1px solid #334155;text-align:left">Nama Siswa</th><th style="padding:5px 4px;border:1px solid #334155;width:35px">L/P</th><th style="padding:5px 4px;border:1px solid #334155;width:70px">Nominal</th><th style="padding:5px 4px;border:1px solid #334155;width:85px">Tgl Terakhir</th><th style="padding:5px 4px;border:1px solid #334155;width:75px">Status</th></tr></thead>
        <tbody>
          ${siswaData.map((s, i) => {
            let tgl = '';
            if (s.tglTerakhir) { try { const d = new Date(s.tglTerakhir); tgl = isNaN(d) ? '' : d.toLocaleDateString('id-ID'); } catch(e) {} }
            return `<tr style="page-break-inside:avoid;break-inside:avoid"><td style="padding:4px;border:1px solid #cbd5e1;text-align:center">${i+1}</td><td style="padding:4px;border:1px solid #cbd5e1;text-align:center;font-family:monospace">${s.nis}</td><td style="padding:4px 6px;border:1px solid #cbd5e1;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.nama}</td><td style="padding:4px;border:1px solid #cbd5e1;text-align:center">${s.gender || 'L'}</td><td style="padding:4px;border:1px solid #cbd5e1;text-align:right">${formatRupiah(s.nominal)}</td><td style="padding:4px;border:1px solid #cbd5e1;text-align:center;font-size:8px">${tgl}</td><td style="padding:4px;border:1px solid #cbd5e1;text-align:center;font-weight:700;color:${String(s.status).includes('Sudah') ? '#166534' : '#991b1b'}">${s.status}</td></tr>`;
          }).join('')}
        </tbody>
        <tfoot>
          <tr style="background:#f1f5f9;font-weight:800;page-break-inside:avoid"><td colspan="4" style="padding:5px;border:1px solid #94a3b8;text-align:right">TOTAL</td><td style="padding:5px;border:1px solid #94a3b8;text-align:right">${formatRupiah(totalMasuk)}</td><td colspan="2" style="padding:5px;border:1px solid #94a3b8;text-align:center">${sudahCount} Sudah • ${belumCount} Belum</td></tr>
        </tfoot>
      </table>
      <div style="margin-top:10px;font-size:8px;color:#64748b;border-top:1px solid #e2e8f0;padding-top:6px;display:flex;justify-content:space-between"><span>Dicetak dari Dashboard Terpadu SMP Pasundan 3</span><span>Halaman 1 • ${siswaData.length} siswa</span></div>
    </div>
  `;
  c.style.display = 'block';
  const opt = {
    margin: [5,5,5,5],
    filename: `Laporan_Keuangan_SMP_Pasundan3_Kelas_7F_${new Date().toISOString().slice(0,10)}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['css', 'legacy'], avoid: '.avoid-break' }
  };
  html2pdf().set(opt).from(document.getElementById('pdfContent')).save().then(() => { c.style.display = 'none'; toast('PDF selesai', 'success'); });
}

function exportKeuExcel() {
  const detail = loadKeu();
  const totalMasuk = siswaData.reduce((a,b) => a + (Number(b.nominal) || 0), 0);
  const data = [{ Jenis: 'DEBIT', Nama: 'TOTAL PEMASUKAN', Jumlah: totalMasuk }];
  detail.forEach(d => data.push({ Tanggal: d.tanggal, Jenis: 'KREDIT', Nama: d.nama, Qty: d.qty, Harga: d.harga, Jumlah: d.jumlah, Vendor: d.vendor }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Keuangan');
  XLSX.writeFile(wb, 'keuangan.xlsx');
  toast('Excel Keuangan selesai', 'success');
}

function exportKeuPDF() {
  const c = document.getElementById('pdf-export-container');
  c.innerHTML = `<div style="padding:16px;font-family:Inter"><h2>Laporan Keuangan Kas</h2><p>${new Date().toLocaleDateString('id-ID')}</p>${document.getElementById('rekapBox').innerHTML}<br>${document.getElementById('page-keu').querySelector('table').outerHTML}</div>`;
  c.style.display = 'block';
  html2pdf().from(c).save('keuangan.pdf').then(() => c.style.display = 'none');
}
