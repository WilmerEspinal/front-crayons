import { Palette, Music, Theater, Camera, Sparkles, ChevronRight, PlayCircle, Heart } from "lucide-react";
import { useState, useEffect } from 'react';

const ArteCultura = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const disciplines = [
        {
            title: "Artes Visuales",
            desc: "Exploración de técnicas clásicas y contemporáneas para plasmar visiones únicas del mundo.",
            icon: <Palette className="w-8 h-8" />,
            image: "https://res.cloudinary.com/droodoirh/image/upload/v1772123396/pinturas_alumnos_lhvn3g.jpg"
        },
        {
            title: "Artes Escénicas",
            desc: "Teatro y danza como canales de expresión corporal, confianza y conexión emocional.",
            icon: <Theater className="w-8 h-8" />,
            image: "https://res.cloudinary.com/droodoirh/image/upload/v1772123389/danzas_xyappt.jpg"
        },
        {
            title: "Música & Coro",
            desc: "Desarrollo de la sensibilidad auditiva y rítmica a través de instrumentos y canto coral.",
            icon: <Music className="w-8 h-8" />,
            image: "https://images.unsplash.com/photo-1514320298324-ee26485888e2?auto=format&fit=crop&q=80&w=800"
        }
    ];

    return (
        <div className="flex flex-col w-full bg-[#fdfcfb]">
            {/* ARTISTIC HERO - CINEMATIC & ATMOSPHERIC */}
            <section className="relative h-[80vh] flex items-center overflow-hidden bg-slate-900">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://res.cloudinary.com/droodoirh/image/upload/v1772123382/danza_jcqpvb.jpg"
                        alt="Arts and culture"
                        className="w-full h-full object-cover brightness-50 contrast-125 saturate-50 animate-slow-zoom"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent" />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl space-y-8">
                        <div className={`flex items-center gap-4 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="w-12 h-px bg-orange-500" />
                            <span className="text-orange-500 font-black text-[10px] uppercase tracking-[0.4em]">Sensibilidad & Expresión</span>
                        </div>
                        <h1 className={`text-6xl md:text-9xl font-serif text-white leading-[0.85] transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                            El Arte de <br />
                            <span className="italic">Sentir.</span>
                        </h1>
                        <p className={`text-lg text-slate-300 max-w-xl font-light leading-relaxed transition-all duration-1000 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            En Crayon's, las artes no son cursos complementarios, sino lenguajes fundamentales para el desarrollo integral del ser humano y la comprensión de nuestra cultura.
                        </p>
                    </div>
                </div>

                {/* Aesthetic Detail */}
                <div className="absolute bottom-10 right-10 flex gap-4 text-white/20 hidden lg:flex">
                    <Camera size={24} />
                    <Sparkles size={24} />
                    <PlayCircle size={24} />
                </div>
            </section>

            {/* ARTISTIC PATHS - VERTICAL EDITORIAL */}
            <section className="py-24 md:py-48 bg-white">
                <div className="container mx-auto px-6">
                    <div className="space-y-48">
                        {disciplines.map((item, i) => (
                            <div key={i} className={`flex flex-col lg:flex-row items-center gap-16 lg:gap-32 ${i % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>

                                {/* Image Composition */}
                                <div className="flex-1 w-full group relative">
                                    <div className="relative aspect-[16/10] overflow-hidden rounded-[3.5rem] shadow-2xl transition-all duration-1000 group-hover:rounded-[2rem]">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 p-12 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                                            <p className="text-white text-xs font-black uppercase tracking-widest">Nuestra Galería de Alumnos</p>
                                        </div>
                                    </div>

                                    {/* Offset Frame */}
                                    <div className={`absolute -inset-4 border border-orange-500/20 rounded-[4rem] -z-10 group-hover:scale-105 transition-transform duration-700 ${i % 2 !== 0 ? 'translate-x-4' : '-translate-x-4'}`} />
                                </div>

                                {/* Content Composition */}
                                <div className="flex-1 space-y-10">
                                    <div className="space-y-6">
                                        <div className="text-orange-600">{item.icon}</div>
                                        <h2 className="text-5xl md:text-7xl font-serif text-slate-900 leading-none">
                                            {item.title.split(' ')[0]} <br />
                                            {item.title.split(' ')[1] && <span className="italic text-orange-500">& {item.title.split(' ')[2] || item.title.split(' ')[1]}</span>}
                                        </h2>
                                        <p className="text-xl text-slate-500 font-light leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>

                                    <div className="pt-6">
                                        <button className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-slate-900 hover:text-orange-600 transition-colors group">
                                            Ver Proyectos <ChevronRight size={18} className="translate-x-0 group-hover:translate-x-2 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ARTISTIC MANIFESTO - DARK SECTION */}
            <section className="py-24 md:py-48 bg-slate-950 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                <div className="container mx-auto px-6 relative z-10 text-center space-y-16">
                    <div className="w-16 h-1 bg-orange-600 mx-auto" />
                    <h2 className="text-4xl md:text-6xl font-serif max-w-4xl mx-auto leading-tight italic">
                        "La belleza es una forma <br /> de inteligencia que nutre el <span className="text-orange-500">espíritu</span> de nuestros líderes."
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-left border-t border-white/5 pt-16">
                        {[
                            { t: "Sensibilidad", d: "Capacidad de percibir y apreciar la belleza en lo cotidiano." },
                            { t: "Identidad", d: "Reconocimiento y valoración de nuestras raíces culturales." },
                            { t: "Creatividad", d: "Solución de problemas de manera disruptiva y artística." }
                        ].map((item, i) => (
                            <div key={i} className="space-y-4">
                                <h4 className="text-orange-500 font-black text-[10px] uppercase tracking-widest">Pilar {i + 1}</h4>
                                <h3 className="text-2xl font-serif">{item.t}</h3>
                                <p className="text-sm text-slate-500 font-light leading-relaxed">{item.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA SECTION - ELEGANT */}
            <section className="py-32 bg-white text-center">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto space-y-12">
                        <Heart size={48} className="text-orange-500 mx-auto animate-pulse-slow" />
                        <h2 className="text-5xl md:text-7xl font-serif text-slate-900 leading-tight">
                            Despierte el genio <br /> que vive en su <span className="italic text-orange-600">interior.</span>
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                            <Link to="/admision" className="bg-slate-900 text-white px-12 py-5 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all">
                                Solicitar Información
                            </Link>
                            <Link to="/contacto" className="px-12 py-5 rounded-full text-[11px] font-black uppercase tracking-widest text-[#0D101C] border-2 border-[#0D101C] hover:bg-[#0D101C] hover:text-white transition-all">
                                Ver Calendario Cultural
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

import { Link } from "react-router-dom";
export default ArteCultura;
