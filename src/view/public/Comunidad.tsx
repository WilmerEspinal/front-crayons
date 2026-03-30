import { Users, Heart, Star, GraduationCap, MessageSquare, CheckCircle2, ChevronRight, UserCircle } from "lucide-react";
import { useState, useEffect } from 'react';

const Comunidad = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const sections = [
        {
            title: "Nuestros Alumnos",
            tag: "El Corazón",
            desc: "Buscamos el florecimiento de cada talento individual, fomentando el liderazgo, la creatividad y el bienestar.",
            image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800",
            icon: <Users className="w-8 h-8" />,
            features: ["Liderazgo Consciente", "Vida Académica", "Clubes & Deportes"]
        },
        {
            title: "Padres de Familia",
            tag: "Nuestros Aliados",
            desc: "Creemos en la formación compartida. Trabajamos de la mano con las familias para asegurar un entorno de apoyo.",
            image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800",
            icon: <Heart className="w-8 h-8" />,
            features: ["Escuela para Padres", "Comunicación Fluida", "Talleres Familiares"]
        },
        {
            title: "Plana Docente",
            tag: "Mentores Brillantes",
            desc: "Profesionales de alto nivel, apasionados por inspirar y guiar a la nueva generación de líderes.",
            image: "https://images.unsplash.com/photo-1577891777125-c43c52855797?auto=format&fit=crop&q=80&w=800",
            icon: <Star className="w-8 h-8" />,
            features: ["Capacitación Continua", "Metodologías Activas", "Acompañamiento"]
        },
        {
            title: "Exalumnos",
            tag: "Nuestra Huella",
            desc: "Una red global de líderes que llevan el sello Crayon's a las mejores universidades y empresas del mundo.",
            image: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=800",
            icon: <GraduationCap className="w-8 h-8" />,
            features: ["Red de Contactos", "Mentorías", "Eventos Alumni"]
        }
    ];

    return (
        <div className="flex flex-col w-full bg-[#fdfcfb]">
            {/* ATMOSPHERIC HERO */}
            <section className="relative h-[70vh] flex items-center overflow-hidden bg-slate-900">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=2000"
                        alt="Community connection"
                        className="w-full h-full object-cover opacity-30 brightness-50 contrast-125 scale-105 animate-slow-zoom"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-transparent to-white" />
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center space-y-8">
                    <div className={`flex items-center justify-center gap-4 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="w-12 h-0.5 bg-orange-600" />
                        <span className="text-orange-500 font-black text-[10px] uppercase tracking-[0.4em]">Un Solo Corazón</span>
                        <div className="w-12 h-0.5 bg-orange-600" />
                    </div>
                    <h1 className={`text-6xl md:text-9xl font-serif text-white tracking-tight leading-none transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                        Vivir en <br />
                        <span className="italic">Comunidad.</span>
                    </h1>
                </div>
            </section>

            {/* COMMUNITY SEGMENTS - EDITORIAL SHOWCASE */}
            <section className="py-24 md:py-48 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-40">
                        {sections.map((sec, i) => (
                            <div key={i} className="group space-y-10">
                                <div className="relative overflow-hidden rounded-[3rem] aspect-video shadow-2xl transition-all duration-700 group-hover:rounded-[1.5rem] bg-slate-100">
                                    <img
                                        src={sec.image}
                                        alt={sec.title}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                    />
                                    <div className="absolute inset-0 bg-orange-600/10 group-hover:bg-transparent transition-colors" />
                                </div>

                                <div className="space-y-8 px-4">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="text-orange-600">{sec.icon}</div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{sec.tag}</span>
                                        </div>
                                        <h2 className="text-4xl md:text-5xl font-serif text-slate-900 leading-tight">
                                            {sec.title.split(' ')[0]} <br />
                                            <span className="italic text-orange-500">{sec.title.split(' ')[1] || ''} {sec.title.split(' ')[2] || ''}</span>
                                        </h2>
                                    </div>

                                    <p className="text-lg text-slate-500 font-light leading-relaxed">
                                        {sec.desc}
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {sec.features.map((feat, fi) => (
                                            <div key={fi} className="flex items-center gap-3">
                                                <CheckCircle2 size={16} className="text-orange-200 group-hover:text-orange-600 transition-colors" />
                                                <span className="text-xs font-bold text-slate-700">{feat}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-4">
                                        <Link to={sec.title.toLowerCase().includes('docente') || sec.title.toLowerCase().includes('profesores') ? '/profesores' : sec.title.toLowerCase().includes('alumnos') ? '/alumnos' : sec.title.toLowerCase().includes('padres') ? '/padres' : '/exalumnos'} className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-slate-900 hover:text-orange-600 transition-colors group">
                                            Explorar área <ChevronRight size={18} className="translate-x-0 group-hover:translate-x-2 transition-transform opacity-30 group-hover:opacity-100" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* INTRANET / PORTAL SECTION - PREMIUM DARK */}
            <section className="py-24 md:py-48 bg-[#0a0a0c] text-white relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-600/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[4rem] p-12 md:p-24 overflow-hidden relative group">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                                <div className="space-y-10">
                                    <div className="space-y-6">
                                        <div className="w-16 h-16 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-2xl shadow-orange-600/20">
                                            <UserCircle size={32} />
                                        </div>
                                        <h2 className="text-5xl md:text-7xl font-serif leading-none italic">
                                            Área de <br /> <span className="text-orange-500 not-italic">Miembros.</span>
                                        </h2>
                                        <p className="text-xl text-slate-400 font-light leading-relaxed">
                                            Un espacio digital exclusivo para nuestra comunidad. Acceda a recursos, gestión académica y comunicación directa para una experiencia integrada.
                                        </p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-6">
                                        <Link to="/login" className="bg-white text-[#0a0a0c] px-12 py-5 rounded-full text-[11px] font-black uppercase tracking-widest text-center hover:bg-orange-600 hover:text-white transition-all">
                                            Acceder a Intranet
                                        </Link>
                                        <button className="px-12 py-5 rounded-full text-[11px] font-black uppercase tracking-widest text-white border border-white/20 hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                                            Soporte Técnico <MessageSquare size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="aspect-square rounded-[3rem] overflow-hidden border border-white/10 p-4 bg-white/5">
                                        <img
                                            src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=800"
                                            alt="Portal Digital"
                                            className="w-full h-full object-cover rounded-[2rem] grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000"
                                        />
                                    </div>
                                    {/* Floating Stats */}
                                    <div className="absolute -bottom-8 -left-8 bg-orange-600 p-8 rounded-[2rem] shadow-2xl">
                                        <p className="text-4xl font-serif text-white leading-none">24/7</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/80">Disponibilidad</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA SECTION - WELCOMING */}
            <section className="py-32 bg-white text-center">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto space-y-12">
                        <div className="flex -space-x-4 justify-center">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="w-16 h-16 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-xl">
                                    <img src={`https://i.pravatar.cc/150?img=${i + 20}`} alt="Community Member" />
                                </div>
                            ))}
                        </div>
                        <h2 className="text-5xl md:text-7xl font-serif text-slate-900 leading-tight">
                            Sea parte de una <br /> historia con <span className="italic text-orange-600">propósito.</span>
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link to="/admision" className="bg-slate-900 text-white px-12 py-5 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all">
                                Unirse a Crayon's
                            </Link>
                            <Link to="/contacto" className="px-12 py-5 rounded-full text-[11px] font-black uppercase tracking-widest text-slate-900 border-2 border-slate-900 hover:bg-slate-900 hover:text-white transition-all">
                                Solicitar Visita
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

import { Link } from "react-router-dom";
export default Comunidad;
