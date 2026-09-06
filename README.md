# SMP Pasundan 3 - Dashboard Keuangan Terpadu (Github Pages Ready)

Struktur sudah dipisah biar ringan, siap upload ke Github.

## Cara Upload ke Github
1. Buat repo baru misal: keuangan-sekolah
2. Upload semua file & folder (index.html, keuangan.html, stamp-cam.html, css/, js/) ke root repo
3. Settings > Pages > Deploy from branch > main / root > Save
4. Tunggu 1-2 menit, link jadi: https://username.github.io/keuangan-sekolah/

## Cara Link Antar Halaman
- Jangan pakai absolute path C:/Users/...
- Pakai relative path seperti di file:
  <a href="index.html">Iuran</a>
  <a href="keuangan.html">Keuangan</a>
  <a href="stamp-cam.html">Stamp Cam</a>
  <link rel="stylesheet" href="css/style.css"/>
  <script src="js/config.js"></script>

- Karena semua pakai localStorage dengan key sama (siswaData, keu_detail, kasKeluarTotal), data tetap sinkron antar halaman selama masih 1 domain.

## Catatan Penting
- Saldo Akhir = Saldo Awal (dari iuran) - Grand Total Belanja Detail (tanpa legacy)
- Legacy Rp 94.500 di halaman Iuran hanya arsip, tidak dipotong lagi di Keuangan
- Kamera default OFF hemat baterai, klik ON saat mau foto
- Login default: admin / admin123 (tersimpan di localStorage key akunAdmin)

## File GAS
Gunakan file kode_gabungan_perbaikan_GAS.js yang sudah ada, ganti DRIVE_FOLDER_ID dan SHEET_ID.

Handcrafted by Yudi & Meta AI
