import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [role, setRole] = useState("creator");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [meterValue, setMeterValue] = useState("-14.2 dBFS");
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      const rand = (-16 + Math.random() * 4).toFixed(1);
      setMeterValue(`${rand} dBFS`);
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const isPasswordValid = password.length >= 8;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName || !email || !isPasswordValid) {
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsActivated(true);
      setTimeout(() => {
        if (role === "provider") {
          navigate("/provider/dashboard");
        } else {
          navigate("/creator/bookings");
        }
      }, 1000);
    }, 900);
  };

  return (
    <main className="w-full min-h-screen flex items-center justify-center bg-surface p-margin-desktop">
      <div className="flex flex-col w-full max-w-6xl mx-auto py- space-y-space-xl">
        <div className="flex flex-wrap items-center justify-between gap-gutter px-margin">
          <div className="flex items-center gap-space-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse"></div>
            <span className="font-label-sm text-label-sm tracking-widest text-on-surface-variant uppercase">
              SYSTEM CALIBRATION // REGISTRATION MATRIX
            </span>
          </div>
          <div className="flex items-center gap-space-md">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
              LATENCY: 0.12MS
            </span>
            <span className="font-label-sm text-label-sm text-outline">|</span>
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
              SECURITY: TLS 1.3 REC-709
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-start">
          <div className="lg:col-span-5 flex flex-col space-y-space-lg">
            <div className="bg-surface-container-low rounded-xl p-space-lg shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-space-md">
                <div className="flex items-center gap-space-xs">
                  <div className="w-2 h-2 rounded-full bg-surface-variant"></div>
                  <div className="w-2 h-2 rounded-full bg-surface-variant"></div>
                  <span className="font-label-sm text-label-sm text-on-surface uppercase pl-space-xs tracking-wider">
                    PODSPHERE MASTER CONSOLE
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-tertiary bg-surface-container-highest px-space-sm py-0.5 rounded">
                  ONLINE
                </span>
              </div>

              <div className="relative w-full h-56 rounded-lg overflow-hidden my-space-md bg-surface-container-lowest">
                <img
                  className="w-full h-full object-cover mix-blend-luminosity opacity-80"
                  alt="Broadcast console"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEvzgoHSksFevM3QCZlQq8ygmEOfw03mZjThQWh83DqG_tAJzF2RItFmwXHi2JOWiKI-vG5S4p3AxA8VEb9758c44wtXU2e98yYY6OJSoIi6Q3rRzxe4UvANREjxF2Y_XgXtz2LRskBgoErA3k-PqdkBu7HHBZXSInp7jus8PxyF63PAGLbo7hwYoDf_6PmfwzUe8Cgcl-j4Kq5lgMUqwLv5emA3PIwi3IOZh2HygFpd9CXjlbjF0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/40 to-transparent"></div>
                <div className="absolute bottom-space-md left-space-md right-space-md flex justify-between items-end">
                  <div>
                    <div className="font-label-sm text-label-sm text-primary uppercase">ROUTING ENGINE</div>
                    <div className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                      Soundstage Precision
                    </div>
                  </div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant">STAGE-01</div>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-space-md rounded-lg space-y-space-xs">
                <div className="flex justify-between items-center text-label-sm font-label-sm text-outline">
                  <span>INPUT BUS PEAK</span>
                  <span className="text-tertiary" id="vuMeterValue">{meterValue}</span>
                </div>
                <div className="grid grid-cols-12 gap-1 h-2 w-full pt-1" id="vuMeterBars">
                  <div className="bg-tertiary rounded-xs h-full"></div>
                  <div className="bg-tertiary rounded-xs h-full"></div>
                  <div className="bg-tertiary rounded-xs h-full"></div>
                  <div className="bg-tertiary rounded-xs h-full"></div>
                  <div className="bg-tertiary rounded-xs h-full"></div>
                  <div className="bg-tertiary rounded-xs h-full"></div>
                  <div className="bg-tertiary rounded-xs h-full"></div>
                  <div className="bg-tertiary rounded-xs h-full"></div>
                  <div className="bg-secondary-fixed rounded-xs h-full"></div>
                  <div className="bg-secondary-fixed rounded-xs h-full"></div>
                  <div className="bg-surface-variant rounded-xs h-full"></div>
                  <div className="bg-surface-variant rounded-xs h-full"></div>
                </div>
              </div>

              <div className="pt-space-md space-y-space-sm text-body-sm font-body-sm text-on-surface-variant">
                <div className="flex items-start gap-space-sm">
                  <span className="material-symbols-outlined text-primary text-base mt-0.5">verified_user</span>
                  <span>Zero-latency audio workflow validation and hardware gear synchronization.</span>
                </div>
                <div className="flex items-start gap-space-sm">
                  <span className="material-symbols-outlined text-primary text-base mt-0.5">tune</span>
                  <span>Independent monitor feeds and dynamic engineer routing capabilities.</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-space-md flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-outline">graphic_eq</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  ACTIVE NODES
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">1,482 LIVE PODS</span>
            </div>
          </div>

          <div className="lg:col-span-7 bg-surface-container rounded-xl p-space-lg lg:p-space-xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="space-y-space-xs mb-space-lg">
                <div className="font-label-sm text-label-sm text-primary uppercase tracking-widest">
                  ACCESS PROVISIONING
                </div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">
                  Create your PodSphere account
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Choose your platform role to get started.
                </p>
              </div>

              <form className="space-y-space-lg" id="registrationForm" onSubmit={handleSubmit}>
                <div className="space-y-space-sm">
                  <div className="flex justify-between items-center">
                    <label className="font-label-md text-label-md uppercase tracking-wider text-on-surface">
                      Platform Role
                    </label>
                    <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                      SELECT ONE
                    </span>
                  </div>

                  <div aria-label="Platform role selector" className="grid grid-cols-1 md:grid-cols-2 gap-space-md" role="radiogroup">
                    <label
                      className={`relative flex flex-col justify-between p-space-md rounded-lg cursor-pointer transition-all duration-150 ${
                        role === "creator"
                          ? "bg-surface-bright"
                          : "bg-surface-container-high hover:bg-surface-bright"
                      }`}
                      id="roleCardCreator"
                      onClick={() => setRole("creator")}
                    >
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined text-xl">mic</span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            role === "creator" ? "bg-primary-container" : "bg-surface-variant"
                          }`}
                          id="radioIndicatorCreator"
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              role === "creator" ? "bg-on-surface" : "bg-transparent"
                            }`}
                            id="radioDotCreator"
                          ></div>
                        </div>
                      </div>
                      <div className="mt-space-md space-y-space-xs">
                        <div className="flex items-center gap-space-xs">
                          <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                            Creator
                          </span>
                          <span className="font-label-sm text-label-sm text-outline px-1.5 py-0.5 bg-surface-container rounded uppercase">
                            TALENT
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface font-medium">
                          Find and book studios for your podcast.
                        </p>
                        <p className="font-caption text-caption text-on-surface-variant">
                          Discover verified recording environments and manage sessions.
                        </p>
                      </div>
                      <input
                        checked={role === "creator"}
                        className="sr-only"
                        name="role"
                        type="radio"
                        value="creator"
                        onChange={() => setRole("creator")}
                      />
                    </label>

                    <label
                      className={`relative flex flex-col justify-between p-space-md rounded-lg cursor-pointer transition-all duration-150 ${
                        role === "provider"
                          ? "bg-surface-bright"
                          : "bg-surface-container-high hover:bg-surface-bright"
                      }`}
                      id="roleCardProvider"
                      onClick={() => setRole("provider")}
                    >
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-outline">
                          <span className="material-symbols-outlined text-xl">podium</span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            role === "provider" ? "bg-primary-container" : "bg-surface-variant"
                          }`}
                          id="radioIndicatorProvider"
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              role === "provider" ? "bg-on-surface" : "bg-transparent"
                            }`}
                            id="radioDotProvider"
                          ></div>
                        </div>
                      </div>
                      <div className="mt-space-md space-y-space-xs">
                        <div className="flex items-center gap-space-xs">
                          <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                            Provider
                          </span>
                          <span className="font-label-sm text-label-sm text-outline px-1.5 py-0.5 bg-surface-container rounded uppercase">
                            HOST
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface font-medium">
                          List your studio and manage incoming bookings.
                        </p>
                        <p className="font-caption text-caption text-on-surface-variant">
                          Host creators, configure studio gear, and track studio schedule.
                        </p>
                      </div>
                      <input
                        checked={role === "provider"}
                        className="sr-only"
                        name="role"
                        type="radio"
                        value="provider"
                        onChange={() => setRole("provider")}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-space-md pt-space-xs">
                  <div className="space-y-1">
                    <label className="block font-label-md text-label-md uppercase tracking-wider text-on-surface" htmlFor="fullName">
                      Full name
                    </label>
                    <div className="relative">
                      <input
                        className="w-full h-10 px-space-md bg-surface-container-lowest text-on-surface placeholder-outline font-body-md text-body-md rounded-lg focus:outline-none focus:bg-surface-container-low transition-colors"
                        id="fullName"
                        placeholder="e.g. Jordan Miller"
                        required
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                      <span className="material-symbols-outlined absolute right-3 top-2.5 text-outline text-lg pointer-events-none">
                        badge
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-label-md text-label-md uppercase tracking-wider text-on-surface" htmlFor="email">
                      Email
                    </label>
                    <div className="relative">
                      <input
                        className="w-full h-10 px-space-md bg-surface-container-lowest text-on-surface placeholder-outline font-body-md text-body-md rounded-lg focus:outline-none focus:bg-surface-container-low transition-colors"
                        id="email"
                        placeholder="engineer@domain.com"
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <span className="material-symbols-outlined absolute right-3 top-2.5 text-outline text-lg pointer-events-none">
                        alternate_email
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block font-label-md text-label-md uppercase tracking-wider text-on-surface" htmlFor="password">
                        Password
                      </label>
                      <div
                        className={`flex items-center gap-1 font-label-sm text-label-sm ${
                          isPasswordValid ? "text-tertiary" : "text-outline"
                        }`}
                        id="charRequirement"
                      >
                        <span
                          className="material-symbols-outlined text-sm"
                          id="charIcon"
                          style={{ fontVariationSettings: isPasswordValid ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          {isPasswordValid ? "check_circle" : "radio_button_unchecked"}
                        </span>
                        <span id="charText">
                          {isPasswordValid ? "8+ CHARACTERS VERIFIED" : "MIN 8 CHARACTERS"}
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        className="w-full h-10 px-space-md bg-surface-container-lowest text-on-surface placeholder-outline font-body-md text-body-md rounded-lg focus:outline-none focus:bg-surface-container-low transition-colors tracking-widest"
                        id="password"
                        minLength={8}
                        placeholder="••••••••••••"
                        required
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        aria-label="Toggle password view"
                        className="absolute right-3 top-2.5 text-outline hover:text-on-surface transition-colors focus:outline-none"
                        onClick={togglePasswordVisibility}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-lg" id="passToggleIcon">
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-space-sm space-y-space-md">
                  <button
                    className={`w-full h-11 text-on-surface font-headline-sm text-body-lg font-semibold rounded-lg flex items-center justify-center gap-space-sm transition-colors duration-150 shadow-md active:opacity-90 disabled:opacity-75 ${
                      isActivated
                        ? "bg-tertiary-container"
                        : "bg-primary-container hover:bg-inverse-primary"
                    }`}
                    type="submit"
                    disabled={isSubmitting || isActivated}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                        <span>PROVISIONING ACCOUNT...</span>
                      </>
                    ) : isActivated ? (
                      <>
                        <span className="material-symbols-outlined text-lg">check</span>
                        <span>ACCOUNT ACTIVATED</span>
                      </>
                    ) : (
                      <>
                        <span>Create account</span>
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between pt-space-xs">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Already have an account?
                    </span>
                    <Link
                      className="font-body-sm text-body-sm text-primary hover:text-on-surface font-medium flex items-center gap-1 transition-colors"
                      to="/login"
                    >
                      <span>Log in</span>
                      <span className="material-symbols-outlined text-sm">login</span>
                    </Link>
                  </div>
                </div>
              </form>
            </div>

            <div className="mt-space-lg pt-space-md bg-surface-container-lowest/50 p-space-sm rounded-lg">
              <p className="font-caption text-caption text-outline text-center">
                By creating an account, you agree to studio booking policies and provider terms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Register;
