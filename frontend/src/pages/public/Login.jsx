import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("Invalid credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((current) => !current);
  };

  const simulateAuthError = (message = "Invalid credentials") => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  const dismissAlert = () => {
    setShowAlert(false);
  };

  const simulateAuthSuccess = () => {
    setEmail("host.director@studio-one.fm");
    setPassword("hardware_pass_909");
    setShowAlert(false);
  };

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword || trimmedPassword.length < 6) {
      simulateAuthError("Invalid credentials");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (trimmedEmail === "host.director@studio-one.fm" && trimmedPassword === "hardware_pass_909") {
        navigate("/provider/dashboard");
      } else {
        simulateAuthError("Invalid credentials");
      }
    }, 700);
  };

  return (
    <main className="w-full min-h-screen flex items-center justify-center bg-surface p-margin-desktop">
      <div className="flex flex-col w-full">
        <div className="w-full max-w-5xl mx-auto flex items-center justify-center p-space-sm md:p-space-lg">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 bg-surface-container-lowest rounded-xl overflow-hidden shadow-2xl relative">
            <div className="lg:col-span-5 bg-surface-container-low p-space-lg lg:p-space-xl flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-center opacity-40 mb-space-lg">
                <div className="w-2.5 h-2.5 rounded-full bg-surface-variant flex items-center justify-center">
                  <span className="w-1.5 h-0.5 bg-outline-variant block"></span>
                </div>
                <span className="font-label-sm text-label-sm tracking-widest text-on-surface-variant uppercase">
                  RACK // UNIT 01
                </span>
                <div className="w-2.5 h-2.5 rounded-full bg-surface-variant flex items-center justify-center">
                  <span className="w-1.5 h-0.5 bg-outline-variant block"></span>
                </div>
              </div>

              <div className="space-y-space-lg">
                <Link to="/" className="flex items-center space-x-space-md">
                  <div className="w-12 h-12 rounded bg-surface-container-high flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[26px] text-primary">podcasts</span>
                  </div>
                  <div>
                    <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface font-semibold block">
                      PodSphere
                    </span>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary">
                      STUDIO NETWORK ENGINE
                    </span>
                  </div>
                </Link>

                <div className="space-y-space-xs pt-space-sm">
                  <h1 className="font-headline-lg text-headline-lg font-semibold tracking-tight text-on-surface leading-tight">
                    Book the space. <br />
                    <span className="text-secondary">Record the episode.</span>
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant pt-space-xs">
                    Hardware-grade infrastructure linking certified acoustic stages directly to broadcast producers.
                  </p>
                </div>

                <div className="space-y-space-sm pt-space-md">
                  <div className="bg-surface-container p-space-sm rounded flex items-start space-x-space-sm">
                    <span className="material-symbols-outlined text-primary text-body-lg shrink-0 mt-0.5">
                      graphic_eq
                    </span>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface uppercase tracking-wide">
                        Verified studio gear specs
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Calibrated frequency telemetry, preamp line logs &amp; vocal mic inventory.
                      </p>
                    </div>
                  </div>

                  <div className="bg-surface-container p-space-sm rounded flex items-start space-x-space-sm">
                    <span className="material-symbols-outlined text-primary text-body-lg shrink-0 mt-0.5">
                      calculate
                    </span>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface uppercase tracking-wide">
                        Authoritative rate calculation
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Real-time lock on multi-channel engineer labor and studio room blocks.
                      </p>
                    </div>
                  </div>

                  <div className="bg-surface-container p-space-sm rounded flex items-start space-x-space-sm">
                    <span className="material-symbols-outlined text-primary text-body-lg shrink-0 mt-0.5">
                      check_circle
                    </span>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface uppercase tracking-wide">
                        Zero fabricated metrics
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Direct feed from live booking clocks and calibrated acoustic validation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-space-xl pt-space-lg">
                <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm mb-1.5 uppercase">
                  <span>DAW LINE I/O</span>
                  <span className="text-tertiary">CALIBRATED</span>
                </div>
                <div className="flex items-center gap-1 w-full h-2 bg-surface-container-highest p-0.5 rounded-sm">
                  <div className="h-full flex-1 bg-tertiary-container rounded-xs"></div>
                  <div className="h-full flex-1 bg-tertiary-container rounded-xs"></div>
                  <div className="h-full flex-1 bg-tertiary rounded-xs"></div>
                  <div className="h-full flex-1 bg-tertiary rounded-xs"></div>
                  <div className="h-full flex-1 bg-tertiary rounded-xs"></div>
                  <div className="h-full flex-1 bg-tertiary rounded-xs"></div>
                  <div className="h-full flex-1 bg-surface-variant rounded-xs"></div>
                  <div className="h-full flex-1 bg-surface-variant rounded-xs"></div>
                  <div className="h-full flex-1 bg-primary-container rounded-xs"></div>
                  <div className="h-full flex-1 bg-surface-variant rounded-xs"></div>
                </div>
                <div className="flex justify-between items-center opacity-40 mt-space-lg">
                  <div className="w-2.5 h-2.5 rounded-full bg-surface-variant flex items-center justify-center">
                    <span className="w-1.5 h-0.5 bg-outline-variant block"></span>
                  </div>
                  <span className="font-label-sm text-label-sm tracking-widest text-on-surface-variant uppercase">
                    SERIAL // PS-88402
                  </span>
                  <div className="w-2.5 h-2.5 rounded-full bg-surface-variant flex items-center justify-center">
                    <span className="w-1.5 h-0.5 bg-outline-variant block"></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-surface-container p-space-lg lg:p-space-xl flex flex-col justify-center">
              <div className="max-w-md w-full mx-auto space-y-space-lg">
                <div className="space-y-space-xs">
                  <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm uppercase mb-space-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary block animate-pulse"></span>
                    <span>NODE ACCESS: SECURE PASS</span>
                  </div>
                  <h2 className="font-headline-md text-headline-md font-semibold text-on-surface">
                    Sign in to PodSphere
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Enter your credentials to access your creator or provider workspace.
                  </p>
                </div>

                {showAlert && (
                  <div
                    className="flex items-center justify-between p-space-sm bg-error-container/20 rounded text-error transition-all duration-200"
                    id="authAlert"
                  >
                    <div className="flex items-center space-x-space-sm">
                      <span className="material-symbols-outlined text-body-lg">error</span>
                      <span className="font-label-md text-label-md uppercase tracking-wider" id="authAlertMessage">
                        {alertMessage}
                      </span>
                    </div>
                    <button
                      className="text-error hover:opacity-80"
                      onClick={dismissAlert}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-body-md">close</span>
                    </button>
                  </div>
                )}

                <form className="space-y-space-md" id="loginForm" onSubmit={handleLoginSubmit}>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="font-label-md text-label-md text-on-surface uppercase tracking-wide" htmlFor="email">
                        Email
                      </label>
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">PORT ID</span>
                    </div>
                    <div className="relative">
                      <input
                        autoComplete="email"
                        className="w-full h-11 px-3.5 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/50 rounded font-body-md focus:outline-none focus:bg-surface-container-high transition-colors"
                        id="email"
                        name="email"
                        placeholder="alex@podcaster.com"
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <p className="font-caption text-caption text-on-surface-variant">
                      Assigned network email bound to your studio or host profile.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="font-label-md text-label-md text-on-surface uppercase tracking-wide" htmlFor="password">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => simulateAuthError("Password reset instructions transmitted to verified channel")}
                        className="font-label-sm text-label-sm text-primary hover:underline uppercase"
                      >
                        RESET KEY
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        autoComplete="current-password"
                        className="w-full h-11 pl-3.5 pr-11 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/50 rounded font-body-md focus:outline-none focus:bg-surface-container-high transition-colors"
                        id="password"
                        name="password"
                        placeholder="••••••••••••"
                        required
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        aria-label="Toggle password visibility"
                        className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                        id="togglePasswordBtn"
                        onClick={togglePasswordVisibility}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-body-lg" id="passwordIcon">
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                    <p className="font-caption text-caption text-on-surface-variant">
                      Min. 8 characters with studio biometric or cryptographic passkey.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-space-xs">
                    <label className="flex items-center space-x-2.5 cursor-pointer group">
                      <input
                        className="w-4 h-4 rounded bg-surface-container-lowest text-primary-container focus:ring-0 focus:outline-none cursor-pointer"
                        id="remember"
                        name="remember"
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                      />
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider group-hover:text-on-surface transition-colors">
                        Keep terminal active (30d)
                      </span>
                    </label>
                  </div>

                  <div className="pt-space-sm">
                    <button
                      className="w-full h-11 bg-secondary-container text-on-surface hover:bg-on-secondary-fixed-variant active:bg-on-primary-container font-headline-sm text-headline-sm font-medium rounded flex items-center justify-center space-x-2 transition-colors cursor-pointer disabled:opacity-75"
                      id="submitBtn"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="material-symbols-outlined text-body-md animate-spin">refresh</span>
                          <span>AUTHENTICATING ROUTE...</span>
                        </>
                      ) : (
                        <>
                          <span>Log in</span>
                          <span className="material-symbols-outlined text-body-md">arrow_forward</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="pt-space-md bg-surface-container-low p-space-sm rounded">
                  <div className="flex items-center justify-between mb-space-xs">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                      FIELD SIMULATOR
                    </span>
                    <span className="font-label-sm text-label-sm text-tertiary">READY</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="flex-1 py-1.5 px-2 bg-surface-container text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm uppercase rounded transition-colors text-center"
                      onClick={() => simulateAuthError("Invalid credentials")}
                      type="button"
                    >
                      Simulate 401 Reject
                    </button>
                    <button
                      className="flex-1 py-1.5 px-2 bg-surface-container text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm uppercase rounded transition-colors text-center"
                      onClick={simulateAuthSuccess}
                      type="button"
                    >
                      Auto-fill Host
                    </button>
                  </div>
                </div>

                <div className="pt-space-sm text-center space-y-space-xs">
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Don&apos;t have an account?{" "}
                    <Link className="text-primary hover:underline font-medium" to="/register">
                      Create one
                    </Link>
                  </p>
                  <p className="font-caption text-caption text-on-surface-variant opacity-60">
                    PodSphere Audio Infrastructure Protocol • Calibrated Rack v4.8.2
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;
