export default function GameBackground() {
    return (
        <>
            {/* Lionsgeek Brand Gradient Overlays */}
            <div className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute -top-40 -left-40 h-[560px] w-[560px] rounded-full bg-[#ffc801]/10 blur-3xl"></div>
                <div className="absolute top-1/4 left-1/3 h-[560px] w-[560px] rounded-full bg-[#ffc801]/8 blur-3xl"></div>
                <div className="absolute right-[-10%] bottom-[-10%] h-[680px] w-[680px] rounded-full bg-[#ffc801]/12 blur-3xl"></div>
            </div>

            {/* Subtle pattern overlay */}
            <div
                className="absolute inset-0 opacity-5"
                style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,200,1,0.3) 1px, transparent 0)',
                    backgroundSize: '50px 50px',
                }}
            ></div>

            {/* Lionsgeek Logo Watermark - Centered */}
            <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
                <div className="opacity-[0.08]">
                    <img
                        src="/assets/images/lionsgeek_logo_2.png"
                        alt="Lionsgeek"
                        className="h-64 w-64 object-contain sm:h-96 sm:w-96 md:h-[500px] md:w-[500px]"
                        style={{
                            filter: 'brightness(0) invert(1)',
                        }}
                    />
                </div>
            </div>

            {/* Lionsgeek Logo Watermark - Corners */}
            <div className="pointer-events-none absolute top-8 left-8 z-0 hidden opacity-[0.05] md:block">
                <img
                    src="/assets/images/logolionsgeek.png"
                    alt="Lionsgeek"
                    className="h-24 w-24 object-contain"
                    style={{
                        filter: 'brightness(0) invert(1)',
                    }}
                />
            </div>
            <div className="pointer-events-none absolute right-8 bottom-8 z-0 hidden opacity-[0.05] md:block">
                <img
                    src="/assets/images/logolionsgeek.png"
                    alt="Lionsgeek"
                    className="h-24 w-24 object-contain"
                    style={{
                        filter: 'brightness(0) invert(1)',
                    }}
                />
            </div>
        </>
    );
}
