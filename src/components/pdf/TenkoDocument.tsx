import React from 'react';
import { TenkoRecord } from '../../services/tenkoService';
import Logo from '../../image/Logo.png';
import Logo1 from '../../image/logo1.png';

interface TenkoDocumentProps {
  tenko: TenkoRecord;
}

export default function TenkoDocument({ tenko }: TenkoDocumentProps) {
  const isHealthy = 
    (tenko.sistolik >= 100 && tenko.sistolik <= 130 && tenko.diastolik >= 60 && tenko.diastolik <= 90) &&
    (tenko.denyut_nadi >= 60 && tenko.denyut_nadi <= 100) &&
    (tenko.suhu_tubuh >= 36.1 && tenko.suhu_tubuh <= 37.2) &&
    (tenko.alkohol === 0) &&
    (tenko.oxygen_saturation >= 95) &&
    (tenko.rest_time >= 7);

  return (
    <div id="tenko-print-document" className="bg-white w-[794px] h-[1123px] text-black font-sans overflow-hidden">
      {/* A4 Size */}
      <div className="p-10 border-2 border-black m-4 h-[1091px] flex flex-col relative">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
          <div className="flex gap-4 items-center">
             <img src={Logo} alt="Logo" className="h-12" />
          </div>
          <div className="text-center flex-1">
            <h1 className="text-2xl font-black uppercase tracking-widest">Formulir Pemeriksaan Kesehatan (Tenko)</h1>
            <h2 className="text-lg font-bold">PT. K-LINE MOBARU DIAMOND INDONESIA</h2>
          </div>
        </div>

        {/* Info Box */}
        <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-8 text-sm">
          <div className="flex border-b border-black pb-1">
            <div className="w-40 font-bold uppercase">Nama Driver</div>
            <div className="flex-1 font-semibold uppercase">: {tenko.nama_driver}</div>
          </div>
          <div className="flex border-b border-black pb-1">
            <div className="w-40 font-bold uppercase">Tanggal Pemeriksaan</div>
            <div className="flex-1 font-semibold uppercase">: {tenko.tanggal}</div>
          </div>
          <div className="flex border-b border-black pb-1">
            <div className="w-40 font-bold uppercase">No. Polisi</div>
            <div className="flex-1 font-semibold uppercase">: {tenko.nopol}</div>
          </div>
          <div className="flex border-b border-black pb-1">
            <div className="w-40 font-bold uppercase">Waktu (Jam)</div>
            <div className="flex-1 font-semibold uppercase">: {tenko.timestamp ? new Date(tenko.timestamp).toLocaleTimeString() : '__:__'}</div>
          </div>
          <div className="flex border-b border-black pb-1">
            <div className="w-40 font-bold uppercase">No. Lambung</div>
            <div className="flex-1 font-semibold uppercase">: {tenko.no_lambung || '-'}</div>
          </div>
          <div className="flex border-b border-black pb-1">
            <div className="w-40 font-bold uppercase">Status Tenko</div>
            <div className="flex-1 font-black uppercase">
              : {isHealthy ? 'SIAP OPERASIONAL' : 'TIDAK SIAP (NG)'}
            </div>
          </div>
        </div>

        {/* Measurement Table */}
        <h3 className="font-black text-lg mb-2 uppercase">Hasil Pengukuran Medis</h3>
        <table className="w-full border-collapse border border-black mb-8">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black p-2 text-left uppercase text-xs w-10">No</th>
              <th className="border border-black p-2 text-left uppercase text-xs">Parameter Pemeriksaan</th>
              <th className="border border-black p-2 text-center uppercase text-xs w-48">Hasil / Nilai</th>
              <th className="border border-black p-2 text-center uppercase text-xs w-32">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2 text-center">1</td>
              <td className="border border-black p-2 font-bold">Tekanan Darah (Sistolik / Diastolik)</td>
              <td className="border border-black p-2 text-center">{tenko.sistolik} / {tenko.diastolik} mmHg</td>
              <td className="border border-black p-2 text-center font-bold">
                {(tenko.sistolik >= 100 && tenko.sistolik <= 130 && tenko.diastolik >= 60 && tenko.diastolik <= 90) ? 'OK' : 'NG'}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">2</td>
              <td className="border border-black p-2 font-bold">Denyut Nadi</td>
              <td className="border border-black p-2 text-center">{tenko.denyut_nadi} bpm</td>
              <td className="border border-black p-2 text-center font-bold">
                {(tenko.denyut_nadi >= 60 && tenko.denyut_nadi <= 100) ? 'OK' : 'NG'}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">3</td>
              <td className="border border-black p-2 font-bold">Suhu Tubuh</td>
              <td className="border border-black p-2 text-center">{tenko.suhu_tubuh} °C</td>
              <td className="border border-black p-2 text-center font-bold">
                {(tenko.suhu_tubuh >= 36.1 && tenko.suhu_tubuh <= 37.2) ? 'OK' : 'NG'}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">4</td>
              <td className="border border-black p-2 font-bold">Kadar Alkohol (Breathalyzer)</td>
              <td className="border border-black p-2 text-center">{tenko.alkohol} %</td>
              <td className="border border-black p-2 text-center font-bold">
                {tenko.alkohol === 0 ? 'OK' : 'NG'}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">5</td>
              <td className="border border-black p-2 font-bold">Saturasi Oksigen (SpO2)</td>
              <td className="border border-black p-2 text-center">{tenko.oxygen_saturation} %</td>
              <td className="border border-black p-2 text-center font-bold">
                {tenko.oxygen_saturation >= 95 ? 'OK' : 'NG'}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">6</td>
              <td className="border border-black p-2 font-bold">Waktu Istirahat (Rest Time)</td>
              <td className="border border-black p-2 text-center">{tenko.rest_time} Jam</td>
              <td className="border border-black p-2 text-center font-bold">
                {tenko.rest_time >= 7 ? 'OK' : 'NG'}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">7</td>
              <td className="border border-black p-2 font-bold">Kondisi Mata (Pemeriksaan Fisik)</td>
              <td className="border border-black p-2 text-center">{tenko.mata || 'Normal'}</td>
              <td className="border border-black p-2 text-center font-bold">-</td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">8</td>
              <td className="border border-black p-2 font-bold">Tingkat Kelelahan (Fatigue Test)</td>
              <td className="border border-black p-2 text-center">{tenko.fatigue || 'Normal'}</td>
              <td className="border border-black p-2 text-center font-bold">-</td>
            </tr>
          </tbody>
        </table>

        {/* Catatan / Remark */}
        <div className="mb-8">
          <p className="font-bold uppercase text-xs mb-1">Catatan Tambahan (Klinik / Petugas Medis):</p>
          <div className="border border-black h-24 p-2 text-sm italic">
             {/* If we add catatan later it goes here */}
             Tidak ada catatan.
          </div>
        </div>

        <div className="flex-1"></div>

        {/* Footer Signatures */}
        <div className="flex justify-between items-end mb-4">
          <div className="text-center w-48">
            <p className="mb-16 uppercase font-bold text-xs">Mitra Driver</p>
            <div className="border-b border-black w-full mb-1"></div>
            <p className="uppercase text-xs font-semibold">{tenko.nama_driver}</p>
          </div>

          <div className="text-center w-48">
            <p className="mb-16 uppercase font-bold text-xs">Petugas Medis / Tenko</p>
            <div className="border-b border-black w-full mb-1"></div>
            <p className="uppercase text-xs font-semibold">{tenko.checked_by || 'Klinik / Paramedik'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
