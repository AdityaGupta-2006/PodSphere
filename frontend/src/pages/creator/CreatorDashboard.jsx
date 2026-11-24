import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import * as studioApi from "../../services/studioApi";
import * as bookingApi from "../../services/bookingApi";
import { useAuth } from "../../hooks/useAuth";

function CreatorDashboard() {
  const { user, switchWorkspace } = useAuth();
  const [studios, setStudios] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    setError("");
    try {
      const bookingFilter = user?.id ? { creatorId: user.id } : {};
      const [studioList, bookingList] = await Promise.all([
        studioApi.getStudios(),
        bookingApi.getBookings(bookingFilter),
      ]);
      setStudios(studioList || []);
      setBookings(bookingList || []);
      setLoading(false);
    } catch (err) {
      setError(err?.message || "Unable to load dashboard data. Please try again.");
      setStudios([]);
      setBookings([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const bookingFilter = user?.id ? { creatorId: user.id } : {};
    Promise.all([studioApi.getStudios(), bookingApi.getBookings(bookingFilter)])
      .then(([studioList, bookingList]) => {
        if (active) {
          setStudios(studioList || []);
          setBookings(bookingList || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err?.message || "Unable to load dashboard data. Please try again.");
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

  const activeBookings = bookings
    .filter((b) => b.status === "CONFIRMED" || b.status === "PENDING")
    .sort((a, b) => (a.rawDate || a.date || "").localeCompare(b.rawDate || b.date || ""));

  const completedBookings = bookings.filter((b) => b.status === "COMPLETED");
  const nextSession = activeBookings[0] || null;

  const totalSpent = bookings
    .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
    .reduce((sum, b) => {
      const val = Number(b.rawAmount) || parseInt(String(b.amount || "").replace(/[^0-9]/g, ""), 10) || 0;
      return sum + val;
    }, 0);

  return (
    <DashboardLayout activePath="/creator/dashboard">
      <div className="flex flex-col gap-space-lg pb-space-xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pt-space-md border-b border-surface-container-high pb-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-[10px] px-2 py-0.5 rounded bg-primary-container/20 text-primary font-mono uppercase tracking-wider">
                CREATOR WORKSPACE
              </span>
              <span className="text-outline text-xs">• Recording Management</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight mt-1">
              Welcome back, {user?.name ? user.name.split(" ")[0] : "Creator"}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
              Discover verified podcast studios, review acoustic setups, reserve recording slots, and track your audio pipeline.
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
              className="flex items-center gap-space-xs px-space-md h-9 rounded-lg bg-primary-container hover:bg-secondary-container text-on-primary-container font-body-sm text-body-sm font-medium transition-colors shadow-sm"
              to="/creator/studios"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              <span>Find Studio</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="flex items-center justify-between p-space-md bg-error-container/20 rounded-xl text-error border border-error-container/40">
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

        <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container-high flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[20px]">info</span>
            </div>
            <div>
              <h3 className="font-body-sm font-semibold text-on-surface">What you can do in Creator Workspace:</h3>
              <p className="font-caption text-caption text-outline mt-0.5">
                1. Browse certified podcast studios by city. 2. Rent pro microphones, cameras &amp; mixers. 3. Manage your active studio sessions &amp; gear rentals.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/creator/equipment"
              className="text-xs text-primary hover:underline flex items-center gap-1 font-medium mr-2"
            >
              <span>Browse Equipment</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
            <Link
              to="/creator/bookings"
              className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
            >
              <span>View My Bookings</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md animate-pulse">
            <div className="h-28 rounded-xl bg-surface-container-lowest border border-surface-container-high p-space-md"></div>
            <div className="h-28 rounded-xl bg-surface-container-lowest border border-surface-container-high p-space-md"></div>
            <div className="h-28 rounded-xl bg-surface-container-lowest border border-surface-container-high p-space-md"></div>
            <div className="h-28 rounded-xl bg-surface-container-lowest border border-surface-container-high p-space-md"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
            <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between text-outline mb-space-sm">
                <span className="font-label-sm text-label-sm uppercase tracking-wider">
                  Total Sessions
                </span>
                <span className="material-symbols-outlined text-body-lg text-primary">
                  mic
                </span>
              </div>
              <div>
                <span className="font-headline-xl text-headline-xl font-bold text-on-surface font-mono">
                  {String(bookings.length).padStart(2, "0")}
                </span>
                <span className="block font-caption text-caption text-outline mt-1">
                  All recording sessions booked
                </span>
              </div>
            </div>

            <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between text-outline mb-space-sm">
                <span className="font-label-sm text-label-sm uppercase tracking-wider">
                  Active Pipeline
                </span>
                <span className="material-symbols-outlined text-body-lg text-tertiary">
                  check_circle
                </span>
              </div>
              <div>
                <span className="font-headline-xl text-headline-xl font-bold text-tertiary font-mono">
                  {String(activeBookings.length).padStart(2, "0")}
                </span>
                <span className="block font-caption text-caption text-outline mt-1">
                  Confirmed upcoming sessions
                </span>
              </div>
            </div>

            <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between text-outline mb-space-sm">
                <span className="font-label-sm text-label-sm uppercase tracking-wider">
                  Archived Runs
                </span>
                <span className="material-symbols-outlined text-body-lg text-outline">
                  archive
                </span>
              </div>
              <div>
                <span className="font-headline-xl text-headline-xl font-bold text-on-surface font-mono">
                  {String(completedBookings.length).padStart(2, "0")}
                </span>
                <span className="block font-caption text-caption text-outline mt-1">
                  Completed podcast recordings
                </span>
              </div>
            </div>

            <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between text-outline mb-space-sm">
                <span className="font-label-sm text-label-sm uppercase tracking-wider">
                  Commitment Value
                </span>
                <span className="material-symbols-outlined text-body-lg text-secondary">
                  account_balance_wallet
                </span>
              </div>
              <div>
                <span className="font-headline-xl text-headline-xl font-bold text-on-surface font-mono">
                  ₹{totalSpent.toLocaleString()}
                </span>
                <span className="block font-caption text-caption text-outline mt-1">
                  Total settled session fees
                </span>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="h-32 rounded-xl bg-surface-container-low border border-surface-container-high animate-pulse"></div>
        ) : nextSession ? (
          <div className="p-space-lg rounded-xl bg-surface-container-low border border-surface-container-high flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md shadow-md">
            <div className="flex items-center gap-space-md min-w-0">
              <div className="w-12 h-12 rounded-xl bg-primary-container/20 border border-primary-container/30 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[26px]">podcasts</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-tertiary/20 text-tertiary font-label-sm text-[10px] uppercase font-semibold">
                    NEXT UPCOMING SESSION
                  </span>
                  <span className="font-label-sm text-label-sm text-outline font-mono truncate">
                    {nextSession.id}
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mt-1 truncate">
                  {nextSession.studio}
                </h3>
                <span className="font-caption text-caption text-on-surface-variant truncate">
                  {nextSession.date} • {nextSession.time} • {nextSession.location}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-space-sm self-end md:self-auto shrink-0">
              <Link
                className="px-space-md h-9 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm transition-colors flex items-center gap-1.5"
                to="/creator/bookings"
              >
                <span>View My Bookings</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-space-lg rounded-xl bg-surface-container-low border border-surface-container-high flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md shadow-sm">
            <div className="flex items-center gap-space-md min-w-0">
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-outline shrink-0">
                <span className="material-symbols-outlined text-[26px]">event_available</span>
              </div>
              <div className="flex flex-col min-w-0">
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                  No upcoming recording sessions
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Ready to record? Find certified studio spaces and schedule your next podcast session.
                </p>
              </div>
            </div>
            <Link
              className="px-space-md h-9 rounded-lg bg-primary-container hover:bg-secondary-container text-on-primary-container font-body-sm text-body-sm font-medium transition-colors flex items-center gap-1.5 shrink-0 self-end sm:self-auto"
              to="/creator/studios"
            >
              <span className="material-symbols-outlined text-[16px]">search</span>
              <span>Find Studio</span>
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-space-sm mt-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[18px]">travel_explore</span>
              <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                Featured Podcast Studios
              </h2>
            </div>
            <Link
              className="font-label-sm text-label-sm text-primary hover:underline uppercase tracking-wider"
              to="/creator/studios"
            >
              Browse All ({studios.length}) →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md animate-pulse">
              <div className="h-48 rounded-xl bg-surface-container-lowest border border-surface-container-high"></div>
              <div className="h-48 rounded-xl bg-surface-container-lowest border border-surface-container-high"></div>
              <div className="h-48 rounded-xl bg-surface-container-lowest border border-surface-container-high"></div>
            </div>
          ) : studios.length === 0 ? (
            <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-surface-container-high text-center">
              <p className="font-body-md text-body-md text-outline">No studios available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
              {studios.slice(0, 3).map((studio) => (
                <div
                  key={studio.id}
                  className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high/60 flex flex-col justify-between hover:border-surface-variant transition-colors"
                >
                  <div className="flex flex-col gap-1 mb-space-md">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-[10px] text-tertiary uppercase font-mono">
                        {studio.city}
                      </span>
                      <span className="font-mono text-body-sm text-on-surface font-semibold">
                        ₹{Number(studio.hourlyRate).toLocaleString()} / hr
                      </span>
                    </div>
                    <h4 className="font-body-md text-body-md font-semibold text-on-surface">
                      {studio.name}
                    </h4>
                    <p className="font-caption text-caption text-outline line-clamp-2">
                      {studio.description}
                    </p>
                  </div>
                  <Link
                    className="w-full py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-center font-body-sm text-body-sm transition-colors block"
                    to="/creator/studios"
                  >
                    Check Availability
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md mt-space-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[18px]">meeting_room</span>
            </div>
            <div>
              <span className="font-body-sm font-semibold text-on-surface block">Are you a studio owner or provider?</span>
              <span className="font-caption text-outline">List your recording booths, set rates, and accept reservations from creators.</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => switchWorkspace("provider")}
            className="px-space-md py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-body-sm font-medium transition-colors cursor-pointer shrink-0"
          >
            Switch to Provider Console →
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CreatorDashboard;
