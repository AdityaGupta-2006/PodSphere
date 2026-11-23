import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import * as studioApi from "../../services/studioApi";
import * as bookingApi from "../../services/bookingApi";
import { useAuth } from "../../hooks/useAuth";

function ProviderDashboard() {
  const { user, switchWorkspace } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [studios, setStudios] = useState([]);
  const [bookings, setBookings] = useState([]);

  const loadData = async () => {
    setError("");
    try {
      const filter = user?.id ? { providerId: user.id } : {};
      const [studioList, allBookingList] = await Promise.all([
        studioApi.getStudios(filter),
        bookingApi.getBookings({ role: "provider" }),
      ]);
      const myStudios = studioList || [];
      const myStudioIds = new Set(myStudios.map((s) => String(s.id)));
      const myBookings = (allBookingList || []).filter((b) => myStudioIds.has(String(b.studioId)));
      setStudios(myStudios);
      setBookings(myBookings);
      setLoading(false);
    } catch (err) {
      setError(err?.message || "Unable to load provider dashboard data.");
      setStudios([]);
      setBookings([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const filter = user?.id ? { providerId: user.id } : {};
    Promise.all([studioApi.getStudios(filter), bookingApi.getBookings({ role: "provider" })])
      .then(([studioList, allBookingList]) => {
        if (active) {
          const myStudios = studioList || [];
          const myStudioIds = new Set(myStudios.map((s) => String(s.id)));
          const myBookings = (allBookingList || []).filter((b) => myStudioIds.has(String(b.studioId)));
          setStudios(myStudios);
          setBookings(myBookings);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err?.message || "Unable to load provider dashboard data.");
          setStudios([]);
          setBookings([]);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [user]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const upcomingBookings = bookings.filter(
    (b) => b.status === "CONFIRMED" || b.status === "PENDING"
  );
  const completedBookings = bookings.filter((b) => b.status === "COMPLETED");

  const displayStudios = studios.slice(0, 2);
  const displayBookings = upcomingBookings.slice(0, 3);

  return (
    <DashboardLayout activePath="/provider/dashboard">
      <div className="flex flex-col w-full pb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pt-space-md pb-space-lg border-b border-surface-container-high mb-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-[10px] px-2 py-0.5 rounded bg-tertiary/20 text-tertiary font-mono uppercase tracking-wider">
                PROVIDER CONSOLE
              </span>
              <span className="text-outline text-xs">• Facility &amp; Host Tools</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface mt-1">
              Provider Dashboard
            </h1>
            <p className="font-body-md text-body-md text-outline">
              Manage your recording studio spaces, set hourly rates, and review incoming creator reservations.
            </p>
          </div>

          <div className="flex items-center gap-space-sm self-start md:self-auto shrink-0 flex-wrap">
            <button
              className="h-9 px-space-md rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-body-sm font-medium transition-colors flex items-center gap-2 cursor-pointer border border-surface-container-high"
              onClick={handleRefresh}
              type="button"
            >
              <span
                className={`material-symbols-outlined text-[16px] text-outline ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              >
                sync
              </span>
              <span className="font-body-sm text-body-sm">
                {isRefreshing ? "Syncing..." : "Refresh"}
              </span>
            </button>
            <Link
              className="h-9 px-space-md rounded-lg bg-primary-container hover:bg-secondary-container text-on-primary-container text-body-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
              to="/provider/studios/new"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span className="font-body-sm text-body-sm">Add Studio</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="flex items-center justify-between p-space-md bg-error-container/20 rounded-xl text-error border border-error-container/40 mb-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-body-lg">error</span>
              <span className="font-body-sm text-body-sm">{error}</span>
            </div>
            <button
              className="px-3 py-1 bg-surface-container hover:bg-surface-container-high text-on-surface text-body-sm rounded-lg transition-colors cursor-pointer"
              onClick={loadData}
              type="button"
            >
              Retry
            </button>
          </div>
        )}

        <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container-high flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md mb-space-lg">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-tertiary/20 text-tertiary flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[20px]">storefront</span>
            </div>
            <div>
              <h3 className="font-body-sm font-semibold text-on-surface">What you can do in Provider Console:</h3>
              <p className="font-caption text-caption text-outline mt-0.5">
                1. Add your studio spaces with rates &amp; equipment gear rosters. 2. Edit room specs anytime. 3. Confirm upcoming booking requests from creators.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/provider/studios/new"
              className="text-xs text-tertiary hover:underline flex items-center gap-1 font-medium"
            >
              <span>Publish New Studio</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mb-space-xl animate-pulse">
            <div className="h-28 bg-surface-container-low rounded-xl border border-surface-container-high p-space-md"></div>
            <div className="h-28 bg-surface-container-low rounded-xl border border-surface-container-high p-space-md"></div>
            <div className="h-28 bg-surface-container-low rounded-xl border border-surface-container-high p-space-md"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mb-space-xl">
            <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between border border-surface-container-high">
              <div className="flex items-center justify-between pb-space-sm mb-space-sm">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                  Total Studios
                </span>
                <span className="p-1.5 rounded-lg bg-surface-container text-primary">
                  <span className="material-symbols-outlined text-[18px]">home</span>
                </span>
              </div>
              <div className="font-headline-xl text-headline-xl font-semibold tracking-tight text-on-surface font-mono">
                {studios.length}
              </div>
              <span className="font-caption text-caption text-outline mt-2">
                Active studio spaces listed
              </span>
            </div>

            <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between border border-surface-container-high">
              <div className="flex items-center justify-between pb-space-sm mb-space-sm">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                  Upcoming Bookings
                </span>
                <span className="p-1.5 rounded-lg bg-surface-container text-tertiary">
                  <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                </span>
              </div>
              <div className="font-headline-xl text-headline-xl font-semibold tracking-tight text-on-surface font-mono">
                {upcomingBookings.length}
              </div>
              <span className="font-caption text-caption text-outline mt-2">
                Scheduled upcoming sessions
              </span>
            </div>

            <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between border border-surface-container-high">
              <div className="flex items-center justify-between pb-space-sm mb-space-sm">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                  Completed Bookings
                </span>
                <span className="p-1.5 rounded-lg bg-surface-container text-outline">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                </span>
              </div>
              <div className="font-headline-xl text-headline-xl font-semibold tracking-tight text-on-surface font-mono">
                {completedBookings.length}
              </div>
              <span className="font-caption text-caption text-outline mt-2">
                Finished past recordings
              </span>
            </div>
          </div>
        )}

        <div className="mb-space-xl">
          <div className="flex items-center justify-between mb-space-md">
            <div>
              <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                My Studios
              </h2>
              <span className="font-caption text-outline">Your active recording studio spaces</span>
            </div>
            <Link
              className="font-label-sm text-label-sm text-primary hover:underline uppercase tracking-wider flex items-center gap-1"
              to="/provider/studios"
            >
              <span>View all ({studios.length})</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md animate-pulse">
              <div className="h-44 bg-surface-container-low rounded-xl border border-surface-container-high"></div>
              <div className="h-44 bg-surface-container-low rounded-xl border border-surface-container-high"></div>
            </div>
          ) : studios.length === 0 ? (
            <div className="p-space-lg rounded-xl bg-surface-container-low border border-surface-container-high text-center">
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-outline mx-auto mb-3">
                <span className="material-symbols-outlined text-[24px]">meeting_room</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface font-semibold mb-1">No studios registered yet.</p>
              <p className="font-caption text-outline max-w-sm mx-auto mb-4">
                List your first podcast recording studio to start receiving bookings from creators.
              </p>
              <Link
                className="inline-flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-primary-container text-on-primary-container font-body-sm font-medium"
                to="/provider/studios/new"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add Studio</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              {displayStudios.map((studio) => (
                <div
                  key={studio.id}
                  className="bg-surface-container-low rounded-xl overflow-hidden flex flex-col sm:flex-row border border-surface-container-high hover:border-outline-variant transition-colors"
                >
                  <div className="sm:w-2/5 relative h-40 sm:h-auto overflow-hidden bg-surface-container-lowest">
                    <img
                      alt={studio.name}
                      className="w-full h-full object-cover"
                      src={studio.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuAY5Js5asS-K45ETzqtnRCzez9QWi4Sf9mwbsY7UZTFsPEh_BK_4nfW"}
                    />
                  </div>
                  <div className="sm:w-3/5 p-space-md flex flex-col justify-between">
                    <div>
                      <h3 className="font-headline-sm text-body-lg font-semibold text-on-surface truncate">
                        {studio.name}
                      </h3>
                      <p className="font-caption text-caption text-outline line-clamp-2 mt-1">
                        {studio.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-space-sm mt-space-sm border-t border-surface-container-high">
                      <span className="font-label-sm text-label-sm text-on-surface font-mono font-medium">
                        ₹{Number(studio.hourlyRate).toLocaleString()} / hr
                      </span>
                      <Link
                        className="font-label-sm text-label-sm text-primary hover:underline flex items-center gap-0.5"
                        to={`/provider/studios/${studio.id}/edit`}
                      >
                        <span>Edit Studio</span>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-space-xl">
          <div className="flex items-center justify-between mb-space-md">
            <div>
              <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                Upcoming Bookings
              </h2>
              <span className="font-caption text-outline">Reservations booked at your studios</span>
            </div>
            <Link
              className="font-label-sm text-label-sm text-primary hover:underline uppercase flex items-center gap-1"
              to="/provider/bookings"
            >
              <span>View all bookings</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>

          <div className="bg-surface-container-low rounded-xl border border-surface-container-high divide-y divide-surface-container-high/50 overflow-hidden">
            {loading ? (
              <div className="p-space-lg space-y-3 animate-pulse">
                <div className="h-12 bg-surface-container rounded"></div>
                <div className="h-12 bg-surface-container rounded"></div>
              </div>
            ) : displayBookings.length === 0 ? (
              <div className="p-space-lg text-center text-outline font-body-sm">
                No upcoming bookings scheduled at your studios yet.
              </div>
            ) : (
              displayBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md hover:bg-surface-container transition-colors"
                >
                  <div className="flex items-center gap-space-md min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center font-mono text-outline font-bold shrink-0">
                      <span className="material-symbols-outlined text-[20px]">mic</span>
                    </div>
                    <div className="min-w-0">
                      <span className="font-body-sm text-body-sm font-semibold text-on-surface block truncate">
                        {b.studio || b.studioName}
                      </span>
                      <span className="font-caption text-caption text-outline truncate block">
                        {b.creatorName} ({b.creatorEmail})
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col shrink-0">
                    <span className="font-label-sm text-[10px] text-outline uppercase font-mono">
                      DATE
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface">
                      {b.date}
                    </span>
                  </div>

                  <div className="flex flex-col shrink-0">
                    <span className="font-label-sm text-[10px] text-outline uppercase font-mono">
                      TIME
                    </span>
                    <span className="font-mono text-body-sm text-on-surface">
                      {b.time}
                    </span>
                  </div>

                  <div className="flex flex-col shrink-0">
                    <span className="font-label-sm text-[10px] text-outline uppercase font-mono">
                      AMOUNT
                    </span>
                    <span className="font-mono text-body-sm text-on-surface font-semibold">
                      {b.amount}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-space-md">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            <Link
              className="bg-surface-container-low hover:bg-surface-container p-space-md rounded-xl transition-colors flex flex-col justify-between border border-surface-container-high"
              to="/provider/studios/new"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary mb-3">
                  <span className="material-symbols-outlined text-[20px]">add</span>
                </div>
                <h3 className="font-headline-sm text-body-lg font-semibold text-on-surface mb-1">
                  Add Studio
                </h3>
                <p className="font-caption text-caption text-outline">
                  List a new studio space with equipment roster and hourly rate.
                </p>
              </div>
            </Link>

            <Link
              className="bg-surface-container-low hover:bg-surface-container p-space-md rounded-xl transition-colors flex flex-col justify-between border border-surface-container-high"
              to="/provider/studios"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-on-surface-variant mb-3">
                  <span className="material-symbols-outlined text-[20px]">meeting_room</span>
                </div>
                <h3 className="font-headline-sm text-body-lg font-semibold text-on-surface mb-1">
                  Manage Studios
                </h3>
                <p className="font-caption text-caption text-outline">
                  Update rates, edit descriptions, and adjust equipment specs.
                </p>
              </div>
            </Link>

            <Link
              className="bg-surface-container-low hover:bg-surface-container p-space-md rounded-xl transition-colors flex flex-col justify-between border border-surface-container-high"
              to="/provider/bookings"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-on-surface-variant mb-3">
                  <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                </div>
                <h3 className="font-headline-sm text-body-lg font-semibold text-on-surface mb-1">
                  View Bookings
                </h3>
                <p className="font-caption text-caption text-outline">
                  Review upcoming bookings and confirm new reservation requests.
                </p>
              </div>
            </Link>
          </div>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md mt-space-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">mic</span>
            </div>
            <div>
              <span className="font-body-sm font-semibold text-on-surface block">Want to record an episode as a creator?</span>
              <span className="font-caption text-outline">Switch to Creator Workspace to browse and book podcast studios.</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => switchWorkspace("creator")}
            className="px-space-md py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-body-sm font-medium transition-colors cursor-pointer shrink-0"
          >
            Switch to Creator Workspace →
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ProviderDashboard;
