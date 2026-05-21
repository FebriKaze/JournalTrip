export interface P2HItemDef {
  id: string;
  item: string;
  syarat: string;
}

export interface P2HCategoryDef {
  id: string;
  title: string;
  items: P2HItemDef[];
}

export const P2H_CATEGORIES: P2HCategoryDef[] = [
  {
    id: 'apd',
    title: '1. Alat Pelindung Diri (APD) Operator',
    items: [
      { id: '1.1', item: 'Pakaian seragam Driver & Co-driver', syarat: 'Seragam atas nama perusahaan, kondisi layak (Bersih, tidak robek)' },
      { id: '1.2', item: 'Sepatu sol karet Driver & Co-driver', syarat: 'Kondisi layak, digunakan dengan baik & benar' },
      { id: '1.3', item: 'Helmet Safety Driver & Co-driver', syarat: 'Kondisi layak (bersih, tidak pecah), bertali, digunakan dengan baik & benar' },
      { id: '1.4', item: 'Sarung Tangan Driver (Bahan kain, Yellow Dotted)', syarat: 'Sarung tangan kondisi layak (tidak sobek & kotor)' },
      { id: '1.5', item: 'Sarung tangan khusus co-driver (Kulit)', syarat: 'Sarung tangan kondisi layak (tidak sobek & kotor)' },
      { id: '1.6', item: 'Driver & Co-Driver tidak boleh memakai aksesoris metal', syarat: 'Jam, gelang, cincin, kalung' },
    ]
  },
  {
    id: 'dokumen',
    title: '2. Dokumen dan Surat - surat',
    items: [
      { id: '2.1', item: 'STNK & Pajak Kendaraan', syarat: 'Sesuai dengan Nopol, Masih berlaku, dokumen asli' },
      { id: '2.2', item: 'Keur kendaraan', syarat: 'Sesuai Nopol, Masih berlaku, asli (Head & Chasis)' },
      { id: '2.3', item: 'SIM Driver', syarat: 'Masih berlaku & dokumen asli' },
      { id: '2.4', item: 'KTP Driver & Co-Driver', syarat: 'Dokumen asli' },
      { id: '2.5', item: 'Handphone', syarat: 'Dibawa & aktif datanya' },
    ]
  },
  {
    id: 'keamanan',
    title: '3. Perlengkapan Alat Keamanan',
    items: [
      { id: '3.1', item: 'Stopper Ban min 2 pcs', syarat: 'Ada pegangan, tali pengait, tidak rapuh & digunakan dengan benar' },
      { id: '3.2', item: 'Lampu Senter, Stick Lamp', syarat: 'Ada & Berfungsi dengan baik (menyala)' },
      { id: '3.3', item: 'Alat Pemadam Api Ringan (APAR) min. 1 kg', syarat: 'Indikator hijau & tidak expired' },
      { id: '3.4', item: 'Kotak P3K', syarat: 'Lengkap (min. obat merah, perban, alkohol, plester) & tidak expired' },
      { id: '3.5', item: 'Segitiga Pengaman min 40cm / Safety Cone', syarat: 'Ada & berfungsi dengan baik (memantulkan cahaya)' },
      { id: '3.6', item: 'Tools Set Kendaraan', syarat: 'Dongkrak 32 Ton, kunci roda, tuas pengungkit berfungsi baik' },
    ]
  },
  {
    id: 'headtruck',
    title: '4. Head Truck',
    items: [
      { id: '4.1', item: 'Terpasang GPS dan online', syarat: 'Pastikan GPS aktif (cek by web)' },
      { id: '4.2', item: 'Body truck', syarat: 'Head truck tidak keropos (Pintu, base/pijakan & atap)' },
      { id: '4.3', item: 'Pedal gas, rem, kopling, rem tangan, steering', syarat: 'Jarak speleng normal, tidak bocor/rembes, indikator angin normal' },
      { id: '4.4', item: 'Safety belt', syarat: 'Pengunci safety belt berfungsi dengan baik' },
      { id: '4.5', item: '5R Cabin', syarat: 'Kondisi bersih dan barang sesuai dengan tempatnya' },
      { id: '4.6', item: 'Air radiator, wiper & air wiper', syarat: 'Jumlah air normal, tidak bocor, wiper berfungsi baik' },
      { id: '4.7', item: 'Oli mesin, minyak rem, minyak power steering', syarat: 'Jumlah minyak dalam batas normal, tidak bocor/rembes' },
      { id: '4.8', item: 'Lampu depan, sign, rotary, tembak, klakson', syarat: 'Semua lampu menyala, cover tidak retak, klakson berfungsi' },
      { id: '4.9', item: 'Kaca Spion Truck', syarat: 'Lengkap, Kondisi baik, tidak ada retak atau pecah' },
      { id: '4.10', item: 'Tangki solar', syarat: 'Ada penutupnya, isi solar cukup, tidak ada kebocoran' },
      { id: '4.11', item: 'Accu (2pcs)', syarat: 'Air accu cukup, accu berfungsi dengan baik' },
    ]
  },
  {
    id: 'chasis',
    title: '5. Chasis',
    items: [
      { id: '5.1', item: 'Ban chasis (FR-R, FR-L, RR-R, RR-L)', syarat: 'Ban original, tekanan cukup, tidak gundul/sobek, ketebalan min 2mm' },
      { id: '5.2', item: 'Tuas hidrolik, Tabung & selang hidrolik', syarat: 'Berfungsi dengan baik, tidak bocor/rembes' },
      { id: '5.3', item: 'Tuas hidrolik, Tabung & selang hidrolik Roof', syarat: 'Berfungsi dengan baik, tidak bocor/rembes' },
      { id: '5.4', item: 'Side cover chasis mandatory', syarat: 'Terpasang di rack bawah bagian kanan & kiri, tidak sobek' },
      { id: '5.5', item: 'Terpasang safety rope', syarat: '4 di tiap sisi' },
      { id: '5.6', item: 'Lampu sign, rem, mundur, loading', syarat: 'Semua lampu menyala normal & cover tidak retak' },
      { id: '5.7', item: 'Penutup drop hole berfungsi dengan baik', syarat: 'Drop hole dalam kondisi baik, tidak bengkok & patah' },
      { id: '5.8', item: 'Terpasang anti slip paper di rack atas', syarat: 'Kondisi baik, tidak terkelupas' },
      { id: '5.9', item: 'Sepatu rak atas, pin stopper', syarat: 'Ada, berfungsi normal' },
      { id: '5.10', item: 'Pengunci sepatu rak atas', syarat: 'Ada, berfungsi normal, tidak bengkok/keropos' },
      { id: '5.11', item: 'Sling, tracker, behel lashing rak atas', syarat: 'Sling tidak berserabut>7, tidak berkarat/rusak, tracker normal' },
      { id: '5.12', item: 'Sling, tracker rak bawah', syarat: 'Sling tidak berserabut>7, tidak berkarat/rusak, tracker normal' },
      { id: '5.13', item: 'Rol J-Hook, J-Hook, Mur Pengunci', syarat: 'Tidak berkarat, tidak patah, fungsi normal' },
      { id: '5.14', item: 'Chamber rem, selang angin rem', syarat: 'Berfungsi normal dan tidak bocor' },
    ]
  },
  {
    id: 'tangga',
    title: '6. Tangga',
    items: [
      { id: '6.1', item: 'Kondisi tangga', syarat: 'Tidak berkarat, tidak retak, tidak keropos, pokayoke jelas' },
      { id: '6.2', item: 'Landasan tangga', syarat: 'Menapak sempurna, tidak miring/bengkok' },
      { id: '6.3', item: 'Pengunci tangga saat Loading/Unloading', syarat: 'Berfungsi dengan baik, tidak patah, tidak bengkok' },
      { id: '6.4', item: 'Pengunci tangga saat Moving/Delivery', syarat: 'Pengunci ada dan berfungsi dengan baik' },
    ]
  }
];
