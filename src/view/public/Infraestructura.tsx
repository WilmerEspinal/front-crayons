import { Camera, Laptop, Music, Trophy, BookOpen, MapPin, ChevronRight, Maximize2 } from "lucide-react";
import { useState, useEffect } from 'react';

const Infraestructura = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const spaces = [
        {
            title: "Laboratorios High-Tech",
            tag: "Ciencia & Innovación",
            desc: "Equipamiento de última generación para la experimentación en robótica, química y física.",
            icon: <Laptop className="w-8 h-8" />,
            image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=1200"
        },
        {
            title: "Biblioteca del Mañana",
            tag: "Conocimiento & Paz",
            desc: "Un centro de recursos híbrido con acceso a miles de títulos digitales y ambientes de lectura inmersiva.",
            icon: <BookOpen className="w-8 h-8" />,
            image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=1200"
        },
        {
            title: "Arena Deportiva",
            tag: "Cuerpo & Mente",
            desc: "Complejo polideportivo con canchas reglamentarias y piscina semi-olímpica.",
            icon: <Trophy className="w-8 h-8" />,
            image: "https://images.unsplash.com/photo-1541252260730-0412e8e2108e?auto=format&fit=crop&q=80&w=1200"
        },
        {
            title: "Creative Studio",
            tag: "Arte & Expresión",
            desc: "Talleres de artes plásticas, música y teatro diseñados para potenciar el talento creativo.",
            icon: <Music className="w-8 h-8" />,
            image: "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&q=80&w=1200"
        }
    ];

    return (
        <div className="flex flex-col w-full bg-[#fdfcfb]">
            {/* ARCHITECTURAL HERO */}
            <section className="relative h-[80vh] flex items-center overflow-hidden bg-slate-100">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000"
                        alt="Modern architecture"
                        className="w-full h-full object-cover grayscale opacity-20 scale-105 animate-slow-zoom"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white via-white/80 to-transparent" />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl space-y-8">
                        <div className={`flex items-center gap-4 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="w-12 h-px bg-orange-600" />
                            <span className="text-orange-600 font-black text-[10px] uppercase tracking-[0.4em]">El Escenario del Éxito</span>
                        </div>
                        <h1 className={`text-6xl md:text-9xl font-serif text-slate-900 leading-[0.85] transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                            Nuestro <br />
                            <span className="italic">Espacio.</span>
                        </h1>
                        <p className={`text-lg text-slate-500 max-w-xl font-light leading-relaxed transition-all duration-1000 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            Un campus diseñado bajo estándares internacionales de pedagogía moderna, donde la arquitectura sirve como un mentor más en el proceso de aprendizaje.
                        </p>
                    </div>
                </div>

                {/* Floating GPS Decoration */}
                <div className="absolute bottom-20 right-20 flex items-center gap-4 text-slate-300">
                    <MapPin size={24} className="text-orange-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Satipo, Junín, Perú</span>
                </div>
            </section>

            {/* SPACES EXHIBITION - EDITORIAL GRID */}
            <section className="py-24 md:py-48 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
                        {spaces.map((space, i) => (
                            <div key={i} className="group space-y-8">
                                <div className="relative aspect-[16/10] overflow-hidden rounded-[3rem] shadow-2xl transition-all duration-700 group-hover:rounded-[1.5rem] bg-slate-100">
                                    <img
                                        src={space.image}
                                        alt={space.title}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                    />
                                    {/* Expand Icon */}
                                    <div className="absolute top-8 right-8 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <Maximize2 size={18} className="text-slate-900" />
                                    </div>
                                </div>

                                <div className="space-y-6 px-4">
                                    <div className="space-y-2">
                                        <span className="text-orange-600 font-black text-[10px] uppercase tracking-widest">{space.tag}</span>
                                        <h3 className="text-4xl font-serif text-slate-900 group-hover:text-orange-500 transition-colors">{space.title}</h3>
                                    </div>
                                    <p className="text-lg text-slate-500 font-light leading-relaxed">
                                        {space.desc}
                                    </p>
                                    <button className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-slate-900 hover:text-orange-600 transition-colors group">
                                        Ver Detalles <ChevronRight size={18} className="translate-x-0 group-hover:translate-x-2 transition-transform opacity-30 group-hover:opacity-100" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* VIRTUAL TOUR SECTION - CINEMATIC DARK */}
            <section className="py-24 md:py-48 bg-[#0a0a0c] text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-5xl mx-auto flex flex-col items-center text-center space-y-12">
                        <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full border border-white/10 bg-white/5 text-orange-500 font-black text-[10px] uppercase tracking-[0.4em]">
                            <Camera size={14} /> Recorrido 360°
                        </div>
                        <h2 className="text-5xl md:text-8xl font-serif leading-none italic">
                            Explore Crayon's <br /> <span className="text-white not-italic">sin fronteras.</span>
                        </h2>
                        <p className="text-xl text-slate-400 font-light max-w-2xl mx-auto leading-relaxed">
                            Le invitamos a conocer nuestras instalaciones desde cualquier rincón del mundo a través de nuestra experiencia de realidad virtual inmersiva.
                        </p>
                        <div className="pt-8">
                            <button className="bg-white text-[#0a0a0c] px-12 py-5 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all shadow-2xl shadow-white/5">
                                Iniciar Tour Virtual
                            </button>
                        </div>
                    </div>
                </div>

                {/* Aesthetic Accents */}
                <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -z-0" />
                <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent -z-0" />
            </section>

            {/* CTA SECTION - PRESTIGE */}
            <section className="py-32 bg-white text-center">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto space-y-12">
                        <h2 className="text-5xl md:text-7xl font-serif text-slate-900 leading-[1.1]">
                            El mejor lugar para <br /> <span className="italic text-orange-600">crecer y brillar.</span>
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                            <Link to="/admision" className="bg-slate-900 text-white px-12 py-5 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all">
                                Programar Visita Presencial
                            </Link>
                            <Link to="/contacto" className="px-12 py-5 rounded-full text-[11px] font-black uppercase tracking-widest text-slate-900 border-2 border-slate-900 hover:bg-slate-900 hover:text-white transition-all">
                                Consultar Ubicación
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

import { Link } from "react-router-dom";
export default Infraestructura;
