# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## TRAZYL B2B — Bursa Bahan Baku Sekunder & Scrap Industri Indonesia

**Document Version:** 2.4.0 (Production Release)  
**Status:** Approved for Production  
**Target Platform:** Web (Desktop & Mobile-Optimized PWA)  
**Classification:** Proprietary / Industrial Infrastructure  

---

## 1. Executive Summary & Visi Produk

### 1.1 Latar Belakang Industri
Industri manufaktur dan smelter logam di Indonesia sangat bergantung pada pasokan bahan baku sekunder (scrap besi, tembaga, aluminium, plastik daur ulang, kertas industri, dan sisa permesinan pabrik). Namun, ekosistem perdagangan scrap konvensional dihadapkan pada inefisiensi kritis:
1. **Rantai Tengkulak & Calo Berlapis (*Multi-Tier Brokers*):** Selisih harga jual dari depo lapangan dengan harga terima smelter dapat terpaut 15%–30% akibat calo tidak resmi.
2. **Ketiadaan Jaminan Pembayaran & Fraud:** Risiko gagal bayar (*default payment*) bagi penjual dan risiko barang tidak terkirim atau spesifikasi tidak sesuai bagi pabrik.
3. **Perselisihan Selisih Timbangan (*Weighbridge Variance*):** Ketidaksepakatan tonase antara timbangan awal depo vs timbangan masuk pabrik sering memicu sengketa pengiriman.
4. **Deviasi Kualitas & Kontaminasi (*Assay / Purity Drop*):** Penurunan persentase kemurnian scrap (misal kadar tembaga <95% atau kadar kotoran besi scrap HMS >5%) yang tidak diatur dalam mekanisme denda/penalti yang adil dan transparan.
5. **Keterbatasan Kapasitas Pengepul Menengah/Kecil:** Pabrik seringkali menerbitkan PO dalam skala masif (misal 500 MT per kontrak), sementara depo daerah hanya sanggup menyediakan 20–50 MT, sehingga depo kecil tersingkir dari rantai pasok resmi.

### 1.2 Visi & Nilai Solusi TRAZYL
**TRAZYL B2B** adalah bursa komoditas sekunder digital pertama di Indonesia yang menggabungkan:
- **Direct Trading Engine (P2P B2B):** Menghubungkan depo terverifikasi langsung dengan pabrik dan smelter tanpa perantara liar.
- **Smart Escrow & True-Up Settlement:** Dana pembeli dikunci aman di akun escrow sebelum armada jalan, dan nilai akhir pelunasan dihitung ulang otomatis (*true-up*) berdasar **tiket timbangan resmi** dan **inspeksi kualitas (QC)** saat barang tiba di gerbang pabrik.
- **Split Order Engine:** Mengagregasi pasokan dari belasan pengepul kecil untuk memenuhi satu kontrak tender pabrik skala besar secara simultan.
- **Digital Docket & Material Passport:** Rekam jejak rantai pasok (*chain of custody*) terverifikasi, sertifikasi bebas radiasi, dan kalkulasi kontribusi penghematan jejak karbon (*Scope 3 ESG Decarbonization*).

---

## 2. Profil Pengguna & Persona (*Target Personas*)

| Persona | Peran di Platform | Karakteristik & Kebutuhan Utama |
| :--- | :--- | :--- |
| **Pak Dedi (Pemilik Depo Scrap Cilegon)** | **Supplier / Penjual** | Mengelola 50-100 ton scrap besi dan tembaga per bulan. Butuh kepastian pembayaran tepat waktu (H+1 timbang), jaminan bebas pemerasan calo, dan kemudahan upload iklan via HP. |
| **Ibu Maya (Head of Procurement Smelter Karawang)** | **Buyer / Pembeli Terverifikasi** | Membutuhkan pasokan 500-1.000 ton scrap HMS-1/ISRI 200 per bulan. Butuh PO resmi, legalitas NIB/NPWP supplier aman dari audit pajak, jaminan kemurnian peleburan, dan mitigasi risiko susut muatan. |
| **Bambang (Transporter / Logistik Truk)** | **Fleet Operator** | Mengoperasikan armada Tronton & CDD. Butuh Surat Jalan digital (Digital Docket), QR code akses timbangan pabrik, dan verifikasi muatan anti-manipulasi. |
| **Ir. Hendra (Surveyor QC & Juru Timbang)** | **Inspektur Lapangan** | Bertugas memasukkan data tiket timbangan (*gross*, *tare*, *net weight*) dan persentase kemurnian sampel laboratorium ke dalam sistem. |
| **Superadmin / Tim Escrow TRAZYL** | **Platform Arbitrator & Compliance** | Memverifikasi KYC/NIB/NPWP perusahaan, memantau mutasi rekening escrow, menyelesaikan perselisihan selisih timbangan, dan merilis dana ke rekening penjual. |

