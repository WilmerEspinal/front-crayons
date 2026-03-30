import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Download, FileBarChart2 } from "lucide-react";

type Bloque = {
  id_horario: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  curso: string;
  grado: string;
  seccion: string;
};

type BloqueDetalle = {
  id_alumno: number;
  dni: string;
  alumno: string;
  estado: string;
  observacion: string | null;
};

type DiarioRow = {
  id_horario: number;
  curso: string;
  grado: string;
  seccion: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  aula: string | null;
  total_registros: number;
  presentes: number;
  ausentes: number;
  tardanzas: number;
  justificados: number;
};

type AlumnoRow = {
  fecha: string;
  curso: string;
  grado: string;
  seccion: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  observacion: string | null;
};

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function downloadBlob(data: BlobPart, filename: string, type: string) {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export default function ReporteAsistenciaBloques() {
  const [fecha, setFecha] = useState(todayISO());
  const [bloques, setBloques] = useState<Bloque[]>([]);
  const [idHorario, setIdHorario] = useState<string>("");

  const [detalleBloque, setDetalleBloque] = useState<BloqueDetalle[]>([]);
  const [resumenBloque, setResumenBloque] = useState<Record<string, number> | null>(null);

  const [diario, setDiario] = useState<DiarioRow[]>([]);

  const [idAlumno, setIdAlumno] = useState<string>("");
  const [fechaInicio, setFechaInicio] = useState(todayISO());
  const [fechaFin, setFechaFin] = useState(todayISO());
  const [alumnoDetalle, setAlumnoDetalle] = useState<AlumnoRow[]>([]);
  const [porcentaje, setPorcentaje] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    const fetchBloques = async () => {
      try {
        const { data } = await api.get("/horario/docente/bloques", { params: { fecha } });
        if (data?.success) setBloques(data.data || []);
        else setBloques([]);
      } catch {
        setBloques([]);
      }
      setIdHorario("");
      setDetalleBloque([]);
      setResumenBloque(null);
    };
    fetchBloques();
  }, [fecha]);

  const fetchReporteBloque = async () => {
    if (!idHorario) return;
    setLoading(true);
    setMessage(null);
    try {
      const { data } = await api.get("/horario/docente/reporte-bloque", {
        params: { id_horario: idHorario, fecha },
      });
      if (data?.success) {
        setDetalleBloque(data.data || []);
        setResumenBloque(data.resumen || null);
      } else {
        setDetalleBloque([]);
        setResumenBloque(null);
      }
    } catch (error: any) {
      setMessage({ text: error?.response?.data?.message || "Error en reporte por bloque.", isError: true });
    } finally {
      setLoading(false);
    }
  };

  const fetchReporteDiario = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { data } = await api.get("/horario/docente/reporte-diario", { params: { fecha } });
      if (data?.success) setDiario(data.data || []);
      else setDiario([]);
    } catch (error: any) {
      setMessage({ text: error?.response?.data?.message || "Error en reporte diario.", isError: true });
    } finally {
      setLoading(false);
    }
  };

  const fetchReporteAlumno = async () => {
    if (!idAlumno) return;
    setLoading(true);
    setMessage(null);
    try {
      const { data } = await api.get("/horario/docente/reporte-alumno", {
        params: {
          id_alumno: idAlumno,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
        },
      });
      if (data?.success) {
        setAlumnoDetalle(data.data || []);
        setPorcentaje(data.porcentaje_asistencia || 0);
      } else {
        setAlumnoDetalle([]);
        setPorcentaje(0);
      }
    } catch (error: any) {
      setMessage({ text: error?.response?.data?.message || "Error en reporte por alumno.", isError: true });
    } finally {
      setLoading(false);
    }
  };

  const exportarExcel = async () => {
    try {
      const res = await api.get("/horario/docente/reporte-diario/exportar-excel", {
        params: { fecha },
        responseType: "blob",
      });
      downloadBlob(res.data, `reporte_bloques_${fecha}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    } catch (error: any) {
      setMessage({ text: error?.response?.data?.message || "Error exportando Excel.", isError: true });
    }
  };

  const exportarPdf = async () => {
    try {
      const res = await api.get("/horario/docente/reporte-diario/exportar-pdf", {
        params: { fecha },
        responseType: "blob",
      });
      downloadBlob(res.data, `reporte_bloques_${fecha}.pdf`, "application/pdf");
    } catch (error: any) {
      setMessage({ text: error?.response?.data?.message || "Error exportando PDF.", isError: true });
    }
  };

  const totalBloquesDiario = useMemo(() => diario.length, [diario]);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <div className="h-14 border-b border-slate-200 flex items-center gap-3 px-6 bg-white sticky top-0 z-10">
        <SidebarTrigger className="text-slate-500" />
        <FileBarChart2 className="w-4 h-4 text-blue-700" />
        <h1 className="text-sm font-semibold text-slate-900">Reportes de Asistencia por Bloques</h1>
      </div>

      <div className="p-6 space-y-5">
        {message && (
          <div className={`px-3 py-2 rounded text-sm border ${message.isError ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
            {message.text}
          </div>
        )}

        <div className="bg-white border rounded p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600">Fecha</label>
            <input type="date" className="w-full h-9 mt-1 border rounded px-2 text-sm" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Bloque</label>
            <select className="w-full h-9 mt-1 border rounded px-2 text-sm" value={idHorario} onChange={(e) => setIdHorario(e.target.value)}>
              <option value="">Seleccionar</option>
              {bloques.map((b) => (
                <option key={b.id_horario} value={b.id_horario}>{`${b.curso} | ${b.grado} ${b.seccion || ""} | ${String(b.hora_inicio).slice(0, 5)}-${String(b.hora_fin).slice(0, 5)}`}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={fetchReporteBloque} className="w-full h-9 rounded bg-blue-600 text-white text-sm font-semibold">Reporte por bloque</button>
          </div>
          <div className="flex items-end gap-2">
            <button onClick={exportarExcel} className="h-9 px-3 rounded bg-emerald-600 text-white text-sm inline-flex items-center gap-1"><Download className="w-4 h-4" /> Excel</button>
            <button onClick={exportarPdf} className="h-9 px-3 rounded bg-slate-700 text-white text-sm inline-flex items-center gap-1"><Download className="w-4 h-4" /> PDF</button>
          </div>
        </div>

        {resumenBloque && (
          <div className="bg-white border rounded p-3 text-sm grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>Presente: <b>{resumenBloque.Presente || 0}</b></div>
            <div>Ausente: <b>{resumenBloque.Ausente || 0}</b></div>
            <div>Tardanza: <b>{resumenBloque.Tardanza || 0}</b></div>
            <div>Justificado: <b>{resumenBloque.Justificado || 0}</b></div>
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
              {detalleBloque.length === 0 ? (
                <tr><td colSpan={4} className="px-3 py-5 text-slate-500">Sin datos de reporte por bloque.</td></tr>
              ) : (
                detalleBloque.map((d) => (
                  <tr key={`${d.id_alumno}-${d.dni}`} className="border-t">
                    <td className="px-3 py-2">{d.dni}</td>
                    <td className="px-3 py-2">{d.alumno}</td>
                    <td className="px-3 py-2">{d.estado}</td>
                    <td className="px-3 py-2">{d.observacion || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white border rounded p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Reporte diario por curso/grado</h2>
            <button onClick={fetchReporteDiario} className="h-8 px-3 rounded bg-blue-600 text-white text-xs font-semibold">Actualizar</button>
          </div>
          <div className="text-xs text-slate-500">Bloques del día: <b>{totalBloquesDiario}</b></div>
          <div className="overflow-x-auto border rounded">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left px-3 py-2">Curso</th>
                  <th className="text-left px-3 py-2">Grado</th>
                  <th className="text-left px-3 py-2">Hora</th>
                  <th className="text-left px-3 py-2">P</th>
                  <th className="text-left px-3 py-2">A</th>
                  <th className="text-left px-3 py-2">T</th>
                  <th className="text-left px-3 py-2">J</th>
                </tr>
              </thead>
              <tbody>
                {diario.length === 0 ? (
                  <tr><td colSpan={7} className="px-3 py-5 text-slate-500">Sin datos diarios.</td></tr>
                ) : (
                  diario.map((r) => (
                    <tr key={r.id_horario} className="border-t">
                      <td className="px-3 py-2">{r.curso}</td>
                      <td className="px-3 py-2">{r.grado}</td>
                      <td className="px-3 py-2">{String(r.hora_inicio).slice(0, 5)}-{String(r.hora_fin).slice(0, 5)}</td>
                      <td className="px-3 py-2">{r.presentes || 0}</td>
                      <td className="px-3 py-2">{r.ausentes || 0}</td>
                      <td className="px-3 py-2">{r.tardanzas || 0}</td>
                      <td className="px-3 py-2">{r.justificados || 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border rounded p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-800">Reporte por alumno (rango)</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input className="h-9 border rounded px-2 text-sm" placeholder="ID Alumno" value={idAlumno} onChange={(e) => setIdAlumno(e.target.value)} />
            <input type="date" className="h-9 border rounded px-2 text-sm" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
            <input type="date" className="h-9 border rounded px-2 text-sm" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
            <button onClick={fetchReporteAlumno} className="h-9 rounded bg-blue-600 text-white text-sm font-semibold">Consultar alumno</button>
          </div>

          <div className="text-sm text-slate-700">Porcentaje de asistencia: <b>{porcentaje}%</b></div>

          <div className="overflow-x-auto border rounded">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left px-3 py-2">Fecha</th>
                  <th className="text-left px-3 py-2">Curso</th>
                  <th className="text-left px-3 py-2">Grado</th>
                  <th className="text-left px-3 py-2">Hora</th>
                  <th className="text-left px-3 py-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {alumnoDetalle.length === 0 ? (
                  <tr><td colSpan={5} className="px-3 py-5 text-slate-500">Sin datos de alumno.</td></tr>
                ) : (
                  alumnoDetalle.map((r, idx) => (
                    <tr key={`${r.fecha}-${r.hora_inicio}-${idx}`} className="border-t">
                      <td className="px-3 py-2">{r.fecha}</td>
                      <td className="px-3 py-2">{r.curso}</td>
                      <td className="px-3 py-2">{r.grado}</td>
                      <td className="px-3 py-2">{String(r.hora_inicio).slice(0, 5)}-{String(r.hora_fin).slice(0, 5)}</td>
                      <td className="px-3 py-2">{r.estado}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {loading && <div className="text-sm text-slate-500">Procesando...</div>}
      </div>
    </div>
  );
}
