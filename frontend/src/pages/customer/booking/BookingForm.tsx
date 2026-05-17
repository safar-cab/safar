import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setBookingStep } from '@/store/slices/uiSlice';
import { fetchAvailableCars } from '@/store/slices/carsSlice';
import { createBooking } from '@/store/slices/bookingsSlice';
import { StepIndicator } from '@/components/core/StepIndicator';
import { CarCard } from '@/components/core/CarCard';
import { PriceBreakdown } from '@/components/core/PriceBreakdown';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';

const STEPS = ['Pickup', 'Drop', 'Schedule', 'Car', 'Review'];

interface FormData {
  pickupAddress: string;
  pickupLandmark: string;
  dropAddress: string;
  dropLandmark: string;
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
  const { creating, current: createdBooking, error: bookingError } = useAppSelector((s) => s.bookings);

  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);

  // Reset step on mount
  useEffect(() => {
    dispatch(setBookingStep(1));
    return () => { dispatch(setBookingStep(1)); };
  }, [dispatch]);

  // Fetch cars when reaching step 4
  useEffect(() => {
    if (bookingStep === 4) {
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
      case 1: return form.pickupAddress.trim().length > 0;
      case 2: return form.dropAddress.trim().length > 0;
      case 3: return form.date.length > 0 && form.time.length > 0;
      case 4: return form.selectedCarId.length > 0;
      case 5: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (bookingStep < 5) {
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
          {bookingStep === 1 && (
            <PickupStep
              form={form}
              updateField={updateField}
            />
          )}
          {bookingStep === 2 && (
            <DropStep
              form={form}
              updateField={updateField}
            />
          )}
          {bookingStep === 3 && (
            <ScheduleStep
              form={form}
              updateField={updateField}
            />
          )}
          {bookingStep === 4 && (
            <CarStep
              cars={cars}
              loading={carsLoading}
              selectedId={form.selectedCarId}
              onSelect={(id) => updateField('selectedCarId', id)}
            />
          )}
          {bookingStep === 5 && (
            <ReviewStep form={form} selectedCar={selectedCar || null} />
          )}
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
          {bookingStep === 5 ? 'Confirm Booking' : 'Next'}
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
  cars: { _id: string; make: string; model: string; category: string; seats: number; color?: string; registrationNumber: string; photos: string[]; year?: number; documents?: Record<string, unknown>; assignedDriver?: unknown; isActive: boolean; createdAt: string }[];
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
  // Estimated pricing
  const pricePerKm = 12;
  const baseFare = 300;
  const distanceCharge = form.estimatedDistance * pricePerKm;
  const tollEstimate = 150;
  const subtotal = baseFare + distanceCharge + tollEstimate;
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
            <div className="w-0.5 h-8 bg-neutral-200 my-1" />
            <div className="w-2.5 h-2.5 rounded-full bg-error-500" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-sm font-medium text-neutral-900">{form.pickupAddress}</p>
              {form.pickupLandmark && (
                <p className="text-xs text-neutral-400">{form.pickupLandmark}</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900">{form.dropAddress}</p>
              {form.dropLandmark && (
                <p className="text-xs text-neutral-400">{form.dropLandmark}</p>
              )}
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
                ? new Date(form.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
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
        gstAmount={gstAmount}
        totalAmount={totalAmount}
      />
    </div>
  );
}
