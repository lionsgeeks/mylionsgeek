import React from 'react';

export default function GameBackground() {
    return (
        <>
            {/* Lionsgeek Brand Gradient Overlays */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute -left-40 -top-40 w-[560px] h-[560px] rounded-full bg-[#ffc801]/10 blur-3xl"></div>
                <div className="absolute left-1/3 top-1/4 w-[560px] h-[560px] rounded-full bg-[#ffc801]/8 blur-3xl"></div>
                <div className="absolute right-[-10%] bottom-[-10%] w-[680px] h-[680px] rounded-full bg-[#ffc801]/12 blur-3xl"></div>
            </div>

            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,200,1,0.3) 1px, transparent 0)',
                backgroundSize: '50px 50px'
            }}></div>

            {/* Lionsgeek Logo Watermark - Centered */}
            <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
                <div className="opacity-[0.08]">
                    <img
                        src="/assets/images/lionsgeek_logo_2.png"
                        alt="Lionsgeek"
                        className="w-64 h-64 sm:w-96 sm:h-96 md:w-[500px] md:h-[500px] object-contain"
                        style={{
                            filter: 'brightness(0) invert(1)',
                        }}
                    />
                </div>
            </div>

            {/* Lionsgeek Logo Watermark - Corners */}
            <div className="absolute top-8 left-8 pointer-events-none z-0 opacity-[0.05] hidden md:block">
                <img
                    src="/assets/images/logolionsgeek.png"
                    alt="Lionsgeek"
                    className="w-24 h-24 object-contain"
                    style={{
                        filter: 'brightness(0) invert(1)',
                    }}
                />
            </div>
            <div className="absolute bottom-8 right-8 pointer-events-none z-0 opacity-[0.05] hidden md:block">
                <img
                    src="/assets/images/logolionsgeek.png"
                    alt="Lionsgeek"
                    className="w-24 h-24 object-contain"
                    style={{
                        filter: 'brightness(0) invert(1)',
                    }}
                />
            </div>
        </>
    );
}




