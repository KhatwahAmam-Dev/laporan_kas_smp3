
// ===== IURAN.JS - Logika halaman Iuran (dipisah dari file gabungan) =====
let editIndex=null,qrScannerInstance=null,chartS=null,chartG=null;

function renderCharts(){
 const sudah=siswaData.filter(s=>String(s.status).toLowerCase().includes('sudah')).length;
 const belum=siswaData.length-sudah;
 const c1=document.getElementById('statusChart');if(c1){if(chartS)chartS.destroy();chartS=new Chart(c1,{type:'doughnut',data:{labels:['Sudah','Belum'],datasets:[{data:[sudah,belum],backgroundColor:['#10b981','#ef4444']}]},options:{plugins:{legend:{position:'bottom'}}}});}
 const l=siswaData.filter(s=>s.gender==='L').length;const p=siswaData.filter(s=>s.gender==='P').length;
 const c2=document.getElementById('genderChart');if(c2){if(chartG)chartG.destroy();chartG=new Chart(c2,{type:'pie',data:{labels:['L','P'],datasets:[{data:[l,p],backgroundColor:['#06b6d4','#8b5cf6']}]},options:{plugins:{legend:{position:'bottom'}}}});}
}

function renderTable(){
 const tbody=document.getElementById('tableBody');const tfoot=document.getElementById('tableFooter');if(!tbody)return;
 const q=(document.getElementById('searchInput')?.value||'').toLowerCase();const f=document.getElementById('statusFilter')?.value||'all';
 let filtered=siswaData.filter(s=>{const ms=!q||String(s.nama).toLowerCase().includes(q)||String(s.nis).toLowerCase().includes(q);const mf=f==='all'||s.status===f;return ms&&mf;});
 let total=filtered.reduce((a,b)=>a+(Number(b.nominal)||0),0);
 tbody.innerHTML=filtered.map((s,i)=>{const idx=siswaData.indexOf(s);return `<tr><td>${i+1}</td><td>${s.nis}</td><td>${s.nama}</td><td>${s.gender||'L'}</td><td>${formatRupiah(s.nominal)}</td><td>${s.tglTerakhir?new Date(s.tglTerakhir).toLocaleDateString('id-ID'):''}</td><td><span style="font-size:.7rem;padding:2px 8px;border-radius:999px;font-weight:700;background:${String(s.status).includes('Sudah')?'#dcfce7;color:#166534':'#fee2e2;color:#991b1b'}">${s.status}</span></td><td><input type="checkbox" class="rowCheck" data-idx="${idx}"/> <button class="btn" style="padding:3px 8px;font-size:.7rem" onclick="pilihEdit(${idx})">Edit</button></td></tr>`}).join('');
 tfoot.innerHTML=`<tr><td colspan="4" style="font-weight:700;text-align:right">Total (${filtered.length})</td><td style="font-weight:800">${formatRupiah(total)}</td><td colspan="3"></td></tr>`;
 document.getElementById('totalSiswa').textContent=siswaData.length;
 const sudah=siswaData.filter(s=>String(s.status).includes('Sudah')).length;const belum=siswaData.length-sudah;
 document.getElementById('sudahBayar').textContent=sudah;document.getElementById('belumBayar').textContent=belum;
 document.getElementById('sudahP').textContent=siswaData.length?Math.round(sudah/siswaData.length*100)+'%':'0%';
 document.getElementById('belumP').textContent=siswaData.length?Math.round(belum/siswaData.length*100)+'%':'0%';
 const totalMasuk=siswaData.reduce((a,b)=>a+(Number(b.nominal)||0),0);
 const keuDetail=JSON.parse(localStorage.getItem(KEU_KEY)||'[]');const grandKeu=keuDetail.reduce((a,b)=>a+(Number(b.jumlah)||0),0);
 document.getElementById('totalMasuk').textContent=formatRupiah(totalMasuk);
 document.getElementById('totalKeluar').textContent=formatRupiah(grandKeu);
 document.getElementById('saldo').textContent=formatRupiah(totalMasuk-grandKeu);
 renderCharts();
}

