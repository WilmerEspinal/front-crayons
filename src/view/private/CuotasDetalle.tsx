import { useState, useEffect, Fragment } from 'react';
import api from "@/lib/axios";
import axios from 'axios';
import { Search, User, Calendar, CreditCard, ChevronDown, ChevronRight, FileDown, Printer, Banknote, Loader2, AlertCircle, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/context/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchDebtorsReport,
  fetchGradesList,
  fetchDailyPayments,
  fetchPeriodsList,
  type DebtorReportItem,
  type DailyPayment,
  type Grade as GradeFromService,
  type AcademicPeriod
} from "@/services/dashboardService";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Tipos de datos según la respuesta REAL de la API
interface PagoDetalle {
  id: number;
  id_matricula: number;
  tipo: string; // "Matricula" o "Cuota"
  numero_cuota: number | null;
  monto: string;
  fecha_vencimiento: string;
  fecha_pago: string | null;
  monto_pagado: string;
  estado: string; // "Pendiente", "Pagado", "Parcial"
  metodo_pago: string | null;
  numero_recibo: string | null;
  observaciones: string | null;
  created_at: string;
  updated_at: string;
}

interface ResumenEstudiante {
  id_matricula: number;
  total_cuotas: number;
  monto_total: string;
  monto_total_pagado: string;
  saldo_pendiente: string;
  cuotas_pagadas: string;
  cuotas_pendientes: string;
  cuotas_vencidas: string;
}

interface DatosEstudiante {
  estudiante: string;
  grado: string;
  anio: string;
  resumen: ResumenEstudiante;
  detalle: (PagoDetalle & { periodo_activo?: number; matricula_estado?: string })[];
  dni: string;
}

interface SearchApiResponse {
  status: boolean;
  message?: string;
  data: DatosEstudiante;
}

