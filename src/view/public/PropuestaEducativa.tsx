import { BookOpen, Calendar, Clock, ArrowUpRight, Search, Bookmark } from "lucide-react";
import { useState, useEffect } from 'react';

const PropuestaEducativa = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const posts = [
        {
            category: "Innovación",
            date: "12 de Febrero, 2026",
            title: "El impacto de la Inteligencia Artificial en las aulas de primaria.",
            desc: "Descubra cómo estamos utilizando herramientas de IA generativa para personalizar el aprendizaje.",
            image: "https://res.cloudinary.com/droodoirh/image/upload/v1772123382/1puesto_pblcfa.jpg",
            readTime: "5 min"
        },
        {
            category: "Psicología",
            date: "05 de Febrero, 2026",
            title: "Inteligencia Emocional: La base de todo éxito académico.",
            desc: "Estrategias prácticas para padres sobre cómo fomentar la resiliencia en casa.",
            image: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&q=80&w=800",
            readTime: "7 min"
        },
        {
            category: "Metodología",
            date: "28 de Enero, 2026",
            title: "Aprendizaje basado en proyectos vs. Enseñanza tradicional.",
            desc: "Por qué el ABP está revolucionando la forma en que los alumnos retienen el conocimiento.",
            image: "https://res.cloudinary.com/droodoirh/image/upload/v1772123391/fot_grupal_fzlpng.jpg",
            readTime: "6 min"
        }
    ];

    return (
        <div className="flex flex-col w-full bg-[#fdfcfb]">
            {/* MAGAZINE HERO */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="container mx-auto">
                    <div className="max-w-4xl space-y-10 relative z-10">
                        <div className={`flex items-center gap-4 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="w-12 h-px bg-slate-900" />
                            <span className="text-slate-900 font-black text-[10px] uppercase tracking-[0.4em]">Journal & Crónicas</span>
                        </div>
                        <h1 className={`text-6xl md:text-9xl font-serif text-slate-900 leading-[0.85] transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                            Nuestras <br />
                            <span className="italic">Historias.</span>
                        </h1>
                        <p className={`text-xl text-slate-500 max-w-2xl font-light leading-relaxed transition-all duration-1000 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            Un espacio dedicado al conocimiento, la reflexión académica y las crónicas que definen el pulso de nuestra institución.
                        </p>
                    </div>

                    {/* Featured Article - Magazine Style */}
                    <div className="mt-20 relative group cursor-pointer transition-all duration-1000">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden rounded-[3rem] shadow-2xl bg-white">
                            <div className="lg:col-span-7 h-[50vh] lg:h-auto overflow-hidden">
                                <img
                                    src="https://res.cloudinary.com/droodoirh/image/upload/v1772123384/entrga_de_diplomas_alumnos_jd3dfe.jpg"
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                                    alt="Featured"
                                />
                            </div>
                            <div className="lg:col-span-5 p-12 lg:p-20 flex flex-col justify-center space-y-8">
                                <div className="space-y-4">
                                    <span className="text-orange-500 font-black text-[10px] uppercase tracking-widest">Artículo Destacado</span>
                                    <h2 className="text-4xl font-serif text-slate-900 group-hover:text-orange-600 transition-colors">La educación en la era de la IA: ¿Estamos listos?</h2>
                                    <p className="text-slate-500 font-light leading-relaxed">Una mirada profunda a cómo la tecnología está redefiniendo el papel del maestro y el alumno en el siglo XXI.</p>
                                </div>
                                <div className="flex items-center justify-between border-t border-slate-100 pt-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
                                            <img src="https://i.pravatar.cc/100?img=11" alt="Author" />
                                        </div>
                                        <div className="text-[10px]">
                                            <p className="font-bold text-slate-900">Dr. Ricardo Ruiz</p>
                                            <p className="text-slate-400 uppercase tracking-tighter">Dir. Académico</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Clock size={14} />
                                        <span className="text-[10px] font-bold">12 min read</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ARTISTIC SEARCH / CATEGORIES */}
            <section className="py-12 bg-white border-y border-slate-100">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex gap-8 overflow-x-auto pb-4 md:pb-0 font-bold text-[10px] uppercase tracking-widest text-slate-400">
                            {['Todos', 'Innovación', 'Psicología', 'Vida Crayon', 'Eventos'].map((cat, i) => (
                                <button key={i} className={`whitespace-nowrap hover:text-orange-600 transition-colors ${i === 0 ? 'text-slate-900' : ''}`}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full md:w-auto">
                            <input
                                type="text"
                                placeholder="Buscar historias..."
                                className="w-full md:w-96 pl-6 pr-12 py-3 rounded-full bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-xs text-slate-900 font-medium"
                            />
                            <Search size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" />
                        </div>
                    </div>
                </div>
            </section>

            {/* EDITORIAL GRID */}
            <section className="py-24 md:py-48 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
                        {posts.map((post, i) => (
                            <div key={i} className="group cursor-pointer space-y-8">
                                <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-700 group-hover:rounded-[1.5rem]">
                                    <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                    <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-sm px-6 py-2 rounded-full shadow-lg">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{post.category}</span>
                                    </div>
                                    <button className="absolute bottom-8 right-8 w-12 h-12 rounded-full bg-white text-slate-900 flex items-center justify-center translate-y-20 group-hover:translate-y-0 transition-transform duration-500">
                                        <Bookmark size={18} />
                                    </button>
                                </div>

                                <div className="space-y-4 px-2">
                                    <div className="flex items-center gap-3 text-slate-400 text-[10px] uppercase tracking-widest font-black">
                                        <Calendar size={12} />
                                        <span>{post.date}</span>
                                        <span className="text-slate-200">|</span>
                                        <span>{post.readTime}</span>
                                    </div>
                                    <h3 className="text-2xl font-serif text-slate-900 leading-tight group-hover:text-orange-600 transition-colors">{post.title}</h3>
                                    <p className="text-sm text-slate-500 font-light leading-relaxed line-clamp-2">{post.desc}</p>
                                    <div className="pt-4">
                                        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-900 hover:text-orange-600 transition-colors">
                                            Leer Historia <ArrowUpRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-40 text-center">
                        <button className="px-12 py-5 rounded-full border-2 border-slate-900 text-slate-900 text-[11px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
                            Cargar más historias
                        </button>
                    </div>
                </div>
            </section>

            {/* NEWSLETTER SECTION - ELEGANT DARK */}
            <section className="py-24 bg-slate-950 text-white relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-12">
                        <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center text-orange-500">
                            <BookOpen size={32} />
                        </div>
                        <h2 className="text-5xl md:text-7xl font-serif italic leading-tight">
                            Sabiduría en su <br /> <span className="text-orange-500 not-italic">bandeja de entrada.</span>
                        </h2>
                        <p className="text-xl text-slate-400 font-light max-w-xl mx-auto">
                            Suscríbase a nuestro boletín mensual y reciba los mejores artículos sobre educación, innovación y crianza.
                        </p>
                        <form className="w-full max-w-md flex flex-col sm:flex-row gap-4 pt-8">
                            <input
                                type="email"
                                placeholder="Su correo electrónico"
                                className="flex-1 px-8 py-5 rounded-full bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-xs"
                            />
                            <button className="bg-orange-600 text-white px-10 py-5 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all">
                                Suscribirme
                            </button>
                        </form>
                    </div>
                </div>
                {/* Background Detail */}
                <div className="absolute top-1/2 left-0 w-full text-[15vw] font-black text-white/5 leading-none -translate-y-1/2 -z-0 pointer-events-none select-none italic">
                    JOURNAL
                </div>
            </section>
        </div>
    );
};


export default PropuestaEducativa;
