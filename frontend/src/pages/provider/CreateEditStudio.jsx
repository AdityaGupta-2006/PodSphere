import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";

function CreateEditStudio() {
  const { id } = useParams();
  const [mode, setMode] = useState(id ? "edit" : "create");
  const [studioName, setStudioName] = useState(id ? "Echo Room Studio" : "");
  const [city, setCity] = useState("Delhi");
  const [address, setAddress] = useState(
    id ? "Suite 402, Okhla Phase III, Industrial Area" : ""
  );
  const [hourlyRate, setHourlyRate] = useState(id ? "1500" : "");
  const [description, setDescription] = useState(
    id
      ? "Professional podcast recording environment with isolated double-wall acoustic construction, low noise floor (-62 dBFS), and multi-channel monitoring."
      : ""
  );
  const [equipmentList, setEquipmentList] = useState([
    "4x Shure SM7B Microphones",
    "Rodecaster Pro II Console",
    "2x Sony FX3 4K Cameras",
    "Aputure Amaran 200x Lighting",
    "Audio-Technica M50x Headphones (4 pairs)",
  ]);
  const [newGear, setNewGear] = useState("");
  const [toast, setToast] = useState({
    visible: false,
    title: "",
    message: "",
  });

  const showToast = (title, message) => {
    setToast({ visible: true, title, message });
    setTimeout(() => {
      setToast({ visible: false, title: "", message: "" });
    }, 3200);
  };

  const handleAddEquipment = () => {
    const trimmed = newGear.trim();
    if (trimmed) {
      setEquipmentList((prev) => [...prev, trimmed]);
      setNewGear("");
      showToast("Hardware Tag Inserted", `Mounted "${trimmed}" to studio rack.`);
    }
  };

  const handleRemoveEquipment = (index) => {
    const removed = equipmentList[index];
    setEquipmentList((prev) => prev.filter((_, i) => i !== index));
    showToast("Hardware Tag Unmounted", `Removed "${removed}".`);
  };

  const handleSwitchMode = (newMode) => {
    setMode(newMode);
    if (newMode === "create") {
      setStudioName("");
      setCity("Delhi");
      setAddress("");
      setHourlyRate("");
      setDescription("");
      setEquipmentList([
        "4x Shure SM7B Microphones",
        "Rodecaster Pro II Console",
        "2x Sony FX3 4K Cameras",
        "Aputure Amaran 200x Lighting",
        "Audio-Technica M50x Headphones (4 pairs)",
      ]);
    } else if (newMode === "edit") {
      setStudioName("Echo Room Studio");
      setCity("Delhi");
      setAddress("Suite 402, Okhla Phase III, Industrial Area");
      setHourlyRate("1500");
      setDescription(
        "Professional podcast recording environment with isolated double-wall acoustic construction, low noise floor (-62 dBFS), and multi-channel monitoring."
      );
      setEquipmentList([
        "4x Shure SM7B Microphones",
        "Rodecaster Pro II Console",
        "2x Sony FX3 4K Cameras",
        "Aputure Amaran 200x Lighting",
        "Audio-Technica M50x Headphones (4 pairs)",
      ]);
      showToast("Studio Loaded", "Loaded hardware configuration for Echo Room Studio.");
    }
  };

  const handleSubmitSpecs = (e) => {
    e.preventDefault();
    showToast(
      "Configuration Committed",
      `Studio "${studioName || "Unit"}" stored at ₹${hourlyRate || "0"}/hr.`
    );
  };

  const tabButtonClass = (targetMode) => {
    if (mode === targetMode) {
      return "px-space-md py-1.5 rounded font-label-sm text-label-sm uppercase tracking-wider transition-colors bg-surface-container-high text-primary font-semibold";
    }
    return "px-space-md py-1.5 rounded font-label-sm text-label-sm uppercase tracking-wider transition-colors text-outline hover:text-on-surface";
  };

  const tabIconClass = (targetMode) => {
    if (mode === targetMode) {
      return "px-space-sm py-1.5 rounded font-label-sm text-label-sm uppercase tracking-wider transition-colors bg-surface-container-high text-primary font-semibold";
    }
    return "px-space-sm py-1.5 rounded font-label-sm text-label-sm uppercase tracking-wider transition-colors text-outline hover:text-on-surface";
  };

  return (
    <DashboardLayout activePath="/provider/studios">
      <div className="flex flex-col w-full pb-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md py-space-md">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-outline tracking-wider uppercase">
              <Link className="hover:text-on-surface transition-colors" to="/provider/studios">
                My Studios
              </Link>
              <span className="text-surface-variant">/</span>
              <span className="text-primary font-medium" id="breadcrumb-current">
                {mode === "create"
                  ? "Add Studio"
                  : mode === "edit"
                  ? "Edit Echo Room"
                  : mode === "loading"
                  ? "Synchronizing..."
                  : "Not Found"}
              </span>
            </div>
            <div className="flex items-center gap-space-md mt-1">
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight" id="page-title">
                {mode === "create"
                  ? "Create Studio"
                  : mode === "edit"
                  ? "Edit Studio"
                  : mode === "loading"
                  ? "Fetching Studio Telemetry"
                  : "Studio Inaccessible"}
              </h1>
              <span
                className={`font-label-sm text-label-sm px-2 py-0.5 rounded uppercase tracking-widest ${
                  mode === "create"
                    ? "bg-tertiary/10 text-tertiary border border-tertiary/30"
                    : mode === "edit"
                    ? "bg-secondary-container/40 text-secondary border border-secondary-container"
                    : mode === "loading"
                    ? "bg-surface-container-high text-outline"
                    : "bg-error/10 text-error border border-error/30"
                }`}
                id="mode-badge"
              >
                {mode === "create"
                  ? "NEW SPEC"
                  : mode === "edit"
                  ? "ST-804 / ACTIVE"
                  : mode === "loading"
                  ? "STANDBY"
                  : "FAULT"}
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl" id="page-subtext">
              {mode === "create"
                ? "Add the details creators need to understand and book your studio."
                : mode === "edit"
                ? "Update operational parameters, telemetry ratings, and studio inventory for active listings."
                : mode === "loading"
                ? "Polling studio rack controller bus..."
                : "Record not registered or offline."}
            </p>
          </div>

          <div className="flex items-center bg-surface-container-lowest p-1 rounded-lg border border-surface-container-high self-start md:self-center">
            <button
              className={tabButtonClass("create")}
              id="tab-create"
              onClick={() => handleSwitchMode("create")}
              type="button"
            >
              Create Mode
            </button>
            <button
              className={tabButtonClass("edit")}
              id="tab-edit"
              onClick={() => handleSwitchMode("edit")}
              type="button"
            >
              Edit Mode (#ST-804)
            </button>
            <button
              className={tabIconClass("loading")}
              id="tab-preview-loading"
              onClick={() => handleSwitchMode("loading")}
              title="Inspect Skeleton View"
              type="button"
            >
              <span className="material-symbols-outlined text-[14px] align-middle">hourglass_top</span>
            </button>
            <button
              className={tabIconClass("notfound")}
              id="tab-preview-error"
              onClick={() => handleSwitchMode("notfound")}
              title="Inspect 404 View"
              type="button"
            >
              <span className="material-symbols-outlined text-[14px] align-middle">error_outline</span>
            </button>
          </div>
        </div>

        {(mode === "create" || mode === "edit") && (
          <div className="mt-space-md flex flex-col gap-space-lg" id="studio-form-container">
            <div className="w-full bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md flex flex-wrap items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-md">
                <div className="h-10 w-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[22px]">settings_input_component</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                      CHASSIS SPECIFICATION
                    </span>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                    <span className="font-label-sm text-label-sm text-tertiary font-mono">
                      CALIBRATION 01
                    </span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Rack Unit Model: Audio-Over-IP Broadcast Array v2.4
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-space-lg">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="font-label-sm text-label-sm text-outline uppercase">
                    NOISE FLOOR TARGET
                  </span>
                  <span className="font-label-md text-label-md text-on-surface font-mono">
                    &lt; -60 dBFS RMS
                  </span>
                </div>
                <div className="hidden sm:flex flex-col text-right">
                  <span className="font-label-sm text-label-sm text-outline uppercase">
                    COMPLIANCE CODE
                  </span>
                  <span className="font-label-md text-label-md text-tertiary font-mono">EBU R128 PASS</span>
                </div>
                <div className="px-space-sm py-1 rounded bg-surface-container-low border border-surface-container-high font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-tertiary">verified</span>
                  <span>SYSTEM READY</span>
                </div>
              </div>
            </div>

            <form
              className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg"
              id="studio-editor-form"
              onSubmit={handleSubmitSpecs}
            >
              <div className="lg:col-span-5 flex flex-col gap-space-lg">
                <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl overflow-hidden flex flex-col">
                  <div className="bg-surface-container-low px-space-md py-space-sm border-b border-surface-container-high flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold">
                        UNIT 01: Core Parameters
                      </span>
                    </div>
                    <span className="font-label-sm text-label-sm text-outline font-mono">SLOT-A</span>
                  </div>
                  <div className="p-space-md flex flex-col gap-space-md">
                    <div className="flex flex-col gap-1.5">
                      <label
                        className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface flex justify-between"
                        htmlFor="studio-name-input"
                      >
                        <span>
                          Studio name <span className="text-primary">*</span>
                        </span>
                        <span className="text-outline lowercase font-normal">req</span>
                      </label>
                      <div className="relative">
                        <input
                          className="w-full bg-surface-container border border-surface-container-high rounded-lg px-space-md py-2 text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary transition-colors placeholder:text-outline/60"
                          id="studio-name-input"
                          placeholder="e.g. Downtown Podcast Studio"
                          required
                          type="text"
                          value={studioName}
                          onChange={(e) => setStudioName(e.target.value)}
                        />
                      </div>
                      <p className="font-caption text-caption text-outline">
                        Choose a clear, recognizable name for creators.
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface flex justify-between"
                        htmlFor="studio-city-input"
                      >
                        <span>
                          City <span className="text-primary">*</span>
                        </span>
                        <span className="text-outline lowercase font-normal">req</span>
                      </label>
                      <div className="relative">
                        <select
                          className="w-full bg-surface-container border border-surface-container-high rounded-lg px-space-md py-2 text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                          id="studio-city-input"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        >
                          <option disabled value="">
                            Select deployment metro
                          </option>
                          <option value="Delhi">Delhi / NCR</option>
                          <option value="Mumbai">Mumbai</option>
                          <option value="Bengaluru">Bengaluru</option>
                          <option value="Hyderabad">Hyderabad</option>
                          <option value="Pune">Pune</option>
                        </select>
                        <span className="material-symbols-outlined text-[18px] text-outline absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          unfold_more
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface flex justify-between"
                        htmlFor="studio-address-input"
                      >
                        <span>
                          Address <span className="text-primary">*</span>
                        </span>
                        <span className="text-outline lowercase font-normal">physical location</span>
                      </label>
                      <input
                        className="w-full bg-surface-container border border-surface-container-high rounded-lg px-space-md py-2 text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary transition-colors placeholder:text-outline/60"
                        id="studio-address-input"
                        placeholder="Suite, building number, street name"
                        required
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface flex justify-between"
                        htmlFor="studio-rate-input"
                      >
                        <span>
                          Hourly rate <span className="text-primary">*</span>
                        </span>
                        <span className="text-tertiary lowercase font-normal font-mono">INR / HR</span>
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center bg-surface-container-high/60 border-r border-surface-container-high rounded-l-lg text-on-surface font-label-md text-label-md">
                          ₹
                        </div>
                        <input
                          className="w-full bg-surface-container border border-surface-container-high rounded-lg pl-12 pr-space-md py-2 text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary transition-colors placeholder:text-outline/60 font-mono"
                          id="studio-rate-input"
                          min="1"
                          placeholder="1,500"
                          required
                          step="50"
                          type="number"
                          value={hourlyRate}
                          onChange={(e) => setHourlyRate(e.target.value)}
                        />
                      </div>
                      <p className="font-caption text-caption text-outline">
                        Price per hour. Must be greater than zero.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between pb-space-xs border-b border-surface-container-high">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                      RACK MONITORING SPEC
                    </span>
                    <span className="font-label-sm text-label-sm text-tertiary">CALIBRATED</span>
                  </div>
                  <div className="grid grid-cols-2 gap-space-sm pt-space-xs">
                    <div className="bg-surface-container p-2.5 rounded-lg border border-surface-container-high flex flex-col">
                      <span className="font-label-sm text-label-sm text-outline uppercase text-[10px]">
                        Acoustic RT60
                      </span>
                      <span className="font-label-md text-label-md text-on-surface font-mono font-medium">
                        0.22s (Diffused)
                      </span>
                    </div>
                    <div className="bg-surface-container p-2.5 rounded-lg border border-surface-container-high flex flex-col">
                      <span className="font-label-sm text-label-sm text-outline uppercase text-[10px]">
                        Power Condition
                      </span>
                      <span className="font-label-md text-label-md text-on-surface font-mono font-medium">
                        230V Pure Sine
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-col gap-1">
                    <div className="flex justify-between font-label-sm text-label-sm text-[10px] text-outline">
                      <span>INPUT GAIN LEVEL</span>
                      <span className="font-mono text-tertiary">-18.4 dB</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden flex gap-0.5">
                      <div className="h-full w-2/3 bg-tertiary rounded-l-full"></div>
                      <div className="h-full w-1/6 bg-secondary-fixed"></div>
                      <div className="h-full w-1/12 bg-primary"></div>
                      <div className="h-full flex-1 bg-surface-container"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 flex flex-col gap-space-lg">
                <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl overflow-hidden flex flex-col">
                  <div className="bg-surface-container-low px-space-md py-space-sm border-b border-surface-container-high flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold">
                        UNIT 02: Description &amp; Hardware Spec
                      </span>
                    </div>
                    <span className="font-label-sm text-label-sm text-outline font-mono">SLOT-B</span>
                  </div>
                  <div className="p-space-md flex flex-col gap-space-lg">
                    <div className="flex flex-col gap-1.5">
                      <label
                        className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface flex justify-between"
                        htmlFor="studio-desc-input"
                      >
                        <span>
                          Description <span className="text-primary">*</span>
                        </span>
                        <span className="text-outline lowercase font-normal">markdown supported</span>
                      </label>
                      <textarea
                        className="w-full bg-surface-container border border-surface-container-high rounded-lg p-space-md text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary transition-colors placeholder:text-outline/60 resize-y"
                        id="studio-desc-input"
                        placeholder="Highlight soundproofing, seating capacity, camera angles, and available recording chains..."
                        required
                        rows="4"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      ></textarea>
                      <p className="font-caption text-caption text-outline">
                        Clear descriptions reduce pre-booking inquiries by up to 60%.
                      </p>
                    </div>

                    <div className="flex flex-col gap-space-sm">
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between">
                          <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold">
                            Equipment Rack Configuration
                          </label>
                          <span
                            className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-mono"
                            id="equipment-count-badge"
                          >
                            {equipmentList.length} UNITS MOUNTED
                          </span>
                        </div>
                        <p className="font-caption text-caption text-outline mt-0.5">
                          List hardware gear available for creators during their session.
                        </p>
                      </div>

                      <div className="flex gap-space-sm mt-1">
                        <div className="relative flex-1">
                          <span className="material-symbols-outlined text-[16px] text-outline absolute left-3 top-1/2 -translate-y-1/2">
                            mic
                          </span>
                          <input
                            className="w-full bg-surface-container border border-surface-container-high rounded-lg pl-9 pr-space-md py-2 text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary transition-colors placeholder:text-outline/60"
                            id="new-gear-input"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddEquipment();
                              }
                            }}
                            placeholder="Add hardware equipment (e.g. Cloudlifter CL-1)..."
                            type="text"
                            value={newGear}
                            onChange={(e) => setNewGear(e.target.value)}
                          />
                        </div>
                        <button
                          className="px-space-md py-2 bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-sm text-label-sm uppercase tracking-wider rounded-lg border border-surface-container-highest transition-colors flex items-center gap-1.5 shrink-0"
                          onClick={handleAddEquipment}
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px] text-primary">add</span>
                          <span>Add equipment</span>
                        </button>
                      </div>

                      <div
                        className="flex flex-wrap gap-2 pt-space-xs min-h-[110px] p-space-sm bg-surface-container/50 border border-surface-container-high rounded-lg"
                        id="equipment-tag-cloud"
                      >
                        {equipmentList.length === 0 ? (
                          <div className="flex items-center justify-center w-full py-4 text-outline font-label-sm text-label-sm uppercase tracking-wider">
                            No hardware mounted in rack yet.
                          </div>
                        ) : (
                          equipmentList.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container border border-surface-container-high text-on-surface text-body-sm hover:border-surface-variant transition-colors group"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed"></span>
                              <span className="font-mono text-[12px]">{item}</span>
                              <button
                                className="ml-1 text-outline hover:text-primary transition-colors flex items-center justify-center"
                                onClick={() => handleRemoveEquipment(index)}
                                title="Remove item"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-[14px]">close</span>
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="border border-dashed border-surface-container-high rounded-lg p-space-md flex items-center justify-between bg-surface-container/20">
                      <div className="flex items-center gap-space-md">
                        <div className="w-10 h-10 rounded bg-surface-container-high flex items-center justify-center text-outline">
                          <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-body-sm text-body-sm font-medium text-on-surface">
                            Studio Stage Imagery
                          </span>
                          <span className="font-caption text-caption text-outline">
                            Attach high-resolution visuals of the live audio room.
                          </span>
                        </div>
                      </div>
                      <button
                        className="px-space-sm py-1 bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant border border-surface-container-high rounded font-label-sm text-label-sm uppercase tracking-wider transition-colors"
                        onClick={() => showToast("File Dialog", "Acoustic stage image selected.")}
                        type="button"
                      >
                        Browse Files
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                  <div className="flex items-center gap-space-sm">
                    <span className="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider">
                        Ready for Listing
                      </span>
                      <span className="font-caption text-caption text-outline" id="validation-readout">
                        All fields verified for production listing.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-sm self-end md:self-auto">
                    <Link
                      className="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-surface-container-high font-label-sm text-label-sm uppercase tracking-wider transition-colors inline-flex items-center justify-center"
                      to="/provider/studios"
                    >
                      Cancel
                    </Link>
                    <button
                      className="px-space-lg py-2 rounded-lg bg-primary-container hover:bg-primary-container/90 text-on-primary font-label-sm text-label-sm uppercase tracking-wider font-semibold border border-primary transition-colors inline-flex items-center gap-2 shadow-sm"
                      id="submit-form-button"
                      type="submit"
                    >
                      <span className="material-symbols-outlined text-[18px]">publish</span>
                      <span id="submit-button-text">
                        {mode === "create" ? "Create Studio" : "Update Studio"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {mode === "loading" && (
          <div className="mt-space-md flex flex-col gap-space-lg animate-pulse" id="state-skeleton">
            <div className="w-full bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md flex justify-between items-center">
              <div className="flex items-center gap-space-md">
                <div className="h-10 w-10 bg-surface-container-high rounded-lg"></div>
                <div className="flex flex-col gap-2">
                  <div className="h-3 w-40 bg-surface-container-high rounded"></div>
                  <div className="h-4 w-72 bg-surface-container rounded"></div>
                </div>
              </div>
              <div className="h-6 w-28 bg-surface-container-high rounded"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
              <div className="lg:col-span-5 bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md flex flex-col gap-space-md">
                <div className="h-4 w-32 bg-surface-container-high rounded mb-2"></div>
                <div className="h-10 w-full bg-surface-container rounded-lg"></div>
                <div className="h-10 w-full bg-surface-container rounded-lg"></div>
                <div className="h-10 w-full bg-surface-container rounded-lg"></div>
                <div className="h-10 w-full bg-surface-container rounded-lg"></div>
              </div>
              <div className="lg:col-span-7 bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md flex flex-col gap-space-md">
                <div className="h-4 w-40 bg-surface-container-high rounded mb-2"></div>
                <div className="h-28 w-full bg-surface-container rounded-lg"></div>
                <div className="h-24 w-full bg-surface-container rounded-lg"></div>
              </div>
            </div>
          </div>
        )}

        {mode === "notfound" && (
          <div
            className="mt-space-md w-full bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-xl flex flex-col items-center justify-center text-center"
            id="state-notfound"
          >
            <div className="w-16 h-16 rounded-full bg-error-container/20 border border-error-container/40 flex items-center justify-center text-error mb-space-md">
              <span className="material-symbols-outlined text-[32px]">hearing_disabled</span>
            </div>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-error font-mono">
              ERROR 404: UNIT NOT REGISTERED
            </span>
            <h2 className="font-headline-md text-headline-md text-on-surface mt-1">
              Studio Matrix Record Not Found
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-2 mb-space-lg">
              The specified recording facility identifier does not exist on this cluster or was decommissioned
              by its network provider.
            </p>
            <div className="flex items-center gap-space-md">
              <button
                className="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface border border-surface-container-high font-label-sm text-label-sm uppercase tracking-wider transition-colors"
                onClick={() => handleSwitchMode("create")}
                type="button"
              >
                Deploy New Studio
              </button>
              <Link
                className="px-space-md py-2 rounded-lg bg-primary-container text-on-primary font-label-sm text-label-sm uppercase tracking-wider transition-colors"
                to="/provider/studios"
              >
                Return to Directory
              </Link>
            </div>
          </div>
        )}

        <div
          className={`fixed bottom-6 right-6 bg-surface-container-high border border-surface-container-highest px-space-md py-3 rounded-lg shadow-2xl flex items-center gap-space-md transition-all duration-300 z-50 ${
            toast.visible
              ? "translate-y-0 opacity-100"
              : "translate-y-24 opacity-0 pointer-events-none"
          }`}
          id="toast-feedback"
        >
          <span className="material-symbols-outlined text-tertiary text-[20px]">tune</span>
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm font-semibold uppercase text-on-surface" id="toast-title">
              {toast.title}
            </span>
            <span className="font-caption text-caption text-outline" id="toast-msg">
              {toast.message}
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CreateEditStudio;
