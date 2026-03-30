import { ClipboardList, UserPlus, FileCheck, CreditCard, CheckCircle2, Download } from "lucide-react";
import { useState, useEffect } from 'react';

const Admision = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const steps = [
        {
            title: "Solicitud de Vacante",
            icon: <ClipboardList className="w-8 h-8" />,
            desc: "Complete nuestro formulario digital de pre-inscripción para iniciar el proceso formal de admisión."
        },
        {
            title: "Encuentro Familiar",
            icon: <UserPlus className="w-8 h-8" />,
            desc: "Programamos una entrevista personalizada para conocer a la familia y realizar la evaluación diagnóstica del alumno."
        },
        {
            title: "Carga Documental",
            icon: <FileCheck className="w-8 h-8" />,
            desc: "Presentación de la documentación académica y administrativa necesaria para la validación del perfil."
        },
        {
            title: "Afiliación & Matrícula",
            icon: <CreditCard className="w-8 h-8" />,
            desc: "Confirmación de ingreso tras la aprobación del comité y formalización del compromiso institucional."
        }
    ];

    return (
        <div className="flex flex-col w-full bg-[#fdfcfb]">
            {/* CLEAN PROFESSIONAL HERO */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="container mx-auto">
                    <div className="max-w-4xl space-y-8 relative z-10">
                        <div className={`flex items-center gap-4 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="w-12 h-px bg-orange-600" />
                            <span className="text-orange-600 font-black text-[10px] uppercase tracking-[0.4em]">Admisiones 2026</span>
                        </div>
                        <h1 className={`text-6xl md:text-9xl font-serif text-slate-900 leading-[0.85] transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                            Un Futuro <br />
                            <span className="italic">Por Escribir.</span>
                        </h1>
                        <p className={`text-xl text-slate-500 max-w-2xl font-light leading-relaxed transition-all duration-1000 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            Forme parte de una comunidad educativa que trasciende fronteras. El proceso de admisión de Crayon's está diseñado para identificar y potenciar el talento de cada nuevo integrante.
                        </p>
                    </div>
                </div>

                {/* Aesthetic Detail */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50 -z-10 hidden lg:block" />
            </section>

            {/* THE PROCESS - STEP BY STEP EDITORIAL */}
            <section className="py-24 md:py-48 bg-white overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
                        {steps.map((step, i) => (
                            <div key={i} className="group relative space-y-8">
                                <div className="space-y-6 relative z-10">
                                    <div className="flex items-end justify-between">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all duration-500 shadow-xl shadow-orange-600/0 group-hover:shadow-orange-600/20">
                                            {step.icon}
                                        </div>
                                        <span className="text-6xl font-serif text-slate-100 leading-none select-none">0{i + 1}</span>
                                    </div>
                                    <h3 className="text-2xl font-serif text-slate-900 leading-tight">{step.title}</h3>
                                    <p className="text-sm text-slate-500 font-light leading-relaxed">{step.desc}</p>
                                </div>
                                <div className="absolute -inset-6 bg-slate-50 rounded-[2.5rem] scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 -z-0" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* REQUIREMENTS & GUIDANCE SECTION */}
            <section className="py-24 md:py-48 relative">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-24 items-start">
                        <div className="lg:w-3/5 space-y-12">
                            <div className="space-y-6">
                                <span className="text-orange-600 font-black text-[10px] uppercase tracking-widest px-4 py-1 bg-orange-50 rounded-full">Indispensable</span>
                                <h2 className="text-4xl md:text-6xl font-serif text-slate-900 leading-tight">
                                    Requisitos <br /> para la <span className="italic text-orange-500">Postulación.</span>
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    "Copia del DNI del estudiante y padres.",
                                    "Ficha Única de Matrícula (SIAGIE).",
                                    "Certificado de estudios previos.",
                                    "Constancia de no adeudo origen.",
                                    "Partida de nacimiento original.",
                                    "Informe de progreso anual."
                                ].map((req, i) => (
                                    <div key={i} className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-slate-100 hover:border-orange-200 transition-colors group">
                                        <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-all">
                                            <CheckCircle2 size={12} />
                                        </div>
                                        <span className="text-xs font-bold text-slate-700">{req}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:w-2/5 sticky top-40">
                            <div className="bg-[#0a0a0c] text-white p-12 md:p-16 rounded-[4rem] shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600 rounded-full blur-[80px] opacity-20 transition-all group-hover:scale-150" />

                                <div className="space-y-8 relative z-10 transition-transform duration-500 group-hover:-translate-y-2">
                                    <h3 className="text-3xl font-serif italic">¿Desea resolver dudas?</h3>
                                    <p className="text-slate-400 font-light leading-relaxed">
                                        Nuestro equipo de admisiones está disponible para brindarle una atención personalizada.
                                    </p>
                                    <div className="space-y-4 pt-4">
                                        <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                                            Guía de Admisión PDF <Download size={16} />
                                        </button>
                                        <button className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white py-5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all">
                                            Preguntas Frecuentes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CALL TO ACTION - START THE JOURNEY */}
            <section className="py-32 bg-slate-50 text-center relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-3xl mx-auto space-y-12">
                        <h2 className="text-5xl md:text-8xl font-serif text-slate-900 leading-tight">
                            Comience la <br /> <span className="italic text-orange-600">Aventura.</span>
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link to="/contacto" className="bg-slate-900 text-white px-12 py-5 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all">
                                Solicitar Vacante
                            </Link>
                            <Link to="/espacio" className="px-12 py-5 rounded-full text-[11px] font-black uppercase tracking-widest text-[#0a0a0c] border-2 border-[#0a0a0c] hover:bg-[#0a0a0c] hover:text-white transition-all">
                                Visitar el Campus
                            </Link>
                        </div>
                    </div>
                </div>
                {/* Background Large Text */}
                <div className="absolute bottom-0 left-0 w-full text-[25vw] font-black text-slate-100 leading-none translate-y-1/2 -z-0 select-none pointer-events-none italic">
                    ADMISSIONS.
                </div>
            </section>
        </div>
    );
};

import { Link } from "react-router-dom";
export default Admision;