---

## 3. Aturan Bisnis & Mekanisme Inti (*Core Business Rules*)

### 3.1 Model Hak Akses Pengguna (*Unified Customer Role*)
1. Setiap pendaftar baru (*customer*) secara *default* langsung memiliki hak sebagai **Penjual (Seller)**. Penjual dapat langsung memasang iklan stok (*create listing*), membalas tawaran, atau mengajukan penawaran pada tender pabrik.
2. Untuk membuka hak akses sebagai **Pembeli (Buyer)** dan melakukan pemesanan langsung (*checkout*), pengguna **wajib** melakukan **Verifikasi Legalitas Pembeli**:
   - Mengunggah Nomor Induk Berusaha (NIB OSS RBA).
   - Mengunggah NPWP Perusahaan dan Akta Perusahaan.
   - Mengisi data penanggung jawab (PIC) dan alamat fasilitas pabrik/gudang.
   - Status legalitas: `UNVERIFIED` &rarr; `PENDING` &rarr; `VERIFIED` (oleh Superadmin) atau `REJECTED`.

### 3.2 Saluran Perdagangan Komoditas (*Trading Channels*)
Platform menyediakan 3 format transaksi yang saling melengkapi:
1. **Katalog Stok Siap Kirim (Beli Langsung / Ready Stock):**
   - Transaksi jual beli instan dengan harga satuan tetap (*Fixed Price*) atau penawaran harga (*Negotiation*).
   - Pengaturan Incoterm: `EXW` (Ambil di Depo), `FOB` (Franco Pelabuhan), `CIF`, atau `DDP` (Sampai di Pabrik).
2. **Lelang Kilat Pabrik (Flash Auction):**
   - Lelang unit permesinan pabrik, alat berat, atau lot scrap khusus dengan batas waktu surut (*countdown timer*).
   - Mekanisme penawaran kompetitif (*bid increment* terukur) dengan pemenang berhak melanjutkan ke kontrak escrow.
3. **Tender Pabrik & Split Order Procurement (Reverse Bid / RFQ):**
   - Pabrik menerbitkan permintaan material (contoh: 200 MT Besi Plat Stamping, Target Rp 7.200/kg).
   - Berbagai depo scrap dapat mengirimkan respon kapasitas parsial (contoh: Depo A pasok 40 MT, Depo B pasok 60 MT).
   - Sistem mengakumulasikan pemenuhan secara otomatis hingga kuota 100% terpenuhi dan menghasilkan kontrak pengadaan terpisah untuk masing-masing depo.

### 3.3 Siklus Hidup Escrow 7 Tahap (*7-Stage Smart Escrow & True-Up Settlement*)
```
[1. PAYMENT_PENDING] ──> [2. PAID / ESCROW HELD] ──> [3. PICKUP_SCHEDULED]
                                                              │
[6. QC & PURITY] <────── [5. WEIGHING / TIMBANG] <─────── [4. PICKED_UP]
       │
       ▼
[7. SETTLEMENT & PAYOUT] ─── (Jika ada selisih melebihi toleransi) ───> [DISPUTED]
```

