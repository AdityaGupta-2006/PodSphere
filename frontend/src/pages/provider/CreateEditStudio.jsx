import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import * as studioApi from "../../services/studioApi";
import { useAuth } from "../../hooks/useAuth";

function CreateEditStudio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const isEditMode = Boolean(id);
  const [loadingStudio, setLoadingStudio] = useState(isEditMode);
  const [studioNotFound, setStudioNotFound] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  const [studioName, setStudioName] = useState("");
  const [city, setCity] = useState("Delhi");
  const [address, setAddress] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [description, setDescription] = useState("");
  const [equipmentList, setEquipmentList] = useState([
    "4x Shure SM7B Microphones",
    "Rodecaster Pro II Console",
    "2x Sony FX3 4K Cameras",
  ]);
  const [newGear, setNewGear] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageFileName, setImageFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    let isMounted = true;
    if (id) {
      studioApi
        .getStudioById(id)
        .then((found) => {
          if (isMounted) {
            if (found) {
              if (found.providerId && user?.id && String(found.providerId) !== String(user.id)) {
                setIsUnauthorized(true);
                setLoadingStudio(false);
                return;
              }
              setStudioName(found.name || "");
              setCity(found.city || "Delhi");
              setAddress(found.address || "");
              setHourlyRate(String(found.hourlyRate || ""));
              setDescription(found.description || "");
              if (Array.isArray(found.gear)) {
                setEquipmentList(found.gear);
              }
              if (found.imageUrl) {
                setImagePreview(found.imageUrl);
              }
              setStudioNotFound(false);
            } else {
              setStudioNotFound(true);
            }
            setLoadingStudio(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setStudioNotFound(true);
            setLoadingStudio(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [id, user]);

  const handleAddEquipment = () => {
    const trimmed = newGear.trim();
    if (trimmed) {
      setEquipmentList((prev) => [...prev, trimmed]);
      setNewGear("");
    }
  };

  const handleRemoveEquipment = (index) => {
    setEquipmentList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFileName(file.name);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setImagePreview(uploadEvent.target?.result || "");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBrowseFilesClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = () => {
    setImagePreview("");
    setImageFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmitSpecs = async (e) => {
    e.preventDefault();
    setValidationError("");

    const trimmedName = studioName.trim();
    const trimmedAddress = address.trim();
    const trimmedDesc = description.trim();
    const numRate = Number(hourlyRate);

    if (!trimmedName) {
      setValidationError("Studio name is required.");
      return;
    }
    if (!city) {
      setValidationError("Please select a city.");
      return;
    }
    if (!trimmedAddress) {
      setValidationError("Studio address is required.");
      return;
    }
    if (!numRate || numRate <= 0) {
      setValidationError("Hourly rate must be a valid positive number.");
      return;
    }
    if (!trimmedDesc) {
      setValidationError("Studio description is required.");
      return;
    }

    setIsSubmitting(true);
    const studioPayload = {
      name: trimmedName,
      city,
      address: trimmedAddress,
      hourlyRate: numRate,
      description: trimmedDesc,
      gear: equipmentList,
      equipment: equipmentList,
      imageUrl: imagePreview || "https://lh3.googleusercontent.com/aida-public/AB6AXuAY5Js5asS-K45ETzqtnRCzez9QWi4Sf9mwbsY7UZTFsPEh_BK_4nfW",
      status: "LIVE READY",
      providerId: user?.id || "usr-provider-1",
    };

    try {
      if (id) {
        await studioApi.updateStudio(id, studioPayload);
      } else {
        await studioApi.createStudio(studioPayload);
      }
      setIsSubmitting(false);
      navigate("/provider/studios");
    } catch (err) {
      setIsSubmitting(false);
      setValidationError(err.message || "Failed to save studio configuration.");
    }
  };

  if (loadingStudio) {
    return (
      <DashboardLayout activePath="/provider/studios">
        <div className="flex flex-col gap-space-lg py-space-xl animate-pulse">
          <div className="h-8 bg-surface-container-high rounded w-64"></div>
          <div className="h-96 bg-surface-container-low rounded-xl"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (isUnauthorized) {
    return (
      <DashboardLayout activePath="/provider/studios">
        <div className="mt-space-md w-full bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-xl flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-error-container/20 border border-error-container/40 flex items-center justify-center text-error mb-space-md">
            <span className="material-symbols-outlined text-[32px]">lock</span>
          </div>
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Access Denied
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-2 mb-space-lg">
            You can only manage and edit studios that you own.
          </p>
          <div className="flex items-center gap-space-md">
            <Link
              className="px-space-md py-2 rounded-lg bg-primary-container text-on-primary-container font-body-sm font-medium"
              to="/provider/studios"
            >
              Return to My Studios
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (studioNotFound) {
    return (
      <DashboardLayout activePath="/provider/studios">
        <div className="mt-space-md w-full bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-xl flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-error-container/20 border border-error-container/40 flex items-center justify-center text-error mb-space-md">
            <span className="material-symbols-outlined text-[32px]">hearing_disabled</span>
          </div>
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Studio Not Found
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-2 mb-space-lg">
            The requested studio could not be found or has been removed.
          </p>
          <div className="flex items-center gap-space-md">
            <Link
              className="px-space-md py-2 rounded-lg bg-primary-container text-on-primary-container font-body-sm font-medium"
              to="/provider/studios"
            >
              Return to Studios
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activePath="/provider/studios">
      <div className="flex flex-col gap-space-lg pb-space-xl">
        <input
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          ref={fileInputRef}
          type="file"
        />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pt-space-md">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-label-sm text-[10px] px-2 py-0.5 rounded bg-tertiary/20 text-tertiary font-mono uppercase tracking-wider">
                PROVIDER CONSOLE
              </span>
              <span className="text-outline text-xs">• Studio Listing Editor</span>
            </div>
            <nav className="flex items-center gap-space-xs font-label-sm text-label-sm uppercase tracking-wider text-outline mb-1">
              <Link className="hover:text-on-surface transition-colors" to="/provider/studios">
                My Studios
              </Link>
              <span className="text-surface-variant">/</span>
              <span className="text-on-surface">
                {isEditMode ? "Edit Studio" : "Add Studio"}
              </span>
            </nav>
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              {isEditMode ? "Edit Studio" : "Create Studio"}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {isEditMode
                ? "Update pricing, location, and equipment configuration."
                : "Add details for creators to discover and book your studio space."}
            </p>
          </div>
        </div>

        {validationError && (
          <div className="flex items-center justify-between p-space-sm bg-error-container/20 rounded-lg text-error border border-error-container/40">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-body-lg">error</span>
              <span className="font-label-md text-label-md uppercase tracking-wider">
                {validationError}
              </span>
            </div>
            <button
              className="text-error hover:opacity-80 cursor-pointer"
              onClick={() => setValidationError("")}
              type="button"
            >
              <span className="material-symbols-outlined text-body-md">close</span>
            </button>
          </div>
        )}

        <form
          className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg"
          onSubmit={handleSubmitSpecs}
        >
          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl overflow-hidden flex flex-col">
              <div className="bg-surface-container-low px-space-md py-space-sm border-b border-surface-container-high">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold">
                  Core Details
                </span>
              </div>

              <div className="p-space-md flex flex-col gap-space-md">
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold" htmlFor="studio-name-input">
                    Studio Name *
                  </label>
                  <input
                    className="w-full bg-surface-container border border-surface-container-high rounded-lg px-space-md py-2 text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary transition-colors placeholder:text-outline/60"
                    id="studio-name-input"
                    placeholder="e.g. Echo Room Studio"
                    required
                    type="text"
                    value={studioName}
                    onChange={(e) => setStudioName(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold" htmlFor="city-select">
                    City *
                  </label>
                  <div className="relative">
                    <select
                      className="w-full bg-surface-container border border-surface-container-high rounded-lg px-space-md py-2 text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                      id="city-select"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    >
                      <option value="Delhi">Delhi / NCR</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Bengaluru">Bengaluru</option>
                    </select>
                    <span className="material-symbols-outlined text-outline text-[18px] absolute right-3 top-2.5 pointer-events-none">
                      unfold_more
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold" htmlFor="address-input">
                    Address *
                  </label>
                  <input
                    className="w-full bg-surface-container border border-surface-container-high rounded-lg px-space-md py-2 text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary transition-colors placeholder:text-outline/60"
                    id="address-input"
                    placeholder="Building, street, area"
                    required
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold" htmlFor="hourly-rate-input">
                    Hourly Rate (₹) *
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-on-surface-variant font-mono">₹</span>
                    <input
                      className="w-full bg-surface-container border border-surface-container-high rounded-lg pl-8 pr-space-md py-2 text-on-surface font-mono font-medium focus:outline-none focus:border-primary transition-colors"
                      id="hourly-rate-input"
                      min="1"
                      placeholder="1,500"
                      required
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl overflow-hidden flex flex-col">
              <div className="bg-surface-container-low px-space-md py-space-sm border-b border-surface-container-high">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold">
                  Description &amp; Equipment
                </span>
              </div>

              <div className="p-space-md flex flex-col gap-space-md">
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold" htmlFor="studio-description-input">
                    Description *
                  </label>
                  <textarea
                    className="w-full bg-surface-container border border-surface-container-high rounded-lg p-space-md text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary transition-colors placeholder:text-outline/60 resize-y min-h-[120px]"
                    id="studio-description-input"
                    placeholder="Describe acoustic isolation, microphone setup, seating, and studio amenities..."
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-space-sm">
                  <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold">
                    Equipment List
                  </label>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="material-symbols-outlined text-outline text-[18px] absolute left-3 top-2.5 pointer-events-none">
                        mic
                      </span>
                      <input
                        className="w-full bg-surface-container border border-surface-container-high rounded-lg pl-9 pr-space-md py-2 text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary transition-colors placeholder:text-outline/60"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddEquipment();
                          }
                        }}
                        placeholder="Add equipment (e.g. Shure SM7B)..."
                        type="text"
                        value={newGear}
                        onChange={(e) => setNewGear(e.target.value)}
                      />
                    </div>
                    <button
                      className="px-space-md py-2 bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-sm text-label-sm uppercase tracking-wider rounded-lg border border-surface-container-highest transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                      onClick={handleAddEquipment}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px] text-primary">add</span>
                      <span>Add</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-space-xs min-h-[80px] p-space-sm bg-surface-container/50 border border-surface-container-high rounded-lg">
                    {equipmentList.length === 0 ? (
                      <div className="flex items-center justify-center w-full py-4 text-outline font-label-sm text-label-sm">
                        No equipment added yet.
                      </div>
                    ) : (
                      equipmentList.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container border border-surface-container-high text-on-surface text-body-sm"
                        >
                          <span className="font-mono text-[12px]">{item}</span>
                          <button
                            className="ml-1 text-outline hover:text-primary transition-colors cursor-pointer"
                            onClick={() => handleRemoveEquipment(index)}
                            title="Remove"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[14px]">close</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="border border-dashed border-surface-container-high rounded-lg p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-md bg-surface-container/20">
                  <div className="flex items-center gap-space-md">
                    {imagePreview ? (
                      <div className="w-14 h-14 rounded-lg overflow-hidden border border-surface-container-highest shrink-0 bg-surface-container-high">
                        <img
                          alt="Stage preview"
                          className="w-full h-full object-cover"
                          src={imagePreview}
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded bg-surface-container-high flex items-center justify-center text-outline shrink-0">
                        <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-body-sm text-body-sm font-medium text-on-surface">
                        Studio Photo
                      </span>
                      <span className="font-caption text-caption text-outline truncate max-w-xs">
                        {imageFileName || "Attach a photo of the studio."}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {imagePreview && (
                      <button
                        className="px-space-sm py-1 bg-surface-container-low hover:bg-error-container text-error border border-surface-container-high rounded font-label-sm text-label-sm uppercase tracking-wider transition-colors cursor-pointer"
                        onClick={handleRemovePhoto}
                        type="button"
                      >
                        Remove
                      </button>
                    )}
                    <button
                      className="px-space-sm py-1 bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant border border-surface-container-high rounded font-label-sm text-label-sm uppercase tracking-wider transition-colors cursor-pointer"
                      onClick={handleBrowseFilesClick}
                      type="button"
                    >
                      {imagePreview ? "Change Photo" : "Browse Files"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md flex items-center justify-end gap-space-sm">
              <Link
                className="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-surface-container-high font-body-sm text-body-sm transition-colors"
                to="/provider/studios"
              >
                Cancel
              </Link>
              <button
                className="px-space-lg py-2 rounded-lg bg-primary-container hover:bg-secondary-container text-on-primary-container font-body-sm text-body-sm font-semibold transition-colors inline-flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-60"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{isEditMode ? "Update Studio" : "Create Studio"}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default CreateEditStudio;
