import { useState, useCallback } from "react";
import api from "@/lib/axios";
import {
    Download,
    Search,
    AlertCircle,
    ChevronDown
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

export default function ReporteAsistenciaClases() {
    const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
    const [reporte, setReporte] = useState<ReporteAlumno[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [gradoSeleccionado, setGradoSeleccionado] = useState<string>("1");
    const [mensajeAPI, setMensajeAPI] = useState<string | null>(null);

    const fetchReporte = useCallback(async () => {
        setLoading(true);
        try {
            const url = gradoSeleccionado === "todos"
                ? `/asistencia/reporte-dia?fecha=${fecha}`
                : `/asistencia/reporte-grado?fecha=${fecha}&id_grado=${gradoSeleccionado}`;

            const { data } = await api.get(url);
            if (data.success) {
                setReporte(data.data || []);
                setMensajeAPI(!data.asistencia_registrada ? data.mensaje : null);
            } else {
                setReporte([]);
                setMensajeAPI(null);
            }
        } catch (error) {
            setReporte([]);
            setMensajeAPI(null);
        } finally {
            setLoading(false);
        }
    }, [fecha, gradoSeleccionado]);

    // useEffect(() => {
    //     fetchReporte();
    // }, [fetchReporte]);

    const filteredReporte = reporte.filter(r =>
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

    const nombreGradoMap: Record<string, string> = {
        "1": "1° Secundaria",
        "2": "2° Secundaria",
        "3": "3° Secundaria",
        "4": "4° Secundaria",
        "5": "5° Secundaria",
        "todos": "Todos los grados"
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

    return (
        <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
            {/* Topbar Compact */}
            <div className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <SidebarTrigger className="text-slate-400 hover:text-slate-600 transition-colors" />
                    <div className="h-4 w-px bg-slate-200 mx-2" />
                    <div>
                        <h1 className="text-base font-semibold text-slate-900">
                            Reporte Diario de Asistencia
                        </h1>
                        <p className="text-xs text-slate-500">
                            {nombreGradoMap[gradoSeleccionado] || "Grado"} · {formatFechaDisplay(fecha)}
                        </p>
                    </div>
                </div>

                <Button
                    onClick={() => window.print()}
                    className="h-8 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs shadow-none"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 space-y-4">
                {/* Compact Stats */}
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

                {/* Filters Row Compact */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                        <div className="relative w-56">
                            <select
                                value={gradoSeleccionado}
                                onChange={(e) => setGradoSeleccionado(e.target.value)}
                                className="w-full h-8 px-3 pr-8 bg-white border border-slate-200 rounded-md text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
                            >
                                <option value="1">1° Secundaria</option>
                                <option value="2">2° Secundaria</option>
                                <option value="3">3° Secundaria</option>
                                <option value="4">4° Secundaria</option>
                                <option value="5">5° Secundaria</option>
                            </select>
                            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>

                        <Input
                            type="date"
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                            className="h-8 w-40 text-xs rounded-md bg-white border-slate-200"
                        />
                        <Button
                            onClick={fetchReporte}
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

                {/* Message API if exists */}
                {mensajeAPI && (
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-md flex items-center gap-2 text-amber-700 animate-in fade-in">
                        <AlertCircle size={14} className="text-amber-500" />
                        <span className="text-[11px] font-semibold uppercase tracking-tight">{mensajeAPI}</span>
                    </div>
                )}

                {/* Table Clean Professional */}
                <Card className="border border-slate-200 rounded-md shadow-none bg-white overflow-hidden">
                    <CardContent className="p-0">
                        <table className="w-full text-xs">
                            <thead className="border-b border-slate-200 bg-slate-50">
                                <tr className="text-left text-slate-600">
                                    <th className="px-5 py-2 font-medium">DNI</th>
                                    <th className="px-5 py-2 font-medium">Estudiante</th>
                                    <th className="px-5 py-2 font-medium text-center">Estado</th>
                                    <th className="px-5 py-2 font-medium text-center">Ingreso</th>
                                    <th className="px-5 py-2 font-medium text-center">Salida</th>
                                    <th className="px-5 py-2 font-medium text-center">Clases</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-2 py-2 text-center text-slate-400">
                                            Procesando información del servidor...
                                        </td>
                                    </tr>
                                ) : filteredReporte.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-2 py-2 text-center text-slate-900">
                                            No se encontraron registros para los filtros seleccionados
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
                                                className="border-b border-slate-100 hover:bg-slate-50 transition"
                                            >
                                                <td className="px-2 py-2 text-slate-700 font-mono">
                                                    {item.dni}
                                                </td>
                                                <td className="px-2 py-2">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-slate-900">
                                                            {item.nombre_alumno}
                                                        </span>
                                                        <span className="text-[11px] text-slate-500">
                                                            {item.grado}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-2 py-2 text-center">
                                                    <span className={`px-2 py-0.5 text-[11px] rounded border ${getStatusStyle(entry.estado)}`}>
                                                        {entry.estado}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-2 text-slate-700 text-center">
                                                    {entry.hora || <span className="text-slate-300">—</span>}
                                                </td>
                                                <td className="px-2 py-2 text-slate-700 text-center">
                                                    {logout.hora || <span className="text-slate-300">—</span>}
                                                </td>
                                                <td className="px-2 py-2 text-center">
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
            </div>
        </div>
    );
}
