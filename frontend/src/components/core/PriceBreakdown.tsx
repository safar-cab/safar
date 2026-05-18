import { useState } from 'react';
import { Info } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

interface PriceBreakdownProps {
  baseFare: number;
  distanceKm: number;
  pricePerKm: number;
  tollEstimate: number;
  stopCount?: number;
  stopChargePerStop?: number;
  totalStopCharge?: number;
  cgst?: number;
  sgst?: number;
  gstAmount: number;
  totalAmount: number;
}

function InfoTip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex ml-1">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="text-neutral-300 hover:text-neutral-500 transition-colors"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 bg-neutral-800 text-white text-[10px] rounded-lg whitespace-nowrap z-50 shadow-lg">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-neutral-800" />
        </span>
      )}
    </span>
  );
}

export function PriceBreakdown({
  baseFare,
  distanceKm,
  pricePerKm,
  tollEstimate,
  stopCount,
  stopChargePerStop,
  totalStopCharge,
  cgst,
  sgst,
  gstAmount,
  totalAmount,
}: PriceBreakdownProps) {
  return (
    <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
      <h4 className="text-sm font-semibold text-neutral-800 mb-3">Price Breakdown</h4>
      <div className="flex justify-between text-sm">
        <span className="text-neutral-600 flex items-center">
          Base Fare
          <InfoTip text="Fixed minimum charge per ride" />
        </span>
        <span className="text-neutral-800">{formatCurrency(baseFare)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-neutral-600 flex items-center">
          Distance ({distanceKm} km x {formatCurrency(pricePerKm)}/km)
          <InfoTip text="Charge based on total route distance" />
        </span>
        <span className="text-neutral-800">{formatCurrency(distanceKm * pricePerKm)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-neutral-600 flex items-center">
          Tolls{tollEstimate === 0 && <span className="text-green-600 text-xs ml-1">(FREE)</span>}
          <InfoTip text="Highway toll charges — exempt from GST" />
        </span>
        <span className="text-neutral-800">{formatCurrency(tollEstimate)}</span>
      </div>
      {(totalStopCharge || 0) > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600 flex items-center">
            Stops ({stopCount} x {formatCurrency(stopChargePerStop || 0)})
            <InfoTip text="Waiting charge per intermediate stop" />
          </span>
          <span className="text-neutral-800">{formatCurrency(totalStopCharge || 0)}</span>
        </div>
      )}
      <div className="border-t border-neutral-200 pt-2 mt-2">
        <p className="text-xs text-neutral-400 mb-1 flex items-center">
          Tax (SAC: 996601)
          <InfoTip text="GST on cab services — tolls exempt" />
        </p>
        {cgst !== undefined && sgst !== undefined ? (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">CGST (2.5%)</span>
              <span className="text-neutral-800">{formatCurrency(cgst)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">SGST (2.5%)</span>
              <span className="text-neutral-800">{formatCurrency(sgst)}</span>
            </div>
          </>
        ) : (
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">GST (5%)</span>
            <span className="text-neutral-800">{formatCurrency(gstAmount)}</span>
          </div>
        )}
      </div>
      <div className="flex justify-between text-base font-bold pt-2 border-t border-neutral-200">
        <span className="text-neutral-900">Total</span>
        <span className="text-primary-700">{formatCurrency(totalAmount)}</span>
      </div>
    </div>
  );
}
