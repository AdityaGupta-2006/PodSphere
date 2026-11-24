import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import * as equipmentApi from "../../services/equipmentApi";
import * as rentalApi from "../../services/rentalApi";
import { useAuth } from "../../hooks/useAuth";

function EquipmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Rental form state
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("18:00");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [rentalError, setRentalError] = useState("");
  const [successModal, setSuccessModal] = useState(null);

  useEffect(() => {
    let isMounted = true;
    equipmentApi
      .getEquipmentById(id)
      .then((data) => {
        if (isMounted) {
          setEquipment(data);
          // Set default start date to tomorrow
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const yyyy = tomorrow.getFullYear();
          const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
          const dd = String(tomorrow.getDate()).padStart(2, "0");
          const defaultStartDateStr = `${yyyy}-${mm}-${dd}`;
          setStartDate(defaultStartDateStr);

          // Default end date
          const dayAfter = new Date(tomorrow);
          if (data?.pricingUnit === "DAILY") {
            dayAfter.setDate(dayAfter.getDate() + 1);
          }
          const yyyy2 = dayAfter.getFullYear();
          const mm2 = String(dayAfter.getMonth() + 1).padStart(2, "0");
          const dd2 = String(dayAfter.getDate()).padStart(2, "0");
          setEndDate(`${yyyy2}-${mm2}-${dd2}`);

          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err?.message || "Failed to load equipment details.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Live calculation of duration and price breakdown
  const calculateEstimate = () => {
    if (!startDate || !startTime || !endDate || !endTime || !equipment) {
      return null;
    }

    const start = new Date(`${startDate}T${startTime}:00+05:30`);
    const end = new Date(`${endDate}T${endTime}:00+05:30`);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return null;
    }

    const durationMs = end.getTime() - start.getTime();
    const durationHoursExact = durationMs / (1000 * 60 * 60);

    const isDaily = equipment.pricingUnit === "DAILY";
    let billableUnits;
    let rate;

    if (isDaily) {
      billableUnits = Math.max(1, Math.ceil(durationHoursExact / 24));
      rate = equipment.dailyRate !== null ? Number(equipment.dailyRate) : Number(equipment.hourlyRate) * 24;
    } else {
      billableUnits = Math.max(1, Math.ceil(durationHoursExact));
      rate = equipment.hourlyRate !== null ? Number(equipment.hourlyRate) : Number(equipment.dailyRate) / 24;
    }

    const total = billableUnits * rate * quantity;

    return {
      start,
      end,
      durationHours: durationHoursExact,
      billableUnits,
      unitLabel: isDaily ? (billableUnits > 1 ? "Days" : "Day") : (billableUnits > 1 ? "Hours" : "Hour"),
      rate,
      total
    };
  };

  const estimate = calculateEstimate();

  const handleRentalSubmit = async (e) => {
    e.preventDefault();
    setRentalError("");

    if (!estimate) {
      setRentalError("Please specify a valid future start and end date/time.");
      return;
    }

    if (estimate.start <= new Date()) {
      setRentalError("Rental start time must be in the future.");
      return;
    }

    if (equipment.minimumRentalHours && estimate.durationHours < equipment.minimumRentalHours) {
      setRentalError(`This gear requires a minimum rental period of ${equipment.minimumRentalHours} hours.`);
      return;
    }

    if (equipment.providerId === user?.id) {
      setRentalError("You cannot rent your own equipment listing.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        equipmentId: equipment.id,
        startTime: estimate.start.toISOString(),
        endTime: estimate.end.toISOString(),
        quantity: Number(quantity) || 1,
        notes: notes.trim()
      };

      const result = await rentalApi.createRental(payload);
      setSubmitting(false);
      setSuccessModal(result);
    } catch (err) {
      setSubmitting(false);
      setRentalError(err?.message || "Failed to submit rental request.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout activePath="/creator/equipment">
        <div className="flex flex-col gap-6 animate-pulse py-8">
          <div className="h-8 bg-surface-container-high rounded w-64"></div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 h-96 bg-surface-container-low rounded-xl"></div>
            <div className="lg:col-span-4 h-96 bg-surface-container-low rounded-xl"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !equipment) {
    return (
      <DashboardLayout activePath="/creator/equipment">
        <div className="py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-error-container/20 border border-error-container/40 flex items-center justify-center text-error mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">error</span>
          </div>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">
            Equipment Not Found
          </h2>
          <p className="font-body-md text-outline max-w-sm mx-auto mb-6">
            {error || "The requested equipment listing could not be found."}
          </p>
          <Link
            to="/creator/equipment"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-container text-on-primary-container font-body-sm font-medium hover:bg-secondary-container transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Equipment Marketplace</span>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const displayRate = equipment.pricingUnit === "DAILY" && equipment.dailyRate
    ? `₹${Number(equipment.dailyRate).toLocaleString()} / day`
    : `₹${Number(equipment.hourlyRate || equipment.dailyRate || 500).toLocaleString()} / hr`;

  return (
    <DashboardLayout activePath="/creator/equipment">
      <div className="flex flex-col w-full pb-16">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-label-sm uppercase tracking-wider text-outline mb-4">
          <Link to="/creator/equipment" className="hover:text-on-surface transition-colors">
            Equipment Marketplace
          </Link>
          <span>/</span>
          <span className="text-on-surface font-medium truncate">{equipment.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Details & Specs */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Hero Image */}
            <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden bg-surface-container border border-surface-container-high shadow-xl">
              <img
                src={equipment.imageUrl || equipment.imageUrls?.[0] || "https://lh3.googleusercontent.com/aida-public/AB6AXuAY5Js5asS-K45ETzqtnRCzez9QWi4Sf9mwbsY7UZTFsPEh_BK_4nfW"}
                alt={equipment.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://lh3.googleusercontent.com/aida-public/AB6AXuAY5Js5asS-K45ETzqtnRCzez9QWi4Sf9mwbsY7UZTFsPEh_BK_4nfW";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 via-transparent to-transparent"></div>

              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <span className="px-2.5 py-1 rounded bg-surface-container-lowest/90 backdrop-blur-md text-tertiary font-label-sm text-xs font-semibold uppercase tracking-wider border border-tertiary/20 inline-block mb-1">
                    {equipment.category}
                  </span>
                  <h1 className="font-headline-lg text-2xl font-bold text-on-surface drop-shadow">
                    {equipment.name}
                  </h1>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-3 py-1.5 rounded-xl bg-surface-container-lowest/95 backdrop-blur-md text-on-surface font-mono text-base font-bold border border-surface-container-high inline-block">
                    {displayRate}
                  </span>
                </div>
              </div>
            </div>

            {/* Core Info Card */}
            <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-surface-container rounded-lg border border-surface-container-high">
                  <span className="text-[10px] font-label-sm uppercase text-outline block">Brand</span>
                  <span className="text-sm font-semibold text-on-surface font-mono">{equipment.brand}</span>
                </div>
                <div className="p-3 bg-surface-container rounded-lg border border-surface-container-high">
                  <span className="text-[10px] font-label-sm uppercase text-outline block">Model</span>
                  <span className="text-sm font-semibold text-on-surface font-mono">{equipment.model}</span>
                </div>
                <div className="p-3 bg-surface-container rounded-lg border border-surface-container-high">
                  <span className="text-[10px] font-label-sm uppercase text-outline block">Condition</span>
                  <span className="text-sm font-semibold text-tertiary">{equipment.condition?.replace("_", " ") || "GOOD"}</span>
                </div>
                <div className="p-3 bg-surface-container rounded-lg border border-surface-container-high">
                  <span className="text-[10px] font-label-sm uppercase text-outline block">Inventory</span>
                  <span className="text-sm font-semibold text-on-surface font-mono">{equipment.totalQuantity} Unit(s)</span>
                </div>
              </div>

              <div>
                <h3 className="font-headline-sm text-sm font-semibold text-on-surface uppercase tracking-wider mb-2">
                  Overview &amp; Features
                </h3>
                <p className="font-body-md text-on-surface-variant leading-relaxed">
                  {equipment.description}
                </p>
              </div>

              {equipment.specifications && equipment.specifications.length > 0 && (
                <div>
                  <h3 className="font-headline-sm text-sm font-semibold text-on-surface uppercase tracking-wider mb-2">
                    Specifications
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {equipment.specifications.map((spec, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-on-surface-variant bg-surface-container/60 p-2 rounded-lg">
                        <span className="material-symbols-outlined text-[16px] text-tertiary">check</span>
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-surface-container-high flex items-center justify-between text-xs text-outline">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  <span>{equipment.address}, {equipment.city}</span>
                </div>
                {equipment.provider?.name && (
                  <div className="flex items-center gap-1.5 font-medium text-on-surface">
                    <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
                    <span>Listed by {equipment.provider.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Rental Booking Card */}
          <div className="lg:col-span-5">
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-6 shadow-2xl sticky top-20 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
                <div>
                  <h2 className="font-headline-sm text-lg font-bold text-on-surface">
                    Rent This Equipment
                  </h2>
                  <span className="text-xs text-outline">Reserve for upcoming production</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-outline uppercase block">Pricing Unit</span>
                  <span className="font-label-sm text-xs font-mono font-bold text-tertiary uppercase">
                    {equipment.pricingUnit}
                  </span>
                </div>
              </div>

              {rentalError && (
                <div className="p-3 rounded-xl bg-error-container/20 border border-error-container/40 text-error text-body-sm flex items-start gap-2">
                  <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">warning</span>
                  <span>{rentalError}</span>
                </div>
              )}

              <form onSubmit={handleRentalSubmit} className="flex flex-col gap-4">
                {/* Start Date & Time */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-xs uppercase tracking-wider text-outline">
                    Pickup / Start Date &amp; Time *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      required
                      value={startDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-surface-container border border-surface-container-high rounded-lg px-3 py-2 text-on-surface text-body-sm focus:outline-none focus:border-primary"
                    />
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="bg-surface-container border border-surface-container-high rounded-lg px-3 py-2 text-on-surface text-body-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* End Date & Time */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-xs uppercase tracking-wider text-outline">
                    Return / End Date &amp; Time *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      required
                      value={endDate}
                      min={startDate || new Date().toISOString().split("T")[0]}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-surface-container border border-surface-container-high rounded-lg px-3 py-2 text-on-surface text-body-sm focus:outline-none focus:border-primary"
                    />
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="bg-surface-container border border-surface-container-high rounded-lg px-3 py-2 text-on-surface text-body-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="font-label-sm text-xs uppercase tracking-wider text-outline">
                      Quantity
                    </label>
                    <span className="text-xs text-outline">Max: {equipment.totalQuantity} units</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max={equipment.totalQuantity || 1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(equipment.totalQuantity || 1, Number(e.target.value))))}
                    className="bg-surface-container border border-surface-container-high rounded-lg px-3 py-2 text-on-surface text-body-sm font-mono focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Notes */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-xs uppercase tracking-wider text-outline">
                    Production Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Specific cables, pickup time preference, studio project name..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-surface-container border border-surface-container-high rounded-lg p-2.5 text-on-surface text-body-sm placeholder:text-outline/60 focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                {/* Price Breakdown Calculation */}
                {estimate && (
                  <div className="p-3.5 bg-surface-container-low rounded-xl border border-surface-container-high flex flex-col gap-2">
                    <div className="flex justify-between text-xs text-outline">
                      <span>Rental Duration:</span>
                      <span className="font-medium text-on-surface">
                        {estimate.billableUnits} {estimate.unitLabel}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-outline">
                      <span>Base Rate:</span>
                      <span className="font-mono text-on-surface">
                        ₹{estimate.rate.toLocaleString()} / {equipment.pricingUnit === "DAILY" ? "day" : "hr"}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-outline">
                      <span>Units Requested:</span>
                      <span className="font-mono text-on-surface">× {quantity}</span>
                    </div>
                    <div className="pt-2 border-t border-surface-container-high flex justify-between items-center">
                      <span className="font-label-sm text-xs font-bold uppercase text-on-surface">
                        Estimated Total:
                      </span>
                      <span className="font-headline-sm text-xl font-bold font-mono text-tertiary">
                        ₹{estimate.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 rounded-xl bg-primary-container hover:bg-secondary-container text-on-primary-container font-body-sm font-semibold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                  <span>{submitting ? "Submitting Request..." : "Request Equipment Rental"}</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Success Modal */}
        {successModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-tertiary/20 text-tertiary flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[36px]">check_circle</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-xl font-bold text-on-surface">
                  Booking Request Submitted
                </h3>
                <p className="font-body-md text-sm text-outline mt-1">
                  Your rental request is now <strong>Pending Provider Confirmation</strong>. The gear provider has been notified.
                </p>
              </div>

              <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container-high text-left text-xs flex flex-col gap-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-outline">Gear:</span>
                  <span className="text-on-surface font-semibold">{equipment.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Quantity:</span>
                  <span className="text-on-surface">{quantity} unit(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Estimated Amount:</span>
                  <span className="text-tertiary font-bold">₹{estimate?.total?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Status:</span>
                  <span className="text-primary-container font-bold">PENDING</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setSuccessModal(null)}
                  className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-body-sm font-medium transition-colors"
                >
                  Stay on Page
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/creator/rentals")}
                  className="px-4 py-2 rounded-lg bg-primary-container hover:bg-secondary-container text-on-primary-container text-body-sm font-semibold transition-colors"
                >
                  View My Rentals
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default EquipmentDetails;
