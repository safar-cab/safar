import { formatCurrency } from '@/utils/format';

interface PriceBreakdownProps {
  baseFare: number;
  distanceKm: number;
  pricePerKm: number;
  tollEstimate: number;
  cgst?: number;
  sgst?: number;
  gstAmount: number;
  totalAmount: number;
}

export function PriceBreakdown({
  baseFare, distanceKm, pricePerKm, tollEstimate,
  cgst, sgst, gstAmount, totalAmount,
}: PriceBreakdownProps) {
  return (
    <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
      <h4 className="text-sm font-semibold text-neutral-800 mb-3">Price Breakdown</h4>
      <div className="flex justify-between text-sm">
        <span className="text-neutral-600">Base Fare</span>
        <span className="text-neutral-800">{formatCurrency(baseFare)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-neutral-600">Distance ({distanceKm} km x {formatCurrency(pricePerKm)}/km)</span>
        <span className="text-neutral-800">{formatCurrency(distanceKm * pricePerKm)}</span>
      </div>
      {tollEstimate > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Tolls (GST exempt)</span>
          <span className="text-neutral-800">{formatCurrency(tollEstimate)}</span>
        </div>
      )}
      <div className="border-t border-neutral-200 pt-2 mt-2">
        <p className="text-xs text-neutral-400 mb-1">Tax (SAC: 996601)</p>
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
