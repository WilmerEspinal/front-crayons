import { ShieldCheck, Globe, GraduationCap, Building2, Handshake, Share2, Award } from "lucide-react";
import { useState, useEffect } from 'react';

const ConveniosAlianzas = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const partners = [
        {
            category: "Académico",
            title: "Consorcio Universitario",
            desc: "Acceso preferencial y becas en las universidades líderes del país y el extranjero.",
            icon: <GraduationCap className="w-8 h-8" />,
            partners: ["UPC", "PUCP", "Universidad de Lima", "UC Berkeley (Global Path)"]
        },
        {
            category: "Tecnología",
            title: "Innovation Hubs",
            desc: "Alianzas estratégicas con gigantes tecnológicos para formación en STEAM y certificaciones.",
            icon: <Building2 className="w-8 h-8" />,
            partners: ["Microsoft Education", "Google for Education", "Cisco Academy"]
        },
        {
            category: "Idiomas",
            title: "Language Institutes",
            desc: "Certificaciones internacionales que avalan el nivel de inglés de nuestros egresados.",
            icon: <Globe className="w-8 h-8" />,
            partners: ["Cambridge Assessment", "British Council", "TOEFL Alliance"]
        }
    ];

    return (
        <div className="flex flex-col w-full bg-white">
            {/* INSTITUTIONAL HERO */}
            <section className="relative h-[70vh] flex items-center overflow-hidden bg-slate-900">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&q=80&w=2000"
                        alt="Global partnerships"
                        className="w-full h-full object-cover opacity-30 brightness-50 contrast-125 grayscale"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent" />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl space-y-8">
                        <div className={`flex items-center gap-4 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="w-12 h-px bg-orange-500" />
                            <span className="text-orange-500 font-black text-[10px] uppercase tracking-[0.4em]">Red de Excelencia</span>
                        </div>
                        <h1 className={`text-6xl md:text-9xl font-serif text-white leading-[0.85] transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                            Conexión <br />
                            <span className="italic text-orange-500">Global.</span>
                        </h1>
                        <p className={`text-lg text-slate-400 max-w-xl font-light leading-relaxed transition-all duration-1000 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            Formamos parte de un ecosistema de prestigio que potencia las oportunidades académicas y profesionales de nuestros estudiantes a nivel internacional.
                        </p>
                    </div>
                </div>

                {/* Aesthetic Detail */}
                <div className="absolute bottom-12 right-12 text-white/5 font-serif italic text-8xl hidden lg:block select-none pointer-events-none">
                    Partnerships.
                </div>
            </section>

            {/* PARTNERS GRID - CLEAN & PROFESSIONAL */}
            <section className="py-24 md:py-48">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                        {partners.map((group, i) => (
                            <div key={i} className="space-y-10 group bg-slate-50 p-12 rounded-[3.5rem] hover:bg-white hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-700 border border-transparent hover:border-slate-100">
                                <div className="space-y-6">
                                    <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center text-orange-600 shadow-sm group-hover:bg-orange-600 group-hover:text-white transition-all duration-500">
                                        {group.icon}
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-orange-500 font-black text-[10px] uppercase tracking-widest">{group.category}</span>
                                        <h3 className="text-3xl font-serif text-slate-900">{group.title}</h3>
                                    </div>
                                    <p className="text-slate-500 font-light leading-relaxed">{group.desc}</p>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-slate-200">
                                    {group.partners.map((p, pi) => (
                                        <div key={pi} className="flex items-center justify-between group/item">
                                            <span className="text-sm font-bold text-slate-700 group-hover/item:text-orange-600 transition-colors">{p}</span>
                                            <Share2 size={12} className="text-slate-300 group-hover/item:text-orange-600 opacity-0 group-hover/item:opacity-100 transition-all" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TRUST & CERTIFICATION SECTION - DARK EDITORIAL */}
            <section className="py-24 md:py-48 bg-[#0a0a0c] text-white relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row gap-24 items-center">
                        <div className="lg:w-1/2 space-y-12">
                            <div className="space-y-6">
                                <h2 className="text-5xl md:text-7xl font-serif leading-none">
                                    Respaldo <br /> <span className="italic text-orange-500">Institucional.</span>
                                </h2>
                                <p className="text-xl text-slate-400 font-light leading-relaxed">
                                    Nuestros convenios no son solo firmas en un papel; son puentes reales que permiten a nuestros alumnos acceder a currículos internacionales, becas exclusivas y formación de vanguardia.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                {[
                                    { t: "Certificaciones", d: "Aprobación de estándares mundiales en diversas áreas.", i: <Award className="text-orange-500" /> },
                                    { t: "Intercambios", d: "Programas activos de movilidad para alumnos y docentes.", i: <Handshake className="text-orange-500" /> },
                                    { t: "Becas", d: "Convenios exclusivos para estudios superiores.", i: <Building2 className="text-orange-500" /> },
                                    { t: "Impacto", d: "Acceso a redes de contacto de alto nivel institucional.", i: <ShieldCheck className="text-orange-500" /> }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4 p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="shrink-0">{item.i}</div>
                                        <div className="space-y-1">
                                            <h4 className="font-bold">{item.t}</h4>
                                            <p className="text-xs text-slate-500 leading-relaxed font-light">{item.d}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:w-1/2 relative bg-white/5 p-12 rounded-[4rem] border border-white/10 backdrop-blur-sm overflow-hidden group">
                            <div className="grid grid-cols-2 gap-12 opacity-50 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-1000">
                                {/* Placeholders for logos (abstract circles for premium feel if real logos not present) */}
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="aspect-video bg-white/5 rounded-2xl flex items-center justify-center p-8 border border-white/10">
                                        <div className="w-full h-full rounded-full border border-white/20 animate-pulse-slow" />
                                    </div>
                                ))}
                            </div>
                            <div className="absolute inset-x-0 bottom-12 text-center">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 opacity-50">Global Network</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA SECTION - PROFESSIONAL */}
            <section className="py-32 bg-white text-center">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto space-y-12">
                        <h2 className="text-5xl md:text-7xl font-serif text-slate-900 leading-[1.1]">
                            Conecte el talento <br /> con las <span className="italic text-orange-600">oportunidades.</span>
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                            <Link to="/admision" className="bg-slate-900 text-white px-12 py-5 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all">
                                Postular Ahora
                            </Link>
                            <Link to="/contacto" className="px-12 py-5 rounded-full text-[11px] font-black uppercase tracking-widest text-[#0D101C] border-2 border-[#0D101C] hover:bg-[#0D101C] hover:text-white transition-all">
                                Solicitar Alianza
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

import { Link } from "react-router-dom";
export default ConveniosAlianzas;
