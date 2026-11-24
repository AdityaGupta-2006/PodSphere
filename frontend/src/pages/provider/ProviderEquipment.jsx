import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import * as equipmentApi from "../../services/equipmentApi";
import { useAuth } from "../../hooks/useAuth";

function ProviderEquipment() {
  const { user } = useAuth();
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [toast, setToast] = useState({ visible: false, title: "", message: "" });

  const showToast = (title, message) => {
    setToast({ visible: true, title, message });
    setTimeout(() => {
      setToast({ visible: false, title: "", message: "" });
    }, 3200);
  };

  const loadData = async () => {
    setError("");
    try {
      const data = await equipmentApi.getProviderEquipment();
      setEquipmentList(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      setError(err?.message || "Failed to load provider equipment listings.");
      setEquipmentList([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    equipmentApi
      .getProviderEquipment()
      .then((data) => {
        if (active) {
          setEquipmentList(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err?.message || "Failed to load provider equipment listings.");
          setEquipmentList([]);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [user]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteError("");
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      const result = await equipmentApi.deleteEquipment(itemToDelete.id);
      setEquipmentList((prev) => prev.filter((eq) => eq.id !== itemToDelete.id));
      setIsDeleting(false);
      setDeleteModalOpen(false);
      showToast(
        result.archived ? "Equipment Archived" : "Equipment Deleted",
        result.archived
          ? `Archived "${itemToDelete.name}" to preserve historical rental records.`
          : `Removed "${itemToDelete.name}" from inventory.`
      );
      setItemToDelete(null);
    } catch (err) {
      setIsDeleting(false);
      setDeleteError(err?.message || "Failed to delete equipment. Active rentals may exist.");
    }
  };

  const totalUnits = equipmentList.reduce((sum, eq) => sum + (Number(eq.totalQuantity) || 1), 0);
  const totalActiveRentals = equipmentList.reduce((sum, eq) => sum + (Number(eq.activeRentalCount) || 0), 0);

  return (
    <DashboardLayout activePath="/provider/equipment">
      <div className="flex flex-col w-full pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md py-4 border-b border-surface-container-high mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-label-sm text-[10px] px-2 py-0.5 rounded bg-tertiary/20 text-tertiary font-mono uppercase tracking-wider">
                PROVIDER CONSOLE
              </span>
              <span className="text-outline text-xs">• Equipment Management</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface font-semibold tracking-tight">
              My Equipment Listings
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Manage microphones, cameras, audio consoles, lighting, and gear inventory available for creator rental.
            </p>
          </div>

          <div className="flex items-center gap-space-sm flex-wrap">
            <button
              type="button"
              onClick={handleRefresh}
              className="h-9 px-space-md rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-body-sm font-medium transition-colors flex items-center gap-2 cursor-pointer border border-surface-container-high"
            >
              <span className={`material-symbols-outlined text-[16px] text-outline ${isRefreshing ? "animate-spin" : ""}`}>
                sync
              </span>
              <span>{isRefreshing ? "Syncing..." : "Refresh"}</span>
            </button>
            <Link
              to="/provider/equipment/new"
              className="h-9 px-space-md rounded-lg bg-primary-container hover:bg-secondary-container text-on-primary-container text-body-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>List New Equipment</span>
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-surface-container-low border border-surface-container-high rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-outline font-label-sm text-xs uppercase">
              <span>LISTINGS</span>
              <span className="material-symbols-outlined text-[18px] text-primary">inventory_2</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-headline-xl text-2xl font-bold font-mono text-on-surface">
                {equipmentList.length}
              </span>
              <span className="text-xs text-outline font-mono">MODELS</span>
            </div>
            <span className="text-[11px] text-outline mt-1">Unique gear models in catalog</span>
          </div>

          <div className="p-4 bg-surface-container-low border border-surface-container-high rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-tertiary font-label-sm text-xs uppercase">
              <span>TOTAL INVENTORY</span>
              <span className="material-symbols-outlined text-[18px]">view_in_ar</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-headline-xl text-2xl font-bold font-mono text-tertiary">
                {totalUnits}
              </span>
              <span className="text-xs text-tertiary font-mono">UNITS</span>
            </div>
            <span className="text-[11px] text-outline mt-1">Total physical units tracked</span>
          </div>

          <div className="p-4 bg-surface-container-low border border-surface-container-high rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-outline font-label-sm text-xs uppercase">
              <span>ACTIVE RENTALS</span>
              <span className="material-symbols-outlined text-[18px] text-outline">sync_alt</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-headline-xl text-2xl font-bold font-mono text-on-surface">
                {totalActiveRentals}
              </span>
              <span className="text-xs text-outline font-mono">CURRENTLY OUT</span>
            </div>
            <span className="text-[11px] text-outline mt-1">Units actively reserved or in production</span>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-surface-container-low border border-surface-container-high rounded-xl"></div>
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center bg-surface-container-low border border-error-container/40 rounded-xl">
            <div className="w-16 h-16 rounded-full bg-error-container/20 border border-error-container/30 flex items-center justify-center text-error mx-auto mb-4">
              <span className="material-symbols-outlined text-[32px]">sync_problem</span>
            </div>
            <h3 className="font-headline-sm text-lg font-bold text-on-surface mb-1">
              Failed to load equipment
            </h3>
            <p className="font-body-md text-sm text-outline max-w-sm mx-auto mb-6">{error}</p>
            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-body-sm font-medium border border-surface-container-high cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>Retry</span>
            </button>
          </div>
        ) : equipmentList.length === 0 ? (
          <div className="p-12 text-center bg-surface-container-low border border-surface-container-high rounded-xl">
            <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center text-outline mx-auto mb-4">
              <span className="material-symbols-outlined text-[32px]">mic_off</span>
            </div>
            <h3 className="font-headline-sm text-lg font-bold text-on-surface mb-1">
              No equipment listed yet
            </h3>
            <p className="font-body-md text-sm text-outline max-w-sm mx-auto mb-6">
              Monetize your studio gear by renting it out to creators when not in active recording sessions.
            </p>
            <Link
              to="/provider/equipment/new"
              className="inline-flex items-center gap-2 px-space-lg h-[42px] bg-primary-container hover:bg-secondary-container text-on-primary-container rounded-lg font-body-sm font-semibold transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>List Your First Equipment</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {equipmentList.map((eq) => {
              const displayRate = eq.pricingUnit === "DAILY" && eq.dailyRate
                ? `₹${Number(eq.dailyRate).toLocaleString()} / day`
                : `₹${Number(eq.hourlyRate || eq.dailyRate || 500).toLocaleString()} / hr`;

              return (
                <div
                  key={eq.id}
                  className="bg-surface-container-lowest border border-surface-container-high rounded-xl overflow-hidden shadow-lg flex flex-col justify-between"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Thumbnail */}
                    <div className="sm:w-2/5 h-44 sm:h-auto relative bg-surface-container overflow-hidden shrink-0">
                      <img
                        src={eq.imageUrl || eq.imageUrls?.[0] || "https://lh3.googleusercontent.com/aida-public/AB6AXuAY5Js5asS-K45ETzqtnRCzez9QWi4Sf9mwbsY7UZTFsPEh_BK_4nfW"}
                        alt={eq.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://lh3.googleusercontent.com/aida-public/AB6AXuAY5Js5asS-K45ETzqtnRCzez9QWi4Sf9mwbsY7UZTFsPEh_BK_4nfW";
                        }}
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur-md text-[10px] font-mono uppercase text-tertiary font-bold border border-tertiary/20">
                        {eq.category}
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="sm:w-3/5 p-4 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono text-outline uppercase">
                            {eq.brand} • {eq.model}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container text-on-surface">
                            {eq.totalQuantity} Unit(s)
                          </span>
                        </div>
                        <h3 className="font-body-md text-base font-semibold text-on-surface mt-1 line-clamp-1">
                          {eq.name}
                        </h3>
                        <p className="text-xs text-outline line-clamp-2 mt-1">
                          {eq.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-surface-container-high/60 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-outline uppercase block font-mono">Rate</span>
                          <span className="text-xs font-mono font-bold text-on-surface">{displayRate}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-outline uppercase block font-mono">Location</span>
                          <span className="text-xs text-on-surface">{eq.city}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="p-3 bg-surface-container-low/40 border-t border-surface-container-high flex items-center justify-between">
                    <div className="text-xs">
                      {eq.activeRentalCount > 0 ? (
                        <span className="text-tertiary font-medium flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                          <span>{eq.activeRentalCount} Active Rental(s)</span>
                        </span>
                      ) : (
                        <span className="text-outline">No active rentals</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/provider/equipment/${eq.id}/edit`}
                        className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium transition-colors flex items-center gap-1 border border-surface-container-high"
                      >
                        <span className="material-symbols-outlined text-[14px]">tune</span>
                        <span>Edit</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(eq)}
                        className="px-3 py-1.5 rounded-lg bg-error-container/20 hover:bg-error-container/30 text-error text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && itemToDelete && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center gap-3 text-error">
                <span className="material-symbols-outlined text-[24px]">warning</span>
                <h3 className="font-headline-sm text-lg font-bold text-on-surface">
                  Delete Equipment Listing?
                </h3>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Are you sure you want to delete <strong>{itemToDelete.name}</strong>? If historical rental records exist, the listing will be safely archived instead of permanently purged to preserve creator receipts and history. Active rentals cannot be deleted.
              </p>

              {deleteError && (
                <div className="p-3 bg-error-container/20 border border-error-container/40 rounded-lg text-error text-xs">
                  {deleteError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-body-sm font-medium transition-colors"
                >
                  Keep Listing
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-lg bg-primary-container hover:bg-secondary-container text-on-primary-container text-body-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete Equipment"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        <div
          className={`fixed bottom-6 right-6 bg-surface-container-high border border-surface-container-highest px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 transition-all duration-300 z-50 ${
            toast.visible ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none"
          }`}
        >
          <span className="material-symbols-outlined text-tertiary text-[20px]">check_circle</span>
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase text-on-surface">{toast.title}</span>
            <span className="text-[11px] text-outline">{toast.message}</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ProviderEquipment;
