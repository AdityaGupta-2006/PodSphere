import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import * as studioApi from "../../services/studioApi";
import * as bookingApi from "../../services/bookingApi";
import { useAuth } from "../../hooks/useAuth";

function BrowseStudios() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const todayStr = new Date().toISOString().split("T")[0];

  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedStudio, setSelectedStudio] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState(todayStr);
  const [bookingSlot, setBookingSlot] = useState("10:00 AM - 12:00 PM");
  const [bookingError, setBookingError] = useState("");
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [toast, setToast] = useState({ visible: false, title: "", message: "" });

  const showToast = (title, message) => {
    setToast({ visible: true, title, message });
    setTimeout(() => {
      setToast({ visible: false, title: "", message: "" });
    }, 3200);
  };

  useEffect(() => {
    let active = true;
    studioApi
      .getStudios()
      .then((data) => {
        if (active) {
          setStudios(data || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setStudios([]);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredStudios = studios.filter((studio) => {
    const matchesCity =
      selectedCity === "all" ||
      studio.city.toLowerCase() === selectedCity.toLowerCase();

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (studio.name && studio.name.toLowerCase().includes(q)) ||
      (studio.city && studio.city.toLowerCase().includes(q)) ||
      (studio.address && studio.address.toLowerCase().includes(q)) ||
      (studio.description && studio.description.toLowerCase().includes(q)) ||
      (Array.isArray(studio.gear) &&
        studio.gear.some((g) => typeof g === "string" && g.toLowerCase().includes(q)));

    const matchesPrice = !maxPrice || Number(studio.hourlyRate) <= Number(maxPrice);

    return matchesCity && matchesSearch && matchesPrice;
  });

  const handleOpenBookingModal = (studio) => {
    setSelectedStudio(studio);
    setBookingDate(todayStr);
    setBookingSlot("10:00 AM - 12:00 PM");
    setBookingError("");
    setBookingModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedStudio) return;

    if (!bookingDate) {
      setBookingError("Please select a session date.");
      return;
    }

    const selectedDate = new Date(`${bookingDate}T23:59:59`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setBookingError("Booking date cannot be in the past.");
      return;
    }

    setIsSubmittingBooking(true);
    setBookingError("");

    const durationHours = 2;
    const rate = Number(selectedStudio.hourlyRate) || 1500;
    const totalAmount = rate * durationHours;

    const dateObj = new Date(`${bookingDate}T00:00:00`);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const dayOfWeek = dateObj.toLocaleDateString("en-US", { weekday: "long" });

    const bookingPayload = {
      studioId: selectedStudio.id,
      studioName: selectedStudio.name,
      location: `${selectedStudio.city} • ${selectedStudio.address ? selectedStudio.address.split(",")[0] : "Studio Deck"}`,
      city: selectedStudio.city,
      creatorId: user?.id || "usr-creator-1",
      creatorName: user?.name || "Verified Creator",
      creatorEmail: user?.email || "creator@podsphere.net",
      date: formattedDate,
      rawDate: bookingDate,
      day: dayOfWeek,
      time: bookingSlot,
      duration: `${durationHours}.0 Hours Allocated`,
      hourlyRate: rate,
      rate: `₹${rate.toLocaleString()}/hr rack rate`,
      amount: `₹${totalAmount.toLocaleString()}`,
      rawAmount: totalAmount,
      totalPrice: totalAmount,
    };

    try {
      await bookingApi.createBooking(bookingPayload);
      setIsSubmittingBooking(false);
      setBookingModalOpen(false);
      showToast("Booking Request Submitted", "Pending Provider Confirmation");
      setTimeout(() => {
        navigate("/creator/bookings");
      }, 700);
    } catch (err) {
      setIsSubmittingBooking(false);
      setBookingError(err.message || "Could not complete booking.");
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCity("all");
    setMaxPrice("");
  };

  return (
    <DashboardLayout activePath="/creator/studios">
      <div className="flex flex-col gap-space-lg pb-space-xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pt-space-md border-b border-surface-container-high pb-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-label-sm text-[10px] px-2 py-0.5 rounded bg-primary-container/20 text-primary font-mono uppercase tracking-wider">
                CREATOR WORKSPACE
              </span>
              <span className="text-outline text-xs">• Studio Discovery &amp; Booking</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              Browse Recording Studios
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
              Discover verified podcast studios in Delhi, Mumbai, and Bengaluru. Filter by city, gear, or hourly rate, and lock your session in seconds.
            </p>
          </div>

          <div className="flex items-center gap-space-sm">
            <Link
              className="flex items-center gap-space-xs px-space-md h-10 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm border border-surface-container-high transition-colors"
              to="/creator/bookings"
            >
              <span className="material-symbols-outlined text-[18px]">event_available</span>
              <span>My Bookings</span>
            </Link>
          </div>
        </div>

        <div className="p-space-md bg-surface-container-lowest border border-surface-container-high rounded-xl flex flex-col md:flex-row gap-space-md items-center justify-between">
          <div className="relative flex-1 w-full">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
              search
            </span>
            <input
              className="w-full bg-surface-container border border-surface-container-high rounded-lg pl-9 pr-space-md py-2 text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
              placeholder="Search studio name, microphone model, or location..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-space-sm w-full md:w-auto">
            <div className="relative">
              <select
                className="bg-surface-container border border-surface-container-high rounded-lg px-space-md py-2 text-on-surface font-body-sm text-body-sm focus:outline-none focus:border-primary appearance-none cursor-pointer pr-8"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="all">All Cities</option>
                <option value="Delhi">Delhi / NCR</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Bengaluru">Bengaluru</option>
              </select>
              <span className="material-symbols-outlined text-outline text-[16px] absolute right-2.5 top-2.5 pointer-events-none">
                unfold_more
              </span>
            </div>

            <div className="relative">
              <select
                className="bg-surface-container border border-surface-container-high rounded-lg px-space-md py-2 text-on-surface font-body-sm text-body-sm focus:outline-none focus:border-primary appearance-none cursor-pointer pr-8"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              >
                <option value="">Any Tariff</option>
                <option value="1600">≤ ₹1,600 / hr</option>
                <option value="2000">≤ ₹2,000 / hr</option>
                <option value="2500">≤ ₹2,500 / hr</option>
              </select>
              <span className="material-symbols-outlined text-outline text-[16px] absolute right-2.5 top-2.5 pointer-events-none">
                unfold_more
              </span>
            </div>

            {(searchQuery || selectedCity !== "all" || maxPrice) && (
              <button
                className="px-space-sm py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface font-label-sm text-label-sm uppercase tracking-wider transition-colors cursor-pointer"
                onClick={handleClearFilters}
                type="button"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg animate-pulse">
            <div className="h-80 rounded-xl bg-surface-container-lowest border border-surface-container-high"></div>
            <div className="h-80 rounded-xl bg-surface-container-lowest border border-surface-container-high"></div>
            <div className="h-80 rounded-xl bg-surface-container-lowest border border-surface-container-high"></div>
          </div>
        ) : filteredStudios.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-space-xl rounded-xl bg-surface-container-lowest border border-surface-container-high text-center">
            <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center text-outline mb-space-md">
              <span className="material-symbols-outlined text-[32px]">travel_explore</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-1">
              No matching studios found
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mb-space-md">
              Try adjusting your search criteria or resetting filters to see available broadcast spaces.
            </p>
            <button
              className="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm uppercase tracking-wider transition-colors cursor-pointer"
              onClick={handleClearFilters}
              type="button"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
            {filteredStudios.map((studio) => (
              <div
                key={studio.id}
                className="flex flex-col rounded-xl bg-surface-container-lowest border border-surface-container-high/50 overflow-hidden hover:border-surface-variant transition-colors group shadow-lg"
              >
                <div className="relative h-48 w-full bg-surface-container-low overflow-hidden">
                  <img
                    alt={studio.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    src={studio.imageUrl || studio.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuAY5Js5asS-K45ETzqtnRCzez9QWi4Sf9mwbsY7UZTFsPEh_BK_4nfW"}
                    onError={(e) => {
                      e.target.src = "https://lh3.googleusercontent.com/aida-public/AB6AXuAY5Js5asS-K45ETzqtnRCzez9QWi4Sf9mwbsY7UZTFsPEh_BK_4nfW";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent"></div>
                  <div className="absolute top-space-sm left-space-sm flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur-md text-tertiary font-label-sm text-[10px] uppercase font-semibold border border-tertiary/20">
                      {studio.status || "LIVE READY"}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-label-sm text-[10px] border border-surface-container-high">
                      <span className="material-symbols-outlined text-[11px] text-outline">location_on</span>
                      <span>{studio.city}</span>
                    </span>
                  </div>
                  <div className="absolute bottom-space-sm right-space-sm">
                    <span className="px-2.5 py-1 rounded bg-surface-container-lowest/95 backdrop-blur-md text-on-surface font-mono text-body-sm font-semibold border border-surface-container-high">
                      ₹{Number(studio.hourlyRate).toLocaleString()} / hr
                    </span>
                  </div>
                </div>

                <div className="flex flex-col p-space-md gap-space-md flex-1 justify-between">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-headline-sm text-body-lg font-semibold text-on-surface group-hover:text-primary transition-colors">
                      {studio.name}
                    </h3>
                    <p className="font-caption text-caption text-outline truncate">
                      {studio.address}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mt-1">
                      {studio.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 py-1">
                    {(Array.isArray(studio.gear) ? studio.gear.slice(0, 3) : []).map((g, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-mono text-[10px] border border-surface-container-high"
                      >
                        {g}
                      </span>
                    ))}
                    {Array.isArray(studio.gear) && studio.gear.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-outline font-mono text-[10px]">
                        +{studio.gear.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-space-xs border-t border-surface-container-high">
                    <button
                      className="flex-1 h-9 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm transition-colors cursor-pointer"
                      onClick={() => handleOpenBookingModal(studio)}
                      type="button"
                    >
                      View Details
                    </button>
                    <button
                      className="flex-1 h-9 rounded-lg bg-primary-container hover:bg-inverse-primary text-on-primary font-body-sm text-body-sm font-medium transition-colors shadow-sm cursor-pointer"
                      onClick={() => handleOpenBookingModal(studio)}
                      type="button"
                    >
                      Book Session
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {bookingModalOpen && selectedStudio && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-container-lowest/80 backdrop-blur-sm overflow-y-auto">
            <div className="flex flex-col w-full max-w-xl max-h-[90vh] overflow-y-auto my-auto rounded-xl bg-surface-container-low p-space-lg shadow-2xl border border-surface-container-high">
              <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high mb-space-md">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-primary-container/20 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
                  </div>
                  <div>
                    <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                      Reserve Session Slot
                    </h2>
                    <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider">
                      {selectedStudio.name} • {selectedStudio.city}
                    </span>
                  </div>
                </div>
                <button
                  className="text-outline hover:text-on-surface"
                  onClick={() => setBookingModalOpen(false)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {bookingError && (
                <div className="flex items-center justify-between p-space-sm bg-error-container/20 rounded-lg text-error border border-error-container/40 mb-space-md">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-body-lg">error</span>
                    <span className="font-label-md text-label-md">{bookingError}</span>
                  </div>
                  <button
                    className="text-error hover:opacity-80 cursor-pointer"
                    onClick={() => setBookingError("")}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-body-md">close</span>
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-space-md">
                <div className="p-space-sm bg-surface-container rounded-lg border border-surface-container-high flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-body-sm text-body-sm font-medium text-on-surface">
                      {selectedStudio.name}
                    </span>
                    <span className="font-caption text-caption text-outline">
                      {selectedStudio.city} • {selectedStudio.address}
                    </span>
                  </div>
                  <span className="font-mono text-body-md font-semibold text-primary">
                    ₹{Number(selectedStudio.hourlyRate).toLocaleString()} / hr
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                  <div className="flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                      Session Date
                    </label>
                    <input
                      className="bg-surface-container border border-surface-container-high rounded-lg px-space-sm py-2 text-on-surface font-body-sm text-body-sm focus:outline-none focus:border-primary"
                      min={todayStr}
                      type="date"
                      value={bookingDate}
                      onChange={(e) => {
                        setBookingDate(e.target.value);
                        setBookingError("");
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                      Time Window
                    </label>
                    <select
                      className="bg-surface-container border border-surface-container-high rounded-lg px-space-sm py-2 text-on-surface font-body-sm text-body-sm focus:outline-none focus:border-primary appearance-none cursor-pointer"
                      value={bookingSlot}
                      onChange={(e) => {
                        setBookingSlot(e.target.value);
                        setBookingError("");
                      }}
                    >
                      <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM (2.0 hrs)</option>
                      <option value="14:00 - 16:00">14:00 - 16:00 (2.0 hrs)</option>
                      <option value="16:30 - 18:30">16:30 - 18:30 (2.0 hrs)</option>
                      <option value="19:00 - 21:00">19:00 - 21:00 (2.0 hrs)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                    Included Gear Rack
                  </span>
                  <div className="flex flex-wrap gap-1.5 p-2 bg-surface-container-lowest rounded-lg border border-surface-container-high max-h-24 overflow-y-auto">
                    {(Array.isArray(selectedStudio.gear) ? selectedStudio.gear : []).map((g, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-mono text-[11px]"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-space-sm bg-surface-container-lowest rounded-lg border border-surface-container-high flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                    Estimated Total (2 hrs)
                  </span>
                  <span className="font-headline-sm text-headline-sm font-semibold text-tertiary">
                    ₹{(Number(selectedStudio.hourlyRate || 1500) * 2).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-space-sm pt-space-lg border-t border-surface-container-high mt-space-md">
                <button
                  className="px-space-md h-[38px] rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface font-body-sm text-body-sm transition-colors cursor-pointer"
                  onClick={() => setBookingModalOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="px-space-md h-[38px] rounded-lg bg-primary-container hover:bg-inverse-primary text-on-primary font-body-sm text-body-sm font-medium transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                  disabled={isSubmittingBooking}
                  onClick={handleConfirmBooking}
                  type="button"
                >
                  {isSubmittingBooking ? "Locking Session..." : "Confirm & Lock Session"}
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
          id="toast-feedback-browse"
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

export default BrowseStudios;
