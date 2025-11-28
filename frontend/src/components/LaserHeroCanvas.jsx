import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * LaserHeroCanvas Component (Alternative High-Performance Implementation)
 * 
 * Canvas-based implementation with additive blending for high particle density.
 * Use this for more complex effects or higher beam counts (20+).
 * 
 * TUNING KNOBS:
 * - BEAM_COUNT: Number of laser beams (can handle 50+)
 * - PARTICLE_COUNT: Particles per beam for glow effect
 * - BLUR_RADIUS: Canvas blur intensity
 * - DRIFT_SPEED: Animation speed
 */

const LaserHeroCanvas = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const [visualsEnabled, setVisualsEnabled] = useState(true);
    const animationFrameRef = useRef(null);

    // Configuration
    const BEAM_COUNT = 12;
    const PARTICLE_COUNT = 3;
    const BLUR_RADIUS = 8;
    const DRIFT_SPEED = 0.001;

    // Beam class
    class Beam {
        constructor(index, total) {
            this.x1 = (index / total) * window.innerWidth;
            this.y1 = 0;
            this.x2 = ((index + 0.3) / total) * window.innerWidth;
            this.y2 = window.innerHeight;
            this.driftOffset = Math.random() * Math.PI * 2;
            this.driftSpeed = 0.0005 + Math.random() * 0.001;
            this.pulseOffset = Math.random() * Math.PI * 2;
            this.pulseSpeed = 0.001 + Math.random() * 0.002;
            this.depth = Math.random();
            this.width = 1 + Math.random() * 2;
            this.color = this.getGradientColor(index / total);
        }

        getGradientColor(t) {
            // Interpolate between purple, cyan, and magenta
            if (t < 0.5) {
                return this.lerpColor('#7C3AED', '#06B6D4', t * 2);
            } else {
                return this.lerpColor('#06B6D4', '#EC4899', (t - 0.5) * 2);
            }
        }

        lerpColor(color1, color2, t) {
            const c1 = this.hexToRgb(color1);
            const c2 = this.hexToRgb(color2);
            const r = Math.round(c1.r + (c2.r - c1.r) * t);
            const g = Math.round(c1.g + (c2.g - c1.g) * t);
            const b = Math.round(c1.b + (c2.b - c1.b) * t);
            return `rgb(${r}, ${g}, ${b})`;
        }

        hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : { r: 0, g: 0, b: 0 };
        }

        update(time, mouseX, mouseY) {
            this.driftOffset += this.driftSpeed;
            this.pulseOffset += this.pulseSpeed;

            const drift = Math.sin(this.driftOffset) * 100;
            const parallaxX = mouseX * this.depth * 12;
            const parallaxY = mouseY * this.depth * 12;

            this.currentX1 = this.x1 + drift + parallaxX;
            this.currentX2 = this.x2 + drift + parallaxX;
            this.currentY1 = this.y1 + parallaxY;
            this.currentY2 = this.y2 + parallaxY;

            this.alpha = 0.3 + Math.sin(this.pulseOffset) * 0.3;
        }

        draw(ctx) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter'; // Additive blending
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.width;
            ctx.lineCap = 'round';
            ctx.globalAlpha = this.alpha;

            // Draw multiple passes for glow effect
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                ctx.filter = `blur(${BLUR_RADIUS * (i + 1)}px)`;
                ctx.beginPath();
                ctx.moveTo(this.currentX1, this.currentY1);
                ctx.lineTo(this.currentX2, this.currentY2);
                ctx.stroke();
            }

            ctx.restore();
        }
    }

    // Initialize beams
    const beamsRef = useRef([]);

    useEffect(() => {
        beamsRef.current = Array.from(
            { length: BEAM_COUNT },
            (_, i) => new Beam(i, BEAM_COUNT)
        );
    }, []);

    // Check for reduced motion
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        const handleChange = (e) => setPrefersReducedMotion(e.matches);
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Mouse tracking
    useEffect(() => {
        if (prefersReducedMotion || !visualsEnabled) return;

        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            const x = (clientX / innerWidth - 0.5) * 2;
            const y = (clientY / innerHeight - 0.5) * 2;
            setMousePosition({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [prefersReducedMotion, visualsEnabled]);

    // Canvas animation loop
    useEffect(() => {
        if (!visualsEnabled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let time = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const animate = () => {
            if (prefersReducedMotion) return;

            time += DRIFT_SPEED;

            // Clear canvas
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Update and draw beams
            beamsRef.current.forEach(beam => {
                beam.update(time, mousePosition.x, mousePosition.y);
                beam.draw(ctx);
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [visualsEnabled, prefersReducedMotion, mousePosition]);

    return (
        <div className="relative min-h-screen bg-black flex flex-col overflow-hidden">
            {/* Canvas Layer */}
            {visualsEnabled && (
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 pointer-events-none"
                    style={{ mixBlendMode: 'screen' }}
                />
            )}

            {/* Accessibility Toggle */}
            <button
                onClick={() => setVisualsEnabled(!visualsEnabled)}
                className="absolute top-4 right-4 z-50 px-3 py-1.5 text-xs bg-gray-800/50 text-white rounded-md hover:bg-gray-700/50 transition-colors"
                aria-label={visualsEnabled ? "Disable visual effects" : "Enable visual effects"}
            >
                {visualsEnabled ? "Disable Effects" : "Enable Effects"}
            </button>

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
                    <svg className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <svg className="relative z-10 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                </button>
            </main>
        </div>
    );
};

export default LaserHeroCanvas;
