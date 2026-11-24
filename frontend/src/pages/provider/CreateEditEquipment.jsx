import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import * as equipmentApi from "../../services/equipmentApi";
import { useAuth } from "../../hooks/useAuth";

const CATEGORIES = [
  "Microphones",
  "Cameras",
  "Mixers",
  "Lighting",
  "Headphones",
  "Audio Interfaces",
  "Tripods and Stands",
  "Other"
];

const CONDITIONS = [
  { value: "NEW", label: "New (Mint in box)" },
  { value: "LIKE_NEW", label: "Like New (Pre-inspected, perfect condition)" },
  { value: "GOOD", label: "Good (Standard working condition with minor cosmetic signs)" },
  { value: "FAIR", label: "Fair (Fully functional)" }
];

function CreateEditEquipment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Microphones");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [condition, setCondition] = useState("GOOD");
  const [city, setCity] = useState("Delhi");
  const [address, setAddress] = useState("");
  const [pricingUnit, setPricingUnit] = useState("HOURLY");
  const [hourlyRate, setHourlyRate] = useState("");
  const [dailyRate, setDailyRate] = useState("");
  const [totalQuantity, setTotalQuantity] = useState("1");
  const [minimumRentalHours, setMinimumRentalHours] = useState("1");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [specList, setSpecList] = useState(["XLR Connection", "Original Mount Included"]);
  const [newSpec, setNewSpec] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    let active = true;
    if (id) {
      equipmentApi
        .getEquipmentById(id)
        .then((data) => {
          if (active) {
            if (!data) {
              setNotFound(true);
              setLoading(false);
              return;
            }
            if (data.providerId && user?.id && String(data.providerId) !== String(user.id)) {
              setIsUnauthorized(true);
              setLoading(false);
              return;
            }

            setName(data.name || "");
            setCategory(data.category || "Microphones");
            setBrand(data.brand || "");
            setModel(data.model || "");
            setCondition(data.condition || "GOOD");
            setCity(data.city || "Delhi");
            setAddress(data.address || "");
            setPricingUnit(data.pricingUnit || "HOURLY");
            setHourlyRate(data.hourlyRate ? String(data.hourlyRate) : "");
            setDailyRate(data.dailyRate ? String(data.dailyRate) : "");
            setTotalQuantity(String(data.totalQuantity || 1));
            setMinimumRentalHours(String(data.minimumRentalHours || 1));
            setDescription(data.description || "");
            setImageUrl(data.imageUrl || data.imageUrls?.[0] || "");
            if (Array.isArray(data.specifications)) {
              setSpecList(data.specifications);
            }
            setLoading(false);
          }
        })
        .catch(() => {
          if (active) {
            setNotFound(true);
            setLoading(false);
          }
        });
    }

    return () => {
      active = false;
    };
  }, [id, user]);

  const handleAddSpec = () => {
    const trimmed = newSpec.trim();
    if (trimmed) {
      setSpecList((prev) => [...prev, trimmed]);
      setNewSpec("");
    }
  };

  const handleRemoveSpec = (index) => {
    setSpecList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    if (!name.trim()) {
      setValidationError("Equipment name is required.");
      return;
    }
    if (!brand.trim()) {
      setValidationError("Brand is required.");
      return;
    }
    if (!model.trim()) {
      setValidationError("Model is required.");
      return;
    }
    if (!address.trim()) {
      setValidationError("Equipment pickup location / address is required.");
      return;
    }
    if (!description.trim()) {
      setValidationError("Description is required.");
      return;
    }

    const numHourly = hourlyRate ? Number(hourlyRate) : null;
    const numDaily = dailyRate ? Number(dailyRate) : null;

    if (!numHourly && !numDaily) {
      setValidationError("Please specify at least one rental rate (hourly or daily).");
      return;
    }

    const qty = Number(totalQuantity);
    if (!qty || qty < 1) {
      setValidationError("Total quantity must be at least 1.");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: name.trim(),
      category: category.trim(),
      brand: brand.trim(),
      model: model.trim(),
      condition,
      city,
      address: address.trim(),
      pricingUnit,
      hourlyRate: numHourly,
      dailyRate: numDaily,
      totalQuantity: qty,
      minimumRentalHours: Number(minimumRentalHours) || 1,
      description: description.trim(),
      specifications: specList,
      imageUrls: imageUrl.trim()
        ? [imageUrl.trim()]
        : ["https://lh3.googleusercontent.com/aida-public/AB6AXuAY5Js5asS-K45ETzqtnRCzez9QWi4Sf9mwbsY7UZTFsPEh_BK_4nfW"]
    };

    try {
      if (isEditMode) {
        await equipmentApi.updateEquipment(id, payload);
      } else {
        await equipmentApi.createEquipment(payload);
      }
      setIsSubmitting(false);
      navigate("/provider/equipment");
    } catch (err) {
      setIsSubmitting(false);
      setValidationError(err?.message || "Failed to save equipment configuration.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout activePath="/provider/equipment">
        <div className="flex flex-col gap-6 py-8 animate-pulse">
          <div className="h-8 bg-surface-container-high rounded w-64"></div>
          <div className="h-96 bg-surface-container-low rounded-xl"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (isUnauthorized) {
    return (
      <DashboardLayout activePath="/provider/equipment">
        <div className="py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-error-container/20 border border-error-container/40 flex items-center justify-center text-error mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">lock</span>
          </div>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Access Denied</h2>
          <p className="font-body-md text-outline max-w-sm mx-auto mb-6">
            You can only edit equipment listings that you own.
          </p>
          <Link
            to="/provider/equipment"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-container text-on-primary-container font-body-sm font-medium"
          >
            Return to My Equipment
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  if (notFound) {
    return (
      <DashboardLayout activePath="/provider/equipment">
        <div className="py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-error-container/20 border border-error-container/40 flex items-center justify-center text-error mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">hearing_disabled</span>
          </div>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Equipment Not Found</h2>
          <p className="font-body-md text-outline max-w-sm mx-auto mb-6">
            The requested equipment could not be found or has been removed.
          </p>
          <Link
            to="/provider/equipment"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-container text-on-primary-container font-body-sm font-medium"
          >
            Return to Equipment List
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activePath="/provider/equipment">
      <div className="flex flex-col gap-6 pb-16">
        {/* Header */}
        <div className="flex flex-col gap-1 pt-4 border-b border-surface-container-high pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-label-sm text-[10px] px-2 py-0.5 rounded bg-tertiary/20 text-tertiary font-mono uppercase tracking-wider">
              PROVIDER CONSOLE
            </span>
            <span className="text-outline text-xs">• Gear Inventory Editor</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-label-sm uppercase tracking-wider text-outline mb-1">
            <Link to="/provider/equipment" className="hover:text-on-surface transition-colors">
              My Equipment
            </Link>
            <span>/</span>
            <span className="text-on-surface">{isEditMode ? "Edit Gear" : "List New Gear"}</span>
          </div>
          <h1 className="font-headline-lg text-2xl font-bold text-on-surface tracking-tight">
            {isEditMode ? `Edit ${name || "Equipment"}` : "List Equipment for Rent"}
          </h1>
          <p className="text-sm text-outline">
            {isEditMode
              ? "Update pricing, available quantity, condition, and equipment details."
              : "Publish microphones, cameras, mixers, or lights to start receiving rental requests."}
          </p>
        </div>

        {validationError && (
          <div className="p-3 bg-error-container/20 border border-error-container/40 rounded-xl text-error text-body-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span className="font-medium">{validationError}</span>
            </div>
            <button
              type="button"
              onClick={() => setValidationError("")}
              className="text-error hover:opacity-80 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Core Specs */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-6 flex flex-col gap-4 shadow-sm">
              <span className="font-label-sm text-xs uppercase tracking-wider text-tertiary font-bold">
                Equipment Details
              </span>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase font-label-sm text-outline">
                  Equipment Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shure SM7B Vocal Microphone with Cloudlifter"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-surface-container border border-surface-container-high rounded-lg px-3 py-2 text-on-surface text-body-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase font-label-sm text-outline">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-surface-container border border-surface-container-high rounded-lg px-3 py-2 text-on-surface text-body-sm focus:outline-none focus:border-primary cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase font-label-sm text-outline">Brand *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shure"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="bg-surface-container border border-surface-container-high rounded-lg px-3 py-2 text-on-surface text-body-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase font-label-sm text-outline">Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SM7B"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="bg-surface-container border border-surface-container-high rounded-lg px-3 py-2 text-on-surface text-body-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase font-label-sm text-outline">Condition *</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="bg-surface-container border border-surface-container-high rounded-lg px-3 py-2 text-on-surface text-body-sm focus:outline-none focus:border-primary cursor-pointer"
                  >
                    {CONDITIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase font-label-sm text-outline">
                    Total Quantity in Stock *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={totalQuantity}
                    onChange={(e) => setTotalQuantity(e.target.value)}
                    className="bg-surface-container border border-surface-container-high rounded-lg px-3 py-2 text-on-surface text-body-sm font-mono focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase font-label-sm text-outline">Description *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe equipment capabilities, accessories included, cosmetic state, and pickup requirements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-surface-container border border-surface-container-high rounded-lg p-3 text-on-surface text-body-sm focus:outline-none focus:border-primary resize-y"
                />
              </div>

              {/* Specifications List */}
              <div className="flex flex-col gap-2 pt-2 border-t border-surface-container-high">
                <label className="text-xs uppercase font-label-sm text-outline">
                  Key Specifications / Included Accessories
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 4K 10-bit recording, Case included..."
                    value={newSpec}
                    onChange={(e) => setNewSpec(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSpec();
                      }
                    }}
                    className="flex-1 bg-surface-container border border-surface-container-high rounded-lg px-3 py-1.5 text-on-surface text-body-sm focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg text-xs font-medium border border-surface-container-high cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-1">
                  {specList.map((spec, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container text-on-surface-variant text-xs"
                    >
                      <span>{spec}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(index)}
                        className="text-outline hover:text-error cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & Location */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-6 flex flex-col gap-4 shadow-sm">
              <span className="font-label-sm text-xs uppercase tracking-wider text-tertiary font-bold">
                Pricing &amp; Location
              </span>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase font-label-sm text-outline">
                  Primary Pricing Unit *
                </label>
                <select
                  value={pricingUnit}
                  onChange={(e) => setPricingUnit(e.target.value)}
                  className="bg-surface-container border border-surface-container-high rounded-lg px-3 py-2 text-on-surface text-body-sm focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="HOURLY">Hourly Rental Rate</option>
                  <option value="DAILY">Daily Rental Rate</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase font-label-sm text-outline">
                    Hourly Rate (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-outline text-xs font-mono">₹</span>
                    <input
                      type="number"
                      placeholder="e.g. 200"
                      min="1"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      className="w-full bg-surface-container border border-surface-container-high rounded-lg pl-7 pr-3 py-2 text-on-surface text-body-sm font-mono focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase font-label-sm text-outline">
                    Daily Rate (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-outline text-xs font-mono">₹</span>
                    <input
                      type="number"
                      placeholder="e.g. 1200"
                      min="1"
                      value={dailyRate}
                      onChange={(e) => setDailyRate(e.target.value)}
                      className="w-full bg-surface-container border border-surface-container-high rounded-lg pl-7 pr-3 py-2 text-on-surface text-body-sm font-mono focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase font-label-sm text-outline">
                  Minimum Rental Duration (Hours)
                </label>
                <input
                  type="number"
                  min="1"
                  value={minimumRentalHours}
                  onChange={(e) => setMinimumRentalHours(e.target.value)}
                  className="bg-surface-container border border-surface-container-high rounded-lg px-3 py-2 text-on-surface text-body-sm font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-surface-container-high">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase font-label-sm text-outline">City *</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-surface-container border border-surface-container-high rounded-lg px-3 py-2 text-on-surface text-body-sm focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="Delhi">Delhi</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bengaluru">Bengaluru</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase font-label-sm text-outline">Pickup Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="Building, Road, Area..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="bg-surface-container border border-surface-container-high rounded-lg px-3 py-2 text-on-surface text-body-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 pt-2 border-t border-surface-container-high">
                <label className="text-xs uppercase font-label-sm text-outline">
                  Equipment Photo URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="bg-surface-container border border-surface-container-high rounded-lg px-3 py-2 text-on-surface text-body-sm focus:outline-none focus:border-primary"
                />
                {imageUrl && (
                  <div className="h-32 w-full rounded-lg bg-surface-container overflow-hidden mt-1 border border-surface-container-high">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-container-high">
                <Link
                  to="/provider/equipment"
                  className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-body-sm font-medium transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-primary-container hover:bg-secondary-container text-on-primary-container text-body-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {isSubmitting ? "Saving..." : isEditMode ? "Save Changes" : "Publish Gear"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default CreateEditEquipment;