1. **`PAYMENT_PENDING`:** Pesanan dibuat berdasarkan harga PO asli (`totalOriginalValue = agreedPricePerUnit * quantity`).
2. **`PAID` (Escrow Funded):** Pembeli menyetorkan 100% dana ke Virtual Account / Rekening Escrow Penampung TRAZYL. Dana dijamin tidak dapat ditarik sepihak.
3. **`PICKUP_SCHEDULED`:** Penjual dan armada logistik menetapkan tanggal muat, nomor polisi truk, nama supir, dan nomor Surat Jalan.
4. **`PICKED_UP`:** Barang dimuat di depo penjual dan supir mengonfirmasi keberangkatan menuju fasilitas pabrik pembeli.
5. **`WEIGHING` (Jembatan Timbang):** Truk memasuki jembatan timbang pembeli/independen:
   - Data tercatat: Berat Kotor (*Gross*), Berat Kosong Truk (*Tare*), dan Berat Bersih Aktual (*Actual Net Weight*).
   - Bukti nomor tiket timbangan (*ticket number*) dan foto tiket diunggah ke sistem.
6. **`QC` (Uji Mutu Laboratorium):**
   - Petugas mengambil sampel material untuk menguji persentase kemurnian (*sample purity %*).
   - Jika kemurnian berada di bawah toleransi kontrak (misal kontrak mensyaratkan 95%, namun hasil lab menunjukkan 91%), sistem mengenakan denda penyesuaian kualitas (*quality adjustment penalty*).
7. **`SETTLEMENT` (Pelunasan Akhir):**
   - Nilai akhir transaksi dihitung ulang secara matematis:
     $$\text{Adjusted Value} = (\text{Actual Net Weight} \times \text{Agreed Price/Unit}) - \text{Quality Penalty}$$
   - Selisih dana (*True-Up Delta*):
     - Jika berat aktual < berat PO: sisa kelebihan dana pembeli dikembalikan otomatis (*refunded*) ke saldo dompet pembeli.
     - Jika berat aktual > berat PO (dan disetujui toleransi muatan): pembeli melunasi sisa tagihan dari deposit dompet.
   - Payout dilepaskan ke dompet penjual setelah dikurangi biaya layanan platform (*platform fee*).

### 3.4 Kebijakan Pencegahan Transaksi Luar Platform (*Anti-Off-Platform Protocol*)
1. Sistem messenger/chat negosiasi secara *real-time* menyensor nomor telepon, email, nomor rekening bank, dan kata kunci transaksi luar platform (*e.g., 'transfer langsung', 'bayar cash di luar', 'hubungi nomor ini'*).
2. Peringatan modal otomatis (*Off-Platform Warning Modal*) muncul jika terdeteksi indikasi kebocoran transaksi untuk melindungi integritas jaminan escrow.
3. Kontak lengkap PIC dan Surat Jalan resmi hanya terbuka setelah status transaksi mencapai `PAID` (dana escrow aman).

---

## 4. Rincian Fitur & Modul Aplikasi

### 4.1 Modul Publik & Marketplace
- **Hero & Live Price Ticker:** Menampilkan indeks harga scrap terkini per wilayah (Jakarta, Surabaya, Medan, Semarang) dengan persentase perubahan harian.
- **Kalkulator Freight & Ongkos Angkut:** Perhitungan estimasi biaya pengiriman per kg/MT berdasarkan jarak (km) dan jenis armada (CDD 8 MT, Tronton 20 MT, Wingbox 30 MT).
- **Search & Advanced Filter:** Pencarian multi-kategori (Logam Ferro, Tembaga/Kuningan, Aluminium, Plastik Daur Ulang, Kertas/OCC, Aki/E-Waste, Mesin Industri) berdasarkan Incoterm dan radius lokasi.
- **Lelang Kilat Widget:** Tampilan lot lelang aktif dengan hitungan mundur dan riwayat penawaran terakhir.

### 4.2 Modul Transaksi & Negosiasi B2B
- **Two-Way Negotiation Messenger:** Diskusi harga dan tonase dengan kartu penawaran interaktif (*Interactive Offer Card*). Pihak lawan dapat melakukan *Accept*, *Reject*, atau *Counter Offer*.
- **Checkout & Escrow Funding Gateway:** Ringkasan kontrak jual beli, kalkulasi PPN/PPH 22 scrap, biaya asuransi muatan, dan biaya escrow platform.
- **Digital Docket (Surat Jalan Digital):** Surat jalan elektronik ber-QR Code yang memuat nomor polisi, identitas supir, koordinat depo muat, dan tujuan pabrik pembeli.
- **Material Passport:** Lembar paspor material digital yang mencatat sertifikasi bebas radiasi, uji komposisi unsur kimia, dan kredit pengurangan emisi CO2 dibandingkan pengolahan bijih murni (*Virgin Ore*).

