import React, { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";

interface Props {
  tables: any[];
  branchName: string;
  baseUrl: string; 
}

export const QRCodeTemplate = forwardRef<HTMLDivElement, Props>(({ tables, branchName, baseUrl }, ref) => {
  return (
    <div ref={ref} className="w-full bg-white p-8 font-sans">
      {/* CSS cho lúc in */}
      <style type="text/css" media="print">
        {`
          @page { size: A4; margin: 10mm; }
          body { -webkit-print-color-adjust: exact; }
        `}
      </style>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
        {tables.map((table) => {
          const qrToken = table.id; 
          const qrUrl = `${baseUrl}/guest/t/${qrToken}`;

          return (
            <div 
              key={table.id} 
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 p-4 rounded-xl break-inside-avoid page-break-avoid h-auto"
            >
              <h3 className="text-xs font-bold uppercase mb-1 text-center text-gray-500 tracking-wider">
                {branchName}
              </h3>
              <div className="text-2xl font-black mb-3">{table.name}</div>
              
              <div className="bg-white p-1 rounded-lg">
                <QRCodeSVG 
                  value={qrUrl} 
                  size={140}
                  level="M"
                />
              </div>
              
              <p className="mt-3 text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
                Scan to Order
              </p>

              {/* Hiển thị URL để khách nhập tay nếu cần */}
              <div className="mt-2 text-center w-full px-2">
                <p className="text-[10px] text-gray-400 mb-0.5">Link gọi món:</p>
                <p className="text-[11px] font-mono font-bold text-blue-800 break-all leading-tight border-b border-blue-200 inline-block pb-0.5">
                  {qrUrl}
                </p>
              </div>
              
              {/* ID token để đối chiếu */}
              <p className="text-[8px] text-gray-300 mt-2">Token: {qrToken.split('-')[0]}...</p>
            </div>
          );
        })}
      </div>
    </div>
  );
});

QRCodeTemplate.displayName = "QRCodeTemplate";