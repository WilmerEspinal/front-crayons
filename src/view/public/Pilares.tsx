import { Trophy, Laptop, Star, Globe, ArrowRight, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from 'react';

const Pilares = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const pillars = [
        {
            title: "Excelencia Académica",
            tag: "Rigurosidad",
            desc: "Implementamos metodologías activas y estándares internacionales para asegurar un aprendizaje profundo, crítico y significativo.",
            icon: <Trophy className="w-8 h-8" />,
            features: ["Enfoque por Competencias", "Evaluación Formativa", "Mentalidad de Crecimiento"],
            image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
            color: "orange"
        },
        {
            title: "Innovación & STEAM",
            tag: "Vanguardia",
            desc: "Integramos la ciencia, tecnología, ingeniería, artes y matemáticas para preparar a nuestros alumnos ante los retos del futuro.",
            icon: <Laptop className="w-8 h-8" />,
            features: ["Pensamiento Computacional", "Laboratorios High-Tech", "Diseño de Proyectos"],
            image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
            color: "indigo"
        },
        {
            title: "Formación en Valores",
            tag: "Integridad",
            desc: "Cultivamos seres humanos de alma noble, donde el respeto, la solidaridad y la ética son el norte de cada acción cotidiana.",
            icon: <Star className="w-8 h-8" />,
            features: ["Educación Emocional", "Responsabilidad Social", "Liderazgo Consciente"],
            image: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=80",
            color: "emerald"
        },
        {
            title: "Visión Global",
            tag: "Conexión",
            desc: "Fomentamos el bilingüismo y la conciencia intercultural, abriendo puertas a oportunidades en cualquier rincón del mundo.",
            icon: <Globe className="w-8 h-8" />,
            features: ["Inmersión Lingüística", "Ciudadanía Global", "Convenios Internacionales"],
            image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
            color: "amber"
        }
    ];

    return (
        <div className="flex flex-col w-full bg-[#fdfcfb]">
            {/* MINIMALIST ARCHITECTURAL HERO */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="container mx-auto">
                    <div className="max-w-3xl space-y-8 relative z-10">
                        <div className={`flex items-center gap-4 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0 -translate-x-4'}`}>
                            <div className="w-12 h-px bg-orange-600" />
                            <span className="text-orange-600 font-black text-[10px] uppercase tracking-[0.4em]">Cimientos de Excelencia</span>
                        </div>
                        <h1 className={`text-6xl md:text-8xl font-serif text-slate-900 leading-[0.9] transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            Nuestros <br />
                            <span className="italic">Pilares.</span>
                        </h1>
                        <p className={`text-lg text-slate-500 max-w-xl font-medium leading-relaxed transition-all duration-1000 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            La educación en Crayon's se sostiene sobre cuatro principios fundamentales que garantizan el florecimiento de cada estudiante.
                        </p>
                    </div>
                </div>

                {/* Aesthetic Background Detail */}
                <div className="absolute top-0 right-0 w-1/2 h-full -z-10 overflow-hidden hidden lg:block">
                    <div className="absolute inset-0 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />
                    <img
                        src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1000"
                        alt="Minimal architecture"
                        className="w-full h-full object-cover grayscale opacity-20"
                    />
                </div>
            </section>

            {/* DYNAMIC PILLARS SHOWCASE */}
            <section className="py-24">
                <div className="container mx-auto px-6">
                    <div className="space-y-40">
                        {pillars.map((pillar, i) => (
                            <div key={i} className={`flex flex-col lg:flex-row items-center gap-16 lg:gap-32 ${i % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>

                                {/* Image Composition */}
                                <div className="flex-1 w-full group relative">
                                    <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-700 group-hover:rounded-[2rem]">
                                        <img
                                            src={pillar.image}
                                            alt={pillar.title}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                                    </div>

                                    {/* Abstract tag */}
                                    <div className={`absolute -top-6 ${i % 2 !== 0 ? '-right-6' : '-left-6'} bg-white px-6 py-6 rounded-[2rem] shadow-xl border border-slate-50 flex flex-col items-center`}>
                                        <div className="text-orange-500 mb-2">{pillar.icon}</div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{pillar.tag}</span>
                                    </div>
                                </div>

                                {/* Content Composition */}
                                <div className="flex-1 space-y-8">
                                    <div className="space-y-4">
                                        <span className="inline-block px-4 py-1.5 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">Pilar {i + 1}</span>
                                        <h2 className="text-4xl md:text-5xl font-serif text-slate-900 leading-tight">
                                            {pillar.title.split(' & ')[0]}
                                            {pillar.title.includes(' & ') && <span className="italic text-orange-500"> & {pillar.title.split(' & ')[1]}</span>}
                                        </h2>
                                    </div>

                                    <p className="text-lg text-slate-600 leading-relaxed font-light">
                                        {pillar.desc}
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-12">
                                        {pillar.features.map((feat, fi) => (
                                            <div key={fi} className="flex items-center gap-3 group/feat">
                                                <div className="w-5 h-5 rounded-full border border-orange-200 flex items-center justify-center text-orange-500 transition-colors group-hover/feat:bg-orange-500 group-hover/feat:text-white group-hover/feat:border-orange-500">
                                                    <CheckCircle2 size={10} />
                                                </div>
                                                <span className="text-sm font-bold text-slate-700">{feat}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-6">
                                        <button className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-slate-900 hover:text-orange-600 transition-colors group">
                                            Explorar este pilar
                                            <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-2 transition-transform opacity-30 group-hover:opacity-100" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CALL TO ACTION - MINIMALIST */}
            <section className="py-32 bg-[#0a0a0c] text-white">
                <div className="container mx-auto px-6 text-center space-y-10">
                    <h3 className="text-4xl md:text-6xl font-serif italic mb-8">
                        ¿Listo para formar parte <br /> de nuestra visión?
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link to="/admision" className="bg-orange-600 text-white px-12 py-5 rounded-full text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-orange-600/20">
                            Proceso de Admisión
                        </Link>
                        <Link to="/contacto" className="bg-white/5 border border-white/10 text-white px-12 py-5 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                            Agendar Visita
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

import { Link } from "react-router-dom";
export default Pilares;
