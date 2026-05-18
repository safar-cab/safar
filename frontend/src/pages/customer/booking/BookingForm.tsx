import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Plus, X, GripVertical, Navigation, LocateFixed } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setBookingStep } from '@/store/slices/uiSlice';
import { fetchAvailableCars } from '@/store/slices/carsSlice';
import type { Car } from '@/types';
import { createBooking } from '@/store/slices/bookingsSlice';
import { StepIndicator } from '@/components/core/StepIndicator';
import { CarCard } from '@/components/core/CarCard';
import { PriceBreakdown } from '@/components/core/PriceBreakdown';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';

const STEPS = ['Pickup', 'Stops', 'Drop', 'Schedule', 'Car', 'Review'];

interface StopItem {
  id: string;
  address: string;
}

interface FormData {
  pickupAddress: string;
  pickupLandmark: string;
  dropAddress: string;
  dropLandmark: string;
  stops: StopItem[];
  date: string;
  time: string;
  selectedCarId: string;
  estimatedDistance: number;
}

const INITIAL_FORM: FormData = {
  pickupAddress: '',
  pickupLandmark: '',
  dropAddress: '',
  dropLandmark: '',
  stops: [],
  date: '',
  time: '',
  selectedCarId: '',
  estimatedDistance: 50,
};

