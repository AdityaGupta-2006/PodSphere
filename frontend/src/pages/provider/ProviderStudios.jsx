import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import * as studioApi from "../../services/studioApi";
import { useAuth } from "../../hooks/useAuth";

function ProviderStudios() {
  const { user } = useAuth();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studioToDelete, setStudioToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studios, setStudios] = useState([]);
  const [toast, setToast] = useState({ visible: false, title: "", message: "" });

  const showToast = (title, message) => {
    setToast({ visible: true, title, message });
    setTimeout(() => {
      setToast({ visible: false, title: "", message: "" });
    }, 3200);
  };

  const loadStudios = () => {
    setLoading(true);
    setError("");
    const filter = user?.id ? { providerId: user.id } : {};
    studioApi
      .getStudios(filter)
      .then((data) => {
        setStudios(data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.message || "Failed to load studios from server.");
        setStudios([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    let active = true;
    const filter = user?.id ? { providerId: user.id } : {};
    studioApi
      .getStudios(filter)
      .then((data) => {
        if (active) {
          setStudios(data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err?.message || "Failed to load studios from server.");
          setStudios([]);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [user]);

  const handleDeleteClick = (studio) => {
    setStudioToDelete(studio);
    setDeleteError("");
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!studioToDelete) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      await studioApi.deleteStudio(studioToDelete.id, user?.id);
      setStudios((prev) => prev.filter((s) => s.id !== studioToDelete.id));
      setIsDeleting(false);
      setDeleteModalOpen(false);
      showToast("Studio Decommissioned", `Removed "${studioToDelete.name}" from cluster.`);
      setStudioToDelete(null);
    } catch (err) {
      setIsDeleting(false);
      setDeleteError(err.message || "Failed to delete studio. Active bookings may exist.");
    }
  };

  return (
    <DashboardLayout activePath="/provider/studios">
      <div className="flex flex-col gap-space-xl pb-space-xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pt-space-md border-b border-surface-container-high pb-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-label-sm text-[10px] px-2 py-0.5 rounded bg-tertiary/20 text-tertiary font-mono uppercase tracking-wider">
                PROVIDER CONSOLE
              </span>
              <span className="text-outline text-xs">• Facility Management</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg font-semibold tracking-tight text-on-surface">
              My Studios
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
              Manage your recording studio listings, adjust hourly tariffs, and update audio/video gear specs.
            </p>
          </div>
          <div className="flex items-center gap-space-sm shrink-0">
            <Link
              className="flex items-center gap-space-xs px-space-md h-[42px] rounded-xl bg-primary-container hover:bg-secondary-container text-on-primary-container font-headline-sm text-body-md font-medium transition-colors shadow-sm"
              to="/provider/studios/new"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Add Studio</span>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-space-lg animate-pulse">
            <div className="h-96 rounded-xl bg-surface-container-lowest border border-surface-container-high p-space-md"></div>
            <div className="h-96 rounded-xl bg-surface-container-lowest border border-surface-container-high p-space-md"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-space-xl rounded-xl bg-surface-container-lowest text-center border border-error-container/40 my-space-md">
            <div className="w-16 h-16 rounded-full bg-error-container/20 border border-error-container/30 flex items-center justify-center text-error mb-space-md">
              <span className="material-symbols-outlined text-[32px]">sync_problem</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-1">
              Failed to load studios
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mb-space-lg">
              {error}
            </p>
            <button
              className="flex items-center gap-space-xs px-space-md h-[42px] rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-body-md text-body-md font-medium transition-colors cursor-pointer"
              onClick={loadStudios}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              <span>Retry</span>
            </button>
          </div>
        ) : studios.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-space-xl rounded-xl bg-surface-container-lowest text-center border border-surface-container-high my-space-md">
            <div className="w-16 h-16 rounded-xl bg-surface-container-low flex items-center justify-center text-outline mb-space-md">
              <span className="material-symbols-outlined text-[32px]">mic_off</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-1">
              No studios yet
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mb-space-lg">
              Create your first studio to make it available to creators.
            </p>
            <Link
              className="flex items-center gap-space-xs px-space-md h-[42px] rounded-xl bg-primary-container hover:bg-inverse-primary text-on-primary font-body-md text-body-md font-medium transition-colors shadow-md"
              to="/provider/studios/new"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Add Studio</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-space-lg">
            {studios.map((studio) => (
              <div
                key={studio.id}
                className="flex flex-col rounded-xl bg-surface-container-lowest overflow-hidden shadow-xl border border-surface-container-high/40 hover:border-surface-variant transition-colors"
              >
                <div className="relative h-56 w-full bg-surface-container-low overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    alt={studio.name}
                    src={studio.imageUrl || studio.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuAY5Js5asS-K45ETzqtnRCzez9QWi4Sf9mwbsY7UZTFsPEh_BK_4nfW"}
                    onError={(e) => {
                      e.target.src = "https://lh3.googleusercontent.com/aida-public/AB6AXuAY5Js5asS-K45ETzqtnRCzez9QWi4Sf9mwbsY7UZTFsPEh_BK_4nfW";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/40 to-transparent"></div>
                  <div className="absolute top-space-sm left-space-sm flex items-center gap-space-xs">
                    <span className="px-2 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur-md text-tertiary font-label-sm text-label-sm uppercase tracking-wider font-semibold border border-tertiary/20">
                      {studio.status || "LIVE UNIT"}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-label-sm text-label-sm border border-surface-container-high">
                      <span className="material-symbols-outlined text-[12px] text-outline">location_on</span>
                      <span>{studio.city || studio.location}</span>
                    </span>
                  </div>
                  <div className="absolute bottom-space-sm right-space-sm">
                    <span className="px-2.5 py-1 rounded bg-surface-container-lowest/95 backdrop-blur-md text-on-surface font-label-sm text-label-sm font-semibold border border-surface-container-high">
                      ₹{Number(studio.hourlyRate || studio.rate || 1500).toLocaleString()} / hour
                    </span>
                  </div>
                </div>

                <div className="flex flex-col p-space-md gap-space-md flex-1 justify-between">
                  <div className="flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between">
                      <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                        {studio.name}
                      </h3>
                      <span className="font-label-sm text-label-sm text-outline font-mono">
                        ID: {String(studio.id).toUpperCase()}
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                      {studio.description}
                    </p>
                  </div>

                  <div className="flex flex-col gap-space-xs p-space-sm rounded-lg bg-surface-container-low border border-surface-container-high">
                    <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-outline uppercase tracking-wider">
                      <span className="material-symbols-outlined text-[14px]">graphic_eq</span>
                      <span>PATCH &amp; HARDWARE ARRAY</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(Array.isArray(studio.gear) ? studio.gear : ["4x Shure SM7B", "Rodecaster Pro II"]).map(
                        (gearItem, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-body-sm text-body-sm text-[11px]"
                          >
                            {gearItem}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-space-sm pt-space-xs border-t border-surface-container-high">
                    <Link
                      className="flex items-center gap-1 px-space-md h-9 rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface font-body-sm text-body-sm transition-colors"
                      to={`/provider/studios/${studio.id}/edit`}
                    >
                      <span className="material-symbols-outlined text-[16px]">tune</span>
                      <span>Edit</span>
                    </Link>
                    <button
                      className="flex items-center gap-1 px-space-md h-9 rounded-lg bg-surface-container-low hover:bg-error-container text-error font-body-sm text-body-sm transition-colors cursor-pointer"
                      onClick={() => handleDeleteClick(studio)}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {deleteModalOpen && studioToDelete && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-container-lowest/80 backdrop-blur-sm overflow-y-auto"
            id="delete-modal"
          >
            <div className="flex flex-col w-full max-w-md max-h-[90vh] overflow-y-auto my-auto rounded-xl bg-surface-container-low p-space-lg shadow-2xl border border-surface-container-high">
              <div className="flex items-center gap-space-sm text-error mb-space-sm">
                <span className="material-symbols-outlined text-[24px]">warning</span>
                <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                  Delete studio?
                </h2>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
                Are you sure you want to delete this studio? A studio with active or scheduled bookings cannot be
                deleted.
              </p>

              {deleteError && (
                <div className="p-space-sm bg-error-container/20 rounded-lg text-error text-body-sm mb-space-md border border-error-container/40">
                  {deleteError}
                </div>
              )}

              <div className="flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-container-high mb-space-lg">
                <span className="material-symbols-outlined text-outline text-[18px]">radio</span>
                <span className="font-label-md text-label-md text-on-surface font-medium truncate">
                  {studioToDelete.name} ({studioToDelete.city || studioToDelete.location})
                </span>
              </div>

              <div className="flex items-center justify-end gap-space-sm">
                <button
                  className="px-space-md h-[38px] rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface font-body-sm text-body-sm transition-colors cursor-pointer"
                  onClick={() => setDeleteModalOpen(false)}
                  type="button"
                >
                  Keep studio
                </button>
                <button
                  className="px-space-md h-[38px] rounded-lg bg-primary-container hover:bg-inverse-primary text-on-primary font-body-sm text-body-sm font-medium transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  type="button"
                >
                  {isDeleting ? "Deleting..." : "Delete studio"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div
          className={`fixed bottom-6 right-6 bg-surface-container-high border border-surface-container-highest px-space-md py-3 rounded-lg shadow-2xl flex items-center gap-space-md transition-all duration-300 z-50 ${
            toast.visible
              ? "translate-y-0 opacity-100"
              : "translate-y-24 opacity-0 pointer-events-none"
          }`}
          id="toast-feedback-studios"
        >
          <span className="material-symbols-outlined text-tertiary text-[20px]">check_circle</span>
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm font-semibold uppercase text-on-surface">
              {toast.title}
            </span>
            <span className="font-caption text-caption text-outline">
              {toast.message}
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ProviderStudios;
