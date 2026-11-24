import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import * as equipmentApi from "../../services/equipmentApi";

const CATEGORIES = [
  "All Categories",
  "Microphones",
  "Cameras",
  "Mixers",
  "Lighting",
  "Headphones",
  "Audio Interfaces",
  "Tripods and Stands",
  "Other"
];

const CITIES = ["All Cities", "Delhi", "Mumbai", "Bengaluru"];

function BrowseEquipment() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });

  const loadEquipment = async (targetPage = page) => {
    setLoading(true);
    setError("");
    try {
      const filters = { page: targetPage, limit: 12 };
      if (selectedCategory !== "All Categories") filters.category = selectedCategory;
      if (selectedCity !== "All Cities") filters.city = selectedCity;
      if (search.trim()) filters.search = search.trim();
      if (maxPrice && Number(maxPrice) > 0) filters.maxPrice = maxPrice;

      const data = await equipmentApi.getEquipment(filters);
      const items = Array.isArray(data) ? data : (data.equipment || []);
      setEquipmentList(items);
      if (data && data.pagination) {
        setPagination(data.pagination);
      }
      setLoading(false);
    } catch (err) {
      setError(err?.message || "Failed to load equipment catalog.");
      setEquipmentList([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const filters = { page, limit: 12 };
    if (selectedCategory !== "All Categories") filters.category = selectedCategory;
    if (selectedCity !== "All Cities") filters.city = selectedCity;
    if (search.trim()) filters.search = search.trim();
    if (maxPrice && Number(maxPrice) > 0) filters.maxPrice = maxPrice;

    equipmentApi.getEquipment(filters)
      .then((data) => {
        if (active) {
          const items = Array.isArray(data) ? data : (data.equipment || []);
          setEquipmentList(items);
          if (data && data.pagination) {
            setPagination(data.pagination);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err?.message || "Failed to load equipment catalog.");
          setEquipmentList([]);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedCategory, selectedCity, search, maxPrice, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadEquipment(1);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("All Categories");
    setSelectedCity("All Cities");
    setMaxPrice("");
    setPage(1);
    equipmentApi.getEquipment({ page: 1, limit: 12 }).then((data) => {
      const items = Array.isArray(data) ? data : (data.equipment || []);
      setEquipmentList(items);
      if (data && data.pagination) {
        setPagination(data.pagination);
      }
    });
  };

  return (
    <DashboardLayout activePath="/creator/equipment">
      <div className="flex flex-col w-full pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md py-4 border-b border-surface-container-high mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-label-sm text-[10px] px-2 py-0.5 rounded bg-primary-container/20 text-primary font-mono uppercase tracking-wider">
                CREATOR WORKSPACE
              </span>
              <span className="text-outline text-xs">• Equipment Marketplace</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface font-semibold tracking-tight">
              Rent Pro Podcast &amp; Video Gear
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Discover industry-grade microphones, cinema cameras, consoles, and lights available for hourly and daily rental.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/creator/rentals"
              className="inline-flex items-center gap-2 px-space-md h-[42px] bg-surface-container hover:bg-surface-container-high text-on-surface border border-surface-container-high rounded-lg font-body-sm text-body-sm font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] text-tertiary">inventory_2</span>
              <span>My Rentals</span>
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-4 mb-6 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-4 flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                Search Gear
              </label>
              <div className="relative">
                <span className="material-symbols-outlined text-[18px] text-outline absolute left-3 top-2.5 pointer-events-none">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Microphone, FX3, Rodecaster..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-surface-container border border-surface-container-high rounded-lg pl-9 pr-3 py-2 text-on-surface font-body-sm text-body-sm placeholder:text-outline/60 focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="md:col-span-3 flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-surface-container border border-surface-container-high rounded-lg px-3 py-2 text-on-surface font-body-sm text-body-sm focus:outline-none focus:border-primary cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                Location
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-surface-container border border-surface-container-high rounded-lg px-3 py-2 text-on-surface font-body-sm text-body-sm focus:outline-none focus:border-primary cursor-pointer"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                Max Price (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 2000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-surface-container border border-surface-container-high rounded-lg px-3 py-2 text-on-surface font-body-sm text-body-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div className="md:col-span-1 flex items-center gap-2">
              <button
                type="submit"
                className="w-full h-[38px] rounded-lg bg-primary-container hover:bg-secondary-container text-on-primary-container flex items-center justify-center cursor-pointer transition-colors"
                title="Search"
              >
                <span className="material-symbols-outlined text-[18px]">search</span>
              </button>
            </div>
          </form>

          {(search || selectedCategory !== "All Categories" || selectedCity !== "All Cities" || maxPrice) && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-surface-container-high text-xs text-outline">
              <span>Active filters:</span>
              <button
                type="button"
                onClick={clearFilters}
                className="text-primary hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
                <span>Reset all filters</span>
              </button>
            </div>
          )}
        </div>

        {/* Catalog Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 bg-surface-container-low rounded-xl border border-surface-container-high"></div>
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center bg-surface-container-low border border-error-container/40 rounded-xl">
            <div className="w-16 h-16 rounded-full bg-error-container/20 border border-error-container/30 flex items-center justify-center text-error mx-auto mb-4">
              <span className="material-symbols-outlined text-[32px]">sync_problem</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-1">
              Failed to load equipment
            </h3>
            <p className="font-body-md text-body-md text-outline max-w-sm mx-auto mb-6">{error}</p>
            <button
              type="button"
              onClick={loadEquipment}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-body-sm font-medium border border-surface-container-high cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>Retry</span>
            </button>
          </div>
        ) : equipmentList.length === 0 ? (
          <div className="p-12 text-center bg-surface-container-low border border-surface-container-high rounded-xl">
            <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center text-outline mx-auto mb-4">
              <span className="material-symbols-outlined text-[32px]">inventory_2</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-1">
              No equipment found
            </h3>
            <p className="font-body-md text-body-md text-outline max-w-sm mx-auto mb-6">
              No gear listings match your active filters. Try broadening your category or location filters.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-container text-on-primary-container text-body-sm font-medium hover:bg-secondary-container transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipmentList.map((eq) => {
              const displayRate = eq.pricingUnit === "DAILY" && eq.dailyRate
                ? `₹${Number(eq.dailyRate).toLocaleString()} / day`
                : `₹${Number(eq.hourlyRate || eq.dailyRate || 500).toLocaleString()} / hr`;

              return (
                <div
                  key={eq.id}
                  className="bg-surface-container-lowest border border-surface-container-high hover:border-surface-variant rounded-xl overflow-hidden shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Image Header */}
                    <div className="relative h-48 w-full bg-surface-container overflow-hidden">
                      <img
                        src={eq.imageUrl || eq.imageUrls?.[0] || "https://lh3.googleusercontent.com/aida-public/AB6AXuAY5Js5asS-K45ETzqtnRCzez9QWi4Sf9mwbsY7UZTFsPEh_BK_4nfW"}
                        alt={eq.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://lh3.googleusercontent.com/aida-public/AB6AXuAY5Js5asS-K45ETzqtnRCzez9QWi4Sf9mwbsY7UZTFsPEh_BK_4nfW";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent"></div>

                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur-md text-tertiary font-label-sm text-[11px] font-semibold uppercase tracking-wider border border-tertiary/20">
                          {eq.category}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-label-sm text-[11px] border border-surface-container-high">
                          {eq.condition?.replace("_", " ") || "GOOD"}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur-md text-outline font-label-sm text-[11px] flex items-center gap-1 border border-surface-container-high">
                          <span className="material-symbols-outlined text-[12px]">location_on</span>
                          <span>{eq.city}</span>
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-mono text-outline uppercase tracking-wider block">
                            {eq.brand} • {eq.model}
                          </span>
                          <h3 className="font-body-md text-base font-semibold text-on-surface mt-0.5 line-clamp-1">
                            {eq.name}
                          </h3>
                        </div>
                      </div>

                      <p className="font-caption text-caption text-outline line-clamp-2">
                        {eq.description}
                      </p>

                      {/* Specs pills */}
                      {eq.specifications && eq.specifications.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {eq.specifications.slice(0, 3).map((spec, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-[10px]"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-4 pt-3 border-t border-surface-container-high/60 flex items-center justify-between bg-surface-container-low/30">
                    <div>
                      <span className="font-label-sm text-[10px] text-outline uppercase block">
                        RENTAL RATE
                      </span>
                      <span className="font-mono text-body-md font-bold text-on-surface">
                        {displayRate}
                      </span>
                    </div>

                    <Link
                      to={`/creator/equipment/${eq.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-container hover:bg-secondary-container text-on-primary-container font-body-sm text-body-sm font-medium transition-colors shadow-sm"
                    >
                      <span>Rent Gear</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination controls */}
        {!loading && !error && pagination.totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-surface-container-low border border-surface-container-high">
            <span className="font-caption text-xs text-outline font-mono">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} gear items)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg border border-surface-container-high bg-surface-container text-xs font-medium text-on-surface hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-xs font-mono font-bold text-on-surface">
                {page} / {pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="px-3 py-1.5 rounded-lg border border-surface-container-high bg-surface-container text-xs font-medium text-on-surface hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default BrowseEquipment;
