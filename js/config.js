
const AKUN_KEY='akunAdmin', GAS_KEY='gas_webapp_url', KEU_KEY='keu_detail';
let siswaData=[],kasKeluarTotal=0,isAdmin=false;
function getAkun(){try{const s=localStorage.getItem(AKUN_KEY);if(s)return JSON.parse(s);}catch(e){}return {user:'admin',pass:'admin123'}}
function loadData(){try{siswaData=JSON.parse(localStorage.getItem('siswaData')||'[]')}catch(e){siswaData=[]}try{kasKeluarTotal=Number(localStorage.getItem('kasKeluarTotal')||0)}catch(e){kasKeluarTotal=0}}
function saveData(){localStorage.setItem('siswaData',JSON.stringify(siswaData));localStorage.setItem('kasKeluarTotal',String(kasKeluarTotal));}
function formatRupiah(n){return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',minimumFractionDigits:0}).format(n||0)}
function toast(m,t='success'){
 const el=document.getElementById('toast'); if(!el) return;
 document.getElementById('toastMsg').textContent=m;
 el.className='toast show'; setTimeout(()=>el.className='toast',3000);
}
function checkLogin(){
 const is=localStorage.getItem('isAdmin')==='true';
 isAdmin=is;
 const overlay=document.getElementById('loginOverlay');
 if(overlay) overlay.classList.remove('show');
 const lo=document.getElementById('logoutBtn'); if(lo) lo.style.display=is?'inline-flex':'none';
 const li=document.getElementById('loginToggleBtn'); if(li) li.style.display=is?'none':'inline-flex';
 const ap=document.getElementById('adminPanel'); if(ap) ap.className=is?'show':'';
 const info=document.getElementById('loginInfo'); if(info) info.style.display=is?'none':'block';
 if(typeof renderTable==='function') renderTable();
}
async function postGAS(a,p){const url=localStorage.getItem(GAS_KEY)||document.getElementById('gasUrlInput')?.value.trim();if(!url)return;try{await fetch(url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:'SMP_TABUNGAN_2026',action:a,payload:p})});}catch(e){}}
