import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, login } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const destination = user.role === "provider" ? "/provider/dashboard" : "/creator/dashboard";
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword((current) => !current);
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setErrorMessage("Email address is required.");
      return;
    }

    if (!trimmedPassword || trimmedPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const loggedUser = await login(trimmedEmail, trimmedPassword);
      setIsSubmitting(false);
      const requestedPath = location.state?.from?.pathname;
      let targetPath;
      if (loggedUser.role === "provider") {
        targetPath =
          requestedPath &&
          !requestedPath.startsWith("/creator") &&
          requestedPath !== "/login" &&
          requestedPath !== "/register"
            ? requestedPath
            : "/provider/dashboard";
      } else {
        targetPath =
          requestedPath &&
          !requestedPath.startsWith("/provider") &&
          requestedPath !== "/login" &&
          requestedPath !== "/register"
            ? requestedPath
            : "/creator/dashboard";
      }
      navigate(targetPath, { replace: true });
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage(err.message || "Invalid email or password.");
    }
  };

  return (
    <main className="w-full min-h-screen flex items-center justify-center bg-surface p-margin-desktop">
      <div className="flex flex-col w-full">
        <div className="w-full max-w-5xl mx-auto flex items-center justify-center p-space-sm md:p-space-lg">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 bg-surface-container-lowest rounded-xl overflow-hidden shadow-2xl relative">
            <div className="lg:col-span-5 bg-surface-container-low p-space-lg lg:p-space-xl flex flex-col justify-between relative overflow-hidden">
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
                      STUDIO NETWORK
                    </span>
                  </div>
                </Link>

                <div className="space-y-space-sm">
                  <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight leading-tight">
                    Book the space.
                    <span className="block text-primary">Record the episode.</span>
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant font-normal leading-relaxed">
                    Connecting podcast creators and studio hosts across verified audio facilities.
                  </p>
                </div>

                <div className="space-y-space-md pt-space-xs">
                  <div className="flex items-start space-x-space-sm p-space-sm rounded bg-surface-container border border-surface-container-high">
                    <span className="material-symbols-outlined text-primary text-body-lg mt-0.5">graphic_eq</span>
                    <div>
                      <h4 className="font-label-md text-label-md text-on-surface font-semibold uppercase">
                        Verified Studio Gear Specs
                      </h4>
                      <p className="font-caption text-caption text-on-surface-variant">
                        Review vocal microphones, audio interfaces, and studio room setup.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-space-sm p-space-sm rounded bg-surface-container border border-surface-container-high">
                    <span className="material-symbols-outlined text-secondary text-body-lg mt-0.5">calculate</span>
                    <div>
                      <h4 className="font-label-md text-label-md text-on-surface font-semibold uppercase">
                        Transparent Rate Calculation
                      </h4>
                      <p className="font-caption text-caption text-on-surface-variant">
                        Clear hourly rates and upfront pricing before confirming reservations.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-space-sm p-space-sm rounded bg-surface-container border border-surface-container-high">
                    <span className="material-symbols-outlined text-tertiary text-body-lg mt-0.5">verified</span>
                    <div>
                      <h4 className="font-label-md text-label-md text-on-surface font-semibold uppercase">
                        Instant Booking Management
                      </h4>
                      <p className="font-caption text-caption text-on-surface-variant">
                        Direct schedule coordination between creators and studio providers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 p-space-lg lg:p-space-xl flex flex-col justify-center bg-surface-container-lowest">
              <div className="max-w-md w-full mx-auto space-y-space-lg">
                <div className="space-y-space-xs">
                  <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                    Sign in to PodSphere
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Enter your credentials to access your creator or provider workspace.
                  </p>
                </div>

                {errorMessage && (
                  <div className="flex items-center justify-between p-space-sm bg-error-container/20 rounded text-error border border-error-container/40">
                    <div className="flex items-center space-x-space-sm">
                      <span className="material-symbols-outlined text-body-lg">error</span>
                      <span className="font-label-md text-label-md uppercase tracking-wider">
                        {errorMessage}
                      </span>
                    </div>
                    <button
                      className="text-error hover:opacity-80 cursor-pointer"
                      onClick={() => setErrorMessage("")}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-body-md">close</span>
                    </button>
                  </div>
                )}

                <form className="space-y-space-md" onSubmit={handleLoginSubmit}>
                  <div className="space-y-1">
                    <label className="block font-label-md text-label-md text-on-surface uppercase tracking-wide" htmlFor="email">
                      Email
                    </label>
                    <div className="relative">
                      <input
                        autoComplete="email"
                        className="w-full h-11 px-3.5 bg-surface-container border border-surface-container-high text-on-surface placeholder:text-on-surface-variant/50 rounded font-body-md focus:outline-none focus:border-primary transition-colors"
                        id="email"
                        name="email"
                        placeholder="alex@podcaster.com"
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="font-label-md text-label-md text-on-surface uppercase tracking-wide" htmlFor="password">
                        Password
                      </label>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        autoComplete="current-password"
                        className="w-full h-11 pl-3.5 pr-11 bg-surface-container border border-surface-container-high text-on-surface placeholder:text-on-surface-variant/50 rounded font-body-md focus:outline-none focus:border-primary transition-colors"
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
                        className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                        onClick={togglePasswordVisibility}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-body-lg">
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-space-xs">
                    <label className="flex items-center space-x-2.5 cursor-pointer group">
                      <input
                        className="w-4 h-4 rounded bg-surface-container text-primary focus:ring-0 focus:outline-none cursor-pointer"
                        id="remember"
                        name="remember"
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                      />
                      <span className="font-label-sm text-label-sm text-on-surface-variant tracking-wider group-hover:text-on-surface transition-colors">
                        Remember this device
                      </span>
                    </label>
                  </div>

                  <div className="pt-space-sm">
                    <button
                      className="w-full h-11 bg-primary-container text-on-primary-container hover:bg-secondary-container font-headline-sm text-headline-sm font-medium rounded flex items-center justify-center space-x-2 transition-colors cursor-pointer disabled:opacity-75"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="material-symbols-outlined text-body-md animate-spin">refresh</span>
                          <span>Signing in...</span>
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

                <div className="pt-space-sm text-center space-y-space-xs">
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Don&apos;t have an account?{" "}
                    <Link className="text-primary hover:underline font-medium" to="/register">
                      Create one
                    </Link>
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
