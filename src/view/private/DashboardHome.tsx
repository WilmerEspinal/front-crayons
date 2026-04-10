import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  fetchSummaryStats, fetchPeriodsList,
  type RecentPayment, type Debtor,
  type DashboardSummaryData, type AcademicPeriod
} from "@/services/dashboardService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, TrendingDown, CreditCard,
  AlertCircle, Loader2, DollarSign, Target,
  AlertTriangle, GraduationCap, Clock, CheckCircle2,
  Briefcase, RefreshCw
} from "lucide-react";

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const CURRENT_MONTH = new Date().toLocaleDateString('es-PE', { month: 'long' });

const COLORS = {
  active: '#3b82f6',
  inactive: '#94a3b8',
  teacherActive: '#8b5cf6',
  teacherInactive: '#cbd5e1',
  present: '#10b981',
  absent: '#f43f5e',
  pending: '#e2e8f0',
  paid: '#10b981',
  debt: '#f43f5e'
};

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
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-600" />
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

  const studentPopulationData = [
    { name: "Activos", value: kpis.estudiantes_activos, color: COLORS.active },
    { name: "Retirados", value: kpis.estudiantes_inactivos, color: COLORS.inactive }
  ];

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

  const ingresosActuales = parseFloat(kpis.ingresos_mensuales);
  const ingresosAnteriores = parseFloat(kpis.ingresos_mes_anterior);
  const crecimiento = ingresosAnteriores > 0 ? ((ingresosActuales - ingresosAnteriores) / ingresosAnteriores) * 100 : 0;

  return (
    <div className="flex-1 bg-slate-50 p-4 md:p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Panel Principal Directivo</h1>
          <p className="text-xs text-slate-500 mt-0.5">Control global consolidado.</p>
        </div>
        <div className="flex items-center gap-3">
          {!periodoActivo && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-100 px-2 py-1 rounded shadow-sm border border-rose-200">
              <AlertTriangle className="h-4 w-4" /> PERÍODO INACTIVO
            </span>
          )}
          <Button variant="outline" size="icon" className="h-8 w-8 bg-white border-slate-300 shadow-sm" onClick={() => fetchDashboardData(selectedYear, true)} title="Recargar datos (Ignorar caché)">
            <RefreshCw className="h-3.5 w-3.5 text-slate-600" />
          </Button>
          <Select value={selectedYear} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[110px] h-8 bg-white border-slate-300 text-xs shadow-sm">
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

      {/* --- BLOQUE 1: FINANZAS Y RECAUDACIÓN --- */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Finanzas</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            title="Recaudación Mes"
            value={formatCurrency(kpis.ingresos_mensuales)}
            icon={<DollarSign className="h-4 w-4 text-emerald-600" />}
            trend={`${crecimiento >= 0 ? '+' : ''}${crecimiento.toFixed(1)}% vs anterior`}
            trendPositive={crecimiento >= 0}
          />
          <MetricCard
            title="Meta del Mes"
            value={formatCurrency(kpis.monto_esperado_mes)}
            icon={<Target className="h-4 w-4 text-slate-500" />}
            desc={`Esperado para ${CURRENT_MONTH}`}
          />
          <MetricCard
            title="Deuda Estudiantil"
            value={formatCurrency(kpis.pagos_pendientes)}
            icon={<AlertCircle className="h-4 w-4 text-rose-600" />}
            desc={`${kpis.estudiantes_con_deuda} alumnos en mora`}
            highlight="danger"
          />
          <MetricCard
            title="Proyección Anual"
            value={formatCurrency(kpis.monto_esperado_anio)}
            icon={<CreditCard className="h-4 w-4 text-blue-600" />}
            desc={`Meta de ${selectedYear}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Gráfico Financiero Principal */}
        <Card className="lg:col-span-2 shadow-sm border border-slate-200">
          <CardHeader className="p-3 border-b border-slate-100 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-800">Recaudación (6 meses)</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-4">
            <div className="h-[220px] w-full">
              {monthlyTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(val) => `S/ ${val}`} />
                    <RechartsTooltip
                      formatter={(value: any) => [formatCurrency(value), "Recaudación"]}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="Recaudación" stroke="#2563EB" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">Sin datos suficientes</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Distribución Financiera */}
        <Card className="shadow-sm border border-slate-200">
          <CardHeader className="p-3 border-b border-slate-100 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-800">Progreso Anual</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pb-4">
            <div className="h-[180px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentStatusData}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {paymentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: any) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="px-4 space-y-1.5 mt-2">
              {paymentStatusData.map((d, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-slate-600 font-medium">{d.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{formatCurrency(d.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- BLOQUE 2: POBLACIÓN EDUCATIVA --- */}
      <div className="space-y-2 pt-1">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Personal y Población</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

          {/* Alumnos */}
          <Card className="shadow-sm border border-slate-200">
            <CardHeader className="p-3 border-b border-slate-100 flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-slate-800">Alumnos</CardTitle>
              <GraduationCap className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent className="p-0 flex items-center h-[160px]">
              <div className="w-[50%] h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={studentPopulationData} innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value">
                      {studentPopulationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-[50%] pr-4 space-y-3">
                <div>
                  <div className="text-xl font-bold leading-none text-slate-900">{kpis.estudiantes_activos}</div>
                  <div className="text-[10px] text-blue-600 font-semibold uppercase mt-0.5">Activos</div>
                </div>
                <div>
                  <div className="text-sm font-bold leading-none text-slate-600">{kpis.estudiantes_inactivos}</div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">Retirados</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Docentes */}
          <Card className="shadow-sm border border-slate-200">
            <CardHeader className="p-3 border-b border-slate-100 flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-slate-800">Docentes</CardTitle>
              <Briefcase className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent className="p-0 flex items-center h-[160px]">
              <div className="w-[50%] h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={teacherPopulationData} innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value">
                      {teacherPopulationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-[50%] pr-4 space-y-3">
                <div>
                  <div className="text-xl font-bold leading-none text-slate-900">{kpis.docentes_activos}</div>
                  <div className="text-[10px] text-purple-600 font-semibold uppercase mt-0.5">Activos</div>
                </div>
                <div>
                  <div className="text-sm font-bold leading-none text-slate-600">{kpis.docentes_inactivos}</div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">Inactivos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Asistencia Global Hoy */}
          <Card className="shadow-sm border border-slate-200 flex flex-col">
            <CardHeader className="p-3 border-b border-slate-100 flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-800">Asistencia Hoy</CardTitle>
                <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Alumnos con ausencias: <span className="font-bold text-rose-600">{kpis.asistencia_hoy_ausentes}</span></p>
              </div>
              <Clock className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent className="p-2 pb-0 flex-1 flex flex-col">
              <div className="w-full flex-1 min-h-[120px] mt-1 -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyAttendanceData} margin={{ top: 15, right: 5, left: -25, bottom: -5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }} dy={5} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                    <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={45}>
                      {dailyAttendanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- BLOQUE 3: LISTADOS RÁPIDOS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-1">
        {/* Últimos Pagos */}
        <Card className="shadow-sm border border-slate-200">
          <CardHeader className="p-3 border-b border-slate-100 pb-2 flex-row justify-between items-center">
            <CardTitle className="text-sm font-semibold text-slate-800">Últimos Pagos</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="p-2">
            <div className="space-y-0.5">
              {recentPayments.length > 0 ? recentPayments.slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 truncate uppercase">{p.studentName}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{p.type}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded ml-2 border border-emerald-100">
                    +{formatCurrency(p.amount)}
                  </span>
                </div>
              )) : (
                <p className="text-xs text-center text-slate-400 py-4">No hay pagos recientes</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Deudores */}
        <Card className="shadow-sm border border-slate-200">
          <CardHeader className="p-3 border-b border-slate-100 pb-2 flex-row justify-between items-center">
            <CardTitle className="text-sm font-semibold text-slate-800">Principales Morosos</CardTitle>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </CardHeader>
          <CardContent className="p-2">
            <div className="space-y-0.5">
              {debtors.length > 0 ? debtors.slice(0, 4).map((d) => (
                <div key={d.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 truncate uppercase">{d.studentName}</p>
                    <p className="text-[10px] text-rose-600 font-semibold">{d.months} {d.months === 1 ? 'mes' : 'meses'} atraso</p>
                  </div>
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded ml-2 border border-rose-100">
                    {formatCurrency(d.amount)}
                  </span>
                </div>
              )) : (
                <p className="text-xs text-center text-slate-400 py-4">Sin registro de morosos</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, desc, trend, trendPositive, highlight }: any) {
  return (
    <Card className={`shadow-sm border transition-colors ${highlight === 'danger' ? 'border-rose-200 bg-rose-50/10' : 'border-slate-200 hover:border-slate-300'}`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight">{title}</h3>
          <div className={`${highlight === 'danger' ? 'bg-rose-100 p-1 rounded-md' : 'bg-slate-100 p-1 rounded-md'}`}>
            {icon}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className={`text-[19px] font-bold tracking-tight leading-none ${highlight === 'danger' ? 'text-rose-700' : 'text-slate-900'}`}>
            {value}
          </span>
          {trend && (
            <p className={`text-[10px] flex items-center font-bold ${trendPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trendPositive ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
              {trend}
            </p>
          )}
          {desc && !trend && (
            <p className="text-[10px] text-slate-500 font-medium leading-tight">{desc}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
