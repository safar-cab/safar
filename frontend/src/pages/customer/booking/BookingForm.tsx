import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Clock, Plus, X, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
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

const STEPS = ['Pickup', 'Drop', 'Stops', 'Schedule', 'Car', 'Review'];

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

  const { bookingStep } = useAppSelector((s) => s.ui);
  const { available: cars, loading: carsLoading, error: carsError } = useAppSelector((s) => s.cars);
  const {
    creating,
    current: createdBooking,
    error: bookingError,
  } = useAppSelector((s) => s.bookings);

  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);

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
        return form.dropAddress.trim().length > 0;
      case 3:
        return true; // stops are optional
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
        car: form.selectedCarId,
        distance: { estimated: form.estimatedDistance },
        category: selectedCar?.category,
      }),
    );
  };

  const selectedCar = cars.find((c) => c._id === form.selectedCarId);

  return (
    <div className="pb-28">
      <PageHeader title="Book a Ride" showBack />

      <StepIndicator steps={STEPS} current={bookingStep} />

      <AnimatePresence mode="wait">
        <motion.div
          key={bookingStep}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
        >
          {bookingStep === 1 && <PickupStep form={form} updateField={updateField} />}
          {bookingStep === 2 && <DropStep form={form} updateField={updateField} />}
          {bookingStep === 3 && <StopsStep form={form} updateField={updateField} />}
          {bookingStep === 4 && <ScheduleStep form={form} updateField={updateField} />}
          {bookingStep === 5 && (
            <CarStep
              cars={cars}
              loading={carsLoading}
              selectedId={form.selectedCarId}
              onSelect={(id) => updateField('selectedCarId', id)}
            />
          )}
          {bookingStep === 6 && <ReviewStep form={form} selectedCar={selectedCar || null} />}
        </motion.div>
      </AnimatePresence>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 p-4 flex gap-3 safe-area-bottom z-30">
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

function PickupStep({
  form,
  updateField,
}: {
  form: FormData;
  updateField: <K extends keyof FormData>(key: K, val: FormData[K]) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-3 h-3 rounded-full bg-success-500" />
        <h2 className="text-base font-semibold text-neutral-800">Pickup Location</h2>
      </div>
      <Input
        label="Pickup Address"
        placeholder="Enter pickup address"
        icon={<MapPin className="w-4 h-4" />}
        value={form.pickupAddress}
        onChange={(e) => updateField('pickupAddress', e.target.value)}
      />
      <Input
        label="Landmark (optional)"
        placeholder="Near a famous place, building, etc."
        value={form.pickupLandmark}
        onChange={(e) => updateField('pickupLandmark', e.target.value)}
      />
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
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
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
        placeholder="50"
        value={String(form.estimatedDistance)}
        onChange={(e) => updateField('estimatedDistance', Number(e.target.value) || 0)}
      />
    </div>
  );
}

function StopsStep({
  form,
  updateField,
}: {
  form: FormData;
  updateField: <K extends keyof FormData>(key: K, val: FormData[K]) => void;
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
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-base font-semibold text-neutral-800">Intermediate Stops</h2>
          <p className="text-xs text-neutral-400">Optional — add stops along the way (₹100/stop)</p>
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
          Stop charge: ₹{form.stops.filter((s) => s.address.trim()).length * 100}
        </p>
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
}: {
  form: FormData;
  selectedCar: { make: string; model: string; category: string } | null;
}) {
  const validStops = form.stops.filter((s) => s.address.trim());
  const pricePerKm = 12;
  const baseFare = 300;
  const distanceCharge = form.estimatedDistance * pricePerKm;
  const tollEstimate = 150;
  const stopCharge = validStops.length * 100;
  const subtotal = baseFare + distanceCharge + tollEstimate + stopCharge;
  const gstAmount = Math.round(subtotal * 0.05);
  const totalAmount = subtotal + gstAmount;

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-neutral-800 mb-2">Review Booking</h2>

      {/* Route Summary */}
      <div className="bg-white rounded-xl p-4 border border-neutral-100 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center mt-1">
            <div className="w-2.5 h-2.5 rounded-full bg-success-500" />
            {validStops.map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-0.5 h-5 bg-neutral-200 my-0.5" />
                <div className="w-2 h-2 rounded-full bg-amber-400" />
              </div>
            ))}
            <div className="w-0.5 h-5 bg-neutral-200 my-0.5" />
            <div className="w-2.5 h-2.5 rounded-full bg-error-500" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-sm font-medium text-neutral-900">{form.pickupAddress}</p>
              {form.pickupLandmark && (
                <p className="text-xs text-neutral-400">{form.pickupLandmark}</p>
              )}
            </div>
            {validStops.map((stop, i) => (
              <div key={stop.id}>
                <p className="text-xs text-amber-600 font-medium">Stop {i + 1}</p>
                <p className="text-sm text-neutral-700">{stop.address}</p>
              </div>
            ))}
            <div>
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
        stopChargePerStop={100}
        totalStopCharge={stopCharge}
        gstAmount={gstAmount}
        totalAmount={totalAmount}
      />
    </div>
  );
}