### 4.3 Modul Dashboard Customer
- **Ringkasan Transaksi:** Metrik saldo dompet escrow, tonase terjual, tonase dibeli, dan efisiensi pengadaan.
- **Manajemen Iklan Stok (Penjual):** Form penambahan stok scrap dengan spesifikasi ISRI/SNI, foto gudang, dan batas minimal pembelian.
- **Manajemen Pesanan & Surat Jalan:** Pelacakan status truk *real-time*, validasi tiket timbangan, dan persetujuan rekonsiliasi akhir.
- **Verifikasi Legalitas Pembeli:** Portal unggah dokumen legalitas korporasi untuk membuka hak beli.
- **Dompet & Mutasi Saldo (Escrow Wallet):** Riwayat pencairan dana (*withdrawal*) ke rekening bank operasional perusahaan dan catatan deposit garansi lelang.

### 4.4 Modul Admin & Compliance Console
- **KYC & Legalitas Queue:** Peninjauan dokumen NIB dan NPWP dengan validasi berkas OSS.
- **Monitoring Transaksi & Escrow Release:** Hak superadmin untuk mengonfirmasi transfer perbankan, menahan dana sengketa, atau merilis pelunasan manual.
- **Pusat Arbitrase Sengketa (Dispute Resolution):** Investigasi selisih timbangan atau penolakan kontaminasi material, penelaahan bukti foto dan tiket uji lab, serta penerbitan keputusan pengembalian parsial (*partial refund*) atau pelepasan dana.
- **Price Index Manager:** Pembaruan benchmark harga acuan harian industri scrap nasional.
- **Fee Configuration & Audit Logs:** Pengaturan tarif komisi transaksi platform (0.5%–2%) dan log aktivitas keamanan (*immutable audit trail*).

---

## 5. Kebutuhan Non-Fungsional (*Non-Functional Requirements*)

### 5.1 Keamanan & Kepatuhan (*Security & Compliance*)
1. **Prinsip ACID pada Transaksi Finansial:** Semua mutasi saldo escrow dan true-up settlement wajib menggunakan *atomic database transactions* (PostgreSQL isolated transactions) dengan idempotency key guna mencegah *double payout*.
2. **Enkripsi Data PII:** Enkripsi nomor rekening bank, KTP PIC, dan dokumen NIB saat disimpan (*Encryption-at-Rest* via AES-256) dan dalam perjalanan (*Encryption-in-Transit* via TLS 1.3).
3. **Role-Based Access Control (RBAC):** Pemisahan ketat antara customer (public/seller/verified buyer) dan superadmin melalui validasi *server-side middleware*.

### 5.2 Performa & Keandalan (*Performance & Scalability*)
1. **Waktu Muat Halaman (Page Load Speed):** LCP (*Largest Contentful Paint*) < 2.0 detik pada koneksi 4G seluler.
2. **Ketersediaan Layanan (Availability):** 99.9% uptime dengan cadangan basis data otomatis setiap 6 jam.
3. **Mobile Responsiveness:** Desain adaptif berbasis Tailwind CSS dengan navigasi *fixed bottom navigation* yang ramah jempol (*thumb-friendly*) untuk mandor depo dan supir truk di lapangan.

---

## 6. Metrik Keberhasilan Produk (*Key Performance Indicators*)

1. **Gross Merchandise Value (GMV):** Akumulasi nilai transaksi scrap yang diselesaikan melalui sistem escrow resmi.
2. **Dispute Resolution Rate:** >95% perselisihan selisih timbangan terselesaikan secara damai dalam waktu <24 jam kerja menggunakan formula true-up otomatis.
3. **Repeat Factory Procurement Rate:** >70% pabrik pembeli menerbitkan kembali tender pasokan berkala di platform dalam rentang 60 hari.
4. **Zero Off-Platform Leakage:** Rasio kebocoran nomor kontak luar platform pada pesan negosiasi mendekati 0%.
