import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import { Calendar, Check, Loader2, Plus, Save, Trash2 } from "lucide-react";

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
const PX_PER_SLOT = 22; // Aumentado para mejor visibilidad
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

  const sel: React.CSSProperties = { width: "100%", appearance: "none", background: "#f9fafb", border: "1px solid #e2e8f0", color: "#1e293b", fontSize: "14px", fontWeight: 600, borderRadius: "12px", padding: "12px 16px", outline: "none", cursor: "pointer", boxSizing: "border-box", transition: "all 0.2s" };
  const inp: React.CSSProperties = { ...sel };
  const lbl: React.CSSProperties = { fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", marginBottom: "6px", display: "block" };
  const card: React.CSSProperties = { background: "#fff", border: "1px solid #f1f5f9", borderRadius: "24px", padding: "24px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)" };

  return (
    <div style={{ minHeight: "100vh", background: "#fcfcfc", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }} onMouseUp={handleMouseUp}>
      <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", minHeight: "100vh" }}>

        <div style={{ borderRight: "1px solid #f1f5f9", padding: "40px 32px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 32 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>Nuevo Horario</h1>
            <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#64748b" }}>Configure los datos y agregue sesiones semanales</p>
          </div>

          {/* Card 1: Datos Generales */}
          <div style={card}>
            <p style={{ margin: "0 0 20px", fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8" }}>DATOS GENERALES</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={lbl}>DOCENTE <span style={{ color: "#ef4444" }}>*</span></label>
                <select value={idDocente} onChange={e => setIdDocente(e.target.value)} style={sel}>
                  <option value="">Seleccionar</option>
                  {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre_completo}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={lbl}>PERÍODO <span style={{ color: "#ef4444" }}>*</span></label>
                  <select value={idPeriodo} onChange={e => setIdPeriodo(e.target.value)} style={sel}>
                    {periodos.map(p => <option key={p.id} value={p.id}>{p.anio}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>GRADO <span style={{ color: "#ef4444" }}>*</span></label>
                  <select value={idGrado} onChange={e => setIdGrado(e.target.value)} style={sel} disabled={!idDocente}>
                    <option value="">Seleccionar</option>
                    {gradosDisponibles.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={lbl}>CURSO <span style={{ color: "#ef4444" }}>*</span></label>
                <select value={idCurso} onChange={e => setIdCurso(e.target.value)} style={sel} disabled={!idGrado}>
                  <option value="">Seleccionar</option>
                  {cursosDisponibles.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Sesiones */}
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <p style={{ margin: 0, fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8" }}>SESIONES DEL HORARIO</p>
              <span style={{ fontSize: "12px", fontWeight: 800, color: "#fff", background: "#3b82f6", width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{bloques.length}</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 300, overflowY: "auto", paddingRight: 4 }}>
              {bloques.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <div style={{ width: 40, height: 40, background: "#f8fafc", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                    <Calendar className="w-5 h-5 text-slate-300" />
                  </div>
                  <p style={{ fontSize: "13px", color: "#94a3b8" }}>Sin sesiones agregadas</p>
                </div>
              ) : (
                bloques.map((sl, i) => {
                  const conf = conflicts[i];
                  return (
                    <div key={sl.id} style={{ padding: 12, border: "1px solid #f1f5f9", borderRadius: 16, background: conf ? "#fff1f2" : "#fff" }}>
                      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <select value={sl.dia_semana} onChange={e => updateBloque(sl.id, "dia_semana", e.target.value)} style={{ ...sel, padding: "8px 12px", fontSize: 13, background: "#fff" }}>
                          {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <button onClick={() => removeBloque(sl.id)} style={{ color: "#ef4444", background: "#fef2f2", border: "none", borderRadius: 8, padding: "0 10px", cursor: "pointer" }}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <input type="time" value={sl.hora_inicio} onChange={e => updateBloque(sl.id, "hora_inicio", e.target.value)} style={{ ...inp, padding: "8px 12px", fontSize: 13, background: "#fff" }} />
                        <input type="time" value={sl.hora_fin} onChange={e => updateBloque(sl.id, "hora_fin", e.target.value)} style={{ ...inp, padding: "8px 12px", fontSize: 13, background: "#fff" }} />
                      </div>
                      {conf && (
                        <p style={{ margin: "8px 0 0", fontSize: "11px", color: "#ef4444", fontWeight: 700 }}>⚠ {conf.curso}</p>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 24 }}>
              <button onClick={addBloque} style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: "14px", fontWeight: 700, color: "#475569", cursor: "pointer" }}>
                <Plus className="w-4 h-4" /> Agregar sesión
              </button>
              <button onClick={handleSave} disabled={!isFormValid || loading}
                style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: isFormValid ? "#2563eb" : "#e2e8f0", color: "#fff", border: "none", borderRadius: 12, fontSize: "14px", fontWeight: 700, cursor: isFormValid ? "pointer" : "not-allowed" }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Guardar horario</>}
              </button>
            </div>
          </div>

          {message && (
            <div style={{ padding: 12, borderRadius: 12, fontSize: 13, fontWeight: 600, background: message.isError ? "#fef2f2" : "#f0fdf4", color: message.isError ? "#ef4444" : "#16a34a", border: `1px solid ${message.isError ? "#fecaca" : "#bbf7d0"}` }}>
              {message.text}
            </div>
          )}
        </div>

        <div style={{ padding: "40px", background: "#f8fafc" }}>

          <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: "28px", padding: "28px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.03)" }}>

            {/* Calendar Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 24 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ width: 44, height: 44, background: "#000", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#0f172a" }}>
                    {!idDocente ? "Seleccione un docente" : docentes.find(d => String(d.id) === idDocente)?.nombre_completo}
                  </h2>
                  <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8", fontWeight: 500 }}>
                    Vista semanal · Período {periodos.find(p => String(p.id) === idPeriodo)?.anio || "2026"}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 16 }}>
                {[
                  { color: "#cbd5e1", label: "Ocupado" },
                  { color: "#10b981", label: "Nuevo" },
                  { color: "#ef4444", label: "Conflicto" },
                ].map(({ color, label }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 10, height: 10, background: color, borderRadius: "50%" }} />
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: "8px 0", borderTop: "1px solid #f1f5f9", marginBottom: 12 }}>
              <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: 8 }}>
                <Check className="w-3.5 h-3.5" /> {pickState ? "Suelte para confirmar" : ""}
              </p>
            </div>

            {/* Calendar Grid Wrapper */}
            <div style={{ background: "linear-gradient(to right, #fcfcfc, #fff)", border: "1px solid #f1f5f9", borderRadius: "16px", overflow: "hidden" }}>
              <div style={{ overflowY: "auto", maxHeight: "60vh", position: "relative" }}>

                {/* Headers */}
                <div style={{ display: "flex", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, zIndex: 10, background: "#fff" }}>
                  <div style={{ width: 60, flexShrink: 0 }} />
                  {DIAS.map((dia, di) => (
                    <div key={dia} style={{ flex: 1, padding: "12px 10px", textAlign: "center", borderLeft: "1px solid #e2e8f0" }}>
                      <p style={{ margin: 0, fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>{dia.slice(0, 3)}</p>
                      <p style={{ margin: "2px 0 0", fontSize: "14px", fontWeight: 800, color: "#1e293b" }}>{DIAS_SHORT[di]}</p>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex" }}>
                  {/* Axis */}
                  <div style={{ width: 60, flexShrink: 0, position: "relative", height: TOTAL_H, borderRight: "1px solid #e2e8f0" }}>
                    {HORAS.map((h, hi) => (
                      (h.endsWith(":00") || h.endsWith(":30")) && hi < HORAS.length - 1 && (
                        <div key={h} style={{ position: "absolute", top: timeToTop(h) - 7, left: 0, right: 8, display: "flex", justifyContent: "flex-end", fontSize: "11px", fontWeight: 700, color: "#64748b" }}>{h}</div>
                      )
                    ))}
                  </div>

                  {/* Columns */}
                  <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", background: "#fff" }}>
                    {DIAS.map((dia) => {
                      const dayOcupados = ocupados.filter(o => o.dia === dia);
                      const dayNuevos = formOk ? bloques.filter(b => b.dia_semana === dia) : [];

                      return (
                        <div key={dia} style={{ position: "relative", borderLeft: "1px solid #1A1818" }}>
                          {/* Grid Lines */}
                          {HORAS.map((h, i) => (
                            <div key={h} style={{ position: "absolute", top: timeToTop(h), left: 0, right: 0, height: PX_PER_SLOT, borderBottom: i % 2 === 0 ? "1px dashed #1A1818" : "1px solid #1A1818", zIndex: 0 }}
                              onMouseDown={() => {
                                const iso = dayOcupados.some(o => toMin(o.horaInicio) <= toMin(h) && toMin(h) < toMin(o.horaFin));
                                if (!iso) handleSlotMouseDown(dia, h);
                              }}
                              onMouseEnter={() => handleSlotMouseEnter(dia, h)} />
                          ))}

                          {/* Ocupados */}
                          {dayOcupados.map((o, oi) => {
                            const top = timeToTop(o.horaInicio);
                            const height = timeToPx(o.horaInicio, o.horaFin);
                            return (
                              <div key={oi} style={{ position: "absolute", top, left: 6, right: 6, height: height - 2, background: o.isGradoConflict ? "#fef3c7" : "#dcfce7", borderLeft: `4px solid ${o.isGradoConflict ? "#f59e0b" : "#10b981"}`, borderRadius: "4px 8px 8px 4px", zIndex: 1, padding: "4px 8px", pointerEvents: "none", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                                <p style={{ margin: 0, fontSize: "9px", fontWeight: 800, color: o.isGradoConflict ? "#92400e" : "#065f46", textTransform: "uppercase", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{o.curso}</p>
                                <p style={{ margin: "1px 0", fontSize: "8px", fontWeight: 600, color: o.isGradoConflict ? "#b45309" : "#059669" }}>{o.grado}</p>
                                <p style={{ margin: 0, fontSize: "8px", opacity: 0.8, color: "inherit" }}>{o.horaInicio}-{o.horaFin}</p>
                              </div>
                            );
                          })}

                          {/* Recreo visual block */}
                          <div
                            style={{
                              position: "absolute",
                              top: timeToTop("11:00"),
                              height: timeToPx("11:00", "11:30"),
                              left: 0,
                              right: 0,
                              background: "#180469",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              zIndex: 1,
                              borderTop: "1px solid #e2e8f0",
                              borderBottom: "1px solid #e2e8f0",
                              pointerEvents: "none"
                            }}
                          >
                            {dia === "Miercoles" && (
                              <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "1em", color: "#cbd5e1" }}>RECREO</span>
                            )}
                          </div>

                          {/* Nuevos */}
                          {dayNuevos.map((b) => {
                            const top = timeToTop(b.hora_inicio);
                            const height = timeToPx(b.hora_inicio, b.hora_fin);
                            const conf = conflicts[bloques.indexOf(b)];
                            return (
                              <div key={b.id} style={{ position: "absolute", top, left: 4, right: 4, height: height - 2, background: conf ? "#fee2e2" : "#eff6ff", borderLeft: `4px solid ${conf ? "#ef4444" : "#3b82f6"}`, borderRadius: "4px 8px 8px 4px", zIndex: 2, padding: "6px 8px", pointerEvents: "none", boxShadow: "0 4px 12px rgba(59,130,246,0.1)" }}>
                                <p style={{ margin: 0, fontSize: "10px", fontWeight: 900, color: conf ? "#991b1b" : "#1e40af" }}>{conf ? "CONF" : idCurso ? cursosDisponibles.find(c => String(c.id) === idCurso)?.nombre?.slice(0, 10) : "NUEVO"}</p>
                                <p style={{ margin: 0, fontSize: "9px", fontWeight: 600, color: conf ? "#ef4444" : "#3b82f6" }}>{b.hora_inicio}-{b.hora_fin}</p>
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

            {/* Bottom: Clases Registradas */}
            <div style={{ marginTop: 28, borderTop: "1px solid #f1f5f9", paddingTop: 20 }}>
              <p style={{ margin: "0 0 16px", fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8" }}>HORARIOS REGISTRADOS DEL DOCENTE</p>

              {registrados.length === 0 ? (
                <p style={{ margin: 0, fontSize: 13, color: "#cbd5e1", fontStyle: "italic" }}>No hay registros previos para este período</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                        {["Grado", "Curso", "Día", "Inicio", "Fin", "Aula", ""].map(h => (
                          <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700, color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {registrados.map((r, i) => (
                        <tr key={r.id_horario} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fcfcfc" }}>
                          <td style={{ padding: "8px 12px", color: "#334155", fontWeight: 600 }}>{r.grado}</td>
                          <td style={{ padding: "8px 12px", color: "#334155" }}>{r.curso}</td>
                          <td style={{ padding: "8px 12px", color: "#334155" }}>{r.dia_semana}</td>
                          <td style={{ padding: "8px 12px", color: "#334155", fontFamily: "monospace" }}>{r.hora_inicio.slice(0, 5)}</td>
                          <td style={{ padding: "8px 12px", color: "#334155", fontFamily: "monospace" }}>{r.hora_fin.slice(0, 5)}</td>
                          <td style={{ padding: "8px 12px", color: "#94a3b8" }}>{r.aula || "—"}</td>
                          <td style={{ padding: "8px 12px" }}>
                            <button
                              onClick={() => handleDeleteHorario(r.id_horario)}
                              disabled={deletingId === r.id_horario}
                              title="Eliminar bloque"
                              style={{
                                display: "flex", alignItems: "center", justifyContent: "center",
                                width: 28, height: 28, background: "#fef2f2", border: "1px solid #fecaca",
                                borderRadius: 6, cursor: deletingId === r.id_horario ? "not-allowed" : "pointer",
                                color: "#ef4444", opacity: deletingId === r.id_horario ? 0.5 : 1,
                              }}
                            >
                              {deletingId === r.id_horario
                                ? <Loader2 style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} />
                                : <Trash2 style={{ width: 12, height: 12 }} />}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}