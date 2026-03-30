import { Target, Zap, Activity } from "lucide-react";
import { useState, useEffect } from 'react';

const Deporte = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const sports = [
        {
            title: "Fútbol & Vóley",
            desc: "Trabajo en equipo y estrategia en nuestras canchas reglamentarias.",
            image: "https://res.cloudinary.com/droodoirh/image/upload/v1772123382/campo_deprotivp_acozvt.jpg",
            icon: <Activity className="w-8 h-8" />
        },
        {
            title: "Natación",
            desc: "Desarrollo de resistencia y técnica en nuestra piscina semi-olímpica.",
            image: "https://res.cloudinary.com/droodoirh/image/upload/v1772123396/natacion_pc1n3u.jpg",
            icon: <Zap className="w-8 h-8" />
        },
        {
            title: "Atletismo",
            desc: "Superación personal y disciplina en nuestras pistas de entrenamiento.",
            image: "https://images.unsplash.com/photo-1461896756913-64756598344f?auto=format&fit=crop&q=80&w=800",
            icon: <Target className="w-8 h-8" />
        }
    ];

    return (
        <div className="flex flex-col w-full bg-white">
            {/* ENERGETIC HERO */}
            <section className="relative h-[85vh] flex items-center overflow-hidden bg-orange-600">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://res.cloudinary.com/droodoirh/image/upload/v1772123384/primaria_foto_grupal_deporte_mg1fpu.jpg"
                        alt="Sports and movement"
                        className="w-full h-full object-cover brightness-75 contrast-110 saturate-150 animate-slow-zoom"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-orange-950/80 via-orange-600/40 to-transparent" />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl space-y-8">
                        <div className={`flex items-center gap-4 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="w-12 h-px bg-white" />
                            <span className="text-white font-black text-[10px] uppercase tracking-[0.4em]">Mente Sana, Cuerpo Sano</span>
                        </div>
                        <h1 className={`text-6xl md:text-9xl font-serif text-white leading-[0.85] transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                            Fuerza & <br />
                            <span className="italic">Disciplina.</span>
                        </h1>
                        <p className={`text-lg text-orange-50 max-w-xl font-light leading-relaxed transition-all duration-1000 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            El deporte en Crayon's es una escuela de vida. Fomentamos la competitividad sana, la resiliencia y el espíritu de equipo en cada disciplina.
                        </p>
                    </div>
                </div>
            </section>

            {/* SPORTS GRID - DYNAMIC CARDS */}
            <section className="py-24 md:py-48">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
                        {sports.map((sport, i) => (
                            <div key={i} className="group relative pt-12">
                                <div className="absolute top-0 left-0 text-[10rem] font-black text-slate-50 -z-10 group-hover:text-orange-50 transition-colors leading-none tracking-tighter">
                                    0{i + 1}
                                </div>
                                <div className="space-y-8">
                                    <div className="aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl relative group-hover:-translate-y-4 transition-transform duration-700">
                                        <img src={sport.image} alt={sport.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
                                        <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-white text-xs font-black uppercase tracking-widest">Ver Instalaciones</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4 px-2">
                                        <div className="text-orange-600">{sport.icon}</div>
                                        <h3 className="text-3xl font-serif text-slate-900 leading-tight">{sport.title}</h3>
                                        <p className="text-slate-500 font-light leading-relaxed">{sport.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PERFORMANCE SECTION - EDITORIAL DARK */}
            <section className="py-24 md:py-48 bg-[#0D101C] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none select-none text-[30vw] font-black text-white italic -translate-y-1/2 translate-x-1/2">
                    SOAR
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row gap-24 items-center">
                        <div className="lg:w-1/2 space-y-10">
                            <div className="space-y-6">
                                <span className="text-orange-500 font-black text-[10px] uppercase tracking-widest px-4 py-1 border border-orange-500 rounded-full">Alto Rendimiento</span>
                                <h2 className="text-5xl md:text-7xl font-serif leading-none">
                                    Más allá del <br /> <span className="italic text-orange-500">Mar marcador.</span>
                                </h2>
                                <p className="text-xl text-slate-400 font-light leading-relaxed">
                                    Creemos que la excelencia física es el complemento perfecto del éxito académico. Nuestros programas de entrenamiento están diseñados para cultivar no solo atletas, sino líderes resilientes.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                {[
                                    { t: "Liderazgo", d: "Capitanía y gestión de equipos en torneos regionales." },
                                    { t: "Resiliencia", d: "Aprender del proceso, no solo del resultado." },
                                    { t: "Disciplina", d: "Hábitos saludables y rigor en el entrenamiento." },
                                    { t: "Cero Excusas", d: "Compromiso total con los objetivos colectivos." }
                                ].map((val, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="mt-1 w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-white">{val.t}</h4>
                                            <p className="text-xs text-slate-500">{val.d}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:w-1/2 grid grid-cols-2 gap-6 pt-16 lg:pt-0">
                            <div className="aspect-[3/5] rounded-[2.5rem] overflow-hidden shadow-2xl skew-y-2">
                                <img src="https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=800" alt="Training" className="w-full h-full object-cover grayscale brightness-75" />
                            </div>
                            <div className="aspect-[3/5] rounded-[2.5rem] overflow-hidden shadow-2xl -skew-y-2 translate-y-12">
                                <img src="https://images.unsplash.com/photo-1542652694-40abf526446e?auto=format&fit=crop&q=80&w=800" alt="Teamwork" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA SECTION - BOLD & CLEAN */}
            <section className="py-32 bg-white text-center">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto space-y-10">
                        <h2 className="text-5xl md:text-7xl font-serif text-slate-900 leading-tight">
                            Únase al equipo <br /> de los <span className="italic text-orange-600">campeones.</span>
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                            <Link to="/admision" className="bg-slate-900 text-white px-12 py-5 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-orange-600 hover:scale-105 transition-all">
                                Solicitar Admisión
                            </Link>
                            <Link to="/contacto" className="px-12 py-5 rounded-full text-[11px] font-black uppercase tracking-widest text-[#0D101C] border-2 border-[#0D101C] hover:bg-[#0D101C] hover:text-white transition-all">
                                Ver Calendario Deportivo
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

import { Link } from "react-router-dom";
export default Deporte;
