import { MapPin, Phone, Clock, Facebook, Instagram, Youtube, Send, MessageSquare, ChevronRight } from "lucide-react";
import { useState, useEffect } from 'react';


const Contact = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    return (
        <div className="flex flex-col w-full bg-[#fdfcfb]">
            {/* MINIMALIST HERO */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="container mx-auto">
                    <div className="max-w-4xl space-y-8 relative z-10">
                        <div className={`flex items-center gap-4 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="w-12 h-px bg-slate-900" />
                            <span className="text-slate-900 font-black text-[10px] uppercase tracking-[0.4em]">Canales Abiertos</span>
                        </div>
                        <h1 className={`text-6xl md:text-9xl font-serif text-slate-900 leading-[0.85] transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                            Hablemos <br />
                            <span className="italic text-orange-600">Hoy.</span>
                        </h1>
                        <p className={`text-xl text-slate-500 max-w-2xl font-light leading-relaxed transition-all duration-1000 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            Estamos a su disposición para resolver cualquier inquietud y acompañarle en la decisión más importante para el futuro de sus hijos.
                        </p>
                    </div>
                </div>

                {/* Aesthetic Detail */}
                <div className="absolute top-0 right-0 w-1/4 h-full bg-orange-50 -z-10 hidden lg:block" />
            </section>

            {/* CONTACT COMPOSITION - EDITORIAL SPLIT */}
            <section className="py-24 md:py-48 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">

                        {/* THE FORM AREA */}
                        <div className="lg:col-span-7 bg-slate-50 p-12 md:p-20 rounded-[4rem] shadow-2xl shadow-slate-200/50">
                            <div className="space-y-12">
                                <div className="space-y-4">
                                    <h2 className="text-4xl font-serif text-slate-900">Enviar Mensaje</h2>
                                    <p className="text-sm text-slate-400 font-medium tracking-wide">Prometemos una respuesta atenta en menos de 24 horas.</p>
                                </div>

                                <form className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Nombre Completo</label>
                                            <input type="text" className="w-full bg-white border-b-2 border-slate-100 px-0 py-4 text-sm focus:outline-none focus:border-orange-500 transition-all font-medium text-slate-900 placeholder:text-slate-200" placeholder="Ej. Alejandra Valdivia" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email Institucional/Personal</label>
                                            <input type="email" className="w-full bg-white border-b-2 border-slate-100 px-0 py-4 text-sm focus:outline-none focus:border-orange-500 transition-all font-medium text-slate-900 placeholder:text-slate-200" placeholder="email@ejemplo.com" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Motivo del Contacto</label>
                                        <select className="w-full bg-white border-b-2 border-slate-100 px-0 py-4 text-sm focus:outline-none focus:border-orange-500 transition-all font-medium text-slate-900 appearance-none cursor-pointer">
                                            <option>Información de Admisión 2026</option>
                                            <option>Consulta Académica</option>
                                            <option>Alianzas e Institucional</option>
                                            <option>Soporte de Plataformas</option>
                                        </select>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Su Mensaje</label>
                                        <textarea rows={4} className="w-full bg-white border-b-2 border-slate-100 px-0 py-4 text-sm focus:outline-none focus:border-orange-500 transition-all font-medium text-slate-900 placeholder:text-slate-200 resize-none" placeholder="Cuéntenos cómo podemos ayudarle..."></textarea>
                                    </div>

                                    <button className="bg-slate-900 text-white px-12 py-6 rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:bg-orange-600 transition-all flex items-center justify-center gap-3 group">
                                        Enviar Comunicación <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* INFO AREA - EDITORIAL SIDEBAR */}
                        <div className="lg:col-span-5 space-y-20 pt-10">
                            <div className="space-y-12">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500">Puntos de Contacto</h3>

                                <div className="space-y-12">
                                    {[
                                        { i: MapPin, t: "Nuestra Sede", d: "Jr. José Pardo Nro. 181, Satipo, Junín, Perú" },
                                        { i: Phone, t: "Líneas Directas", d: "+51 974 958 865 | (064) 545-123" },
                                        { i: Clock, t: "Horarios", d: "Lun - Vie: 07:30 — 16:00 | Sáb: 08:00 — 12:00" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-8 group">
                                            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500">
                                                <item.i size={24} strokeWidth={1.5} />
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="font-bold text-slate-900 uppercase tracking-widest text-[10px]">{item.t}</h4>
                                                <p className="text-lg font-serif text-slate-500 italic leading-snug">{item.d}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-20 border-t border-slate-100 space-y-8">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Presencia Digital</h3>
                                <div className="flex gap-6">
                                    {[Facebook, Instagram, Youtube].map((Icon, i) => (
                                        <a key={i} href="#" className="w-14 h-14 rounded-full border border-slate-100 flex items-center justify-center text-slate-900 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all duration-500">
                                            <Icon size={20} strokeWidth={1.5} />
                                        </a>
                                    ))}
                                </div>
                            </div>

                            <div className="p-10 bg-orange-600 rounded-[3rem] text-white space-y-6 shadow-2xl shadow-orange-600/20">
                                <MessageSquare size={32} />
                                <h4 className="text-2xl font-serif italic">¿Prefiere WhatsApp?</h4>
                                <p className="text-sm font-light text-orange-50 leading-relaxed">Atención inmediata para consultas rápidas sobre procesos de admisión y vacantes.</p>
                                <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest bg-white text-orange-600 px-8 py-3 rounded-full hover:scale-105 transition-all">
                                    Iniciar Chat <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* MAP SECTION - FULL WIDTH EDITORIAL */}
            <section className="h-[60vh] bg-slate-100 relative grayscale hover:grayscale-0 transition-all duration-1000 grayscale">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3902.9!2d-74.63!3d-11.25!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTHCsDE1JzAwLjAiUyA3NMKwMzcnNDguMCJX!5e0!3m2!1sen!2spe!4v1620000000000!5m2!1sen!2spe"
                    className="w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                ></iframe>
                <div className="absolute inset-0 pointer-events-none border-[2rem] border-white/20" />
            </section>
        </div>
    );
};

export default Contact;
