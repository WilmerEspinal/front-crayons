import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";

type Seccion = {
  id: string;
  titulo: string;
  contenido: ReactNode;
};

const datosContacto = [
  { icono: MapPin, texto: "Jr. José Pardo Nro. 181, Satipo, Junín, Perú" },
  { icono: Phone, texto: "+51 974 958 865" },
  { icono: Mail, texto: "admision@crayons.edu.pe" },
];

const secciones: Seccion[] = [
  {
    id: "aceptacion",
    titulo: "Aceptación de los términos",
    contenido: (
      <p>
        Al acceder y utilizar el sitio web del Colegio Crayon's aceptas los presentes Términos y
        Condiciones. Si no estás de acuerdo con alguna de las disposiciones, te recomendamos no
        utilizar el sitio ni los servicios digitales asociados.
      </p>
    ),
  },
  {
    id: "uso-sitio",
    titulo: "Uso del sitio web",
    contenido: (
      <>
        <p>El sitio web tiene como finalidad brindar información institucional y facilitar el contacto con las familias. Al utilizarlo te comprometes a:</p>
        <ul className="space-y-3">
          {[
            "Utilizar el sitio de forma lícita y respetuosa.",
            "No realizar acciones que afecten su funcionamiento o seguridad.",
            "No suplantar la identidad de otra persona o institución.",
            "No extraer, copiar o reutilizar contenidos sin autorización.",
          ].map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "servicios-educativos",
    titulo: "Servicios educativos y admisión",
    contenido: (
      <p>
        La información sobre niveles, vacantes, procesos de admisión y costos es referencial y
        puede variar según el periodo académico. La admisión está sujeta a la evaluación
        correspondiente y a la disponibilidad de vacantes. La publicación de información en el
        sitio no constituye una reserva automática de matrícula.
      </p>
    ),
  },
  {
    id: "aula-virtual",
    titulo: "Aula virtual e intranet",
    contenido: (
      <>
        <p>
          El acceso al aula virtual y a la intranet es personal e intransferible. Cada usuario es
          responsable de custodiar sus credenciales y de las actividades realizadas con su cuenta.
        </p>
        <p>
          Si detectas un acceso no autorizado o una posible vulneración de tu cuenta, debes
          comunicarlo de inmediato a la institución para tomar las medidas necesarias.
        </p>
      </>
    ),
  },
  {
    id: "propiedad-intelectual",
    titulo: "Propiedad intelectual",
    contenido: (
      <p>
        La marca, el logotipo, los textos, imágenes, diseños y demás contenidos de este sitio son
        propiedad del Colegio Crayon's o se utilizan con autorización. Queda prohibida su
        reproducción, distribución o modificación sin consentimiento previo y por escrito.
      </p>
    ),
  },
  {
    id: "conducta",
    titulo: "Conducta del usuario",
    contenido: (
      <p>
        No se permite publicar o difundir contenido ilegal, ofensivo, discriminatorio o que vulnere
        derechos de terceros. Tampoco se permite el envío de comunicaciones no solicitadas ni el uso
        de los canales institucionales para fines ajenos a la comunidad educativa.
      </p>
    ),
  },
  {
    id: "pagos",
    titulo: "Pagos y pensiones",
    contenido: (
      <p>
        Los montos, plazos y canales de pago son informados por los medios oficiales de la
        institución. Los pagos realizados deben contar con su comprobante correspondiente. Cualquier
        solicitud de devolución o ajuste se evalúa según las condiciones informadas al momento de la
        matrícula y la normativa aplicable.
      </p>
    ),
  },
  {
    id: "enlaces",
    titulo: "Enlaces de terceros",
    contenido: (
      <p>
        El sitio puede incluir enlaces a plataformas externas. No somos responsables por el
        contenido, las políticas o la disponibilidad de dichos sitios. El acceso a ellos se realiza
        bajo responsabilidad del usuario.
      </p>
    ),
  },
  {
    id: "responsabilidad",
    titulo: "Limitación de responsabilidad",
    contenido: (
      <p>
        Procuramos mantener el sitio disponible y actualizado, pero no garantizamos la ausencia de
        interrupciones, errores o fallas técnicas. No seremos responsables por daños derivados del
        uso indebido del sitio o de causas ajenas a nuestro control. Esta limitación no excluye los
        derechos que la normativa de protección al consumidor reconoce a los usuarios.
      </p>
    ),
  },
  {
    id: "modificaciones",
    titulo: "Modificaciones",
    contenido: (
      <p>
        Podemos actualizar estos Términos y Condiciones en cualquier momento. La versión vigente
        será publicada en este sitio con su fecha de actualización. El uso continuado del sitio
        después de una modificación implica su aceptación.
      </p>
    ),
  },
  {
    id: "legislacion",
    titulo: "Legislación aplicable",
    contenido: (
      <p>
        Estos términos se rigen por las leyes de la República del Perú. Cualquier controversia se
        resolverá conforme a la normativa aplicable y ante las autoridades competentes, sin
        perjuicio de los derechos que correspondan a los usuarios.
      </p>
    ),
  },
  {
    id: "contacto",
    titulo: "Contacto",
    contenido: (
      <>
        <p>Para consultas sobre estos términos puedes comunicarte por cualquiera de estos canales:</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {datosContacto.map((dato) => (
            <div key={dato.texto} className="p-6 bg-slate-50 rounded-2xl space-y-3">
              <dato.icono size={20} strokeWidth={1.5} className="text-orange-600" />
              <p className="text-xs text-slate-600 leading-relaxed break-words">{dato.texto}</p>
            </div>
          ))}
        </div>
      </>
    ),
  },
];

/**
 * Página pública con los Términos y Condiciones del Colegio Crayon's.
 */
const TerminosCondiciones = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="flex flex-col w-full bg-[#fdfcfb]">
      {/* HERO EDITORIAL */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="container mx-auto">
          <div className="max-w-4xl space-y-8 relative z-10">
            <div
              className={`flex items-center gap-4 transition-all duration-700 ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="w-12 h-px bg-slate-900" />
              <span className="text-slate-900 font-black text-[10px] uppercase tracking-[0.4em]">
                Marco Legal
              </span>
            </div>
            <h1
              className={`text-5xl sm:text-6xl md:text-8xl font-serif text-slate-900 leading-[0.9] transition-all duration-1000 delay-200 ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
            >
              Términos y <br />
              <span className="italic text-orange-600">Condiciones.</span>
            </h1>
            <p
              className={`text-xl text-slate-500 max-w-2xl font-light leading-relaxed transition-all duration-1000 delay-400 ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              Conoce las condiciones que rigen el uso de nuestro sitio web y de los servicios
              digitales de la institución.
            </p>
            <div
              className={`flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 transition-all duration-1000 delay-500 ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <span>Última actualización · 13 de noviembre de 2026</span>
              <span className="hidden sm:block w-1 h-1 bg-slate-300 rounded-full" />
              <Link
                to="/privacidad"
                className="text-orange-600 hover:text-orange-700 transition-colors"
              >
                Ver Política de Privacidad
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-1/4 h-full bg-orange-50 -z-10 hidden lg:block" />
      </section>

      {/* CONTENIDO EDITORIAL */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
            {/* ÍNDICE */}
            <aside className="lg:col-span-4 lg:sticky lg:top-32 space-y-10">
              <div className="space-y-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500">
                  Contenido
                </h2>
                <nav className="flex flex-col divide-y divide-slate-100">
                  {secciones.map((seccion) => (
                    <a
                      key={seccion.id}
                      href={`#${seccion.id}`}
                      className="group flex items-center justify-between py-3 text-sm text-slate-500 hover:text-orange-600 transition-colors"
                    >
                      <span>{seccion.titulo}</span>
                      <ArrowUpRight
                        size={14}
                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      />
                    </a>
                  ))}
                </nav>
              </div>

              <div className="p-8 bg-slate-50 rounded-[2rem] space-y-4">
                <ShieldCheck size={28} strokeWidth={1.5} className="text-orange-600" />
                <h3 className="font-serif text-xl text-slate-900">¿Necesitas ayuda?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Si tienes preguntas sobre estas condiciones, nuestro equipo puede orientarte.
                </p>
                <a
                  href="mailto:admision@crayons.edu.pe"
                  className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 hover:text-orange-600 transition-colors"
                >
                  Contactar <ArrowUpRight size={14} />
                </a>
              </div>
            </aside>

            {/* SECCIONES */}
            <div className="lg:col-span-8 space-y-16">
              {secciones.map((seccion, indice) => (
                <article key={seccion.id} id={seccion.id} className="scroll-mt-32 space-y-6">
                  <div className="flex items-start gap-5">
                    <span className="text-4xl font-serif text-slate-100 leading-none">
                      {String(indice + 1).padStart(2, "0")}
                    </span>
                    <div className="space-y-3 pt-1">
                      <h2 className="text-2xl md:text-3xl font-serif text-slate-900 leading-tight">
                        {seccion.titulo}
                      </h2>
                      <div className="w-10 h-0.5 bg-orange-500" />
                    </div>
                  </div>
                  <div className="space-y-4 text-sm text-slate-600 leading-relaxed md:pl-14">
                    {seccion.contenido}
                  </div>
                </article>
              ))}

              <div className="pt-10 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  © 2026 Colegio Crayon's
                </span>
                <Link
                  to="/privacidad"
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-orange-600 transition-colors"
                >
                  Política de Privacidad <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TerminosCondiciones;
