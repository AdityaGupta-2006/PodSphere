import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import * as bookingApi from "../../services/bookingApi";
import { useAuth } from "../../hooks/useAuth";

function CreatorBookings() {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [targetBooking, setTargetBooking] = useState(null);
  const [cancelError, setCancelError] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCreatorBookings = () => {
    setLoading(true);
    setError("");
    const filter = user?.id ? { creatorId: user.id } : {};
    bookingApi
      .getBookings(filter)
      .then((data) => {
        setBookings(data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load bookings");
        setLoading(false);
      });
  };

  useEffect(() => {
    let active = true;
    const filter = user?.id ? { creatorId: user.id } : {};
    bookingApi
      .getBookings(filter)
      .then((data) => {
        if (active) {
          setBookings(data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || "Failed to load bookings");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [user]);

  const handleOpenCancelModal = (booking) => {
    setTargetBooking(booking);
    setCancelError("");
    setModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    setModalOpen(false);
    setTargetBooking(null);
    setCancelError("");
  };

  const handleConfirmCancel = async () => {
    if (!targetBooking?.id) return;
    setIsCancelling(true);
    setCancelError("");
    try {
      await bookingApi.cancelBooking(targetBooking.id, user?.id);
      setBookings((prev) =>
        prev.map((b) => (b.id === targetBooking.id ? { ...b, status: "CANCELLED" } : b))
      );
      setIsCancelling(false);
      setModalOpen(false);
      setTargetBooking(null);
    } catch (err) {
      setIsCancelling(false);
      setCancelError(err.message || "Failed to cancel booking.");
    }
  };

  const activeConfirmed = bookings.filter((b) => b.status === "CONFIRMED");
  const completedRuns = bookings.filter((b) => b.status === "COMPLETED");
  const totalCommitment = bookings
    .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
    .reduce((sum, b) => sum + (Number(b.rawAmount) || 0), 0);

  return (
    <DashboardLayout activePath="/creator/bookings">
      <div className="flex flex-col w-full pb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md py-4 border-b border-surface-container-high mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-label-sm text-[10px] px-2 py-0.5 rounded bg-primary-container/20 text-primary font-mono uppercase tracking-wider">
                CREATOR WORKSPACE
              </span>
              <span className="text-outline text-xs">• Session Pipeline</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface font-semibold tracking-tight">
              My Studio Bookings
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Review your upcoming and completed podcast recording sessions, dates, rates, and status.
            </p>
          </div>

          <div>
            <Link
              className="inline-flex items-center gap-2 px-space-lg h-[42px] bg-primary-container hover:bg-secondary-container text-on-primary-container rounded-lg font-body-md text-body-md font-medium transition-colors shadow-sm"
              to="/creator/studios"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              <span>Find More Studios</span>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="h-28 bg-surface-container-low border border-surface-container-high rounded-lg p-4"></div>
              <div className="h-28 bg-surface-container-low border border-surface-container-high rounded-lg p-4"></div>
              <div className="h-28 bg-surface-container-low border border-surface-container-high rounded-lg p-4"></div>
              <div className="h-28 bg-surface-container-low border border-surface-container-high rounded-lg p-4"></div>
            </div>
            <div className="h-64 bg-surface-container-low border border-surface-container-high rounded-lg"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-space-xl bg-surface-container-low border border-error-container/40 rounded-lg text-center">
            <div className="w-16 h-16 rounded-full bg-error-container/20 border border-error-container/30 flex items-center justify-center text-error mb-4">
              <span className="material-symbols-outlined text-[32px]">sync_problem</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              Failed to load bookings
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mt-1 mb-6">
              {error}
            </p>
            <button
              className="inline-flex items-center gap-2 px-space-md h-9 bg-surface-container hover:bg-surface-container-high text-on-surface border border-surface-container-high rounded-lg font-body-sm text-body-sm font-medium transition-colors cursor-pointer"
              onClick={loadCreatorBookings}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>Retry</span>
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-space-xl bg-surface-container-low border border-surface-container-high rounded-lg text-center">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline mb-4">
              <span className="material-symbols-outlined text-[32px]">event_busy</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              No bookings yet
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mt-1 mb-6">
              You haven&apos;t booked any studio sessions yet. Find a verified studio to start recording.
            </p>
            <Link
              className="inline-flex items-center gap-2 px-space-lg h-[42px] bg-primary-container hover:bg-secondary-container text-on-primary-container rounded-lg font-body-md text-body-md font-medium transition-colors shadow-sm"
              to="/creator/studios"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              <span>Browse Studios</span>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-space-md bg-surface-container-low border border-surface-container-high rounded-lg flex flex-col justify-between">
                <div className="flex items-center justify-between text-outline font-label-sm text-label-sm">
                  <span>TOTAL SESSIONS</span>
                  <span className="material-symbols-outlined text-[16px]">equalizer</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-headline-md text-headline-md text-on-surface font-semibold">
                    {String(bookings.length).padStart(2, "0")}
                  </span>
                  <span className="font-label-sm text-label-sm text-outline">RUNS</span>
                </div>
              </div>

              <div className="p-space-md bg-surface-container-low border border-surface-container-high rounded-lg flex flex-col justify-between">
                <div className="flex items-center justify-between text-outline font-label-sm text-label-sm">
                  <span>ACTIVE PIPELINE</span>
                  <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-headline-md text-headline-md text-tertiary font-semibold">
                    {String(activeConfirmed.length).padStart(2, "0")}
                  </span>
                  <span className="font-label-sm text-label-sm text-tertiary">CONFIRMED</span>
                </div>
              </div>

              <div className="p-space-md bg-surface-container-low border border-surface-container-high rounded-lg flex flex-col justify-between">
                <div className="flex items-center justify-between text-outline font-label-sm text-label-sm">
                  <span>COMPLETED RUNS</span>
                  <span className="material-symbols-outlined text-[16px] text-outline">inventory_2</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-headline-md text-headline-md text-on-surface font-semibold">
                    {String(completedRuns.length).padStart(2, "0")}
                  </span>
                  <span className="font-label-sm text-label-sm text-outline">COMPLETED</span>
                </div>
              </div>

              <div className="p-space-md bg-surface-container-low border border-surface-container-high rounded-lg flex flex-col justify-between">
                <div className="flex items-center justify-between text-outline font-label-sm text-label-sm">
                  <span>TOTAL VALUE</span>
                  <span className="material-symbols-outlined text-[16px] text-primary">payments</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-headline-md text-headline-md text-on-surface font-semibold">
                    ₹{totalCommitment.toLocaleString()}
                  </span>
                  <span className="font-label-sm text-label-sm text-outline">INR</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low border border-surface-container-high rounded-lg overflow-hidden">
              <div className="hidden md:grid grid-cols-12 px-space-md py-2.5 bg-surface-container-lowest/60 text-outline font-label-sm text-label-sm uppercase tracking-wider border-b border-surface-container-high">
                <div className="col-span-4">Studio &amp; Location</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Time &amp; Duration</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1 text-right">Action</div>
              </div>

              <div className="divide-y divide-surface-container-high/60">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-space-md md:grid md:grid-cols-12 md:items-center gap-4 hover:bg-surface-container-high/30 transition-colors"
                  >
                    <div className="col-span-4 flex items-center gap-3 mb-3 md:mb-0">
                      <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary-fixed-dim shrink-0">
                        <span className="material-symbols-outlined text-[20px]">
                          {b.icon || "mic"}
                        </span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-body-md text-body-md font-semibold text-on-surface truncate">
                          {b.studio || b.studioName}
                        </span>
                        <div className="flex items-center gap-1 text-outline font-body-sm text-body-sm mt-0.5">
                          <span className="material-symbols-outlined text-[14px]">pin_drop</span>
                          <span className="truncate">{b.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2 flex flex-col mb-2 md:mb-0">
                      <span className="font-body-sm text-body-sm font-medium text-on-surface">
                        {b.date}
                      </span>
                      <span className="font-caption text-caption text-outline">
                        {b.day || "Scheduled"}
                      </span>
                    </div>

                    <div className="col-span-2 flex flex-col mb-2 md:mb-0">
                      <span className="font-body-sm text-body-sm text-on-surface font-mono">
                        {b.time}
                      </span>
                      <span className="font-caption text-caption text-outline">
                        {b.duration}
                      </span>
                    </div>

                    <div className="col-span-2 flex flex-col mb-3 md:mb-0">
                      <span className="font-body-md text-body-md font-semibold text-on-surface font-mono">
                        {b.amount}
                      </span>
                      <span className="font-caption text-caption text-outline">
                        {b.rate || "Standard rate"}
                      </span>
                    </div>

                    <div className="col-span-1 mb-3 md:mb-0">
                      {b.status === "CONFIRMED" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-tertiary-container/30 text-tertiary border border-tertiary-container/50 font-label-sm text-[11px] font-medium uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                          CONFIRMED
                        </span>
                      ) : b.status === "COMPLETED" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high text-outline border border-surface-container-highest font-label-sm text-[11px] uppercase tracking-wider">
                          COMPLETED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-error-container/20 text-error border border-error-container/40 font-label-sm text-[11px] uppercase tracking-wider">
                          {b.status}
                        </span>
                      )}
                    </div>

                    <div className="col-span-1 flex items-center md:justify-end">
                      {b.status === "CONFIRMED" || b.status === "PENDING" ? (
                        <button
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-primary-container/40 text-primary hover:bg-primary-container/10 hover:border-primary-container font-body-sm text-body-sm transition-colors cursor-pointer"
                          onClick={() => handleOpenCancelModal(b)}
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                          <span>Cancel</span>
                        </button>
                      ) : (
                        <span className="font-body-sm text-body-sm text-outline px-3 py-1.5">
                          {b.status === "CANCELLED" ? "Cancelled" : "Finished"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {modalOpen && targetBooking && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto my-auto bg-surface-container-lowest border border-surface-container-high rounded-xl shadow-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-error-container/20 border border-error-container/30 flex items-center justify-center text-error shrink-0">
                  <span className="material-symbols-outlined text-[22px]">warning</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                    Cancel booking?
                  </h3>
                  <span className="font-caption text-caption text-outline">
                    This reservation will be cancelled.
                  </span>
                </div>
              </div>

              {cancelError && (
                <div className="p-3 bg-error-container/20 border border-error-container/40 rounded-lg text-error text-body-sm mb-4">
                  {cancelError}
                </div>
              )}

              <div className="p-3.5 bg-surface-container-low border border-surface-container-high rounded-lg mb-6 flex flex-col gap-1">
                <span className="font-body-sm text-body-sm font-medium text-on-surface">
                  {targetBooking.studio || targetBooking.studioName}
                </span>
                <span className="font-caption text-caption text-outline">
                  {targetBooking.date} • {targetBooking.time}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  className="px-4 h-[38px] rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm font-medium transition-colors cursor-pointer"
                  onClick={handleCloseCancelModal}
                  type="button"
                >
                  Keep booking
                </button>
                <button
                  className="inline-flex items-center gap-1.5 px-4 h-[38px] rounded-lg bg-primary-container hover:bg-secondary-container text-on-primary-container font-body-sm text-body-sm font-medium transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                  disabled={isCancelling}
                  onClick={handleConfirmCancel}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                  <span>{isCancelling ? "Cancelling..." : "Confirm cancellation"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default CreatorBookings;
