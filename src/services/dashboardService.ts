import api from "@/lib/axios";

// Dashboard API service functions
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  totalRevenue: number;
  pendingPayments: number;
  studentsWithDebt: number;
  paidStudents: number;
  currentMonthRevenue: number;
  averagePaymentAmount: number;
  paymentCompletionRate: number;
  monthlyTarget: number;
  overduePayments: number;
}

export interface RecentPayment {
  id: number;
  studentName: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
  type: 'matricula' | 'cuota';
}

export interface MonthlyData {
  month: string;
  revenue: number;
}

export interface DebtorReportItem {
  id: number;
  dni: string;
  studentName: string;
  grade: string;
  section: string;
  amountOwed: number;
  monthsOwed: number;
  status: 'Deuda' | 'Al día';
  lastPaymentDate: string;
  year: string;
  detalle: any[]; // Individual payment items
}

export interface Debtor {
  id: number;
  studentName: string;
  months: number;
  amount: number;
}

export interface Grade {
  id: number;
  numero_grado: number;
  nombre: string;
}

export interface AcademicPeriod {
  id: number;
  anio: number;
  activo: number;
}

export interface DailyPayment {
  id: number;
  studentName: string;
  dni: string;
  concept: string;
  amount: number;
  time: string;
  method: 'Efectivo' | 'Transferencia' | 'Yape/Plin';
  receiptNumber: string;
}

export interface DashboardSummaryData {
  kpis: {
    ingresos_mensuales: string;
    ingresos_mes_anterior: string;
    estudiantes_activos: number;
    estudiantes_inactivos: number;
    docentes_activos: number;
    docentes_inactivos: number;
    asistencia_hoy_presentes: number;
    asistencia_hoy_ausentes: number;
    asistencia_hoy_evaluados: number;
    pagos_pendientes: string;
    estudiantes_con_deuda: number;
    tasa_recaudacion: number;
    meta_mensual: number;
    monto_esperado_mes: string;
    monto_esperado_anio: string;
    periodo_activo: number;
  };
  distribucion_sexo: {
    sexo: string;
    cantidad: number;
  }[];
  tendencia_ingresos: {
    mes: number;
    anio: number;
    total: string;
  }[];
  comparativa_pagos: {
    pagado: number;
    pendiente: number;
  };
  recent_payments?: RecentPayment[];
  debtors?: Debtor[];
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  // This could be real API too, but keeping it for now
  return {
    totalStudents: 245,
    activeStudents: 238,
    totalTeachers: 18,
    totalRevenue: 125400,
    pendingPayments: 15600,
    studentsWithDebt: 32,
    paidStudents: 213,
    currentMonthRevenue: 28750,
    averagePaymentAmount: 450,
    paymentCompletionRate: 87,
    monthlyTarget: 50000,
    overduePayments: 8
  };
};

export const fetchSummaryStats = async (anio?: string): Promise<DashboardSummaryData | null> => {
  try {
    const url = anio ? `/dashboard/estadisticas?anio=${anio}` : '/dashboard/estadisticas';
    const response = await api.get(url);
    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const fetchDebtorsReport = async (gradeFilter: string = 'Todos', statusFilter: string = 'Todos', yearFilter: string = '2025'): Promise<DebtorReportItem[]> => {
  const idGrado = gradeFilter === 'Todos' ? '0' : gradeFilter;

  try {
    const response = await api.get(`/cuotas/filtro/${yearFilter}/${idGrado}/todo?limit=todo`);
    const result = response.data;

    if (result.status && Array.isArray(result.data)) {
      const studentMap = new Map<string, DebtorReportItem>();

      result.data.forEach((item: any) => {
        const dni = item.dni;
        const fullName = `${item.nombres} ${item.apellido_paterno} ${item.apellido_materno}`;

        if (!studentMap.has(dni)) {
          studentMap.set(dni, {
            id: item.id,
            dni: dni,
            studentName: fullName,
            grade: item.grado,
            section: 'A',
            amountOwed: 0,
            monthsOwed: 0,
            status: 'Al día',
            lastPaymentDate: 'Sin pagos',
            year: yearFilter,
            detalle: []
          });
        }

        const student = studentMap.get(dni)!;
        student.detalle.push(item);

        const estadoUpper = item.estado?.toUpperCase();

        if (estadoUpper === 'PENDIENTE' || estadoUpper === 'PARCIAL') {
          const fechaVencimiento = new Date(item.fecha_vencimiento);
          const limitDate = new Date();
          limitDate.setDate(limitDate.getDate() + 10);

          if (limitDate >= fechaVencimiento) {
            const montoTotal = parseFloat(item.monto);
            const montoPagado = parseFloat(item.monto_pagado || '0');
            student.amountOwed += (montoTotal - montoPagado);

            if (item.tipo?.toLowerCase() === 'cuota' || item.tipo?.toLowerCase() === 'mensualidad') {
              student.monthsOwed++;
            }
            student.status = 'Deuda';
          }
        }

        if (item.fecha_pago) {
          if (student.lastPaymentDate === 'Sin pagos' || new Date(item.fecha_pago) > new Date(student.lastPaymentDate)) {
            student.lastPaymentDate = item.fecha_pago;
          }
        }
      });

      let finalReport = Array.from(studentMap.values());

      if (statusFilter === 'Deuda') {
        finalReport = finalReport.filter(s => s.status === 'Deuda');
      } else if (statusFilter === 'Al día') {
        finalReport = finalReport.filter(s => s.status === 'Al día');
      }

      return finalReport;
    }
    return [];
  } catch (error) {
    return [];
  }
};



export const fetchDailyPayments = async (page: number = 1, limit: number = 5): Promise<PaginatedResult<DailyPayment> | null> => {
  try {
    const response = await api.get(`/pago/recientes?page=${page}&limit=${limit}`);
    if (response.data.success) {
      return {
        data: response.data.data,
        pagination: response.data.pagination
      };
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const fetchGradesList = async (): Promise<Grade[]> => {
  try {
    const response = await api.get('/grado/lista-grado');
    if (response.data.status) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    return [];
  }
};

export const fetchPeriodsList = async (): Promise<AcademicPeriod[]> => {
  try {
    const response = await api.get('/cuotas/periodos');
    if (response.data && response.data.success) {
      return response.data.data || [];
    }
    return [];
  } catch (error) {
    return [];
  }
};
