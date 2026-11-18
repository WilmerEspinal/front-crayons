import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  fetchSummaryStats, fetchPeriodsList,
  type RecentPayment, type Debtor,
  type DashboardSummaryData, type AcademicPeriod
} from "@/services/dashboardService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GraficoECharts from "@/components/GraficoECharts";
import { AlertCircle, Loader2, AlertTriangle, RefreshCw } from "lucide-react";

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// Paleta tomada de lessa-front
const COLORS = {
  primary: '#16498C',
  secondary: '#F2AE2E',
  active: '#16498C',
  inactive: '#cbd5e1',
  teacherActive: '#F2AE2E',
  teacherInactive: '#cbd5e1',
  present: '#10b981',
  absent: '#ef4444',
  pending: '#e2e8f0',
  paid: '#10b981',
  debt: '#ef4444',
  danger: '#ef4444',
  grid: '#e2e8f0',
  // Pareja validada para daltonismo, de la familia del azul y el ambar de lessa
  mujeres: '#c98210',
  varones: '#1f5fae'
};

// Estilo comun de ejes y tooltips de ECharts, con los tonos de lessa
const EJE = {
  axisLine: { show: false },
  axisTick: { show: false },
  axisLabel: { fontSize: 11, color: '#475569' },
  splitLine: { lineStyle: { color: '#e2e8f0', type: 'dashed' } },
};
const TOOLTIP = {
  backgroundColor: '#ffffff',
  borderColor: '#e2e8f0',
  borderWidth: 1,
  padding: [6, 10],
  textStyle: { fontSize: 12, color: '#1e293b' },
  extraCssText: 'box-shadow:0 1px 3px rgba(0,0,0,0.1);border-radius:6px;',
};
const ETIQUETA_BARRA = { show: true, position: 'top', fontSize: 11, fontWeight: 600, color: '#334155' };

