-- Izinkan tim Tenko (user login) update kolom faktor tensi
-- Tanpa policy ini, Supabase RLS memblokir UPDATE → save kelihatan sukses di UI tapi hilang setelah refresh

ALTER TABLE tenko
  ADD COLUMN IF NOT EXISTS tensi_faktor text,
  ADD COLUMN IF NOT EXISTS tensi_keterangan text;

ALTER TABLE tenko ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenko_authenticated_update_tensi_faktor" ON tenko;
CREATE POLICY "tenko_authenticated_update_tensi_faktor"
  ON tenko
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RPC fallback (SECURITY DEFINER) jika policy langsung belum cukup
CREATE OR REPLACE FUNCTION update_tenko_tensi_faktor(
  p_id text DEFAULT NULL,
  p_tanggal date DEFAULT NULL,
  p_timestamp text DEFAULT NULL,
  p_nama_driver text DEFAULT NULL,
  p_nik text DEFAULT NULL,
  p_tensi_faktor text DEFAULT NULL,
  p_tensi_keterangan text DEFAULT NULL
)
RETURNS SETOF tenko
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_id IS NOT NULL AND btrim(p_id) <> '' THEN
    RETURN QUERY
    UPDATE tenko
    SET
      tensi_faktor = p_tensi_faktor,
      tensi_keterangan = p_tensi_keterangan
    WHERE id::text = p_id
    RETURNING *;

    IF FOUND THEN
      RETURN;
    END IF;
  END IF;

  RETURN QUERY
  UPDATE tenko
  SET
    tensi_faktor = p_tensi_faktor,
    tensi_keterangan = p_tensi_keterangan
  WHERE tanggal = p_tanggal
    AND timestamp = p_timestamp
    AND (
      (p_nama_driver IS NOT NULL AND nama_driver = p_nama_driver)
      OR (p_nik IS NOT NULL AND nik = p_nik)
    )
  RETURNING *;
END;
$$;

REVOKE ALL ON FUNCTION update_tenko_tensi_faktor FROM PUBLIC;
GRANT EXECUTE ON FUNCTION update_tenko_tensi_faktor TO authenticated;
