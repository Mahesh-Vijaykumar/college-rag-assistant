import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * LaserHero Component
 * 
 * A full-viewport hero section with holographic laser beam effects.
 * 
 * TUNING KNOBS:
 * - BEAM_COUNT: Number of laser beams (default: 8, reduce to 2-3 for mobile)
 * - BLUR_STRENGTH: SVG blur intensity (default: 6, range: 3-10)
 * - PULSE_SPEED: Animation speed multiplier (default: 1, range: 0.5-2)
 * - DRIFT_AMPLITUDE: Horizontal movement range (default: 100px, range: 50-200)
 * - Colors: Edit the linearGradient stops in the SVG defs
 */

const LaserHero = () => {
    const navigate = useNavigate();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const [visualsEnabled, setVisualsEnabled] = useState(true);
    const heroRef = useRef(null);

    // Configuration
    const BEAM_COUNT = 8; // Reduce to 2-3 for mobile
    const BLUR_STRENGTH = 6;
    const PULSE_SPEED = 1;
    const DRIFT_AMPLITUDE = 100;

    // Check for reduced motion preference
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        const handleChange = (e) => setPrefersReducedMotion(e.matches);
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Mouse parallax effect
    useEffect(() => {
        if (prefersReducedMotion || !visualsEnabled) return;

        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;

            // Normalize to -1 to 1 range
            const x = (clientX / innerWidth - 0.5) * 2;
            const y = (clientY / innerHeight - 0.5) * 2;

            setMousePosition({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [prefersReducedMotion, visualsEnabled]);

    // Generate beam configurations
    const beams = Array.from({ length: BEAM_COUNT }, (_, i) => ({
        id: i,
        x1: `${(i / BEAM_COUNT) * 100}%`,
        y1: '0%',
        x2: `${((i + 0.3) / BEAM_COUNT) * 100}%`,
        y2: '100%',
        driftDuration: 3 + Math.random() * 5, // 3-8s
        pulseDuration: 2 + Math.random() * 3, // 2-5s
        pulseDelay: Math.random() * 2, // 0-2s delay
        depth: Math.random(), // 0-1 for parallax depth
        strokeWidth: 1 + Math.random() * 2, // 1-3px
    }));

    return (
        <div
            ref={heroRef}
            className="relative min-h-screen bg-black flex flex-col overflow-hidden"
        >
            {/* Accessibility Toggle */}
            <button
                onClick={() => setVisualsEnabled(!visualsEnabled)}
                className="absolute top-4 right-4 z-50 px-3 py-1.5 text-xs bg-gray-800/50 text-white rounded-md hover:bg-gray-700/50 transition-colors"
                aria-label={visualsEnabled ? "Disable visual effects" : "Enable visual effects"}
            >
                {visualsEnabled ? "Disable Effects" : "Enable Effects"}
            </button>

            {/* Laser Beam Effects Layer */}
            {visualsEnabled && (
                <div className="absolute inset-0 pointer-events-none">
                    {/* Radial Glow Background */}
                    <div className="absolute inset-0">
                        <div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
                            style={{
                                background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
                                filter: 'blur(60px)',
                            }}
                        />
                        <div
                            className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
                            style={{
                                background: 'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)',
                                filter: 'blur(80px)',
                            }}
                        />
                    </div>

                    {/* SVG Laser Beams */}
                    <svg
                        className="absolute inset-0 w-full h-full"
                        style={{ mixBlendMode: 'screen' }}
                    >
                        <defs>
                            {/* Gradient for laser beams */}
                            <linearGradient id="laserGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.8" />
                                <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="#EC4899" stopOpacity="0.8" />
                            </linearGradient>

                            {/* Blur filter */}
                            <filter id="laserBlur">
                                <feGaussianBlur in="SourceGraphic" stdDeviation={BLUR_STRENGTH} />
                            </filter>
                        </defs>

                        {/* Render laser beams */}
                        {beams.map((beam) => {
                            const parallaxX = mousePosition.x * beam.depth * 12;
                            const parallaxY = mousePosition.y * beam.depth * 12;

                            return (
                                <line
                                    key={beam.id}
                                    x1={beam.x1}
                                    y1={beam.y1}
                                    x2={beam.x2}
                                    y2={beam.y2}
                                    stroke="url(#laserGradient)"
                                    strokeWidth={beam.strokeWidth}
                                    strokeLinecap="round"
                                    filter="url(#laserBlur)"
                                    style={{
                                        transform: `translate(${parallaxX}px, ${parallaxY}px)`,
                                        animation: prefersReducedMotion
                                            ? 'none'
                                            : `laserDrift-${beam.id} ${beam.driftDuration}s ease-in-out infinite, laserPulse ${beam.pulseDuration}s ease-in-out infinite ${beam.pulseDelay}s`,
                                    }}
                                />
                            );
                        })}
                    </svg>

                    {/* Noise Overlay */}
                    <div
                        className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{
                            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
                            animation: prefersReducedMotion ? 'none' : 'noiseShift 8s steps(10) infinite',
                        }}
                    />
                </div>
            )}

            {/* Header */}
            <header className="relative z-10 flex justify-between items-center px-8 py-6">
                <div className="flex items-center space-x-2">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-xl font-bold tracking-tight text-white">CampusAI</span>
                </div>
                <button
                    onClick={() => navigate('/admin/login')}
                    className="group relative inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-full shadow-md hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
                >
                    <span className="relative z-10">Admin Login</span>
                    <svg
                        className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 blur-sm opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                </button>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight text-white drop-shadow-2xl">
                    CampusAI
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400">
                        Gemini X RAG
                    </span>
                </h1>
                <p className="text-gray-300 text-lg md:text-2xl max-w-3xl mb-12 leading-relaxed drop-shadow-lg">
                    Your trusted source for quick, accurate information from all documents.
                </p>
                <button
                    onClick={() => navigate('/chat')}
                    className="group relative inline-flex items-center gap-3 px-10 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-full shadow-lg hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
                >
                    <span className="relative z-10">TRY NOW</span>
                    <svg
                        className="relative z-10 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                </button>
            </main>

            {/* Inline Styles for Animations */}
            <style jsx>{`
                ${beams.map((beam) => `
                    @keyframes laserDrift-${beam.id} {
                        0%, 100% { transform: translateX(0); }
                        50% { transform: translateX(${DRIFT_AMPLITUDE * (Math.random() - 0.5) * 2}px); }
                    }
                `).join('\n')}

                @keyframes laserPulse {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.8; }
                }

                @keyframes noiseShift {
                    0%, 100% { transform: translate(0, 0); }
                    10% { transform: translate(-5%, -5%); }
                    20% { transform: translate(-10%, 5%); }
                    30% { transform: translate(5%, -10%); }
                    40% { transform: translate(-5%, 15%); }
                    50% { transform: translate(-10%, 5%); }
                    60% { transform: translate(15%, 0); }
                    70% { transform: translate(0, 10%); }
                    80% { transform: translate(-15%, 0); }
                    90% { transform: translate(10%, 5%); }
                }

                @media (prefers-reduced-motion: reduce) {
                    * {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                }

                /* Mobile optimization */
                @media (max-width: 768px) {
                    line:nth-child(n+4) {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default LaserHero;
