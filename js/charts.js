// ===== CHARTS =====
let chartS = null;
let chartG = null;

function renderCharts() {
  const sudah = siswaData.filter(s => String(s.status).toLowerCase().includes('sudah')).length;
  const belum = siswaData.length - sudah;
  
  const c1 = document.getElementById('statusChart');
  if (c1) {
    if (chartS) chartS.destroy();
    chartS = new Chart(c1, {
      type: 'doughnut',
      data: {
        labels: ['Sudah', 'Belum'],
        datasets: [{ data: [sudah, belum], backgroundColor: ['#10b981', '#ef4444'] }]
      },
      options: { plugins: { legend: { position: 'bottom' } } }
    });
  }

  const l = siswaData.filter(s => s.gender === 'L').length;
  const p = siswaData.filter(s => s.gender === 'P').length;
  const c2 = document.getElementById('genderChart');
  if (c2) {
    if (chartG) chartG.destroy();
    chartG = new Chart(c2, {
      type: 'pie',
      data: {
        labels: ['L', 'P'],
        datasets: [{ data: [l, p], backgroundColor: ['#06b6d4', '#8b5cf6'] }]
      },
      options: { plugins: { legend: { position: 'bottom' } } }
    });
  }
}
