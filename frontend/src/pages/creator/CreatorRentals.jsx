import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import * as rentalApi from "../../services/rentalApi";
import { useAuth } from "../../hooks/useAuth";

function CreatorRentals() {
  const { user } = useAuth();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [targetRental, setTargetRental] = useState(null);
  const [cancelError, setCancelError] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);

  const loadRentals = () => {
    setLoading(true);
    setError("");
    rentalApi
      .getCreatorRentals()
      .then((data) => {
        setRentals(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.message || "Failed to load rentals");
        setRentals([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    let active = true;
    rentalApi
      .getCreatorRentals()
      .then((data) => {
        if (active) {
          setRentals(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err?.message || "Failed to load rentals");
          setRentals([]);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [user]);

  const handleOpenCancelModal = (rental) => {
    setTargetRental(rental);
    setCancelError("");
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!targetRental?.id) return;
    setIsCancelling(true);
    setCancelError("");
    try {
      await rentalApi.cancelRental(targetRental.id, targetRental.status);
      setRentals((prev) =>
        prev.map((r) => (r.id === targetRental.id ? { ...r, status: "CANCELLED" } : r))
      );
      setIsCancelling(false);
      setCancelModalOpen(false);
      setTargetRental(null);
    } catch (err) {
      setIsCancelling(false);
      setCancelError(err?.message || "Failed to cancel rental.");
    }
  };

  const filteredRentals = rentals.filter((r) => {
    if (statusFilter === "ALL") return true;
    return r.status === statusFilter;
  });

  const activeRentals = rentals.filter((r) => r.status === "ACTIVE" || r.status === "APPROVED");
  const completedRentals = rentals.filter((r) => r.status === "COMPLETED" || r.status === "RETURNED");
  const totalCommitment = rentals
    .filter((r) => ["PENDING", "APPROVED", "ACTIVE", "COMPLETED", "RETURNED"].includes(r.status))
    .reduce((sum, r) => sum + (Number(r.totalAmount) || 0), 0);

  return (
    <DashboardLayout activePath="/creator/rentals">
      <div className="flex flex-col w-full pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md py-4 border-b border-surface-container-high mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-label-sm text-[10px] px-2 py-0.5 rounded bg-primary-container/20 text-primary font-mono uppercase tracking-wider">
                CREATOR WORKSPACE
              </span>
              <span className="text-outline text-xs">• Equipment Rentals</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface font-semibold tracking-tight">
              My Gear Rentals
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Track rented microphones, cameras, mixers, and audio accessories across active and completed productions.
            </p>
          </div>

          <div>
            <Link
              to="/creator/equipment"
              className="inline-flex items-center gap-2 px-space-lg h-[42px] bg-primary-container hover:bg-secondary-container text-on-primary-container rounded-lg font-body-md text-body-md font-medium transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              <span>Find More Gear</span>
            </Link>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-surface-container-low border border-surface-container-high rounded-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-outline font-label-sm text-xs uppercase">
              <span>TOTAL RENTALS</span>
              <span className="material-symbols-outlined text-[16px]">inventory_2</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-headline-md text-headline-md text-on-surface font-semibold font-mono">
                {String(rentals.length).padStart(2, "0")}
              </span>
              <span className="text-outline text-xs font-mono">ITEMS</span>
            </div>
          </div>

          <div className="p-4 bg-surface-container-low border border-surface-container-high rounded-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-tertiary font-label-sm text-xs uppercase">
              <span>ACTIVE / APPROVED</span>
              <span className="material-symbols-outlined text-[16px]">verified</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-headline-md text-headline-md text-tertiary font-semibold font-mono">
                {String(activeRentals.length).padStart(2, "0")}
              </span>
              <span className="text-tertiary text-xs font-mono">ACTIVE</span>
            </div>
          </div>

          <div className="p-4 bg-surface-container-low border border-surface-container-high rounded-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-outline font-label-sm text-xs uppercase">
              <span>RETURNED / CLOSED</span>
              <span className="material-symbols-outlined text-[16px]">task_alt</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-headline-md text-headline-md text-on-surface font-semibold font-mono">
                {String(completedRentals.length).padStart(2, "0")}
              </span>
              <span className="text-outline text-xs font-mono">RETURNED</span>
            </div>
          </div>

          <div className="p-4 bg-surface-container-low border border-surface-container-high rounded-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-primary font-label-sm text-xs uppercase">
              <span>TOTAL VALUE</span>
              <span className="material-symbols-outlined text-[16px]">payments</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-headline-md text-headline-md text-on-surface font-semibold font-mono">
                ₹{totalCommitment.toLocaleString("en-IN")}
              </span>
              <span className="text-outline text-xs font-mono">INR</span>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          {["ALL", "PENDING", "APPROVED", "ACTIVE", "RETURNED", "COMPLETED", "CANCELLED"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-full text-xs font-label-sm uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
                statusFilter === st
                  ? "bg-primary-container text-on-primary-container font-semibold"
                  : "bg-surface-container hover:bg-surface-container-high text-outline"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-surface-container-low border border-surface-container-high rounded-lg"></div>
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center bg-surface-container-low border border-error-container/40 rounded-xl">
            <div className="w-16 h-16 rounded-full bg-error-container/20 border border-error-container/30 flex items-center justify-center text-error mx-auto mb-4">
              <span className="material-symbols-outlined text-[32px]">sync_problem</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-1">
              Failed to load rentals
            </h3>
            <p className="font-body-md text-body-md text-outline max-w-sm mx-auto mb-6">{error}</p>
            <button
              type="button"
              onClick={loadRentals}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-body-sm font-medium border border-surface-container-high cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>Retry</span>
            </button>
          </div>
        ) : filteredRentals.length === 0 ? (
          <div className="p-12 text-center bg-surface-container-low border border-surface-container-high rounded-xl">
            <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center text-outline mx-auto mb-4">
              <span className="material-symbols-outlined text-[32px]">production_quantity_limits</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-1">
              {statusFilter === "ALL" ? "No rentals yet" : `No ${statusFilter} rentals`}
            </h3>
            <p className="font-body-md text-body-md text-outline max-w-sm mx-auto mb-6">
              You haven&apos;t reserved any equipment yet. Explore the marketplace to find pro recording gear.
            </p>
            <Link
              to="/creator/equipment"
              className="inline-flex items-center gap-2 px-space-lg h-[42px] bg-primary-container hover:bg-secondary-container text-on-primary-container rounded-lg font-body-md text-body-md font-medium transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              <span>Browse Equipment Marketplace</span>
            </Link>
          </div>
        ) : (
          <div className="bg-surface-container-low border border-surface-container-high rounded-xl overflow-hidden shadow-sm">
            <div className="hidden md:grid grid-cols-12 px-4 py-2.5 bg-surface-container-lowest/60 text-outline font-label-sm text-xs uppercase tracking-wider border-b border-surface-container-high">
              <div className="col-span-4">Equipment &amp; Facility</div>
              <div className="col-span-3">Rental Schedule</div>
              <div className="col-span-1">Qty</div>
              <div className="col-span-2">Total Amount</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            <div className="divide-y divide-surface-container-high/60">
              {filteredRentals.map((r) => (
                <div
                  key={r.id}
                  className="p-4 md:grid md:grid-cols-12 md:items-center gap-4 hover:bg-surface-container-high/30 transition-colors"
                >
                  {/* Gear info */}
                  <div className="col-span-4 flex items-center gap-3 mb-2 md:mb-0">
                    <div className="w-10 h-10 rounded-lg bg-surface-container overflow-hidden shrink-0 flex items-center justify-center text-outline">
                      {r.equipment?.imageUrl ? (
                        <img
                          src={r.equipment.imageUrl}
                          alt={r.equipment.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="material-symbols-outlined text-[20px]">mic</span>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-body-md text-sm font-semibold text-on-surface truncate">
                        {r.equipment?.name || "Gear Rental"}
                      </span>
                      <span className="text-xs text-outline truncate">
                        {r.equipment?.brand} {r.equipment?.model} • {r.equipment?.city || "Studio"}
                      </span>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="col-span-3 flex flex-col mb-2 md:mb-0">
                    <span className="font-body-sm text-xs text-on-surface font-mono">
                      {r.startDateFormatted}
                    </span>
                    <span className="text-[11px] text-outline">
                      To {r.endDateFormatted} ({r.durationText})
                    </span>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-1 text-xs font-mono text-on-surface mb-2 md:mb-0">
                    {r.quantity} unit(s)
                  </div>

                  {/* Total Amount */}
                  <div className="col-span-2 flex flex-col mb-2 md:mb-0">
                    <span className="font-body-md text-sm font-bold text-on-surface font-mono">
                      {r.totalAmountFormatted}
                    </span>
                    <span className="text-[10px] text-outline">
                      ₹{r.rentalRate}/{r.pricingUnit === "DAILY" ? "day" : "hr"}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="col-span-1 mb-2 md:mb-0">
                    {r.status === "APPROVED" || r.status === "ACTIVE" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-container/30 text-tertiary border border-tertiary-container/50 font-label-sm text-[10px] uppercase font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                        {r.status}
                      </span>
                    ) : r.status === "PENDING" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-container/30 text-primary border border-primary-container/50 font-label-sm text-[10px] uppercase font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                        PENDING
                      </span>
                    ) : r.status === "RETURNED" || r.status === "COMPLETED" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high text-outline border border-surface-container-highest font-label-sm text-[10px] uppercase">
                        {r.status}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-error-container/20 text-error border border-error-container/40 font-label-sm text-[10px] uppercase">
                        {r.status}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center md:justify-end gap-2">
                    {r.status === "PENDING" || r.status === "APPROVED" ? (
                      <button
                        type="button"
                        onClick={() => handleOpenCancelModal(r)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-primary-container/40 text-primary hover:bg-primary-container/10 text-xs font-medium transition-colors cursor-pointer"
                      >
                        <span>Cancel</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRental(r);
                          setDetailsModalOpen(true);
                        }}
                        className="text-outline hover:text-on-surface text-xs transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cancellation Modal */}
        {cancelModalOpen && targetRental && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-error-container/20 border border-error-container/30 flex items-center justify-center text-error shrink-0">
                  <span className="material-symbols-outlined text-[22px]">warning</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-lg font-bold text-on-surface">
                    Cancel Rental Request?
                  </h3>
                  <span className="text-xs text-outline">
                    This equipment reservation will be cancelled.
                  </span>
                </div>
              </div>

              {cancelError && (
                <div className="p-3 bg-error-container/20 border border-error-container/40 rounded-lg text-error text-xs">
                  {cancelError}
                </div>
              )}

              <div className="p-3 bg-surface-container rounded-lg border border-surface-container-high text-xs flex flex-col gap-1">
                <span className="font-semibold text-on-surface">{targetRental.equipment?.name}</span>
                <span className="text-outline">{targetRental.startDateFormatted} to {targetRental.endDateFormatted}</span>
                <span className="text-tertiary font-mono font-bold mt-1">{targetRental.totalAmountFormatted}</span>
              </div>

              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-body-sm font-medium transition-colors"
                >
                  Keep Rental
                </button>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={handleConfirmCancel}
                  className="px-4 py-2 rounded-lg bg-primary-container hover:bg-secondary-container text-on-primary-container text-body-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {detailsModalOpen && selectedRental && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
                <div>
                  <h3 className="font-headline-sm text-lg font-bold text-on-surface">
                    Rental Reservation Details
                  </h3>
                  <span className="text-xs font-mono text-outline">ID: {selectedRental.id}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailsModalOpen(false)}
                  className="text-outline hover:text-on-surface cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="flex flex-col gap-2.5 text-xs">
                <div className="p-3 bg-surface-container rounded-lg border border-surface-container-high flex justify-between">
                  <span className="text-outline uppercase">Equipment:</span>
                  <span className="text-on-surface font-semibold">{selectedRental.equipment?.name}</span>
                </div>
                <div className="p-3 bg-surface-container rounded-lg border border-surface-container-high flex justify-between">
                  <span className="text-outline uppercase">Provider:</span>
                  <span className="text-on-surface">{selectedRental.provider?.name || "Equipment Host"}</span>
                </div>
                <div className="p-3 bg-surface-container rounded-lg border border-surface-container-high flex justify-between">
                  <span className="text-outline uppercase">Timeframe:</span>
                  <span className="text-on-surface font-mono">{selectedRental.startDateFormatted} → {selectedRental.endDateFormatted}</span>
                </div>
                <div className="p-3 bg-surface-container rounded-lg border border-surface-container-high flex justify-between">
                  <span className="text-outline uppercase">Total Units:</span>
                  <span className="text-on-surface font-mono">{selectedRental.quantity} Unit(s)</span>
                </div>
                <div className="p-3 bg-surface-container rounded-lg border border-surface-container-high flex justify-between">
                  <span className="text-outline uppercase">Total Amount:</span>
                  <span className="text-tertiary font-bold font-mono text-sm">{selectedRental.totalAmountFormatted}</span>
                </div>
                <div className="p-3 bg-surface-container rounded-lg border border-surface-container-high flex justify-between">
                  <span className="text-outline uppercase">Status:</span>
                  <span className="font-bold uppercase font-mono text-primary-container">{selectedRental.status}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setDetailsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-body-sm font-medium transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default CreatorRentals;
