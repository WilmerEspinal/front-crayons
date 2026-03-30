import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CalendarCheck2, Save } from "lucide-react";

type Bloque = {
  id_horario: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  aula: string | null;
  id_asignacion: number;
  curso: string;
  grado: string;
  seccion: string;
  puede_registrar: boolean;
};

type AlumnoBloque = {
  id_alumno: number;
  dni: string;
  nombre_completo: string;
  estado: "Presente" | "Ausente" | "Tardanza" | "Justificado" | null;
  observacion: string | null;
};


function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function AsistenciaBloquesDocente() {
  const [fecha, setFecha] = useState(todayISO());
  const [bloques, setBloques] = useState<Bloque[]>([]);
  const [idHorario, setIdHorario] = useState<string>("");
  const [alumnos, setAlumnos] = useState<AlumnoBloque[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [yaRegistrada, setYaRegistrada] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [resumen, setResumen] = useState<{ Presente: number; Ausente: number; Tardanza: number; Justificado: number } | null>(null);

  const bloqueSeleccionado = useMemo(
    () => bloques.find((b) => String(b.id_horario) === idHorario) || null,
    [bloques, idHorario]
  );

  useEffect(() => {
    const fetchBloques = async () => {
      setLoading(true);
      setMessage(null);
      setResumen(null);
      try {
        const { data } = await api.get("/horario/docente/bloques", { params: { fecha } });
        if (data?.success) {
          setBloques(data.data || []);
        } else {
          setBloques([]);
        }
      } catch (error: any) {
        setBloques([]);
        setMessage({ text: error?.response?.data?.message || "Error al cargar bloques.", isError: true });
      } finally {
        setLoading(false);
      }
      setIdHorario("");
      setAlumnos([]);
    };

    fetchBloques();
  }, [fecha]);

  useEffect(() => {
    const fetchAlumnos = async () => {
      if (!idHorario) {
        setAlumnos([]);
        return;
      }

      setLoading(true);
      setMessage(null);
      setResumen(null);
      try {
        const { data } = await api.get(`/horario/docente/bloques/${idHorario}/alumnos`, { params: { fecha } });
        if (data?.success) {
          const normalized = (data.data || []).map((a: AlumnoBloque) => ({
            ...a,
            estado: (a.estado as AlumnoBloque["estado"]) || "Presente",
            observacion: a.observacion || "",
          }));
          setAlumnos(normalized);
          setYaRegistrada(data.ya_registrada || false);
          if (data.ya_registrada) {
            setMessage({ text: "La asistencia para este bloque ya ha sido registrada previamente.", isError: false });
          }
        } else {
          setAlumnos([]);
          setYaRegistrada(false);
        }
      } catch (error: any) {
        setAlumnos([]);
        setMessage({ text: error?.response?.data?.message || "Error al cargar alumnos del bloque.", isError: true });
      } finally {
        setLoading(false);
      }
    };

    fetchAlumnos();
  }, [idHorario, fecha]);

  const onChangeEstado = (idAlumno: number, estado: AlumnoBloque["estado"]) => {
    setAlumnos((prev) => prev.map((a) => (a.id_alumno === idAlumno ? { ...a, estado } : a)));
  };

  const onChangeObs = (idAlumno: number, observacion: string) => {
    setAlumnos((prev) => prev.map((a) => (a.id_alumno === idAlumno ? { ...a, observacion } : a)));
  };

  const guardar = async () => {
    if (!idHorario || alumnos.length === 0) return;

    setSaving(true);
    setMessage(null);
    setResumen(null);
    try {
      const payload = {
        id_horario: Number(idHorario),
        fecha,
        asistencia: alumnos.map((a) => ({
          id_alumno: a.id_alumno,
          estado: a.estado || "Presente",
          observacion: a.observacion || null,
        })),
      };

      const { data } = await api.post("/horario/docente/asistencia-bloque", payload);
      if (data?.success) {
        setMessage({ text: data.message || "Asistencia registrada.", isError: false });
        setResumen(data.resumen || null);
        setYaRegistrada(true);
      } else {
        setMessage({ text: data?.message || "No se pudo registrar asistencia.", isError: true });
      }
    } catch (error: any) {
      setMessage({ text: error?.response?.data?.message || "Error al registrar asistencia.", isError: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <div className="h-14 border-b border-slate-200 flex items-center gap-3 px-6 bg-white sticky top-0 z-10">
        <SidebarTrigger className="text-slate-500" />
        <CalendarCheck2 className="w-4 h-4 text-blue-700" />
        <h1 className="text-sm font-semibold text-slate-900">Asistencia por Bloques</h1>
      </div>

      <div className="p-6 space-y-4">
        {message && (
          <div className={`px-3 py-2 rounded text-sm border ${message.isError ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
            {message.text}
          </div>
        )}

        {resumen && (
          <div className="bg-white border rounded p-3 text-sm grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>Presente: <b>{resumen.Presente || 0}</b></div>
            <div>Ausente: <b>{resumen.Ausente || 0}</b></div>
            {/* <div>Tardanza: <b>{resumen.Tardanza || 0}</b></div> */}
            <div>Justificado: <b>{resumen.Justificado || 0}</b></div>
          </div>
        )}

        <div className="bg-white border rounded p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-slate-600 font-medium">Fecha <span className="text-red-500">*</span></label>
            <input type="date" className="w-full h-9 mt-1 border rounded px-2 text-sm" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-slate-600 font-medium">Curso / Grado <span className="text-red-500">*</span></label>
            <select className="w-full h-9 mt-1 border rounded px-2 text-sm" value={idHorario} onChange={(e) => setIdHorario(e.target.value)}>
              <option value="">Seleccionar curso</option>
              {bloques.map((b) => (
                <option key={b.id_horario} value={b.id_horario}>
                  {`${b.curso} | ${b.grado} | ${String(b.hora_inicio).slice(0, 5)}-${String(b.hora_fin).slice(0, 5)} | ${b.dia_semana}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {bloqueSeleccionado && !bloqueSeleccionado.puede_registrar && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded px-3 py-2">
            El bloque seleccionado está fuera de hora. Solo puedes registrar dentro del rango horario configurado.
          </div>
        )}

        <div className="bg-white border rounded overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="text-left px-3 py-2">DNI</th>
                <th className="text-left px-3 py-2">Alumno</th>
                <th className="text-left px-3 py-2">Estado</th>
                <th className="text-left px-3 py-2">Observación</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-3 py-6 text-slate-500" colSpan={4}>Cargando...</td></tr>
              ) : alumnos.length === 0 ? (
                <tr><td className="px-3 py-6 text-slate-500" colSpan={4}>Selecciona un bloque para listar alumnos.</td></tr>
              ) : (
                alumnos.map((a) => (
                  <tr key={a.id_alumno} className="border-t">
                    <td className="px-3 py-2">{a.dni}</td>
                    <td className="px-3 py-2">{a.nombre_completo}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 text-[10px] font-medium rounded border ${(a.estado || "Presente") === "Presente" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"}`}>
                          {(a.estado || "Presente") === "Presente" ? "Presente" : "Ausente"}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer scale-90">
                          <input
                            type="checkbox"
                            checked={(a.estado || "Presente") === "Presente"}
                            onChange={(e) => onChangeEstado(a.id_alumno, e.target.checked ? "Presente" : "Ausente")}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={a.observacion || ""}
                        onChange={(e) => onChangeObs(a.id_alumno, e.target.value)}
                        className="w-full h-8 border rounded px-2"
                        placeholder="Observación"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <button
            onClick={guardar}
            disabled={saving || !bloqueSeleccionado?.puede_registrar || alumnos.length === 0 || yaRegistrada}
            className="h-9 px-4 rounded bg-blue-600 text-white text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? "Guardando..." : "Guardar asistencia del bloque"}
          </button>
        </div>
      </div>
    </div>
  );
}
