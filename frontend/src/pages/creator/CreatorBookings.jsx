import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";

function CreatorBookings() {
  const [activeState, setActiveState] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [targetBooking, setTargetBooking] = useState({
    id: "BKG-2026-DEL-094",
    studio: "Echo Room Studio",
    schedule: "Oct 12, 2026 at 10:00 AM",
  });
  const [bookings, setBookings] = useState([
    {
      id: "BKG-2026-DEL-094",
      studio: "Echo Room Studio",
      location: "Delhi • 4 mics / 2 cameras",
      date: "Oct 12, 2026",
      day: "Monday",
      time: "10:00 AM - 12:00 PM",
      duration: "2.0 Hours Allocated",
      amount: "₹3,000",
      rateText: "₹1,500/hr rack rate",
      status: "CONFIRMED",
      icon: "mic",
    },
    {
      id: "BKG-2026-BLR-041",
      studio: "Sonic Loft Studio A",
      location: "Bengaluru • Blackmagic 6K Pro",
      date: "Sep 28, 2026",
      day: "Wednesday",
      time: "14:00 - 16:30",
      duration: "2.5 Hours Mastered",
      amount: "₹4,500",
      rateText: "Settled in Full",
      status: "COMPLETED",
      icon: "videocam",
    },
  ]);

  const handleOpenCancelModal = (studio, schedule, id) => {
    setTargetBooking({ studio, schedule, id });
    setModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    setModalOpen(false);
  };

  const handleConfirmCancel = () => {
    setBookings((prev) => prev.filter((b) => b.id !== targetBooking.id));
    setModalOpen(false);
    if (bookings.length <= 1) {
      setActiveState("empty");
    }
  };

  return (
    <DashboardLayout activePath="/creator/bookings">
      <div className="flex flex-col w-full pb-16">
        <div className="flex flex-wrap items-center justify-between gap-space-md py-4 border-b border-surface-container-high mb-8">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
              SESSION ROUTE: /CREATOR/BOOKINGS
            </span>
            <span className="text-surface-variant font-label-sm text-label-sm">|</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              ENDPOINT: GET /api/v1/bookings
            </span>
          </div>

          <div
            className="flex items-center gap-1 p-1 bg-surface-container-lowest rounded-lg border border-surface-container-high"
            role="tablist"
          >
            <button
              className={`px-3 py-1.5 rounded-md font-label-sm text-label-sm uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                activeState === "all"
                  ? "bg-surface-container border border-surface-container-highest text-on-surface"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
              id="tab-all"
              onClick={() => setActiveState("all")}
              type="button"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
              <span>All Bookings ({bookings.length})</span>
            </button>
            <button
              className={`px-3 py-1.5 rounded-md font-label-sm text-label-sm uppercase tracking-wider transition-colors ${
                activeState === "empty"
                  ? "bg-surface-container border border-surface-container-highest text-on-surface"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
              id="tab-empty"
              onClick={() => setActiveState("empty")}
              type="button"
            >
              <span>Empty State</span>
            </button>
            <button
              className={`px-3 py-1.5 rounded-md font-label-sm text-label-sm uppercase tracking-wider transition-colors ${
                activeState === "loading"
                  ? "bg-surface-container border border-surface-container-highest text-on-surface"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
              id="tab-loading"
              onClick={() => setActiveState("loading")}
              type="button"
            >
              <span>Skeleton View</span>
            </button>
            <button
              className={`px-3 py-1.5 rounded-md font-label-sm text-label-sm uppercase tracking-wider transition-colors ${
                activeState === "error"
                  ? "bg-surface-container border border-surface-container-highest text-on-surface"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
              id="tab-error"
              onClick={() => setActiveState("error")}
              type="button"
            >
              <span>Error State</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-lg mb-8">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest font-semibold">
                SCHEDULE MATRIX
              </span>
              <span className="text-surface-variant font-label-sm text-label-sm">/</span>
              <span className="font-label-sm text-label-sm text-outline">UNIT ID: CR-8941</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">
              My Bookings
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              View and manage your studio bookings.
            </p>
          </div>
          <div className="flex items-center gap-space-sm shrink-0">
            <Link
              className="inline-flex items-center justify-center gap-2 px-space-md h-[42px] bg-primary-container hover:bg-inverse-primary text-on-primary font-body-sm text-body-sm font-medium rounded-lg border border-primary-container shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary"
              to="/creator/studios"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              <span>Browse Studios</span>
            </Link>
          </div>
        </div>

        {activeState === "all" && (
          <div className="flex flex-col space-y-6" id="state-all">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-space-md bg-surface-container-low border border-surface-container-high rounded-lg flex flex-col justify-between">
                <div className="flex items-center justify-between text-outline font-label-sm text-label-sm">
                  <span>ALLOCATED SESSIONS</span>
                  <span className="material-symbols-outlined text-[16px]">equalizer</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-headline-md text-headline-md text-on-surface font-semibold">
                    0{bookings.length}
                  </span>
                  <span className="font-label-sm text-label-sm text-outline">TOTAL RUNS</span>
                </div>
                <div className="mt-2 text-surface-variant text-[11px] font-label-sm">
                  CALIBRATED AGAINST UTC+05:30
                </div>
              </div>

              <div className="p-space-md bg-surface-container-low border border-surface-container-high rounded-lg flex flex-col justify-between">
                <div className="flex items-center justify-between text-outline font-label-sm text-label-sm">
                  <span>ACTIVE PIPELINE</span>
                  <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-headline-md text-headline-md text-tertiary font-semibold">
                    0{bookings.filter((b) => b.status === "CONFIRMED").length}
                  </span>
                  <span className="font-label-sm text-label-sm text-tertiary">CONFIRMED</span>
                </div>
                <div className="mt-2 text-surface-variant text-[11px] font-label-sm">NEXT: OCT 12, 2026</div>
              </div>

              <div className="p-space-md bg-surface-container-low border border-surface-container-high rounded-lg flex flex-col justify-between">
                <div className="flex items-center justify-between text-outline font-label-sm text-label-sm">
                  <span>ARCHIVED RUNS</span>
                  <span className="material-symbols-outlined text-[16px] text-outline">inventory_2</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-headline-md text-headline-md text-on-surface font-semibold">
                    0{bookings.filter((b) => b.status === "COMPLETED").length}
                  </span>
                  <span className="font-label-sm text-label-sm text-outline">COMPLETED</span>
                </div>
                <div className="mt-2 text-surface-variant text-[11px] font-label-sm">LAST: SEP 28, 2026</div>
              </div>

              <div className="p-space-md bg-surface-container-low border border-surface-container-high rounded-lg flex flex-col justify-between">
                <div className="flex items-center justify-between text-outline font-label-sm text-label-sm">
                  <span>COMMITMENT VALUE</span>
                  <span className="material-symbols-outlined text-[16px] text-primary">payments</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-headline-md text-headline-md text-on-surface font-semibold">₹7,500</span>
                  <span className="font-label-sm text-label-sm text-outline">GROSS</span>
                </div>
                <div className="mt-2 text-surface-variant text-[11px] font-label-sm">
                  INR DIRECT SETTLEMENT
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low border border-surface-container-high rounded-lg overflow-hidden">
              <div className="px-space-md py-3 bg-surface-container-lowest border-b border-surface-container-high flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                    BOOKING MATRIX
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-surface-container text-outline border border-surface-container-high font-label-sm text-[10px]">
                    VERIFIED RECORDS
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface border border-surface-container-high text-on-surface-variant text-label-sm font-label-sm">
                    <span className="material-symbols-outlined text-[14px]">tune</span>
                    <span>FILTER: RECENT FIRST</span>
                  </div>
                </div>
              </div>

              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[760px]">
                  <thead>
                    <tr className="border-b border-surface-container-high bg-surface-container/60 font-label-sm text-label-sm text-outline uppercase tracking-wider">
                      <th className="py-3 px-space-md font-medium">STUDIO &amp; LOCATION</th>
                      <th className="py-3 px-space-md font-medium">DATE</th>
                      <th className="py-3 px-space-md font-medium">TIME &amp; DURATION</th>
                      <th className="py-3 px-space-md font-medium">AMOUNT</th>
                      <th className="py-3 px-space-md font-medium">STATUS</th>
                      <th className="py-3 px-space-md font-medium text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high font-body-sm text-body-sm">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-surface-container/30 transition-colors group">
                        <td className="py-4 px-space-md">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-surface-container-high border border-surface-container-highest shrink-0 flex items-center justify-center text-primary">
                              <span className="material-symbols-outlined text-[20px]">{b.icon}</span>
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-body-md text-body-md font-semibold text-on-surface group-hover:text-primary transition-colors">
                                {b.studio}
                              </span>
                              <span className="font-caption text-caption text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                                <span className="material-symbols-outlined text-[14px] text-outline">
                                  location_on
                                </span>
                                {b.location}
                              </span>
                              <span className="font-label-sm text-[10px] text-outline mt-1">
                                ID: {b.id}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-space-md whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-body-sm text-body-sm text-on-surface font-medium">
                              {b.date}
                            </span>
                            <span className="font-label-sm text-label-sm text-outline">{b.day}</span>
                          </div>
                        </td>
                        <td className="py-4 px-space-md whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-body-sm text-body-sm text-on-surface">{b.time}</span>
                            <span className="font-label-sm text-label-sm text-outline">{b.duration}</span>
                          </div>
                        </td>
                        <td className="py-4 px-space-md whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-body-md text-body-md font-semibold text-on-surface">
                              {b.amount}
                            </span>
                            <span className="font-label-sm text-label-sm text-outline">{b.rateText}</span>
                          </div>
                        </td>
                        <td className="py-4 px-space-md whitespace-nowrap">
                          {b.status === "CONFIRMED" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#22c55e]/10 border border-[#22c55e]/40 text-[#22c55e] font-label-sm text-label-sm tracking-wide">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse"></span>
                              CONFIRMED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-surface-container-highest/50 border border-outline-variant text-on-surface-variant font-label-sm text-label-sm tracking-wide">
                              <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                              COMPLETED
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-space-md whitespace-nowrap text-right">
                          {b.status === "CONFIRMED" ? (
                            <button
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-container text-primary hover:bg-primary-container hover:text-on-primary transition-all font-body-sm text-body-sm font-medium"
                              onClick={() =>
                                handleOpenCancelModal(b.studio, `${b.date} at ${b.time.split(" - ")[0]}`, b.id)
                              }
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
                              <span>Cancel booking</span>
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-body-sm text-body-sm text-outline cursor-not-allowed select-none px-3 py-1.5">
                              <span className="material-symbols-outlined text-[16px]">check</span>
                              Completed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-space-md py-3 bg-surface-container-lowest border-t border-surface-container-high flex flex-wrap items-center justify-between text-outline font-label-sm text-label-sm">
                <div className="flex items-center gap-4">
                  <span>SHOWING {bookings.length} OF {bookings.length} RECORDS</span>
                  <span className="text-surface-variant">•</span>
                  <span>PATCH ENGINE: ACTIVE</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>CANCELLATION POLICY: FREE UP TO 24H PRIOR</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeState === "empty" && (
          <div
            className="flex flex-col items-center justify-center p-12 bg-surface-container-low border border-surface-container-high rounded-lg text-center my-6"
            id="state-empty"
          >
            <div className="w-16 h-16 rounded-xl bg-surface-container border border-surface-container-highest flex items-center justify-center text-outline mb-4">
              <svg className="w-8 h-8 text-outline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                ></path>
                <path d="M3 3l18 18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
              </svg>
            </div>
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-1">
              ZERO BOOKING RUNS
            </span>
            <h3 className="font-headline-md text-headline-md text-on-surface font-semibold mb-2">
              No bookings yet
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md mb-6">
              You haven&apos;t booked a studio yet. Browse available studios to find a space for your next
              recording.
            </p>
            <Link
              className="inline-flex items-center gap-2 px-6 h-[42px] bg-primary-container hover:bg-inverse-primary text-on-primary font-body-sm text-body-sm font-medium rounded-lg border border-primary-container transition-all"
              to="/creator/studios"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              <span>Browse Studios</span>
            </Link>
          </div>
        )}

        {activeState === "loading" && (
          <div className="flex flex-col space-y-4 my-6" id="state-loading">
            <div className="h-10 bg-surface-container-low border border-surface-container-high rounded-lg animate-pulse"></div>
            <div className="bg-surface-container-low border border-surface-container-high rounded-lg p-space-md space-y-4">
              <div className="h-6 bg-surface-container rounded w-1/4 animate-pulse"></div>
              <div className="space-y-3">
                <div className="h-14 bg-surface-container-high/40 rounded-lg animate-pulse"></div>
                <div className="h-14 bg-surface-container-high/40 rounded-lg animate-pulse"></div>
                <div className="h-14 bg-surface-container-high/40 rounded-lg animate-pulse"></div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <div className="h-4 bg-surface-container rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-surface-container rounded w-24 animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {activeState === "error" && (
          <div
            className="flex flex-col items-center justify-center p-12 bg-surface-container-low border border-error-container/40 rounded-lg text-center my-6"
            id="state-error"
          >
            <div className="w-16 h-16 rounded-xl bg-error-container/20 border border-error-container text-error flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px]">sync_problem</span>
            </div>
            <span className="font-label-sm text-label-sm text-error uppercase tracking-wider mb-1">
              DATA PIPELINE FAULT 503
            </span>
            <h3 className="font-headline-md text-headline-md text-on-surface font-semibold mb-2">
              Unable to load studio bookings
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md mb-6">
              Connection to <code className="text-primary font-label-sm">/api/v1/bookings</code> timed out.
              The local rack console could not synchronize with telemetry streams.
            </p>
            <div className="flex items-center gap-3">
              <button
                className="inline-flex items-center gap-2 px-4 h-[38px] bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm rounded-lg border border-surface-container-highest transition-colors"
                onClick={() => setActiveState("all")}
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                <span>Retry Connection</span>
              </button>
              <Link
                className="inline-flex items-center gap-2 px-4 h-[38px] bg-primary-container text-on-primary font-body-sm text-body-sm rounded-lg border border-primary-container transition-colors"
                to="/creator/studios"
              >
                <span>Browse Offline Racks</span>
              </Link>
            </div>
          </div>
        )}

        {modalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            id="cancel-modal"
          >
            <div className="relative w-full max-w-md bg-[#111111] border border-[#272727] rounded-lg shadow-2xl overflow-hidden">
              <div className="h-1.5 w-full bg-primary-container"></div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-container/10 border border-primary-container/30 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-[22px]">warning</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                      Cancel booking?
                    </h3>
                    <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider">
                      PATCH /api/v1/bookings/:id/cancel
                    </span>
                  </div>
                </div>

                <p className="font-body-md text-body-md text-on-surface-variant mb-4">
                  Are you sure you want to cancel this booking? This action cannot be undone.
                </p>

                <div className="p-3.5 bg-[#171717] border border-[#272727] rounded-lg mb-6 flex flex-col gap-1">
                  <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider">
                    RECORD TARGET
                  </span>
                  <div className="font-body-sm text-body-sm font-medium text-on-surface" id="modal-booking-details">
                    {targetBooking.studio} - {targetBooking.schedule}
                  </div>
                  <span className="font-caption text-caption text-on-surface-variant mt-0.5">
                    Refund policy applies: 100% credit will return to your creator balance.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    className="px-4 h-[38px] rounded-lg bg-[#171717] hover:bg-surface-container border border-[#272727] hover:border-outline-variant text-on-surface font-body-sm text-body-sm font-medium transition-colors"
                    onClick={handleCloseCancelModal}
                    type="button"
                  >
                    Keep booking
                  </button>
                  <button
                    className="inline-flex items-center gap-1.5 px-4 h-[38px] rounded-lg bg-primary-container hover:bg-inverse-primary border border-primary-container text-on-primary font-body-sm text-body-sm font-medium transition-colors shadow-sm"
                    onClick={handleConfirmCancel}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                    <span>Cancel booking</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default CreatorBookings;
