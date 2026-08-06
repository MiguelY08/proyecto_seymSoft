import { useState } from 'react';
import { ScannerInput } from './ScannerInput';

export default function ScannerInputExample() {
  const [barcode, setBarcode] = useState('');

  return (
    <div className="space-y-4 p-4 rounded-xl border border-gray-200 bg-white shadow-sm max-w-md">
      <div>
        <label htmlFor="barcode" className="block text-sm font-medium text-gray-700">
          Código de barras
        </label>
        <p className="mt-1 text-xs text-gray-500">
          Enfoca este campo y escanea para llenar el valor. Otros campos no recibirán el texto del scanner.
        </p>
      </div>

      <ScannerInput
        id="barcode"
        name="barcode"
        value={barcode}
        onChange={(event) => setBarcode(event.target.value)}
        onScan={({ code }) => setBarcode(code)}
        scannerField="example-barcode-field"
        placeholder="Escanea aquí"
        className="space-y-2"
        inputClassName="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#004D77] focus:ring-[#004D77]/20"
      />

      <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
        <strong>Valor actual:</strong> {barcode || 'Vacío'}
      </div>
    </div>
  );
}
