import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import { CalendarDays, Filter, Loader2 } from "lucide-react";

// --- TIPOS DE DATOS ---
type Teacher = { id: string; name: string };
type Subject = { id: string; name: string; bgColor: string; textColor: string };

type PeriodoItem = { id: number; anio: number; activo: number };
type DocenteItem = { id: number; nombre_completo: string };
type GradoItem = { id: number; nombre: string };
type CursoItem = { id: number; nombre: string };

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

// Paleta de colores para cursos
const COLORS = [
  { bg: "bg-blue-400", text: "text-black", border: "border-blue-500" },
  { bg: "bg-green-600", text: "text-white", border: "border-green-700" },
  { bg: "bg-emerald-500", text: "text-white", border: "border-emerald-600" },
  { bg: "bg-yellow-300", text: "text-black", border: "border-yellow-500" },
  { bg: "bg-purple-600", text: "text-white", border: "border-purple-800" },
  { bg: "bg-red-600", text: "text-white", border: "border-red-800" },
  { bg: "bg-orange-200", text: "text-orange-900", border: "border-orange-400" },
  { bg: "bg-pink-300", text: "text-black", border: "border-pink-500" },
  { bg: "bg-teal-400", text: "text-black", border: "border-teal-600" },
  { bg: "bg-indigo-400", text: "text-white", border: "border-indigo-600" },
  { bg: "bg-cyan-600", text: "text-white", border: "border-cyan-800" },
  { bg: "bg-lime-400", text: "text-black", border: "border-lime-600" },
];

function getSubjectColor(id: number) {
  const c = COLORS[id % COLORS.length];
  return { bgColor: c.bg, textColor: c.text, borderColor: c.border };
}

const DIAS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"];
const DIAS_SHORT = ["LU", "MA", "MI", "JU", "VI"];

// Generar horas en intervalos de 15 min (7:00 a 17:00)
const HORAS: string[] = [];
for (let h = 7; h < 17; h++) {
  HORAS.push(`${String(h).padStart(2, "0")}:00`);
  HORAS.push(`${String(h).padStart(2, "0")}:15`);
  HORAS.push(`${String(h).padStart(2, "0")}:30`);
  HORAS.push(`${String(h).padStart(2, "0")}:45`);
}

const PX_PER_SLOT = 18;
const START_MIN = 7 * 60; // 07:00

const toMin = (h: string) => {
  if (!h) return 0;
  const [hh, mm] = h.split(":").map(Number);
  return hh * 60 + (mm || 0);
};

const timeToTop = (t: string) => ((toMin(t) - START_MIN) / 15) * PX_PER_SLOT;
const timeToPx = (start: string, end: string) =>
  Math.max(((toMin(end) - toMin(start)) / 15) * PX_PER_SLOT, 1);

const TOTAL_H = (HORAS.length - 1) * PX_PER_SLOT;

const resolverConflictos = (bloques: any[]) => {
  const gruposPorDia = bloques.reduce((acc, bloque) => {
    if (!acc[bloque.dia]) acc[bloque.dia] = [];
    acc[bloque.dia].push({
      ...bloque,
      startMins: toMin(bloque.horaInicio),
      endMins: toMin(bloque.horaFin)
    });
    return acc;
  }, {} as Record<string, any[]>);

  const bloquesResueltos: any[] = [];

  Object.keys(gruposPorDia).forEach(dia => {
    let bloquesDelDia = gruposPorDia[dia];
    bloquesDelDia.sort((a: any, b: any) => {
      if (a.startMins === b.startMins) return b.endMins - a.endMins;
      return a.startMins - b.startMins;
    });

    let clusters: any[][] = [];
    if (bloquesDelDia.length > 0) {
      let clusterActual = [bloquesDelDia[0]];
      let maxEndMins = bloquesDelDia[0].endMins;

      for (let i = 1; i < bloquesDelDia.length; i++) {
        const bloque = bloquesDelDia[i];
        if (bloque.startMins < maxEndMins) {
          clusterActual.push(bloque);
          maxEndMins = Math.max(maxEndMins, bloque.endMins);
        } else {
          clusters.push(clusterActual);
          clusterActual = [bloque];
          maxEndMins = bloque.endMins;
        }
      }
      clusters.push(clusterActual);
    }

    clusters.forEach(cluster => {
      let columnas: any[][] = [];
      cluster.forEach(bloque => {
        let acomodado = false;
        for (let j = 0; j < columnas.length; j++) {
          const columna = columnas[j];
          const ultimoEnColumna = columna[columna.length - 1];
          if (bloque.startMins >= ultimoEnColumna.endMins) {
            columna.push(bloque);
            acomodado = true;
            break;
          }
        }
        if (!acomodado) {
          columnas.push([bloque]);
        }
      });

      const totalColumnas = columnas.length;
      columnas.forEach((columna, colIndex) => {
        columna.forEach(bloque => {
          bloque.colWidth = 100 / totalColumnas;
          bloque.colLeft = (100 / totalColumnas) * colIndex;
          bloquesResueltos.push(bloque);
        });
      });
    });
  });

  return bloquesResueltos;
};

