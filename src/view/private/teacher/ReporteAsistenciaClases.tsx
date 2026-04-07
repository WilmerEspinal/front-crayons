import { useState, useCallback } from "react";
import api from "@/lib/axios";
import { utils, writeFile } from "xlsx";
import {
    Download,
    Search,
    ChevronDown,
    Filter
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface AsistenciaItem {
    curso: string;
    docente: string;
    estado: string;
    hora: string | null;
    observaciones: string | null;
}

interface ReporteAlumno {
    id_matricula: number;
    dni: string;
    nombre_alumno: string;
    grado: string;
    asistencias: AsistenciaItem[];
}

// Porcentaje de asistencia para reporte mensual
interface ReporteAlumnoMes {
    id_matricula: number;
    dni: string;
    nombre_alumno: string;
    grado: string;
    total_clases: number;
    total_faltas: number;
    total_presentes: number;
    porcentaje_asistencia: number;
}

const GRADOS = [
    { value: "1", label: "1° Secundaria" },
    { value: "2", label: "2° Secundaria" },
    { value: "3", label: "3° Secundaria" },
    { value: "4", label: "4° Secundaria" },
    { value: "5", label: "5° Secundaria" },
];

const MESES = [
    { value: "1", label: "Enero" },
    { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" },
    { value: "6", label: "Junio" },
    { value: "7", label: "Julio" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
];

export default function ReporteAsistenciaClases() {
    const [modoFiltro, setModoFiltro] = useState<"dia" | "mes">("dia");
    const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
    const [mesSeleccionado, setMesSeleccionado] = useState<string>(String(new Date().getMonth() + 1));
    const [anioSeleccionado, setAnioSeleccionado] = useState<string>(String(new Date().getFullYear()));
    const [reporte, setReporte] = useState<ReporteAlumno[]>([]);
    const [reporteMes, setReporteMes] = useState<ReporteAlumnoMes[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [gradoDesde, setGradoDesde] = useState<string>("1");
    const [gradoHasta, setGradoHasta] = useState<string>("5");
    const [mensajeAPI, setMensajeAPI] = useState<string | null>(null);

    // ─── Consulta por día ─────────────────────────────────────────────────────
    const fetchReporteDia = useCallback(async () => {
        setLoading(true);
        setReporteMes([]);
        setMensajeAPI(null);
        try {
            const params = {
                fecha,
                id_grado_desde: gradoDesde,
                id_grado_hasta: gradoHasta
            };

            const { data } = await api.get('/asistencia/reporte-grado', { params });
            if (data.success && data.data) {
                setReporte(data.data as ReporteAlumno[]);
            } else {
                setReporte([]);
            }
        } catch (error) {
            console.error("Error al obtener reporte diario:", error);
            setReporte([]);
        } finally {
            setLoading(false);
        }
    }, [fecha, gradoDesde, gradoHasta]);

    // ─── Consulta por mes (resumida por alumno) ───────────────────────────────
    const fetchReporteMes = useCallback(async () => {
        setLoading(true);
        setReporte([]);
        setMensajeAPI(null);
        try {
            const params = {
                mes: mesSeleccionado,
                anio: anioSeleccionado,
                id_grado_desde: gradoDesde,
                id_grado_hasta: gradoHasta
            };

            const { data } = await api.get('/asistencia/reporte-mensual', { params });

            if (data.success && data.data) {
                setReporteMes(data.data as ReporteAlumnoMes[]);
            } else {
                setReporteMes([]);
                if (data.mensaje) setMensajeAPI(data.mensaje);
            }
        } catch (error) {
            console.error("Error al obtener reporte mensual:", error);
            setReporteMes([]);
        } finally {
            setLoading(false);
        }
    }, [gradoDesde, gradoHasta, mesSeleccionado, anioSeleccionado]);

    const handleExportExcel = () => {
        const dataToExport = modoFiltro === "dia"
            ? filteredReporte.map(item => {
                const sortedAsistencias = [...item.asistencias].sort((a, b) =>
                    (a.hora || "").localeCompare(b.hora || "")
                );
                const entry = sortedAsistencias[0] || { estado: 'Ausente', hora: null };
                const logout = sortedAsistencias.length > 1 ? sortedAsistencias[sortedAsistencias.length - 1] : { hora: null };
                return {
                    DNI: item.dni,
                    Estudiante: item.nombre_alumno,
                    Grado: item.grado,
                    Estado: entry.estado,
                    Ingreso: entry.hora || "—",
                    Salida: logout.hora || "—",
                    Clases: item.asistencias.length
                };
            })
            : filteredReporteMes.map(item => ({
                DNI: item.dni,
                Estudiante: item.nombre_alumno,
                Grado: item.grado,
                Clases: item.total_clases,
                Presentes: item.total_presentes,
                Faltas: item.total_faltas,
                "% Asistencia": `${item.porcentaje_asistencia}%`
            }));

        const ws = utils.json_to_sheet(dataToExport);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Asistencia");
        const filename = modoFiltro === "dia"
            ? `Asistencia_${fecha}.xlsx`
            : `Asistencia_${MESES.find(m => m.value === mesSeleccionado)?.label}_${anioSeleccionado}.xlsx`;
        writeFile(wb, filename);
    };

    const handleConsultar = () => {
        if (modoFiltro === "dia") fetchReporteDia();
        else fetchReporteMes();
    };

    // Filtros de búsqueda
    const filteredReporte = reporte.filter(r =>
        r.nombre_alumno.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.dni.includes(searchTerm)
    );
    const filteredReporteMes = reporteMes.filter(r =>
        r.nombre_alumno.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.dni.includes(searchTerm)
    );

    const statsFiltered = {
        total: filteredReporte.length,
        presentes: mensajeAPI ? 0 : filteredReporte.filter(r => r.asistencias.some(a => a.estado === 'Presente')).length,
        inasistencias: mensajeAPI ? 0 : filteredReporte.filter(r => r.asistencias.length === 0 || r.asistencias.every(a => a.estado !== 'Presente')).length
    };

    const formatFechaDisplay = (dateStr: string) => {
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    };

    const getStatusStyle = (estado: string) => {
        switch (estado?.toLowerCase()) {
            case 'presente':
                return "bg-emerald-50 text-emerald-600 border-emerald-100";
            case 'ausente':
                return "bg-rose-50 text-rose-600 border-rose-100";
            default:
                return "bg-slate-50 text-slate-500 border-slate-200";
        }
    };

    const labelGradoRango = gradoDesde === gradoHasta
        ? GRADOS.find(g => g.value === gradoDesde)?.label
        : `${gradoDesde}° a ${gradoHasta}° Secundaria`;

    return (
        <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
            {/* Topbar */}
            <div className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <SidebarTrigger className="text-slate-400 hover:text-slate-600 transition-colors" />
                    <div className="h-4 w-px bg-slate-200 mx-2" />
                    <div>
                        <h1 className="text-base font-semibold text-slate-900">
                            Reporte de Asistencia
                        </h1>
                        <p className="text-xs text-slate-500">
                            {labelGradoRango} · {modoFiltro === "dia" ? formatFechaDisplay(fecha) : `${MESES.find(m => m.value === mesSeleccionado)?.label} ${anioSeleccionado}`}
                        </p>
                    </div>
                </div>

                <Button
                    onClick={handleExportExcel}
                    className="h-8 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs shadow-none"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 space-y-4">

                {/* Modo de filtro */}
                <div className="flex items-center gap-2">
                    <div className="inline-flex bg-white border border-slate-200 rounded-md overflow-hidden">
                        <button
                            onClick={() => setModoFiltro("dia")}
                            className={`px-4 py-1.5 text-xs font-semibold transition-colors ${modoFiltro === "dia" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
                        >
                            Por Día
                        </button>
                        <button
                            onClick={() => setModoFiltro("mes")}
                            className={`px-4 py-1.5 text-xs font-semibold transition-colors ${modoFiltro === "mes" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
                        >
                            Por Mes
                        </button>
                    </div>
                </div>

                {/* Stats (solo modo día) */}
                {modoFiltro === "dia" && (
                    <div className="flex items-center gap-6 text-xs">
                        <div className="flex gap-1">
                            <span className="text-slate-500">Total:</span>
                            <span className="font-semibold text-slate-900">{statsFiltered.total}</span>
                        </div>
                        <div className="flex gap-1">
                            <span className="text-slate-500">Presentes:</span>
                            <span className="font-semibold text-emerald-600">{statsFiltered.presentes}</span>
                        </div>
                        <div className="flex gap-1">
                            <span className="text-slate-500">Faltas:</span>
                            <span className="font-semibold text-rose-600">{statsFiltered.inasistencias}</span>
                        </div>
                    </div>
                )}
                {modoFiltro === "mes" && filteredReporteMes.length > 0 && (
                    <div className="flex items-center gap-6 text-xs">
                        <div className="flex gap-1">
                            <span className="text-slate-500">Estudiantes:</span>
                            <span className="font-semibold text-slate-900">{filteredReporteMes.length}</span>
                        </div>
                        <div className="flex gap-1">
                            <span className="text-slate-500">Con faltas:</span>
                            <span className="font-semibold text-rose-600">{filteredReporteMes.filter(r => r.total_faltas > 0).length}</span>
                        </div>
                        <div className="flex gap-1">
                            <span className="text-slate-500">Sin faltas:</span>
                            <span className="font-semibold text-emerald-600">{filteredReporteMes.filter(r => r.total_faltas === 0 && r.total_clases > 0).length}</span>
                        </div>
                    </div>
                )}

                {/* Filtros */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-3 items-center">
                        {/* Rango de grados */}
                        <div className="flex items-center gap-2">
                            <Filter size={12} className="text-slate-400" />
                            <span className="text-xs text-slate-500 font-medium">Grado:</span>
                            <div className="relative w-40">
                                <select
                                    value={gradoDesde}
                                    onChange={(e) => setGradoDesde(e.target.value)}
                                    className="w-full h-8 px-3 pr-8 bg-white border border-slate-200 rounded-md text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
                                >
                                    {GRADOS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                                </select>
                                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                            <span className="text-xs text-slate-400">hasta</span>
                            <div className="relative w-40">
                                <select
                                    value={gradoHasta}
                                    onChange={(e) => setGradoHasta(e.target.value)}
                                    className="w-full h-8 px-3 pr-8 bg-white border border-slate-200 rounded-md text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
                                >
                                    {GRADOS.filter(g => parseInt(g.value) >= parseInt(gradoDesde)).map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                                </select>
                                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Fecha / Mes */}
                        {modoFiltro === "dia" ? (
                            <Input
                                type="date"
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                                className="h-8 w-40 text-xs rounded-md bg-white border-slate-200"
                            />
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="relative w-36">
                                    <select
                                        value={mesSeleccionado}
                                        onChange={(e) => setMesSeleccionado(e.target.value)}
                                        className="w-full h-8 px-3 pr-8 bg-white border border-slate-200 rounded-md text-xs font-medium focus:outline-none appearance-none cursor-pointer"
                                    >
                                        {MESES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                    </select>
                                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                                <Input
                                    type="number"
                                    value={anioSeleccionado}
                                    onChange={(e) => setAnioSeleccionado(e.target.value)}
                                    className="h-8 w-20 text-xs rounded-md bg-white border-slate-200"
                                    min="2020"
                                    max="2099"
                                />
                            </div>
                        )}

                        <Button
                            onClick={handleConsultar}
                            disabled={loading}
                            variant="outline"
                            className="h-8 px-4 rounded-md text-xs border-slate-200 hover:bg-slate-50"
                        >
                            {loading ? "..." : <><Search size={14} className="mr-2" /> Consultar</>}
                        </Button>
                    </div>

                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Buscar estudiante o DNI..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-8 rounded-md text-xs bg-white border-slate-200"
                        />
                    </div>
                </div>

                {/* Mensaje API removido por solicitud */}

                {/* ─── Tabla modo DÍA ───────────────────────────────────────────── */}
                {modoFiltro === "dia" && (
                    <Card className="border border-slate-200 rounded-md shadow-none bg-white overflow-hidden">
                        <CardContent className="p-0">
                            <table className="w-full text-xs">
                                <thead className="border-b border-slate-200 bg-slate-50">
                                    <tr className="text-left text-slate-600">
                                        <th className="px-5 py-2 font-medium">DNI</th>
                                        <th className="px-5 py-2 font-medium">Estudiante</th>
                                        <th className="px-5 py-2 font-medium">Grado</th>
                                        <th className="px-5 py-2 font-medium text-center">Estado</th>
                                        <th className="px-5 py-2 font-medium text-center">Ingreso</th>
                                        <th className="px-5 py-2 font-medium text-center">Salida</th>
                                        <th className="px-5 py-2 font-medium text-center">Clases</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="px-2 py-4 text-center text-slate-400">
                                                Cargando datos...
                                            </td>
                                        </tr>
                                    ) : filteredReporte.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-2 py-4 text-center text-slate-500">
                                                Sin registros. Seleccione el rango de grados y consulte.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredReporte.map((item, idx) => {
                                            const sortedAsistencias = [...item.asistencias].sort((a, b) =>
                                                (a.hora || "").localeCompare(b.hora || "")
                                            );
                                            const entry = sortedAsistencias[0] || { estado: mensajeAPI ? 'Pendiente' : 'Ausente', hora: null };
                                            const logout = sortedAsistencias.length > 1 ? sortedAsistencias[sortedAsistencias.length - 1] : { hora: null };
                                            return (
                                                <motion.tr
                                                    key={idx}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="hover:bg-slate-50 transition"
                                                >
                                                    <td className="px-5 py-2 text-slate-700 font-mono">{item.dni}</td>
                                                    <td className="px-5 py-2 font-medium text-slate-900">{item.nombre_alumno}</td>
                                                    <td className="px-5 py-2 text-slate-500">{item.grado}</td>
                                                    <td className="px-5 py-2 text-center">
                                                        <span className={`px-2 py-0.5 text-[11px] rounded border ${getStatusStyle(entry.estado)}`}>
                                                            {entry.estado}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-2 text-slate-700 text-center">
                                                        {entry.hora || <span className="text-slate-300">—</span>}
                                                    </td>
                                                    <td className="px-5 py-2 text-slate-700 text-center">
                                                        {logout.hora || <span className="text-slate-300">—</span>}
                                                    </td>
                                                    <td className="px-5 py-2 text-center">
                                                        <span className="text-[11px] font-medium bg-slate-100 px-2 py-0.5 rounded">
                                                            {item.asistencias.length}
                                                        </span>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}

                {/* ─── Tabla modo MES ───────────────────────────────────────────── */}
                {modoFiltro === "mes" && (
                    <Card className="border border-slate-200 rounded-md shadow-none bg-white overflow-hidden">
                        <CardContent className="p-0">
                            <table className="w-full text-xs">
                                <thead className="border-b border-slate-200 bg-slate-50">
                                    <tr className="text-left text-slate-600">
                                        <th className="px-5 py-2 font-medium">DNI</th>
                                        <th className="px-5 py-2 font-medium">Estudiante</th>
                                        <th className="px-5 py-2 font-medium">Grado</th>
                                        <th className="px-5 py-2 font-medium text-center">Clases</th>
                                        <th className="px-5 py-2 font-medium text-center">Presentes</th>
                                        <th className="px-5 py-2 font-medium text-center">Faltas</th>
                                        <th className="px-5 py-2 font-medium text-center">% Asistencia</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="px-2 py-6 text-center text-slate-400">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                                                    <span>Calculando reporte mensual...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredReporteMes.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-2 py-4 text-center text-slate-500">
                                                Sin registros. Seleccione el mes y consulte.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredReporteMes.map((item, idx) => (
                                            <motion.tr
                                                key={idx}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.15 }}
                                                className="hover:bg-slate-50 transition"
                                            >
                                                <td className="px-5 py-2 text-slate-700 font-mono">{item.dni}</td>
                                                <td className="px-5 py-2 font-medium text-slate-900">{item.nombre_alumno}</td>
                                                <td className="px-5 py-2 text-slate-500">{item.grado}</td>
                                                <td className="px-5 py-2 text-center font-medium text-slate-700">{item.total_clases}</td>
                                                <td className="px-5 py-2 text-center">
                                                    <span className="font-semibold text-emerald-600">{item.total_presentes}</span>
                                                </td>
                                                <td className="px-5 py-2 text-center">
                                                    <span className={`font-semibold ${item.total_faltas > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                                                        {item.total_faltas}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-2 text-center">
                                                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${item.porcentaje_asistencia >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : item.porcentaje_asistencia >= 60 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                                                        {item.porcentaje_asistencia}%
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
