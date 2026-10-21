import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import { Calendar, Check, ChevronDown, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { claseInput, Etiqueta, Seccion, SelectCompacto } from "@/components/FormularioCompacto";

type PeriodoItem = { id: number; anio: number; activo: number };
type DocenteItem = { id: number; codigo_docente: string; nombre_completo: string };
type AsignacionDocente = {
  id_asignacion: number;
  id_curso: number;
  curso: string;
  id_grado: number;
  grado: string;
  id_seccion: number | null;
  seccion: string | null;
};

type Bloque = {
  id: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  aula: string;
};

type ReporteRow = {
  id_periodo: number;
  anio: number;
  id_asignacion: number;
  id_docente: number;
  docente: string;
  id_curso: number;
  curso: string;
  id_grado: number;
  grado: string;
  id_seccion: number | null;
  seccion: string;
  id_horario: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  aula: string | null;
};

const DIAS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"];
const DIAS_SHORT = ["LU", "MA", "MI", "JU", "VI"];

const HORAS: string[] = [];
for (let h = 7; h < 17; h++) {
  HORAS.push(`${String(h).padStart(2, "0")}:00`);
  HORAS.push(`${String(h).padStart(2, "0")}:15`);
  HORAS.push(`${String(h).padStart(2, "0")}:30`);
  HORAS.push(`${String(h).padStart(2, "0")}:45`);
}
// 07:00 - 17:00 boundary included
const PX_PER_SLOT = 18; // alto de cada bloque de 15 min
const START_MIN = 7 * 60;

const toMin = (h: string) => {
  if (!h) return 0;
  const [hh, mm] = h.split(":").map(Number);
  return hh * 60 + (mm || 0);
};

const minToStr = (m: number) => {
  const hh = Math.floor(m / 60).toString().padStart(2, "0");
  const mm = (m % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
};

// pixels from top for a given time string
const timeToTop = (t: string) => ((toMin(t) - START_MIN) / 15) * PX_PER_SLOT;
const timeToPx = (start: string, end: string) =>
  Math.max(((toMin(end) - toMin(start)) / 15) * PX_PER_SLOT, 1);

const TOTAL_H = (HORAS.length - 1) * PX_PER_SLOT;

const emptyBloque = (): Bloque => ({
  id: Date.now(),
  dia_semana: "Lunes",
  hora_inicio: "08:00",
  hora_fin: "09:00",
  aula: "",
});

const BLOCK_COLORS = [
  { bg: "#6366f1", border: "#4f46e5", text: "#e0e7ff" }, // Indigo
  { bg: "#10b981", border: "#059669", text: "#d1fae5" }, // Emerald
  { bg: "#f59e0b", border: "#d97706", text: "#fef3c7" }, // Amber
  { bg: "#3b82f6", border: "#2563eb", text: "#dbeafe" }, // Blue
  { bg: "#ec4899", border: "#db2777", text: "#fce7f3" }, // Pink
  { bg: "#8b5cf6", border: "#7c3aed", text: "#ede9fe" }, // Violet
  { bg: "#06b6d4", border: "#0891b2", text: "#cffafe" }, // Cyan
];

const getColor = (label: string) => {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % BLOCK_COLORS.length;
  return BLOCK_COLORS[index];
};

export default function ScheduleAssignment() {
  const [periodos, setPeriodos] = useState<PeriodoItem[]>([]);
  const [docentes, setDocentes] = useState<DocenteItem[]>([]);
  const [asignacionesDocente, setAsignacionesDocente] = useState<AsignacionDocente[]>([]);
  const [registrados, setRegistrados] = useState<ReporteRow[]>([]);

  const [idPeriodo, setIdPeriodo] = useState<string>("");
  const [idDocente, setIdDocente] = useState<string>("");
  const [idGrado, setIdGrado] = useState<string>("");
  const [idCurso, setIdCurso] = useState<string>("");
  const [bloques, setBloques] = useState<Bloque[]>([]);
  const [registradosGrado, setRegistradosGrado] = useState<ReporteRow[]>([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Estado de selección en el calendario
  // startSlot = índice del slot donde se hizo el PRIMER clic
  // hoverSlot = índice del slot donde está el mouse actualmente
  // Drag state
  const [dragState, setDragState] = useState<{
    id: number;
    dia: string;
    startSlot: number;
  } | null>(null);

  const [hoverSlot, setHoverSlot] = useState<number | null>(null);

  const pickState = dragState ? { ...dragState, hoverSlot: hoverSlot ?? dragState.startSlot } : null;

  useEffect(() => {
    const loadCatalogs = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/horario/catalogos");
        if (!data?.success) { setMessage({ text: "No se pudieron cargar catálogos.", isError: true }); return; }
        const payload = data.data || {};
        const periodosData: PeriodoItem[] = payload.periodos || [];
        setPeriodos(periodosData);
        setDocentes(payload.docentes || []);
        const activo = periodosData.find((p) => p.activo === 1);
        setIdPeriodo(activo ? String(activo.id) : periodosData.length > 0 ? String(periodosData[0].id) : "");
      } catch { setMessage({ text: "Error cargando catálogos.", isError: true }); }
      finally { setLoading(false); }
    };
    loadCatalogs();
  }, []);

  useEffect(() => {
    if (!idDocente || !idPeriodo) { setAsignacionesDocente([]); return; }
    setLoading(true);
    setMessage(null);
    api.get(`/horario/docente/${idDocente}/asignaciones`, { params: { id_periodo: idPeriodo } })
      .then(({ data }) => { setAsignacionesDocente(data?.success ? data.data || [] : []); })
      .catch((e) => { setAsignacionesDocente([]); setMessage({ text: e?.response?.data?.message || "Error al cargar asignaciones.", isError: true }); })
      .finally(() => { setLoading(false); setIdGrado(""); setIdCurso(""); });
  }, [idDocente, idPeriodo]);

  useEffect(() => {
    if (!idDocente || !idPeriodo) { setRegistrados([]); return; }
    api.get("/horario/reporte", { params: { id_docente: idDocente, id_periodo: idPeriodo } })
      .then(({ data }) => setRegistrados(data?.success ? data.data || [] : []))
      .catch(() => setRegistrados([]));
  }, [idDocente, idPeriodo]);

  useEffect(() => {
    if (!idGrado || !idPeriodo) { setRegistradosGrado([]); return; }
    api.get("/horario/reporte", { params: { id_grado: idGrado, id_periodo: idPeriodo } })
      .then(({ data }) => setRegistradosGrado(data?.success ? data.data || [] : []))
      .catch(() => setRegistradosGrado([]));
  }, [idGrado, idPeriodo]);

  const gradosDisponibles = useMemo(() => {
    const map = new Map<number, string>();
    asignacionesDocente.forEach(a => { if (!map.has(a.id_grado)) map.set(a.id_grado, a.grado); });
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [asignacionesDocente]);

  const cursosDisponibles = useMemo(() => {
    const filtered = idGrado ? asignacionesDocente.filter(a => String(a.id_grado) === idGrado) : asignacionesDocente;
    const map = new Map<number, string>();
    filtered.forEach(a => { if (!map.has(a.id_curso)) map.set(a.id_curso, a.curso); });
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [asignacionesDocente, idGrado]);

  const asignacionSeleccionada = useMemo(() => {
    if (!idGrado || !idCurso) return null;
    const matches = asignacionesDocente.filter(a => String(a.id_grado) === idGrado && String(a.id_curso) === idCurso);
    return matches.find(a => a.id_seccion === null) || matches[0] || null;
  }, [asignacionesDocente, idGrado, idCurso]);

  // Cargar bloques existentes cuando se selecciona una asignación
  useEffect(() => {
    if (asignacionSeleccionada) {
      const existing = registrados.filter(r => r.id_asignacion === asignacionSeleccionada.id_asignacion);
      if (existing.length > 0) {
        setBloques(existing.map(r => ({
          id: r.id_horario,
          dia_semana: r.dia_semana,
          hora_inicio: r.hora_inicio.slice(0, 5),
          hora_fin: r.hora_fin.slice(0, 5),
          aula: r.aula || "",
        })));
      } else {
        setBloques([]);
      }
    } else {
      setBloques([]);
    }
  }, [asignacionSeleccionada, registrados]);

  const updateBloque = (id: number, key: keyof Bloque, value: string) =>
    setBloques(prev => prev.map(b => b.id === id ? { ...b, [key]: value } : b));
  const addBloque = () => setBloques(prev => [...prev, emptyBloque()]);
  const removeBloque = (id: number) => setBloques(prev => prev.filter(b => b.id !== id));

  const formOk = Boolean(idPeriodo && idDocente && idGrado && idCurso && asignacionSeleccionada);

  const ocupados = useMemo(() => {
    if (!idPeriodo) return [];
    const all = [...registrados, ...registradosGrado];
    // Eliminar duplicados y el horario actual
    const unique = all.filter((r, i, self) =>
      self.findIndex(x => x.id_horario === r.id_horario) === i &&
      (!asignacionSeleccionada || r.id_asignacion !== asignacionSeleccionada.id_asignacion)
    );

    return unique.map(r => ({
      dia: r.dia_semana,
      horaInicio: r.hora_inicio,
      horaFin: r.hora_fin,
      curso: r.curso,
      grado: r.grado,
      docente: r.docente,
      isGradoConflict: String(r.id_grado) === idGrado,
      color: getColor(r.curso + r.grado)
    }));
  }, [registrados, registradosGrado, idGrado, idPeriodo, asignacionSeleccionada]);

  const conflicts = bloques.map((sl, index) => {
    if (!formOk || !asignacionSeleccionada) return null;
    const nS = toMin(sl.hora_inicio), nE = toMin(sl.hora_fin);
    // 1. Validar contra TODO lo ya registrado para este docente en la DB
    for (let i = 0; i < bloques.length; i++) {
      if (i === index) continue;
      const b = bloques[i];
      if (b.dia_semana === sl.dia_semana) {
        return { curso: "Este curso", grado: "ya tiene sesión asignada este día. Solo se permite una por día." } as any;
      }
    }

    // 2. Validar contra TODO lo ya registrado en la DB
    for (const r of [...registrados, ...registradosGrado]) {
      // Si es la misma asignación, validamos que no haya otra sesión el mismo día (que no sea la misma que estamos editando)
      if (asignacionSeleccionada && r.id_asignacion === asignacionSeleccionada.id_asignacion) {
        // En el formulario, r.id_horario es el ID de la base de datos. sl.id puede ser temporal o de DB.
        // Si el día es el mismo y no es el mismo bloque (comparando por hora inicio si el ID es nuevo)
        if (r.dia_semana === sl.dia_semana && r.id_horario !== sl.id) {
          return { curso: "Ya existe otra sesión", grado: `este día para este curso` } as any;
        }
        continue;
      }

      if (r.dia_semana !== sl.dia_semana) continue;

      const rS = toMin(r.hora_inicio), rE = toMin(r.hora_fin);
      const isOverlap = nS < rE && nE > rS;

      if (isOverlap) {
        // Conflicto de docente (registrados son del docente)
        if (registrados.find(x => x.id_horario === r.id_horario)) {
          return { curso: r.curso, grado: r.grado, docente: r.docente };
        }
        // Conflicto de grado (registradosGrado son del grado)
        // Validar si la sección choca (si r.id_seccion es nulo o el nuestro es nulo o son iguales)
        const mySec = asignacionSeleccionada.id_seccion;
        const oSec = r.id_seccion;
        if (!mySec || !oSec || mySec === oSec) {
          return { curso: r.curso, grado: r.grado, docente: r.docente };
        }
      }
    }
    return null;
  });

  const anyConflict = conflicts.some(Boolean);
  const anyBadDur = bloques.some(s => toMin(s.hora_fin) <= toMin(s.hora_inicio));
  const isFormValid = formOk && bloques.length > 0 && !anyConflict && !anyBadDur;

  const handleSlotMouseDown = (dia: string, hora: string) => {
    // 0. Prevent recess overlap
    if (toMin(hora) >= toMin("11:00") && toMin(hora) < toMin("11:30")) {
      return;
    }

    // 1. No permitir si ya hay un bloque para este curso HOY (Regla: una por día)
    if (bloques.some(b => b.dia_semana === dia)) {
      setMessage({ text: `Ya hay una sesión asignada para el ${dia}. Borre la anterior si desea cambiarla.`, isError: true });
      return;
    }

    // 2. No permitir clic si el docente ya tiene clase a esa hora (en cualquier curso/grado)
    const isOcupadoGlobal = ocupados.some(o =>
      o.dia === dia &&
      toMin(o.horaInicio) <= toMin(hora) &&
      toMin(hora) < toMin(o.horaFin)
    );
    if (isOcupadoGlobal) return;

    const si = HORAS.indexOf(hora);
    const newId = Date.now();

    // Create block with 15-min initial duration
    const horaFin = HORAS[si + 1] ?? minToStr(toMin(hora) + 15);

    setBloques(prev => [...prev, {
      id: newId,
      dia_semana: dia,
      hora_inicio: hora,
      hora_fin: horaFin,
      aula: "",
    }]);

    setDragState({ id: newId, dia, startSlot: si });
    setHoverSlot(si);
  };

  const handleSlotMouseEnter = (dia: string, hora: string) => {
    if (!dragState || dia !== dragState.dia) return;
    const si = HORAS.indexOf(hora);
    // Ensure we don't select backwards
    const currentSi = si < dragState.startSlot ? dragState.startSlot : si;
    setHoverSlot(currentSi);

    // Update the block's end time in real-time as we drag
    let newFin = HORAS[currentSi + 1] ?? minToStr(toMin(HORAS[currentSi]) + 15);
    const startTime = HORAS[dragState.startSlot];

    // Constrain to not cross the recess
    if (toMin(startTime) <= toMin("11:00") && toMin(newFin) > toMin("11:00")) {
      newFin = "11:00";
    }

    setBloques(prev => prev.map(b =>
      b.id === dragState.id ? { ...b, hora_fin: newFin } : b
    ));
  };

  const handleMouseUp = () => {
    setDragState(null);
    setHoverSlot(null);
  };

  const handleSave = async () => {
    if (!isFormValid || !asignacionSeleccionada) {
      setMessage({ text: "Selecciona docente, período, grado y curso válidos.", isError: true });
      return;
    }
    setLoading(true); setMessage(null);
    try {
      const payload = {
        id_asignacion: asignacionSeleccionada.id_asignacion,
        bloques: bloques.map(b => ({
          dia_semana: b.dia_semana,
          hora_inicio: b.hora_inicio.length === 5 ? `${b.hora_inicio}:00` : b.hora_inicio,
          hora_fin: b.hora_fin.length === 5 ? `${b.hora_fin}:00` : b.hora_fin,
          aula: b.aula || null,
        })),
      };
      const { data: res } = await api.post("/horario", payload);
      if (res?.success) {
        setMessage({ text: "Horario guardado correctamente.", isError: false });
        // Refrescar disponibilidad de docente y grado
        const [resDoc, resGrad] = await Promise.all([
          api.get("/horario/reporte", { params: { id_docente: idDocente, id_periodo: idPeriodo } }),
          api.get("/horario/reporte", { params: { id_grado: idGrado, id_periodo: idPeriodo } })
        ]);
        if (resDoc.data?.success) setRegistrados(resDoc.data.data || []);
        if (resGrad.data?.success) setRegistradosGrado(resGrad.data.data || []);
      } else {
        setMessage({ text: res?.message || "No se pudo guardar.", isError: true });
      }
    } catch (e: any) {
      setMessage({ text: e?.response?.data?.message || "Error al guardar.", isError: true });
    } finally { setLoading(false); }
  };

  const handleDeleteHorario = async (idHorario: number) => {
    setDeletingId(idHorario);
    setMessage(null);
    try {
      const { data: res } = await api.delete(`/horario/${idHorario}`);
      if (res?.success) {
        setMessage({ text: "Bloque eliminado correctamente.", isError: false });
        // Refrescar registros
        const [resDoc, resGrad] = await Promise.all([
          api.get("/horario/reporte", { params: { id_docente: idDocente, id_periodo: idPeriodo } }),
          api.get("/horario/reporte", { params: { id_grado: idGrado, id_periodo: idPeriodo } })
        ]);
        if (resDoc.data?.success) setRegistrados(resDoc.data.data || []);
        if (resGrad.data?.success) setRegistradosGrado(resGrad.data.data || []);
      } else {
        setMessage({ text: res?.message || "No se pudo eliminar.", isError: true });
      }
    } catch (e: any) {
      setMessage({ text: e?.response?.data?.message || "Error al eliminar.", isError: true });
    } finally { setDeletingId(null); }
  };

  return (
    <div className="min-h-screen bg-slate-50" onMouseUp={handleMouseUp}>
      <div className="grid min-h-screen grid-cols-[340px_1fr]">

        <div className="flex flex-col gap-3 overflow-y-auto border-r border-slate-200 bg-white px-4 py-6">
          <div>
            <h1 className="text-base font-extrabold text-slate-900">Nuevo Horario</h1>
            <p className="text-xs text-slate-500">Configure los datos y agregue sesiones semanales</p>
          </div>

          <Seccion titulo="Datos generales">
            <div className="grid grid-cols-[64px_1fr] items-center gap-x-2 gap-y-1.5">
              <Etiqueta obligatorio>Docente</Etiqueta>
              <SelectCompacto value={idDocente} onChange={setIdDocente}>
                <option value="">[ Seleccione ]</option>
                {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre_completo}</option>)}
              </SelectCompacto>

              <Etiqueta obligatorio>Período</Etiqueta>
              <SelectCompacto value={idPeriodo} onChange={setIdPeriodo}>
                {periodos.map(p => <option key={p.id} value={p.id}>{p.anio}</option>)}
              </SelectCompacto>

              <Etiqueta obligatorio>Grado</Etiqueta>
              <SelectCompacto value={idGrado} onChange={setIdGrado} disabled={!idDocente}>
                <option value="">[ Seleccione ]</option>
                {gradosDisponibles.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
              </SelectCompacto>

              <Etiqueta obligatorio>Curso</Etiqueta>
              <SelectCompacto value={idCurso} onChange={setIdCurso} disabled={!idGrado}>
                <option value="">[ Seleccione ]</option>
                {cursosDisponibles.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </SelectCompacto>
            </div>
          </Seccion>

          <Seccion
            titulo="Sesiones del horario"
            extra={
              <span className="rounded-[5px] bg-blue-600 px-1.5 text-[10.5px] font-bold leading-4 text-white">
                {bloques.length}
              </span>
            }
          >
            {bloques.length === 0 ? (
              <div className="flex flex-col items-center gap-1.5 py-5 text-xs text-slate-400">
                <Calendar className="h-4 w-4 text-slate-300" />
                Sin sesiones. Agregue una o arrastre sobre el calendario.
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto">
                <div className="grid grid-cols-[1fr_66px_66px_52px_28px] gap-x-1 px-0.5 pb-1 text-[10.5px] font-semibold text-slate-500">
                  <span>Día</span>
                  <span>Inicio</span>
                  <span>Fin</span>
                  <span>Aula</span>
                  <span />
                </div>
                <div className="flex flex-col gap-1">
                  {bloques.map((sl, i) => {
                    const conf = conflicts[i];
                    const conBordeError = conf ? claseInput.replace("border-slate-300", "border-red-500") : claseInput;
                    return (
                      <div key={sl.id}>
                        <div className="grid grid-cols-[1fr_66px_66px_52px_28px] items-center gap-x-1">
                          <div className="relative">
                            <select
                              value={sl.dia_semana}
                              onChange={e => updateBloque(sl.id, "dia_semana", e.target.value)}
                              className={`${conBordeError} appearance-none pr-5 cursor-pointer`}
                            >
                              {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <ChevronDown size={12} className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-slate-400" />
                          </div>
                          <input
                            type="time"
                            value={sl.hora_inicio}
                            onChange={e => updateBloque(sl.id, "hora_inicio", e.target.value)}
                            className={`${conBordeError} !px-1`}
                          />
                          <input
                            type="time"
                            value={sl.hora_fin}
                            onChange={e => updateBloque(sl.id, "hora_fin", e.target.value)}
                            className={`${conBordeError} !px-1`}
                          />
                          <input
                            type="text"
                            value={sl.aula}
                            maxLength={50}
                            placeholder="—"
                            onChange={e => updateBloque(sl.id, "aula", e.target.value.toUpperCase())}
                            className={conBordeError}
                          />
                          <button
                            type="button"
                            onClick={() => removeBloque(sl.id)}
                            title="Quitar sesión"
                            className="flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-[5px] text-red-500 hover:bg-red-50"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        {conf && (
                          <p className="mt-0.5 text-[10.5px] font-semibold text-red-600">⚠ {conf.curso} {conf.grado}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-2.5 flex gap-2">
              <button
                type="button"
                onClick={addBloque}
                className="flex h-[28px] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[5px] border border-slate-300 bg-white text-[11px] font-bold uppercase tracking-wide text-slate-600 hover:bg-slate-50"
              >
                <Plus size={13} strokeWidth={2.5} /> Agregar sesión
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!isFormValid || loading}
                className="flex h-[28px] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[5px] bg-blue-600 text-[11px] font-bold uppercase tracking-wide text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              >
                {loading ? <Loader2 size={13} className="animate-spin" /> : <><Save size={13} strokeWidth={2.5} /> Guardar</>}
              </button>
            </div>
          </Seccion>

          {message && (
            <div className={`rounded-[5px] border px-2.5 py-2 text-xs font-semibold ${message.isError ? "border-red-200 bg-red-50 text-red-600" : "border-green-200 bg-green-50 text-green-700"}`}>
              {message.text}
            </div>
          )}
        </div>

        <div className="min-w-0 px-4 py-6">
          <div className="rounded-md border border-slate-300 bg-white">

            {/* Cabecera del calendario */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] bg-blue-100 text-blue-600">
                  <Calendar size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-[13px] font-extrabold text-slate-900">
                    {!idDocente ? "Seleccione un docente" : docentes.find(d => String(d.id) === idDocente)?.nombre_completo}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Vista semanal · Período {periodos.find(p => String(p.id) === idPeriodo)?.anio || "2026"}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {[
                  { clase: "bg-emerald-100 border-emerald-500", label: "Docente ocupado" },
                  { clase: "bg-amber-100 border-amber-500", label: "Grado ocupado" },
                  { clase: "bg-blue-100 border-blue-500", label: "Nueva sesión" },
                  { clase: "bg-red-100 border-red-500", label: "Conflicto" },
                ].map(({ clase, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <span className={`h-2.5 w-2.5 rounded-[3px] border-l-[3px] ${clase}`} />
                    <span className="text-[11px] font-medium text-slate-600">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex h-7 items-center gap-1.5 border-b border-slate-100 px-3 text-[11px] text-slate-500">
              <Check size={12} />
              {pickState
                ? "Suelte para confirmar la sesión"
                : formOk
                  ? "Haga clic y arrastre sobre un día para crear una sesión"
                  : "Seleccione docente, grado y curso para crear sesiones"}
            </div>

            {/* Calendario */}
            <div className="max-h-[62vh] overflow-y-auto select-none">
              <div className="sticky top-0 z-10 flex border-b border-slate-200 bg-slate-50">
                <div className="w-12 shrink-0" />
                {DIAS.map((dia, di) => (
                  <div key={dia} className="flex-1 border-l border-slate-200 py-1.5 text-center">
                    <div className="text-[11px] font-bold text-slate-700">{dia === "Miercoles" ? "Miércoles" : dia}</div>
                    <div className="text-[10px] font-semibold text-slate-400">{DIAS_SHORT[di]}</div>
                  </div>
                ))}
              </div>

              <div className="flex">
                {/* Eje de horas */}
                <div className="relative w-12 shrink-0" style={{ height: TOTAL_H }}>
                  {HORAS.map((h, hi) => (
                    (h.endsWith(":00") || h.endsWith(":30")) && hi < HORAS.length - 1 && (
                      <div
                        key={h}
                        className={`absolute right-1.5 font-mono text-[10px] ${h.endsWith(":00") ? "font-bold text-slate-600" : "text-slate-400"}`}
                        style={{ top: timeToTop(h) - 6 }}
                      >
                        {h}
                      </div>
                    )
                  ))}
                </div>

                {/* Columnas por día */}
                <div className="grid flex-1 grid-cols-5">
                  {DIAS.map((dia) => {
                    const dayOcupados = ocupados.filter(o => o.dia === dia);
                    const dayNuevos = formOk ? bloques.filter(b => b.dia_semana === dia) : [];

                    return (
                      <div key={dia} className="relative border-l border-slate-200" style={{ height: TOTAL_H }}>
                        {/* Bloques de 15 min: se arrastra sobre ellos */}
                        {HORAS.slice(0, -1).map((h) => (
                          <div
                            key={h}
                            className={`absolute left-0 right-0 border-b ${formOk ? "cursor-pointer hover:bg-blue-50" : ""} ${h.endsWith(":45") ? "border-slate-200" : "border-dashed border-slate-100"}`}
                            style={{ top: timeToTop(h), height: PX_PER_SLOT }}
                            onMouseDown={() => {
                              const iso = dayOcupados.some(o => toMin(o.horaInicio) <= toMin(h) && toMin(h) < toMin(o.horaFin));
                              if (!iso) handleSlotMouseDown(dia, h);
                            }}
                            onMouseEnter={() => handleSlotMouseEnter(dia, h)}
                          />
                        ))}

                        {/* Recreo */}
                        <div
                          className="pointer-events-none absolute left-0 right-0 z-[1] flex items-center justify-center border-y border-slate-300 bg-[repeating-linear-gradient(135deg,#f1f5f9_0,#f1f5f9_6px,#e2e8f0_6px,#e2e8f0_12px)]"
                          style={{ top: timeToTop("11:00"), height: timeToPx("11:00", "11:30") }}
                        >
                          <span className="text-[10px] font-bold tracking-[0.3em] text-slate-500">RECREO</span>
                        </div>

                        {/* Ocupados: del docente (verde) o del grado (ámbar) */}
                        {dayOcupados.map((o, oi) => (
                          <div
                            key={oi}
                            className={`pointer-events-none absolute left-1 right-1 z-[1] overflow-hidden rounded-[5px] border-l-[3px] px-1.5 py-0.5 ${o.isGradoConflict ? "border-amber-500 bg-amber-100 text-amber-800" : "border-emerald-500 bg-emerald-100 text-emerald-800"}`}
                            style={{ top: timeToTop(o.horaInicio) + 1, height: timeToPx(o.horaInicio, o.horaFin) - 2 }}
                            title={`${o.curso} · ${o.grado} · ${o.docente}`}
                          >
                            <div className="truncate text-[10px] font-bold uppercase">{o.curso}</div>
                            <div className="truncate text-[9.5px]">{o.grado} · {o.horaInicio.slice(0, 5)}-{o.horaFin.slice(0, 5)}</div>
                          </div>
                        ))}

                        {/* Sesiones nuevas */}
                        {dayNuevos.map((b) => {
                          const conf = conflicts[bloques.indexOf(b)];
                          return (
                            <div
                              key={b.id}
                              className={`pointer-events-none absolute left-1 right-1 z-[2] overflow-hidden rounded-[5px] border-l-[3px] px-1.5 py-0.5 shadow-sm ${conf ? "border-red-500 bg-red-100 text-red-800" : "border-blue-500 bg-blue-100 text-blue-800"}`}
                              style={{ top: timeToTop(b.hora_inicio) + 1, height: timeToPx(b.hora_inicio, b.hora_fin) - 2 }}
                            >
                              <div className="truncate text-[10px] font-bold uppercase">
                                {conf ? "Conflicto" : cursosDisponibles.find(c => String(c.id) === idCurso)?.nombre || "Nueva sesión"}
                              </div>
                              <div className="font-mono text-[9.5px]">{b.hora_inicio}-{b.hora_fin}</div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Horarios registrados del docente */}
          <fieldset className="mt-3 rounded-md border border-slate-300 bg-white p-2.5">
            <legend className="px-1 text-xs font-semibold text-slate-700">Horarios registrados del docente</legend>

            {registrados.length === 0 ? (
              <p className="py-2 text-xs text-slate-400">No hay registros previos para este período.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-left text-[11px] font-semibold text-slate-600">
                      {["Grado", "Curso", "Día", "Inicio", "Fin", "Aula", ""].map(h => (
                        <th key={h} className="px-2 py-1">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {registrados.map((r) => (
                      <tr key={r.id_horario} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-2 py-1 font-semibold text-slate-700">{r.grado}</td>
                        <td className="px-2 py-1 text-slate-700">{r.curso}</td>
                        <td className="px-2 py-1 text-slate-700">{r.dia_semana === "Miercoles" ? "Miércoles" : r.dia_semana}</td>
                        <td className="px-2 py-1 font-mono text-slate-700">{r.hora_inicio.slice(0, 5)}</td>
                        <td className="px-2 py-1 font-mono text-slate-700">{r.hora_fin.slice(0, 5)}</td>
                        <td className="px-2 py-1 text-slate-500">{r.aula || "—"}</td>
                        <td className="px-2 py-1 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteHorario(r.id_horario)}
                            disabled={deletingId === r.id_horario}
                            title="Eliminar bloque"
                            className="inline-flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-[5px] text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === r.id_horario
                              ? <Loader2 size={12} className="animate-spin" />
                              : <Trash2 size={13} />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </fieldset>
        </div>
      </div>
    </div>
  );
}
