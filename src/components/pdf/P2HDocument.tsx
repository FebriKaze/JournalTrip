import React from 'react';
import { P2H_CATEGORIES } from '../../constants/p2hItems';
import Logo from '../../image/Logo.png';
import Logo1 from '../../image/logo1.webp';

interface P2HDocumentProps {
  driverName: string;
  nopol: string;
  date: string;
  checklist: Record<string, 'OK' | 'NG'>;
  checkerName: string;
  catatan?: string;
}

export default function P2HDocument({ driverName, nopol, date, checklist, checkerName, catatan }: P2HDocumentProps) {
  return (
    <div id="p2h-print-document" className="bg-white w-[794px] h-[1123px] text-black font-sans overflow-hidden">
      {/* A4 Size (794x1123 px at 96 DPI) */}
      <div className="p-8 border-2 border-black m-4 h-[1091px] flex flex-col relative">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-2">
          <div className="flex gap-2 items-center">
             <img src={Logo} alt="Logo" className="h-10" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-black">CHECK SHEET PEMERIKSAAN DAN PENGECEKAN ARMADA</h1>
            <h2 className="text-lg font-bold">PT. K-LINE MOBARU DIAMOND INDONESIA</h2>
          </div>
          <div className="border border-black p-1 text-[10px] flex flex-col">
            <span className="font-bold border-b border-black">Legend:</span>
            <span>[OK] : SIAP OPERASIONAL</span>
            <span>[NG] : TIDAK SIAP OPERASIONAL</span>
          </div>
        </div>

        {/* Info Box */}
        <div className="grid grid-cols-4 gap-2 mb-4 text-xs font-bold">
          <div className="border border-black flex">
            <div className="bg-gray-200 border-r border-black px-2 py-1 w-20">No. Polisi</div>
            <div className="px-2 py-1 flex-1 uppercase">{nopol}</div>
          </div>
          <div className="border border-black flex">
            <div className="bg-gray-200 border-r border-black px-2 py-1 w-24">Nama Driver</div>
            <div className="px-2 py-1 flex-1 uppercase">{driverName}</div>
          </div>
          <div className="border border-black flex">
            <div className="bg-gray-200 border-r border-black px-2 py-1 w-20">Tanggal</div>
            <div className="px-2 py-1 flex-1 uppercase">{date}</div>
          </div>
          <div className="border border-black flex">
            <div className="bg-gray-200 border-r border-black px-2 py-1 w-16">Jam</div>
            <div className="px-2 py-1 flex-1">__ : __</div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-hidden border-t-2 border-l-2 border-black text-[9px]">
          <div className="flex bg-gray-200 font-bold text-center border-b-2 border-black">
            <div className="w-8 border-r-2 border-black p-1 flex items-center justify-center">No.</div>
            <div className="w-48 border-r-2 border-black p-1 flex items-center justify-center">Item yang diperiksa</div>
            <div className="flex-1 border-r-2 border-black p-1 flex items-center justify-center">Syarat dan Kondisi</div>
            <div className="w-16 border-r-2 border-black flex flex-col">
              <div className="border-b border-black p-0.5">Masuk</div>
              <div className="flex flex-1">
                <div className="w-1/2 border-r border-black p-0.5">OK</div>
                <div className="w-1/2 p-0.5">NG</div>
              </div>
            </div>
            <div className="w-24 border-r-2 border-black p-1 flex items-center justify-center">Temuan (Masuk)</div>
            <div className="w-16 border-r-2 border-black flex flex-col">
              <div className="border-b border-black p-0.5">Keluar</div>
              <div className="flex flex-1">
                <div className="w-1/2 border-r border-black p-0.5">OK</div>
                <div className="w-1/2 p-0.5">NG</div>
              </div>
            </div>
            <div className="w-24 border-r-2 border-black p-1 flex items-center justify-center">Temuan (Keluar)</div>
          </div>

          <div className="flex flex-col">
            {P2H_CATEGORIES.map(category => (
              <React.Fragment key={category.id}>
                <div className="bg-gray-300 font-bold p-1 border-b border-r-2 border-black uppercase">
                  {category.title}
                </div>
                {category.items.map(item => {
                  const status = checklist[item.id] || 'NG'; // Default to NG if missing for visual
                  return (
                    <div key={item.id} className="flex border-b border-r-2 border-black">
                      <div className="w-8 border-r-2 border-black p-1 flex justify-center">{item.id}</div>
                      <div className="w-48 border-r-2 border-black p-1">{item.item}</div>
                      <div className="flex-1 border-r-2 border-black p-1 italic">{item.syarat}</div>
                      <div className="w-16 border-r-2 border-black flex">
                        <div className="w-1/2 border-r border-black"></div>
                        <div className="w-1/2"></div>
                      </div>
                      <div className="w-24 border-r-2 border-black p-1 flex items-center justify-center text-[8px]"></div>
                      
                      {/* Keluar columns */}
                      <div className="w-16 border-r-2 border-black flex">
                        <div className="w-1/2 border-r border-black flex items-center justify-center font-bold text-lg">{status === 'OK' ? '✓' : ''}</div>
                        <div className="w-1/2 flex items-center justify-center font-bold text-lg">{status === 'NG' ? '✓' : ''}</div>
                      </div>
                      <div className="w-24 p-1 flex items-center justify-center text-[8px]">{status === 'NG' ? catatan : ''}</div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Footer Signatures */}
        <div className="mt-2 text-[10px]">
          <div className="flex border border-black text-center font-bold bg-gray-200">
            <div className="w-1/2 border-r border-black p-1">Pemeriksaan saat armada masuk</div>
            <div className="w-1/2 p-1">Pemeriksaan saat armada keluar</div>
          </div>
          <div className="flex border-x border-b border-black text-center h-20">
            <div className="w-1/6 border-r border-black flex flex-col justify-between">
              <div className="p-1 border-b border-black">Mitra Driver</div>
              <div className="p-1 uppercase">{driverName}</div>
            </div>
            <div className="w-1/6 border-r border-black flex flex-col justify-between">
              <div className="p-1 border-b border-black">Diperiksa Oleh</div>
              <div className="p-1 uppercase">{checkerName}</div>
            </div>
            <div className="w-1/6 border-r border-black flex flex-col justify-between">
              <div className="p-1 border-b border-black">Diketahui Oleh</div>
              <div className="p-1">Spv.</div>
            </div>
            
            <div className="w-1/6 border-r border-black flex flex-col justify-between">
              <div className="p-1 border-b border-black">Mitra Driver</div>
              <div className="p-1"></div>
            </div>
            <div className="w-1/6 border-r border-black flex flex-col justify-between">
              <div className="p-1 border-b border-black">Diperiksa Oleh</div>
              <div className="p-1"></div>
            </div>
            <div className="w-1/6 flex flex-col justify-between">
              <div className="p-1 border-b border-black">Diketahui Oleh</div>
              <div className="p-1">Spv.</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