function siapkanBaru(){editIndex=null;document.getElementById('editNis').value='';document.getElementById('editNama').value='';document.getElementById('editNominal').value='';const el=document.getElementById('editTanggal');if(el) el.valueAsDate=new Date();document.getElementById('editStatus').value='Belum Bayar';}
function pilihEdit(i){editIndex=i;const s=siswaData[i];document.getElementById('editNis').value=s.nis;document.getElementById('editNama').value=s.nama;document.getElementById('editGender').value=s.gender||'L';document.getElementById('editNominal').value=s.nominal;const el=document.getElementById('editTanggal');if(el) el.value=s.tglTerakhir?new Date(s.tglTerakhir).toISOString().slice(0,10):'';document.getElementById('editStatus').value=s.status;}
function simpanEdit(){if(!isAdmin){toast('Login dulu','warning');return;}const nis=document.getElementById('editNis').value.trim();const nama=document.getElementById('editNama').value.trim();if(!nis||!nama){toast('NIS & Nama wajib','warning');return;}const obj={nis,nama,gender:document.getElementById('editGender').value,nominal:Number(document.getElementById('editNominal').value)||0,tglTerakhir:document.getElementById('editTanggal').value?new Date(document.getElementById('editTanggal').value).toISOString():new Date().toISOString(),status:document.getElementById('editStatus').value,ket:'',qr:''};if(editIndex===null){siswaData.push(obj);postGAS('addSiswa',obj);}else{siswaData[editIndex]=obj;postGAS('editSiswa',{oldNis:obj.nis,nis:obj.nis,nama:obj.nama,gender:obj.gender,nominal:obj.nominal,status:obj.status});}saveData();renderTable();toast('Disimpan');}
function tambahSetoran(){if(!isAdmin){toast('Login dulu','warning');return;}if(editIndex===null){toast('Pilih siswa dulu','warning');return;}const s=siswaData[editIndex];const add=10000;s.nominal=(Number(s.nominal)||0)+add;s.status='Sudah Bayar';s.tglTerakhir=new Date().toISOString();saveData();postGAS('addSetoran',{nis:s.nis,nama:s.nama,tambahan:add,totalNominal:s.nominal});renderTable();toast('Setoran 10k ditambahkan');}
function hapusTerpilih(){if(!isAdmin){toast('Login dulu','warning');return;}const cs=document.querySelectorAll('.rowCheck:checked');if(cs.length===0){toast('Pilih data','warning');return;}if(!confirm('Hapus '+cs.length+' data?'))return;const idxs=Array.from(cs).map(c=>Number(c.dataset.idx)).sort((a,b)=>b-a);idxs.forEach(i=>{postGAS('deleteSiswa',{nis:siswaData[i].nis});siswaData.splice(i,1);});editIndex=null;saveData();renderTable();toast('Dihapus');}
function resetData(){if(!isAdmin){toast('Login dulu','warning');return;}if(!confirm('Reset semua data lokal?'))return;siswaData=[];kasKeluarTotal=0;saveData();renderTable();toast('Reset');}
function tambahKasKeluar(){if(!isAdmin){toast('Login dulu','warning');return;}const v=Number(document.getElementById('kasKeluarInput').value)||0;if(v<=0){toast('Nominal >0','warning');return;}kasKeluarTotal+=v;saveData();postGAS('addPengeluaran',{keperluan:'Pengeluaran Legacy',nominal:v});document.getElementById('kasKeluarInput').value='';renderTable();toast('Pengeluaran legacy dicatat - hanya arsip');}
function setGasUrl(){const u=document.getElementById('gasUrlInput').value.trim();localStorage.setItem(GAS_KEY,u);document.getElementById('gasStatus').textContent='✅ Tersimpan';toast('URL GAS disimpan');}
async function syncData(){const url=localStorage.getItem(GAS_KEY)||document.getElementById('gasUrlInput').value.trim();if(!url){toast('Isi URL GAS','warning');return;}document.getElementById('gasStatus').textContent='⏳ Sync...';try{const r=await fetch(url+'?action=read&token=SMP_TABUNGAN_2026');const j=await r.json();if(j.success&&j.data.siswa){siswaData=j.data.siswa.map(s=>({nis:s.nis,nama:s.nama,gender:s.gender,nominal:s.nominal,ket:s.ket,status:s.status,tglTerakhir:s.tglTerakhir,qr:s.qr}));kasKeluarTotal=j.data.totalKeluar||0;saveData();renderTable();document.getElementById('gasStatus').textContent='✅ Sync berhasil '+new Date().toLocaleTimeString('id-ID');toast('Sync berhasil');}else{document.getElementById('gasStatus').textContent='❌ '+(j.error||'gagal');}}catch(e){document.getElementById('gasStatus').textContent='❌ '+e.message;}}

