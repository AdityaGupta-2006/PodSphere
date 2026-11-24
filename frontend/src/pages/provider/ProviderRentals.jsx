import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import * as rentalApi from "../../services/rentalApi";
import * as equipmentApi from "../../services/equipmentApi";
import { useAuth } from "../../hooks/useAuth";

function ProviderRentals() {
  const { user } = useAuth();
  const [rentals, setRentals] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [equipmentFilter, setEquipmentFilter] = useState("ALL");
  const [selectedRentalDetails, setSelectedRentalDetails] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError("");
    setActionError("");
    try {
      const [rentalData, eqData] = await Promise.all([
        rentalApi.getProviderRentals(),
        equipmentApi.getProviderEquipment()
      ]);
      setRentals(Array.isArray(rentalData) ? rentalData : []);
      setEquipmentList(Array.isArray(eqData) ? eqData : []);
      setLoading(false);
    } catch (err) {
      setError(err?.message || "Failed to load incoming gear rental requests.");
      setRentals([]);
      setEquipmentList([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    Promise.all([
      rentalApi.getProviderRentals(),
      equipmentApi.getProviderEquipment()
    ])
      .then(([rentalData, eqData]) => {
        if (active) {
          setRentals(Array.isArray(rentalData) ? rentalData : []);
          setEquipmentList(Array.isArray(eqData) ? eqData : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err?.message || "Failed to load incoming gear rental requests.");
          setRentals([]);
          setEquipmentList([]);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [user]);

  const handleUpdateStatus = async (rentalId, newStatus, currentStatus) => {
    setActionError("");
    try {
      await rentalApi.updateRentalStatus(rentalId, newStatus, currentStatus);
      await loadData();
      if (selectedRentalDetails && selectedRentalDetails.id === rentalId) {
        setSelectedRentalDetails((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      setActionError(err?.message || `Failed to update rental status to ${newStatus}.`);
    }
  };

  const filteredRentals = rentals.filter((r) => {
    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
    const matchEq = equipmentFilter === "ALL" || String(r.equipmentId) === String(equipmentFilter);
    return matchStatus && matchEq;
  });

  const pendingCount = rentals.filter((r) => r.status === "PENDING").length;
  const activeCount = rentals.filter((r) => r.status === "ACTIVE" || r.status === "APPROVED").length;
  const completedCount = rentals.filter((r) => r.status === "COMPLETED" || r.status === "RETURNED").length;

  return (
    <DashboardLayout activePath="/provider/rentals">
      <div className="flex flex-col w-full pb-16">
        {/* Header */}
        <div className="w-full bg-surface-container-low rounded-lg p-space-lg mb-space-lg flex flex-col md:flex-row md:items-end justify-between gap-space-md shadow-sm">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-label-sm text-[10px] px-2 py-0.5 rounded bg-tertiary/20 text-tertiary font-mono uppercase tracking-wider">
                PROVIDER CONSOLE
              </span>
              <span className="text-outline text-xs">• Incoming Equipment Rentals</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg font-semibold text-on-surface tracking-tight leading-none mb-1">
              Gear Rentals
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Review and approve incoming equipment requests from creators, track gear handovers, and mark returned inventory.
            </p>
          </div>

          <div className="flex items-stretch gap-space-md">
            <div className="bg-surface-container rounded-lg px-space-md py-space-sm flex flex-col min-w-[130px]">
              <span className="font-label-sm text-xs text-outline uppercase tracking-wider">PENDING</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-md text-headline-md font-semibold text-primary-container font-mono">
                  {pendingCount}
                </span>
                <span className="text-xs text-outline">Requests</span>
              </div>
            </div>

            <div className="bg-surface-container rounded-lg px-space-md py-space-sm flex flex-col min-w-[130px]">
              <span className="font-label-sm text-xs text-outline uppercase tracking-wider">OUT / ACTIVE</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-md text-headline-md font-semibold text-tertiary font-mono">
                  {activeCount}
                </span>
                <span className="text-xs text-outline">In Field</span>
              </div>
            </div>

            <div className="bg-surface-container rounded-lg px-space-md py-space-sm flex flex-col min-w-[130px]">
              <span className="font-label-sm text-xs text-outline uppercase tracking-wider">RETURNED</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-md text-headline-md font-semibold text-on-surface font-mono">
                  {completedCount}
                </span>
                <span className="text-xs text-outline">Closed</span>
              </div>
            </div>
          </div>
        </div>

        {actionError && (
          <div className="flex items-center justify-between p-3 bg-error-container/20 rounded-lg text-error border border-error-container/40 mb-4 text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{actionError}</span>
            </div>
            <button type="button" onClick={() => setActionError("")} className="cursor-pointer">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* Filter Controls */}
        <div className="w-full bg-surface-container-lowest rounded-lg p-4 mb-6 flex flex-col sm:flex-row gap-4 items-end justify-between border border-surface-container-high shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 w-full sm:w-auto">
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-label-sm text-outline">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-surface-container border border-surface-container-high rounded-lg px-3 py-2 text-on-surface text-body-sm focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Review</option>
                <option value="APPROVED">Approved (Awaiting Pickup)</option>
                <option value="ACTIVE">Active (In Production)</option>
                <option value="RETURNED">Returned</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-label-sm text-outline">Filter by Equipment</label>
              <select
                value={equipmentFilter}
                onChange={(e) => setEquipmentFilter(e.target.value)}
                className="bg-surface-container border border-surface-container-high rounded-lg px-3 py-2 text-on-surface text-body-sm focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="ALL">All Gear</option>
                {equipmentList.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name} ({eq.totalQuantity} units)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadData}
              className="px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium border border-surface-container-high flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("ALL");
                setEquipmentFilter("ALL");
              }}
              className="px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface text-xs font-medium border border-surface-container-high flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">backspace</span>
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Content Table */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-surface-container-low border border-surface-container-high rounded-lg"></div>
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center bg-surface-container-low border border-error-container/40 rounded-xl">
            <div className="w-16 h-16 rounded-full bg-error-container/20 border border-error-container/30 flex items-center justify-center text-error mx-auto mb-4">
              <span className="material-symbols-outlined text-[32px]">sync_problem</span>
            </div>
            <h3 className="font-headline-sm text-lg font-bold text-on-surface mb-1">
              Failed to load rentals
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
        ) : filteredRentals.length === 0 ? (
          <div className="p-12 text-center bg-surface-container-low border border-surface-container-high rounded-xl">
            <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center text-outline mx-auto mb-4">
              <span className="material-symbols-outlined text-[32px]">calendar_today</span>
            </div>
            <h3 className="font-headline-sm text-lg font-bold text-on-surface mb-1">
              No rental requests found
            </h3>
            <p className="font-body-md text-sm text-outline max-w-sm mx-auto mb-6">
              {rentals.length === 0
                ? "Incoming equipment rental requests from creators will appear here."
                : "No rental requests match the active filter criteria."}
            </p>
            {rentals.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("ALL");
                  setEquipmentFilter("ALL");
                }}
                className="px-4 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="w-full bg-surface-container-low rounded-xl overflow-hidden shadow-sm border border-surface-container-high">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[720px]">
                <thead>
                  <tr className="border-b border-surface-container-high bg-surface-container-lowest/60 text-outline font-label-sm text-xs uppercase tracking-wider">
                    <th className="py-3 px-4 font-medium">Equipment</th>
                    <th className="py-3 px-4 font-medium">Creator</th>
                    <th className="py-3 px-4 font-medium">Rental Period</th>
                    <th className="py-3 px-4 font-medium">Qty</th>
                    <th className="py-3 px-4 font-medium">Amount</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high/40 text-xs">
                  {filteredRentals.map((r) => (
                    <tr key={r.id} className="hover:bg-surface-container-high/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded bg-surface-container flex items-center justify-center text-outline overflow-hidden shrink-0">
                            {r.equipment?.imageUrl ? (
                              <img
                                src={r.equipment.imageUrl}
                                alt={r.equipment.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="material-symbols-outlined text-[18px]">mic</span>
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-on-surface block truncate max-w-[160px]">
                              {r.equipment?.name || "Gear Item"}
                            </span>
                            <span className="text-[10px] text-outline font-mono uppercase">
                              {r.equipment?.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-on-surface">{r.creator?.name || "Creator"}</span>
                          <span className="text-[10px] text-outline">{r.creator?.email}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div>{r.startDateFormatted}</div>
                        <div className="text-outline">To {r.endDateFormatted} ({r.durationText})</div>
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-on-surface">
                        {r.quantity} unit(s)
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-on-surface">
                        {r.totalAmountFormatted}
                      </td>

                      <td className="py-3 px-4">
                        {r.status === "APPROVED" || r.status === "ACTIVE" ? (
                          <span className="inline-flex items-center gap-1 text-tertiary font-label-sm text-[10px] uppercase font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                            {r.status}
                          </span>
                        ) : r.status === "PENDING" ? (
                          <span className="inline-flex items-center gap-1 text-primary-container font-label-sm text-[10px] uppercase font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                            PENDING
                          </span>
                        ) : r.status === "REJECTED" ? (
                          <span className="inline-flex items-center gap-1 text-error font-label-sm text-[10px] uppercase font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                            REJECTED
                          </span>
                        ) : (
                          <span className="text-outline font-label-sm text-[10px] uppercase">
                            {r.status}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {r.status === "PENDING" && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(r.id, "APPROVED", "PENDING")}
                              className="px-2.5 py-1 rounded bg-primary-container hover:bg-secondary-container text-on-primary-container font-medium transition-colors cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(r.id, "REJECTED", "PENDING")}
                              className="px-2 py-1 rounded bg-error-container/20 hover:bg-error-container/30 text-error font-medium transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        {r.status === "APPROVED" && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(r.id, "ACTIVE", "APPROVED")}
                              className="px-2.5 py-1 rounded bg-tertiary/20 hover:bg-tertiary/30 text-tertiary font-medium transition-colors cursor-pointer"
                              title="Mark gear as picked up and in production"
                            >
                              Hand Over
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedRentalDetails(r)}
                              className="text-outline hover:text-on-surface ml-1 cursor-pointer"
                            >
                              Details
                            </button>
                          </div>
                        )}

                        {r.status === "ACTIVE" && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(r.id, "RETURNED", "ACTIVE")}
                            className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-medium transition-colors cursor-pointer border border-surface-container-high"
                          >
                            Mark Returned
                          </button>
                        )}

                        {r.status === "RETURNED" && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(r.id, "COMPLETED", "RETURNED")}
                              className="px-2.5 py-1 rounded bg-secondary-container hover:bg-primary-container text-on-secondary-container font-medium transition-colors cursor-pointer"
                              title="Complete rental order"
                            >
                              Mark Completed
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedRentalDetails(r)}
                              className="text-outline hover:text-on-surface ml-1 cursor-pointer"
                            >
                              Details
                            </button>
                          </div>
                        )}

                        {["COMPLETED", "REJECTED", "CANCELLED"].includes(r.status) && (
                          <button
                            type="button"
                            onClick={() => setSelectedRentalDetails(r)}
                            className="text-outline hover:text-on-surface cursor-pointer"
                          >
                            View Details
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: View Details */}
        {selectedRentalDetails && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
                <div>
                  <h3 className="font-headline-sm text-lg font-bold text-on-surface">
                    Rental Inspection
                  </h3>
                  <span className="text-xs font-mono text-outline">ID: {selectedRentalDetails.id}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRentalDetails(null)}
                  className="text-outline hover:text-on-surface cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="flex flex-col gap-2.5 text-xs">
                <div className="p-3 bg-surface-container rounded-lg border border-surface-container-high flex justify-between">
                  <span className="text-outline uppercase">Gear:</span>
                  <span className="font-semibold text-on-surface">{selectedRentalDetails.equipment?.name}</span>
                </div>
                <div className="p-3 bg-surface-container rounded-lg border border-surface-container-high flex justify-between">
                  <span className="text-outline uppercase">Creator:</span>
                  <span className="text-on-surface">{selectedRentalDetails.creator?.name} ({selectedRentalDetails.creator?.email})</span>
                </div>
                <div className="p-3 bg-surface-container rounded-lg border border-surface-container-high flex justify-between">
                  <span className="text-outline uppercase">Schedule:</span>
                  <span className="font-mono text-on-surface">{selectedRentalDetails.startDateFormatted} → {selectedRentalDetails.endDateFormatted}</span>
                </div>
                <div className="p-3 bg-surface-container rounded-lg border border-surface-container-high flex justify-between">
                  <span className="text-outline uppercase">Quantity:</span>
                  <span className="font-mono text-on-surface">{selectedRentalDetails.quantity} Unit(s)</span>
                </div>
                <div className="p-3 bg-surface-container rounded-lg border border-surface-container-high flex justify-between">
                  <span className="text-outline uppercase">Rental Tariff:</span>
                  <span className="font-mono text-tertiary font-bold text-sm">{selectedRentalDetails.totalAmountFormatted}</span>
                </div>
                {selectedRentalDetails.notes && (
                  <div className="p-3 bg-surface-container rounded-lg border border-surface-container-high flex flex-col gap-1">
                    <span className="text-outline uppercase">Creator Notes:</span>
                    <span className="text-on-surface">{selectedRentalDetails.notes}</span>
                  </div>
                )}
                <div className="p-3 bg-surface-container rounded-lg border border-surface-container-high flex justify-between">
                  <span className="text-outline uppercase">Status:</span>
                  <span className="font-bold uppercase font-mono text-primary-container">{selectedRentalDetails.status}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-container-high">
                <button
                  type="button"
                  onClick={() => setSelectedRentalDetails(null)}
                  className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-body-sm font-medium transition-colors cursor-pointer"
                >
                  Close
                </button>
                {selectedRentalDetails.status === "PENDING" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedRentalDetails.id, "REJECTED", "PENDING")}
                      className="px-3 py-2 rounded-lg bg-error-container/20 hover:bg-error-container/30 text-error text-body-sm font-medium transition-colors cursor-pointer"
                    >
                      Reject Request
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedRentalDetails.id, "APPROVED", "PENDING")}
                      className="px-4 py-2 rounded-lg bg-primary-container hover:bg-secondary-container text-on-primary-container text-body-sm font-semibold transition-colors cursor-pointer"
                    >
                      Approve Request
                    </button>
                  </>
                )}
                {selectedRentalDetails.status === "APPROVED" && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedRentalDetails.id, "ACTIVE", "APPROVED")}
                    className="px-4 py-2 rounded-lg bg-tertiary/20 hover:bg-tertiary/30 text-tertiary text-body-sm font-semibold transition-colors cursor-pointer"
                  >
                    Mark Handed Over (Active)
                  </button>
                )}
                {selectedRentalDetails.status === "ACTIVE" && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedRentalDetails.id, "RETURNED", "ACTIVE")}
                    className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-body-sm font-semibold transition-colors cursor-pointer border border-surface-container-high"
                  >
                    Mark Returned
                  </button>
                )}
                {selectedRentalDetails.status === "RETURNED" && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedRentalDetails.id, "COMPLETED", "RETURNED")}
                    className="px-4 py-2 rounded-lg bg-secondary-container hover:bg-primary-container text-on-secondary-container text-body-sm font-semibold transition-colors cursor-pointer"
                  >
                    Mark Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ProviderRentals;
