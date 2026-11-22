import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function DashboardLayout({ children, activePath }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, activeWorkspace, switchWorkspace, hasProviderAccess } = useAuth();

  const currentPath = activePath || location.pathname;

  const isProviderWorkspace =
    currentPath.startsWith("/provider") || activeWorkspace === "provider";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setWorkspaceDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isActive = (path) => {
    if (path === "/provider/studios" && (currentPath === "/provider/studios" || currentPath.endsWith("/edit"))) {
      return true;
    }
    if (path === "/creator/studios" && (currentPath.startsWith("/creator/studios") || currentPath.startsWith("/studios"))) {
      return true;
    }
    return currentPath === path;
  };

  const navLinkClass = (path) => {
    if (isActive(path)) {
      return "flex items-center gap-space-sm px-space-sm py-2 rounded-lg transition-colors bg-surface-container-high text-primary border-l-2 border-primary-container font-medium";
    }
    return "flex items-center gap-space-sm px-space-sm py-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors";
  };

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const handleSelectWorkspace = (target) => {
    setWorkspaceDropdownOpen(false);
    setMobileMenuOpen(false);
    switchWorkspace(target);
    if (target === "provider") {
      navigate("/provider/dashboard");
    } else {
      navigate("/creator/dashboard");
    }
  };

  const userName = user?.name || "User";
  const userEmail = user?.email || "";
  const userRole = (user?.role || "CREATOR").toUpperCase();

  const getPageTitle = () => {
    if (currentPath.includes("/studios/new")) return "Create Studio";
    if (currentPath.includes("/edit")) return "Edit Studio";
    if (currentPath.includes("/studios")) return isProviderWorkspace ? "My Studios" : "Browse Studios";
    if (currentPath.includes("/bookings")) return isProviderWorkspace ? "Provider Bookings" : "My Bookings";
    if (currentPath.includes("/dashboard")) return "Dashboard";
    return "Console";
  };

  return (
    <div className="bg-background font-body-md text-body-md text-on-surface antialiased min-h-screen">
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-surface-container-lowest z-50 flex flex-col justify-between border-r border-surface-container-high transition-transform duration-200 md:translate-x-0 overflow-y-auto ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col">
          <div className="h-14 px-space-md flex items-center justify-between border-b border-surface-container-high bg-surface-container-low/50 shrink-0">
            <Link
              to="/"
              className="flex items-center gap-space-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[20px]">podcasts</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-body-md font-semibold text-on-surface tracking-tight leading-none">
                  PodSphere
                </span>
                <span className="font-label-sm text-[10px] text-outline tracking-wider uppercase mt-0.5">
                  Studio Network
                </span>
              </div>
            </Link>
            <button
              className="md:hidden text-on-surface-variant hover:text-on-surface p-1 rounded cursor-pointer"
              onClick={() => setMobileMenuOpen(false)}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div className="p-space-sm border-b border-surface-container-high/60 relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high transition-all text-left cursor-pointer shadow-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isProviderWorkspace ? "bg-tertiary/20 text-tertiary" : "bg-primary-container/20 text-primary"
                }`}>
                  <span className="material-symbols-outlined text-[17px]">
                    {isProviderWorkspace ? "meeting_room" : "mic"}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-sm text-[11px] font-bold text-on-surface uppercase tracking-wider truncate">
                    {isProviderWorkspace ? "Provider Console" : "Creator Workspace"}
                  </span>
                  <span className="font-caption text-[10px] text-outline truncate">
                    {isProviderWorkspace ? "Host & Facility Tools" : "Discover & Book"}
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[18px] text-outline shrink-0">
                unfold_more
              </span>
            </button>

            {workspaceDropdownOpen && (
              <div className="absolute top-full left-2 right-2 mt-1 z-50 bg-surface-container-lowest border border-surface-container-high rounded-xl shadow-2xl p-2 flex flex-col gap-1.5">
                <div className="px-2 py-1 text-[10px] font-label-sm text-outline uppercase tracking-wider">
                  Switch Workspace
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectWorkspace("creator")}
                  className={`flex flex-col gap-1 p-2 rounded-lg transition-colors text-left cursor-pointer border ${
                    !isProviderWorkspace
                      ? "bg-surface-container-high border-primary-container/50 text-on-surface"
                      : "border-transparent hover:bg-surface-container text-on-surface-variant"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-label-sm text-xs font-semibold text-on-surface">
                      <span className="material-symbols-outlined text-[16px] text-primary">mic</span>
                      <span>CREATOR WORKSPACE</span>
                    </div>
                    {!isProviderWorkspace && (
                      <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                    )}
                  </div>
                  <ul className="text-[11px] text-outline pl-5 list-disc space-y-0.5">
                    <li>Creator Dashboard</li>
                    <li>Browse Studios</li>
                    <li>My Bookings</li>
                  </ul>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectWorkspace("provider")}
                  className={`flex flex-col gap-1 p-2 rounded-lg transition-colors text-left cursor-pointer border ${
                    isProviderWorkspace
                      ? "bg-surface-container-high border-tertiary/50 text-on-surface"
                      : "border-transparent hover:bg-surface-container text-on-surface-variant"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-label-sm text-xs font-semibold text-on-surface">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">meeting_room</span>
                      <span>PROVIDER CONSOLE</span>
                    </div>
                    {isProviderWorkspace ? (
                      <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                    ) : !hasProviderAccess ? (
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-tertiary/20 text-tertiary font-mono">
                        ACTIVATE
                      </span>
                    ) : null}
                  </div>
                  <ul className="text-[11px] text-outline pl-5 list-disc space-y-0.5">
                    <li>Provider Dashboard</li>
                    <li>My Studios</li>
                    <li>Provider Bookings</li>
                  </ul>
                </button>
              </div>
            )}
          </div>

          <div className="px-space-sm py-space-sm">
            {isProviderWorkspace ? (
              <>
                <div className="px-space-sm py-space-xs font-label-sm text-label-sm uppercase tracking-wider text-outline flex items-center justify-between">
                  <span>Provider Management</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-container font-mono text-tertiary">HOST</span>
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

                <div className="mt-4 pt-3 border-t border-surface-container-high/60">
                  <button
                    type="button"
                    onClick={() => handleSelectWorkspace("creator")}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-surface-container/50 hover:bg-surface-container text-xs text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-primary">mic</span>
                      <span>Go to Creator Workspace</span>
                    </span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="px-space-sm py-space-xs font-label-sm text-label-sm uppercase tracking-wider text-outline flex items-center justify-between">
                  <span>Creator Workspace</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-container font-mono text-primary">RECORD</span>
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

                <div className="mt-4 pt-3 border-t border-surface-container-high/60">
                  <button
                    type="button"
                    onClick={() => handleSelectWorkspace("provider")}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-surface-container/50 hover:bg-surface-container text-xs text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-tertiary">meeting_room</span>
                      <span>Switch to Provider Console</span>
                    </span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="p-space-sm border-t border-surface-container-high bg-surface-container-low/40 shrink-0">
          <div className="flex items-center justify-between p-space-xs rounded-lg bg-surface-container-low">
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-body-sm text-body-sm font-medium text-on-surface truncate">
                    {userName}
                  </span>
                  <span className="font-label-sm text-label-sm px-1 py-0.5 rounded bg-secondary-container/40 text-secondary-fixed border border-secondary-container text-[9px] uppercase tracking-wider">
                    {userRole}
                  </span>
                </div>
                <span className="font-caption text-caption text-outline truncate">
                  {userEmail}
                </span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded transition-colors shrink-0 cursor-pointer"
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

      <div className="md:pl-64">
        <header className="fixed top-0 left-0 md:left-64 right-0 h-14 bg-surface/90 backdrop-blur-md z-40 border-b border-surface-container-high flex items-center justify-between px-space-md md:px-space-lg">
          <div className="flex items-center gap-space-md min-w-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-on-surface-variant hover:text-on-surface cursor-pointer p-1"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">menu</span>
            </button>
            <div className="flex items-center gap-space-xs font-label-md text-label-md text-outline truncate">
              <span className="material-symbols-outlined text-[16px] text-primary">terminal</span>
              <span className="text-on-surface-variant uppercase">{isProviderWorkspace ? "PROVIDER" : "CREATOR"}</span>
              <span className="text-surface-variant">/</span>
              <span className="text-on-surface font-medium uppercase truncate">
                {getPageTitle()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm">
            <button
              type="button"
              onClick={() => handleSelectWorkspace(isProviderWorkspace ? "creator" : "provider")}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high border border-surface-container-high text-xs text-on-surface transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px] text-tertiary">swap_horiz</span>
              <span>{isProviderWorkspace ? "Switch to Creator" : "Switch to Provider"}</span>
            </button>
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
