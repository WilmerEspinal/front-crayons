import { useState, useMemo, useEffect } from "react";
import api from "@/lib/axios";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CheckCircle2, AlertTriangle, X, AlertCircle } from "lucide-react";

const estadoBadge = (estado: string) => {
  if (estado?.toLowerCase() === "activo") return { label: "Activo", bg: "#e8f5e9", color: "#2e7d32" };
  if (estado?.toLowerCase() === "egresado") return { label: "Egresado", bg: "#fff3e0", color: "#e65100" };
  if (estado?.toLowerCase() === "inactivo") return { label: "Sin acceso", bg: "#fce4ec", color: "#c62828" };
  if (estado?.toLowerCase() === "promovido") return { label: "Promovido", bg: "#eff6ff", color: "#2563eb" };
  return { label: estado, bg: "#f5f5f5", color: "#555" };
};

interface Alumno {
  id_matricula: number;
  nombre_completo: string;
  seccion: string;
  promedio: string | number;
  estado: string;
  alumno_estado: string;
  puede_promover: boolean;
  grado?: string;
}

interface Grado {
  id: number;
  nombre: string;
  numero_grado: number;
}

interface Periodo {
  id: number;
  anio: number;
  activo: number;
}

interface HistorialItem {
  fecha: string;
  tipo: string;
  alumnos: (string | undefined)[];
  de: string;
  a: string | null;
}

