import { useState, useCallback } from "react";
import api from "@/lib/axios";
import {
  Calendar,
  CheckCircle,
  XCircle,
  ExternalLink,
  Search
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog";

interface Justificacion {
  id: number;
  id_matricula: number;
  id_docente: number;
  titulo: string;
  descripcion: string;
  tipo: string;
  fecha_inicio: string;
  fecha_fin: string;
  url_documento: string;
  cloudinary_public_id: string;
  estado: string;
  fecha_revision: string | null;
  comentario_revision: string | null;
  created_at: string;
  updated_at: string;
  nombre_alumno: string;
  curso: string | null;
  grado: string | null;
  fecha_falta: string | null;
  observacion_falta: string | null;
}

const estados = {
  Pendiente: { label: "Pendiente", color: "bg-amber-50 text-amber-600 border-amber-100", dot: "bg-amber-400" },
  Aprobada: { label: "Aprobada", color: "bg-emerald-50 text-emerald-600 border-emerald-100", dot: "bg-emerald-400" },
  Rechazada: { label: "Rechazada", color: "bg-rose-50 text-rose-600 border-rose-100", dot: "bg-rose-400" }
};

export default function JustificacionesDocente() {
  const [justificaciones, setJustificaciones] = useState<Justificacion[]>([]);
  const [loading, setLoading] = useState(false);
  const today = new Date();
  const localDateStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
  const [fechaInput, setFechaInput] = useState(localDateStr);
  const [showDialog, setShowDialog] = useState(false);
  const [justificacionSeleccionada, setJustificacionSeleccionada] = useState<Justificacion | null>(null);
  const [accionSeleccionada, setAccionSeleccionada] = useState<"aceptar" | "rechazar" | null>(null);
  const [comentario, setComentario] = useState("");

  const [activeTab, setActiveTab] = useState<"pendientes" | "historial">("pendientes");
  const [estadoFiltro, setEstadoFiltro] = useState<"Todos" | "Aprobada" | "Rechazada">("Todos");

  const fetchJustificaciones = useCallback(async (fetchAllPendientes = false) => {
    setLoading(true);
    try {
      let urlApi = "";
      if (activeTab === "pendientes") {
        if (!fetchAllPendientes && fechaInput) {
          const [year, month, day] = fechaInput.split("-");
          urlApi = `/justificacion/docente/pendientes?anio=${year}&mes=${parseInt(month)}&dia=${parseInt(day)}`;
        } else {
          urlApi = `/justificacion/docente/pendientes`;
        }
      } else {
        urlApi = `/justificacion/docente/historial`;
        if (estadoFiltro !== "Todos") {
          urlApi += `?estado=${estadoFiltro}`;
        }
      }
      const res = await api.get(urlApi);
      if (res.data.success) {
        let rawData = res.data.data;
        // Si el backend devuelve un array plano (como acabamos de cambiar), no hace falta flatMap
        if (rawData.length > 0 && rawData[0].solicitudes) {
          rawData = rawData.flatMap((group: any) => group.solicitudes);
        }
        setJustificaciones(rawData);
      } else {
        setJustificaciones([]);
      }
    } catch (err) {
      setJustificaciones([]);
    } finally {
      setLoading(false);
    }
  }, [fechaInput, activeTab, estadoFiltro]);

  // Auto-fetch retirado a petición
  // useEffect(() => {
  //   fetchJustificaciones();
  // }, [fetchJustificaciones]);

  const handleAccion = (j: Justificacion, accion: "aceptar" | "rechazar") => {
    setJustificacionSeleccionada(j);
    setAccionSeleccionada(accion);
    setComentario("");
    setShowDialog(true);
  };

  const confirmarAccion = async () => {
    if (!justificacionSeleccionada || !accionSeleccionada) return;
    try {
      setLoading(true);
      const res = await api.put(`/justificacion/${justificacionSeleccionada.id}/estado`, {
        estado: accionSeleccionada === "aceptar" ? "Aprobada" : "Rechazada",
        comentario_revision: comentario
      });
      if (res.data.success) {
        setJustificaciones(justificaciones.filter(j => j.id !== justificacionSeleccionada.id));
        setShowDialog(false);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      {/* Topbar Compact */}
      <div className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-slate-400 hover:text-slate-600 transition-colors" />
          <div className="h-4 w-px bg-slate-200 mx-2" />
          <div>
            <h1 className="text-sm font-semibold text-slate-900">
              Justificaciones de Estudiantes
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Calendar size={12} className="text-slate-400" />
              <span className="text-[11px] text-slate-500 font-medium">Revisión de solicitudes pendientes</span>
              <span className="w-1 h-1 rounded-full bg-slate-200 mx-0.5" />
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-tight">Periodo Lectivo 2026</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-md border ${activeTab === 'pendientes' ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-200'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${activeTab === 'pendientes' ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'}`} />
            <span className={`text-[10px] font-bold uppercase tracking-tight ${activeTab === 'pendientes' ? 'text-amber-700' : 'text-slate-600'}`}>
              {activeTab === 'pendientes' ? 'Pendientes:' : 'Registros:'} {justificaciones.length}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-4">
        {/* Compact Filters row */}
        <div className="flex items-end justify-between">
          <div className="flex gap-4">
            <div className="flex bg-slate-100 p-1 rounded-md h-8 self-end mr-4">
              <button
                onClick={() => setActiveTab("pendientes")}
                className={`px-4 text-[11px] font-bold rounded-sm transition-all ${activeTab === "pendientes" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                Pendientes
              </button>
              <button
                onClick={() => setActiveTab("historial")}
                className={`px-4 text-[11px] font-bold rounded-sm transition-all ${activeTab === "historial" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                Historial
              </button>
            </div>

            {activeTab === "pendientes" ? (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Fecha de Solicitud</label>
                <div className="relative">
                  <Input
                    type="date"
                    value={fechaInput}
                    onChange={(e) => setFechaInput(e.target.value)}
                    className="h-8 w-44 text-xs rounded-md bg-white border-slate-200"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Filtrar por Estado</label>
                <select
                  value={estadoFiltro}
                  onChange={(e) => setEstadoFiltro(e.target.value as "Todos" | "Aprobada" | "Rechazada")}
                  className="h-8 w-44 px-3 text-xs font-semibold text-slate-700 rounded-md bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-300"
                >
                  <option value="Todos">Todas las Justificaciones</option>
                  <option value="Aprobada">Solo Aprobadas</option>
                  <option value="Rechazada">Solo Rechazadas</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => fetchJustificaciones(true)}
              disabled={loading}
              variant="outline"
              className="h-8 px-4 rounded-md text-blue-600 border-blue-200 text-xs font-bold transition-all uppercase tracking-wider"
            >
              Ver Todas
            </Button>
            <Button
              onClick={() => fetchJustificaciones(false)}
              disabled={loading}
              className="h-8 px-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-none border-none transition-all active:scale-95 uppercase tracking-wider"
            >
              {loading ? "..." : <><Search size={14} className="mr-2" /> Consultar</>}
            </Button>
          </div>
        </div>

        {/* Table Clean Professional */}
        <Card className="border border-slate-200 rounded-md shadow-none bg-white overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/50 uppercase tracking-tighter">
                  <tr className="text-left text-slate-500">
                    <th className="px-4 py-2 font-bold text-[10px]">Estudiante</th>
                    <th className="px-4 py-2 font-bold text-[10px]">Falta</th>
                    <th className="px-4 py-2 font-bold text-[10px]">Detalle</th>
                    <th className="px-4 py-2 font-bold text-[10px] text-center">Documento</th>
                    <th className="px-4 py-2 font-bold text-[10px] text-right pr-6">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-slate-400 font-medium bg-white">
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-5 w-5 border-2 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Sincronizando...</span>
                        </div>
                      </td>
                    </tr>
                  ) : justificaciones.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-16 text-center text-slate-900 font-medium bg-white uppercase tracking-widest text-[10px]">
                        No se encontraron justificaciones {activeTab === "pendientes" ? "pendientes" : "en el historial"}
                      </td>
                    </tr>
                  ) : (
                    justificaciones.map((j) => (
                      <motion.tr
                        key={j.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-4 py-2">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 leading-tight">
                              {j.nombre_alumno}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {j.grado && <span className="text-[9px] font-medium text-slate-400">{j.grado}</span>}
                              {j.grado && j.curso && <span className="text-slate-200">·</span>}
                              {j.curso && <span className="text-[9px] font-medium text-blue-500">{j.curso}</span>}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <div className={`w-1 h-1 rounded-full ${estados[j.estado as keyof typeof estados]?.dot || "bg-slate-300"}`} />
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">{j.estado}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex flex-col max-w-[180px]">
                            {j.fecha_falta ? (
                              <span className="text-[10px] font-semibold text-slate-700">
                                {new Date(j.fecha_falta).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-300">Sin fecha</span>
                            )}
                            {j.observacion_falta && (
                              <p className="text-[10px] text-slate-400 italic truncate font-medium mt-0.5">{j.observacion_falta}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex flex-col max-w-xs">
                            <span className="text-[9px] font-bold text-amber-600 uppercase tracking-tight">{j.tipo}</span>
                            <span className="text-[11px] font-semibold text-slate-700 truncate">{j.titulo}</span>
                            <p className="text-[10px] text-slate-400 italic truncate font-medium">{j.descripcion}</p>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <a
                            href={j.url_documento}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50/50 px-2 py-1 rounded border border-blue-100 hover:bg-blue-600 hover:text-white transition-all uppercase"
                          >
                            PDF <ExternalLink size={10} />
                          </a>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex justify-end gap-2 pr-8">
                            {j.estado === "Pendiente" ? (
                              <>
                                <button
                                  onClick={() => handleAccion(j, "aceptar")}
                                  className="w-7 h-7 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all active:scale-90"
                                >
                                  <CheckCircle size={14} />
                                </button>
                                <button
                                  onClick={() => handleAccion(j, "rechazar")}
                                  className="w-7 h-7 rounded bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all active:scale-90"
                                >
                                  <XCircle size={14} />
                                </button>
                              </>
                            ) : (
                              <span className={`text-[10px] font-bold uppercase tracking-widest ${j.estado === "Aprobada" ? "text-emerald-500" : "text-rose-500"}`}>
                                {j.estado}
                              </span>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Compact */}
      <div className="h-10 bg-white border-t border-slate-200 flex items-center justify-between px-6 text-[9px] font-black text-slate-300 uppercase tracking-widest">
        <p>Request Ledger v2.5</p>
        <p>© 2026 Academic Intel</p>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-[360px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
          <div className={`p-4 ${accionSeleccionada === "aceptar" ? "bg-emerald-600" : "bg-rose-600"} relative`}>
            <h3 className="text-white text-base font-bold tracking-tight text-center uppercase">
              {accionSeleccionada === "aceptar" ? "Aprobar Solicitud" : "Rechazar Solicitud"}
            </h3>
            <p className="text-white/60 text-[9px] font-bold uppercase tracking-widest mt-0.5 text-center">Gestión Académica</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex flex-col items-center text-center">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Estudiante</span>
              <p className="text-sm font-bold text-slate-800 leading-tight uppercase">{justificacionSeleccionada?.nombre_alumno}</p>
              {justificacionSeleccionada?.grado && (
                <p className="text-[9px] text-slate-500 font-medium mt-0.5">{justificacionSeleccionada.grado} {justificacionSeleccionada.curso && `· ${justificacionSeleccionada.curso}`}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Comentario de Revisión</label>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Indique los motivos de la decisión..."
                className="w-full min-h-[80px] p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 focus:bg-white focus:border-blue-500 transition-all outline-none resize-none placeholder:text-slate-300 shadow-inner"
              />
            </div>

            <div className="flex gap-2 pb-2">
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="flex-1 h-9 border-slate-200 text-slate-400 font-bold text-[9px] uppercase tracking-widest"
              >
                Cerrar
              </Button>
              <Button
                onClick={confirmarAccion}
                className={`flex-1 h-9 font-bold text-[9px] uppercase tracking-widest text-white shadow-md ${accionSeleccionada === "aceptar" ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100" : "bg-rose-600 hover:bg-rose-700 shadow-rose-100"}`}
              >
                {accionSeleccionada === "aceptar" ? "Aprobar" : "Rechazar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
}
