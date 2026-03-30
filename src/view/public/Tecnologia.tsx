import { Cpu, Globe, Rocket, Terminal, Code2, ChevronRight, Share2 } from "lucide-react";
import { useState, useEffect } from 'react';

const Tecnologia = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const techPillars = [
        {
            title: "Robótica & STEAM",
            desc: "Diseño y construcción de soluciones tecnológicas para desafíos del mundo real.",
            icon: <Cpu className="w-8 h-8" />,
            image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800"
        },
        {
            title: "Pensamiento Computacional",
            desc: "Desde la lógica de programación hasta el desarrollo de aplicaciones móviles y web.",
            icon: <Code2 className="w-8 h-8" />,
            image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800"
        },
        {
            title: "Inteligencia Artificial",
            desc: "Entendiendo y utilizando la IA de manera ética para potenciar el aprendizaje.",
            icon: <Share2 className="w-8 h-8" />,
            image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800"
        }
    ];

    return (
        <div className="flex flex-col w-full bg-[#080B16] text-white selection:bg-cyan-500/30">
            {/* FUTURISTIC HERO */}
            <section className="relative h-[80vh] flex items-center overflow-hidden">
                {/* Background artistic elements */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#080B16] via-[#080B16]/80 to-transparent z-10" />
                    <img
                        src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2000"
                        alt="Technological innovation"
                        className="w-full h-full object-cover opacity-20 scale-105 animate-slow-zoom grayscale"
                    />
                    {/* Digital Grid Overlay */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl space-y-8">
                        <div className={`flex items-center gap-4 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="w-12 h-0.5 bg-cyan-500" />
                            <span className="text-cyan-400 font-black text-[10px] uppercase tracking-[0.4em]">Arquitectos del Mañana</span>
                        </div>
                        <h1 className={`text-6xl md:text-9xl font-serif leading-[0.85] transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                            Innovar para <br />
                            <span className="italic text-cyan-400">Trascender.</span>
                        </h1>
                        <p className={`text-lg text-slate-400 max-w-xl font-light leading-relaxed transition-all duration-1000 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            En Crayon's, la tecnología no es solo una herramienta, sino el lenguaje con el que nuestros estudiantes diseñan el futuro.
                        </p>
                    </div>
                </div>
            </section>

            {/* TECH ECOSYSTEM - DARK EDITORIAL GRID */}
            <section className="py-24 md:py-48 bg-white text-[#080B16]">
                <div className="container mx-auto px-6">
                    <div className="space-y-32">
                        {techPillars.map((pillar, i) => (
                            <div key={i} className={`flex flex-col lg:flex-row items-center gap-16 lg:gap-32 ${i % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
                                <div className="flex-1 w-full group">
                                    <div className="relative aspect-[16/9] rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-700 group-hover:rounded-[1.5rem] bg-slate-900">
                                        <img
                                            src={pillar.image}
                                            alt={pillar.title}
                                            className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>

                                <div className="flex-1 space-y-8">
                                    <div className="space-y-4">
                                        <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                                            {pillar.icon}
                                        </div>
                                        <h2 className="text-4xl md:text-6xl font-serif leading-tight">
                                            {pillar.title.split(' ')[0]} <br />
                                            <span className="italic text-cyan-500">{pillar.title.split(' ')[1] || ''} {pillar.title.split(' ')[2] || ''}</span>
                                        </h2>
                                    </div>

                                    <p className="text-xl text-slate-500 font-light leading-relaxed">
                                        {pillar.desc}
                                    </p>

                                    <div className="pt-6">
                                        <button className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-[#080B16] hover:text-cyan-600 transition-colors group">
                                            Explorar Programa <ChevronRight size={18} className="translate-x-0 group-hover:translate-x-2 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* DIGITAL MINDSET SECTION - DARK TECH VIBE */}
            <section className="py-24 md:py-48 relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
                        {[
                            { icon: <Terminal size={32} strokeWidth={1.5} />, t: "Coding Hub", d: "Espacio dedicado al desarrollo de software." },
                            { icon: <Globe size={32} strokeWidth={1.5} />, t: "E-Learning", d: "Plataformas de clase mundial para el aprendizaje." },
                            { icon: <Cpu size={32} strokeWidth={1.5} />, t: "Steam Lab", d: "Laboratorios equipados con tecnología de punta." },
                            { icon: <Rocket size={32} strokeWidth={1.5} />, t: "Startups", d: "Fomentamos el espíritu emprendedor tech." }
                        ].map((item, i) => (
                            <div key={i} className="space-y-6 group">
                                <div className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-500 shadow-2xl shadow-cyan-500/0 group-hover:shadow-cyan-500/20">
                                    {item.icon}
                                </div>
                                <h4 className="text-lg font-bold">{item.t}</h4>
                                <p className="text-sm text-slate-400 font-light px-4">{item.d}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-32 p-12 md:p-24 rounded-[4rem] bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border border-white/10 backdrop-blur-xl text-center space-y-12">
                        <h3 className="text-4xl md:text-7xl font-serif italic">
                            ¿Preparado para <br /> el siguiente nivel?
                        </h3>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link to="/admision" className="bg-white text-[#080B16] px-12 py-5 rounded-full text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                                Solicitar Información
                            </Link>
                            <Link to="/contacto" className="bg-white/5 border border-white/10 text-white px-12 py-5 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                                Agendar Demo Tech
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Aesthetic Accents */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px] translate-y-1/2 -translate-x-1/2" />
            </section>
        </div>
    );
};

import { Link } from "react-router-dom";
export default Tecnologia;
