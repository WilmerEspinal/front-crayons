import api from "@/lib/axios";

// Dashboard API service functions
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
    pagos_pendientes: string;
    estudiantes_con_deuda: number;
    tasa_recaudacion: number;
    meta_mensual: number;
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

export const fetchSummaryStats = async (): Promise<DashboardSummaryData | null> => {
  try {
    const response = await api.get('/dashboard/estadisticas');
    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const fetchRecentPayments = async (): Promise<RecentPayment[]> => {
  return [
    { id: 1, studentName: "María García", amount: 450, date: "2024-10-28", status: "paid", type: "cuota" },
  ];
};

export const fetchMonthlyData = async (): Promise<MonthlyData[]> => {
  return [
    { month: "Oct", revenue: 28750 },
  ];
};

export const fetchDebtorsReport = async (gradeFilter: string = 'Todos', statusFilter: string = 'Todos', yearFilter: string = '2025'): Promise<DebtorReportItem[]> => {
  const statusMap: Record<string, string> = {
    'Todos': 'todo',
    'Deuda': '0',
    'Al día': '1'
  };

  const estado = statusMap[statusFilter] || 'todo';
  const idGrado = gradeFilter === 'Todos' ? '0' : gradeFilter;

  try {
    const response = await api.get(`/cuotas/filtro/${yearFilter}/${idGrado}/${estado}`);
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
          const montoTotal = parseFloat(item.monto);
          const montoPagado = parseFloat(item.monto_pagado || '0');
          student.amountOwed += (montoTotal - montoPagado);

          if (item.tipo?.toLowerCase() === 'cuota') {
            student.monthsOwed++;
          }
          student.status = 'Deuda';
        }

        if (item.fecha_pago && (student.lastPaymentDate === 'Sin pagos' || new Date(item.fecha_pago) > new Date(student.lastPaymentDate))) {
          student.lastPaymentDate = item.fecha_pago;
        }
      });

      return Array.from(studentMap.values());
    }
    return [];
  } catch (error) {
    return [];
  }
};

export const fetchDebtors = async (): Promise<Debtor[]> => {
  const report = await fetchDebtorsReport();
  return report
    .filter(item => item.status === 'Deuda')
    .map(item => ({
      id: item.id,
      studentName: item.studentName,
      months: item.monthsOwed,
      amount: item.amountOwed
    }));
};

export const fetchDailyPayments = async (): Promise<DailyPayment[]> => {
  // Placeholder for real daily report if exists
  return [];
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