export default function ScheduleGrid() {
  const [periodos, setPeriodos] = useState<PeriodoItem[]>([]);
  const [docentes, setDocentes] = useState<DocenteItem[]>([]);
  const [grados, setGrados] = useState<GradoItem[]>([]);
  const [cursos, setCursos] = useState<CursoItem[]>([]);

  const [idPeriodo, setIdPeriodo] = useState<string>("");
  const [idDocente, setIdDocente] = useState<string>("");
  const [idGrado, setIdGrado] = useState<string>("");

  const [rows, setRows] = useState<ReporteRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const loadCatalogos = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/horario/catalogos");
        if (!data?.success) {
          setError("No se pudieron cargar catálogos.");
          return;
        }
        const payload = data.data || {};
        const periodosData = payload.periodos || [];
        setPeriodos(periodosData);
        setDocentes(payload.docentes || []);
        setGrados(payload.grados || []);
        setCursos(payload.cursos || []);

        const periodoActivo = periodosData.find((p: PeriodoItem) => p.activo === 1);
        if (periodoActivo) setIdPeriodo(String(periodoActivo.id));
      } catch (e) {
        setError("Error al cargar catálogos.");
      } finally {
        setLoading(false);
      }
    };
    loadCatalogos();
  }, []);

  const cargarReporte = async () => {
    setLoading(true);
    setError("");
    setSearched(true);
    setRows([]);
    try {
      const params: Record<string, string> = {};
      if (idPeriodo) params.id_periodo = idPeriodo;
      if (idDocente) params.id_docente = idDocente;
      if (idGrado) params.id_grado = idGrado;

      const { data } = await api.get("/horario/reporte", { params });
      if (!data?.success) {
        setError(data?.message || "No se pudo cargar el reporte.");
        return;
      }
      setRows(data.data || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Error al consultar horarios.");
    } finally {
      setLoading(false);
    }
  };

  const { TEACHERS, SUBJECTS, blocks } = useMemo(() => {
    const tMap: Record<string, Teacher> = {};
    const sMap: Record<string, Subject> = {};

    docentes.forEach((d) => {
      tMap[String(d.id)] = { id: String(d.id), name: d.nombre_completo };
    });

    cursos.forEach((c) => {
      const color = getSubjectColor(c.id);
      sMap[String(c.id)] = {
        id: String(c.id),
        name: c.nombre,
        bgColor: color.bgColor,
        textColor: color.textColor,
      };
    });

    const mappedBlocks = rows.map((r, i) => {
      if (!tMap[String(r.id_docente)]) {
        tMap[String(r.id_docente)] = { id: String(r.id_docente), name: r.docente };
      }
      if (!sMap[String(r.id_curso)]) {
        const color = getSubjectColor(r.id_curso);
        sMap[String(r.id_curso)] = {
          id: String(r.id_curso),
          name: r.curso,
          bgColor: color.bgColor,
          textColor: color.textColor,
        };
      }

      const color = getSubjectColor(r.id_curso);

      // Limpiar tildes u otras cosas
      const diaClean = r.dia_semana.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      return {
        id: r.id_horario || i,
        dia: diaClean,
        horaInicio: r.hora_inicio.slice(0, 5),
        horaFin: r.hora_fin.slice(0, 5),
        curso: r.curso,
        docente: r.docente,
        grado: r.grado,
        seccion: r.seccion,
        aula: r.aula,
        bgColor: color.bgColor,
        textColor: color.textColor,
        borderColor: color.borderColor
      };
    });

    const bloquesResueltos = resolverConflictos(mappedBlocks);

    return { TEACHERS: tMap, SUBJECTS: sMap, blocks: bloquesResueltos };
  }, [rows, docentes, cursos]);

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ENCABEZADO Y FILTROS */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <CalendarDays className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">
                Horario de Clases
              </h1>
              <p className="text-gray-500 text-sm">Visualización de Horarios Dinámicos</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Período</label>
              <select
                className="w-full border border-gray-300 rounded-md p-2 bg-gray-50 text-sm text-gray-800"
                value={idPeriodo}
                onChange={(e) => setIdPeriodo(e.target.value)}
              >
                <option value="">Todos</option>
                {periodos.map((p) => (
                  <option key={p.id} value={p.id}>{p.anio}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Docente</label>
              <select
                className="w-full border border-gray-300 rounded-md p-2 bg-gray-50 text-sm text-gray-800"
                value={idDocente}
                onChange={(e) => setIdDocente(e.target.value)}
              >
                <option value="" disabled>Seleccione un docente...</option>
                {docentes.map((d) => (
                  <option key={d.id} value={d.id}>{d.nombre_completo}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Grado</label>
              <select
                className="w-full border border-gray-300 rounded-md p-2 bg-gray-50 text-sm text-gray-800"
                value={idGrado}
                onChange={(e) => setIdGrado(e.target.value)}
              >
                <option value="">Todos</option>
                {grados.map((g) => (
                  <option key={g.id} value={g.id}>{g.nombre}</option>
                ))}
              </select>
            </div>



            <button
              onClick={cargarReporte}
              disabled={!idDocente}
              className={`${!idDocente
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
                } transition-colors text-white font-semibold flex items-center justify-center gap-2 py-2 px-4 rounded-md h-[38px] w-full`}
            >
              <Filter className="w-4 h-4" />
              Filtrar
            </button>
          </div>
          {error && <div className="mt-4 text-red-600 bg-red-100 p-2 text-sm rounded">{error}</div>}
        </div>

        {/* CONTENIDO PRINCIPAL / GRILLA 15 MIN */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-md border border-gray-200">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="font-medium text-gray-600">Cargando horario...</p>
          </div>
        ) : !searched ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-md border border-gray-200 text-center">
            <CalendarDays className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">Seleccione al menos un docente para visualizar la matriz del horario.</p>
          </div>
        ) : blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-md border border-gray-200 text-center">
            <p className="text-gray-500 font-medium">No se encontraron horarios para los filtros aplicados.</p>
          </div>
        ) : (
          <>
            <div className="bg-white border rounded-[16px] shadow-sm overflow-hidden" style={{ border: "1px solid #f1f5f9" }}>
              <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "65vh" }}>
                <div style={{ minWidth: "800px", padding: "0 16px 16px 16px" }}>

                  {/* Headers */}
                  <div style={{ display: "flex", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, zIndex: 30, background: "#fff", paddingTop: "16px", paddingBottom: "12px" }}>
                    <div style={{ width: 60, flexShrink: 0 }} />
                    {DIAS.map((dia, di) => (
                      <div key={dia} style={{ flex: 1, textAlign: "center", borderLeft: "1px solid #e2e8f0" }}>
                        <p style={{ margin: 0, fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>{dia.slice(0, 3)}</p>
                        <p style={{ margin: "2px 0 0", fontSize: "14px", fontWeight: 800, color: "#1e293b" }}>{DIAS_SHORT[di]}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", position: "relative" }}>
                    {/* Axis Horas */}
                    <div style={{ width: 60, flexShrink: 0, position: "relative", height: TOTAL_H, borderRight: "1px solid #e2e8f0" }}>
                      {HORAS.map((h, hi) => (
                        (h.endsWith(":00") || h.endsWith(":30")) && hi < HORAS.length - 1 && (
                          <div key={h} style={{ position: "absolute", top: timeToTop(h) - 7, left: 0, right: 8, display: "flex", justifyContent: "flex-end", fontSize: "11px", fontWeight: 700, color: "#64748b" }}>{h}</div>
                        )
                      ))}
                    </div>

                    {/* Columns grid */}
                    <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", background: "#fff" }}>
                      {DIAS.map((dia) => {
                        const dayBlocks = blocks.filter(b => b.dia === dia);

                        return (
                          <div key={dia} style={{ position: "relative", borderLeft: "1px solid #1A1818" }}>
                            {/* Grid Lines */}
                            {HORAS.map((h, i) => (
                              <div key={h} style={{ position: "absolute", top: timeToTop(h), left: 0, right: 0, height: PX_PER_SLOT, borderBottom: i % 2 === 0 ? "1px dashed #1A1818" : "1px solid #1A1818", zIndex: 0 }} />
                            ))}

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

                            {/* Blocks */}
                            {dayBlocks.map((b, bi) => {
                              const top = timeToTop(b.horaInicio);
                              const height = timeToPx(b.horaInicio, b.horaFin);

                              return (
                                <div
                                  key={b.id + "-" + bi}
                                  className={`${b.bgColor} ${b.textColor} absolute shadow hover:brightness-110 transition-colors duration-200 border-l-4 ${b.borderColor}`}
                                  style={{
                                    top,
                                    left: `calc(${b.colLeft}% + 4px)`,
                                    width: `calc(${b.colWidth}% - 8px)`,
                                    height: height - 2,
                                    borderRadius: "4px 8px 8px 4px",
                                    zIndex: 2,
                                    padding: "4px 8px",
                                    overflow: 'hidden'
                                  }}
                                >
                                  <div className="flex flex-col h-full items-start justify-start space-y-0.5">
                                    <span className="font-extrabold text-[10px] leading-tight md:text-xs">
                                      {b.curso}
                                    </span>
                                    <span className="text-[9px] md:text-[10px] opacity-90 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                                      Prof. {b.docente.split(" ")[0]}
                                    </span>
                                    {b.grado && b.seccion && (
                                      <span className="text-[9px] opacity-80 font-bold uppercase">
                                        {b.grado}
                                      </span>
                                    )}
                                  </div>
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
            </div>

            {/* PLANA DOCENTE / LEYENDA */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Plana Docente Involucrada</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.values(TEACHERS).map((teacher) => {
                  const teacherCourses = Object.values(SUBJECTS).filter((sub) =>
                    blocks.some(
                      (block) => block.docente === teacher.name && block.curso === sub.name
                    )
                  );

                  if (teacherCourses.length === 0) return null;

                  return (
                    <div
                      key={teacher.id}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded border border-gray-100"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                        {teacher.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{teacher.name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {teacherCourses.map((course) => (
                            <span
                              key={course.id}
                              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${course.bgColor} ${course.textColor}`}
                            >
                              {course.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