export function BookingForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state as {
    pickupAddress?: string;
    dropAddress?: string;
    estimatedDistance?: number;
  } | null;

  const { bookingStep } = useAppSelector((s) => s.ui);
  const { available: cars, loading: carsLoading, error: carsError } = useAppSelector((s) => s.cars);
  const {
    creating,
    current: createdBooking,
    error: bookingError,
  } = useAppSelector((s) => s.bookings);

  const [form, setForm] = useState<FormData>({
    ...INITIAL_FORM,
    ...(routeState?.pickupAddress && { pickupAddress: routeState.pickupAddress }),
    ...(routeState?.dropAddress && { dropAddress: routeState.dropAddress }),
    ...(routeState?.estimatedDistance && { estimatedDistance: routeState.estimatedDistance }),
  });
  const [submitted, setSubmitted] = useState(false);
  const [pricingConfig, setPricingConfig] = useState({
    pricePerKm: 12,
    baseFare: 500,
    stopWaitingChargePerInterval: 10,
    stopWaitingIntervalMinutes: 15,
  });

  // Fetch pricing config from backend
  useEffect(() => {
    api.get('/customer/bookings/pricing-config')
      .then((res: unknown) => {
        const data = res as typeof pricingConfig;
        if (data) setPricingConfig(data);
      })
      .catch(() => {});
  }, []);

  // Reset step on mount
  useEffect(() => {
    dispatch(setBookingStep(1));
    return () => {
      dispatch(setBookingStep(1));
    };
  }, [dispatch]);

  // Fetch cars when reaching step 5
  useEffect(() => {
    if (bookingStep === 5) {
      dispatch(fetchAvailableCars(undefined));
    }
  }, [dispatch, bookingStep]);

  // Handle errors
  useEffect(() => {
    if (carsError) toast.error(carsError);
  }, [carsError]);

  useEffect(() => {
    if (bookingError) toast.error(bookingError);
  }, [bookingError]);

  // Navigate on booking success
  useEffect(() => {
    if (submitted && createdBooking && !creating) {
      toast.success('Booking created successfully!');
      navigate(`/customer/bookings/${createdBooking._id}`);
    }
  }, [submitted, createdBooking, creating, navigate]);

  const updateField = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const canProceed = (): boolean => {
    switch (bookingStep) {
      case 1:
        return form.pickupAddress.trim().length > 0;
      case 2:
        return true; // stops are optional
      case 3:
        return form.dropAddress.trim().length > 0;
      case 4:
        return form.date.length > 0 && form.time.length > 0;
      case 5:
        return form.selectedCarId.length > 0;
      case 6:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (bookingStep < 6) {
      dispatch(setBookingStep(bookingStep + 1));
    } else {
      handleConfirm();
    }
  };

  const handleBack = () => {
    if (bookingStep > 1) {
      dispatch(setBookingStep(bookingStep - 1));
    } else {
      navigate(-1);
    }
  };

  const handleConfirm = () => {
    const selectedCar = cars.find((c) => c._id === form.selectedCarId);
    const stops = form.stops
      .filter((s) => s.address.trim())
      .map((s, i) => ({ order: i + 1, address: s.address }));

    setSubmitted(true);
    dispatch(
      createBooking({
        pickup: {
          address: form.pickupAddress,
          landmark: form.pickupLandmark || undefined,
        },
        drop: {
          address: form.dropAddress,
          landmark: form.dropLandmark || undefined,
        },
        stops: stops.length > 0 ? stops : undefined,
        schedule: {
          startDate: form.date,
          startTime: form.time,
        },
        carId: form.selectedCarId,
        estimatedDistanceKm: form.estimatedDistance || undefined,
      }),
    );
  };

  const selectedCar = cars.find((c) => c._id === form.selectedCarId);

  return (
    <div className="pb-40">
      <PageHeader title="Book a Ride" showBack />

      <StepIndicator steps={STEPS} current={bookingStep} />

      <div className="px-4">
        <motion.div
          key={bookingStep}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          {bookingStep === 1 && <PickupStep form={form} updateField={updateField} />}
          {bookingStep === 2 && <StopsStep form={form} updateField={updateField} chargePerInterval={pricingConfig.stopWaitingChargePerInterval} intervalMinutes={pricingConfig.stopWaitingIntervalMinutes} />}
          {bookingStep === 3 && <DropStep form={form} updateField={updateField} />}
          {bookingStep === 4 && <ScheduleStep form={form} updateField={updateField} />}
          {bookingStep === 5 && (
            <CarStep
              cars={cars}
              loading={carsLoading}
              selectedId={form.selectedCarId}
              onSelect={(id) => updateField('selectedCarId', id)}
            />
          )}
          {bookingStep === 6 && <ReviewStep form={form} selectedCar={selectedCar || null} pricingConfig={pricingConfig} />}
        </motion.div>
      </div>

      {/* Sticky Bottom Actions — above bottom nav (h-16) */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-neutral-100 p-4 flex gap-3 z-40">
        {bookingStep > 1 && (
          <Button variant="outline" size="lg" className="flex-1" onClick={handleBack}>
            Back
          </Button>
        )}
        <Button
          variant="primary"
          size="lg"
          className="flex-1"
          disabled={!canProceed()}
          loading={creating}
          onClick={handleNext}
        >
          {bookingStep === 6 ? 'Confirm Booking' : 'Next'}
        </Button>
      </div>
    </div>
  );
}

/* ---------- Step Components ---------- */

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';

function MapEmbed({ src }: { src: string }) {
  return (
    <div className="relative w-full h-full">
      <iframe
        src={src}
        className="absolute inset-0 w-full h-full border-0"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

function LocationMapPreview({ address }: { address: string }) {
  const hasAddress = MAPS_KEY && address && address.length >= 3;
  return (
    <div className="rounded-xl overflow-hidden border border-neutral-100 bg-neutral-50 relative" style={{ height: 'calc(100vh - 32rem)' }}>
      {hasAddress ? (
        <MapEmbed
          src={`https://www.google.com/maps/embed/v1/place?key=${MAPS_KEY}&q=${encodeURIComponent(address)}&zoom=14`}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <Navigation className="w-8 h-8 text-neutral-200 mx-auto mb-1.5" />
            <p className="text-xs text-neutral-300">Map preview appears as you type</p>
          </div>
        </div>
      )}
    </div>
  );
}

function RouteMapPreview({ pickup, drop }: { pickup: string; drop: string }) {
  const hasRoute = MAPS_KEY && pickup && drop && pickup.length >= 3 && drop.length >= 3;
  if (!hasRoute) return null;
  return (
    <div className="rounded-xl overflow-hidden border border-neutral-100 relative" style={{ height: 'calc(100vh - 32rem)' }}>
      <MapEmbed
        src={`https://www.google.com/maps/embed/v1/directions?key=${MAPS_KEY}&origin=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(drop)}&mode=driving`}
      />
    </div>
  );
}

function useCurrentLocation(onAddress: (address: string) => void) {
  const [loading, setLoading] = useState(false);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          if (MAPS_KEY) {
            const res = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${pos.coords.latitude},${pos.coords.longitude}&key=${MAPS_KEY}`,
            );
            const data = await res.json();
            const address = data.results?.[0]?.formatted_address;
            if (address) {
              onAddress(address);
            } else {
              onAddress(`${pos.coords.latitude}, ${pos.coords.longitude}`);
            }
          } else {
            onAddress(`${pos.coords.latitude}, ${pos.coords.longitude}`);
          }
        } catch {
          onAddress(`${pos.coords.latitude}, ${pos.coords.longitude}`);
        } finally {
          setLoading(false);
        }
      },
      () => {
        toast.error('Location access denied');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [onAddress]);

  return { getLocation, loading };
}

function PickupStep({
  form,
  updateField,
}: {
  form: FormData;
  updateField: <K extends keyof FormData>(key: K, val: FormData[K]) => void;
}) {
  const { getLocation, loading: locating } = useCurrentLocation(
    useCallback((address: string) => updateField('pickupAddress', address), [updateField]),
  );

  return (
    <div className="flex flex-col gap-3" style={{ minHeight: '400px' }}>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-success-500" />
        <h2 className="text-base font-semibold text-neutral-800">Pickup Location</h2>
      </div>
      {/* Address input with locate icon inside */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Pickup Address</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
            <MapPin className="w-4 h-4" />
          </span>
          <input
            placeholder="Enter pickup address"
            value={form.pickupAddress}
            onChange={(e) => updateField('pickupAddress', e.target.value)}
            className="w-full h-12 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 placeholder:text-neutral-400 outline-none pl-10 pr-11 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
          />
          <button
            type="button"
            onClick={getLocation}
            disabled={locating}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-primary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg disabled:opacity-50 transition-colors"
            title="Use current location"
          >
            <LocateFixed className={`w-5 h-5 ${locating ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      <Input
        label="Landmark (optional)"
        placeholder="Near a famous place, building, etc."
        value={form.pickupLandmark}
        onChange={(e) => updateField('pickupLandmark', e.target.value)}
      />
      {/* Map fills remaining space */}
      <LocationMapPreview address={form.pickupAddress} />
    </div>
  );
}

function DropStep({
  form,
  updateField,
}: {
  form: FormData;
  updateField: <K extends keyof FormData>(key: K, val: FormData[K]) => void;
}) {
  // Auto-fill distance (including waypoints/stops)
  const stopsKey = form.stops.map((s) => s.address).join('|');
  useEffect(() => {
    if (!form.pickupAddress || !form.dropAddress || form.pickupAddress.length < 3 || form.dropAddress.length < 3) return;

    const timer = setTimeout(() => {
      const validStops = form.stops
        .filter((s) => s.address.trim().length >= 3)
        .map((s) => s.address.trim());
      const waypointsParam = validStops.length > 0
        ? `&waypoints=${validStops.map(encodeURIComponent).join('|')}`
        : '';

      api
        .get(
          `/api/tracking/route-info?origin=${encodeURIComponent(form.pickupAddress)}&destination=${encodeURIComponent(form.dropAddress)}${waypointsParam}`,
        )
        .then((res: unknown) => {
          const data = res as { distanceKm?: number };
          if (data?.distanceKm) {
            updateField('estimatedDistance', data.distanceKm);
          }
        })
        .catch(() => {});
    }, 1000);

    return () => clearTimeout(timer);
  }, [form.pickupAddress, form.dropAddress, stopsKey, updateField]);

  return (
    <div className="flex flex-col gap-3" style={{ minHeight: '400px' }}>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-error-500" />
        <h2 className="text-base font-semibold text-neutral-800">Drop Location</h2>
      </div>
      <Input
        label="Drop Address"
        placeholder="Enter drop address"
        icon={<MapPin className="w-4 h-4" />}
        value={form.dropAddress}
        onChange={(e) => updateField('dropAddress', e.target.value)}
      />
      <Input
        label="Landmark (optional)"
        placeholder="Near a famous place, building, etc."
        value={form.dropLandmark}
        onChange={(e) => updateField('dropLandmark', e.target.value)}
      />
      <Input
        label="Estimated Distance (km)"
        type="number"
        placeholder="Calculating..."
        value={form.estimatedDistance ? String(form.estimatedDistance) : ''}
        readOnly
        className="bg-neutral-100 cursor-not-allowed"
      />
      {/* Map with full route including stops */}
      {form.pickupAddress && form.dropAddress && MAPS_KEY ? (
        <div className="rounded-xl overflow-hidden border border-neutral-100 relative" style={{ height: 'calc(100vh - 32rem)' }}>
          {(() => {
            const validStops = form.stops
              .filter((s) => s.address.trim().length >= 3)
              .map((s) => s.address.trim());
            const waypoints = validStops.length > 0
              ? `&waypoints=${validStops.map(encodeURIComponent).join('|')}`
              : '';
            return (
              <MapEmbed
                src={`https://www.google.com/maps/embed/v1/directions?key=${MAPS_KEY}&origin=${encodeURIComponent(form.pickupAddress)}&destination=${encodeURIComponent(form.dropAddress)}${waypoints}&mode=driving`}
              />
            );
          })()}
        </div>
      ) : (
        <LocationMapPreview address={form.dropAddress} />
      )}
    </div>
  );
}

function StopsStep({
  form,
  updateField,
  chargePerInterval,
  intervalMinutes,
}: {
  form: FormData;
  updateField: <K extends keyof FormData>(key: K, val: FormData[K]) => void;
  chargePerInterval: number;
  intervalMinutes: number;
}) {
  const addStop = () => {
    if (form.stops.length >= 5) return;
    updateField('stops', [...form.stops, { id: Date.now().toString(), address: '' }]);
  };

  const removeStop = (id: string) => {
    updateField(
      'stops',
      form.stops.filter((s) => s.id !== id),
    );
  };

  const updateStop = (id: string, address: string) => {
    updateField(
      'stops',
      form.stops.map((s) => (s.id === id ? { ...s, address } : s)),
    );
  };

  const moveStop = (index: number, direction: 'up' | 'down') => {
    const newStops = [...form.stops];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newStops.length) return;
    [newStops[index], newStops[targetIndex]] = [newStops[targetIndex], newStops[index]];
    updateField('stops', newStops);
  };

  return (
    <div className="flex flex-col gap-3" style={{ minHeight: '400px' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-800">Intermediate Stops</h2>
          <p className="text-xs text-neutral-400">Optional — ₹{chargePerInterval} per {intervalMinutes} min waiting at each stop</p>
        </div>
        <button
          onClick={addStop}
          disabled={form.stops.length >= 5}
          className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add Stop
        </button>
      </div>

      {form.stops.length === 0 ? (
        <div className="text-center py-8 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
          <MapPin className="w-8 h-8 text-neutral-200 mx-auto mb-2" />
          <p className="text-sm text-neutral-400">No intermediate stops</p>
          <p className="text-xs text-neutral-300 mt-1">Tap "Add Stop" to add waypoints</p>
        </div>
      ) : (
        <div className="space-y-3">
          {form.stops.map((stop, index) => (
            <div
              key={stop.id}
              className="flex items-center gap-2 bg-white rounded-lg border border-neutral-100 p-3"
            >
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => moveStop(index, 'up')}
                  disabled={index === 0}
                  className="text-neutral-300 hover:text-neutral-500 disabled:opacity-30"
                >
                  <GripVertical className="w-4 h-4" />
                </button>
              </div>
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-600 shrink-0">
                {index + 1}
              </div>
              <input
                type="text"
                placeholder={`Stop ${index + 1} address`}
                value={stop.address}
                onChange={(e) => updateStop(stop.id, e.target.value)}
                className="flex-1 text-sm border-0 outline-none bg-transparent placeholder:text-neutral-300"
              />
              <button
                onClick={() => removeStop(stop.id)}
                className="p-1 text-neutral-300 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {form.stops.length > 0 && (
        <p className="text-xs text-neutral-400 text-right">
          Est. waiting charge: ₹{form.stops.filter((s) => s.address.trim()).length * chargePerInterval} ({form.stops.filter((s) => s.address.trim()).length} stops × ₹{chargePerInterval})
        </p>
      )}

      {/* Route map — shows pickup + stops (+ drop if available) */}
      {form.pickupAddress && MAPS_KEY && (
        <div className="rounded-xl overflow-hidden border border-neutral-100 relative" style={{ height: 'calc(100vh - 32rem)' }}>
          {(() => {
            const validStopAddrs = form.stops
              .filter((s) => s.address.trim().length >= 3)
              .map((s) => s.address.trim());

            // If drop exists, show full route with waypoints
            if (form.dropAddress) {
              const waypoints = validStopAddrs.length > 0
                ? `&waypoints=${validStopAddrs.map(encodeURIComponent).join('|')}`
                : '';
              return (
                <MapEmbed
                  src={`https://www.google.com/maps/embed/v1/directions?key=${MAPS_KEY}&origin=${encodeURIComponent(form.pickupAddress)}&destination=${encodeURIComponent(form.dropAddress)}${waypoints}&mode=driving`}
                />
              );
            }

            // If stops exist but no drop, show directions from pickup to last stop
            if (validStopAddrs.length > 0) {
              const lastStop = validStopAddrs[validStopAddrs.length - 1];
              const midStops = validStopAddrs.slice(0, -1);
              const waypoints = midStops.length > 0
                ? `&waypoints=${midStops.map(encodeURIComponent).join('|')}`
                : '';
              return (
                <MapEmbed
                  src={`https://www.google.com/maps/embed/v1/directions?key=${MAPS_KEY}&origin=${encodeURIComponent(form.pickupAddress)}&destination=${encodeURIComponent(lastStop)}${waypoints}&mode=driving`}
                />
              );
            }

            // Just pickup location
            return (
              <MapEmbed
                src={`https://www.google.com/maps/embed/v1/place?key=${MAPS_KEY}&q=${encodeURIComponent(form.pickupAddress)}&zoom=13`}
              />
            );
          })()}
        </div>
      )}
    </div>
  );
}

function ScheduleStep({
  form,
  updateField,
}: {
  form: FormData;
  updateField: <K extends keyof FormData>(key: K, val: FormData[K]) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-neutral-800 mb-2">Schedule</h2>
      <Input
        label="Date"
        type="date"
        icon={<Calendar className="w-4 h-4" />}
        value={form.date}
        onChange={(e) => updateField('date', e.target.value)}
      />
      <Input
        label="Time"
        type="time"
        icon={<Clock className="w-4 h-4" />}
        value={form.time}
        onChange={(e) => updateField('time', e.target.value)}
      />
    </div>
  );
}

function CarStep({
  cars,
  loading,
  selectedId,
  onSelect,
}: {
  cars: Car[];
  loading: boolean;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-52" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-base font-semibold text-neutral-800 mb-4">Select a Car</h2>
      {cars.length === 0 ? (
        <p className="text-sm text-neutral-400 text-center py-10">No cars available right now</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {cars.map((car, i) => (
            <CarCard
              key={car._id}
              car={car}
              selected={car._id === selectedId}
              onSelect={() => onSelect(car._id)}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewStep({
  form,
  selectedCar,
  pricingConfig,
}: {
  form: FormData;
  selectedCar: { make: string; model: string; category: string } | null;
  pricingConfig: { pricePerKm: number; baseFare: number; stopWaitingChargePerInterval: number; stopWaitingIntervalMinutes: number };
}) {
  const validStops = form.stops.filter((s) => s.address.trim());
  const pricePerKm = pricingConfig.pricePerKm;
  const baseFare = pricingConfig.baseFare;
  const distanceCharge = form.estimatedDistance * pricePerKm;
  const tollEstimate = 150;
  const stopCharge = validStops.length * pricingConfig.stopWaitingChargePerInterval;
  const subtotal = baseFare + distanceCharge + tollEstimate + stopCharge;
  const gstAmount = Math.round(subtotal * 0.05);
  const totalAmount = subtotal + gstAmount;

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-neutral-800 mb-2">Review Booking</h2>

      {/* Route Summary */}
      <div className="bg-white rounded-xl p-4 border border-neutral-100 shadow-sm">
        <div className="space-y-0">
          {/* Pickup */}
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center pt-1">
              <div className="w-3 h-3 rounded-full bg-success-500 shrink-0" />
              <div className="w-0.5 flex-1 bg-neutral-200 my-1" />
            </div>
            <div className="flex-1 pb-3">
              <p className="text-[10px] text-success-600 font-semibold uppercase tracking-wider">Pickup</p>
              <p className="text-sm font-medium text-neutral-900">{form.pickupAddress}</p>
              {form.pickupLandmark && (
                <p className="text-xs text-neutral-400">{form.pickupLandmark}</p>
              )}
            </div>
          </div>

          {/* Stops */}
          {validStops.map((stop, i) => (
            <div key={stop.id} className="flex items-start gap-3">
              <div className="flex flex-col items-center pt-1">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                <div className="w-0.5 flex-1 bg-neutral-200 my-1" />
              </div>
              <div className="flex-1 pb-3">
                <p className="text-[10px] text-amber-600 font-semibold uppercase tracking-wider">Stop {i + 1}</p>
                <p className="text-sm text-neutral-700">{stop.address}</p>
              </div>
            </div>
          ))}

          {/* Drop */}
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center pt-1">
              <div className="w-3 h-3 rounded-full bg-error-500 shrink-0" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-error-600 font-semibold uppercase tracking-wider">Drop</p>
              <p className="text-sm font-medium text-neutral-900">{form.dropAddress}</p>
              {form.dropLandmark && <p className="text-xs text-neutral-400">{form.dropLandmark}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule & Car */}
      <div className="bg-white rounded-xl p-4 border border-neutral-100 shadow-sm">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-neutral-400">Date</p>
            <p className="font-medium text-neutral-800">
              {form.date
                ? new Date(form.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : '--'}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-400">Time</p>
            <p className="font-medium text-neutral-800">{form.time || '--'}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-400">Car</p>
            <p className="font-medium text-neutral-800">
              {selectedCar ? `${selectedCar.make} ${selectedCar.model}` : '--'}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-400">Distance</p>
            <p className="font-medium text-neutral-800">{form.estimatedDistance} km</p>
          </div>
        </div>
      </div>

      {/* Price */}
      <PriceBreakdown
        baseFare={baseFare}
        distanceKm={form.estimatedDistance}
        pricePerKm={pricePerKm}
        tollEstimate={tollEstimate}
        stopCount={validStops.length}
        stopChargePerStop={pricingConfig.stopWaitingChargePerInterval}
        totalStopCharge={stopCharge}
        gstAmount={gstAmount}
        totalAmount={totalAmount}
      />
    </div>
  );
}
