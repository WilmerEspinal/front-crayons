import { Trophy, BookOpen, Microscope, Globe, BarChart3, GraduationCap, ArrowRight, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from 'react';

const ExcelenciaAcademica = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const levels = [
        {
            title: "Nivel Primaria",
            desc: "Donde la curiosidad se convierte en competencia. Fomentamos el pensamiento lógico y la expresión creativa en un entorno bilingüe.",
            icon: <BookOpen className="w-8 h-8" />,
            metrics: ["Ambientes seguros", "Maestros de vocación", "Programas integrales"],
            image: "https://res.cloudinary.com/droodoirh/image/upload/v1772123384/primaria_foto_grupal_deporte_mg1fpu.jpg"
        },
        {
            title: "Nivel Secundaria",
            desc: "Preparación de alto rendimiento para el mundo real. Enfoque en liderazgo, investigación científica y preparación pre-universitaria.",
            icon: <GraduationCap className="w-8 h-8" />,
            metrics: ["Prep. Preuniversitaria", "Profesores con vocación", "Tecnología de Vanguardia"],
            image: "https://res.cloudinary.com/droodoirh/image/upload/v1772123389/secundaria_s8qetc.jpg"
        }
    ];

    return (
        <div className="flex flex-col w-full bg-white">
            {/* CINEMATIC HERO */}
            <section className="relative h-[80vh] flex items-center overflow-hidden bg-slate-900">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://res.cloudinary.com/droodoirh/image/upload/v1772123397/postualacion_auniverdades_alumnos_del_cole_crayons_itzilj.jpg"
                        alt="Academic excellence"
                        className="w-full h-full object-cover brightness-50 contrast-125 scale-105 animate-slow-zoom"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent" />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl space-y-8">
                        <div className={`flex items-center gap-4 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="w-12 h-0.5 bg-orange-500" />
                            <span className="text-orange-500 font-black text-[10px] uppercase tracking-[0.4em]">Alto Rendimiento</span>
                        </div>
                        <h1 className={`text-6xl md:text-9xl font-serif text-white leading-[0.9] transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                            Hacia la <br />
                            <span className="italic">Cúspide.</span>
                        </h1>
                        <p className={`text-lg text-slate-300 max-w-xl font-light leading-relaxed transition-all duration-1000 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            Nuestro modelo pedagógico combina la rigurosidad académica con la innovación tecnológica para formar mentes brillantes capaces de liderar el mañana.
                        </p>
                    </div>
                </div>
            </section>

            {/* DIFFERENTIATORS GRID */}
            <section className="py-24 bg-slate-50">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                        {[
                            { icon: <Microscope size={24} />, title: "Investigación", d: "Fomentamos el espíritu científico desde la observación inicial." },
                            { icon: <Globe size={24} />, title: "Bilingüismo", d: "Certificaciones internacionales que avalan el dominio del inglés." },
                            { icon: <BarChart3 size={24} />, title: "Analítica", d: "Seguimiento personalizado del progreso académico mediante data." },
                            { icon: <Trophy size={24} />, title: "Éxito", d: "Altos índices de ingreso a las universidades más prestigiosas." }
                        ].map((item, i) => (
                            <div key={i} className="space-y-4 group">
                                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-orange-600 shadow-sm group-hover:bg-orange-600 group-hover:text-white transition-all duration-500">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed font-light">{item.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* LEVELS SHOWCASE - VERTICAL EDITORIAL */}
            <section className="py-24 md:py-48">
                <div className="container mx-auto px-6">
                    <div className="space-y-48">
                        {levels.map((lvl, i) => (
                            <div key={i} className={`flex flex-col lg:flex-row gap-24 items-center ${i % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
                                <div className="flex-1 w-full relative">
                                    <div className="aspect-[16/10] rounded-[4rem] overflow-hidden shadow-2xl relative group">
                                        <img src={lvl.image} alt={lvl.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors" />
                                    </div>
                                    {/* Accent Card */}
                                    <div className={`absolute -bottom-12 ${i % 2 !== 0 ? '-left-12' : '-right-12'} p-10 bg-white rounded-[2.5rem] shadow-2xl border border-slate-50 hidden lg:block`}>
                                        <div className="flex flex-col gap-4">
                                            {lvl.metrics.map((m, mi) => (
                                                <div key={mi} className="flex items-center gap-3">
                                                    <CheckCircle2 size={16} className="text-orange-500" />
                                                    <span className="text-xs font-black uppercase tracking-widest text-slate-600">{m}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-10">
                                    <div className="space-y-6">
                                        <div className="text-orange-600">{lvl.icon}</div>
                                        <h2 className="text-5xl md:text-7xl font-serif text-slate-900 leading-none">
                                            {lvl.title.split(' ')[0]} <br />
                                            <span className="italic">{lvl.title.split(' ')[1]}</span>
                                        </h2>
                                        <p className="text-xl text-slate-600 font-light leading-relaxed">
                                            {lvl.desc}
                                        </p>
                                    </div>
                                    <div className="pt-6">
                                        <button className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-slate-900 hover:text-orange-600 transition-colors group">
                                            Plan Curricular <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-2 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ACADEMIC ETHOS SECTION */}
            <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full text-[20vw] font-black text-white/5 leading-none -translate-y-1/2 pointer-events-none select-none italic">
                    RIGOR.
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-12">
                        <div className="w-20 h-20 rounded-full border-2 border-orange-500 flex items-center justify-center">
                            <GraduationCap size={40} className="text-orange-500" />
                        </div>
                        <h2 className="text-4xl md:text-6xl font-serif leading-tight">
                            "Un entorno que desafía <br /> y apoya a cada <span className="italic text-orange-500">estudiante</span>."
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full pt-12">
                            <div className="p-8 border border-white/10 rounded-[2rem] hover:bg-white/5 transition-colors text-left space-y-4">
                                <h4 className="text-lg font-bold">Certificaciones</h4>
                                <p className="text-sm text-slate-400 font-light">Contamos con convenios internacionales que validan las competencias de nuestros egresados en idiomas y tecnología.</p>
                            </div>
                            <div className="p-8 border border-white/10 rounded-[2rem] hover:bg-white/5 transition-colors text-left space-y-4">
                                <h4 className="text-lg font-bold">Acompañamiento</h4>
                                <p className="text-sm text-slate-400 font-light">Tutoría personalizada para asegurar que cada alumno alcance su máximo potencial académico y emocional.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};


export default ExcelenciaAcademica;
