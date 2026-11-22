import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

function Register() {
  const [role, setRole] = useState("creator");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { user, isAuthenticated, register } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const destination = user.role === "provider" ? "/provider/dashboard" : "/creator/dashboard";
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const isPasswordValid = password.length >= 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedName) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (trimmedPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newUser = await register({
        name: trimmedName,
        email: trimmedEmail,
        password: trimmedPassword,
        role,
      });

      setIsSubmitting(false);

      if (newUser.role === "provider") {
        navigate("/provider/dashboard", { replace: true });
      } else {
        navigate("/creator/dashboard", { replace: true });
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage(err.message || "Registration failed. Please check inputs.");
    }
  };

  return (
    <main className="w-full min-h-screen flex items-center justify-center bg-surface p-margin-desktop">
      <div className="flex flex-col w-full max-w-6xl mx-auto py-8 space-y-space-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter px-margin">
          <div className="lg:col-span-5 flex flex-col justify-between space-y-space-lg">
            <div className="p-space-lg bg-surface-container-low rounded-xl border border-surface-container-high space-y-space-lg">
              <div className="flex items-center justify-between border-b border-surface-container-high pb-space-sm">
                <Link to="/" className="flex items-center gap-1.5">
                  <div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">mic</span>
                  </div>
                  <span className="font-headline-sm text-body-md font-semibold text-on-surface">
                    PodSphere
                  </span>
                </Link>
                <span className="font-label-sm text-label-sm text-primary uppercase">Registration</span>
              </div>

              <div className="relative rounded-lg overflow-hidden border border-surface-container bg-surface-container-lowest">
                <img
                  alt="Podcast Studio"
                  className="w-full h-48 object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEvzgoHSksFevM3QCZlQq8ygmEOfw03mZjThQWh83DqG_tAJzF2RIt"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <div>
                    <span className="font-headline-sm text-headline-sm text-on-surface font-semibold block">
                      Soundstage Studio
                    </span>
                    <span className="font-caption text-caption text-outline">
                      Certified recording facilities
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-space-xs font-body-sm text-body-sm text-outline">
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-sm text-tertiary">check_circle</span>
                  <span>Connect with verified recording spaces and gear.</span>
                </div>
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-sm text-tertiary">check_circle</span>
                  <span>Manage bookings, rates, and schedules in one place.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-surface-container-low p-space-xl rounded-xl border border-surface-container-high space-y-space-lg">
              <div className="space-y-space-xs">
                <h1 className="font-headline-xl text-headline-xl text-on-surface font-semibold tracking-tight">
                  Create your PodSphere account
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Choose your platform role to get started.
                </p>
              </div>

              {errorMessage && (
                <div className="flex items-center justify-between p-space-sm bg-error-container/20 rounded text-error border border-error-container/40">
                  <div className="flex items-center gap-2">
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

              <form className="space-y-space-lg" onSubmit={handleSubmit}>
                <div className="space-y-space-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                      PLATFORM ROLE
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
                    <label
                      className={`relative flex flex-col justify-between p-space-md rounded-lg cursor-pointer transition-all duration-150 border ${
                        role === "creator"
                          ? "bg-surface-bright border-primary"
                          : "bg-surface-container-high border-surface-container-high hover:bg-surface-bright"
                      }`}
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
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              role === "creator" ? "bg-on-surface" : "bg-transparent"
                            }`}
                          ></div>
                        </div>
                      </div>
                      <div className="mt-space-md space-y-space-xs">
                        <span className="font-headline-sm text-headline-sm text-on-surface font-semibold block">
                          Creator
                        </span>
                        <p className="font-body-sm text-body-sm text-on-surface">
                          Find and book studios for your podcast.
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
                      className={`relative flex flex-col justify-between p-space-md rounded-lg cursor-pointer transition-all duration-150 border ${
                        role === "provider"
                          ? "bg-surface-bright border-primary"
                          : "bg-surface-container-high border-surface-container-high hover:bg-surface-bright"
                      }`}
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
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              role === "provider" ? "bg-on-surface" : "bg-transparent"
                            }`}
                          ></div>
                        </div>
                      </div>
                      <div className="mt-space-md space-y-space-xs">
                        <span className="font-headline-sm text-headline-sm text-on-surface font-semibold block">
                          Provider
                        </span>
                        <p className="font-body-sm text-body-sm text-on-surface">
                          List your studio and manage incoming bookings.
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
                    <input
                      className="w-full h-10 px-space-md bg-surface-container border border-surface-container-high text-on-surface placeholder-outline font-body-md text-body-md rounded-lg focus:outline-none focus:border-primary transition-colors"
                      id="fullName"
                      placeholder="e.g. Jordan Miller"
                      required
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-label-md text-label-md uppercase tracking-wider text-on-surface" htmlFor="email">
                      Email
                    </label>
                    <input
                      className="w-full h-10 px-space-md bg-surface-container border border-surface-container-high text-on-surface placeholder-outline font-body-md text-body-md rounded-lg focus:outline-none focus:border-primary transition-colors"
                      id="email"
                      placeholder="engineer@domain.com"
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block font-label-md text-label-md uppercase tracking-wider text-on-surface" htmlFor="password">
                        Password
                      </label>
                      <span className={`font-label-sm text-label-sm ${isPasswordValid ? "text-tertiary" : "text-outline"}`}>
                        MIN 8 CHARACTERS
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        className="w-full h-10 px-space-md pr-10 bg-surface-container border border-surface-container-high text-on-surface placeholder-outline font-body-md text-body-md rounded-lg focus:outline-none focus:border-primary transition-colors"
                        id="password"
                        placeholder="••••••••••••"
                        required
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        className="absolute right-3 top-2.5 text-outline hover:text-on-surface transition-colors cursor-pointer"
                        onClick={togglePasswordVisibility}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-lg">
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-space-sm space-y-space-md">
                  <button
                    className="w-full h-12 rounded-lg font-headline-sm text-body-md font-semibold flex items-center justify-center gap-space-sm transition-all duration-200 cursor-pointer disabled:opacity-50 bg-primary-container text-on-primary-container hover:bg-secondary-container"
                    disabled={isSubmitting || !fullName || !email || !isPasswordValid}
                    type="submit"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-lg">refresh</span>
                        <span>Creating account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create account</span>
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-body-sm text-outline">
                    <span>Already have an account?</span>
                    <Link
                      className="text-on-surface font-medium hover:text-primary transition-colors flex items-center gap-1"
                      to="/login"
                    >
                      <span>Log in</span>
                      <span className="material-symbols-outlined text-sm">login</span>
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Register;
