import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import {
  Download,
  Search,
  Calendar,
  ChevronDown,
  Clock,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface AsistenciaBloque {
  estado: string;
  observacion: string | null;
  hora_inicio: string;
  hora_fin: string;
}

interface Asistencia {
  id: number;
  id_alumno: number;
  id_asignacion: number;
  fecha: string;
  asistio: boolean | number;
  estado: string;
  hora_llegada: string | null;
  observaciones: string | null;
  dni: string;
  nombre: string;
  ap_p: string;
  ap_m: string;
  detalles_bloque?: AsistenciaBloque[];
}

interface Asignacion {
  id_asignacion: number;
  id_curso: number;
  curso: string;
  id_grado: number;
  grado: string;
  anio: number;
}

export default function HistorialAsistencia() {
  const [fecha, setFecha] = useState(format(new Date(), "yyyy-MM-dd"));
  const [grado, setGrado] = useState<string>("");
  const [curso, setCurso] = useState<string>("");
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const ANIO_ACTUAL = "2026";

  useEffect(() => {
    const fetchAsignaciones = async () => {
      try {
        const { data } = await api.get(`/docente/mis-asignaciones-alumnos/${ANIO_ACTUAL}`);
        if (data.success) setAsignaciones(data.data || []);
      } catch { setAsignaciones([]); }
    };
    fetchAsignaciones();
  }, []);

  const gradosDisponibles = Array.from(
    new Map((asignaciones || []).map(a => [a.id_grado, a.grado])).entries()
  ).map(([id, nombre]) => ({ id, nombre }));

  const asignacionesFiltradas = grado ? (asignaciones || []).filter(a => a.id_grado.toString() === grado) : (asignaciones || []);

  const handleBuscar = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (fecha) params.fecha = fecha;
      if (grado) params.id_grado = grado;
      if (curso) params.id_curso = curso;
      const { data } = await api.get("/docente/listar-asistencias", { params });
      if (data.success) {
        setAsistencias(data.data);
      } else {
        setAsistencias([]);
        setError(data.message || "No se encontraron registros.");
      }
    } catch {
      setError("Error de conexión");
      setAsistencias([]);
    } finally {
      setLoading(false);
    }
  }, [fecha, grado, curso]);

  const handleDescargarExcel = async () => {
    if (!fecha || !grado || !curso) return;
    try {
      setLoading(true);
      const { data } = await api.get("/docente/exportar-asistencia", {
        params: { fecha, id_grado: grado, id_curso: curso },
        responseType: "blob",
      });
      const blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `asistencia_${fecha}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch removido a petición del usuario. 
  // Ahora los datos solo se muestran al pulsar el botón "Consultar".
  // useEffect(() => {
  //   if (fecha || grado || curso) {
  //     handleBuscar();
  //   }
  // }, [handleBuscar]);

  const stats = {
    total: asistencias.length,
    presentes: asistencias.filter(a => a.estado === "Presente").length,
    ausentes: asistencias.filter(a => a.estado === "Ausente").length
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
              Historial de Asistencias
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Calendar size={12} className="text-slate-400" />
              <span className="text-[11px] text-slate-500 font-medium tracking-tight">Registro histórico consolidado</span>
              <span className="w-1 h-1 rounded-full bg-slate-200 mx-0.5" />
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-tight">Periodo {ANIO_ACTUAL}</span>
            </div>
          </div>
        </div>

        <Button
          onClick={handleDescargarExcel}
          disabled={loading || asistencias.length === 0}
          className="h-8 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs shadow-none border-none transition-all active:scale-95"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-4">
        {/* Compact Stats row */}
        <div className="flex items-center gap-6 text-[11px]">
          <div className="flex gap-1.5 items-center">
            <span className="text-slate-500 font-medium">Registros:</span>
            <span className="font-bold text-slate-900">{stats.total}</span>
          </div>
          <div className="flex gap-1.5 items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-slate-500 font-medium">Presentes:</span>
            <span className="font-bold text-emerald-600">{stats.presentes}</span>
          </div>
          <div className="flex gap-1.5 items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span className="text-slate-500 font-medium">Faltas:</span>
            <span className="font-bold text-rose-600">{stats.ausentes}</span>
          </div>
        </div>

        {/* Filters Row Compact */}
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <Input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="h-8 w-40 text-xs rounded-md bg-white border-slate-200"
            />

            <div className="relative w-48">
              <select
                value={grado}
                onChange={(e) => {
                  setGrado(e.target.value);
                  setCurso("");
                }}
                className="w-full h-8 px-3 pr-8 bg-white border border-slate-200 rounded-md text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                <option value="">Todos los grados</option>
                {gradosDisponibles.map(g => (
                  <option key={g.id} value={g.id.toString()}>{g.nombre}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative w-56">
              <select
                value={curso}
                onChange={(e) => setCurso(e.target.value)}
                className="w-full h-8 px-3 pr-8 bg-white border border-slate-200 rounded-md text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                <option value="">Todas las materias</option>
                {asignacionesFiltradas.map(a => (
                  <option key={a.id_asignacion} value={a.id_curso.toString()}>
                    {a.curso}
                  </option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <Button
            onClick={handleBuscar}
            disabled={loading}
            variant="outline"
            className="h-8 px-4 rounded-md text-xs border-slate-200 hover:bg-slate-50"
          >
            {loading ? "..." : <><Search size={14} className="mr-2" /> Consultar</>}
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-md flex items-center gap-2 text-amber-700 animate-in fade-in">
            <AlertCircle size={14} className="text-amber-500" />
            <span className="text-[11px] font-semibold tracking-tight">{error}</span>
          </div>
        )}

        {/* Table Clean Professional */}
        <Card className="border border-slate-200 rounded-md shadow-none bg-white overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/50">
                  <tr className="text-left text-slate-600">
                    <th className="px-5 py-2.5 font-semibold">Estudiante</th>
                    <th className="px-5 py-2.5 font-semibold text-center">Estado</th>
                    <th className="px-5 py-2.5 font-semibold text-center">Referencia</th>
                    <th className="px-5 py-2.5 font-semibold">Observaciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-12 text-center text-slate-400 font-medium bg-white">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-4 w-4 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                          <span>Sincronizando base de datos...</span>
                        </div>
                      </td>
                    </tr>
                  ) : asistencias.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-12 text-center text-slate-900 font-medium bg-white uppercase tracking-widest text-[10px]">
                        {error || "Sin resultados para mostrar"}
                      </td>
                    </tr>
                  ) : (
                    asistencias.map((a) => (
                      <motion.tr
                        key={a.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-2 py-1">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900">
                              {a.nombre} {a.ap_p}
                            </span>
                            <span className="text-[10px] text-slate-500 tabular-nums">
                              DNI: {a.dni}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 py-1 text-center">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 text-[10px] font-medium rounded border ${a.estado === "Presente" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"}`}>
                              {a.estado}
                            </span>
                            {a.detalles_bloque && a.detalles_bloque.length > 0 && (
                              <div className="flex flex-wrap justify-center gap-1">
                                {a.detalles_bloque.map((bloque, idx) => (
                                  <div key={idx} title={`Estado: ${bloque.estado} | Obs: ${bloque.observacion || "Ninguna"}`} className="flex gap-1 items-center px-1.5 py-0.5 bg-white border border-slate-200 rounded shadow-sm text-[9px] text-slate-500 cursor-help transition-colors hover:border-blue-300">
                                    <span className={`w-1.5 h-1.5 rounded-full ${bloque.estado === 'Presente' ? 'bg-emerald-500' : bloque.estado === 'Tardanza' ? 'bg-amber-500' : bloque.estado === 'Ausente' ? 'bg-rose-500' : 'bg-blue-500'}`} />
                                    <span>{bloque.hora_inicio}-{bloque.hora_fin}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-1">
                          <div className="flex items-center justify-center gap-1.5 text-slate-500 font-medium text-[11px]">
                            <Clock size={12} className="text-amber-500" />
                            {a.hora_llegada || "--:--"}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-[11px] text-slate-400 italic max-w-xs truncate">{a.observaciones || "---"}</p>
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
        <p>System Ledger v3.0</p>
        <p>© 2026 Academic Intel</p>
      </div>
    </div>
  );
}
