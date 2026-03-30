import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import {
    CalendarCheck2,
    BookOpen,
    Users,
    ClipboardList,
    TrendingUp,
    Calendar,
    ChevronRight,
} from "lucide-react";
import api from "@/lib/axios";
import { useNavigate } from "react-router-dom";

interface Asignacion {
    id_asignacion: number;
    curso: string;
    grado: string;
    anio: number;
    alumnos: { id_alumno: number; dni?: string; nombre_completo?: string; id_matricula?: number }[];
}

export default function TeacherHome() {
    const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const currentYear = new Date().getFullYear().toString();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await api.get(`/docente/mis-asignaciones-alumnos/${currentYear}`);
                if (data.success) {
                    setAsignaciones(data.data || []);
                }
            } catch (err) {
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const uniqueStudents = new Set<string>();
    asignaciones.forEach(a => {
        if (a.alumnos) {
            a.alumnos.forEach((alumno: any) => {
                if (alumno.dni) uniqueStudents.add(`dni_${alumno.dni}`);
                else if (alumno.id_matricula) uniqueStudents.add(`mat_${alumno.id_matricula}`);
                else if (alumno.nombre_completo) uniqueStudents.add(`nom_${alumno.nombre_completo}`);
                else uniqueStudents.add(`id_${alumno.id_alumno}`);
            });
        }
    });
    const totalAlumnos = uniqueStudents.size;
    const today = new Date().toLocaleDateString("es-PE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const quickActions = [
        {
            icon: CalendarCheck2,
            label: "Registrar Asistencia",
            description: "Toma de lista del día",
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-100",
            path: "/teacher/registrar-asistencia",
        },
        {
            icon: ClipboardList,
            label: "Ver Historial",
            description: "Asistencia por fecha",
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            border: "border-indigo-100",
            path: "/teacher/ver-asistencia",
        },
        {
            icon: TrendingUp,
            label: "Reporte de Clases",
            description: "Estadísticas y análisis",
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-100",
            path: "/teacher/reporte-clases",
        },
        {
            icon: BookOpen,
            label: "Justificaciones",
            description: "Gestionar inasistencias",
            color: "text-amber-600",
            bg: "bg-amber-50",
            border: "border-amber-100",
            path: "/teacher/justificaciones",
        },
        {
            icon: Calendar,
            label: "Mi Horario",
            description: "Ver tu rol semanal",
            color: "text-purple-600",
            bg: "bg-purple-50",
            border: "border-purple-100",
            path: "/teacher/mi-horario",
        },
    ];

    return (
        <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
            {/* Topbar */}
            <div className="h-14 border-b border-slate-200 flex items-center gap-4 px-6 bg-white sticky top-0 z-10">
                <SidebarTrigger className="text-slate-400 hover:text-slate-600 transition-colors" />
                <div className="h-4 w-px bg-slate-200" />
                <div>
                    <h1 className="text-sm font-semibold text-slate-900">Panel del Docente</h1>
                    <div className="flex items-center gap-2 mt-0.5">
                        <Calendar size={11} className="text-slate-400" />
                        <span className="text-[11px] text-slate-500 font-medium capitalize">{today}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-6 space-y-6">
                {/* Welcome Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                    <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full" />
                    <div className="absolute -right-4 -bottom-10 w-32 h-32 bg-white/5 rounded-full" />
                    <div className="relative z-10">
                        <p className="text-blue-100 text-xs font-semibold uppercase tracking-widest mb-1">
                            Bienvenido
                        </p>
                        <h2 className="text-2xl font-black leading-tight mb-3">
                            ¡Listo para hoy!
                        </h2>
                        <p className="text-blue-100 text-sm">
                            Tienes{" "}
                            <span className="font-bold text-white">
                                {loading ? "..." : asignaciones.length} curso{asignaciones.length !== 1 ? "s" : ""}
                            </span>{" "}
                            asignados con{" "}
                            <span className="font-bold text-white">
                                {loading ? "..." : totalAlumnos} estudiante{totalAlumnos !== 1 ? "s" : ""}
                            </span>{" "}
                            en total.
                        </p>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        {
                            label: "Cursos",
                            value: loading ? "—" : asignaciones.length.toString(),
                            icon: BookOpen,
                            color: "text-blue-600",
                            bg: "bg-blue-50",
                        },
                        {
                            label: "Estudiantes",
                            value: loading ? "—" : totalAlumnos.toString(),
                            icon: Users,
                            color: "text-indigo-600",
                            bg: "bg-indigo-50",
                        },
                        {
                            label: "Periodo",
                            value: currentYear,
                            icon: Calendar,
                            color: "text-emerald-600",
                            bg: "bg-emerald-50",
                        },
                        {
                            label: "Hoy",
                            value: new Date().toLocaleDateString("es-PE", { day: "2-digit", month: "short" }),
                            icon: CalendarCheck2,
                            color: "text-amber-600",
                            bg: "bg-amber-50",
                        },
                    ].map((stat, i) => (
                        <Card key={i} className="border border-slate-200 shadow-none bg-white">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        {stat.label}
                                    </p>
                                    <p className="text-xl font-black text-slate-900 leading-tight">{stat.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Quick Actions */}
                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                        Acciones Rápidas
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {quickActions.map((action, i) => (
                            <button
                                key={i}
                                onClick={() => navigate(action.path)}
                                className={`flex items-center gap-4 p-4 rounded-xl border ${action.border} ${action.bg} hover:opacity-90 active:scale-[0.98] transition-all text-left group`}
                            >
                                <div className={`w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center`}>
                                    <action.icon className={`w-5 h-5 ${action.color}`} />
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm font-bold ${action.color}`}>{action.label}</p>
                                    <p className="text-[11px] text-slate-500">{action.description}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cursos asignados */}
                {!loading && asignaciones.length > 0 && (
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                            Mis Cursos — {currentYear}
                        </h3>
                        <Card className="border border-slate-200 shadow-none bg-white">
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-100">
                                    {asignaciones.map((a) => (
                                        <div key={a.id_asignacion} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                                    <BookOpen className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-800">{a.curso}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">{a.grado}</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                                {a.alumnos?.length || 0} alumnos
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <div className="text-[9px] font-bold text-slate-300 uppercase tracking-widest text-center pt-2">
                    © 2026 Crayon's Academic · Panel Docente
                </div>
            </div>
        </div>
    );
}