function exportExcel(){
 if(siswaData.length===0){toast('Data kosong','warning');return;}
 const exportData = siswaData.map((s,i)=>{
  let tglFormatted='';
  if(s.tglTerakhir){try{const d=new Date(s.tglTerakhir);if(!isNaN(d)) tglFormatted=d.toLocaleDateString('id-ID',{day:'2-digit',month:'2-digit',year:'numeric'})+' '+d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});else tglFormatted=String(s.tglTerakhir).split('T')[0];}catch(e){ tglFormatted=String(s.tglTerakhir); }}
  return {no:i+1,nis:s.nis,nama:s.nama,gender:s.gender||'',nominal:Number(s.nominal)||0,ket:s.ket||'',status:s.status||'',tglTerakhir:tglFormatted,qr:''};
 });
 const totalMasuk = siswaData.reduce((a,b)=>a+(Number(b.nominal)||0),0);
 const keuDetail = JSON.parse(localStorage.getItem(KEU_KEY)||'[]');
 const grandKredit = keuDetail.reduce((a,b)=>a+(Number(b.jumlah)||0),0);
 const saldoAkhir = totalMasuk - grandKredit;
 exportData.push({});
 exportData.push({nis:'REKAP KEUANGAN'});
 exportData.push({nis:'Saldo Awal (Total Iuran Masuk)',nama:formatRupiah(totalMasuk)});
 exportData.push({nis:'Total Pengeluaran (Grand Total)',nama:formatRupiah(grandKredit)});
 exportData.push({nis:'Saldo Akhir',nama:formatRupiah(saldoAkhir)});
 const ws=XLSX.utils.json_to_sheet(exportData);
 ws['!cols']=[{wch:5},{wch:14},{wch:28},{wch:8},{wch:14},{wch:12},{wch:14},{wch:18},{wch:8}];
 const wb=XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(wb,ws,'Iuran Kelas 7F');
 XLSX.writeFile(wb,'Laporan_Iuran_Kelas_7F_'+new Date().toISOString().slice(0,10)+'.xlsx');
}