const CuotasDetalle = () => {
  const { } = useAuth();
  const [dni, setDni] = useState('');
  const [año, setAño] = useState(new Date().getFullYear().toString());
  const [datosEstudiante, setDatosEstudiante] = useState<DatosEstudiante | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPagoLoading, setIsPagoLoading] = useState(false);
  const [isMatriculaLoading, setIsMatriculaLoading] = useState(false);
  const [showPagoDialog, setShowPagoDialog] = useState(false);
  const [showMatriculaDialog, setShowMatriculaDialog] = useState(false);
  const [pagoPresencial, setPagoPresencial] = useState(false);
  const [pagoMatriculaPresencial, setPagoMatriculaPresencial] = useState(false);
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState<PagoDetalle | null>(null);
  const [montoPagadoReq, setMontoPagadoReq] = useState('');
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [observaciones, setObservaciones] = useState('');

  // Estados para el reporte
  const [viewMode, setViewMode] = useState<'search' | 'report' | 'daily'>('search');
  const [reportData, setReportData] = useState<DebtorReportItem[]>([]);
  const [dailyPayments, setDailyPayments] = useState<DailyPayment[]>([]);
  const [grades, setGrades] = useState<GradeFromService[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>("Todos");
  const [selectedStatus, setSelectedStatus] = useState<string>("Deuda");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [isDailyLoading, setIsDailyLoading] = useState(false);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [periods, setPeriods] = useState<AcademicPeriod[]>([]);

  // Custom Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    type: "info" | "success" | "danger" | "warning";
    showCancel?: boolean;
  }>({
    isOpen: false,
    title: "",
    description: "",
    type: "info",
    showCancel: true
  });

  const showAlert = (title: string, description: string, type: "success" | "danger" | "warning" | "info" = "info") => {
    setModalConfig({
      isOpen: true,
      title,
      description,
      confirmText: "Aceptar",
      showCancel: false,
      type
    });
  };

  // const showConfirm = (title: string, description: string, onConfirm: () => void, type: "info" | "success" | "danger" | "warning" = "info") => {
  //   setModalConfig({
  //     isOpen: true,
  //     title,
  //     description,
  //     onConfirm,
  //     confirmText: "Confirmar",
  //     cancelText: "Cancelar",
  //     showCancel: true,
  //     type
  //   });
  // };

  // Cargar datos al montar
  useEffect(() => {
    const loadData = async () => {
      try {
        const [gradesList, periodsList] = await Promise.all([
          fetchGradesList(),
          fetchPeriodsList()
        ]);
        setGrades(gradesList);
        setPeriods(periodsList);
      } catch (error) {
      }
    };
    loadData();
  }, []);

  const toggleExpand = (dni: string) => {
    setExpandedStudent(expandedStudent === dni ? null : dni);
  };

  const handleSearchReport = async () => {
    setIsReportLoading(true);
    setExpandedStudent(null);
    try {
      const data = await fetchDebtorsReport(selectedGrade, selectedStatus, selectedYear);
      setReportData(data);
    } catch (error) {
    } finally {
      setIsReportLoading(false);
    }
  };

  const handleLoadDailyReport = async () => {
    setIsDailyLoading(true);
    try {
      const data = await fetchDailyPayments();
      setDailyPayments(data);
    } catch (error) {
    } finally {
      setIsDailyLoading(false);
    }
  };

  const handleExportExcel = () => {
    const dataToExport = reportData.map(item => ({
      DNI: item.dni,
      Estudiante: item.studentName,
      Grado: item.grade,
      Estado: item.status,
      'Deuda Total': `S/ ${item.amountOwed.toFixed(2)}`,
      'Meses Pendientes': item.monthsOwed,
      'Último Pago': item.lastPaymentDate === 'Sin pagos' ? 'Sin pagos' : new Date(item.lastPaymentDate).toLocaleDateString(),
      Año: item.year
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte_Deudores");
    XLSX.writeFile(wb, `Reporte_Deudores_${selectedGrade}_${selectedYear}.xlsx`);
  };

  const handlePrintReceipt = (payment: DailyPayment) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('RECIBO DE PAGO', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Institución Educativa "Mi Cole"', 105, 30, { align: 'center' });
    doc.text(`N° Recibo: ${payment.receiptNumber}`, 150, 50);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 150, 56);
    doc.text(`Estudiante: ${payment.studentName}`, 20, 50);
    doc.text(`DNI: ${payment.dni}`, 20, 56);

    autoTable(doc, {
      startY: 70,
      head: [['Concepto', 'Método de Pago', 'Importe']],
      body: [[payment.concept, payment.method, `S/ ${payment.amount.toFixed(2)}`]],
      theme: 'grid',
      headStyles: { fillColor: [66, 66, 66] }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL PAGADO: S/ ${payment.amount.toFixed(2)}`, 140, finalY);
    doc.save(`Recibo_${payment.receiptNumber}.pdf`);
  };

  const handleDownloadReceipt = async (id: number) => {
    try {
      const response = await api.get(`/pago/constancia/${id}`, {
        responseType: 'blob'
      });

      // Crear un URL para el blob y disparar la descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `recibo-REC-${new Date().getFullYear()}-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showAlert('Error', 'Error al generar la constancia de pago', 'danger');
    }
  };

  const buscarEstudiante = async () => {
    if (!dni.trim() || !año.trim()) {
      showAlert('Atención', 'Por favor ingrese DNI y año', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.get<SearchApiResponse>(`/cuotas/estudiante/${dni}/${año}`);
      if (response.data.status && response.data.data) {
        // Asegurarnos de que el DNI esté en el objeto para la UI
        const data = response.data.data;
        if (!data.dni) data.dni = dni;
        setDatosEstudiante(data);
      } else {
        setDatosEstudiante(null);
        showAlert('Estudiante no encontrado', 'No se encontró el estudiante con el DNI proporcionado', 'warning');
      }
    } catch (error) {
      setDatosEstudiante(null);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          showAlert('No Autorizado', 'Error de autorización. Inicie sesión nuevamente.', 'danger');
        } else if (error.response?.status === 404) {
          showAlert('No Encontrado', 'No se encontró el estudiante.', 'warning');
        } else {
          showAlert('Error', `Error: ${error.response?.data?.message || error.message}`, 'danger');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const estadoUpper = (estado || '').toUpperCase();
    switch (estadoUpper) {
      case 'PAGADO':
      case 'PAGADA':
        return <Badge className="bg-green-100 text-green-700 border-green-200">PAGADO</Badge>;
      case 'PENDIENTE':
        return <Badge variant="destructive">PENDIENTE</Badge>;
      case 'PARCIAL':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">PARCIAL</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const confirmarPago = async () => {
    if (!datosEstudiante || !cuotaSeleccionada) return;
    setIsPagoLoading(true);
    try {
      if (pagoPresencial) {
        // Nuevo endpoint para pago presencial
        await api.post(`/pago/presencial/cuota`, {
          id_cuota: cuotaSeleccionada.id,
          monto_pagado: parseFloat(montoPagadoReq),
          metodo_pago: metodoPago,
          observaciones: observaciones
        });
      } else {
        // Endpoint antiguo o flujo normal (Mercado Pago o similar)
        await api.post(`/cuotas/pagar`, {
          dni: datosEstudiante.dni,
          anio: año,
          tipo: 'Cuota',
          numero_cuota: cuotaSeleccionada.numero_cuota,
          metodo_pago: 'Efectivo',
          presencial: false
        });
      }

      showAlert('Éxito', 'Pago realizado con éxito', 'success');
      setShowPagoDialog(false);
      buscarEstudiante();

      // Limpiar campos
      setObservaciones('');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        showAlert('Error', `Error: ${error.response.data.message}`, 'danger');
      } else {
        showAlert('Error', 'Error al procesar el pago', 'danger');
      }
    } finally {
      setIsPagoLoading(false);
    }
  };

  const confirmarPagoMatricula = async () => {
    if (!datosEstudiante || !matriculaInfo) return;
    setIsMatriculaLoading(true);
    try {
      if (pagoMatriculaPresencial) {
        // Usar el mismo endpoint universal para cobro presencial
        await api.post(`/pago/presencial/cuota`, {
          id_cuota: matriculaInfo.id,
          monto_pagado: parseFloat(montoPagadoReq),
          metodo_pago: metodoPago,
          observaciones: observaciones
        });
      } else {
        // Pago normal (flujo no presencial)
        await api.post(`/cuotas/pagar`, {
          dni: datosEstudiante.dni,
          anio: año,
          tipo: 'Matricula',
          metodo_pago: 'Efectivo',
          presencial: false
        });
      }
      showAlert('Éxito', 'Matrícula pagada con éxito', 'success');
      setShowMatriculaDialog(false);
      buscarEstudiante();

      // Limpiar campos
      setObservaciones('');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        showAlert('Error', `Error: ${error.response.data.message}`, 'danger');
      } else {
        showAlert('Error', 'Error al procesar el pago de matrícula', 'danger');
      }
    } finally {
      setIsMatriculaLoading(false);
    }
  };

  const matriculaInfo = datosEstudiante?.detalle.find(p => p.tipo.toLowerCase() === 'matricula');
  const cuotasMensuales = datosEstudiante?.detalle.filter(p =>
    p.tipo.toLowerCase() === 'cuota' || p.tipo.toLowerCase() === 'mensualidad'
  ) || [];

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gestión de Cuotas</h1>
          <p className="text-gray-500 mt-1">Administración de pagos y reportes de pensiones</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <Button
            variant={viewMode === 'search' ? 'default' : 'ghost'}
            onClick={() => setViewMode('search')}
            className="rounded-md"
          >
            Buscar Alumno
          </Button>
          <Button
            variant={viewMode === 'report' ? 'default' : 'ghost'}
            onClick={() => { setViewMode('report'); if (reportData.length === 0) handleSearchReport(); }}
            className="rounded-md"
          >
            Reporte Deudores
          </Button>
          <Button
            variant={viewMode === 'daily' ? 'default' : 'ghost'}
            onClick={() => { setViewMode('daily'); if (dailyPayments.length === 0) handleLoadDailyReport(); }}
            className="rounded-md"
          >
            Pagos del Día
          </Button>
        </div>
      </div>

      {viewMode === 'search' && (
        <div className="space-y-6">
          <Card className="border-none shadow-md bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                Buscar Registro de Estudiante
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Ingrese DNI del estudiante"
                    className="pl-10 h-9 bg-white border border-slate-300 rounded text-sm focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && buscarEstudiante()}
                  />
                </div>
                <div className="relative w-full md:w-36">
                  <Select value={año} onValueChange={setAño}>
                    <SelectTrigger className="h-9 bg-white border border-slate-300 rounded pl-10 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-full relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                      <SelectValue placeholder="Año" />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.length > 0 ? (
                        periods.map(period => (
                          <SelectItem key={period.id} value={period.anio.toString()}>
                            {period.anio} {period.activo === 0 ? '(Inactivo)' : ''}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value={año}>{año}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={buscarEstudiante}
                  disabled={isLoading}
                  className="h-9 px-8 bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? 'Buscando...' : 'Buscar Alumno'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {datosEstudiante && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <Card className="border-none shadow-md overflow-hidden">
                  <div className={`h-2 ${datosEstudiante.detalle[0]?.periodo_activo === 0 || datosEstudiante.detalle[0]?.matricula_estado === 'Retirado' ? 'bg-amber-500' : 'bg-blue-600'}`} />
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                        <User className="h-10 w-10 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{datosEstudiante.estudiante}</h3>
                      <p className="text-gray-500 font-medium">{datosEstudiante.grado}</p>
                      <div className="flex flex-wrap justify-center gap-2 mt-2">
                        <Badge variant="outline">DNI: {datosEstudiante.dni}</Badge>
                        {datosEstudiante.detalle[0]?.matricula_estado === 'Retirado' && (
                          <Badge variant="destructive" className="animate-pulse">RETIRADO</Badge>
                        )}
                        {datosEstudiante.detalle[0]?.periodo_activo === 0 && (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">PERIODO INACTIVO</Badge>
                        )}
                      </div>
                    </div>

                    {(datosEstudiante.detalle[0]?.periodo_activo === 0 || datosEstudiante.detalle[0]?.matricula_estado === 'Retirado') && (
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
                        <div className="mt-0.5">⚠️</div>
                        <p>
                          {datosEstudiante.detalle[0]?.matricula_estado === 'Retirado'
                            ? 'Este estudiante figura como Retirado. Los cobros manuales están deshabilitados.'
                            : 'El periodo académico está inactivo. Solo se pueden registrar pagos en periodos activos.'}
                        </p>
                      </div>
                    )}

                    <div className="mt-6 space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Total Pagado</span>
                        <span className="font-bold text-green-600 font-mono">S/ {parseFloat(datosEstudiante.resumen.monto_total_pagado).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <span className="text-sm text-red-600">Saldo Pendiente</span>
                        <span className="font-bold text-red-600 font-mono">S/ {parseFloat(datosEstudiante.resumen.saldo_pendiente).toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                      Matrícula {año}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {matriculaInfo ? (
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-500">Monto Matrícula</p>
                          <p className="font-bold text-lg">S/ {parseFloat(matriculaInfo.monto).toFixed(2)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getEstadoBadge(matriculaInfo.estado)}
                          {(matriculaInfo.estado.toUpperCase() === 'PENDIENTE' || matriculaInfo.estado.toUpperCase() === 'PARCIAL') && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={matriculaInfo.periodo_activo === 0 || matriculaInfo.matricula_estado === 'Retirado'}
                              onClick={() => {
                                setMontoPagadoReq(matriculaInfo.monto);
                                setMetodoPago('Efectivo');
                                setObservaciones(`Pago de Matrícula - Periodo ${año}`);
                                setPagoMatriculaPresencial(true);
                                setShowMatriculaDialog(true);
                              }}
                              className="text-xs h-8 bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700 disabled:opacity-50 disabled:bg-gray-400 disabled:border-gray-400"
                            >
                              Registrar Pago
                            </Button>
                          )}
                          {(matriculaInfo.estado.toUpperCase() === 'PAGADO' || matriculaInfo.estado.toUpperCase() === 'PAGADA') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadReceipt(matriculaInfo.id)}
                              className="text-xs h-8 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300"
                            >
                              <FileDown className="h-3.5 w-3.5 mr-1" />
                              Constancia PDF
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No hay información de matrícula</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <Card className="border-none shadow-md h-full">
                  <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      Cuotas Mensuales
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/50">
                          <TableHead className="w-[100px]">Nra. Cuota</TableHead>
                          <TableHead>Vencimiento</TableHead>
                          <TableHead>Monto</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acción</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cuotasMensuales.length > 0 ? (
                          cuotasMensuales.map((cuota) => (
                            <TableRow key={cuota.id} className="hover:bg-gray-50 transition-colors">
                              <TableCell className="font-medium">Cuota {cuota.numero_cuota}</TableCell>
                              <TableCell className="text-gray-600">
                                {new Date(cuota.fecha_vencimiento).toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })}
                              </TableCell>
                              <TableCell className="font-mono font-medium">S/ {parseFloat(cuota.monto).toFixed(2)}</TableCell>
                              <TableCell>{getEstadoBadge(cuota.estado)}</TableCell>
                              <TableCell className="text-right">
                                {(cuota.estado.toUpperCase() === 'PENDIENTE' || cuota.estado.toUpperCase() === 'PARCIAL') && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 disabled:opacity-30"
                                    disabled={cuota.periodo_activo === 0 || cuota.matricula_estado === 'Retirado'}
                                    onClick={() => {
                                      setCuotaSeleccionada(cuota);
                                      setMontoPagadoReq(cuota.monto);
                                      setPagoPresencial(true);
                                      setShowPagoDialog(true);
                                    }}
                                  >
                                    Pagar Presencial
                                  </Button>
                                )}
                                {(cuota.estado.toUpperCase() === 'PAGADO' || cuota.estado.toUpperCase() === 'PAGADA') && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300"
                                    onClick={() => handleDownloadReceipt(cuota.id)}
                                  >
                                    <FileDown className="h-4 w-4 mr-1" />
                                    Constancia PDF
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                              No se encontraron cuotas para este estudiante
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {viewMode === 'report' && (
        <div className="space-y-6">
          <Card className="border-none shadow-md bg-white">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Reporte de Deudores {selectedYear}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={reportData.length === 0}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                  <Button size="sm" onClick={handleSearchReport} disabled={isReportLoading}>
                    {isReportLoading ? 'Buscando...' : 'Actualizar'}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="text-sm font-medium mb-1 block">Año</label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="h-9 bg-white border border-slate-300 rounded px-3 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue placeholder="Seleccionar año" />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.length > 0 ? (
                        periods.map(period => (
                          <SelectItem key={period.id} value={period.anio.toString()}>
                            {period.anio} {period.activo === 0 ? '(Inactivo)' : ''}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value={selectedYear}>{selectedYear}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Grado</label>
                  <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                    <SelectTrigger className="h-9 bg-white border border-slate-300 rounded px-3 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue placeholder="Seleccionar grado" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map(grade => (
                        <SelectItem key={grade.id} value={grade.id.toString()}>{grade.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Estado</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="h-9 bg-white border border-slate-300 rounded px-3 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todos">Todos</SelectItem>
                      <SelectItem value="Deuda">Con Deuda</SelectItem>
                      <SelectItem value="Al día">Al día</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Estudiante</TableHead>
                      <TableHead>Grado</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Monto Deuda</TableHead>
                      <TableHead className="text-center">Cuotas</TableHead>
                      <TableHead>Último Pago</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isReportLoading ? (
                      <TableRow><TableCell colSpan={7} className="h-32 text-center">Cargando datos...</TableCell></TableRow>
                    ) : reportData.length > 0 ? (
                      reportData.map((item) => (
                        <Fragment key={item.dni}>
                          <TableRow
                            className="cursor-pointer hover:bg-gray-50/50"
                            onClick={() => toggleExpand(item.dni)}
                          >
                            <TableCell>
                              {expandedStudent === item.dni ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </TableCell>
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span>{item.studentName}</span>
                                <span className="text-xs text-gray-500">{item.dni}</span>
                              </div>
                            </TableCell>
                            <TableCell>{item.grade}</TableCell>
                            <TableCell>
                              <Badge variant={item.status === 'Deuda' ? 'destructive' : 'default'} className="bg-opacity-10 text-opacity-100 border-none">
                                {item.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono">S/ {item.amountOwed.toFixed(2)}</TableCell>
                            <TableCell className="text-center">{item.monthsOwed}</TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {item.lastPaymentDate === 'Sin pagos' ? 'Nunca' : new Date(item.lastPaymentDate).toLocaleDateString()}
                            </TableCell>
                          </TableRow>

                          {expandedStudent === item.dni && (
                            <TableRow className="bg-gray-50/30">
                              <TableCell colSpan={7} className="p-4">
                                <Card className="shadow-sm border">
                                  <Table>
                                    <TableHeader className="bg-gray-50">
                                      <TableRow>
                                        <TableHead className="text-xs h-8">Tipo</TableHead>
                                        <TableHead className="text-xs h-8">N°</TableHead>
                                        <TableHead className="text-xs h-8">Vencimiento</TableHead>
                                        <TableHead className="text-xs h-8">Monto</TableHead>
                                        <TableHead className="text-xs h-8">Pagado</TableHead>
                                        <TableHead className="text-xs h-8">Estado</TableHead>
                                        <TableHead className="text-xs h-8 font-mono">Recibo</TableHead>
                                        <TableHead className="text-xs h-8 text-right">Acción</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {item.detalle.map((det: any) => (
                                        <TableRow key={det.id} className="text-xs hover:bg-gray-50">
                                          <TableCell className="font-medium">{det.tipo}</TableCell>
                                          <TableCell>{det.numero_cuota || '-'}</TableCell>
                                          <TableCell>{new Date(det.fecha_vencimiento).toLocaleDateString()}</TableCell>
                                          <TableCell>S/ {parseFloat(det.monto).toFixed(2)}</TableCell>
                                          <TableCell>S/ {parseFloat(det.monto_pagado).toFixed(2)}</TableCell>
                                          <TableCell>{getEstadoBadge(det.estado)}</TableCell>
                                          <TableCell className="font-mono text-[10px]">{det.numero_recibo || '-'}</TableCell>
                                          <TableCell className="text-right">
                                            {(det.estado.toUpperCase() === 'PAGADO' || det.estado.toUpperCase() === 'PAGADA') && (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 px-2 text-[10px]"
                                                onClick={() => handleDownloadReceipt(det.id)}
                                              >
                                                <FileDown className="h-3 w-3 mr-1" />
                                                Constancia
                                              </Button>
                                            )}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </Card>
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={7} className="h-32 text-center">No se encontraron resultados</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {viewMode === 'daily' && (
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Pagos Registrados Hoy</span>
              <Button size="sm" onClick={handleLoadDailyReport} disabled={isDailyLoading}>
                Actualizar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recibo</TableHead>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isDailyLoading ? (
                  <TableRow><TableCell colSpan={6} className="h-32 text-center">Cargando...</TableCell></TableRow>
                ) : dailyPayments.length > 0 ? (
                  dailyPayments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.receiptNumber}</TableCell>
                      <TableCell>{p.studentName}</TableCell>
                      <TableCell>{p.concept}</TableCell>
                      <TableCell>{p.time}</TableCell>
                      <TableCell className="font-bold">S/ {p.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                          onClick={() => handleDownloadReceipt(p.id)}
                        >
                          <FileDown className="h-4 w-4 mr-1" />
                          Constancia PDF
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handlePrintReceipt(p)}>
                          <Printer className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={6} className="h-32 text-center">No se han registrado pagos hoy</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Dialogo Pago Cuota */}
      <Dialog open={showPagoDialog} onOpenChange={setShowPagoDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Pago de Cuota</DialogTitle>
            <DialogDescription>
              Confirme los detalles del pago para la Cuota {cuotaSeleccionada?.numero_cuota}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Banknote className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Monto de la Cuota</p>
                  <p className="text-2xl font-bold text-blue-900 font-mono">
                    S/ {cuotaSeleccionada ? parseFloat(cuotaSeleccionada.monto).toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-2">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Pago Presencial</label>
                <p className="text-xs text-gray-500">Registrar cobro manual en efectivo</p>
              </div>
              <Switch checked={pagoPresencial} onCheckedChange={setPagoPresencial} />
            </div>

            {pagoPresencial && (
              <div className="space-y-4 pt-2 border-t animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">Monto Cobrado</label>
                    <Input
                      type="number"
                      value={montoPagadoReq}
                      readOnly
                      className="h-9 bg-gray-50 font-medium text-gray-600 border border-slate-300 border-dashed cursor-not-allowed rounded px-3 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Método de Pago</label>
                  <Select value={metodoPago} onValueChange={setMetodoPago}>
                    <SelectTrigger className="h-9 bg-white border border-slate-300 rounded px-3 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Efectivo">Efectivo</SelectItem>
                      {/* <SelectItem value="Transferencia">Transferencia</SelectItem>
                      <SelectItem value="Yape/Plin">Yape / Plin</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem> */}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Observaciones</label>
                  <Input
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Ej: Pago realizado por el padre"
                    className="h-9 bg-white border border-slate-300 rounded px-3 text-sm focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPagoDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={confirmarPago}
              disabled={isPagoLoading || (pagoPresencial && !montoPagadoReq)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isPagoLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                'Confirmar Registro'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogo Pago Matricula */}
      <Dialog open={showMatriculaDialog} onOpenChange={setShowMatriculaDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Pago de Matrícula</DialogTitle>
            <DialogDescription>
              Confirme los detalles del cobro de matrícula para {datosEstudiante?.estudiante}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-600 rounded-lg">
                  <Banknote className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-green-600 font-semibold uppercase tracking-wider">Costo de Matrícula</p>
                  <p className="text-2xl font-bold text-green-900 font-mono">
                    S/ {matriculaInfo ? parseFloat(matriculaInfo.monto).toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-2">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Pago Presencial</label>
                <p className="text-xs text-gray-500">Registrar cobro manual en efectivo/otros</p>
              </div>
              <Switch checked={pagoMatriculaPresencial} onCheckedChange={setPagoMatriculaPresencial} />
            </div>

            {pagoMatriculaPresencial && (
              <div className="space-y-4 pt-2 border-t animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Monto Cobrado</label>
                  <Input
                    type="number"
                    value={montoPagadoReq}
                    readOnly
                    className="h-9 bg-gray-50 font-medium text-gray-600 border border-slate-300 border-dashed cursor-not-allowed rounded px-3 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Método de Pago</label>
                  <Select value={metodoPago} onValueChange={setMetodoPago}>
                    <SelectTrigger className="h-9 bg-white border border-slate-300 rounded px-3 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Efectivo">Efectivo</SelectItem>
                      <SelectItem value="Transferencia">Transferencia</SelectItem>
                      <SelectItem value="Yape/Plin">Yape / Plin</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Observaciones</label>
                  <Input
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Ej: Pago total de matrícula recibido"
                    className="h-9 bg-white border border-slate-300 rounded px-3 text-sm focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMatriculaDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={confirmarPagoMatricula}
              disabled={isMatriculaLoading || (pagoMatriculaPresencial && !montoPagadoReq)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isMatriculaLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                'Confirmar Pago de Matrícula'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalConfig.isOpen} onOpenChange={(open) => setModalConfig(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="max-w-[340px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl z-[100]">
          <div className="flex flex-col items-center text-center p-8">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${modalConfig.type === "success" ? "bg-emerald-50 text-emerald-500" :
              modalConfig.type === "danger" ? "bg-rose-50 text-rose-500" :
                modalConfig.type === "warning" ? "bg-amber-50 text-amber-500" :
                  "bg-blue-50 text-blue-500"
              }`}>
              {modalConfig.type === "success" && <CheckCircle2 size={32} />}
              {modalConfig.type === "danger" && <X size={32} />}
              {modalConfig.type === "warning" && <AlertTriangle size={32} />}
              {modalConfig.type === "info" && <AlertCircle size={32} />}
            </div>

            <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2">
              {modalConfig.title}
            </h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              {modalConfig.description}
            </p>
          </div>

          <div className="flex border-t border-slate-100 h-14">
            {modalConfig.showCancel && (
              <button
                onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 text-sm font-bold text-slate-400 hover:bg-slate-50 transition-colors uppercase tracking-widest border-r border-slate-100"
              >
                {modalConfig.cancelText || "Cancelar"}
              </button>
            )}
            <button
              onClick={() => {
                if (modalConfig.onConfirm) modalConfig.onConfirm();
                setModalConfig(prev => ({ ...prev, isOpen: false }));
              }}
              className={`flex-1 text-sm font-bold hover:bg-slate-50 transition-colors uppercase tracking-widest ${modalConfig.type === "danger" ? "text-rose-600" : "text-blue-600"
                }`}
            >
              {modalConfig.confirmText || "Aceptar"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
};

export default CuotasDetalle;