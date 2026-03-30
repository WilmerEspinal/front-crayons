import { Heart, Palette, Baby, Sun, Sparkles, Footprints, ChevronRight } from "lucide-react";
import { useState, useEffect } from 'react';

const EarlyYears = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const areas = [
        {
            title: "Desarrollo Sensorial",
            desc: "Exploración del mundo a través de los sentidos, estimulando la curiosidad natural del niño.",
            icon: <Sparkles className="w-8 h-8" />,
            image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=600"
        },
        {
            title: "Arte & Expresión",
            desc: "Fomentamos la creatividad sin límites a través de la pintura, el modelado y la música.",
            icon: <Palette className="w-8 h-8" />,
            image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=600"
        },
        {
            title: "Psicomotricidad",
            desc: "Desarrollo del control corporal y la confianza física en espacios seguros y divertidos.",
            icon: <Footprints className="w-8 h-8" />,
            image: "https://res.cloudinary.com/droodoirh/image/upload/v1772123391/deportistas_alumnos_inical_hhq4nu.jpg"
        },
        {
            title: "Afectividad",
            desc: "Un entorno cálido donde cada niño se siente amado, seguro y valorado.",
            icon: <Heart className="w-8 h-8" />,
            image: "https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&q=80&w=600"
        }
    ];

    return (
        <div className="flex flex-col w-full bg-[#fdfcfb]">
            {/* SOFT ARTISTIC HERO */}
            <section className="relative h-[85vh] flex items-center overflow-hidden bg-rose-50">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://res.cloudinary.com/droodoirh/image/upload/v1772123383/Inicial_tdfx88.jpg"
                        alt="Playful learning"
                        className="w-full h-full object-cover opacity-60 mix-blend-multiply"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-50 via-rose-50/40 to-transparent" />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-3xl space-y-8">
                        <div className={`flex items-center gap-4 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="w-12 h-0.5 bg-rose-400" />
                            <span className="text-rose-500 font-black text-[10px] uppercase tracking-[0.4em]">Donde Todo Comienza</span>
                        </div>
                        <h1 className={`text-6xl md:text-9xl font-serif text-slate-900 leading-[0.9] transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                            Primeros <br />
                            <span className="italic text-rose-500">Pasos.</span>
                        </h1>
                        <p className={`text-lg text-slate-600 max-w-xl font-light leading-relaxed transition-all duration-1000 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            Nuestro nivel inicial es un ecosistema diseñado para nutrir la curiosidad, la creatividad y el desarrollo socioemocional desde los 3 hasta los 5 años.
                        </p>
                    </div>
                </div>

                {/* Aesthetic Detail */}
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/40 rounded-full blur-3xl" />
            </section>

            {/* THE PHILOSOPHY SECTION - PLAYFUL EDITORIAL */}
            <section className="py-24 md:py-40">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
                        <div className="lg:col-span-6 space-y-12">
                            <div className="space-y-6">
                                <h2 className="text-4xl md:text-6xl font-serif text-slate-900 leading-tight">
                                    Aprendizaje <br /> basado en el <span className="italic text-rose-500">juego.</span>
                                </h2>
                                <p className="text-xl text-slate-600 font-light leading-relaxed">
                                    En el nivel Inicial de Crayon's, entendemos que el aula es un laboratorio de asombro. Implementamos metodologías que respetan el ritmo de cada niño, fomentando la autonomía y la alegría de aprender.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-rose-400" />
                                        Bilingüismo
                                    </h3>
                                    <p className="text-xs text-slate-500">Inmersión natural en el inglés desde el primer día.</p>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-rose-400" />
                                        STEAM Jr.
                                    </h3>
                                    <p className="text-xs text-slate-500">Primeros acercamientos a la ciencia y experimentación.</p>
                                </div>
                            </div>

                            <div className="pt-8">
                                <Link to="/admision" className="bg-rose-500 text-white px-10 py-5 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-rose-200">
                                    Programar Visita
                                </Link>
                            </div>
                        </div>

                        <div className="lg:col-span-6 grid grid-cols-2 gap-6 relative">
                            <div className="space-y-6 pt-12">
                                <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl skew-y-2">
                                    <img src="https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=600" alt="Active learning" className="w-full h-full object-cover" />
                                </div>
                                <div className="aspect-square rounded-[2rem] bg-rose-100 flex items-center justify-center p-8 group overflow-hidden relative">
                                    <Baby size={64} className="text-rose-400 group-hover:scale-110 transition-transform" />
                                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="aspect-square rounded-[2rem] bg-slate-100 overflow-hidden">
                                    <img src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=600" alt="Childhood" className="w-full h-full object-cover grayscale brightness-110" />
                                </div>
                                <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl -skew-y-2">
                                    <img src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=600" alt="Creativity" className="w-full h-full object-cover" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* THE LEARNING ZONES - HORIZONTAL SCROLL / GRID */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="space-y-16">
                        <div className="text-center space-y-4 max-w-2xl mx-auto">
                            <h2 className="text-4xl font-serif text-slate-900">Zonas de Descubrimiento</h2>
                            <p className="text-slate-500 font-light">Espacios diseñados para potenciar cada dimensión del desarrollo infantil.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {areas.map((area, i) => (
                                <div key={i} className="group space-y-6">
                                    <div className="relative aspect-[3/4] overflow-hidden rounded-[2.5rem] bg-slate-50 transition-all duration-700 group-hover:rounded-[1.5rem]">
                                        <img src={area.image} alt={area.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                        <div className="absolute inset-x-0 bottom-0 p-8 translate-y-8 group-hover:translate-y-0 transition-transform duration-500 opacity-0 group-hover:opacity-100">
                                            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl flex items-center justify-between">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Ver Galería</span>
                                                <ChevronRight size={16} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3 px-2">
                                        <div className="text-rose-500">{area.icon}</div>
                                        <h3 className="text-xl font-bold text-slate-900">{area.title}</h3>
                                        <p className="text-sm text-slate-500 leading-relaxed">{area.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* SOFT CTA SECTION */}
            <section className="py-24 bg-rose-50/50">
                <div className="container mx-auto px-6">
                    <div className="bg-white rounded-[4rem] p-12 md:p-24 shadow-2xl flex flex-col md:flex-row items-center gap-16 overflow-hidden relative">
                        {/* Decorative circles */}
                        <div className="absolute -top-24 -left-24 w-64 h-64 bg-rose-50 rounded-full" />

                        <div className="flex-1 space-y-8 relative z-10">
                            <h2 className="text-4xl md:text-6xl font-serif text-slate-900 leading-tight">
                                Empiece su <br /> aventura <span className="italic text-rose-500">hoy.</span>
                            </h2>
                            <p className="text-lg text-slate-600 font-light">
                                Concierte una visita personalizada y descubra cómo el nivel Inicial de Crayon's puede encender la chispa del aprendizaje perpetuo en su pequeño.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/admision" className="bg-slate-900 text-white px-10 py-5 rounded-full text-[11px] font-black uppercase tracking-widest text-center">
                                    Admisiones 2026
                                </Link>
                                <button className="px-10 py-5 rounded-full text-[11px] font-black uppercase tracking-widest text-slate-900 border-2 border-slate-100 hover:border-rose-200 transition-all flex items-center justify-center gap-2">
                                    WhatsApp <Sun size={14} className="text-rose-400" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 hidden lg:block">
                            <div className="aspect-square rounded-full border-2 border-dashed border-rose-200 p-8 animate-spin-slow">
                                <div className="h-full w-full rounded-full overflow-hidden grayscale brightness-110 contrast-125">
                                    <img src="https://images.unsplash.com/photo-1484820540004-14229fe36ca4?auto=format&fit=crop&q=80&w=600" alt="Child smiling" className="w-full h-full object-cover" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

import { Link } from "react-router-dom";
export default EarlyYears;
