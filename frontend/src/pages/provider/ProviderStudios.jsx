import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";

function ProviderStudios() {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedStudio, setSelectedStudio] = useState("Echo Room Studio (Delhi)");
  const [studios, setStudios] = useState([
    {
      id: "ERS-011",
      slug: "echo-room",
      name: "Echo Room Studio",
      location: "Delhi",
      rate: "1,500",
      description: "Treated acoustic broadcast space with multi-camera live switching and Shure vocal microphones.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAY5Js5asS-K45ETzqtnRCzez9QWi4Sf9mwbsY7UZTFsPEh_BK_4nfWvTvpCv_nl-CtWXx_VqLCzE6buXIni92Bs7j97ZHTNYdNwYtqrNLimCTdNa8UQOVOWZWTCxv9OUq4aNR2eBj4QyWamGd8AXEtaSHs02VvcRKf5dxOm0wKiHB_juMHnQxF7FvMEanRznJafA6ghE2NXA185WvWBPZCwHWmQx_7d5ltDOkIvW4pDQf0prAlZG0",
      gear: ["4x Shure SM7B", "Rodecaster Pro II", "2x Blackmagic 4K", "Sound Booth"],
      bookingsCount: 8,
      createdDate: "Sep 14, 2026",
    },
    {
      id: "SPL-042",
      slug: "precision-lab",
      name: "Soundstage Precision Lab",
      location: "Mumbai",
      rate: "2,200",
      description: "High-ceiling industrial soundstage optimized for multi-guest interview podcasts and video shows.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA7oQaCfARyz3Z5Cfvozlp6-tuYUO8fjPj8HPPQ2HqOrrFpyXFTLQZOsPc7Dl3Y2nlkfcxhFG4XCAx6u_w9MsuRbY8bwimDQ31eIwVG2uCKwsbMbrl7zM2ACGtPg6R4fwf0XyG2N5-dHcEAsNtzJBzKooyo1cPL-a8mLTZ88jlQAR7oQP4E_LZ5wZojs73JOF4vwoNgxrYee-TndEBwsx5MG9VgnALJmnuhoyfkUFHPRanQvJm9bnQ",
      gear: ["Sennheiser MKH 416", "Allen & Heath SQ-5", "Aputure 300d II Lighting"],
      bookingsCount: 6,
      createdDate: "Sep 22, 2026",
    },
  ]);

  const handleDeleteClick = (studioName) => {
    setSelectedStudio(studioName);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    setStudios((prev) => prev.filter((s) => !selectedStudio.includes(s.name)));
    setDeleteModalOpen(false);
  };

  return (
    <DashboardLayout activePath="/provider/studios">
      <div className="flex flex-col gap-space-xl pb-space-xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pt-space-md">
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-xs">
              <span className="font-label-sm text-label-sm text-outline tracking-wider uppercase">
                PROVIDER NODE // MATRIX 04
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-tertiary"></span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">
              My Studios
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
              Create and manage the podcast studios available to creators.
            </p>
          </div>
          <div className="flex items-center gap-space-sm shrink-0">
            <div className="hidden sm:flex items-center gap-space-xs px-space-sm py-1.5 rounded-lg bg-surface-container-low text-outline font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px]">sensors</span>
              <span>SYNCED {studios.length} ACTIVE</span>
            </div>
            <Link
              className="flex items-center gap-space-xs px-space-md h-[42px] rounded-xl bg-primary-container hover:bg-inverse-primary text-on-primary font-headline-sm text-body-md font-medium transition-colors shadow-md"
              to="/provider/studios/new"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Add Studio</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-space-lg">
          {studios.map((studio) => (
            <div
              key={studio.id}
              className="flex flex-col rounded-xl bg-surface-container-lowest overflow-hidden shadow-xl"
            >
              <div className="relative h-56 w-full bg-surface-container-low overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  alt={studio.name}
                  src={studio.image}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/40 to-transparent"></div>
                <div className="absolute top-space-sm left-space-sm flex items-center gap-space-xs">
                  <span className="font-label-sm text-label-sm px-space-sm py-1 rounded bg-surface-container-lowest/90 backdrop-blur-sm text-tertiary font-medium">
                    LIVE UNIT
                  </span>
                  <span className="font-label-sm text-label-sm px-space-sm py-1 rounded bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px] text-outline">location_on</span>
                    {studio.location}
                  </span>
                </div>
                <div className="absolute bottom-space-sm right-space-sm">
                  <span className="font-label-md text-label-md px-space-sm py-1 rounded bg-surface-container-high/90 text-on-surface font-semibold backdrop-blur-sm">
                    ₹{studio.rate} / hour
                  </span>
                </div>
              </div>

              <div className="flex flex-col p-space-md gap-space-md">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">
                      {studio.name}
                    </h2>
                    <span className="font-label-sm text-label-sm text-outline">ID: {studio.id}</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                    {studio.description}
                  </p>
                </div>

                <div className="flex flex-col gap-space-xs p-space-sm rounded-lg bg-surface-container-low">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">graphic_eq</span>
                    Patch &amp; Hardware Array
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {studio.gear.map((item, i) => (
                      <span
                        key={i}
                        className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-space-sm py-space-xs bg-surface-container-low/40 rounded-lg px-space-sm">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-outline">RESERVATIONS</span>
                    <span className="font-body-md text-body-md font-semibold text-on-surface">
                      {studio.bookingsCount} bookings
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-outline">SYSTEM TIMESTAMP</span>
                    <span className="font-body-md text-body-md text-on-surface-variant">
                      Created {studio.createdDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-space-sm pt-space-xs">
                  <Link
                    className="flex items-center gap-1 px-space-md h-9 rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface font-body-sm text-body-sm transition-colors"
                    to={`/provider/studios/${studio.slug}/edit`}
                  >
                    <span className="material-symbols-outlined text-[16px]">tune</span>
                    <span>Edit</span>
                  </Link>
                  <button
                    className="flex items-center gap-1 px-space-md h-9 rounded-lg bg-surface-container-low hover:bg-error-container text-error font-body-sm text-body-sm transition-colors"
                    onClick={() => handleDeleteClick(`${studio.name} (${studio.location})`)}
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

        <div className="flex flex-col gap-space-sm mt-space-md">
          <div className="flex items-center gap-space-xs">
            <span className="font-label-sm text-label-sm text-outline tracking-wider uppercase">
              REFERENCE STATES // SYSTEM COMPONENT PREVIEWS
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-space-xl rounded-xl bg-surface-container-lowest text-center">
            <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-outline mb-space-sm">
              <span className="material-symbols-outlined text-[28px]">mic_off</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-1">
              No studios yet
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mb-space-md">
              Create your first studio to make it available to creators.
            </p>
            <Link
              className="flex items-center gap-space-xs px-space-md h-[42px] rounded-xl bg-primary-container hover:bg-inverse-primary text-on-primary font-body-md text-body-md font-medium transition-colors"
              to="/provider/studios/new"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Add Studio</span>
            </Link>
          </div>
        </div>

        {deleteModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-space-md bg-surface-container-lowest/80 backdrop-blur-sm"
            id="delete-modal"
          >
            <div className="flex flex-col w-full max-w-md rounded-xl bg-surface-container-low p-space-lg shadow-2xl">
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
              <div className="flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-container-high mb-space-lg">
                <span className="material-symbols-outlined text-outline text-[18px]">radio</span>
                <span className="font-label-md text-label-md text-on-surface font-medium truncate">
                  {selectedStudio}
                </span>
              </div>
              <div className="flex items-center justify-end gap-space-sm">
                <button
                  className="px-space-md h-[38px] rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface font-body-sm text-body-sm transition-colors"
                  onClick={() => setDeleteModalOpen(false)}
                  type="button"
                >
                  Keep studio
                </button>
                <button
                  className="px-space-md h-[38px] rounded-lg bg-primary-container hover:bg-inverse-primary text-on-primary font-body-sm text-body-sm font-medium transition-colors shadow-sm"
                  onClick={handleConfirmDelete}
                  type="button"
                >
                  Delete studio
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ProviderStudios;
