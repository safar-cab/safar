interface PriceBreakdownProps {
  baseFare: number;
  distanceKm: number;
  pricePerKm: number;
  tollEstimate: number;
  gstAmount: number;
  totalAmount: number;
}

export function PriceBreakdown({ baseFare, distanceKm, pricePerKm, tollEstimate, gstAmount, totalAmount }: PriceBreakdownProps) {
  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  return (
    <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
      <h4 className="text-sm font-semibold text-neutral-800 mb-3">Price Breakdown</h4>
      <div className="flex justify-between text-sm">
        <span className="text-neutral-600">Base Fare</span>
        <span className="text-neutral-800">{fmt(baseFare)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-neutral-600">Distance ({distanceKm} km × {fmt(pricePerKm)}/km)</span>
        <span className="text-neutral-800">{fmt(distanceKm * pricePerKm)}</span>
      </div>
      {tollEstimate > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Tolls</span>
          <span className="text-neutral-800">{fmt(tollEstimate)}</span>
        </div>
      )}
      <div className="flex justify-between text-sm">
        <span className="text-neutral-600">GST (5%)</span>
        <span className="text-neutral-800">{fmt(gstAmount)}</span>
      </div>
      <div className="flex justify-between text-base font-bold pt-2 border-t border-neutral-200">
        <span className="text-neutral-900">Total</span>
        <span className="text-primary-700">{fmt(totalAmount)}</span>
      </div>
    </div>
  );
}
