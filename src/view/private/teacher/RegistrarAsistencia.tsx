import { useState, useEffect } from "react";
import api from "@/lib/axios";
import {
  ChevronDown,
  Calendar,
  UserCheck,
  Save,
  AlertCircle
} from 'lucide-react';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface Student {
  id_alumno: number;
  id_matricula: number;
  dni: string;
  nombre_completo: string;
}

interface AlumnoAsistencia extends Student {
  asistio: boolean;
  observacion: string;
}

interface Asignacion {
  id_asignacion: number;
  id_curso: number;
  curso: string;
  id_grado: number;
  grado: string;
  anio: number;
  alumnos: Student[];
}

export default function RegistrarAsistencia() {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [asignacionSeleccionada, setAsignacionSeleccionada] = useState<string>("");
  const [anioSeleccionado, setAnioSeleccionado] = useState<string>(new Date().getFullYear().toString());
  const [alumnos, setAlumnos] = useState<AlumnoAsistencia[]>([]);
  const [mensaje, setMensaje] = useState<{ text: string; isError: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [gradoSeleccionado, setGradoSeleccionado] = useState<string>("");
  const [yaRegistrada, setYaRegistrada] = useState(false);
  const [periodos, setPeriodos] = useState<any[]>([]);

  const isPeriodoInactivo = !!(periodos.find(p => p.anio.toString() === anioSeleccionado)?.activo === 0);

  useEffect(() => {
    const fetchAsignaciones = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/docente/mis-asignaciones-alumnos/${anioSeleccionado}`);
        if (data.success) {
          setAsignaciones(data.data || []);
        } else {
          setAsignaciones([]);
        }
      } catch (error) {
        setAsignaciones([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAsignaciones();

    const fetchPeriodos = async () => {
      try {
        const { data } = await api.get("/cuotas/periodos");
        if (data.status) {
          setPeriodos(data.data || []);
          // Si el año actual no está en la lista (posible primera carga), 
          // podríamos seleccionar el año del primer periodo activo
          const active = data.data.find((p: any) => p.activo === 1);
          if (active && (!anioSeleccionado || anioSeleccionado === new Date().getFullYear().toString())) {
            setAnioSeleccionado(active.anio.toString());
          }
        }
      } catch (error) {
        console.error("Error fetching periodos", error);
      }
    };
    fetchPeriodos();
  }, [anioSeleccionado]);

  useEffect(() => {
    const checkAsistencia = async () => {
      if (!asignacionSeleccionada) {
        setAlumnos([]);
        setYaRegistrada(false);
        return;
      }

      setLoading(true);
      try {
        const today = new Date();
        const fechaHoy = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
        const { data } = await api.get('/docente/verificar-asistencia', {
          params: { id_asignacion: asignacionSeleccionada, fecha: fechaHoy }
        });

        if (data.success && data.ya_registrada) {
          setYaRegistrada(true);
          // Si ya existe, podríamos cargar los datos existentes si quisiéramos, 
          // pero por ahora solo bloqueamos para cumplir el requerimiento.
        } else {
          setYaRegistrada(false);
        }

        const selected = asignaciones.find(a => a.id_asignacion.toString() === asignacionSeleccionada);
        if (selected) {
          setAlumnos(
            selected.alumnos.map(al => ({
              ...al,
              asistio: true,
              observacion: ""
            }))
          );
          setMensaje(null);
        } else {
          setAlumnos([]);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    checkAsistencia();
  }, [asignacionSeleccionada, asignaciones]);

  const handleAsistenciaChange = (id: number, checked: boolean) => {
    setAlumnos(alumnos.map(a => a.id_alumno === id ? { ...a, asistio: checked } : a));
  };

  const handleObservacionChange = (id: number, observacion: string) => {
    setAlumnos(alumnos.map(a => a.id_alumno === id ? { ...a, observacion } : a));
  };

  const handleGuardarAsistencia = async () => {
    if (!asignacionSeleccionada) return;
    setLoading(true);
    setMensaje(null);
    try {
      const today = new Date();
      const fechaHoy = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
      const horaActual = new Date().toLocaleTimeString('en-GB');

      const payload = {
        asistencia: alumnos.map((alumno) => ({
          id_alumno: alumno.id_alumno,
          id_asignacion: parseInt(asignacionSeleccionada),
          fecha: fechaHoy,
          estado: alumno.asistio ? "Presente" : "Ausente",
          hora_llegada: alumno.asistio ? horaActual : null,
          observaciones: alumno.observacion,
        })),
      };

      const { data } = await api.post("/docente/registrar-asistencia-masiva", payload);

      if (data.success) {
        setMensaje({ text: data.message || "¡Asistencia registrada con éxito!", isError: false });
        setYaRegistrada(true);
      } else {
        setMensaje({ text: data.message || "Error al registrar la asistencia.", isError: true });
      }
    } catch (error: unknown) {
      let errorMessage = "Error al servidor al intentar guardar.";
      if (error && typeof error === 'object' && 'response' in error) {
        const responseData = (error as any).response?.data;
        errorMessage = responseData?.message || errorMessage;
      }
      setMensaje({ text: errorMessage, isError: true });
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: alumnos.length,
    presentes: alumnos.filter(a => a.asistio).length,
    ausentes: alumnos.filter(a => !a.asistio).length
  };

  const gradosDisponibles = Array.from(
    new Map(asignaciones.map(a => [a.id_grado, a.grado])).entries()
  ).map(([id, nombre]) => ({ id, nombre }));

  const asignacionesFiltradas = gradoSeleccionado
    ? asignaciones.filter(a => a.id_grado.toString() === gradoSeleccionado)
    : asignaciones;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      {/* Topbar Compact */}
      <div className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-slate-400 hover:text-slate-600 transition-colors" />
          <div className="h-4 w-px bg-slate-200 mx-2" />
          <div>
            <h1 className="text-sm font-semibold text-slate-900">
              Control de Asistencia
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Calendar size={12} className="text-slate-400" />
              <span className="text-[11px] text-slate-500 font-medium capitalize">
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-200 mx-0.5" />
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tight">Directorio Activo</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {yaRegistrada && (
            <div className="mr-2 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md flex items-center gap-2">
              <UserCheck size={12} />
              <span className="font-bold text-[10px] uppercase tracking-tight">Asistencia ya Registrada</span>
            </div>
          )}
          {mensaje && (
            <div className={`mr-4 px-3 py-1 rounded-md flex items-center gap-2 border animate-in fade-in slide-in-from-right-2 ${mensaje.isError ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"}`}>
              {mensaje.isError ? <AlertCircle size={12} /> : <UserCheck size={12} />}
              <span className="font-bold text-[10px] uppercase tracking-tight">{mensaje.text}</span>
            </div>
          )}
          <Button
            onClick={handleGuardarAsistencia}
            disabled={loading || alumnos.length === 0 || yaRegistrada || isPeriodoInactivo}
            className="h-8 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs shadow-none border-none transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Procesando..." : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Registro
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-4">
        {/* Banner de Periodo Inactivo */}
        {isPeriodoInactivo && (
          <div className="bg-orange-50 border border-orange-200 text-orange-800 p-3 rounded-md flex items-center gap-3 text-[11px] font-bold uppercase tracking-tight mb-2">
            <AlertCircle size={16} />
            El periodo seleccionado está Inactivo. No se permite registrar asistencia.
          </div>
        )}

        {/* Compact Stats row */}
        <div className="flex items-center gap-6 text-[11px]">
          <div className="flex gap-1.5 items-center">
            <span className="text-slate-500">Nómina Total:</span>
            <span className="font-bold text-slate-900">{stats.total}</span>
          </div>
          <div className="flex gap-1.5 items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-slate-500">Presentes:</span>
            <span className="font-bold text-emerald-600">{stats.presentes}</span>
          </div>
          <div className="flex gap-1.5 items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span className="text-slate-500">Faltas:</span>
            <span className="font-bold text-rose-600">{stats.ausentes}</span>
          </div>
        </div>

        {/* Filters Row Compact */}
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <div className="relative w-40">
              <select
                value={anioSeleccionado}
                onChange={(e) => setAnioSeleccionado(e.target.value)}
                className={`w-full h-8 px-3 pr-8 bg-white border ${isPeriodoInactivo ? 'border-orange-200 text-orange-600' : 'border-slate-200'} rounded-md text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer`}
              >
                {periodos.map((p: any) => (
                  <option key={p.id} value={p.anio.toString()}>
                    Ciclo {p.anio} {p.activo === 0 ? "(Inactivo)" : ""}
                  </option>
                ))}
                {periodos.length === 0 && (
                  <>
                    <option value="2026">Ciclo 2026</option>
                    <option value="2025">Ciclo 2025</option>
                  </>
                )}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative w-48">
              <select
                value={gradoSeleccionado}
                onChange={(e) => {
                  setGradoSeleccionado(e.target.value);
                  setAsignacionSeleccionada("");
                }}
                className="w-full h-8 px-3 pr-8 bg-white border border-slate-200 rounded-md text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                <option value="">Seleccionar Grado</option>
                {gradosDisponibles.map(g => (
                  <option key={g.id} value={g.id.toString()}>{g.nombre}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative w-64">
              <select
                value={asignacionSeleccionada}
                onChange={(e) => setAsignacionSeleccionada(e.target.value)}
                disabled={!gradoSeleccionado}
                className="w-full h-8 px-3 pr-8 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">Seleccionar Curso / Asignatura</option>
                {asignacionesFiltradas.map(a => (
                  <option key={a.id_asignacion} value={a.id_asignacion.toString()}>
                    {a.curso}
                  </option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {alumnos.length > 0 && !isPeriodoInactivo && (
              <button
                onClick={() => setAlumnos(alumnos.map(al => ({ ...al, asistio: true })))}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-md transition-all active:scale-95"
              >
                Asistencia Masiva
              </button>
            )}
          </div>
        </div>

        {/* Student Table Compact Professional */}
        <Card className="border border-slate-200 rounded-md shadow-none bg-white overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/50">
                  <tr className="text-left text-slate-600">
                    <th className="px-5 py-2.5 font-semibold">DNI</th>
                    <th className="px-5 py-2.5 font-semibold">Estudiante</th>
                    <th className="px-5 py-2.5 font-semibold">Observación</th>
                    <th className="px-5 py-2.5 font-semibold text-center">Estado</th>
                    <th className="px-5 py-2.5 font-semibold text-right pr-12">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {alumnos.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-20 bg-white">
                        <div className="flex flex-col items-center opacity-30">
                          <UserCheck className="h-12 w-12 mb-3 text-slate-400" />
                          <p className="text-[10px] font-black uppercase tracking-[0.2em]">Seleccione parámetros de carga</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    alumnos.map((alumno) => (
                      <motion.tr
                        key={alumno.id_alumno}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-5 py-3 text-slate-400 font-mono tracking-tighter">
                          {alumno.dni}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 tracking-tight leading-tight">
                              {alumno.nombre_completo}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {asignaciones.find(a => a.id_asignacion.toString() === asignacionSeleccionada)?.grado}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <input
                            type="text"
                            placeholder="Nota..."
                            value={alumno.observacion}
                            onChange={(e) => handleObservacionChange(alumno.id_alumno, e.target.value)}
                            className="w-full bg-slate-50/50 text-[11px] font-medium border border-transparent rounded px-3 py-1.5 focus:bg-white focus:border-blue-100 outline-none transition-all placeholder:text-slate-300"
                          />
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`px-2 py-0.5 text-[10px] font-medium rounded border ${alumno.asistio ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"}`}>
                            {alumno.asistio ? "Presente" : "Inasistencia"}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex justify-end pr-8">
                            <label className={`relative inline-flex items-center ${isPeriodoInactivo ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} scale-90`}>
                              <input
                                type="checkbox"
                                checked={alumno.asistio}
                                onChange={(e) => !isPeriodoInactivo && handleAsistenciaChange(alumno.id_alumno, e.target.checked)}
                                disabled={isPeriodoInactivo}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-slate-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
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
      <div className="h-10 bg-white border-t border-slate-200 flex items-center justify-between px-6 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
        <p>System Ledger v3.0</p>
        <p>© 2026 Academic Intel</p>
      </div>
    </div >
  );
}