export default function DashboardHome() {
  const [summaryData, setSummaryData] = useState<DashboardSummaryData | null>(null);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      const periodsData = await fetchPeriodsList();
      setPeriods(periodsData);
      let defaultYear = new Date().getFullYear().toString();
      if (periodsData && periodsData.length > 0) {
        const activePeriod = periodsData.find(p => p.activo === 1);
        if (activePeriod) defaultYear = activePeriod.anio.toString();
        else defaultYear = periodsData[0].anio.toString();
      }
      setSelectedYear(defaultYear);
      fetchDashboardData(defaultYear);
    };
    initData();
  }, []);

  const fetchDashboardData = async (year: string, forceRefresh: boolean = false) => {
    if (!year) return;
    try {
      setIsLoading(true);
      const summary = await fetchSummaryStats(year, forceRefresh);
      if (summary) {
        setSummaryData(summary);
        setRecentPayments(summary.recent_payments || []);
        setDebtors(summary.debtors || []);
      }
    } catch (error) { } finally { setIsLoading(false); }
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    fetchDashboardData(year);
  };

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency', currency: 'PEN', minimumFractionDigits: 2
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount || 0);
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-slate-600">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-[#16498C]" />
        <p className="text-sm font-medium">Cargando panel...</p>
      </div>
    );
  }

  if (!summaryData) return (
    <div className="flex h-[80vh] flex-col items-center justify-center text-slate-600">
      <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
      <h2 className="text-lg font-semibold text-slate-900">Error</h2>
      <p className="text-sm mt-1 text-slate-600">No se pudo cargar el dashboard.</p>
    </div>
  );

  const { kpis, tendencia_ingresos, comparativa_pagos } = summaryData;
  const periodoActivo = kpis.periodo_activo === 1;

  const paymentStatusData = [
    { name: "Pagado", value: comparativa_pagos.pagado, color: COLORS.paid },
    { name: "Pendiente", value: comparativa_pagos.pendiente, color: COLORS.debt }
  ];

  const alumnosPorGrado = (summaryData.alumnos_por_grado || []).map((g) => ({
    grado: g.grado.charAt(0) + g.grado.slice(1).toLowerCase(),
    Mujeres: g.mujeres,
    Varones: g.varones,
  }));
  const totalActivos = kpis.estudiantes_activos;
  const totalDocentes = kpis.docentes_activos;

  const teacherPopulationData = [
    { name: "Activos", value: kpis.docentes_activos, color: COLORS.teacherActive },
    { name: "Inactivos", value: kpis.docentes_inactivos, color: COLORS.teacherInactive }
  ];

  const dailyAttendanceData = [
    { name: "Presentes", value: kpis.asistencia_hoy_presentes, fill: COLORS.present },
    { name: "Ausentes", value: kpis.asistencia_hoy_ausentes, fill: COLORS.absent },
    { name: "Sin Registro", value: Math.max(0, kpis.estudiantes_activos - kpis.asistencia_hoy_evaluados), fill: COLORS.pending }
  ];

  const monthlyTrendData = tendencia_ingresos.map(item => ({
    name: MONTH_NAMES[item.mes - 1] || item.mes.toString(),
    Recaudación: parseFloat(item.total)
  }));


  return (
    <div className="flex-1 bg-[#f8fafc] p-4 space-y-3 font-[Inter,ui-sans-serif,system-ui,sans-serif] antialiased">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-[#1e293b] leading-tight">Panel Principal Directivo</h1>
          <p className="text-[13px] text-[#475569]">Control global consolidado.</p>
        </div>
        <div className="flex items-center gap-2">
          {!periodoActivo && (
            <span className="flex items-center gap-1 text-[12px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
              <AlertTriangle className="h-3.5 w-3.5" /> PERÍODO INACTIVO
            </span>
          )}
          <Button variant="outline" size="icon" className="h-8 w-8 bg-white border-[#e2e8f0] shadow-none" onClick={() => fetchDashboardData(selectedYear, true)} title="Recargar datos (Ignorar caché)">
            <RefreshCw className="h-3.5 w-3.5 text-[#475569]" />
          </Button>
          <Select value={selectedYear} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[120px] h-8 bg-white border-[#e2e8f0] text-xs shadow-none">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              {periods.map(p => (
                <SelectItem key={p.id} value={p.anio.toString()}>
                  {p.anio} {p.activo === 1 ? ' (Activo)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* --- RESUMEN GENERAL --- */}
      <section className="space-y-1.5">
        <TituloSeccion texto="Resumen General" />
        <div className="flex flex-wrap gap-1.5">
          <ResumenCard title="Alumnos Activos" value={totalActivos} />
          <ResumenCard title="Mujeres" value={kpis.alumnas_activas} />
          <ResumenCard title="Varones" value={kpis.alumnos_varones_activos} />
          <ResumenCard title="Docentes Activos" value={totalDocentes} />
          <ResumenCard title="Padres con Acceso" value={kpis.apoderados_con_acceso} />
          <ResumenCard title="Justificaciones Pendientes" value={kpis.justificaciones_pendientes} />
          <ResumenCard title="Recaudación Mes" value={formatCurrency(kpis.ingresos_mensuales)} />
          <ResumenCard title="Deuda Estudiantil" value={formatCurrency(kpis.pagos_pendientes)} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-2">
          <Panel titulo={`Alumnos activos por grado (${selectedYear})`} extra={
            <div className="flex items-center gap-3 text-[12px] text-[#475569]">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: COLORS.mujeres }} />Mujeres</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: COLORS.varones }} />Varones</span>
            </div>
          }>
            {alumnosPorGrado.length > 0 ? (
              <GraficoECharts alto={200} opciones={{
                tooltip: { ...TOOLTIP, trigger: 'axis', axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(241,245,249,0.8)' } } },
                grid: { left: 30, right: 8, top: 24, bottom: 24 },
                xAxis: { type: 'category', data: alumnosPorGrado.map((g) => g.grado), ...EJE, splitLine: { show: false } },
                yAxis: { type: 'value', minInterval: 1, ...EJE },
                series: [
                  { name: 'Mujeres', type: 'bar', data: alumnosPorGrado.map((g) => g.Mujeres), barMaxWidth: 42, barGap: '10%', barCategoryGap: '28%', itemStyle: { color: COLORS.mujeres, borderRadius: [2, 2, 0, 0] }, label: ETIQUETA_BARRA },
                  { name: 'Varones', type: 'bar', data: alumnosPorGrado.map((g) => g.Varones), barMaxWidth: 42, itemStyle: { color: COLORS.varones, borderRadius: [2, 2, 0, 0] }, label: ETIQUETA_BARRA },
                ],
              }} />
            ) : <SinDatos texto="Sin alumnos activos en este año" />}
          </Panel>

          <Panel titulo="Mujeres y varones">
            <DonaConLeyenda datos={[
              { name: "Mujeres", value: kpis.alumnas_activas, color: COLORS.mujeres },
              { name: "Varones", value: kpis.alumnos_varones_activos, color: COLORS.varones },
            ]} mostrarPorcentaje vertical />
          </Panel>
        </div>
      </section>

      {/* --- FINANZAS --- */}
      <section className="space-y-1.5">
        <TituloSeccion texto="Finanzas" />

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-2">
          <Panel titulo={`Recaudación ${selectedYear} · desde marzo`}>
            {monthlyTrendData.length > 0 ? (
              <GraficoECharts alto={200} opciones={{
                tooltip: { ...TOOLTIP, trigger: 'axis', valueFormatter: (v: number) => formatCurrency(v) },
                grid: { left: 52, right: 12, top: 14, bottom: 24 },
                xAxis: { type: 'category', boundaryGap: false, data: monthlyTrendData.map((m) => m.name), ...EJE, splitLine: { show: false } },
                yAxis: { type: 'value', ...EJE, axisLabel: { ...EJE.axisLabel, formatter: (v: number) => (v >= 1000 ? `S/ ${v / 1000}k` : `S/ ${v}`) } },
                series: [{
                  name: 'Recaudación', type: 'line', smooth: true, showSymbol: false, symbolSize: 8,
                  data: monthlyTrendData.map((m) => m.Recaudación),
                  lineStyle: { width: 3, color: COLORS.primary }, itemStyle: { color: COLORS.primary },
                }],
              }} />
            ) : <SinDatos texto="Sin datos suficientes" />}
          </Panel>

          <Panel titulo="Progreso Anual">
            <DonaConLeyenda datos={paymentStatusData} formatear={formatCurrency} mostrarPorcentaje vertical />
          </Panel>
        </div>
      </section>

      {/* --- PERSONAL Y POBLACIÓN --- */}
      <section className="space-y-1.5">
        <TituloSeccion texto="Personal y Población" />
        <div className="grid grid-cols-1 md:grid-cols-[auto_auto_minmax(0,1fr)] gap-2">
          <Panel titulo="Alumnos">
            <PastelConLeyenda datos={[
              { name: "Activos", value: kpis.estudiantes_activos, color: COLORS.active },
              { name: "Retirados", value: kpis.alumnos_retirados, color: COLORS.inactive },
              { name: "Expulsados", value: kpis.alumnos_expulsados, color: COLORS.danger },
              { name: "Egresados", value: kpis.alumnos_egresados, color: COLORS.secondary },
            ]} />
          </Panel>

          <Panel titulo="Docentes">
            <PastelConLeyenda datos={teacherPopulationData} />
          </Panel>

          <Panel titulo="Asistencia Hoy" extra={<span className="text-[12px] text-[#475569]">Ausentes: <b className="text-red-500">{kpis.asistencia_hoy_ausentes}</b></span>}>
            <GraficoECharts alto={230} opciones={{
              tooltip: { ...TOOLTIP, trigger: 'axis', axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(241,245,249,0.8)' } } },
              grid: { left: 34, right: 8, top: 16, bottom: 24 },
              xAxis: { type: 'category', data: dailyAttendanceData.map((d) => d.name), ...EJE, axisLabel: { ...EJE.axisLabel, interval: 0 }, splitLine: { show: false } },
              yAxis: { type: 'value', minInterval: 1, ...EJE },
              series: [{
                name: 'Alumnos', type: 'bar', barMaxWidth: 64,
                data: dailyAttendanceData.map((d) => ({ value: d.value, itemStyle: { color: d.fill, borderRadius: [2, 2, 0, 0] } })),
              }],
            }} />
          </Panel>
        </div>
      </section>

      {/* --- LISTADOS RÁPIDOS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <Panel titulo="Últimos Pagos">
          {recentPayments.length > 0 ? recentPayments.slice(0, 4).map((p) => (
            <FilaLista key={p.id} nombre={p.studentName} detalle={p.type} monto={`+${formatCurrency(p.amount)}`} tono="ok" />
          )) : <SinDatos texto="No hay pagos recientes" />}
        </Panel>

        <Panel titulo="Principales Morosos">
          {debtors.length > 0 ? debtors.slice(0, 4).map((d) => (
            <FilaLista key={d.id} nombre={d.studentName} detalle={`${d.months} ${d.months === 1 ? 'mes' : 'meses'} de atraso`} monto={formatCurrency(d.amount)} tono="deuda" />
          )) : <SinDatos texto="Sin registro de morosos" />}
        </Panel>
      </div>
    </div>
  );
}

/** Titulo pequenio de cada bloque del panel */
function TituloSeccion({ texto }: { texto: string }) {
  return <h2 className="text-[12px] font-bold tracking-widest uppercase text-[#475569] pl-0.5">{texto}</h2>;
}

/** Contenedor blanco con borde suave, igual al de los graficos de lessa */
function Panel({ titulo, extra, className = "", children }: { titulo: string; extra?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <div className={`bg-white border border-[#e2e8f0] rounded-lg p-2.5 flex flex-col min-w-0 ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[11px] font-bold tracking-widest uppercase text-[#475569]">{titulo}</p>
        {extra}
      </div>
      <div className="flex-1 flex flex-col justify-center">{children}</div>
    </div>
  );
}

/** Mensaje cuando un bloque no tiene datos */
function SinDatos({ texto }: { texto: string }) {
  return <p className="text-[13px] text-[#475569] py-6 text-center">{texto}</p>;
}

/** Dona con su leyenda pegada al costado, centradas juntas dentro del panel */
function DonaConLeyenda({ datos, formatear, mostrarPorcentaje = false, vertical = false }: {
  datos: { name: string; value: number; color: string }[];
  formatear?: (v: number) => string;
  mostrarPorcentaje?: boolean;
  /** Leyenda debajo de la dona, para paneles angostos */
  vertical?: boolean;
}) {
  const total = datos.reduce((suma, d) => suma + Number(d.value || 0), 0);
  return (
    <div className={`flex items-center justify-center ${vertical ? "flex-col gap-2 px-2" : "gap-4"}`}>
      <div className="shrink-0">
        <GraficoECharts alto={vertical ? 160 : 170} ancho={vertical ? 160 : 170} opciones={{
          tooltip: { ...TOOLTIP, trigger: 'item', formatter: (p: { name: string; value: number; percent: number }) => `${p.name}: <b>${formatear ? formatear(p.value) : p.value}</b> (${p.percent}%)` },
          series: [{
            type: 'pie', radius: ['56%', '92%'], avoidLabelOverlap: true, label: { show: false }, labelLine: { show: false },
            itemStyle: { borderColor: '#ffffff', borderWidth: 2 },
            data: datos.map((d) => ({ name: d.name, value: d.value, itemStyle: { color: d.color } })),
          }],
        }} />
      </div>
      <div className="grid grid-cols-[10px_auto_auto] items-center gap-x-2 gap-y-2 text-[12px]">
        {datos.map((d) => (
          <React.Fragment key={d.name}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-[#475569] whitespace-nowrap">{d.name}</span>
            <span className="font-bold text-[#1e293b] tabular-nums text-right whitespace-nowrap">
              {formatear ? formatear(d.value) : d.value}
              {mostrarPorcentaje && total > 0 && (
                <span className="font-normal text-[#64748b] ml-1">({Math.round((Number(d.value) / total) * 100)}%)</span>
              )}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/** Pastel completo con leyenda arriba, sin etiquetas afuera (estilo "Referer of a Website" de ECharts) */
function PastelConLeyenda({ datos }: { datos: { name: string; value: number; color: string }[] }) {
  return (
    <GraficoECharts alto={220} ancho={260} opciones={{
      tooltip: { ...TOOLTIP, trigger: 'item', formatter: '{b}: <b>{c}</b> ({d}%)' },
      legend: { top: 0, left: 'center', itemWidth: 14, itemHeight: 9, itemGap: 12, textStyle: { fontSize: 12, color: '#475569' } },
      series: [{
        type: 'pie', radius: '68%', center: ['50%', '58%'],
        label: { show: false }, labelLine: { show: false },
        itemStyle: { borderColor: '#ffffff', borderWidth: 1.5 },
        emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.3)' } },
        data: datos.map((d) => ({ name: d.name, value: d.value, itemStyle: { color: d.color } })),
      }],
    }} />
  );
}

/** Fila de los listados de pagos y morosos */
function FilaLista({ nombre, detalle, monto, tono }: { nombre: string; detalle: string; monto: string; tono: "ok" | "deuda" }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[#e2e8f0] last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-[#1e293b] truncate uppercase">{nombre}</p>
        <p className={`text-[11px] ${tono === "deuda" ? "text-red-500 font-semibold" : "text-[#475569]"}`}>{detalle}</p>
      </div>
      <span className={`text-[13px] font-bold tabular-nums ml-2 ${tono === "deuda" ? "text-red-500" : "text-emerald-600"}`}>{monto}</span>
    </div>
  );
}

interface ResumenCardProps {
  title: string;
  value: number | string;
}

/** Tarjeta corta del resumen general: numero y etiqueta, estilo lessa */
function ResumenCard({ title, value }: ResumenCardProps) {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-lg px-3.5 py-3 min-w-[96px]">
      <p className="text-[20px] font-bold text-[#1e293b] leading-tight tabular-nums">{value}</p>
      <p className="text-[11px] text-[#475569] leading-tight whitespace-nowrap">{title}</p>
    </div>
  );
}
