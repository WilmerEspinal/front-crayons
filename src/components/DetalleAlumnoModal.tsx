import { X } from "lucide-react";

type HijoApoderado = { nombre: string; grado: string };

type ApoderadoDetalle = {
  dni: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  telefono: string | null;
  email: string | null;
  parentesco: string;
  hijos?: HijoApoderado[];
};

export type AlumnoDetalle = {
  alumno_dni: string;
  alumno_nombre: string;
  alumno_apellido_paterno: string;
  alumno_apellido_materno: string;
  fecha_nacimiento: string;
  grado: string;
  fecha_matricula: string;
  estado: string;
  estado_nombre: string | null;
  motivo_estado: string | null;
  fecha_estado: string | null;
  apoderados: ApoderadoDetalle[];
};

interface DetalleAlumnoModalProps {
  alumno: AlumnoDetalle;
  estiloEstado: string;
  onClose: () => void;
}

function formatearFecha(fecha: string | null): string {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function Campo({ label, valor, className }: { label: string; valor: string; className?: string }) {
  return (
    <div className={className}>
      <div className="text-[11px] font-semibold text-slate-400">{label}</div>
      <div className="text-[13.5px] font-semibold text-slate-900 break-words">{valor}</div>
    </div>
  );
}

/**
 * Detalle del alumno y sus apoderados. Se abre al hacer clic en el DNI de la lista de alumnos.
 */
export function DetalleAlumnoModal({ alumno, estiloEstado, onClose }: DetalleAlumnoModalProps) {
  const nombreCompleto = `${alumno.alumno_nombre} ${alumno.alumno_apellido_paterno} ${alumno.alumno_apellido_materno}`.trim();
  const esActivo = alumno.estado === "AC";

  return (
    <div onClick={onClose} className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-5">
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88vh] w-full max-w-[860px] overflow-y-auto rounded-[18px] bg-white shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
          <div>
            <div className="font-mono text-[16px] font-extrabold">{alumno.alumno_dni}</div>
            <div className="mt-0.5 text-[12.5px] text-slate-400">{nombreCompleto}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[5px] bg-slate-100 text-slate-500 transition-colors hover:text-slate-900"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5">
          <span className={`inline-block rounded-[5px] border px-2 py-[5px] text-[12.5px] font-bold ${estiloEstado}`}>
            {alumno.estado_nombre || alumno.estado}
          </span>

          <div className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-x-6 gap-y-4">
            <Campo label="ALUMNO" valor={nombreCompleto} />
            <Campo label="DNI" valor={alumno.alumno_dni} />
            <Campo label="FECHA DE NACIMIENTO" valor={formatearFecha(alumno.fecha_nacimiento)} />
            <Campo label="GRADO" valor={alumno.grado} />
            <Campo label="FECHA DE MATRÍCULA" valor={formatearFecha(alumno.fecha_matricula)} />
            {!esActivo && <Campo label="FECHA DEL CAMBIO DE ESTADO" valor={formatearFecha(alumno.fecha_estado)} />}
          </div>

          {!esActivo && alumno.motivo_estado && (
            <div className="mt-4 rounded-[10px] border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-[11px] font-semibold text-slate-400">MOTIVO</div>
              <div className="text-[13px] text-slate-700">{alumno.motivo_estado}</div>
            </div>
          )}

          <div className="mt-[22px]">
            <div className="mb-2.5 text-[12px] font-bold text-slate-500">
              APODERADOS ({alumno.apoderados?.length ?? 0})
            </div>

            {!alumno.apoderados || alumno.apoderados.length === 0 ? (
              <div className="text-[12.5px] text-slate-400">Este alumno no tiene apoderados registrados.</div>
            ) : (
              <div className="space-y-3">
                {alumno.apoderados.map((apoderado) => (
                  <div key={apoderado.dni} className="rounded-[12px] border border-slate-200 p-4">
                    <div className="mb-3 inline-block rounded-[5px] bg-blue-50 px-2 py-[3px] text-[11.5px] font-bold text-blue-700">
                      {apoderado.parentesco}
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-x-6 gap-y-4">
                      <Campo
                        label="NOMBRE"
                        valor={`${apoderado.nombre} ${apoderado.apellido_paterno} ${apoderado.apellido_materno}`.trim()}
                      />
                      <Campo label="DNI" valor={apoderado.dni || "—"} />
                      <Campo label="TELÉFONO" valor={apoderado.telefono || "—"} />
                      <Campo label="CORREO" valor={apoderado.email || "—"} />
                    </div>

                    {apoderado.hijos && apoderado.hijos.length > 0 && (
                      <div className="mt-4">
                        <div className="mb-1.5 text-[11px] font-semibold text-slate-400">OTROS HIJOS EN EL COLEGIO</div>
                        <div className="flex flex-wrap gap-1.5">
                          {apoderado.hijos.map((hijo) => (
                            <span
                              key={`${hijo.nombre}-${hijo.grado}`}
                              className="rounded-[5px] border border-slate-200 bg-slate-50 px-2 py-[3px] text-[11.5px] font-semibold text-slate-600"
                            >
                              {hijo.nombre} · {hijo.grado}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
