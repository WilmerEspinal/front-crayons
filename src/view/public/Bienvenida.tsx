import { Quote, ChevronRight } from "lucide-react";
import { useState, useEffect } from 'react';

const Bienvenida = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    return (
        <div className="flex flex-col w-full bg-white selection:bg-orange-100">
            {/* SEO Headline Hidden */}
            <h1 className="sr-only">Mensaje de Bienvenida de la Dirección - Colegio Crayon's</h1>

            {/* ARTISTIC HERO SECTION */}
            <section className="relative min-h-[60vh] flex items-center overflow-hidden bg-[#0a0a0c]">
                {/* Background artistic elements */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#0a0a0c]" />
                    <img
                        src="https://res.cloudinary.com/droodoirh/image/upload/v1772123393/docentes_3_gaiz8x.jpg"
                        alt="Campus atmosphere"
                        className="w-full h-full object-cover opacity-30 grayscale saturate-50 scale-105 animate-slow-zoom"
                    />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl space-y-6">
                        <span className={`inline-block text-orange-500 font-bold text-xs uppercase tracking-[0.4em] transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            Nuestra Dirección
                        </span>
                        <h2 className={`text-5xl md:text-8xl font-serif text-white leading-[0.9] transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            Donde cada <br />
                            <span className="italic text-orange-500">historia</span> importa.
                        </h2>
                    </div>
                </div>
            </section>

            {/* EDITORIAL CONTENT SECTION */}
            <section className="py-24 md:py-32 relative">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">

                        {/* THE PORTRAIT - EDITORIAL STYLE */}
                        <div className="lg:col-span-5 relative group">
                            <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] bg-slate-100">
                                <img
                                    src="https://res.cloudinary.com/droodoirh/image/upload/v1772123382/docentes_damas_ldquos.jpg"
                                    alt="Dra. Patricia Vilcapoma - Directora General"
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            </div>

                            {/* Floating Identity Card */}
                            <div className="absolute -bottom-10 -right-4 lg:-right-10 bg-white p-8 rounded-[1.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-50 max-w-[280px]">
                                <p className="font-serif italic text-2xl text-slate-900 leading-tight mb-1">Dra. Patricia Vilcapoma</p>
                                <p className="text-orange-600 font-black text-[10px] uppercase tracking-widest">Directora General</p>
                            </div>

                            {/* Decorative element */}
                            <div className="absolute -top-10 -left-10 w-32 h-32 bg-orange-50 rounded-full -z-10 animate-pulse-slow" />
                        </div>

                        {/* THE MESSAGE - TYPOGRAPHY DRIVEN */}
                        <div className="lg:col-span-7 space-y-12">
                            <div className="space-y-6">
                                <div className="w-12 h-1 bg-orange-500" />
                                <Quote size={48} className="text-orange-500/20 mb-[-2rem]" />
                                <h3 className="text-3xl md:text-5xl font-serif text-slate-900 leading-tight">
                                    "La educación no es llenar un cubo, sino encender un <span className="italic">fuego</span>."
                                </h3>
                            </div>

                            <div className="columns-1 md:columns-2 gap-8 text-slate-600 text-sm leading-relaxed space-y-6 [column-fill:balance]">
                                <p className="first-letter:text-5xl first-letter:font-serif first-letter:text-orange-600 first-letter:float-left first-letter:mr-3 first-letter:mt-1">
                                    Estimados padres de familia y alumnos, es un honor para mí darles la más cordial bienvenida a nuestra institución. En Crayon's, creemos fielmente que cada niño es un universo infinito de posibilidades esperando ser descubierto por la guía correcta.
                                </p>
                                <p>
                                    Nuestra misión trasciende los límites de la enseñanza académica convencional; buscamos formar seres humanos íntegros, con valores innegociables y la capacidad crítica de transformar su entorno de manera sensible y positiva.
                                </p>
                                <p>
                                    Contamos con un equipo de mentores altamente calificados que no solo enseñan, sino que inspiran. Nuestra infraestructura está diseñada para ser el escenario donde el talento florece y la curiosidad nunca es silenciada.
                                </p>
                                <p className="italic font-serif text-slate-500 border-l-2 border-orange-200 pl-4 py-2">
                                    Les invito a caminar junto a nosotros en esta gran familia, donde el aprendizaje es la mayor de las aventuras.
                                </p>
                            </div>

                            <div className="pt-8 flex flex-col sm:flex-row gap-8 sm:items-center">
                                <Link to="/admision" className="bg-slate-900 text-white px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center justify-center gap-2 group">
                                    Solicitar Información <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <div className="flex -space-x-3 overflow-hidden">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-slate-200 overflow-hidden">
                                            <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Community members" />
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-center h-10 w-10 rounded-full ring-2 ring-white bg-orange-100 text-[#F26513] text-[10px] font-bold">
                                        +500
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ARTISTIC STATS SECTION */}
            <section className="py-24 bg-slate-50 overflow-hidden relative">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center divide-y md:divide-y-0 md:divide-x divide-slate-200">
                        <div className="py-8 md:py-0 space-y-3 px-8 transform transition-transform hover:scale-105 duration-500">
                            <span className="text-xs font-black text-orange-500 uppercase tracking-widest">Nuestra Trayectoria</span>
                            <h4 className="text-6xl font-serif text-slate-900">13 <span className="text-2xl text-orange-300">Años</span></h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">De compromiso ininterrumpido</p>
                        </div>
                        <div className="py-8 md:py-0 space-y-3 px-8 transform transition-transform hover:scale-105 duration-500">
                            <span className="text-xs font-black text-orange-500 uppercase tracking-widest">Graduados de Éxito</span>
                            <h4 className="text-6xl font-serif text-slate-900">100%</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">De ingresos universitarios</p>
                        </div>
                        <div className="py-8 md:py-0 space-y-3 px-8 transform transition-transform hover:scale-105 duration-500">
                            <span className="text-xs font-black text-orange-500 uppercase tracking-widest">Innovación Constante</span>
                            <h4 className="text-6xl font-serif text-slate-900">25+</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Proyectos de investigación anuales</p>
                        </div>
                    </div>
                </div>

                {/* Visual Accent */}
                <div className="absolute top-1/2 left-0 w-full text-[20vw] font-black text-slate-100/50 leading-none -translate-y-1/2 -z-0 pointer-events-none select-none">
                    EXCELENCIA
                </div>
            </section>
        </div>
    );
};

import { Link } from "react-router-dom";
export default Bienvenida;
