import { Heart, Shield, Star, Users, Handshake, Bookmark } from "lucide-react";
import { useState, useEffect } from 'react';

const Valores = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const values = [
        {
            title: "Integridad",
            desc: "Actuamos con honestidad y rectitud en cada paso, construyendo una base de confianza inquebrantable.",
            icon: <Shield size={32} strokeWidth={1.5} />,
            quote: "La esencia de ser."
        },
        {
            title: "Respeto",
            desc: "Valoramos la individualidad y la diversidad, creando un entorno de armonía y dignidad para todos.",
            icon: <Users size={32} strokeWidth={1.5} />,
            quote: "Base de la convivencia."
        },
        {
            title: "Responsabilidad",
            desc: "Asumimos el compromiso de nuestras acciones y su impacto en la comunidad y el medio ambiente.",
            icon: <Bookmark size={32} strokeWidth={1.5} />,
            quote: "Poder para transformar."
        },
        {
            title: "Solidaridad",
            desc: "Fomentamos la ayuda mutua y el servicio a los demás, conectando corazones para un bien común.",
            icon: <Heart size={32} strokeWidth={1.5} />,
            quote: "Amor en acción."
        },
        {
            title: "Excelencia",
            desc: "Buscamos la mejor versión de nosotros mismos en cada desafío, superando límites día a día.",
            icon: <Star size={32} strokeWidth={1.5} />,
            quote: "Hacia lo más alto."
        },
        {
            title: "Empatía",
            desc: "Escuchamos y sentimos el camino del otro, entendiéndolo como parte fundamental de nuestra historia.",
            icon: <Handshake size={32} strokeWidth={1.5} />,
            quote: "Puente entre almas."
        }
    ];

    return (
        <div className="flex flex-col w-full bg-white">
            {/* ATMOSPHERIC HERO */}
            <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-slate-900">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&q=80&w=2000"
                        alt="Values and human connection"
                        className="w-full h-full object-cover opacity-40 scale-110 animate-slow-zoom"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-transparent to-white" />
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center space-y-8">
                    <div className={`flex items-center justify-center gap-4 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="w-8 h-px bg-orange-500" />
                        <span className="text-orange-500 font-black text-[10px] uppercase tracking-[0.4em]">Nuestro ADN</span>
                        <div className="w-8 h-px bg-orange-500" />
                    </div>
                    <h1 className={`text-6xl md:text-9xl font-serif text-white tracking-tight transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                        Vivir con <br className="hidden md:block" />
                        <span className="italic">Propósito.</span>
                    </h1>
                </div>
            </section>

            {/* CORE VALUES GRID - SOPHISTICATED DESIGN */}
            <section className="py-24 md:py-40 relative">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
                        {values.map((val, i) => (
                            <div key={i} className="group relative pt-12">
                                {/* Large background number */}
                                <div className="absolute top-0 right-0 text-8xl font-serif text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity -z-0">
                                    0{i + 1}
                                </div>

                                <div className="relative z-10 space-y-6">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all duration-500">
                                        {val.icon}
                                    </div>

                                    <div className="space-y-4">
                                        <h2 className="text-3xl font-serif text-slate-900 group-hover:text-orange-500 transition-colors">{val.title}</h2>
                                        <p className="text-sm text-slate-400 font-black uppercase tracking-widest">{val.quote}</p>
                                        <p className="text-slate-600 leading-relaxed font-light">
                                            {val.desc}
                                        </p>
                                    </div>

                                    {/* Bottom border animation */}
                                    <div className="w-12 h-0.5 bg-slate-100 group-hover:w-full group-hover:bg-orange-500 transition-all duration-700" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ARTISTIC SECTION - THE LIVING CULTURE */}
            <section className="py-24 bg-slate-50 relative overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        <div className="lg:w-1/2 relative">
                            <div className="aspect-square rounded-[3.5rem] overflow-hidden shadow-2xl relative">
                                <img
                                    src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1000"
                                    alt="Community life"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-[#F26513]/10" />
                            </div>

                            {/* Decorative Badge */}
                            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white rounded-full flex items-center justify-center p-8 shadow-2xl border border-slate-50">
                                <p className="text-[10px] font-black uppercase tracking-widest text-center text-slate-400">
                                    "La cultura <br className="hidden md:block" /> se respira <br className="hidden md:block" /> en el aire."
                                </p>
                            </div>
                        </div>

                        <div className="lg:w-1/2 space-y-10">
                            <div className="space-y-6">
                                <h3 className="text-4xl md:text-5xl font-serif text-slate-900 leading-tight">
                                    Nuestra brújula <br />
                                    <span className="text-orange-600 italic">ética y moral.</span>
                                </h3>
                                <p className="text-lg text-slate-600 font-light leading-relaxed">
                                    En Crayon's, los valores no son palabras grabadas en granito, sino el pulso constante de nuestra comunidad. Cada docente es un ejemplo, cada espacio es un taller de carácter y cada día es una oportunidad para ser mejores.
                                </p>
                            </div>

                            <ul className="space-y-6">
                                {[
                                    { t: "Liderazgo Consciente", d: "Formamos alumnos que entienden el poder de su influencia." },
                                    { t: "Ciudadanía Activa", d: "Involucrados activamente en la mejora de su entorno local." },
                                    { t: "Vínculos Eternos", d: "Fomentamos relaciones basadas en la lealtad y el apoyo mutuo." }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-6 group">
                                        <div className="mt-1 w-6 h-6 rounded-full border border-orange-200 flex-shrink-0 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                                            <span className="text-[10px] font-bold">{i + 1}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-slate-900">{item.t}</h4>
                                            <p className="text-sm text-slate-500">{item.d}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* JOIN US SECTION */}
            <section className="py-32 bg-white text-center">
                <div className="container mx-auto px-6">
                    <div className="max-w-2xl mx-auto space-y-12">
                        <h2 className="text-5xl font-serif text-slate-900 leading-tight">
                            Haga que los valores <br /> sean parte del <span className="italic text-orange-600">futuro</span> de su hijo.
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link to="/admision" className="bg-slate-900 text-white px-12 py-5 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all">
                                Postular Ahora
                            </Link>
                            <Link to="/contacto" className="px-12 py-5 rounded-full text-[11px] font-black uppercase tracking-widest text-slate-900 border-2 border-slate-900 hover:bg-slate-900 hover:text-white transition-all">
                                Hablemos del Futuro
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

import { Link } from "react-router-dom";
export default Valores;
