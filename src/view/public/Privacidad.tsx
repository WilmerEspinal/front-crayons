import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Eye,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  Trash2,
  UserCheck,
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
    id: "responsable",
    titulo: "Responsable del tratamiento",
    contenido: (
      <>
        <p>
          El responsable de los datos personales recopilados a través de este sitio web y de los
          servicios educativos es la Institución Educativa Colegio Crayon's, con domicilio en
          Jr. José Pardo Nro. 181, Satipo, Junín, Perú.
        </p>
        <p>
          Para cualquier consulta relacionada con el tratamiento de tus datos personales puedes
          escribir a{" "}
          <a href="mailto:admision@crayons.edu.pe" className="text-orange-600 hover:text-orange-700 transition-colors">
            admision@crayons.edu.pe
          </a>{" "}
          o comunicarte al +51 974 958 865.
        </p>
      </>
    ),
  },
  {
    id: "datos",
    titulo: "Datos personales que recopilamos",
    contenido: (
      <>
        <p>Recopilamos únicamente la información necesaria para brindar nuestros servicios:</p>
        <ul className="space-y-3">
          {[
            "Datos de identificación: nombres, apellidos, documento de identidad y fecha de nacimiento.",
            "Datos de contacto: correo electrónico, teléfono y dirección.",
            "Datos académicos: nivel, grado, sección, historial de matrícula y asistencia.",
            "Datos de navegación: dirección IP, tipo de dispositivo y páginas visitadas.",
          ].map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p>
          Cuando se trata de datos de menores de edad, la información es proporcionada y autorizada
          por los padres o tutores legales.
        </p>
      </>
    ),
  },
  {
    id: "finalidades",
    titulo: "Finalidades del tratamiento",
    contenido: (
      <>
        <p>Utilizamos los datos personales para las siguientes finalidades:</p>
        <ul className="space-y-3">
          {[
            "Gestionar el proceso de admisión, matrícula y servicios académicos.",
            "Mantener comunicación con las familias sobre actividades institucionales.",
            "Administrar el aula virtual, la intranet y los canales de atención.",
            "Atender consultas, solicitudes y requerimientos de los usuarios.",
            "Cumplir con las obligaciones legales y regulatorias aplicables.",
            "Mejorar la experiencia de navegación y la calidad de nuestros servicios.",
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
    id: "base-legal",
    titulo: "Base legal del tratamiento",
    contenido: (
      <p>
        El tratamiento de datos personales se realiza sobre la base del consentimiento del titular
        o de sus padres o tutores, la ejecución de la relación educativa y el cumplimiento de las
        obligaciones establecidas en la Ley N.° 29733, Ley de Protección de Datos Personales, y su
        reglamento.
      </p>
    ),
  },
  {
    id: "conservacion",
    titulo: "Conservación de la información",
    contenido: (
      <p>
        Los datos personales se conservan durante el tiempo necesario para cumplir con las
        finalidades descritas y con los plazos exigidos por la normativa aplicable. Una vez
        cumplido dicho periodo, la información es eliminada o anonimizada de forma segura.
      </p>
    ),
  },
  {
    id: "comparticion",
    titulo: "Compartición de datos",
    contenido: (
      <>
        <p>
          Colegio Crayon's no vende ni comercializa datos personales. La información podrá ser
          compartida únicamente con:
        </p>
        <ul className="space-y-3">
          {[
            "Proveedores tecnológicos que prestan servicios de alojamiento, comunicación o gestión académica.",
            "Autoridades públicas cuando exista una obligación legal o un requerimiento válido.",
            "Terceros que colaboren en la prestación de servicios educativos, bajo acuerdos de confidencialidad.",
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
    id: "derechos",
    titulo: "Derechos del titular",
    contenido: (
      <>
        <p>
          De acuerdo con la legislación vigente, puedes ejercer los siguientes derechos sobre tus
          datos personales:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {[
            { icono: Eye, titulo: "Acceso", texto: "Conocer qué datos tenemos y cómo los tratamos." },
            { icono: Pencil, titulo: "Rectificación", texto: "Actualizar o corregir información inexacta." },
            { icono: Trash2, titulo: "Cancelación", texto: "Solicitar la eliminación cuando corresponda." },
            { icono: UserCheck, titulo: "Oposición", texto: "Oponerte a determinados tratamientos de tus datos." },
          ].map((derecho) => (
            <div key={derecho.titulo} className="p-6 bg-slate-50 rounded-2xl space-y-3">
              <derecho.icono size={22} strokeWidth={1.5} className="text-orange-600" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">
                {derecho.titulo}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">{derecho.texto}</p>
            </div>
          ))}
        </div>
        <p>
          Para ejercer estos derechos envía una solicitud al correo{" "}
          <a href="mailto:admision@crayons.edu.pe" className="text-orange-600 hover:text-orange-700 transition-colors">
            admision@crayons.edu.pe
          </a>
          . Responderemos dentro de los plazos establecidos por ley. Si consideras que tu solicitud
          no fue atendida, puedes presentar un reclamo ante la Autoridad Nacional de Protección de
          Datos Personales.
        </p>
      </>
    ),
  },
  {
    id: "seguridad",
    titulo: "Seguridad de la información",
    contenido: (
      <p>
        Aplicamos medidas técnicas y organizativas razonables para proteger los datos personales
        frente a accesos no autorizados, pérdida, alteración o divulgación. El acceso a la
        información está restringido al personal autorizado y sujeto a deberes de confidencialidad.
      </p>
    ),
  },
  {
    id: "cookies",
    titulo: "Uso de cookies",
    contenido: (
      <p>
        El sitio web utiliza cookies necesarias para su funcionamiento y, de forma opcional,
        cookies analíticas que permiten conocer cómo se utilizan nuestras páginas. Puedes aceptar,
        rechazar o eliminar las cookies desde la configuración de tu navegador, teniendo en cuenta
        que algunas funciones podrían dejar de estar disponibles.
      </p>
    ),
  },
  {
    id: "menores",
    titulo: "Datos de menores de edad",
    contenido: (
      <p>
        Los datos de menores de edad son tratados únicamente con la autorización de sus padres o
        tutores legales y en el marco de la relación educativa. No solicitamos información de
        menores directamente a través del sitio web sin la intervención de un adulto responsable.
      </p>
    ),
  },
  {
    id: "cambios",
    titulo: "Cambios en esta política",
    contenido: (
      <p>
        Podemos actualizar esta Política de Privacidad para reflejar cambios normativos o mejoras
        en nuestros servicios. La versión vigente será publicada en este sitio web con su fecha de
        actualización, y su uso continuado implicará la aceptación de los cambios.
      </p>
    ),
  },
  {
    id: "contacto",
    titulo: "Contacto",
    contenido: (
      <>
        <p>
          Si tienes preguntas sobre esta política o deseas ejercer tus derechos, contáctanos por
          cualquiera de los siguientes canales:
        </p>
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
 * Página pública con la Política de Privacidad del Colegio Crayon's.
 */
const Privacidad = () => {
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
                Información Legal
              </span>
            </div>
            <h1
              className={`text-6xl md:text-9xl font-serif text-slate-900 leading-[0.85] transition-all duration-1000 delay-200 ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
            >
              Política de <br />
              <span className="italic text-orange-600">Privacidad.</span>
            </h1>
            <p
              className={`text-xl text-slate-500 max-w-2xl font-light leading-relaxed transition-all duration-1000 delay-400 ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              Protegemos la información de nuestras familias y cuidamos cada dato que compartes con
              nosotros. Aquí te explicamos cómo lo hacemos.
            </p>
            <div
              className={`flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 transition-all duration-1000 delay-500 ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <span>Última actualización · 13 de noviembre de 2026</span>
              <span className="hidden sm:block w-1 h-1 bg-slate-300 rounded-full" />
              <Link
                to="/terminos"
                className="text-orange-600 hover:text-orange-700 transition-colors"
              >
                Ver Términos y Condiciones
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
                <h3 className="font-serif text-xl text-slate-900">¿Tienes dudas?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Nuestro equipo puede ayudarte a ejercer tus derechos sobre tus datos personales.
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
                  to="/terminos"
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-orange-600 transition-colors"
                >
                  Términos y Condiciones <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Privacidad;
