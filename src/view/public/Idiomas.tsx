import { Globe2, Headphones, Award, Languages, ChevronRight, Check } from "lucide-react";
import { useState, useEffect } from 'react';

const Idiomas = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const features = [
        {
            title: "Inmersión Total",
            desc: "Ambientes diseñados para que el aprendizaje del idioma sea natural y constante.",
            icon: <Headphones className="w-8 h-8" />
        },
        {
            title: "Certificaciones",
            desc: "Preparación especializada para exámenes internacionales (Cambridge, TOEFL).",
            icon: <Award className="w-8 h-8" />
        },
        {
            title: "Intercambios",
            desc: "Oportunidades de viaje y programas de intercambio con instituciones globales.",
            icon: <Globe2 className="w-8 h-8" />
        }
    ];

    return (
        <div className="flex flex-col w-full bg-[#fdfcfb]">
            {/* MULTILINGUAL HERO */}
            <section className="relative h-[75vh] flex items-center overflow-hidden bg-indigo-950">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://res.cloudinary.com/droodoirh/image/upload/v1773505676/hero-optmizado_mjdhrk.jpg"
                        alt="Global communication"
                        className="w-full h-full object-cover opacity-30 mix-blend-overlay scale-110 animate-slow-zoom"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-950 via-indigo-950/60 to-transparent" />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl space-y-8">
                        <div className={`flex items-center gap-4 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="w-12 h-0.5 bg-orange-500" />
                            <span className="text-orange-500 font-black text-[10px] uppercase tracking-[0.4em]">Ciudadanos del Mundo</span>
                        </div>
                        <h1 className={`text-6xl md:text-9xl font-serif text-white leading-[0.9] transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                            Sin <br />
                            <span className="italic text-orange-500">Fronteras.</span>
                        </h1>
                        <p className={`text-lg text-indigo-100 max-w-xl font-light leading-relaxed transition-all duration-1000 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            En un mundo interconectado, el dominio de los idiomas es la llave maestra para el éxito global. Nuestro programa de bilingüismo prepara a los estudiantes para comunicarse con fluidez y confianza.
                        </p>
                    </div>
                </div>

                {/* Floating Words Decoration */}
                <div className="absolute bottom-20 right-20 space-y-2 text-white/5 font-serif italic text-6xl hidden lg:block select-none pointer-events-none">
                    <p className="translate-x-12 animate-pulse-slow">Hello.</p>
                    <p className="-translate-x-8">Bonjour.</p>
                    <p className="translate-x-4">Hola.</p>
                </div>
            </section>

            {/* ENGLISH CORE SECTION - EDITORIAL SPLIT */}
            <section className="py-24 md:py-48">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div className="relative">
                            <div className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl relative">
                                <img
                                    src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=1000"
                                    alt="Students communicating"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-indigo-900/10" />
                            </div>

                            {/* Decorative badge */}
                            <div className="absolute -bottom-12 -left-12 p-12 bg-white rounded-[3rem] shadow-2xl border border-indigo-50 hidden md:block">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-indigo-600">
                                        <Languages size={24} />
                                        <span className="font-bold uppercase tracking-widest text-[10px]">Cambridge Partner</span>
                                    </div>
                                    <h4 className="text-3xl font-serif text-slate-900">Especialización <br /> Constante.</h4>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-12">
                            <div className="space-y-6">
                                <span className="text-orange-600 font-black text-[10px] uppercase tracking-widest">Enfoque Académico</span>
                                <h2 className="text-5xl md:text-7xl font-serif text-slate-900 leading-none">
                                    Inglés como <br /> <span className="italic">Lengua Viva.</span>
                                </h2>
                                <p className="text-xl text-slate-600 font-light leading-relaxed">
                                    Más que gramática y vocabulario, enseñamos a pensar y crear en inglés. Nuestro currículo integra el idioma en materias clave como Ciencias y Tecnología desde los primeros años.
                                </p>
                            </div>

                            <ul className="space-y-6">
                                {[
                                    "Certificaciones Cambridge desde Primaria.",
                                    "Debate e Oratoria en lengua extranjera.",
                                    "Proyectos colaborativos internacionales.",
                                    "Inmersión cultural y festividades globales."
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 group">
                                        <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                            <Check size={14} />
                                        </div>
                                        <span className="font-bold text-slate-700">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECONDARY LANGUAGES / METHODOLOGY - GRID */}
            <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                        {features.map((feat, i) => (
                            <div key={i} className="space-y-6 p-10 rounded-[3rem] border border-white/5 hover:bg-white/5 transition-colors group">
                                <div className="text-orange-500 group-hover:scale-110 transition-transform duration-500">{feat.icon}</div>
                                <h3 className="text-2xl font-serif">{feat.title}</h3>
                                <p className="text-slate-400 font-light leading-relaxed">{feat.desc}</p>
                                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Saber más <ChevronRight size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CALL TO ACTION - GLOBAL VISION */}
            <section className="py-32 bg-white text-center">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto space-y-12">
                        <h2 className="text-5xl md:text-7xl font-serif text-slate-900 leading-[1.1]">
                            Hablar el idioma del <br /> <span className="italic text-orange-600">futuro</span> es posible.
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link to="/admision" className="bg-slate-900 text-white px-12 py-5 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all">
                                Consultar Programa
                            </Link>
                            <Link to="/contacto" className="px-12 py-5 rounded-full text-[11px] font-black uppercase tracking-widest text-slate-900 border-2 border-slate-900 hover:bg-slate-900 hover:text-white transition-all">
                                Agendar Entrevista
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

import { Link } from "react-router-dom";
export default Idiomas;
