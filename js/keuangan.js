
// ===== KEUANGAN.JS =====
function loadKeu(){try{return JSON.parse(localStorage.getItem(KEU_KEY)||'[]')}catch(e){return[]}}
function saveKeu(d){localStorage.setItem(KEU_KEY,JSON.stringify(d))}
function hitungJumlah(){const q=Number(document.getElementById('keuQty')?.value)||0;const h=Number(document.getElementById('keuHarga')?.value)||0;const el=document.getElementById('keuJumlah');if(el) el.value=q*h;}
function tambahDetail(){
 if(!isAdmin){toast('Login admin dulu di tab Iuran','warning');window.location.href='index.html';return;}
 const tgl=document.getElementById('keuTgl').value;const nama=document.getElementById('keuNama').value.trim();const qty=Number(document.getElementById('keuQty').value)||0;const harga=Number(document.getElementById('keuHarga').value)||0;const jumlah=qty*harga;const vendor=document.getElementById('keuVendor').value.trim();const kat=document.getElementById('keuKategori').value;const cat=document.getElementById('keuCatatan').value.trim();
 if(!tgl||!nama||qty<=0||harga<=0){toast('Lengkapi tanggal/nama/qty/harga','warning');return;}
 const d=loadKeu();d.push({id:Date.now(),tanggal:tgl,nama,qty,harga,jumlah,vendor,kategori:kat,catatan:cat});saveKeu(d);postGAS('addPengeluaran',{keperluan:`${nama} x${qty} @${formatRupiah(harga)} [${kat}] ${vendor}`,nominal:jumlah});document.getElementById('keuNama').value='';document.getElementById('keuQty').value=1;document.getElementById('keuHarga').value='';const jm=document.getElementById('keuJumlah');if(jm) jm.value='';document.getElementById('keuCatatan').value='';renderKeu();toast('Pengeluaran ditambahkan');
}
function hapusKeu(id){if(!confirm('Hapus?'))return;let d=loadKeu();d=d.filter(x=>x.id!==id);saveKeu(d);renderKeu();toast('Dihapus');}
function renderKeu(){
 const detail=loadKeu();const totalMasuk=siswaData.reduce((a,b)=>a+(Number(b.nominal)||0),0);
 const grandKredit=detail.reduce((a,b)=>a+(Number(b.jumlah)||0),0);
 const saldoAkhir=totalMasuk-grandKredit;
 const elA=document.getElementById('keuSaldoAwal'); if(elA) elA.textContent=formatRupiah(totalMasuk);
 const elK=document.getElementById('keuTotalKredit'); if(elK) elK.textContent=formatRupiah(grandKredit);
 const elKI=document.getElementById('keuKreditInfo'); if(elKI) elKI.textContent=`${detail.length} item • Qty ${detail.reduce((a,b)=>a+(b.qty||0),0)}`;
 const elSA=document.getElementById('keuSaldoAkhir'); if(elSA) elSA.textContent=formatRupiah(saldoAkhir);
 const elDI=document.getElementById('keuDebitInfo'); if(elDI) elDI.textContent=siswaData.length+' siswa';
 const statusInfo=document.getElementById('keuStatusInfo');
 if(statusInfo){
  if(saldoAkhir<0){statusInfo.textContent='DEFISIT!';statusInfo.style.color='#ef4444';}
  else if(saldoAkhir<totalMasuk*0.1){statusInfo.textContent='MENIPIS (<10%)';statusInfo.style.color='#f59e0b';}
  else {statusInfo.textContent='AMAN';statusInfo.style.color='#10b981';}
 }
 const q=(document.getElementById('keuSearch')?.value||'').toLowerCase();const f=document.getElementById('keuFilter')?.value||'all';
 let rows=[];
 if(f!=='kredit'){siswaData.forEach(s=>{if(q&&!String(s.nama).toLowerCase().includes(q)&&!String(s.nis).toLowerCase().includes(q))return;rows.push({tanggal:s.tglTerakhir||new Date().toISOString(),jenis:'DEBIT',nama:`Iuran ${s.nama} (${s.nis})`,qty:1,harga:s.nominal,jumlah:s.nominal,vendor:'Siswa',isDebit:true});});}
 if(f!=='debit'){detail.forEach(d=>{if(q&&!String(d.nama).toLowerCase().includes(q)&&!String(d.vendor).toLowerCase().includes(q))return;rows.push({tanggal:d.tanggal,jenis:'KREDIT',nama:d.nama,qty:d.qty,harga:d.harga,jumlah:d.jumlah,vendor:d.vendor,kategori:d.kategori,catatan:d.catatan,isDebit:false,id:d.id});});}
 rows.sort((a,b)=>new Date(a.tanggal)-new Date(b.tanggal));
 let jalan=0;rows=rows.map(r=>{if(r.isDebit)jalan+=Number(r.jumlah)||0;else jalan-=Number(r.jumlah)||0;return {...r,saldo:jalan};});
 const tbody=document.getElementById('keuBody'); if(tbody) tbody.innerHTML=rows.map(r=>`<tr><td>${new Date(r.tanggal).toLocaleDateString('id-ID')}</td><td><span style="font-size:.65rem;padding:2px 8px;border-radius:999px;font-weight:700;background:${r.isDebit?'#dcfce7;color:#166534':'#fee2e2;color:#991b1b'}">${r.jenis}</span></td><td>${r.nama}${r.catatan?`<br><small style="color:#5b6e8a"><a href="${r.catatan}" target="_blank">${r.catatan.slice(0,30)}...</a></small>`:''}</td><td>${r.qty}</td><td>${formatRupiah(r.harga)}</td><td style="font-weight:700">${formatRupiah(r.jumlah)}</td><td>${r.vendor||'-'}</td><td style="font-weight:700">${formatRupiah(r.saldo)}</td><td>${!r.isDebit&&r.id?`<button class="btn" style="padding:3px 8px" onclick="hapusKeu(${r.id})"><i class="fas fa-trash"></i></button>`:''}</td></tr>`).join('');
 const tfoot=document.getElementById('keuFoot'); if(tfoot) tfoot.innerHTML=`<tr style="font-weight:800;background:#f8fafc"><td colspan="5" style="text-align:right">Grand Total Kredit</td><td>${formatRupiah(grandKredit)}</td><td colspan="2"></td><td>${formatRupiah(saldoAkhir)}</td></tr>`;
 const rekap=document.getElementById('rekapBox'); if(rekap) rekap.innerHTML=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px"><div>Saldo Awal (Iuran)</div><div style="text-align:right;font-weight:800">${formatRupiah(totalMasuk)}</div><div>Total Kredit</div><div style="text-align:right;color:#991b1b;font-weight:700">${formatRupiah(grandKredit)}</div><div style="border-top:1px solid #e2e8f0;padding-top:6px;font-weight:800">Saldo Akhir</div><div style="border-top:1px solid #e2e8f0;padding-top:6px;text-align:right;font-weight:800">${formatRupiah(saldoAkhir)}</div></div>`;
}

function exportKeuExcel(){const detail=loadKeu();const totalMasuk=siswaData.reduce((a,b)=>a+(Number(b.nominal)||0),0);const data=[{Jenis:'DEBIT',Nama:'TOTAL PEMASUKAN',Jumlah:totalMasuk}];detail.forEach(d=>data.push({Tanggal:d.tanggal,Jenis:'KREDIT',Nama:d.nama,Qty:d.qty,Harga:d.harga,Jumlah:d.jumlah,Vendor:d.vendor}));const ws=XLSX.utils.json_to_sheet(data);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Keuangan');XLSX.writeFile(wb,'keuangan.xlsx');}
function exportKeuPDF(){const c=document.getElementById('pdf-export-container');if(!c) return; c.innerHTML=`<div style="padding:16px;font-family:Inter"><h2>Laporan Keuangan Kas</h2><p>${new Date().toLocaleDateString('id-ID')}</p>${document.getElementById('rekapBox').innerHTML}<br>${document.getElementById('keuTable').outerHTML}</div>`;c.style.display='block';html2pdf().from(c).save('keuangan.pdf').then(()=>c.style.display='none');}
