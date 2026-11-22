import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

function Home() {
  const { user, activeWorkspace } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardPath = () => {
    if (!user) return "/login";
    return activeWorkspace === "provider" ? "/provider/dashboard" : "/creator/dashboard";
  };

  const isProvider = user?.role === "provider" || activeWorkspace === "provider";

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
        <div className="h-16 max-w-7xl mx-auto px-margin-desktop flex items-center justify-between">
          <div className="flex items-center gap-space-lg">
            <Link className="flex items-center gap-space-sm text-on-surface" to="/">
              <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container">
                <span className="material-symbols-outlined text-[20px]">mic</span>
              </div>
              <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface uppercase font-semibold">
                PodSphere
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-space-md ml-space-md">
              <Link
                className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors px-space-sm py-space-xs"
                to="/creator/studios"
              >
                Browse Studios
              </Link>
              <a
                className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors px-space-sm py-space-xs"
                href="#how-it-works"
              >
                How It Works
              </a>
              {isProvider ? (
                <Link
                  className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors px-space-sm py-space-xs"
                  to="/provider/dashboard"
                >
                  For Providers
                </Link>
              ) : (
                <a
                  className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors px-space-sm py-space-xs"
                  href="#for-providers"
                >
                  For Providers
                </a>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-space-sm">
            {user ? (
              <Link
                className="hidden sm:flex h-9 px-space-md items-center justify-center font-body-sm text-body-sm text-on-surface bg-surface-container hover:bg-surface-container-high rounded-lg transition-colors gap-1.5"
                to={getDashboardPath()}
              >
                <span className="material-symbols-outlined text-[16px] text-tertiary">dashboard</span>
                <span>Console ({user.name ? user.name.split(" ")[0] : "Dashboard"})</span>
              </Link>
            ) : (
              <div className="hidden sm:flex items-center gap-space-sm">
                <Link
                  className="h-9 px-space-md flex items-center justify-center font-body-sm text-body-sm text-on-surface bg-surface-container hover:bg-surface-container-high rounded-lg transition-colors"
                  to="/login"
                >
                  Log In
                </Link>
                <Link
                  className="h-9 px-space-md flex items-center justify-center font-body-sm text-body-sm bg-primary-container text-on-primary-container hover:bg-secondary-container hover:text-on-secondary-container rounded-lg font-medium transition-colors"
                  to="/register"
                >
                  Register
                </Link>
              </div>
            )}
            <Link
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-space-xs"
              to={getDashboardPath()}
            >
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </Link>
            <button
              className="md:hidden text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg bg-surface-container ml-1 cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-surface-container-lowest border-b border-surface-container-high px-margin-desktop py-space-md flex flex-col gap-space-sm shadow-xl">
            <Link
              className="px-space-sm py-2 rounded-lg text-on-surface hover:bg-surface-container font-body-md text-body-md flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
              to="/creator/studios"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              <span>Browse Studios</span>
            </Link>
            <a
              className="px-space-sm py-2 rounded-lg text-on-surface hover:bg-surface-container font-body-md text-body-md flex items-center gap-2"
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="material-symbols-outlined text-[18px]">info</span>
              <span>How It Works</span>
            </a>
            {isProvider ? (
              <Link
                className="px-space-sm py-2 rounded-lg text-on-surface hover:bg-surface-container font-body-md text-body-md flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
                to="/provider/dashboard"
              >
                <span className="material-symbols-outlined text-[18px]">store</span>
                <span>For Providers</span>
              </Link>
            ) : (
              <a
                className="px-space-sm py-2 rounded-lg text-on-surface hover:bg-surface-container font-body-md text-body-md flex items-center gap-2"
                href="#for-providers"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-[18px]">store</span>
                <span>For Providers</span>
              </a>
            )}
            <div className="pt-2 border-t border-surface-container flex flex-col gap-2">
              {user ? (
                <Link
                  className="w-full py-2 px-space-sm rounded-lg bg-surface-container text-on-surface text-center font-body-sm font-medium flex items-center justify-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                  to={getDashboardPath()}
                >
                  <span className="material-symbols-outlined text-[18px] text-tertiary">dashboard</span>
                  <span>Dashboard Console</span>
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    className="py-2 rounded-lg bg-surface-container text-on-surface text-center font-body-sm"
                    onClick={() => setMobileMenuOpen(false)}
                    to="/login"
                  >
                    Log In
                  </Link>
                  <Link
                    className="py-2 rounded-lg bg-primary-container text-on-primary-container text-center font-body-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                    to="/register"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="w-full pt-16 bg-surface min-h-[calc(100vh-80px)]">
        <div className="flex flex-col w-full">
          <section className="relative w-full overflow-hidden bg-surface-container-lowest py-space-xl md:py-24">
            <div className="relative max-w-7xl mx-auto px-margin-desktop">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-center">
                <div className="lg:col-span-7 flex flex-col items-start space-y-space-md">
                  <div className="flex items-center gap-space-sm px-2.5 py-1 bg-surface-container rounded font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
                    <span>Verified Podcast Studio Network</span>
                  </div>
                  <h1 className="font-headline-xl text-headline-xl text-on-surface font-semibold tracking-tight max-w-2xl">
                    Find the right studio for your next episode.
                  </h1>
                  <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl font-normal">
                    PodSphere connects podcast creators with recording studios so you can discover a space, compare rates, and book your session.
                  </p>
                  <div className="flex flex-wrap items-center gap-space-md pt-space-sm w-full sm:w-auto">
                    <Link
                      className="h-[42px] px-space-lg flex items-center justify-center bg-primary-container text-on-primary-container hover:bg-secondary-container rounded-xl font-body-md text-body-md font-medium transition-colors shadow-sm"
                      to="/creator/studios"
                    >
                      Browse Studios
                    </Link>
                    <Link
                      className="h-[42px] px-space-lg flex items-center justify-center bg-surface-container-high text-on-surface hover:bg-surface-variant rounded-xl font-body-md text-body-md font-medium transition-colors shadow-sm"
                      to={isProvider ? "/provider/studios/new" : "/register"}
                    >
                      List Your Studio
                    </Link>
                  </div>

                  <div className="pt-space-lg grid grid-cols-3 gap-gutter w-full max-w-lg">
                    <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Acoustics</span>
                      <span className="font-body-md text-body-md font-medium text-on-surface">Treated Booths</span>
                    </div>
                    <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Equipment</span>
                      <span className="font-body-md text-body-md font-medium text-on-surface">Pro Audio Gear</span>
                    </div>
                    <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Booking Mode</span>
                      <span className="font-body-md text-body-md font-medium text-on-surface">Direct Schedule</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 flex justify-center lg:justify-end mt-space-lg lg:mt-0">
                  <div className="w-full max-w-md bg-surface-container-low rounded-xl overflow-hidden shadow-xl transition-all">
                    <div className="relative h-56 w-full overflow-hidden bg-surface-container">
                      <img
                        className="w-full h-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCw4PIrLPmOCbYeQtk3oslrsn24gFFAZ9mSHI93sbWoXEp2AdK05of05hatH_5UWfBma51faaJWCDqvOsvVT0VIaDFj1w5gAH7pCHjV0ZuK-xqmrlYvDbNIb105zRwzGh_Z1sikeI7oRlMTMvm5oYLWORDpxPb3rAtqBKHPRSOgGRfp6i51Sl7Cx1gwIha3g863zZF80OEDdiRZ5aMX4ES9Tz_mvpgL8ijAVko8iBl8tyl2cHu752g"
                        alt="Echo Room Studio"
                      />
                      <div className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-sm px-2.5 py-1 rounded font-label-sm text-label-sm text-tertiary uppercase flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                        <span>Available Now</span>
                      </div>
                      <div className="absolute bottom-3 right-3 bg-surface-container-lowest/90 backdrop-blur-sm px-2.5 py-1 rounded font-label-sm text-label-sm text-on-surface-variant">
                        DELHI
                      </div>
                    </div>

                    <div className="p-space-lg flex flex-col space-y-space-md">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Echo Room Studio</h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="material-symbols-outlined text-[16px] text-primary-container">location_on</span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">Delhi</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">₹1,500</div>
                          <div className="font-caption text-caption text-on-surface-variant">per hour</div>
                        </div>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Professional podcast setup with treated acoustic isolation.
                      </p>

                      <div className="flex items-center gap-space-sm py-space-xs bg-surface-container px-3 rounded-lg text-on-surface">
                        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">settings_voice</span>
                        <span className="font-label-md text-label-md text-on-surface">4 microphones</span>
                        <span className="text-outline-variant font-label-md">·</span>
                        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">videocam</span>
                        <span className="font-label-md text-label-md text-on-surface">2 cameras</span>
                      </div>

                      <Link
                        className="w-full h-10 flex items-center justify-center bg-surface-container-highest hover:bg-surface-variant text-on-surface rounded-xl font-body-sm text-body-sm font-medium transition-colors"
                        to="/creator/studios"
                      >
                        Browse Studios
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="how-it-works" className="w-full py-space-xl bg-surface">
            <div className="max-w-7xl mx-auto px-margin-desktop">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-xl gap-space-md">
                <div>
                  <span className="font-label-sm text-label-sm text-primary-container uppercase tracking-wider block mb-space-xs">Simple Booking Process</span>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">How it works</h2>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                  Book verified recording studios in three straightforward steps.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter-desktop">
                <div className="bg-surface-container-low p-space-lg rounded-xl flex flex-col justify-between h-full shadow-sm group hover:bg-surface-container transition-colors">
                  <div className="flex items-center justify-between mb-space-lg">
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">STEP 01</span>
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface group-hover:text-primary-container transition-colors">
                      <span className="material-symbols-outlined text-[20px]">search</span>
                    </div>
                  </div>
                  <div className="space-y-space-xs mb-space-lg">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Find a studio</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Browse spaces by location, equipment, and hourly rate.
                    </p>
                  </div>
                </div>

                <div className="bg-surface-container-low p-space-lg rounded-xl flex flex-col justify-between h-full shadow-sm group hover:bg-surface-container transition-colors">
                  <div className="flex items-center justify-between mb-space-lg">
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">STEP 02</span>
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface group-hover:text-primary-container transition-colors">
                      <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                    </div>
                  </div>
                  <div className="space-y-space-xs mb-space-lg">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Choose your time</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Select your recording date and session hours with transparent pricing.
                    </p>
                  </div>
                </div>

                <div className="bg-surface-container-low p-space-lg rounded-xl flex flex-col justify-between h-full shadow-sm group hover:bg-surface-container transition-colors">
                  <div className="flex items-center justify-between mb-space-lg">
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">STEP 03</span>
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface group-hover:text-primary-container transition-colors">
                      <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    </div>
                  </div>
                  <div className="space-y-space-xs mb-space-lg">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Book your session</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Receive instant booking confirmation and access details.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="for-providers" className="w-full py-space-xl bg-surface-container-lowest">
            <div className="max-w-7xl mx-auto px-margin-desktop">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-center">
                <div className="lg:col-span-6 flex flex-col space-y-space-lg">
                  <div>
                    <span className="font-label-sm text-label-sm text-primary-container uppercase tracking-wider block mb-space-xs">Facility Management</span>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">For studio providers</h2>
                  </div>
                  <div className="space-y-space-md">
                    <div className="flex items-start gap-space-md bg-surface-container-low p-space-md rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container shrink-0">
                        <span className="material-symbols-outlined text-[18px]">add_business</span>
                      </div>
                      <div>
                        <h3 className="font-body-lg text-body-lg font-medium text-on-surface">List your studio</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                          Create a studio listing with pricing, location, and equipment.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-space-md bg-surface-container-low p-space-md rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container shrink-0">
                        <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
                      </div>
                      <div>
                        <h3 className="font-body-lg text-body-lg font-medium text-on-surface">Manage your spaces</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                          Edit your studio information whenever needed.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-space-md bg-surface-container-low p-space-md rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container shrink-0">
                        <span className="material-symbols-outlined text-[18px]">monitoring</span>
                      </div>
                      <div>
                        <h3 className="font-body-lg text-body-lg font-medium text-on-surface">Track bookings</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                          Review upcoming reservations from your provider dashboard.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-6">
                  <div className="bg-surface-container-low rounded-xl p-space-lg shadow-lg flex flex-col space-y-space-md">
                    <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-[18px] text-primary-container">dashboard</span>
                        <span className="font-label-sm text-label-sm text-on-surface uppercase font-semibold">PROVIDER DASHBOARD PREVIEW</span>
                      </div>
                      <span className="font-label-sm text-label-sm bg-surface-container px-2 py-0.5 rounded text-tertiary">ACTIVE</span>
                    </div>

                    <div className="grid grid-cols-2 gap-space-sm">
                      <div className="bg-surface-container-lowest p-space-sm rounded-lg">
                        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Studio Status</span>
                        <div className="font-body-lg text-body-lg font-semibold text-tertiary mt-1">Live &amp; Bookable</div>
                      </div>
                      <div className="bg-surface-container-lowest p-space-sm rounded-lg">
                        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Instant Calendar</span>
                        <div className="font-body-lg text-body-lg font-semibold text-on-surface mt-1">Confirmed Slots</div>
                      </div>
                    </div>

                    <Link
                      className="w-full h-10 flex items-center justify-center bg-primary-container hover:bg-secondary-container text-on-primary-container rounded-xl font-body-sm text-body-sm font-medium transition-colors"
                      to={isProvider ? "/provider/studios" : "/register"}
                    >
                      {isProvider ? "Go to Studio Management" : "List Your Studio"}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="w-full py-20 bg-surface text-center">
            <div className="max-w-4xl mx-auto px-margin-desktop flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary-container mb-space-md shadow-sm">
                <span className="material-symbols-outlined text-[28px]">graphic_eq</span>
              </div>
              <h2 className="font-headline-xl text-headline-xl text-on-surface font-semibold tracking-tight max-w-2xl mb-space-md">
                Ready to find a recording space?
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-lg mb-space-lg">
                Explore studios in Delhi, Mumbai, and Bengaluru with certified audio gear.
              </p>
              <Link
                className="h-[42px] px-space-xl flex items-center justify-center bg-primary-container text-on-primary-container hover:bg-secondary-container rounded-xl font-body-md text-body-md font-medium transition-colors shadow-sm"
                to="/creator/studios"
              >
                Browse Studios
              </Link>
            </div>
          </section>
        </div>
      </main>

      <footer className="w-full bg-surface-container-lowest py-space-xl border-t border-surface-container-high">
        <div className="max-w-7xl mx-auto px-margin-desktop flex flex-col md:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm">
            <div className="w-6 h-6 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container">
              <span className="material-symbols-outlined text-[16px]">mic</span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              © 2026 PodSphere. Studio booking platform for podcast creators and hosts.
            </span>
          </div>
          <div className="flex items-center gap-space-lg font-caption text-caption text-on-surface-variant">
            <Link to="/creator/studios" className="hover:text-on-surface transition-colors">Studios</Link>
            <Link to="/login" className="hover:text-on-surface transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-on-surface transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
