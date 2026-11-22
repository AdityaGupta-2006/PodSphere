import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import DashboardLayout from "../layouts/DashboardLayout";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading, hasProviderAccess, activateProviderAccess, switchWorkspace } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-on-surface">
        <div className="flex items-center gap-3 px-space-md py-space-sm rounded-lg bg-surface-container border border-surface-container-high">
          <span className="w-3 h-3 rounded-full bg-tertiary animate-pulse"></span>
          <span className="font-label-md text-label-md text-outline uppercase tracking-wider">
            INITIALIZING SECURE SESSION...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.includes("provider") && !hasProviderAccess) {
    const handleActivate = async () => {
      await activateProviderAccess();
      navigate("/provider/dashboard", { replace: true });
    };

    const handleReturnCreator = () => {
      switchWorkspace("creator");
      navigate("/creator/dashboard", { replace: true });
    };

    return (
      <DashboardLayout activePath="/provider/dashboard">
        <div className="max-w-2xl mx-auto py-space-xl flex flex-col gap-space-lg">
          <div className="p-space-xl bg-surface-container-low border border-surface-container-high rounded-2xl shadow-xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-tertiary/15 border border-tertiary/30 flex items-center justify-center text-tertiary mb-space-md">
              <span className="material-symbols-outlined text-[36px]">storefront</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-label-sm text-label-sm uppercase tracking-wider px-2 py-0.5 rounded bg-tertiary/20 text-tertiary font-mono">
                PROVIDER ONBOARDING
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight mb-2">
              Activate Provider Workspace
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-lg mb-space-lg">
              Your account ({user?.email}) is currently set up as a creator. Activate Provider Access to list recording spaces, set hourly pricing, and accept studio bookings.
            </p>

            <div className="w-full bg-surface-container-lowest rounded-xl p-space-md border border-surface-container-high mb-space-lg text-left flex flex-col gap-space-sm">
              <div className="flex items-start gap-space-sm">
                <span className="material-symbols-outlined text-tertiary text-[20px] mt-0.5">check_circle</span>
                <div>
                  <span className="font-body-sm font-semibold text-on-surface block">Publish Recording Spaces</span>
                  <span className="font-caption text-outline">List acoustic booths, broadcast rooms, and hourly rates in Delhi, Mumbai, or Bengaluru.</span>
                </div>
              </div>
              <div className="flex items-start gap-space-sm">
                <span className="material-symbols-outlined text-tertiary text-[20px] mt-0.5">check_circle</span>
                <div>
                  <span className="font-body-sm font-semibold text-on-surface block">Manage Equipment Rosters</span>
                  <span className="font-caption text-outline">Showcase your vocal microphones, audio mixers, and 4K cameras to creators.</span>
                </div>
              </div>
              <div className="flex items-start gap-space-sm">
                <span className="material-symbols-outlined text-tertiary text-[20px] mt-0.5">check_circle</span>
                <div>
                  <span className="font-body-sm font-semibold text-on-surface block">Receive &amp; Confirm Bookings</span>
                  <span className="font-caption text-outline">Review incoming session reservation requests from podcast hosts.</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-space-sm w-full sm:w-auto">
              <button
                type="button"
                onClick={handleActivate}
                className="w-full sm:w-auto px-space-lg h-[42px] bg-primary-container hover:bg-secondary-container text-on-primary-container font-body-sm font-medium rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Activate Provider Access</span>
              </button>
              <button
                type="button"
                onClick={handleReturnCreator}
                className="w-full sm:w-auto px-space-md h-[42px] bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm font-medium rounded-xl transition-colors cursor-pointer"
              >
                Return to Creator Workspace
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return children;
}

export default ProtectedRoute;
