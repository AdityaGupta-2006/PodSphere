import { useEffect } from "react";

const BASE_CSS = `@layer base{html,body{margin:0;padding:0;}body{overscroll-behavior:none;}main>:first-child{margin-top:0!important;}main>:last-child{margin-bottom:0!important;}}::-webkit-scrollbar{display:none;}`;

const TAILWIND_CONFIG = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "on-secondary-fixed-variant": "#93000b",
        "on-background": "#e5e2e1",
        "on-primary-container": "#5c0005",
        "on-tertiary-fixed": "#002109",
        secondary: "#ffb4ab",
        "on-secondary": "#690005",
        "secondary-container": "#a0010d",
        "surface-variant": "#353534",
        "error-container": "#93000a",
        surface: "#131313",
        "inverse-on-surface": "#313030",
        "surface-container-lowest": "#0e0e0e",
        "on-secondary-container": "#ffa99f",
        "tertiary-fixed-dim": "#4ae176",
        "on-primary": "#690006",
        "on-secondary-fixed": "#410002",
        "on-surface-variant": "#e4beb9",
        "surface-container": "#201f1f",
        "tertiary-fixed": "#6bff8f",
        "secondary-fixed-dim": "#ffb4ab",
        "surface-container-low": "#1c1b1b",
        outline: "#ab8985",
        "primary-container": "#ff544c",
        "tertiary-container": "#00a74b",
        background: "#131313",
        "on-primary-fixed": "#410002",
        "surface-container-highest": "#353534",
        tertiary: "#4ae176",
        "on-surface": "#e5e2e1",
        "surface-container-high": "#2a2a2a",
        error: "#ffb4ab",
        "on-primary-fixed-variant": "#93000d",
        "on-tertiary-fixed-variant": "#005321",
        "primary-fixed": "#ffdad6",
        "secondary-fixed": "#ffdad6",
        "inverse-surface": "#e5e2e1",
        "on-tertiary": "#003915",
        "primary-fixed-dim": "#ffb4ac",
        "surface-dim": "#131313",
        "on-error": "#690005",
        "outline-variant": "#5b403d",
        "surface-tint": "#ffb4ac",
        "surface-bright": "#3a3939",
        "on-tertiary-container": "#003111",
        "on-error-container": "#ffdad6",
        primary: "#ffb4ac",
        "inverse-primary": "#bb171c",
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem",
      },
      spacing: {
        "gutter-desktop": "1.5rem",
        "space-lg": "1.5rem",
        "space-md": "1rem",
        "margin-desktop": "2rem",
        "space-xl": "2.5rem",
        margin: "1rem",
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        gutter: "1rem",
      },
      fontFamily: {
        "label-sm": ["JetBrains Mono"],
        "body-sm": ["Geist"],
        "headline-sm": ["Geist"],
        "headline-xl": ["Geist"],
        "body-md": ["Geist"],
        caption: ["Geist"],
        "label-md": ["JetBrains Mono"],
        "headline-xl-mobile": ["Geist"],
        "headline-lg-mobile": ["Geist"],
        "headline-md": ["Geist"],
        "headline-lg": ["Geist"],
        "body-lg": ["Geist"],
      },
      fontSize: {
        "label-sm": ["11px", { lineHeight: "14px", letterSpacing: "0.06em", fontWeight: "500" }],
        "body-sm": ["13px", { lineHeight: "18px", fontWeight: "400" }],
        "headline-sm": ["18px", { lineHeight: "24px", letterSpacing: "-0.005em", fontWeight: "500" }],
        "headline-xl": ["40px", { lineHeight: "48px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "16px", fontWeight: "400" }],
        "label-md": ["12px", { lineHeight: "16px", letterSpacing: "0.04em", fontWeight: "500" }],
        "headline-xl-mobile": ["30px", { lineHeight: "38px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "headline-lg-mobile": ["24px", { lineHeight: "32px", letterSpacing: "-0.015em", fontWeight: "600" }],
        "headline-md": ["22px", { lineHeight: "28px", letterSpacing: "-0.01em", fontWeight: "500" }],
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.015em", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
      },
    },
  },
};

function Home() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;


    html.classList.add("dark");
    html.setAttribute("lang", "en");


    const bodyClasses = ["bg-surface", "font-body-md", "text-on-surface", "antialiased"];
    bodyClasses.forEach((c) => body.classList.add(c));

    const added = [];


    if (!document.querySelector('meta[name="shell-type"]')) {
      const meta = document.createElement("meta");
      meta.setAttribute("name", "shell-type");
      meta.setAttribute("content", "web_standard");
      document.head.appendChild(meta);
      added.push(meta);
    }


    [
      "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200",
      "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap",
    ].forEach((href) => {
      if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
        added.push(link);
      }
    });


    if (!document.getElementById("podsphere-base-css")) {
      const style = document.createElement("style");
      style.id = "podsphere-base-css";
      style.innerHTML = BASE_CSS;
      document.head.appendChild(style);
      added.push(style);
    }

    const applyConfig = () => {
      window.tailwind = window.tailwind || {};
      window.tailwind.config = TAILWIND_CONFIG;
    };

    if (window.tailwind) {
      applyConfig();
    } else if (!document.querySelector('script[src="https://cdn.tailwindcss.com"]')) {
      const script = document.createElement("script");
      script.src = "https://cdn.tailwindcss.com";
      script.onload = applyConfig;
      document.head.appendChild(script);
      added.push(script);
    }

    return () => {
      bodyClasses.forEach((c) => body.classList.remove(c));
    };
  }, []);

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased">
      <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
        <div className="h-16 max-w-7xl mx-auto px-margin-desktop flex items-center justify-between">
          <div className="flex items-center gap-space-lg">
            <a className="flex items-center gap-space-sm text-on-surface" data-path="home" href="#">
              <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container">
                <span className="material-symbols-outlined text-[20px]">mic</span>
              </div>
              <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface uppercase">PodSphere</span>
            </a>
            <nav className="hidden md:flex items-center gap-space-md ml-space-md" data-active-classes="text-on-surface">
              <a className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors px-space-sm py-space-xs" data-path="browse-studios" href="#">Browse Studios</a>
              <a className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors px-space-sm py-space-xs" data-path="how-it-works" href="#">How It Works</a>
              <a className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors px-space-sm py-space-xs" data-path="for-providers" href="#">For Providers</a>
            </nav>
          </div>
          <div className="flex items-center gap-space-sm">
            <a className="h-9 px-space-md flex items-center justify-center font-body-sm text-body-sm text-on-surface bg-surface-container hover:bg-surface-container-high hover:text-on-surface rounded-lg transition-colors" data-path="login" href="#">Log In</a>
            <a className="h-9 px-space-md flex items-center justify-center font-body-sm text-body-sm bg-primary-container text-on-primary-container hover:bg-secondary-container hover:text-on-secondary-container rounded-lg font-medium transition-colors" data-path="register" href="#">Register</a>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-space-xs">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full pt-16 bg-surface min-h-[calc(100vh-80px)]">
        <div className="flex flex-col w-full">

          <section className="relative w-full overflow-hidden bg-surface-container-lowest py-space-xl md:py-24">

            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#e5e2e1_1px,transparent_1px)] [background-size:24px_24px]"></div>
            <div className="relative max-w-7xl mx-auto px-margin-desktop">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-center">

                <div className="lg:col-span-7 flex flex-col items-start space-y-space-md">

                  <div className="flex items-center gap-space-sm px-2.5 py-1 bg-surface-container rounded font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
                    <span>Verified Broadcast Infrastructure</span>
                  </div>
                  <h1 className="font-headline-xl text-headline-xl text-on-surface font-semibold tracking-tight max-w-2xl">
                    Find the right studio for your next episode.
                  </h1>
                  <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl font-normal">
                    PodSphere connects podcast creators with recording studios so you can discover a space, compare rates and book your session.
                  </p>
                  <div className="flex flex-wrap items-center gap-space-md pt-space-sm w-full sm:w-auto">
                    <a className="h-[42px] px-space-lg flex items-center justify-center bg-primary-container text-on-primary-container hover:bg-secondary-container hover:text-on-secondary-container rounded-xl font-body-md text-body-md font-medium transition-colors shadow-sm" data-path="browse-studios" href="#">
                      Browse Studios
                    </a>
                    <a className="h-[42px] px-space-lg flex items-center justify-center bg-surface-container-high text-on-surface hover:bg-surface-variant rounded-xl font-body-md text-body-md font-medium transition-colors shadow-sm" data-path="for-providers" href="#">
                      List Your Studio
                    </a>
                  </div>

                  <div className="pt-space-lg grid grid-cols-3 gap-gutter w-full max-w-lg">
                    <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Acoustics</span>
                      <span className="font-body-md text-body-md font-medium text-on-surface">NRC 0.85+</span>
                    </div>
                    <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Interface</span>
                      <span className="font-body-md text-body-md font-medium text-on-surface">32-Bit Float</span>
                    </div>
                    <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Booking Mode</span>
                      <span className="font-body-md text-body-md font-medium text-on-surface">Direct Sync</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 flex justify-center lg:justify-end mt-space-lg lg:mt-0">
                  <div className="w-full max-w-md bg-surface-container-low rounded-xl overflow-hidden shadow-xl transition-all">

                    <div className="relative h-56 w-full overflow-hidden bg-surface-container">
                      <img
                        className="w-full h-full object-cover"
                        data-alt="Professional broadcast podcast studio in Delhi with high-grade acoustic dark charcoal wooden slat wall panels, two Shure SM7B dynamic microphones mounted on articulated boom arms over a matte black wooden podcast table, cinematic low-key warm spotlighting and studio monitors."
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCw4PIrLPmOCbYeQtk3oslrsn24gFFAZ9mSHI93sbWoXEp2AdK05of05hatH_5UWfBma51faaJWCDqvOsvVT0VIaDFj1w5gAH7pCHjV0ZuK-xqmrlYvDbNIb105zRwzGh_Z1sikeI7oRlMTMvm5oYLWORDpxPb3rAtqBKHPRSOgGRfp6i51Sl7Cx1gwIha3g863zZF80OEDdiRZ5aMX4ES9Tz_mvpgL8ijAVko8iBl8tyl2cHu752g"
                        alt=""
                      />
                      <div className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-sm px-2.5 py-1 rounded font-label-sm text-label-sm text-tertiary uppercase flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                        <span>Ready for Session</span>
                      </div>
                      <div className="absolute bottom-3 right-3 bg-surface-container-lowest/90 backdrop-blur-sm px-2.5 py-1 rounded font-label-sm text-label-sm text-on-surface-variant">
                        ID: DEL-904
                      </div>
                    </div>

                    <div className="p-space-lg flex flex-col space-y-space-md">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Echo Room Studio</h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="material-symbols-outlined text-[16px] text-primary-container">location_on</span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">Delhi</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">₹1,500</div>
                          <div className="font-caption text-caption text-on-surface-variant">per hour</div>
                        </div>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Professional podcast setup with treated acoustic isolation
                      </p>

                      <div className="flex items-center gap-space-sm py-space-xs bg-surface-container px-3 rounded-lg text-on-surface">
                        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">settings_voice</span>
                        <span className="font-label-md text-label-md text-on-surface">4 microphones</span>
                        <span className="text-outline-variant font-label-md">·</span>
                        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">videocam</span>
                        <span className="font-label-md text-label-md text-on-surface">2 cameras</span>
                      </div>

                      <div className="bg-surface-container-lowest p-space-sm rounded-lg flex flex-col gap-1.5">
                        <div className="flex justify-between items-center font-label-sm text-label-sm text-on-surface-variant">
                          <span>ROOM NOISE FLOOR</span>
                          <span className="text-tertiary">-62 dBFS</span>
                        </div>
                        <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden flex gap-0.5">
                          <div className="bg-tertiary h-full w-[45%]"></div>
                          <div className="bg-tertiary-container h-full w-[25%]"></div>
                          <div className="bg-surface-variant h-full w-[30%]"></div>
                        </div>
                      </div>

                      <a className="w-full h-10 flex items-center justify-center bg-surface-container-highest hover:bg-surface-variant text-on-surface rounded-xl font-body-sm text-body-sm font-medium transition-colors" data-path="studio-detail-echo" href="#">
                        View Studio
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>


          <section className="w-full py-space-xl bg-surface">
            <div className="max-w-7xl mx-auto px-margin-desktop">

              <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-xl gap-space-md">
                <div>
                  <span className="font-label-sm text-label-sm text-primary-container uppercase tracking-wider block mb-space-xs">Operational Workflow</span>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">How it works</h2>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                  Standardized three-phase allocation sequence ensuring zero-downtime booking accuracy.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter-desktop">

                <div className="bg-surface-container-low p-space-lg rounded-xl flex flex-col justify-between h-full shadow-sm relative overflow-hidden group hover:bg-surface-container transition-colors">
                  <div className="flex items-center justify-between mb-space-lg">
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">STEP // 01</span>
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface group-hover:text-primary-container transition-colors">
                      <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24" width="20">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" x2="16.65" y1="21" y2="16.65"></line>
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-space-xs mb-space-lg">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Find a studio</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Browse spaces by location, equipment, and hourly rate.
                    </p>
                  </div>

                  <div className="bg-surface-container-lowest p-space-sm rounded-lg flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                      <span>FILTER: GEO + DSP SPECS</span>
                    </div>
                    <span className="text-tertiary">READY</span>
                  </div>
                </div>

                <div className="bg-surface-container-low p-space-lg rounded-xl flex flex-col justify-between h-full shadow-sm relative overflow-hidden group hover:bg-surface-container transition-colors">
                  <div className="flex items-center justify-between mb-space-lg">
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">STEP // 02</span>
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface group-hover:text-primary-container transition-colors">
                      <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24" width="20">
                        <rect height="18" rx="2" ry="2" width="18" x="3" y="4"></rect>
                        <line x1="16" x2="16" y1="2" y2="6"></line>
                        <line x1="8" x2="8" y1="2" y2="6"></line>
                        <line x1="3" x2="21" y1="10" y2="10"></line>
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-space-xs mb-space-lg">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Choose your time</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Select your recording date and session hours with real-time price preview.
                    </p>
                  </div>

                  <div className="bg-surface-container-lowest p-space-sm rounded-lg flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                      <span>SLOT: 14:00 - 18:00 HRS</span>
                    </div>
                    <span className="text-on-surface">CALCULATED</span>
                  </div>
                </div>

                <div className="bg-surface-container-low p-space-lg rounded-xl flex flex-col justify-between h-full shadow-sm relative overflow-hidden group hover:bg-surface-container transition-colors">
                  <div className="flex items-center justify-between mb-space-lg">
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">STEP // 03</span>
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface group-hover:text-primary-container transition-colors">
                      <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24" width="20">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-space-xs mb-space-lg">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Book your session</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Receive an instant confirmed booking with studio access details.
                    </p>
                  </div>

                  <div className="bg-surface-container-lowest p-space-sm rounded-lg flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                      <span>PIN: DEL-ACCESS-CONFIRMED</span>
                    </div>
                    <span className="text-tertiary">LOCKED IN</span>
                  </div>
                </div>
              </div>
            </div>
          </section>


          <section className="w-full py-space-xl bg-surface-container-lowest">
            <div className="max-w-7xl mx-auto px-margin-desktop">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-center">

                <div className="lg:col-span-6 order-2 lg:order-1">
                  <div className="bg-surface-container-low rounded-xl p-space-lg shadow-lg flex flex-col space-y-space-md">

                    <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
                      <div className="flex items-center gap-space-xs">
                        <span className="w-2.5 h-2.5 rounded-full bg-surface-container-highest"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-surface-container-highest"></span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant ml-2 uppercase">CREATOR CONTROL DECK // UNIT 01</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-tertiary">ONLINE</span>
                    </div>

                    <div className="space-y-space-sm">
                      <div className="p-space-sm bg-surface-container rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-space-md">
                          <div className="w-12 h-12 bg-surface-container-high rounded flex items-center justify-center">
                            <span className="material-symbols-outlined text-[20px] text-on-surface-variant">apartment</span>
                          </div>
                          <div>
                            <span className="font-body-md text-body-md font-medium text-on-surface block">Metropolis Broadcast Lab</span>
                            <span className="font-caption text-caption text-on-surface-variant">Mumbai · 4x Sennheiser MKH 416</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-label-md text-label-md text-on-surface block">₹2,200/hr</span>
                          <span className="font-label-sm text-label-sm text-tertiary uppercase">Available Today</span>
                        </div>
                      </div>
                      <div className="p-space-sm bg-surface-container rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-space-md">
                          <div className="w-12 h-12 bg-surface-container-high rounded flex items-center justify-center">
                            <span className="material-symbols-outlined text-[20px] text-on-surface-variant">graphic_eq</span>
                          </div>
                          <div>
                            <span className="font-body-md text-body-md font-medium text-on-surface block">Sonic Loft Studio A</span>
                            <span className="font-caption text-caption text-on-surface-variant">Bengaluru · Blackmagic 6K Pro Suite</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-label-md text-label-md text-on-surface block">₹1,800/hr</span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Instant Confirm</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-surface-container-lowest p-space-sm rounded-lg">
                      <div className="flex justify-between items-center mb-1 font-label-sm text-label-sm text-on-surface-variant">
                        <span>ACOUSTIC RESPONSE PROFILE</span>
                        <span>20Hz - 20kHz FLAT</span>
                      </div>
                      <svg className="w-full h-12 text-primary-container" fill="none" viewBox="0 0 400 48">
                        <path d="M0 24 Q 25 10, 50 24 T 100 24 T 150 6 T 200 38 T 250 18 T 300 30 T 350 12 T 400 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"></path>
                        <path d="M0 24 Q 25 18, 50 24 T 100 24 T 150 16 T 200 30 T 250 22 T 300 26 T 350 20 T 400 24" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col space-y-space-lg">
                  <div>
                    <span className="font-label-sm text-label-sm text-primary-container uppercase tracking-wider block mb-space-xs">Production Infrastructure</span>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">For creators</h2>
                  </div>
                  <div className="space-y-space-md">

                    <div className="flex items-start gap-space-md bg-surface-container-low p-space-md rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container shrink-0">
                        <span className="material-symbols-outlined text-[18px]">search</span>
                      </div>
                      <div>
                        <h3 className="font-body-lg text-body-lg font-medium text-on-surface">Discover recording spaces</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                          Search by city and price.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-space-md bg-surface-container-low p-space-md rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container shrink-0">
                        <span className="material-symbols-outlined text-[18px]">tune</span>
                      </div>
                      <div>
                        <h3 className="font-body-lg text-body-lg font-medium text-on-surface">Compare studio details</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                          See equipment, location and hourly rate.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-space-md bg-surface-container-low p-space-md rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container shrink-0">
                        <span className="material-symbols-outlined text-[18px]">event_available</span>
                      </div>
                      <div>
                        <h3 className="font-body-lg text-body-lg font-medium text-on-surface">Book your session</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                          Choose your recording time and receive a booking confirmation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>


          <section className="w-full py-space-xl bg-surface">
            <div className="max-w-7xl mx-auto px-margin-desktop">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-center">

                <div className="lg:col-span-6 flex flex-col space-y-space-lg">
                  <div>
                    <span className="font-label-sm text-label-sm text-primary-container uppercase tracking-wider block mb-space-xs">Facility Management</span>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">For studio providers</h2>
                  </div>
                  <div className="space-y-space-md">

                    <div className="flex items-start gap-space-md bg-surface-container-low p-space-md rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container shrink-0">
                        <span className="material-symbols-outlined text-[18px]">add_business</span>
                      </div>
                      <div>
                        <h3 className="font-body-lg text-body-lg font-medium text-on-surface">List your studio</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                          Create a studio listing with pricing, location and equipment.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-space-md bg-surface-container-low p-space-md rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container shrink-0">
                        <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
                      </div>
                      <div>
                        <h3 className="font-body-lg text-body-lg font-medium text-on-surface">Manage your spaces</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                          Edit your studio information whenever needed.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-space-md bg-surface-container-low p-space-md rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container shrink-0">
                        <span className="material-symbols-outlined text-[18px]">monitoring</span>
                      </div>
                      <div>
                        <h3 className="font-body-lg text-body-lg font-medium text-on-surface">Track bookings</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                          See upcoming bookings from your dashboard.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-6">
                  <div className="bg-surface-container-low rounded-xl p-space-lg shadow-lg flex flex-col space-y-space-md">
                    <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-[18px] text-primary-container">dashboard</span>
                        <span className="font-label-sm text-label-sm text-on-surface uppercase">PROVIDER CONSOLE // REAL-TIME RACK</span>
                      </div>
                      <span className="font-label-sm text-label-sm bg-surface-container px-2 py-0.5 rounded text-on-surface-variant">SYNC ACTIVE</span>
                    </div>

                    <div className="grid grid-cols-2 gap-space-sm">
                      <div className="bg-surface-container-lowest p-space-sm rounded-lg">
                        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Studio Status</span>
                        <div className="font-body-lg text-body-lg font-semibold text-tertiary mt-1">Live &amp; Bookable</div>
                        <span className="font-caption text-caption text-on-surface-variant">Slot sync armed</span>
                      </div>
                      <div className="bg-surface-container-lowest p-space-sm rounded-lg">
                        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Next Booking</span>
                        <div className="font-body-lg text-body-lg font-semibold text-on-surface mt-1">16:30 IST</div>
                        <span className="font-caption text-caption text-on-surface-variant">Ep. 42 Tracking</span>
                      </div>
                    </div>
                    <div className="relative rounded-lg overflow-hidden h-36 bg-surface-container">
                      <img
                        className="w-full h-full object-cover"
                        data-alt="Modern audio mastering and podcast facility control room featuring an analog mixing board, rack mount equalizers, studio reference monitors, and acoustic wall diffusers in muted charcoal and graphite tones."
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7wJHpvwbciyoM545js6lxs_G-JjHxdZqJwVPVI65f7wW8bMv3glHboZVq6IUjC2O34W1_cg88NL59v1RX-saNdhWjxiszs5Ld_IqX92_0TZ17Pfd-7DL9La0D6jX9_xN6nCSaIJlTrUTD3SBY_FzeiJ0Mrd3z1EffjhHJmJmwKWItbWRMgu5r9XOJpjuJIwpBwyOK24yudc8GlTXGS9gI9KZYJYki0BdYtbnOzdMvKClm7oxNygk"
                        alt=""
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent"></div>
                      <div className="absolute bottom-2.5 left-3">
                        <span className="font-label-sm text-label-sm text-on-surface uppercase font-medium">Facility ID: DEL-MASTER-01</span>
                      </div>
                    </div>

                    <div className="bg-surface-container p-space-sm rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-space-sm">
                        <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                        <span className="font-body-sm text-body-sm text-on-surface">Scheduled: 3 Sessions Today</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">ALL CALENDARS VERIFIED</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>


          <section className="w-full py-24 bg-surface-container-lowest relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(to_right,#e5e2e1_1px,transparent_1px),linear-gradient(to_bottom,#e5e2e1_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
            <div className="relative max-w-4xl mx-auto px-margin-desktop text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary-container mb-space-md shadow-sm">
                <span className="material-symbols-outlined text-[28px]">graphic_eq</span>
              </div>
              <h2 className="font-headline-xl text-headline-xl text-on-surface font-semibold tracking-tight max-w-2xl mb-space-lg">
                Ready to find a recording space?
              </h2>
              <a className="h-[42px] px-space-xl flex items-center justify-center bg-primary-container text-on-primary-container hover:bg-secondary-container hover:text-on-secondary-container rounded-xl font-body-md text-body-md font-medium transition-colors shadow-md" data-path="browse-studios" href="#">
                Browse Studios
              </a>
              <div className="mt-space-lg flex items-center gap-space-lg font-label-sm text-label-sm text-on-surface-variant">
                <span>VERIFIED ACOUSTIC ISOLATION</span>
                <span className="text-outline-variant">/</span>
                <span>STANDARDIZED HOURLY RATES</span>
                <span className="text-outline-variant">/</span>
                <span>INSTANT DISPATCH</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="w-full bg-surface-container-lowest py-space-xl">
        <div className="max-w-7xl mx-auto px-margin-desktop flex flex-col md:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm">
            <div className="w-6 h-6 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container">
              <span className="material-symbols-outlined text-[16px]">mic</span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant">© 2025 PodSphere Systems Inc. Professional Studio Rack Architecture.</span>
          </div>
          <div className="flex items-center gap-space-lg">
            <a className="font-caption text-caption text-on-surface-variant hover:text-on-surface transition-colors" data-path="privacy-policy" href="#">Privacy Policy</a>
            <a className="font-caption text-caption text-on-surface-variant hover:text-on-surface transition-colors" data-path="terms-of-service" href="#">Terms of Service</a>
            <a className="font-caption text-caption text-on-surface-variant hover:text-on-surface transition-colors" data-path="api-status" href="#">Telemetry &amp; Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;