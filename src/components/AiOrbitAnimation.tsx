import React, { memo } from 'react';

const AiOrbitAnimation: React.FC = () => {
    return (
        <section aria-hidden className="relative isolate my-6 lg:my-10">
            <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
                <div className="relative rounded-2xl bg-gradient-to-b from-[#060609] via-[#07060a] to-[#030304] p-6 lg:p-8 shadow-[0_44px_140px_rgba(3,3,5,0.75)] overflow-hidden">

                    {/* subtle dotted texture */}
                    <div
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)',
                            backgroundSize: '12px 12px',
                            opacity: 0.03,
                        }}
                    />

                    {/* ambient radial light behind the image */}
                    <div
                        className="absolute left-1/2 top-12 -translate-x-1/2 -z-10 w-[820px] h-[420px] rounded-full pointer-events-none"
                        style={{
                            background: 'radial-gradient(circle at 40% 35%, rgba(255,200,140,0.08), rgba(123,224,255,0.04) 40%, transparent 60%)',
                        }}
                    />

                    <div className="relative py-8 lg:py-12 flex justify-center">
                        <div
                            className="relative rounded-2xl p-1"
                            style={{
                                boxShadow: '0 30px 80px rgba(3,3,5,0.6)',
                                background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0))',
                            }}
                        >
                            <img
                                src="/area/Earth.jpg"
                                alt="Earth visual"
                                loading="lazy"
                                className="block w-full h-auto max-w-[920px] rounded-2xl object-contain"
                                style={{
                                    display: 'block',
                                    boxShadow: '0 18px 60px rgba(3,3,5,0.55)',
                                    transformOrigin: 'center',
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default memo(AiOrbitAnimation);
