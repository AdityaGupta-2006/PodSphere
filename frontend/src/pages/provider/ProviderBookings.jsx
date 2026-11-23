import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import * as bookingApi from "../../services/bookingApi";
import * as studioApi from "../../services/studioApi";
import { useAuth } from "../../hooks/useAuth";

function ProviderBookings() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [studioFilter, setStudioFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [bookings, setBookings] = useState([]);
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);
  const [actionError, setActionError] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const loadData = () => {
    setLoading(true);
    setError("");
    const studioFilterParam = user?.id ? { providerId: user.id } : {};

    Promise.all([studioApi.getStudios(studioFilterParam), bookingApi.getProviderBookings()])
      .then(([sData, bData]) => {
        const myStudios = sData || [];
        setStudios(myStudios);

        // In API mode, bData is already scoped to provider's studios.
        // In demo mode or fallback, also filter by owned studios.
        const myStudioIds = new Set(myStudios.map((s) => String(s.id)));
        const myBookings = (bData || []).filter((b) =>
          myStudios.length === 0 || myStudioIds.has(String(b.studioId))
        );
        setBookings(bData && bData.length > 0 ? bData : myBookings);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load incoming provider bookings.");
        setBookings([]);
        setStudios([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    let active = true;
    const studioFilterParam = user?.id ? { providerId: user.id } : {};

    Promise.all([studioApi.getStudios(studioFilterParam), bookingApi.getProviderBookings()])
      .then(([sData, bData]) => {
        if (active) {
          const myStudios = sData || [];
          setStudios(myStudios);

          const myStudioIds = new Set(myStudios.map((s) => String(s.id)));
          const myBookings = (bData || []).filter((b) =>
            myStudios.length === 0 || myStudioIds.has(String(b.studioId))
          );
          setBookings(bData && bData.length > 0 ? bData : myBookings);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || "Failed to load incoming provider bookings.");
          setBookings([]);
          setStudios([]);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [user]);

  const clearFilters = () => {
    setStatusFilter("ALL");
    setStudioFilter("ALL");
    setDateFilter("");
    setPage(1);
  };

  const handleConfirmRequest = async (id) => {
    setActionError("");
    try {
      await bookingApi.updateBookingStatus(id, "CONFIRMED");
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "CONFIRMED" } : b))
      );
      if (selectedBookingDetails && selectedBookingDetails.id === id) {
        setSelectedBookingDetails((prev) => ({ ...prev, status: "CONFIRMED" }));
      }
    } catch (err) {
      setActionError(err.message || "Failed to confirm booking.");
    }
  };

  const handleRejectRequest = async (id) => {
    setActionError("");
    try {
      await bookingApi.updateBookingStatus(id, "REJECTED");
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "REJECTED" } : b))
      );
      if (selectedBookingDetails && selectedBookingDetails.id === id) {
        setSelectedBookingDetails((prev) => ({ ...prev, status: "REJECTED" }));
      }
    } catch (err) {
      setActionError(err.message || "Failed to reject booking.");
    }
  };

  const handleCompleteBooking = async (id) => {
    setActionError("");
    try {
      await bookingApi.updateBookingStatus(id, "COMPLETED");
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "COMPLETED" } : b))
      );
      if (selectedBookingDetails && selectedBookingDetails.id === id) {
        setSelectedBookingDetails((prev) => ({ ...prev, status: "COMPLETED" }));
      }
    } catch (err) {
      setActionError(err.message || "Failed to mark booking as completed.");
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === "ALL" || b.status.toUpperCase() === statusFilter.toUpperCase();
    const matchesStudio =
      studioFilter === "ALL" ||
      String(b.studioId) === String(studioFilter) ||
      (b.studio && b.studio.toLowerCase().includes(studioFilter.toLowerCase())) ||
      (b.studioName && b.studioName.toLowerCase().includes(studioFilter.toLowerCase()));

    const matchesDate =
      !dateFilter ||
      (b.rawDate && b.rawDate.includes(dateFilter)) ||
      (b.date && b.date.toLowerCase().includes(dateFilter.toLowerCase()));

    return matchesStatus && matchesStudio && matchesDate;
  });

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / pageSize));
  const paginatedBookings = filteredBookings.slice((page - 1) * pageSize, page * pageSize);

  const upcomingCount = bookings.filter((b) => b.status === "CONFIRMED" || b.status === "PENDING").length;
  const completedCount = bookings.filter((b) => b.status === "COMPLETED").length;

  return (
    <DashboardLayout activePath="/provider/bookings">
      <div className="flex flex-col w-full pb-16">
        <div className="w-full bg-surface-container-low rounded-lg p-space-lg mb-space-lg flex flex-col md:flex-row md:items-end justify-between gap-space-md shadow-sm">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-label-sm text-[10px] px-2 py-0.5 rounded bg-tertiary/20 text-tertiary font-mono uppercase tracking-wider">
                PROVIDER CONSOLE
              </span>
              <span className="text-outline text-xs">• Incoming Bookings</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg font-semibold text-on-surface tracking-tight leading-none mb-1">
              Studio Bookings
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Review incoming reservations from creators, confirm scheduled session hours, and monitor completed runs.
            </p>
          </div>

          <div className="flex items-stretch gap-space-md">
            <div className="bg-surface-container rounded-lg px-space-md py-space-sm flex flex-col min-w-[150px]">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">UPCOMING</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-md text-headline-md font-semibold text-on-surface font-mono">
                  {upcomingCount}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Sessions</span>
              </div>
            </div>

            <div className="bg-surface-container rounded-lg px-space-md py-space-sm flex flex-col min-w-[150px]">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">COMPLETED</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-md text-headline-md font-semibold text-on-surface font-mono">
                  {completedCount}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Archived</span>
              </div>
            </div>
          </div>
        </div>

        {actionError && (
          <div className="flex items-center justify-between p-space-sm bg-error-container/20 rounded-lg text-error border border-error-container/40 mb-space-md">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-body-lg">error</span>
              <span className="font-label-md text-label-md">{actionError}</span>
            </div>
            <button
              className="text-error hover:opacity-80 cursor-pointer"
              onClick={() => setActionError("")}
              type="button"
            >
              <span className="material-symbols-outlined text-body-md">close</span>
            </button>
          </div>
        )}

        <div className="w-full bg-surface-container-lowest rounded-lg p-space-md mb-space-lg flex flex-col md:flex-row gap-space-md items-end justify-between border border-surface-container-high">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md w-full md:w-auto flex-1">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                Status
              </label>
              <div className="relative">
                <select
                  className="w-full bg-surface-container border border-surface-container-high rounded-lg px-space-md py-2 text-on-surface font-body-sm text-body-sm focus:outline-none focus:border-primary appearance-none cursor-pointer pr-8"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PENDING">Pending Review</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <span className="material-symbols-outlined text-outline text-[18px] absolute right-2.5 top-2.5 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                Studio
              </label>
              <div className="relative">
                <select
                  className="w-full bg-surface-container border border-surface-container-high rounded-lg px-space-md py-2 text-on-surface font-body-sm text-body-sm focus:outline-none focus:border-primary appearance-none cursor-pointer pr-8"
                  value={studioFilter}
                  onChange={(e) => {
                    setStudioFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="ALL">All Studios</option>
                  {studios.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.city})
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined text-outline text-[18px] absolute right-2.5 top-2.5 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                Date
              </label>
              <div className="relative">
                <span className="material-symbols-outlined text-outline text-[18px] absolute left-3 top-2.5 pointer-events-none">
                  calendar_today
                </span>
                <input
                  className="w-full bg-surface-container border border-surface-container-high rounded-lg pl-9 pr-space-md py-2 text-on-surface font-body-sm text-body-sm placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
                  placeholder="Filter by date..."
                  type="text"
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>
          </div>

          <button
            className="flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface font-body-sm text-body-sm transition-colors cursor-pointer shrink-0 border border-surface-container-high"
            onClick={clearFilters}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">backspace</span>
            <span>Clear Filters</span>
          </button>
        </div>

        {loading ? (
          <div className="w-full bg-surface-container-low rounded-lg p-space-md shadow-sm animate-pulse">
            <div className="h-10 bg-surface-container-high rounded mb-4 w-full"></div>
            <div className="space-y-3">
              <div className="h-12 bg-surface-container rounded"></div>
              <div className="h-12 bg-surface-container rounded"></div>
              <div className="h-12 bg-surface-container rounded"></div>
            </div>
          </div>
        ) : error ? (
          <div className="w-full bg-surface-container-low rounded-lg p-space-xl flex flex-col items-center justify-center text-center shadow-sm border border-error-container/40">
            <div className="w-16 h-16 rounded-full bg-error-container/20 border border-error-container/30 flex items-center justify-center mb-space-md text-error">
              <span className="material-symbols-outlined text-[32px]">sync_problem</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-1">
              Failed to load bookings
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mb-space-lg">
              {error}
            </p>
            <button
              className="inline-flex items-center gap-2 px-space-md h-9 bg-surface-container hover:bg-surface-container-high text-on-surface border border-surface-container-high rounded-lg font-body-sm text-body-sm font-medium transition-colors cursor-pointer"
              onClick={loadData}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>Retry</span>
            </button>
          </div>
        ) : studios.length === 0 ? (
          <div className="w-full bg-surface-container-low rounded-lg p-space-xl flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center mb-space-md text-outline">
              <span className="material-symbols-outlined text-[32px]">meeting_room</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-1">
              No studios created yet
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mb-space-lg">
              Create your first studio to start receiving bookings from creators.
            </p>
            <Link
              className="h-9 px-space-lg rounded-lg bg-primary-container text-on-primary-container hover:bg-secondary-container font-body-sm text-body-sm font-medium transition-colors flex items-center gap-2"
              to="/provider/studios/new"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Create Studio</span>
            </Link>
          </div>
        ) : paginatedBookings.length === 0 ? (
          <div className="w-full bg-surface-container-low rounded-lg p-space-xl flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center mb-space-md text-outline">
              <span className="material-symbols-outlined text-[32px]">calendar_today</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-1">
              No bookings found
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mb-space-lg">
              {bookings.length === 0
                ? "Incoming reservations from creators will appear here."
                : "No bookings match the active filter criteria."}
            </p>
            {bookings.length > 0 && (
              <button
                className="px-space-md py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm cursor-pointer"
                onClick={clearFilters}
                type="button"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="w-full bg-surface-container-low rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[680px]">
                <thead>
                  <tr className="border-b border-surface-container-high bg-surface-container-lowest/50 text-outline font-label-sm text-label-sm uppercase tracking-wider">
                    <th className="py-space-md px-space-md font-medium">Studio</th>
                    <th className="py-space-md px-space-md font-medium">Creator</th>
                    <th className="py-space-md px-space-md font-medium">Date</th>
                    <th className="py-space-md px-space-md font-medium">Time &amp; Duration</th>
                    <th className="py-space-md px-space-md font-medium">Amount</th>
                    <th className="py-space-md px-space-md font-medium">Status</th>
                    <th className="py-space-md px-space-md font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high/40 text-body-sm">
                  {paginatedBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-surface-container-high/20 transition-colors">
                      <td className="py-space-md px-space-md">
                        <div className="flex items-center gap-space-sm">
                          <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-outline shrink-0">
                            <span className="material-symbols-outlined text-[18px]">
                              {b.icon || "mic"}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-body-sm text-body-sm font-medium text-on-surface">
                              {b.studio || b.studioName}
                            </span>
                            <span className="font-caption text-caption text-outline">
                              {b.location || b.city}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-space-md px-space-md">
                        <div className="flex flex-col">
                          <span className="font-body-sm text-body-sm text-on-surface">
                            {b.creatorName}
                          </span>
                          <span className="font-caption text-caption text-outline">
                            {b.creatorEmail}
                          </span>
                        </div>
                      </td>
                      <td className="py-space-md px-space-md">
                        <div className="flex items-center gap-1.5 text-on-surface font-body-sm text-body-sm">
                          <span className="material-symbols-outlined text-[14px] text-outline">
                            calendar_today
                          </span>
                          <span>{b.date}</span>
                        </div>
                      </td>
                      <td className="py-space-md px-space-md font-mono text-[13px] text-on-surface-variant">
                        <div>{b.time}</div>
                        <div className="font-caption text-caption text-outline">{b.duration}</div>
                      </td>
                      <td className="py-space-md px-space-md font-mono text-body-sm text-on-surface">
                        <div className="font-semibold">{b.amount}</div>
                      </td>
                      <td className="py-space-md px-space-md">
                        {b.status === "CONFIRMED" ? (
                          <span className="inline-flex items-center gap-1.5 text-tertiary font-label-sm text-label-sm uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                            CONFIRMED
                          </span>
                        ) : b.status === "PENDING" ? (
                          <span className="inline-flex items-center gap-1.5 text-primary-container font-label-sm text-label-sm uppercase tracking-wider">
                            PENDING
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-outline font-label-sm text-label-sm uppercase tracking-wider">
                            {b.status}
                          </span>
                        )}
                      </td>
                      <td className="py-space-md px-space-md text-right">
                        {b.status === "PENDING" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-primary-container hover:bg-secondary-container text-on-primary-container font-body-sm text-body-sm font-medium transition-colors cursor-pointer"
                              onClick={() => handleConfirmRequest(b.id)}
                              type="button"
                            >
                              <span>Confirm</span>
                              <span className="material-symbols-outlined text-[14px]">check</span>
                            </button>
                            <button
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-error-container/20 hover:bg-error-container/30 text-error font-body-sm text-body-sm font-medium transition-colors cursor-pointer"
                              onClick={() => handleRejectRequest(b.id)}
                              type="button"
                            >
                              <span>Reject</span>
                              <span className="material-symbols-outlined text-[14px]">close</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            className="inline-flex items-center gap-1 text-on-surface-variant hover:text-on-surface font-body-sm text-body-sm transition-colors cursor-pointer"
                            onClick={() => setSelectedBookingDetails(b)}
                            type="button"
                          >
                            <span>View details</span>
                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-space-md bg-surface-container-lowest/30 border-t border-surface-container-high flex flex-col sm:flex-row items-center justify-between gap-space-md">
              <span className="font-label-sm text-label-sm text-outline">
                Showing {paginatedBookings.length} of {filteredBookings.length} bookings
              </span>

              <div className="flex items-center gap-space-sm font-label-sm text-label-sm">
                <button
                  className="px-space-sm py-1 rounded bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  type="button"
                >
                  Prev
                </button>
                <span className="text-on-surface-variant font-mono">
                  {page} / {totalPages}
                </span>
                <button
                  className="px-space-sm py-1 rounded bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  type="button"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedBookingDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-container-lowest/80 backdrop-blur-sm overflow-y-auto">
            <div className="flex flex-col w-full max-w-lg max-h-[90vh] overflow-y-auto my-auto rounded-xl bg-surface-container-low p-space-lg shadow-2xl border border-surface-container-high">
              <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high mb-space-md">
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                    Session Details
                  </h3>
                  <span className="font-label-sm text-[10px] text-outline font-mono">
                    ID: {selectedBookingDetails.id}
                  </span>
                </div>
                <button
                  className="text-outline hover:text-on-surface cursor-pointer"
                  onClick={() => setSelectedBookingDetails(null)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="flex flex-col gap-3 font-body-sm">
                <div className="p-3 bg-surface-container rounded-lg border border-surface-container-high flex justify-between items-center">
                  <span className="text-outline font-label-sm uppercase">Studio</span>
                  <span className="text-on-surface font-semibold">{selectedBookingDetails.studio || selectedBookingDetails.studioName}</span>
                </div>
                <div className="p-3 bg-surface-container rounded-lg border border-surface-container-high flex justify-between items-center">
                  <span className="text-outline font-label-sm uppercase">Creator</span>
                  <span className="text-on-surface">{selectedBookingDetails.creatorName} ({selectedBookingDetails.creatorEmail})</span>
                </div>
                <div className="p-3 bg-surface-container rounded-lg border border-surface-container-high flex justify-between items-center">
                  <span className="text-outline font-label-sm uppercase">Schedule</span>
                  <span className="text-on-surface font-mono">{selectedBookingDetails.date} • {selectedBookingDetails.time}</span>
                </div>
                <div className="p-3 bg-surface-container rounded-lg border border-surface-container-high flex justify-between items-center">
                  <span className="text-outline font-label-sm uppercase">Total Amount</span>
                  <span className="text-tertiary font-mono font-bold text-base">{selectedBookingDetails.amount}</span>
                </div>
                <div className="p-3 bg-surface-container rounded-lg border border-surface-container-high flex justify-between items-center">
                  <span className="text-outline font-label-sm uppercase">Status</span>
                  <span className="font-mono text-tertiary uppercase">{selectedBookingDetails.status}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-space-md mt-space-md border-t border-surface-container-high">
                <button
                  className="px-space-md py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm cursor-pointer"
                  onClick={() => setSelectedBookingDetails(null)}
                  type="button"
                >
                  Close
                </button>
                {selectedBookingDetails.status === "PENDING" && (
                  <>
                    <button
                      className="px-space-md py-1.5 rounded-lg bg-error-container/20 hover:bg-error-container/30 text-error font-body-sm font-medium transition-colors cursor-pointer"
                      onClick={() => handleRejectRequest(selectedBookingDetails.id)}
                      type="button"
                    >
                      Reject Request
                    </button>
                    <button
                      className="px-space-md py-1.5 rounded-lg bg-primary-container hover:bg-secondary-container text-on-primary-container font-body-sm font-medium transition-colors cursor-pointer"
                      onClick={() => handleConfirmRequest(selectedBookingDetails.id)}
                      type="button"
                    >
                      Confirm Booking
                    </button>
                  </>
                )}
                {selectedBookingDetails.status === "CONFIRMED" && (
                  <button
                    className="px-space-md py-1.5 rounded-lg bg-tertiary/20 hover:bg-tertiary/30 text-tertiary font-body-sm font-medium transition-colors cursor-pointer"
                    onClick={() => handleCompleteBooking(selectedBookingDetails.id)}
                    type="button"
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ProviderBookings;
