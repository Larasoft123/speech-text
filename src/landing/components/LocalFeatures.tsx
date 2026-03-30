import { LocalFeaturesImage } from "./LocalFeaturesImage";

export function LocalFocusSection() {
  const items = [
    {
      icon: "encrypted",
      title: "Total Privacy",
      desc: "End-to-end sovereignty for sensitive discourse.",
      bgClass: "bg-primary/10",
      textClass: "text-primary",
      hoverBgClass: "group-hover:bg-primary",
      hoverTextClass: "group-hover:text-on-primary"
    },
    {
      icon: "bolt",
      title: "Zero Latency",
      desc: "Bypass the cloud. Process at the speed of thought.",
      bgClass: "bg-tertiary/10",
      textClass: "text-tertiary",
      hoverBgClass: "group-hover:bg-tertiary",
      hoverTextClass: "group-hover:text-on-tertiary"
    },
    {
      icon: "signal_disconnected",
      title: "Offline Ready",
      desc: "No internet required for full studio capabilities.",
      bgClass: "bg-secondary/10",
      textClass: "text-secondary",
      hoverBgClass: "group-hover:bg-secondary",
      hoverTextClass: "group-hover:text-on-secondary"
    }
  ];

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background with asymmetric gradient */}
      <div className="absolute inset-0 bg-surface-container-lowest pointer-events-none">
        <div className="absolute left-0 bottom-0 w-[600px] h-[600px] bg-glow-secondary opacity-20 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/3"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-8 z-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">

          {/* left Column: 3D Image from Stitch */}
          <div className="lg:w-1/2 w-full flex justify-center lg:justify-end">
           <LocalFeaturesImage/>
          </div>


          {/* right Column: Header Text & Features */}
          <div className="lg:w-1/2 space-y-12">

            {/* Context Header */}
            <div className="space-y-6">
              <span className="inline-block px-4 py-1.5 rounded-full bg-surface-container text-on-surface text-[10px] font-bold uppercase tracking-widest shadow-ambient">
                <span className="text-primary mr-2">●</span> Browser-Level Inference
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-on-surface">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-on-surface to-on-surface-variant">
                  100% Local.
                </span>
                <br />
                Zero Leakage.
              </h2>
              <p className="text-on-surface-variant text-lg leading-relaxed max-w-lg">
                Your voice never leaves your machine. Leverage the power of browser-level inference for absolute privacy and real-time performance, even when you&apos;re completely offline.
              </p>
            </div>

            {/* Feature Stack */}
            <div className="space-y-4">
              {items.map((item, i) => (
                <div
                  key={i}
                  className={`
                    bg-surface-container-high/20 
                    hover:bg-surface-container-high/60 
                    glass
                    transition-all duration-500 
                    rounded-2xl p-6 
                    group cursor-default
                    flex items-center gap-6
                  `}
                >
                  <div className={`shrink-0 w-14 h-14 rounded-2xl ${item.bgClass} flex items-center justify-center ${item.textClass} group-hover:scale-110 ${item.hoverBgClass} ${item.hoverTextClass} transition-all duration-500 shadow-inner`}>
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">
                      {item.icon}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>



        </div>
      </div>
    </section>
  );
}
