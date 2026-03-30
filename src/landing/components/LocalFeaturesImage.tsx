"use client"
import Image from 'next/image';


export function LocalFeaturesImage() {
    return (
        <div
            className="relative w-full max-w-lg aspect-square"
            style={{ perspective: "1200px" }}
        >
            {/* Backlight Glow matching Ethereal design */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-primary/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>


            <div
                className="relative w-full h-full transition-transform duration-300 ease-out group"
                aria-hidden="true"
                style={{
                    transformStyle: "preserve-3d",
                    transform: "rotateX(10deg) rotateY(-15deg)"
                }}
                onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
                    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
                    const rotateX = -y * 15 + 10;
                    const rotateY = x * 15 - 15;
                    e.currentTarget.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "rotateX(10deg) rotateY(-15deg) scale3d(1, 1, 1)";
                    e.currentTarget.style.transition = "transform 1s ease-out";
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transition = "transform 0.1s ease-out";
                }}
            >
                {/* 3D Image Shadow to anchor it */}
                <div
                    className="absolute -bottom-10 left-10 right-10 h-10 bg-black/60 blur-xl rounded-full transition-all duration-300 group-hover:scale-95 group-hover:blur-2xl"
                    style={{ transform: "translateZ(-50px)" }}
                ></div>

                {/* The actual downloaded design image */}
                <div className="relative w-full h-full" style={{ transform: "translateZ(30px)" }}>
                    <Image
                        src="/assets/local-3d.png"
                        alt="Local Processing Graphic"
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-contain filter w-full h-full drop-shadow-[0_20px_40px_rgba(255,178,183,0.15)] group-hover:drop-shadow-[0_30px_50px_rgba(255,178,183,0.25)] transition-all duration-700"
                        priority
                    />
                </div>
            </div>



        </div>
    );
}
