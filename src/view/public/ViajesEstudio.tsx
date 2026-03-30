import { Plane, Map, Globe, Compass, ArrowUpRight } from "lucide-react";
import { useState, useEffect } from 'react';

const ViajesEstudio = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const trips = [
        {
            title: "Ruta de los Sabios",
            desc: "Inmersión cultural e histórica en destinos nacionales seleccionados por su valor académico.",
            region: "Nacional",
            image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&q=80&w=800",
            icon: <Map className="w-8 h-8" />
        },
        {
            title: "Global Leadership",
            desc: "Visita a instituciones de prestigio en EE.UU. y Europa para potenciar la visión global.",
            region: "Internacional",
            image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800",
            icon: <Globe className="w-8 h-8" />
        },
        {
            title: "Eco-Aventura",
            desc: "Proyectos de desarrollo sostenible y aventura científica en la Amazonía central.",
            region: "Regional",
            image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800",
            icon: <Compass className="w-8 h-8" />
        }
    ];

    return (
        <div className="flex flex-col w-full bg-white">
            {/* EXPLORATION HERO */}
            <section className="relative h-[80vh] flex items-center overflow-hidden bg-slate-100">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=2000"
                        alt="Education beyond borders"
                        className="w-full h-full object-cover grayscale opacity-40 scale-105 animate-slow-zoom"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl space-y-8">
                        <div className={`flex items-center gap-4 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="w-12 h-px bg-orange-600" />
                            <span className="text-orange-600 font-black text-[10px] uppercase tracking-[0.4em]">El Mundo es Nuestra Aula</span>
                        </div>
                        <h1 className={`text-6xl md:text-9xl font-serif text-slate-900 leading-[0.85] transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                            Viajes que <br />
                            <span className="italic">Transforman.</span>
                        </h1>
                        <p className={`text-lg text-slate-500 max-w-xl font-light leading-relaxed transition-all duration-1000 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            Creemos en el poder de la experiencia directa. Nuestros viajes de estudio están diseñados para expandir horizontes y consolidar aprendizajes en escenarios reales.
                        </p>
                    </div>
                </div>

                {/* Aesthetic Detail */}
                <div className="absolute top-1/2 right-20 -translate-y-1/2 hidden lg:flex flex-col gap-20">
                    <span className="[writing-mode:vertical-rl] text-[10px] font-black uppercase tracking-widest text-orange-500/30">Norte — Sur — Este — Oeste</span>
                </div>
            </section>

            {/* DESTINATIONS GRID - EDITORIAL STYLE */}
            <section className="py-24 md:py-48 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 lg:gap-8">
                        {trips.map((trip, i) => (
                            <div key={i} className="group cursor-pointer">
                                <div className="space-y-8">
                                    <div className="relative aspect-[4/5] overflow-hidden rounded-[3rem] shadow-2xl transition-all duration-700 group-hover:rounded-[1.5rem]">
                                        <img src={trip.image} alt={trip.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                        <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-sm px-6 py-2 rounded-full shadow-lg">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{trip.region}</span>
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 p-12 bg-gradient-to-t from-black/80 via-black/20 to-transparent translate-y-8 group-hover:translate-y-0 transition-all duration-500 opacity-0 group-hover:opacity-100">
                                            <div className="flex items-center gap-2 text-white">
                                                <span className="text-[10px] font-black uppercase tracking-widest">Descubrir Itinerario</span>
                                                <ArrowUpRight size={14} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4 px-2">
                                        <div className="text-orange-600">{trip.icon}</div>
                                        <h3 className="text-3xl font-serif text-slate-900">{trip.title}</h3>
                                        <p className="text-slate-500 font-light leading-relaxed">{trip.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* IMPACT SECTION - DARK ASYMMETRIC */}
            <section className="py-24 md:py-48 bg-[#0a0a0c] text-white overflow-hidden relative">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row gap-24 items-center">
                        <div className="lg:w-1/2 relative order-2 lg:order-1">
                            <div className="grid grid-cols-2 gap-6 p-4 border border-white/5 rounded-[4rem]">
                                <div className="aspect-[3/4] rounded-[3rem] overflow-hidden">
                                    <img src="https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=800" alt="Students abroad" className="w-full h-full object-cover" />
                                </div>
                                <div className="aspect-[3/4] rounded-[3rem] overflow-hidden mt-12">
                                    <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=800" alt="Cultural exchange" className="w-full h-full object-cover grayscale" />
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-1/2 space-y-12 order-1 lg:order-2">
                            <div className="space-y-6">
                                <span className="text-orange-500 font-black text-[10px] uppercase tracking-widest">Visión Trascendente</span>
                                <h2 className="text-5xl md:text-7xl font-serif leading-none">
                                    Aprender de las <br /> <span className="italic text-orange-500">Culturas.</span>
                                </h2>
                                <p className="text-xl text-slate-400 font-light leading-relaxed">
                                    Los viajes no son solo desplazamientos geográficos, sino recorridos hacia la independencia, la empatía y la comprensión de la diversidad humana.
                                </p>
                            </div>

                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                                {[
                                    { t: "Independencia", d: "Fomentamos la autonomía fuera del entorno familiar." },
                                    { t: "Networking", d: "Conexiones duraderas con jóvenes de otras latitudes." },
                                    { t: "Inmersión", d: "Práctica real de idiomas en contextos nativos." },
                                    { t: "Curiosidad", d: "Deseo inagotable por conocer nuevas realidades." }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0" />
                                        <div className="space-y-1">
                                            <h4 className="font-bold">{item.t}</h4>
                                            <p className="text-xs text-slate-500 leading-relaxed font-light">{item.d}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA SECTION - ADVENTUROUS */}
            <section className="py-32 bg-white text-center">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto space-y-12">
                        <div className="inline-block p-6 rounded-full bg-slate-50 border border-slate-100 rotate-12 mb-4">
                            <Plane size={32} className="text-orange-500" />
                        </div>
                        <h2 className="text-5xl md:text-7xl font-serif text-slate-900 leading-tight">
                            ¿A dónde nos llevará <br /> la próxima <span className="italic text-orange-600">curiosidad?</span>
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link to="/admision" className="bg-slate-900 text-white px-12 py-5 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all">
                                Ver Calendario 2026
                            </Link>
                            <Link to="/contacto" className="px-12 py-5 rounded-full text-[11px] font-black uppercase tracking-widest text-[#0D101C] border-2 border-[#0D101C] hover:bg-[#0D101C] hover:text-white transition-all">
                                Consultar Requisitos
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

import { Link } from "react-router-dom";
export default ViajesEstudio;