export default function PromocionAlumnos() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [gradoOrigenId, setGradoOrigenId] = useState<string>("");
  const [seccionFiltro, setSeccionFiltro] = useState<string>("Todas");
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [periodoActual, setPeriodoActual] = useState<Periodo | null>(null);
  const [periodoSiguiente, setPeriodoSiguiente] = useState<Periodo | null>(null);
  const [todoPeriodos, setTodoPeriodos] = useState<Periodo[]>([]);
  const [confirmando, setConfirmando] = useState<string | null>(null); // null | "seleccion" | "grado" | "egreso" | "individual"
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [tab, setTab] = useState<string>("promover"); // "promover" | "historial" | "egresados"

  const [esUltimoGrado, setEsUltimoGrado] = useState<boolean>(false);
  const [nombreGradoActual, setNombreGradoActual] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [idIndividual, setIdIndividual] = useState<number | null>(null);

  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; description: string; type: "success" | "danger" | "warning" | "info" }>({
    isOpen: false, title: "", description: "", type: "info"
  });

  const showAlert = (title: string, description: string, type: "success" | "danger" | "warning" | "info" = "info") => {
    setAlertModal({ isOpen: true, title, description, type });
  };

  // Cargar Catálogos (Grados y Periodos)
  useEffect(() => {
    const fetchCatalogos = async () => {
      try {
        const [gradosRes, catalogoRes] = await Promise.all([
          api.get("/grado/lista-grado"),
          api.get("/horario/catalogos")
        ]);

        if (gradosRes.data.status) {
          setGrados(gradosRes.data.data);
          if (gradosRes.data.data.length > 0) {
            setGradoOrigenId(String(gradosRes.data.data[0].id));
          }
        }

        if (catalogoRes.data.success) {
          const rawPeriodos: Periodo[] = catalogoRes.data.data.periodos || [];
          const ordenados = [...rawPeriodos].sort((a, b) => a.anio - b.anio);
          setTodoPeriodos(ordenados);

          const actual = ordenados.find((p: Periodo) => p.activo === 1);
          if (actual) {
            setPeriodoActual(actual);
            const idx = ordenados.findIndex(p => p.id === actual.id);
            setPeriodoSiguiente(ordenados[idx + 1] || null);
          }
        }
      } catch (error) {
      }
    };
    fetchCatalogos();
  }, []);

  // Cargar Alumnos del Grado seleccionado
  const fetchAlumnosGrado = async () => {
    if (!gradoOrigenId || !periodoActual) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/promocion/alumnos-estado`, {
        params: {
          periodId: periodoActual.id,
          gradoId: gradoOrigenId
        }
      });

      if (data.status) {
        setAlumnos(data.data || []);
        setEsUltimoGrado(data.esUltimoGrado);
        setNombreGradoActual(data.nombreGrado);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumnosGrado();
  }, [gradoOrigenId, periodoActual]);

  const gradoDestinoNombre = useMemo(() => {
    if (esUltimoGrado) return null;
    const currentIdx = grados.findIndex(g => String(g.id) === gradoOrigenId);
    if (currentIdx !== -1 && currentIdx < grados.length - 1) {
      return grados[currentIdx + 1].nombre;
    }
    return "Siguiente Grado";
  }, [gradoOrigenId, grados, esUltimoGrado]);

  const alumnosFiltrados = useMemo(() => {
    return alumnos.filter(
      (a) => {
        const matchesSeccion = seccionFiltro === "Todas" || a.seccion === seccionFiltro;
        // En la pestaña promover, solo mostramos los que no han sido procesados (Promovido)
        const isNotProcessed = a.estado !== "Promovido";
        return matchesSeccion && isNotProcessed;
      }
    );
  }, [alumnos, seccionFiltro]);

  const secciones = useMemo(() => {
    const s = [...new Set(alumnos.map((a) => a.seccion))];
    return ["Todas", ...s.sort()];
  }, [alumnos]);

  const egresados = useMemo(() => alumnos.filter((a) => a.alumno_estado?.toLowerCase() === "egresado"), [alumnos]);

  const toggleSeleccion = (id: number) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleTodos = () => {
    if (seleccionados.length === alumnosFiltrados.length) {
      setSeleccionados([]);
    } else {
      setSeleccionados(alumnosFiltrados.map((a) => a.id_matricula));
    }
  };

  const ejecutarPromocionIndividual = async (idMatricula: number) => {
    if (!periodoSiguiente && !esUltimoGrado) {
      showAlert("Configuración incompleta", "No se ha definido un periodo siguiente para la promoción.", "warning");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post(`/promocion/promover-individual/${idMatricula}`, {
        periodIdSiguiente: periodoSiguiente?.id || null
      });

      if (data.success || data.status) {
        // Actualizamos localmente o volvemos a cargar
        await fetchAlumnosGrado();
        const alumno = alumnos.find(a => a.id_matricula === idMatricula);
        const ahora = new Date().toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
        setHistorial(prev => [
          {
            fecha: ahora,
            tipo: esUltimoGrado ? "Egreso" : "Promoción",
            alumnos: [alumno?.nombre_completo],
            de: nombreGradoActual,
            a: esUltimoGrado ? "Egresado" : gradoDestinoNombre,
          },
          ...prev
        ]);
      }
    } catch (error) {
    } finally {
      setLoading(false);
      setConfirmando(null);
    }
  };

  const ejecutarProcesarMasivo = async () => {
    if (!periodoActual || (!periodoSiguiente && !esUltimoGrado)) {
      showAlert("Configuración incompleta", "No se han definido periodos para procesar promociones o repeticiones.", "warning");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post(`/promocion/procesar-masivo`, {
        periodIdActual: periodoActual.id,
        periodIdSiguiente: periodoSiguiente?.id || null,
        gradoId: parseInt(gradoOrigenId),
        idsPromovidos: seleccionados // Solo los marcados pasarán al siguiente grado
      });

      if (data.success || data.status) {
        await fetchAlumnosGrado();
        setHistorial(prev => [
          {
            fecha: new Date().toLocaleDateString("es-PE"),
            tipo: esUltimoGrado ? "Egreso/Repetición" : "Promoción/Repetición",
            alumnos: [`Todo el grado ${nombreGradoActual}`],
            de: nombreGradoActual,
            a: esUltimoGrado ? "Egreso/Mismo Grado" : `Siguiente Grado / Mismo Grado`,
          },
          ...prev
        ]);
      }
    } catch (error) {
    } finally {
      setLoading(false);
      setConfirmando(null);
    }
  };


  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#f4f5f7", minHeight: "100vh", color: "#1a1d23" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e4e9", padding: "0 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 0 0" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: "#4b5563", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>Gestión Académica</span>
              </div>
              <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#111827" }}>Promoción de Alumnos</h1>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label style={{ fontSize: 12, color: "#4b5563", fontWeight: 500 }}>Año escolar</label>
              <select
                value={periodoActual?.id || ""}
                onChange={(e) => {
                  const p = todoPeriodos.find(x => String(x.id) === e.target.value);
                  if (p) {
                    setPeriodoActual(p);
                    const idx = todoPeriodos.findIndex(x => x.id === p.id);
                    setPeriodoSiguiente(todoPeriodos[idx + 1] || null);
                    setSeleccionados([]);
                  }
                }}
                style={{
                  appearance: "none",
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: 6,
                  padding: "5px 28px 5px 10px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#1d4ed8",
                  cursor: "pointer",
                  outline: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%231d4ed8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 6px center",
                  backgroundSize: "14px"
                }}
              >
                {todoPeriodos.map((p) => (
                  <option key={p.id} value={p.id}>{p.anio}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, marginTop: 16 }}>
            {[
              { key: "promover", label: "Promover Alumnos" },
              { key: "historial", label: `Historial (${historial.length})` },
              { key: "egresados", label: `Egresados (${egresados.length})` },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  background: "none", border: "none", cursor: "pointer", padding: "10px 18px",
                  fontSize: 13, fontWeight: 600, color: tab === t.key ? "#1d4ed8" : "#6b7280",
                  borderBottom: tab === t.key ? "2px solid #2563eb" : "2px solid transparent",
                  transition: "color 0.15s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 32px" }}>

        {/* Selector de grado — tira horizontal tipo pill */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
          {grados.map((g) => {
            const active = String(g.id) === gradoOrigenId && tab === "promover";
            return (
              <button
                key={g.id}
                onClick={() => { setGradoOrigenId(String(g.id)); setSeleccionados([]); setTab("promover"); }}
                style={{
                  flex: "0 0 auto",
                  background: active ? "#2563eb" : "#fff",
                  border: active ? "1px solid #2563eb" : "1px solid #e2e4e9",
                  borderRadius: 7,
                  padding: "7px 16px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  color: active ? "#fff" : "#374151",
                  fontWeight: 600,
                  fontSize: 13,
                  whiteSpace: "nowrap",
                }}
              >
                {g.nombre}
              </button>
            );
          })}
        </div>

        {/* TAB: PROMOVER */}
        {tab === "promover" && (
          <>
            {/* Banner de Periodo Inactivo */}
            {periodoActual && periodoActual.activo === 0 && (
              <div style={{ background: "#fff7ed", border: "1px solid #ffedd5", borderRadius: 8, padding: "12px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10, color: "#9a3412" }}>
                <span style={{ fontSize: 18 }}>⚠️</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>El periodo académico {periodoActual.anio} está Inactivo. Las funciones de promoción y egreso están restringidas.</span>
              </div>
            )}

            {/* Barra de controles */}
            <div style={{ background: "#fff", border: "1px solid #e2e4e9", borderRadius: 8, padding: "12px 16px", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {/* Origen */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12, color: "#4b5563", fontWeight: 500 }}>Grado:</span>
                  <select
                    value={gradoOrigenId}
                    onChange={(e) => { setGradoOrigenId(e.target.value); setSeleccionados([]); }}
                    style={{ border: "1px solid #e2e4e9", borderRadius: 6, padding: "5px 8px", fontSize: 13, fontWeight: 600, color: "#111827", background: "#f9fafb", outline: "none" }}
                  >
                    {grados.map((g) => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                  </select>
                </div>

                <span style={{ color: "#d1d5db", fontSize: 14 }}>→</span>

                {/* Destino */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12, color: "#4b5563", fontWeight: 500 }}>Pasa a:</span>
                  {esUltimoGrado ? (
                    <span style={{ border: "1px solid #bfdbfe", borderRadius: 6, padding: "5px 10px", fontSize: 13, fontWeight: 600, color: "#1d4ed8", background: "#eff6ff" }}>Egreso</span>
                  ) : (
                    <select
                      value={periodoSiguiente?.id || ""}
                      onChange={(e) => {
                        const p = todoPeriodos.find(x => String(x.id) === e.target.value);
                        setPeriodoSiguiente(p || null);
                      }}
                      style={{ border: "1px solid #bfdbfe", borderRadius: 6, padding: "5px 8px", fontSize: 13, fontWeight: 600, color: "#1d4ed8", background: "#eff6ff", outline: "none" }}
                    >
                      {todoPeriodos
                        .filter(p => !periodoActual || p.anio > periodoActual.anio)
                        .map(p => (
                          <option key={p.id} value={p.id}>{gradoDestinoNombre} · {p.anio}</option>
                        ))}
                      {todoPeriodos.filter(p => !periodoActual || p.anio >= periodoActual.anio).length === 0 && (
                        <option value="">No hay periodos disponibles</option>
                      )}
                    </select>
                  )}
                </div>

                <div style={{ width: 1, height: 20, background: "#e2e4e9" }} />

                {/* Sección */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12, color: "#4b5563", fontWeight: 500 }}>Sección:</span>
                  <select
                    value={seccionFiltro}
                    onChange={(e) => { setSeccionFiltro(e.target.value); setSeleccionados([]); }}
                    style={{ border: "1px solid #e2e4e9", borderRadius: 6, padding: "5px 8px", fontSize: 13, color: "#374151", background: "#f9fafb", outline: "none" }}
                  >
                    {secciones.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                {seleccionados.length > 0 && (
                  !esUltimoGrado ? (
                    <button
                      onClick={() => setConfirmando("seleccion")}
                      disabled={periodoActual?.activo === 0}
                      style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: periodoActual?.activo === 0 ? 0.5 : 1 }}
                    >
                      Promover {seleccionados.length} seleccionado{seleccionados.length > 1 ? "s" : ""}
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirmando("egreso")}
                      disabled={periodoActual?.activo === 0}
                      style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: periodoActual?.activo === 0 ? 0.5 : 1 }}
                    >
                      Egresar {seleccionados.length} seleccionado{seleccionados.length > 1 ? "s" : ""}
                    </button>
                  )
                )}
                {alumnosFiltrados.length > 0 && !esUltimoGrado && (
                  <button
                    onClick={() => setConfirmando("grado")}
                    disabled={periodoActual?.activo === 0}
                    style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", opacity: periodoActual?.activo === 0 ? 0.5 : 1 }}
                    onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
                  >
                    Procesar todo el grado
                  </button>
                )}
                {alumnosFiltrados.length > 0 && esUltimoGrado && (
                  <button
                    onClick={() => setConfirmando("grado")}
                    disabled={periodoActual?.activo === 0}
                    style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", opacity: periodoActual?.activo === 0 ? 0.5 : 1 }}
                    onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
                  >
                    Egresar todos
                  </button>
                )}
              </div>
            </div>

            {/* Aviso último grado */}
            {esUltimoGrado && (
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, padding: "10px 14px", marginBottom: 12, display: "flex", gap: 8, alignItems: "flex-start" }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 13, color: "#92400e" }}>{nombreGradoActual} — Egreso al finalizar {periodoActual?.anio}. </span>
                  <span style={{ fontSize: 12, color: "#b45309" }}>Los alumnos egresados ya no figurarán como activos para el próximo ciclo.</span>
                </div>
              </div>
            )}

            {/* Lista de alumnos */}
            <div style={{ background: "#fff", border: "1px solid #e2e4e9", borderRadius: 8, overflow: "hidden" }}>
              {/* Cabecera de lista */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "36px 32px 1fr 120px 100px",
                alignItems: "center",
                padding: "9px 16px",
                background: "#f8f9fb",
                borderBottom: "1px solid #e2e4e9",
              }}>
                <div>
                  <input
                    type="checkbox"
                    checked={alumnosFiltrados.length > 0 && seleccionados.length === alumnosFiltrados.length}
                    onChange={toggleTodos}
                    style={{ cursor: "pointer", accentColor: "#2563eb" }}
                  />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.06em" }}>#</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.06em" }}>Alumno</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.06em" }}>Estado</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "right" }}>Acción</span>
              </div>

              {/* Filas */}
              {loading ? (
                <div style={{ padding: "36px", textAlign: "center", color: "#4b5563", fontSize: 13 }}>Cargando alumnos...</div>
              ) : alumnosFiltrados.length === 0 ? (
                <div style={{ padding: "36px", textAlign: "center", color: "#4b5563", fontSize: 13 }}>
                  Sin alumnos activos en {nombreGradoActual}{seccionFiltro !== "Todas" ? ` · Sección ${seccionFiltro}` : ""} para {periodoActual?.anio}
                </div>
              ) : (
                alumnosFiltrados.map((a, i) => {
                  const badge = estadoBadge(a.estado);
                  const sel = seleccionados.includes(a.id_matricula);
                  const iniciales = a.nombre_completo.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
                  return (
                    <div
                      key={a.id_matricula}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "36px 32px 1fr 120px 100px",
                        alignItems: "center",
                        padding: "10px 16px",
                        borderBottom: "1px solid #f3f4f6",
                        background: sel ? "#f0f6ff" : "transparent",
                        transition: "background 0.12s",
                      }}
                    >
                      <input type="checkbox" checked={sel} onChange={() => toggleSeleccion(a.id_matricula)} style={{ cursor: "pointer", accentColor: "#2563eb" }} />

                      <span style={{ fontSize: 12, color: "#6b7280", fontFamily: "'DM Mono', monospace" }}>{String(i + 1).padStart(2, "0")}</span>

                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: "50%",
                          background: sel ? "#dbeafe" : "#f1f5f9",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 700, color: sel ? "#2563eb" : "#64748b",
                          flexShrink: 0,
                        }}>{iniciales}</div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{a.nombre_completo}</span>
                      </div>

                      <div>
                        <span style={{
                          background: badge.bg, color: badge.color,
                          borderRadius: 4, padding: "2px 8px",
                          fontSize: 11, fontWeight: 600
                        }}>{badge.label}</span>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        {esUltimoGrado ? (
                          <button
                            onClick={() => { setIdIndividual(a.id_matricula); setConfirmando("individual"); }}
                            disabled={!a.puede_promover || periodoActual?.activo === 0}
                            style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 5, padding: "4px 10px", fontSize: 12, fontWeight: 600, color: "#b91c1c", cursor: "pointer", opacity: (a.puede_promover && periodoActual?.activo !== 0) ? 1 : 0.4 }}
                          >Egresar</button>
                        ) : (
                          <button
                            onClick={() => { setIdIndividual(a.id_matricula); setConfirmando("individual"); }}
                            disabled={!a.puede_promover || periodoActual?.activo === 0}
                            style={{
                              background: sel ? "#2563eb" : "#eff6ff",
                              border: `1px solid ${sel ? "#1d4ed8" : "#93c5fd"}`,
                              borderRadius: 5, padding: "4px 10px", fontSize: 12, fontWeight: 700,
                              color: sel ? "#fff" : "#1d4ed8", cursor: "pointer",
                              opacity: (a.puede_promover && periodoActual?.activo !== 0) ? 1 : 0.4,
                              transition: "all 0.15s"
                            }}
                          >Promover</button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Pie de lista */}
              {alumnosFiltrados.length > 0 && (
                <div style={{ padding: "8px 16px", borderTop: "1px solid #f3f4f6", background: "#f8f9fb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "#4b5563" }}>{alumnosFiltrados.length} alumnos · {seleccionados.length} seleccionados</span>
                  <span style={{ fontSize: 11, color: "#6b7280" }}>Periodo {periodoActual?.anio}</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB: HISTORIAL */}
        {tab === "historial" && (
          <div style={{ background: "#fff", border: "1px solid #e2e4e9", borderRadius: 8, overflow: "hidden" }}>
            {/* Cabecera */}
            <div style={{ display: "grid", gridTemplateColumns: "130px 110px 1fr 1fr 1fr", padding: "9px 16px", background: "#f8f9fb", borderBottom: "1px solid #e2e4e9" }}>
              {["Fecha", "Tipo", "De", "A", "Alumnos"].map((h) => (
                <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
              ))}
            </div>
            {historial.length === 0 ? (
              <div style={{ padding: "36px", textAlign: "center", color: "#4b5563", fontSize: 13 }}>No hay movimientos registrados aún</div>
            ) : (
              historial.map((h, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "130px 110px 1fr 1fr 1fr", alignItems: "center", padding: "11px 16px", borderBottom: "1px solid #f3f4f6" }}>
                  <span style={{ fontSize: 12, color: "#4b5563", fontFamily: "'DM Mono', monospace" }}>{h.fecha}</span>
                  <div>
                    <span style={{
                      background: h.tipo.includes("Egreso") ? "#fef2f2" : "#eff6ff",
                      color: h.tipo.includes("Egreso") ? "#dc2626" : "#2563eb",
                      borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 600
                    }}>{h.tipo}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{h.de}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: h.a === "Egresado" ? "#dc2626" : "#16a34a" }}>{h.a}</span>
                  <span style={{ fontSize: 13, color: "#6b7280" }}>
                    {h.alumnos.length > 2 ? `${h.alumnos[0]}, ${h.alumnos[1]} y ${h.alumnos.length - 2} más` : h.alumnos.join(", ")}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB: EGRESADOS */}
        {tab === "egresados" && (
          <div style={{ background: "#fff", border: "1px solid #e2e4e9", borderRadius: 8, overflow: "hidden" }}>
            {/* Cabecera */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 80px 80px 120px", padding: "9px 16px", background: "#f8f9fb", borderBottom: "1px solid #e2e4e9" }}>
              {["Alumno", "Último grado", "Sec.", "Promedio", "Acceso"].map((h) => (
                <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
              ))}
            </div>
            {egresados.length === 0 ? (
              <div style={{ padding: "36px", textAlign: "center", color: "#4b5563", fontSize: 13 }}>No hay alumnos egresados todavía</div>
            ) : (
              egresados.map((a) => {
                const iniciales = a.nombre_completo.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
                return (
                  <div key={a.id_matricula} style={{ display: "grid", gridTemplateColumns: "1fr 100px 80px 80px 120px", alignItems: "center", padding: "10px 16px", borderBottom: "1px solid #f3f4f6" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#64748b", flexShrink: 0 }}>{iniciales}</div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{a.nombre_completo}</span>
                    </div>
                    <span style={{ fontSize: 13, color: "#374151" }}>{a.grado}</span>
                    <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>{a.seccion}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#d97706" }}>{parseFloat(String(a.promedio || 0)).toFixed(1)}</span>
                    <div>
                      <span style={{ background: "#fef2f2", color: "#b91c1c", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>Sin acceso</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Modal de confirmación */}
      {confirmando && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
                {confirmando === "egreso" || (confirmando === "individual" && esUltimoGrado) ? "Confirmar Egreso" : "Confirmar Promoción"}
              </div>
              <div style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>
                {confirmando === "egreso" || (confirmando === "individual" && esUltimoGrado) ? (
                  <>
                    Vas a egresar <strong style={{ color: "#111827" }}>{confirmando === "individual" ? "al alumno" : `${seleccionados.length} alumnos`}</strong> de {nombreGradoActual}.<br />
                    <span style={{ color: "#dc2626", fontWeight: 500 }}>Los alumnos finalizados ya no podrán registrarse en el siguiente ciclo escolar.</span>
                  </>
                ) : confirmando === "grado" ? (
                  <>
                    Vas a procesar <strong style={{ color: "#111827" }}>todo el grado</strong> de <strong>{nombreGradoActual}</strong>.<br />
                    • <strong style={{ color: "#16a34a" }}>{seleccionados.length}</strong> {esUltimoGrado ? "egresarán" : `pasarán a ${gradoDestinoNombre}`}.<br />
                    • <strong style={{ color: "#d97706" }}>{alumnosFiltrados.length - seleccionados.length}</strong> {esUltimoGrado ? "permanecerán en el sistema" : `repitirán ${nombreGradoActual}`} {periodoSiguiente ? `para ${periodoSiguiente.anio}` : ""}.
                  </>
                ) : (
                  <>
                    Vas a promover <strong style={{ color: "#111827" }}>{confirmando === "individual" ? "al alumno" : `${seleccionados.length} alumnos`}</strong> de{" "}
                    <strong>{nombreGradoActual}</strong> a <strong style={{ color: "#2563eb" }}>{gradoDestinoNombre} · {periodoSiguiente?.anio}</strong>.
                  </>
                )}
              </div>
            </div>

            <div style={{ background: "#f8f9fb", borderRadius: 8, padding: "12px 14px", marginBottom: 20, maxHeight: 150, overflowY: "auto" }}>
              {(confirmando === "grado" ? alumnosFiltrados : confirmando === "individual" ? alumnos.filter(a => a.id_matricula === idIndividual) : alumnos.filter((a) => seleccionados.includes(a.id_matricula))).map((a) => {
                const isPromoted = confirmando === "grado" ? seleccionados.includes(a.id_matricula) : true;
                return (
                  <div key={a.id_matricula} style={{ fontSize: 13, color: "#374151", padding: "4px 0", borderBottom: "1px solid #f0f1f3", display: "flex", justifyContent: "space-between" }}>
                    <span>{a.nombre_completo}</span>
                    <span style={{ fontWeight: 600, color: isPromoted ? "#16a34a" : "#d97706", fontSize: 11 }}>
                      {confirmando === "grado" ? (isPromoted ? (esUltimoGrado ? "EGRESO" : "PASA") : "REPITE") : (esUltimoGrado ? "EGRESO" : "PASA")}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => { setConfirmando(null); }}
                style={{ background: "#f3f4f6", border: "none", borderRadius: 7, padding: "9px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer", color: "#374151" }}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (confirmando === "grado") {
                    ejecutarProcesarMasivo();
                  } else if (confirmando === "individual") {
                    if (idIndividual !== null) ejecutarPromocionIndividual(idIndividual);
                  } else {
                    // Para selección múltiple, podríamos iterar o el API podría soportarlo. 
                    // El usuario pidió masivo (todo el grado) e individual.
                    // Para selección múltiple usaremos el individual por ahora si es uno solo, o avisar.
                    if (seleccionados.length === 1) {
                      ejecutarPromocionIndividual(seleccionados[0]);
                    } else if (seleccionados.length > 1) {
                      // Si el API de masivo no soporta lista de IDs, podríamos tener que iterar.
                      // Pero el usuario proporcionó endpoints específicos.
                      showAlert("Proceso en marcha", "La promoción de múltiples alumnos seleccionados se procesará individualmente.", "info");
                      Promise.all(seleccionados.map(id => ejecutarPromocionIndividual(id))).then(() => setConfirmando(null));
                    }
                  }
                }}
                disabled={loading}
                style={{
                  background: (confirmando === "egreso" || (confirmando === "individual" && esUltimoGrado)) ? "#dc2626" : "#2563eb",
                  color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer"
                }}
              >
                {loading ? "Procesando..." : (confirmando === "egreso" || (confirmando === "individual" && esUltimoGrado)) ? "Sí, egresar" : "Confirmar Proceso"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={alertModal.isOpen} onOpenChange={(open) => setAlertModal(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="max-w-[340px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
          <div className="flex flex-col items-center text-center p-8">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${alertModal.type === "success" ? "bg-emerald-50 text-emerald-500" :
                alertModal.type === "danger" ? "bg-rose-50 text-rose-500" :
                  alertModal.type === "warning" ? "bg-amber-50 text-amber-500" :
                    "bg-blue-50 text-blue-500"
              }`}>
              {alertModal.type === "success" && <CheckCircle2 size={32} />}
              {alertModal.type === "danger" && <X size={32} />}
              {alertModal.type === "warning" && <AlertTriangle size={32} />}
              {alertModal.type === "info" && <AlertCircle size={32} />}
            </div>
            <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2">{alertModal.title}</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">{alertModal.description}</p>
          </div>
          <div className="flex border-t border-slate-100 h-14">
            <button
              onClick={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
              className={`flex-1 text-sm font-bold hover:bg-slate-50 transition-colors uppercase tracking-widest ${alertModal.type === "danger" ? "text-rose-600" : "text-blue-600"
                }`}
            >
              Aceptar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
