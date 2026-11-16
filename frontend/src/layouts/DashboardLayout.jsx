import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function DashboardLayout({ children, activePath }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = activePath || location.pathname;

  const isActive = (path) => {
    if (path === "/provider/studios" && currentPath.startsWith("/provider/studios")) {
      return true;
    }
    return currentPath === path;
  };

  const navLinkClass = (path) => {
    if (isActive(path)) {
      return "flex items-center gap-space-sm px-space-sm py-space-xs rounded-lg transition-colors bg-surface-container-high text-primary border-l-2 border-primary-container font-medium";
    }
    return "flex items-center gap-space-sm px-space-sm py-space-xs rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors";
  };

  const handleSignOut = () => {
    navigate("/login");
  };

  return (
    <div className="bg-background font-body-md text-body-md text-on-surface antialiased min-h-screen">
      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-surface-container-lowest z-50 flex flex-col justify-between border-r border-surface-container-high transition-transform duration-200 md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col">
          <Link
            to="/"
            className="h-14 px-space-md flex items-center gap-space-sm border-b border-surface-container-high bg-surface-container-low/50"
          >
            <div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[20px]">podcasts</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-body-md font-semibold text-on-surface tracking-tight leading-none">
                PodSphere
              </span>
              <span className="font-label-sm text-label-sm text-outline tracking-wider uppercase mt-0.5">
                STUDIO MATRIX / MVP
              </span>
            </div>
          </Link>

          <div className="px-space-sm py-space-sm">
            <div className="px-space-sm py-space-xs font-label-sm text-label-sm uppercase tracking-wider text-outline">
              Provider Unit
            </div>
            <nav className="flex flex-col gap-1">
              <Link
                to="/provider/dashboard"
                className={navLinkClass("/provider/dashboard")}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-[18px]">dashboard</span>
                <span className="font-body-sm text-body-sm">Dashboard</span>
              </Link>
              <Link
                to="/provider/studios"
                className={navLinkClass("/provider/studios")}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-[18px]">meeting_room</span>
                <span className="font-body-sm text-body-sm">My Studios</span>
              </Link>
              <Link
                to="/provider/bookings"
                className={navLinkClass("/provider/bookings")}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                <span className="font-body-sm text-body-sm">Bookings</span>
              </Link>
            </nav>

            <div className="mt-space-md px-space-sm py-space-xs font-label-sm text-label-sm uppercase tracking-wider text-outline">
              Creator Unit
            </div>
            <nav className="flex flex-col gap-1">
              <Link
                to="/creator/dashboard"
                className={navLinkClass("/creator/dashboard")}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-[18px]">speed</span>
                <span className="font-body-sm text-body-sm">Dashboard</span>
              </Link>
              <Link
                to="/creator/studios"
                className={navLinkClass("/creator/studios")}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-[18px]">search</span>
                <span className="font-body-sm text-body-sm">Browse Studios</span>
              </Link>
              <Link
                to="/creator/bookings"
                className={navLinkClass("/creator/bookings")}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-[18px]">event_available</span>
                <span className="font-body-sm text-body-sm">My Bookings</span>
              </Link>
            </nav>
          </div>
        </div>

        <div className="p-space-sm border-t border-surface-container-high bg-surface-container-low/40">
          <div className="flex items-center justify-between p-space-xs rounded-lg bg-surface-container-low">
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-body-sm text-body-sm font-medium text-on-surface truncate">
                    Marcus Vance
                  </span>
                  <span className="font-label-sm text-label-sm px-1 py-0.5 rounded bg-secondary-container/40 text-secondary-fixed border border-secondary-container text-[9px] uppercase tracking-wider">
                    PROVIDER
                  </span>
                </div>
                <span className="font-caption text-caption text-outline truncate">
                  marcus@soundgrid.io
                </span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded transition-colors shrink-0"
              title="Sign out"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="md:pl-60">
        <header className="fixed top-0 left-0 md:left-60 right-0 h-14 bg-surface/90 backdrop-blur-md z-40 border-b border-surface-container-high flex items-center justify-between px-space-md md:px-space-lg">
          <div className="flex items-center gap-space-md">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-on-surface-variant hover:text-on-surface"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">menu</span>
            </button>
            <div className="flex items-center gap-space-xs font-label-md text-label-md text-outline">
              <span className="material-symbols-outlined text-[16px]">terminal</span>
              <span className="text-on-surface-variant">CONSOLE</span>
              <span className="text-surface-variant">/</span>
              <span className="text-on-surface font-medium">ACTIVE SESSION</span>
            </div>
          </div>
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-2 px-space-sm py-1 rounded bg-surface-container-low border border-surface-container-high">
              <span className="h-2 w-2 rounded-full bg-tertiary animate-pulse"></span>
              <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-wider">
                API ONLINE / v1.0
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-space-sm py-1 rounded bg-surface-container-low border border-surface-container-high font-label-sm text-label-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px] text-primary">network_ping</span>
              <span>24MS</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </header>

        <main className="relative pt-14 bg-background w-full px-4 sm:px-8 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