function exportPDF(){
 if(siswaData.length===0){toast('Data kosong','warning');return;}
 const totalMasuk = siswaData.reduce((a,b)=>a+(Number(b.nominal)||0),0);
 const keuDetail = JSON.parse(localStorage.getItem(KEU_KEY)||'[]');
 const grandKredit = keuDetail.reduce((a,b)=>a+(Number(b.jumlah)||0),0);
 const saldoAkhir = totalMasuk - grandKredit;
 const sudahCount = siswaData.filter(s=>String(s.status).toLowerCase().includes('sudah')).length;
 const belumCount = siswaData.length - sudahCount;
 const c=document.getElementById('pdf-export-container');
 c.innerHTML=`<div id="pdfContent" style="font-family:Inter,Arial,sans-serif;padding:16px 18px;background:#fff;color:#000;width:210mm;box-sizing:border-box">
  <div style="text-align:center;border-bottom:3px solid #0f1a2f;padding-bottom:10px;margin-bottom:10px">
   <h1 style="margin:0;font-size:18px;font-weight:800">Laporan Keuangan SMP Pasundan 3, Kelas 7F</h1>
   <div style="font-size:11px;color:#334155;margin-top:4px">Tanggal Cetak: ${new Date().toLocaleDateString('id-ID',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})}</div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px;font-size:10px">
   <div style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:8px;padding:8px;text-align:center"><div style="font-weight:700;color:#64748b;text-transform:uppercase;font-size:9px">Saldo Awal</div><div style="font-size:13px;font-weight:800;margin-top:2px">${formatRupiah(totalMasuk)}</div></div>
   <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:8px;text-align:center"><div style="font-weight:700;color:#991b1b;text-transform:uppercase;font-size:9px">Pengeluaran</div><div style="font-size:13px;font-weight:800;margin-top:2px;color:#991b1b">${formatRupiah(grandKredit)}</div></div>
   <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:8px;text-align:center"><div style="font-weight:700;color:#166534;text-transform:uppercase;font-size:9px">Saldo Akhir</div><div style="font-size:13px;font-weight:800;margin-top:2px;color:#166534">${formatRupiah(saldoAkhir)}</div></div>
  </div>
  <table style="width:100%;border-collapse:collapse;font-size:9px;border:1px solid #94a3b8">
   <thead><tr style="background:#0f1a2f;color:#fff"><th style="padding:5px;border:1px solid #334155;width:30px">No</th><th style="padding:5px;border:1px solid #334155;width:70px">NIS</th><th style="padding:5px;border:1px solid #334155">Nama</th><th style="padding:5px;border:1px solid #334155;width:35px">L/P</th><th style="padding:5px;border:1px solid #334155;width:70px">Nominal</th><th style="padding:5px;border:1px solid #334155;width:85px">Tgl</th><th style="padding:5px;border:1px solid #334155;width:75px">Status</th></tr></thead>
   <tbody>${siswaData.map((s,i)=>{let tgl='';if(s.tglTerakhir){try{const d=new Date(s.tglTerakhir);tgl=isNaN(d)?'':d.toLocaleDateString('id-ID');}catch(e){}}return `<tr style="page-break-inside:avoid"><td style="padding:4px;border:1px solid #cbd5e1;text-align:center">${i+1}</td><td style="padding:4px;border:1px solid #cbd5e1;text-align:center">${s.nis}</td><td style="padding:4px;border:1px solid #cbd5e1">${s.nama}</td><td style="padding:4px;border:1px solid #cbd5e1;text-align:center">${s.gender||'L'}</td><td style="padding:4px;border:1px solid #cbd5e1;text-align:right">${formatRupiah(s.nominal)}</td><td style="padding:4px;border:1px solid #cbd5e1;text-align:center;font-size:8px">${tgl}</td><td style="padding:4px;border:1px solid #cbd5e1;text-align:center">${s.status}</td></tr>`;}).join('')}</tbody>
  </table></div>`;
 c.style.display='block';
 const opt={margin:[5,5,5,5],filename:`Laporan_Keuangan_SMP_Pasundan3_Kelas_7F_${new Date().toISOString().slice(0,10)}.pdf`,image:{type:'jpeg',quality:0.98},html2canvas:{scale:2},jsPDF:{unit:'mm',format:'a4',orientation:'portrait'},pagebreak:{mode:['css','legacy']}};
 html2pdf().set(opt).from(document.getElementById('pdfContent')).save().then(()=>{c.style.display='none';});
}

function onScanSuccess(d){document.getElementById('editNis').value=d;document.getElementById('scanResult').textContent='✅ '+d;toast('QR: '+d);setTimeout(()=>{const el=document.getElementById('scannerContainer');if(el) el.style.display='none';},800);}
function stopScanner(){const inst=window.qrScannerInstance; if(inst){try{inst.stop().then(()=>{inst.clear();}).catch(()=>{});}catch(e){}}const el=document.getElementById('scannerContainer');if(el) el.style.display='none';}
