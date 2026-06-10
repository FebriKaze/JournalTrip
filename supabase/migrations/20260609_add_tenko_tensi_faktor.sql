-- Faktor / alasan tensi abnormal (diisi tim Tenko saat pemeriksaan)
ALTER TABLE tenko
  ADD COLUMN IF NOT EXISTS tensi_faktor text,
  ADD COLUMN IF NOT EXISTS tensi_keterangan text;

COMMENT ON COLUMN tenko.tensi_faktor IS 'Faktor penyebab hipertensi/hipotensi (dropdown tim Tenko)';
COMMENT ON COLUMN tenko.tensi_keterangan IS 'Catatan tambahan faktor tensi (opsional, terutama jika faktor Lainnya)';
