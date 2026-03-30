import { History, Target, Compass, ArrowUpRight, GraduationCap } from "lucide-react";
import { useState, useEffect } from 'react';

const VisionMision = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="flex flex-col w-full bg-white">
      {/* HERITAGE HERO */}
      <section className="relative h-[80vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1541339907198-e08759dfc3ef?auto=format&fit=crop&q=80&w=2000"
            alt="Academic heritage"
            className="w-full h-full object-cover grayscale brightness-50 contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-6 pb-24 relative z-10">
          <div className="max-w-4xl space-y-6">
            <div className={`flex items-center gap-4 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              <div className="w-12 h-0.5 bg-orange-600" />
              <span className="text-orange-500 font-black text-[10px] uppercase tracking-[0.4em]">Desde 2013</span>
            </div>
            <h1 className={`text-6xl md:text-9xl font-serif text-white leading-none transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
              Legado & <br />
              <span className="italic text-orange-500">Destino.</span>
            </h1>
          </div>
        </div>
      </section>

      {/* THE PHILOSOPHY SECTION - ASYMETRIC SPLIT */}
      <section className="py-24 md:py-48">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-10 order-2 lg:order-1">
              <div className="space-y-6">
                <span className="text-orange-600 font-black text-[10px] uppercase tracking-widest px-4 py-1 bg-orange-50 rounded-full">Nuestro Propósito</span>
                <h2 className="text-4xl md:text-6xl font-serif text-slate-900 leading-tight">
                  Nuestra <span className="italic">Misión.</span>
                </h2>
                <p className="text-xl text-slate-600 font-light leading-relaxed">
                  Brindar una educación integral y de excelencia en los niveles inicial, primaria y secundaria, promoviendo el desarrollo académico, ético y emocional de nuestros estudiantes. Formamos líderes críticos, creativos y comprometidos con la sociedad, preparados para enfrentar los desafíos del mundo actual, con valores sólidos y una formación basada en el respeto, la innovación y la sostenibilidad.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="p-8 bg-slate-50 rounded-[2rem] space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-orange-600 shadow-sm">
                    <GraduationCap size={24} />
                  </div>
                  <h3 className="font-bold text-slate-900">Formación Holística</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">Desarrollamos el intelecto, el cuerpo y el espíritu en equilibrio perfecto.</p>
                </div>
                <div className="p-8 bg-slate-50 rounded-[2rem] space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-orange-600 shadow-sm">
                    <Compass size={24} />
                  </div>
                  <h3 className="font-bold text-slate-900">Liderazgo Ético</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">Inspiramos a actuar con rectitud y visión comunitaria.</p>
                </div>
              </div>
            </div>

            <div className="relative order-1 lg:order-2">
              <div className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl skew-y-3 hover:skew-y-0 transition-all duration-1000">
                <img
                  src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1000"
                  alt="Education in action"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-orange-600 rounded-full flex items-center justify-center p-8 text-white text-center animate-bounce-subtle">
                <p className="text-[10px] font-black uppercase tracking-widest">Comprometidos con el Éxito</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ARTISTIC VISION SECTION - DARK EDITORIAL */}
      <section className="py-24 md:py-48 bg-[#0a0a0c] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-orange-600/5 -skew-x-12 translate-x-1/2" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-16">
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center mx-auto text-orange-500 mb-8">
                <Target size={32} />
              </div>
              <h2 className="text-5xl md:text-8xl font-serif leading-none">
                Nuestra <br />
                <span className="italic text-orange-500">Visión.</span>
              </h2>
            </div>

            <p className="text-2xl md:text-3xl font-serif italic text-slate-400 leading-tight">
              "Ser reconocidos como un colegio líder en educación de calidad, que inspira a cada estudiante a alcanzar su máximo potencial. Aspiramos a formar ciudadanos globales con una mentalidad inclusiva, capaces de transformar su entorno con conocimiento, valores y responsabilidad social."
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12">
              {['Innovación', 'Excelencia', 'Integridad', 'Comunidad'].map((item, i) => (
                <div key={i} className="space-y-2">
                  <span className="block text-4xl font-serif text-white">0{i + 1}</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* THE TIMELINE / STORY SECTION */}
      <section className="py-24 md:py-40 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-16 items-start">
            <div className="md:w-1/3 sticky top-40 space-y-6">
              <History size={48} className="text-orange-500" />
              <h2 className="text-4xl font-serif text-slate-900 leading-tight">
                Un camino <br /> de constante <br /> <span className="italic">evolución.</span>
              </h2>
              <p className="text-slate-500 font-light leading-relaxed">
                Desde nuestros humildes comienzos en 2013, Crayon's ha crecido impulsado por un único sueño: transformar la educación en Satipo.
              </p>
            </div>

            <div className="md:w-2/3 space-y-32">
              {[
                { year: "2013", title: "El Comienzo", desc: "Apertura de nuestras primeras aulas con un enfoque disruptivo y un grupo selecto de visionarios.", img: "https://images.unsplash.com/photo-1577891772327-0c5874c72d1f?auto=format&fit=crop&q=80&w=800" },
                { year: "2017", title: "Expansión Regional", desc: "Inauguración de nuestro campus tecnológico y consolidación como líderes académicos en la selva central.", img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800" },
                { year: "2026", title: "Educación 4.0", desc: "Implementación de IA y metodologías internacionales para preparar a la nueva generación de líderes globales.", img: "https://images.unsplash.com/photo-1510070112810-d4e9a46d9e91?auto=format&fit=crop&q=80&w=800" }
              ].map((milestone, i) => (
                <div key={i} className="grid grid-cols-1 lg:grid-cols-2 gap-12 group">
                  <div className="space-y-6">
                    <span className="text-6xl font-serif text-slate-100 group-hover:text-orange-500/20 transition-colors uppercase leading-none">{milestone.year}</span>
                    <h3 className="text-2xl font-bold text-slate-900">{milestone.title}</h3>
                    <p className="text-slate-600 font-light leading-relaxed">{milestone.desc}</p>
                    <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-orange-600 transition-colors">
                      Leer mas <ArrowUpRight size={14} />
                    </button>
                  </div>
                  <div className="aspect-square rounded-[3rem] overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000">
                    <img src={milestone.img} alt={milestone.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};


export default VisionMision;