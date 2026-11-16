import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";

function ProviderBookings() {
  const [viewState, setViewState] = useState("table");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [studioFilter, setStudioFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  const clearFilters = () => {
    setStatusFilter("ALL");
    setStudioFilter("ALL");
    setDateFilter("");
  };

  const allBookings = [
    {
      id: "bkg-1",
      studioName: "Echo Room Studio",
      studioNode: "Delhi / Node DL-01",
      studioKey: "ECHO",
      creatorName: "Aarav Sharma",
      creatorEmail: "aarav@podcraft.in",
      date: "Oct 12, 2026",
      time: "10:00 AM - 12:00 PM",
      duration: "2 hrs scheduled",
      amount: "₹3,000",
      paymentStatus: "PAID ESCROW",
      status: "CONFIRMED",
      icon: "mic",
      actionText: "View details",
      actionIcon: "arrow_forward",
    },
    {
      id: "bkg-2",
      studioName: "Soundstage Precision Lab",
      studioNode: "Mumbai / Deck MB-04",
      studioKey: "SOUNDSTAGE",
      creatorName: "Priya Nair",
      creatorEmail: "priya@techwave.io",
      date: "Oct 14, 2026",
      time: "15:00 - 18:00",
      duration: "3 hrs scheduled",
      amount: "₹6,600",
      paymentStatus: "PAID ESCROW",
      status: "CONFIRMED",
      icon: "equalizer",
      actionText: "View details",
      actionIcon: "arrow_forward",
    },
    {
      id: "bkg-3",
      studioName: "Echo Room Studio",
      studioNode: "Delhi / Node DL-01",
      studioKey: "ECHO",
      creatorName: "Devan Mehta",
      creatorEmail: "devan@pulse.media",
      date: "Oct 16, 2026",
      time: "11:00 AM - 01:00 PM",
      duration: "2 hrs scheduled",
      amount: "₹3,000",
      paymentStatus: "HOLD PENDING",
      status: "PENDING",
      icon: "mic",
      actionText: "Review request",
      actionIcon: "priority_high",
    },
    {
      id: "bkg-4",
      studioName: "Soundstage Precision Lab",
      studioNode: "Mumbai / Deck MB-04",
      studioKey: "SOUNDSTAGE",
      creatorName: "Kavita Rao",
      creatorEmail: "kavita@indievoice.fm",
      date: "Sep 29, 2026",
      time: "14:00 - 16:00",
      duration: "2 hrs completed",
      amount: "₹4,400",
      paymentStatus: "SETTLED",
      status: "COMPLETED",
      icon: "check_circle",
      actionText: "Archived",
      actionIcon: "inventory_2",
      archived: true,
    },
  ];

  const filteredBookings = allBookings.filter((b) => {
    if (statusFilter !== "ALL" && b.status !== statusFilter) return false;
    if (studioFilter !== "ALL" && b.studioKey !== studioFilter) return false;
    if (dateFilter && !b.date.toLowerCase().includes(dateFilter.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout activePath="/provider/bookings">
      <div className="flex flex-col w-full">
        <div className="w-full flex items-center justify-between pb-space-sm pt-space-xs">
          <div className="flex items-center gap-space-sm">
            <span className="font-label-sm text-label-sm text-outline tracking-widest uppercase">
              ROUTING
            </span>
            <span className="text-surface-variant font-label-sm text-label-sm">/</span>
            <span className="font-label-sm text-label-sm text-primary tracking-wider uppercase">
              UNIT 04_CALIBRATION: ACTIVE
            </span>
            <span className="text-surface-variant font-label-sm text-label-sm">/</span>
            <span className="font-label-sm text-label-sm text-tertiary tracking-wider uppercase">
              INVENTORY: SYNCED
            </span>
          </div>
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">AUTO-INGEST ON</span>
            </div>
            <div className="font-label-sm text-label-sm text-outline">LOC_ID: BOM/DEL-STG</div>
          </div>
        </div>

        <div className="w-full bg-surface-container-low rounded-lg p-space-lg mb-space-lg flex flex-col md:flex-row md:items-end justify-between gap-space-md shadow-sm">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">
                SCHEDULE TELEMETRY
              </span>
              <span className="text-surface-variant text-body-sm">•</span>
              <span className="font-label-sm text-label-sm text-outline">SLOT CONCURRENCY: 2 MAX</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg font-semibold text-on-surface tracking-tight leading-none mb-2">
              Studio Bookings
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Manage sessions booked at your studios.
            </p>
          </div>

          <div className="flex items-stretch gap-space-md">
            <div className="bg-surface-container rounded-lg px-space-md py-space-sm flex flex-col min-w-[170px]">
              <div className="flex items-center justify-between text-outline mb-1">
                <span className="font-label-sm text-label-sm tracking-wider uppercase">UPCOMING</span>
                <span className="material-symbols-outlined text-[16px] text-tertiary">graphic_eq</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-headline-md text-headline-md font-semibold text-on-surface">3</span>
                <span className="font-label-sm text-label-sm text-tertiary">Sessions Active</span>
              </div>
            </div>
            <div className="bg-surface-container rounded-lg px-space-md py-space-sm flex flex-col min-w-[170px]">
              <div className="flex items-center justify-between text-outline mb-1">
                <span className="font-label-sm text-label-sm tracking-wider uppercase">HISTORICAL</span>
                <span className="material-symbols-outlined text-[16px] text-outline">done_all</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-headline-md text-headline-md font-semibold text-on-surface">11</span>
                <span className="font-label-sm text-label-sm text-outline">Completed</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full bg-surface-container-lowest rounded-lg p-space-sm mb-space-md flex flex-wrap items-center justify-between gap-space-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-outline text-[16px]">tune</span>
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
              MOCK STATE OVERRIDE:
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              className={`px-space-sm py-1 rounded-lg font-label-sm text-label-sm transition-all ${
                viewState === "table"
                  ? "bg-surface-container-high text-primary font-medium"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
              id="btn-state-table"
              onClick={() => setViewState("table")}
              type="button"
            >
              DATA TABLE [DEFAULT]
            </button>
            <button
              className={`px-space-sm py-1 rounded-lg font-label-sm text-label-sm transition-all ${
                viewState === "empty"
                  ? "bg-surface-container-high text-primary font-medium"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
              id="btn-state-empty"
              onClick={() => setViewState("empty")}
              type="button"
            >
              EMPTY BOOKINGS
            </button>
            <button
              className={`px-space-sm py-1 rounded-lg font-label-sm text-label-sm transition-all ${
                viewState === "nostudios"
                  ? "bg-surface-container-high text-primary font-medium"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
              id="btn-state-nostudios"
              onClick={() => setViewState("nostudios")}
              type="button"
            >
              ZERO STUDIOS
            </button>
            <button
              className={`px-space-sm py-1 rounded-lg font-label-sm text-label-sm transition-all ${
                viewState === "loading"
                  ? "bg-surface-container-high text-primary font-medium"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
              id="btn-state-loading"
              onClick={() => setViewState("loading")}
              type="button"
            >
              SKELETON INGEST
            </button>
            <button
              className={`px-space-sm py-1 rounded-lg font-label-sm text-label-sm transition-all ${
                viewState === "error"
                  ? "bg-surface-container-high text-primary font-medium"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
              id="btn-state-error"
              onClick={() => setViewState("error")}
              type="button"
            >
              SYNC ERROR
            </button>
          </div>
        </div>

        <div className="w-full bg-surface-container-low rounded-lg p-space-md mb-space-md shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md items-center">
            <div className="md:col-span-3 flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-outline uppercase tracking-wider" htmlFor="filter-status">
                SESSION STATUS
              </label>
              <div className="relative flex items-center">
                <select
                  className="w-full h-[38px] pl-3 pr-8 bg-surface-container-lowest rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                  id="filter-status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 pointer-events-none text-outline text-[18px]">
                  expand_more
                </span>
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-outline uppercase tracking-wider" htmlFor="filter-studio">
                STUDIO CONSOLE
              </label>
              <div className="relative flex items-center">
                <select
                  className="w-full h-[38px] pl-3 pr-8 bg-surface-container-lowest rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                  id="filter-studio"
                  value={studioFilter}
                  onChange={(e) => setStudioFilter(e.target.value)}
                >
                  <option value="ALL">All My Studios</option>
                  <option value="ECHO">Echo Room Studio</option>
                  <option value="SOUNDSTAGE">Soundstage Precision Lab</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 pointer-events-none text-outline text-[18px]">
                  expand_more
                </span>
              </div>
            </div>

            <div className="md:col-span-3 flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-outline uppercase tracking-wider" htmlFor="filter-date">
                WINDOW CALENDAR
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-2.5 text-outline text-[18px]">
                  date_range
                </span>
                <input
                  className="w-full h-[38px] pl-9 pr-3 bg-surface-container-lowest rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary"
                  id="filter-date"
                  placeholder="Filter by date"
                  type="text"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
            </div>

            <div className="md:col-span-2 flex flex-col justify-end self-end">
              <button
                className="h-[38px] px-space-md bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface rounded-lg font-body-sm text-body-sm flex items-center justify-center gap-1.5 transition-colors"
                onClick={clearFilters}
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">backspace</span>
                <span>Clear Filters</span>
              </button>
            </div>
          </div>
        </div>

        <div className="w-full pb-space-xl">
          {viewState === "table" && (
            <div className="w-full bg-surface-container-low rounded-lg overflow-hidden shadow-sm" id="view-table">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-lowest text-outline font-label-sm text-label-sm uppercase tracking-wider">
                      <th className="py-space-sm px-space-md font-medium">STUDIO</th>
                      <th className="py-space-sm px-space-md font-medium">CREATOR</th>
                      <th className="py-space-sm px-space-md font-medium">DATE</th>
                      <th className="py-space-sm px-space-md font-medium">TIME &amp; DURATION</th>
                      <th className="py-space-sm px-space-md font-medium">AMOUNT</th>
                      <th className="py-space-sm px-space-md font-medium">STATUS</th>
                      <th className="py-space-sm px-space-md font-medium text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    {filteredBookings.map((b) => (
                      <tr
                        key={b.id}
                        className={`hover:bg-surface-container/60 transition-colors group ${
                          b.archived ? "opacity-80" : ""
                        }`}
                      >
                        <td className="py-space-md px-space-md">
                          <div className="flex items-center gap-space-sm">
                            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                              <span
                                className={`material-symbols-outlined text-[18px] ${
                                  b.archived ? "text-outline" : "text-primary"
                                }`}
                              >
                                {b.icon}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-body-md text-body-md font-medium text-on-surface group-hover:text-primary transition-colors">
                                {b.studioName}
                              </span>
                              <span className="font-label-sm text-label-sm text-outline">{b.studioNode}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-space-md px-space-md">
                          <div className="flex flex-col">
                            <span className="font-body-md text-body-md text-on-surface font-medium">
                              {b.creatorName}
                            </span>
                            <span className="font-caption text-caption text-outline">{b.creatorEmail}</span>
                          </div>
                        </td>
                        <td className="py-space-md px-space-md">
                          <div className="flex items-center gap-1.5 text-on-surface font-label-md text-label-md">
                            <span className="material-symbols-outlined text-[14px] text-outline">
                              calendar_today
                            </span>
                            <span>{b.date}</span>
                          </div>
                        </td>
                        <td className="py-space-md px-space-md">
                          <div className="flex flex-col">
                            <span className="font-label-md text-label-md text-on-surface">{b.time}</span>
                            <span className="font-label-sm text-label-sm text-outline">{b.duration}</span>
                          </div>
                        </td>
                        <td className="py-space-md px-space-md">
                          <div className="flex flex-col">
                            <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                              {b.amount}
                            </span>
                            <span
                              className={`font-label-sm text-label-sm ${
                                b.paymentStatus === "PAID ESCROW"
                                  ? "text-tertiary"
                                  : "text-outline"
                              }`}
                            >
                              {b.paymentStatus}
                            </span>
                          </div>
                        </td>
                        <td className="py-space-md px-space-md">
                          {b.status === "CONFIRMED" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-tertiary/10 text-tertiary font-label-sm text-label-sm font-medium tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
                              CONFIRMED
                            </span>
                          ) : b.status === "PENDING" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-secondary-container/20 text-secondary font-label-sm text-label-sm font-medium tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                              PENDING
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-surface-container-highest text-outline font-label-sm text-label-sm font-medium tracking-wider">
                              COMPLETED
                            </span>
                          )}
                        </td>
                        <td className="py-space-md px-space-md text-right">
                          {b.status === "PENDING" ? (
                            <button
                              className="px-space-md h-9 bg-primary-container text-on-primary-container hover:brightness-110 font-body-sm text-body-sm font-medium rounded-lg transition-all inline-flex items-center gap-1.5"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[16px]">priority_high</span>
                              <span>Review request</span>
                            </button>
                          ) : b.status === "COMPLETED" ? (
                            <button
                              className="px-space-md h-9 bg-transparent text-outline font-body-sm text-body-sm rounded-lg cursor-not-allowed inline-flex items-center gap-1 opacity-60"
                              disabled
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                              <span>Archived</span>
                            </button>
                          ) : (
                            <button
                              className="px-space-md h-9 bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm rounded-lg transition-colors inline-flex items-center gap-1.5"
                              type="button"
                            >
                              <span>View details</span>
                              <span className="material-symbols-outlined text-[16px] text-outline">
                                arrow_forward
                              </span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-surface-container-lowest px-space-md py-space-sm flex items-center justify-between text-outline">
                <div className="flex items-center gap-space-sm font-label-sm text-label-sm">
                  <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                  <span>SYSTEM READY • SHOWING {filteredBookings.length} OF 14 LOGGED SESSIONS</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-2 py-1 rounded bg-surface-container text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm transition-colors disabled:opacity-50"
                    disabled
                    type="button"
                  >
                    PREV
                  </button>
                  <span className="font-label-sm text-label-sm px-1">PAGE 01 / 04</span>
                  <button
                    className="px-2 py-1 rounded bg-surface-container text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm transition-colors"
                    type="button"
                  >
                    NEXT
                  </button>
                </div>
              </div>
            </div>
          )}

          {viewState === "empty" && (
            <div
              className="w-full bg-surface-container-low rounded-lg p-space-xl flex flex-col items-center justify-center text-center shadow-sm"
              id="view-empty"
            >
              <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center mb-space-md text-outline">
                <span className="material-symbols-outlined text-[32px]">calendar_today</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-1">
                No bookings yet
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mb-space-lg">
                Bookings made for your studios will appear here.
              </p>
              <div className="px-space-md py-space-xs rounded-lg bg-surface-container-lowest font-label-sm text-label-sm text-outline tracking-wider uppercase">
                PORT SCANNING ACTIVE • AWAITING INBOUND CREATOR REQUESTS
              </div>
            </div>
          )}

          {viewState === "nostudios" && (
            <div
              className="w-full bg-surface-container-low rounded-lg p-space-xl flex flex-col items-center justify-center text-center shadow-sm"
              id="view-nostudios"
            >
              <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center mb-space-md text-primary">
                <span className="material-symbols-outlined text-[32px]">meeting_room</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-1">
                Create a studio first
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md mb-space-lg">
                Once you add a studio, creator bookings will appear here. Configure your acoustic rooms,
                soundstage decks, and hourly telemetry.
              </p>
              <Link
                className="h-[42px] px-space-lg bg-primary-container text-on-primary-container hover:brightness-110 font-body-md text-body-md font-medium rounded-lg transition-all flex items-center gap-2"
                to="/provider/studios/new"
              >
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                <span>Add Studio</span>
              </Link>
            </div>
          )}

          {viewState === "loading" && (
            <div className="w-full bg-surface-container-low rounded-lg p-space-md shadow-sm" id="view-loading">
              <div className="w-full flex items-center justify-between pb-space-md">
                <div className="h-4 w-48 bg-surface-container-high rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-surface-container-high rounded animate-pulse"></div>
              </div>
              <div className="space-y-4">
                <div className="h-14 w-full bg-surface-container rounded-lg animate-pulse"></div>
                <div className="h-14 w-full bg-surface-container rounded-lg animate-pulse"></div>
                <div className="h-14 w-full bg-surface-container rounded-lg animate-pulse"></div>
                <div className="h-14 w-full bg-surface-container rounded-lg animate-pulse"></div>
              </div>
              <div className="flex items-center justify-center gap-2 pt-space-lg text-outline font-label-sm text-label-sm">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                <span>ACQUIRING TELEMETRY LOCK FROM CLUSTER...</span>
              </div>
            </div>
          )}

          {viewState === "error" && (
            <div
              className="w-full bg-surface-container-low rounded-lg p-space-xl flex flex-col items-center justify-center text-center shadow-sm"
              id="view-error"
            >
              <div className="w-16 h-16 rounded-xl bg-error-container/20 text-error flex items-center justify-center mb-space-md">
                <span className="material-symbols-outlined text-[32px]">sync_problem</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-1">
                Unable to load bookings
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mb-space-lg">
                The studio matrix feed timed out while handshake protocols were being verified. Check
                upstream connectivity.
              </p>
              <button
                className="h-[42px] px-space-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-md text-body-md font-medium rounded-lg transition-colors flex items-center gap-2"
                onClick={() => setViewState("table")}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">refresh</span>
                <span>Try again</span>
              </button>
            </div>
          )}
        </div>

        <div className="w-full bg-surface-container-lowest rounded-lg p-space-md flex flex-col md:flex-row items-center justify-between gap-space-sm font-label-sm text-label-sm text-outline">
          <div className="flex items-center gap-3">
            <span className="font-medium text-on-surface">SYS_AUDIT: NORMAL</span>
            <span className="text-surface-variant">/</span>
            <span>BUFFER: ZERO_DROP</span>
            <span className="text-surface-variant">/</span>
            <span>ENCRYPTION: AES_256_GCM</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-tertiary">STATION 09 - DELHI HUB ONLINE</span>
            <span>LAST SYNC: 10:42:01 UTC</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ProviderBookings;
