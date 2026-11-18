import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";

function ProviderDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [zeroStateVisible, setZeroStateVisible] = useState(true);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const toggleZeroState = () => {
    setZeroStateVisible((prev) => !prev);
  };

  return (
    <DashboardLayout activePath="/provider/dashboard">
      <div className="flex flex-col w-full pb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pt-space-lg pb-space-lg">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">
                CONSOLE // UNIT-01
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span className="font-label-sm text-label-sm text-outline tracking-wider uppercase">
                NODE: BOM-CENTRAL
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg font-semibold tracking-tight text-on-surface">
              Provider Dashboard
            </h1>
            <p className="font-body-md text-body-md text-outline">
              Manage your studios and keep track of upcoming bookings.
            </p>
          </div>

          <div className="flex items-center gap-space-sm self-start md:self-auto shrink-0">
            <button
              className="h-9 px-space-md rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-body-sm font-medium transition-colors flex items-center gap-2"
              id="refresh-matrix-btn"
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
              <span className="font-body-sm text-body-sm">Refresh Matrix</span>
            </button>
            <Link
              className="h-9 px-space-md rounded-lg bg-primary-container hover:bg-inverse-primary text-on-primary-container hover:text-on-surface text-body-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
              to="/provider/studios/new"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span className="font-body-sm text-body-sm">Add Studio</span>
            </Link>
          </div>
        </div>

        <div className="w-full bg-surface-container-lowest rounded-lg p-space-sm mb-space-lg flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-lg">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded bg-tertiary"></span>
              <span className="font-label-sm text-label-sm text-on-surface uppercase">
                AUDIO ENGINE: SYNCHRONIZED
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="font-label-sm text-label-sm text-outline">CLOCK:</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">
                48.000 kHz / 24-BIT
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-md font-label-sm text-label-sm text-outline">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-tertiary">sensors</span>
              SIGNAL INTEGRITY: 99.98%
            </span>
            <span className="text-surface-variant">|</span>
            <span>PROVIDER PORT: 0x882A</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mb-space-xl">
          <div className="bg-surface-container-low rounded-xl p-space-md transition-colors hover:bg-surface-container flex flex-col justify-between">
            <div className="flex items-center justify-between pb-space-sm mb-space-sm bg-surface-container-lowest/40 -mx-space-md -mt-space-md px-space-md pt-space-sm rounded-t-xl">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                TOTAL STUDIOS
              </span>
              <span className="font-label-sm text-label-sm text-outline font-mono">[ST-IDX]</span>
            </div>
            <div className="flex items-baseline justify-between mt-space-xs mb-space-sm">
              <div className="font-headline-xl text-headline-xl font-semibold tracking-tight text-on-surface">
                2
              </div>
              <div className="p-2 rounded-lg bg-surface-container-lowest text-primary">
                <svg
                  className="w-5 h-5 stroke-current fill-none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.75"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
            </div>
            <div className="flex items-center justify-between pt-space-xs bg-surface-container-lowest/20 -mx-space-md -mb-space-md px-space-md pb-space-xs rounded-b-xl">
              <span className="font-caption text-caption text-outline">1 active listing, 1 draft</span>
              <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant uppercase">
                SYS.OK
              </span>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-xl p-space-md transition-colors hover:bg-surface-container flex flex-col justify-between">
            <div className="flex items-center justify-between pb-space-sm mb-space-sm bg-surface-container-lowest/40 -mx-space-md -mt-space-md px-space-md pt-space-sm rounded-t-xl">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                UPCOMING BOOKINGS
              </span>
              <span className="font-label-sm text-label-sm text-outline font-mono">[QUEUE]</span>
            </div>
            <div className="flex items-baseline justify-between mt-space-xs mb-space-sm">
              <div className="font-headline-xl text-headline-xl font-semibold tracking-tight text-on-surface">
                3
              </div>
              <div className="p-2 rounded-lg bg-surface-container-lowest text-tertiary">
                <svg
                  className="w-5 h-5 stroke-current fill-none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.75"
                  viewBox="0 0 24 24"
                >
                  <rect height="18" rx="2" ry="2" width="18" x="3" y="4"></rect>
                  <line x1="16" x2="16" y1="2" y2="6"></line>
                  <line x1="8" x2="8" y1="2" y2="6"></line>
                  <line x1="3" x2="21" y1="10" y2="10"></line>
                </svg>
              </div>
            </div>
            <div className="flex items-center justify-between pt-space-xs bg-surface-container-lowest/20 -mx-space-md -mb-space-md px-space-md pb-space-xs rounded-b-xl">
              <span className="font-caption text-caption text-outline">Scheduled next 7 days</span>
              <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-tertiary/10 text-tertiary uppercase">
                ENGAGED
              </span>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-xl p-space-md transition-colors hover:bg-surface-container flex flex-col justify-between">
            <div className="flex items-center justify-between pb-space-sm mb-space-sm bg-surface-container-lowest/40 -mx-space-md -mt-space-md px-space-md pt-space-sm rounded-t-xl">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                TOTAL BOOKINGS
              </span>
              <span className="font-label-sm text-label-sm text-outline font-mono">[LIFETIME]</span>
            </div>
            <div className="flex items-baseline justify-between mt-space-xs mb-space-sm">
              <div className="font-headline-xl text-headline-xl font-semibold tracking-tight text-on-surface">
                14
              </div>
              <div className="p-2 rounded-lg bg-surface-container-lowest text-secondary-fixed">
                <svg
                  className="w-5 h-5 stroke-current fill-none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.75"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2v20"></path>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
            </div>
            <div className="flex items-center justify-between pt-space-xs bg-surface-container-lowest/20 -mx-space-md -mb-space-md px-space-md pb-space-xs rounded-b-xl">
              <span className="font-caption text-caption text-outline">Lifetime completed sessions</span>
              <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant uppercase">
                ARCHIVED
              </span>
            </div>
          </div>
        </div>

        <div className="w-full bg-surface-container-low rounded-xl p-space-md mb-space-xl">
          <div className="flex items-center justify-between mb-space-md">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-[18px] text-primary">mic</span>
              <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                Studio Physical Nodes
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-outline uppercase font-mono">
              2 UNITS REGISTERED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            <div className="flex flex-col sm:flex-row bg-surface-container-lowest rounded-lg overflow-hidden group">
              <div className="sm:w-44 h-32 shrink-0 overflow-hidden relative">
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt="Echo Room Studio"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwSJXATKVh9I1RBqYTP7GErc6Dbo65xLusVDBfm8AQyzatSqj0pnxFBrjBZgdm5DgiySIhp5SCICRwEc-depByK6NbPlMD4-ni03RX7sE98InrZwW-MHzk7q8dlZXaix1FExIVBWAnuBkKWpJ-lqchDdjsz5o9QGM3I_DStprRl6fi_uzBiHHos-hXLEUEVKS81-4Mp-QOv8lZ_cy0EROkMCKhQ05znBpVaM9SraAhG0S4NpjC9Fk"
                />
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur-sm font-label-sm text-label-sm text-tertiary">
                  LIVE READY
                </div>
              </div>
              <div className="p-space-sm flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-body-md text-body-md font-semibold text-on-surface">
                      Echo Room Studio
                    </span>
                    <span className="font-label-sm text-label-sm text-outline">UNIT A</span>
                  </div>
                  <p className="font-caption text-caption text-outline mt-0.5">
                    Dual-host broadcast layout, RØDECaster Pro II, Sony FX3 4K setup.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="font-label-md text-label-md text-on-surface font-mono">₹1,500/hr</span>
                  <Link
                    className="font-caption text-caption text-primary hover:underline flex items-center gap-1"
                    to="/provider/studios"
                  >
                    Config Studio <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row bg-surface-container-lowest rounded-lg overflow-hidden group">
              <div className="sm:w-44 h-32 shrink-0 overflow-hidden relative">
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt="Soundstage Precision"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9Zm1fM6xXdxKM7VkM9gZX-wC-ZzsHvF2zfPgu5-9pjdxP-y-X7IlAbk_Mg7qFtc-HcLdwpqXo7gXb_8aIYovunAIeiWz6510CDeGcKhDjwf3CvPTXx7chNUTmnwY28VbyWUqCB3a-OOYch6AVMFz5x6yWAw98y-r1fzIwakOo3Ov5BUfw8yjrWNYkK_u8qNyVSjdg4Ox8i6ELqEW1gd7bzjv92h7XnnO0HY-xGr4ghi2qXxbHW6c"
                />
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur-sm font-label-sm text-label-sm text-outline">
                  DRAFT MODE
                </div>
              </div>
              <div className="p-space-sm flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-body-md text-body-md font-semibold text-on-surface">
                      Soundstage Precision
                    </span>
                    <span className="font-label-sm text-label-sm text-outline">UNIT B</span>
                  </div>
                  <p className="font-caption text-caption text-outline mt-0.5">
                    4-mic round table, Blackmagic ATEM Mini Extreme ISO, Neumann TLM-103s.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="font-label-md text-label-md text-on-surface font-mono">₹1,800/hr</span>
                  <Link
                    className="font-caption text-caption text-outline hover:text-on-surface flex items-center gap-1"
                    to="/provider/studios"
                  >
                    Edit Blueprint <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-space-xl">
          <div className="flex items-center justify-between mb-space-sm">
            <h2 className="font-headline-sm text-headline-sm font-semibold tracking-tight text-on-surface">
              Quick Actions
            </h2>
            <span className="font-label-sm text-label-sm text-outline uppercase font-mono">
              OPERATIONAL DISPATCH
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
            <Link
              className="group bg-surface-container-low hover:bg-surface-container rounded-lg p-space-md transition-all flex flex-col justify-between"
              to="/provider/studios/new"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <svg
                    className="w-5 h-5 stroke-current fill-none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <line x1="12" x2="12" y1="5" y2="19"></line>
                    <line x1="5" x2="19" y1="12" y2="12"></line>
                  </svg>
                </div>
                <span className="font-label-sm text-label-sm text-outline font-mono">ACT-01</span>
              </div>
              <div className="mt-space-md">
                <div className="font-body-md text-body-md font-semibold text-on-surface group-hover:text-primary transition-colors flex items-center justify-between">
                  <span>Add Studio</span>
                  <span className="material-symbols-outlined text-[16px] transform group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
                <p className="font-caption text-caption text-outline mt-1">
                  Publish new acoustic room specs, equipment roster, and hourly tariffs.
                </p>
              </div>
            </Link>

            <Link
              className="group bg-surface-container-low hover:bg-surface-container rounded-lg p-space-md transition-all flex flex-col justify-between"
              to="/provider/studios"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded bg-surface-container-high flex items-center justify-center text-on-surface group-hover:bg-on-surface group-hover:text-surface transition-colors">
                  <svg
                    className="w-5 h-5 stroke-current fill-none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <rect height="14" rx="2" ry="2" width="20" x="2" y="7"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                </div>
                <span className="font-label-sm text-label-sm text-outline font-mono">ACT-02</span>
              </div>
              <div className="mt-space-md">
                <div className="font-body-md text-body-md font-semibold text-on-surface group-hover:text-primary transition-colors flex items-center justify-between">
                  <span>Manage Studios</span>
                  <span className="material-symbols-outlined text-[16px] transform group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
                <p className="font-caption text-caption text-outline mt-1">
                  Toggle availability slots, calibrate gear inventory, and adjust rates.
                </p>
              </div>
            </Link>

            <Link
              className="group bg-surface-container-low hover:bg-surface-container rounded-lg p-space-md transition-all flex flex-col justify-between"
              to="/provider/bookings"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded bg-surface-container-high flex items-center justify-center text-on-surface group-hover:bg-on-surface group-hover:text-surface transition-colors">
                  <svg
                    className="w-5 h-5 stroke-current fill-none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" x2="8" y1="13" y2="13"></line>
                    <line x1="16" x2="8" y1="17" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <span className="font-label-sm text-label-sm text-outline font-mono">ACT-03</span>
              </div>
              <div className="mt-space-md">
                <div className="font-body-md text-body-md font-semibold text-on-surface group-hover:text-primary transition-colors flex items-center justify-between">
                  <span>View Bookings</span>
                  <span className="material-symbols-outlined text-[16px] transform group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
                <p className="font-caption text-caption text-outline mt-1">
                  Verify incoming creator credentials, deposit receipts, and session telemetry.
                </p>
              </div>
            </Link>
          </div>
        </div>

        <div className="mb-space-xl">
          <div className="flex items-center justify-between mb-space-sm">
            <div className="flex items-center gap-space-sm">
              <h2 className="font-headline-sm text-headline-sm font-semibold tracking-tight text-on-surface">
                Upcoming Bookings
              </h2>
              <span className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-outline">
                3 SLOTS
              </span>
            </div>
            <Link
              className="font-body-sm text-body-sm text-primary hover:text-on-surface transition-colors flex items-center gap-1 font-medium"
              to="/provider/bookings"
            >
              <span>View all bookings</span>
              <span>→</span>
            </Link>
          </div>

          <div className="bg-surface-container-low rounded-xl overflow-hidden flex flex-col">
            <div className="p-space-md hover:bg-surface-container transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
              <div className="flex items-start sm:items-center gap-space-md">
                <div className="w-10 h-10 rounded bg-surface-container-lowest shrink-0 flex items-center justify-center font-label-md text-label-md text-outline">
                  01
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-body-md text-body-md font-semibold text-on-surface">
                      Echo Room Studio
                    </span>
                    <span className="font-label-sm text-label-sm text-outline font-mono">/ MAT-1029</span>
                  </div>
                  <div className="flex items-center gap-space-sm mt-0.5">
                    <span className="material-symbols-outlined text-[15px] text-outline">person</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Aarav Sharma</span>
                    <span className="text-surface-variant">•</span>
                    <span className="font-caption text-caption text-outline">Tech Talk Weekly</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-space-md lg:gap-space-xl">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-outline uppercase">DATE // SESSION</span>
                  <span className="font-body-sm text-body-sm font-medium text-on-surface">Oct 12, 2026</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-outline uppercase">TIME WINDOW</span>
                  <span className="font-label-md text-label-md text-on-surface font-mono">10:00 - 12:00</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-outline uppercase">GROSS AMOUNT</span>
                  <span className="font-label-md text-label-md font-medium text-on-surface font-mono">
                    ₹3,000
                  </span>
                </div>
                <div className="flex items-center gap-space-sm shrink-0">
                  <span className="font-label-sm text-label-sm px-2.5 py-1 rounded bg-tertiary/10 text-tertiary uppercase tracking-wider font-mono">
                    CONFIRMED
                  </span>
                  <button
                    className="w-8 h-8 rounded bg-surface-container-lowest hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors"
                    title="Inspect Booking"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">more_vert</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="h-px bg-surface-container-high w-full"></div>

            <div className="p-space-md hover:bg-surface-container transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
              <div className="flex items-start sm:items-center gap-space-md">
                <div className="w-10 h-10 rounded bg-surface-container-lowest shrink-0 flex items-center justify-center font-label-md text-label-md text-outline">
                  02
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-body-md text-body-md font-semibold text-on-surface">
                      Soundstage Precision
                    </span>
                    <span className="font-label-sm text-label-sm text-outline font-mono">/ MAT-1033</span>
                  </div>
                  <div className="flex items-center gap-space-sm mt-0.5">
                    <span className="material-symbols-outlined text-[15px] text-outline">person</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Priya Nair</span>
                    <span className="text-surface-variant">•</span>
                    <span className="font-caption text-caption text-outline">Venture Soundstage</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-space-md lg:gap-space-xl">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-outline uppercase">DATE // SESSION</span>
                  <span className="font-body-sm text-body-sm font-medium text-on-surface">Oct 14, 2026</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-outline uppercase">TIME WINDOW</span>
                  <span className="font-label-md text-label-md text-on-surface font-mono">15:00 - 18:00</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-outline uppercase">GROSS AMOUNT</span>
                  <span className="font-label-md text-label-md font-medium text-on-surface font-mono">
                    ₹5,400
                  </span>
                </div>
                <div className="flex items-center gap-space-sm shrink-0">
                  <span className="font-label-sm text-label-sm px-2.5 py-1 rounded bg-tertiary/10 text-tertiary uppercase tracking-wider font-mono">
                    CONFIRMED
                  </span>
                  <button
                    className="w-8 h-8 rounded bg-surface-container-lowest hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors"
                    title="Inspect Booking"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">more_vert</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="h-px bg-surface-container-high w-full"></div>

            <div className="p-space-md hover:bg-surface-container transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
              <div className="flex items-start sm:items-center gap-space-md">
                <div className="w-10 h-10 rounded bg-surface-container-lowest shrink-0 flex items-center justify-center font-label-md text-label-md text-outline">
                  03
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-body-md text-body-md font-semibold text-on-surface">
                      Echo Room Studio
                    </span>
                    <span className="font-label-sm text-label-sm text-outline font-mono">/ MAT-1041</span>
                  </div>
                  <div className="flex items-center gap-space-sm mt-0.5">
                    <span className="material-symbols-outlined text-[15px] text-outline">person</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Devan Mehta</span>
                    <span className="text-surface-variant">•</span>
                    <span className="font-caption text-caption text-outline">Audiobook Narration</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-space-md lg:gap-space-xl">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-outline uppercase">DATE // SESSION</span>
                  <span className="font-body-sm text-body-sm font-medium text-on-surface">Oct 16, 2026</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-outline uppercase">TIME WINDOW</span>
                  <span className="font-label-md text-label-md text-on-surface font-mono">11:00 - 13:00</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-outline uppercase">GROSS AMOUNT</span>
                  <span className="font-label-md text-label-md font-medium text-on-surface font-mono">
                    ₹3,000
                  </span>
                </div>
                <div className="flex items-center gap-space-sm shrink-0">
                  <span className="font-label-sm text-label-sm px-2.5 py-1 rounded bg-secondary-container/40 text-secondary-fixed uppercase tracking-wider font-mono">
                    PENDING
                  </span>
                  <button
                    className="w-8 h-8 rounded bg-surface-container-lowest hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors"
                    title="Inspect Booking"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">more_vert</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full bg-surface-container-low rounded-xl p-space-md mb-space-xl">
          <div className="flex items-center justify-between mb-space-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-tertiary">graphic_eq</span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface">
                LIVE CHANNEL FEED // BUS 1-4
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-outline font-mono">RACK-VCA ACTIVE</span>
          </div>

          <div className="space-y-2 font-mono text-[10px]">
            <div className="flex items-center gap-3">
              <span className="w-16 text-outline">MIC 01 [A]</span>
              <div className="flex-1 h-2 rounded bg-surface-container-lowest overflow-hidden flex">
                <div className="w-2/3 bg-tertiary"></div>
                <div className="w-1/6 bg-amber-500"></div>
                <div className="w-1/12 bg-primary"></div>
              </div>
              <span className="w-12 text-right text-on-surface-variant">-6 dB</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-16 text-outline">MIC 02 [B]</span>
              <div className="flex-1 h-2 rounded bg-surface-container-lowest overflow-hidden flex">
                <div className="w-1/2 bg-tertiary"></div>
                <div className="w-1/12 bg-amber-500"></div>
              </div>
              <span className="w-12 text-right text-on-surface-variant">-14 dB</span>
            </div>
          </div>
        </div>

        <div className="mt-space-md">
          <div className="flex items-center justify-between mb-space-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-outline">build</span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                BLUEPRINT PREVIEW: ZERO-STATE SIMULATION
              </span>
            </div>
            <button
              className="font-label-sm text-label-sm text-primary hover:underline uppercase"
              id="toggle-zerostate-btn"
              onClick={toggleZeroState}
              type="button"
            >
              {zeroStateVisible ? "Hide Preview" : "Show Preview"}
            </button>
          </div>

          {zeroStateVisible && (
            <div
              className="bg-surface-container-lowest rounded-xl p-space-xl flex flex-col items-center justify-center text-center transition-all duration-300"
              id="zerostate-container"
            >
              <div className="w-16 h-16 rounded-xl bg-surface-container-low flex items-center justify-center text-primary mb-space-md">
                <svg
                  className="w-8 h-8 stroke-current fill-none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" x2="12" y1="19" y2="22"></line>
                </svg>
              </div>
              <h3 className="font-headline-md text-headline-md font-semibold tracking-tight text-on-surface mb-2">
                Create your first studio
              </h3>
              <p className="font-body-md text-body-md text-outline max-w-md mb-space-lg">
                Add a studio so creators can discover and book your recording space.
              </p>
              <Link
                className="h-10 px-space-lg rounded-lg bg-primary-container hover:bg-inverse-primary text-on-primary-container hover:text-on-surface text-body-md font-medium transition-colors flex items-center gap-2"
                to="/provider/studios/new"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Add Studio</span>
              </Link>
              <div className="mt-space-lg flex items-center gap-4 text-outline font-label-sm text-label-sm uppercase">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check</span> Zero Onboarding Fee
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check</span> Instant Payout Routing
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check</span> Verified Podcasters
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ProviderDashboard;
