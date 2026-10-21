import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { History, Loader2, X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

type CambioEstado = {
  id: number;
  id_estado_anterior: string | null;
  estado_anterior: string | null;
  id_estado: string;
  estado: string | null;
  motivo: string;
  fecha_crea: string;
  usuario: string | null;
  usuario_nombre: string | null;
};

interface HistorialEstadoAlumnoModalProps {
  idAlumno: number;
  nombreAlumno: string;
  estilosEstado: Record<string, string>;
  onClose: () => void;
}

function formatearFechaHora(fecha: string): string {
  return new Date(fecha).toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold text-slate-400">{label}</div>
      <div className="text-[13.5px] font-semibold text-slate-900 break-words">{valor}</div>
    </div>
  );
}

/**
 * Historial de cambios de estado (retiros, expulsiones, reactivaciones, egreso) con su motivo.
 */
export function HistorialEstadoAlumnoModal({ idAlumno, nombreAlumno, estilosEstado, onClose }: HistorialEstadoAlumnoModalProps) {
  const { data: historial = [], isLoading, isError } = useQuery<CambioEstado[]>({
    queryKey: ["historialEstadoAlumno", idAlumno],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_URL}/alumno/estado/${idAlumno}/historial`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data.success ? data.data : [];
    },
    staleTime: 0,
  });

  return (
    <div onClick={onClose} className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-5">
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88vh] w-full max-w-[520px] overflow-y-auto rounded-lg bg-white shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <History size={16} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[15px] font-extrabold text-slate-900">Historial de estado</div>
              <div className="text-[12px] text-slate-500">{nombreAlumno}</div>
            </div>
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
          {isLoading ? (
            <div className="flex items-center gap-2 text-[12.5px] text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando historial...
            </div>
          ) : isError ? (
            <div className="text-[12.5px] font-semibold text-red-600">No se pudo cargar el historial.</div>
          ) : historial.length === 0 ? (
            <div className="text-[12.5px] text-slate-400">Este alumno no tiene cambios de estado registrados.</div>
          ) : (
            <ol className="relative space-y-5 border-l-2 border-slate-100 pl-5">
              {historial.map((cambio, indice) => (
                <li key={cambio.id} className="relative">
                  <span
                    className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white ${
                      indice === 0 ? "bg-blue-600" : "bg-slate-300"
                    }`}
                  />
                  <div className="flex flex-wrap items-center gap-1.5">
                    {cambio.id_estado_anterior && (
                      <>
                        <span
                          className={`rounded-[5px] border px-1.5 py-0.5 text-[10.5px] font-bold ${
                            estilosEstado[cambio.id_estado_anterior] ?? "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {cambio.estado_anterior ?? cambio.id_estado_anterior}
                        </span>
                        <span className="text-[11px] text-slate-400">→</span>
                      </>
                    )}
                    <span
                      className={`rounded-[5px] border px-1.5 py-0.5 text-[10.5px] font-bold ${
                        estilosEstado[cambio.id_estado] ?? "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {cambio.estado ?? cambio.id_estado}
                    </span>
                    {indice === 0 && <span className="text-[10.5px] font-semibold text-blue-600">Actual</span>}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3">
                    <Campo label="FECHA" valor={formatearFechaHora(cambio.fecha_crea)} />
                    <Campo label="REGISTRADO POR" valor={cambio.usuario_nombre || cambio.usuario || "--"} />
                  </div>
                  <div className="mt-3">
                    <Campo label="MOTIVO" valor={cambio.motivo} />
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
