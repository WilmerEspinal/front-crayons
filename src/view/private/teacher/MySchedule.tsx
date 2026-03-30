import { useState, useEffect, useMemo } from "react";
import api from "@/lib/axios";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Calendar, Clock, BookOpen, MapPin, User, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface HorarioItem {
    id_horario: number;
    dia_semana: string;
    hora_inicio: string;
    hora_fin: string;
    aula: string | null;
    id_asignacion: number;
    curso: string;
    grado: string;
    seccion: string;
}



// Paleta de colores para cursos (Sincronizada con ScheduleGrid)
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

function getSubjectColor(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % COLORS.length;
    return COLORS[index];
}

const DAYS = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"];
const DIAS_SHORT = ["LU", "MA", "MI", "JU", "VI"];

// Generar horas en intervalos de 15 min (7:00 a 15:00 para docentes)
const HORAS: string[] = [];
for (let h = 7; h < 15; h++) {
    HORAS.push(`${String(h).padStart(2, "0")}:00`);
    HORAS.push(`${String(h).padStart(2, "0")}:15`);
    HORAS.push(`${String(h).padStart(2, "0")}:30`);
    HORAS.push(`${String(h).padStart(2, "0")}:45`);
}

const PX_PER_SLOT = 24;
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

const DIA_A_LABEL: Record<string, string> = {
    Lunes: "LUNES",
    Martes: "MARTES",
    Miercoles: "MIERCOLES",
    Jueves: "JUEVES",
    Viernes: "VIERNES",
};

export default function MySchedule() {
    const [horarios, setHorarios] = useState<HorarioItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHorario = async () => {
            try {
                const { data } = await api.get("/horario/docente/mi-horario-semanal");
                if (data.success) {
                    setHorarios(data.data || []);
                }
            } catch (error) {
                console.error("Error fetching schedule:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHorario();
    }, []);

    const blocks = useMemo(() => {
        return horarios.map((r, i) => {
            const color = getSubjectColor(r.curso);
            const diaClean = DIA_A_LABEL[r.dia_semana] || "LUNES";

            return {
                id: r.id_horario || i,
                dia: diaClean,
                horaInicio: r.hora_inicio.slice(0, 5),
                horaFin: r.hora_fin.slice(0, 5),
                curso: r.curso,
                grado: r.grado,
                seccion: r.seccion,
                aula: r.aula,
                bgColor: color.bg,
                textColor: color.text,
                borderColor: color.border
            };
        });
    }, [horarios]);

    return (
        <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
            {/* Topbar */}
            <div className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <SidebarTrigger className="text-slate-400 hover:text-slate-600 transition-colors" />
                    <div className="h-4 w-px bg-slate-200 mx-2" />
                    <div>
                        <h1 className="text-sm font-semibold text-slate-900">Mi Horario Semanal</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <Calendar size={12} className="text-slate-400" />
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Periodo Académico 2026</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-6 max-w-6xl mx-auto w-full">
                {loading ? (
                    <div className="h-64 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm mt-8">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                        <p className="text-sm font-medium text-slate-600">Cargando tu horario...</p>
                    </div>
                ) : horarios.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm mt-8 text-center px-4">
                        <Calendar className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">Aún no tienes bloques de horario asignados en este periodo.</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white border rounded-[16px] shadow-sm overflow-hidden mb-6" style={{ border: "1px solid #f1f5f9" }}>
                            <div style={{ overflowX: "auto" }}>
                                <div style={{ minWidth: "800px", padding: "16px" }}>

                                    {/* Headers */}
                                    <div style={{ display: "flex", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, zIndex: 10, background: "#fff", paddingBottom: "12px" }}>
                                        <div style={{ width: 60, flexShrink: 0 }} />
                                        {DAYS.map((dia, di) => (
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
                                            {DAYS.map((dia) => {
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
                                                            {dia === "MIERCOLES" && (
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
                                                                        left: 4,
                                                                        right: 4,
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
                                                                        {b.grado && b.seccion && (
                                                                            <span className="text-[9px] opacity-80 font-bold uppercase flex items-center gap-1 mt-1">
                                                                                <User size={10} />
                                                                                {b.grado} {b.seccion}
                                                                            </span>
                                                                        )}
                                                                        {b.aula && (
                                                                            <span className="text-[8px] opacity-80 font-bold uppercase flex items-center gap-1 mt-0.5">
                                                                                <MapPin size={8} />
                                                                                {b.aula}
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

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="border-none shadow-none bg-blue-50/50">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                                        <BookOpen size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Total Cursos</p>
                                        <p className="text-xl font-black text-slate-900">{new Set(horarios.map((h) => h.id_asignacion)).size}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-none bg-emerald-50/50">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Horas Semanales</p>
                                        <p className="text-xl font-black text-slate-900">{horarios.length}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-none bg-amber-50/50">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-white">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Rol Asignado</p>
                                        <p className="text-xl font-black text-slate-900 leading-tight">Docente Titular</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
