import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { Loader2, UserX, UserPlus, AlertCircle, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const API_URL = import.meta.env.VITE_API_URL;

interface Periodo {
  id: number;
  anio: number;
  activo: number;
}

type Apoderado = {
  dni: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  telefono: string | null;
  email: string | null;
  parentesco: string;
};

type Student = {
  alumno_id: number;
  alumno_dni: string;
  alumno_nombre: string;
  alumno_apellido_paterno: string;
  alumno_apellido_materno: string;
  fecha_nacimiento: string;
  grado: string;
  fecha_matricula: string;
  estado: string;
  activo: number;
  periodo_activo?: number;
  apoderados: Apoderado[];
};

const EMPTY_ARRAY: any[] = [];

export default function ListStudent() {
  const queryClient = useQueryClient();
  const [year, setYear] = useState("2026");
  const [grade, setGrade] = useState("1");
  const [dniSearch, setDniSearch] = useState("");
  const [showParent, setShowParent] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<{ year: string; grade: string } | null>(null);
  const [updateMessage, setUpdateMessage] = useState<{
    text: string;
    isSuccess: boolean;
  } | null>(null);

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

  const showConfirm = (title: string, description: string, onConfirm: () => void, type: "info" | "success" | "danger" | "warning" = "info") => {
    setModalConfig({
      isOpen: true,
      title,
      description,
      onConfirm,
      confirmText: "Confirmar",
      cancelText: "Cancelar",
      showCancel: true,
      type
    });
  };

  // Queries para datos estáticos (cacheados)
  const { data: yearsAvailable = EMPTY_ARRAY } = useQuery<Periodo[]>({
    queryKey: ['periodosA'],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/cuotas/periodos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.success ? response.data.data : [];
    },
    staleTime: 60 * 60 * 1000,
  });

  const { data: grados = [] } = useQuery<{ id: number; nombre: string }[]>({
    queryKey: ['grados'],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/grado/lista-grado`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.status ? response.data.data : [];
    },
    staleTime: 60 * 60 * 1000,
  });

  const { data: studentsResponse, isLoading: isLoadingStudents, isFetching } = useQuery({
    queryKey: ['studentsList', appliedFilters?.year, appliedFilters?.grade, page, limit],
    queryFn: async () => {
      if (!appliedFilters?.year || !appliedFilters?.grade) return null;
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/alumno/lista-alumnos/${appliedFilters.year}/${appliedFilters.grade}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { page, limit }
        }
      );
      if (response.data.success) {
        return { data: response.data.data || [], pagination: response.data.pagination };
      }
      return null;
    },
    enabled: !!appliedFilters,
    placeholderData: keepPreviousData,
    staleTime: 0,
  });

  const students = studentsResponse?.data ?? EMPTY_ARRAY;
  const currentPagination = studentsResponse?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 };
  const loading = isLoadingStudents || isFetching;

  const currentPeriodoActivo = yearsAvailable.find(p => p.anio.toString() === appliedFilters?.year)?.activo;

  // Función para actualizar un estudiante específico en la lista
  const updateStudentInList = (updatedStudent: any) => {
    // Actualizar la caché localmente
    queryClient.setQueryData(['studentsList', appliedFilters?.year, appliedFilters?.grade, page, limit], (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        data: oldData.data.map((student: any) =>
          student.alumno_id === updatedStudent.alumno_id
            ? {
              ...student,
              alumno_nombre: updatedStudent.nombre,
              alumno_apellido_paterno: updatedStudent.ap_p,
              alumno_apellido_materno: updatedStudent.ap_m,
              fecha_nacimiento: updatedStudent.fecha_nacimiento
            }
            : student
        )
      };
    });

    setUpdateMessage({
      text: `Datos actualizados: ${updatedStudent.nombre} ${updatedStudent.ap_p}`,
      isSuccess: true
    });

    setTimeout(() => {
      setUpdateMessage(null);
    }, 2000);
  };

  const handleToggleEstado = async (alumno_id: number, currentEstado: string) => {
    if (currentPeriodoActivo === 0) {
      showAlert("Acción restringida", "No se pueden realizar cambios en un periodo académico inactivo.", "warning");
      return;
    }

    const token = localStorage.getItem("token");
    const isRetiring = currentEstado === 'Activo';
    const nuevoEstado = isRetiring ? 'Retirado' : 'Activo';
    const nuevoActivo = isRetiring ? 0 : 1;

    const confirmMsg = isRetiring
      ? "¿Estás seguro de que deseas dar de baja a este alumno? Se le quitará el acceso al sistema."
      : "¿Estás seguro de que deseas RE-INCORPORAR a este alumno? Se le habilitará el acceso de nuevo.";

    showConfirm(
      isRetiring ? "Dar de Baja" : "Habilitar Alumno",
      confirmMsg,
      async () => {
        try {
          const { data } = await axios.patch(
            `${API_URL}/alumno/toggle-estado/${alumno_id}`,
            { estado: nuevoEstado, activo: nuevoActivo },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (data.success) {
            setUpdateMessage({ text: data.message, isSuccess: true });
            queryClient.invalidateQueries({ queryKey: ['studentsList'] });
            setTimeout(() => setUpdateMessage(null), 3000);
            showAlert("Éxito", `El alumno ha sido ${isRetiring ? "retirado" : "habilitado"} correctamente.`, "success");
          } else {
            showAlert("Error", data.message || "Error al cambiar el estado", "danger");
          }
        } catch (error: any) {
          showAlert("Error de Conexión", error.response?.data?.error || "Error al conectar con el servidor", "danger");
        }
      },
      isRetiring ? "danger" : "success"
    );
  };

  // Filtrar estudiantes por DNI (Localmente sobre los datos de la página actual)
  useEffect(() => {
    if (dniSearch.trim() === "") {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter((student: Student) =>
        student.alumno_dni.toLowerCase().includes(dniSearch.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [dniSearch, students]);


  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= currentPagination.totalPages) {
      setPage(newPage);
    }
  };

  // Reset page when year or grade changes (from applied filters)
  useEffect(() => {
    setPage(1);
  }, [appliedFilters]);

  const handleSearch = () => {
    setAppliedFilters({ year, grade });
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Banner de Periodo Inactivo */}
      {appliedFilters?.year && currentPeriodoActivo === 0 && (
        <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-lg flex items-center gap-3 text-sm font-medium">
          <span className="text-xl">⚠️</span>
          Este periodo académico está <strong className="font-bold">Inactivo</strong>. Las acciones de retiro, habilitación y edición de datos están deshabilitadas.
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="text-sm font-medium">Año</label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-32 h-9 bg-white border border-slate-300 rounded px-3 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              {yearsAvailable
                .sort((a, b) => b.anio - a.anio)
                .map((p) => (
                  <SelectItem key={p.id} value={p.anio.toString()}>
                    <span className={p.activo === 0 ? "text-slate-400" : ""}>
                      {p.anio} {p.activo === 0 ? "(Inactivo)" : ""}
                    </span>
                  </SelectItem>
                ))}
              {yearsAvailable.length === 0 && (
                <SelectItem value="2026">2026</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Grado</label>
          <Select value={grade} onValueChange={setGrade}>
            <SelectTrigger className="w-32 h-9 bg-white border border-slate-300 rounded px-3 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
              <SelectValue placeholder="Grado" />
            </SelectTrigger>
            <SelectContent>
              {grados.map((g) => (
                <SelectItem key={g.id} value={g.id.toString()}>
                  {g.nombre}
                </SelectItem>
              ))}
              {grados.length === 0 && (
                <>
                  <SelectItem value="1">1ro</SelectItem>
                  <SelectItem value="2">2do</SelectItem>
                  <SelectItem value="3">3ro</SelectItem>
                  <SelectItem value="4">4to</SelectItem>
                  <SelectItem value="5">5to</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Filtrar por DNI</label>
          <Input
            type="text"
            placeholder="Ingrese DNI..."
            value={dniSearch}
            onChange={(e) => setDniSearch(e.target.value)}
            className="w-48 h-9 bg-white border border-slate-300 rounded px-3 text-sm focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500"
          />
        </div>
        <Button
          onClick={handleSearch}
          className="mt-2 h-9 bg-blue-700 text-white hover:bg-blue-800"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cargando...
            </>
          ) : "Ver"}
        </Button>
      </div>

      {/* Mensaje de actualización */}
      {updateMessage && (
        <div className={`p-4 rounded-md mb-4 ${updateMessage.isSuccess
          ? 'bg-green-100 text-green-700 border border-green-300'
          : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
          {updateMessage.text}
        </div>
      )}

      {/* Información de resultados */}
      <div className="flex justify-between items-center text-sm text-slate-700 font-medium">
        <div>
          Mostrando {students.length} de {currentPagination.total} estudiantes
          {dniSearch.trim() !== "" && ` (filtrados por DNI: ${dniSearch})`}
        </div>
        <div className="flex items-center gap-2">
          Página {currentPagination.page} de {currentPagination.totalPages || 1}
        </div>
      </div>

      {/* Tabla */}
      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>DNI</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Grado</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha Matrícula</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-sm text-slate-500">Cargando estudiantes...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  {dniSearch.trim() !== ""
                    ? `No se encontraron estudiantes con DNI: ${dniSearch}`
                    : !appliedFilters ? "Seleccione Año y Grado, luego presione Ver" : "No hay estudiantes registrados"
                  }
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <CardGroup
                  key={student.alumno_id}
                  student={student}
                  showParent={showParent}
                  setShowParent={setShowParent}
                  updateStudentInList={updateStudentInList}
                  handleToggleEstado={handleToggleEstado}
                  disabled={currentPeriodoActivo === 0}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Controles de Paginación */}
      {currentPagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPagination.page - 1)}
            disabled={currentPagination.page === 1 || loading}
          >
            Anterior
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: currentPagination.totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={currentPagination.page === p ? "default" : "outline"}
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => handlePageChange(p)}
                disabled={loading}
              >
                {p}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPagination.page + 1)}
            disabled={currentPagination.page === currentPagination.totalPages || loading}
          >
            Siguiente
          </Button>
        </div>
      )}

      <Dialog open={modalConfig.isOpen} onOpenChange={(open) => setModalConfig(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="max-w-[340px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
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
    </div>
  );
}

// Subcomponente para organizar el Fragment/Rows y evitar problemas de Key
function CardGroup({ student, showParent, setShowParent, handleToggleEstado, disabled }: any) {
  const isRetirado = student.estado === 'Retirado';
  const isEgresado = student.estado === 'Egresado';

  return (
    <>
      <TableRow className={isRetirado ? "bg-slate-50 opacity-80" : ""}>
        <TableCell className="font-mono text-xs">{student.alumno_dni}</TableCell>
        <TableCell>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900">
              {student.alumno_nombre} {student.alumno_apellido_paterno}{" "}
              {student.alumno_apellido_materno}
            </span>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {student.grado}
          </Badge>
        </TableCell>
        <TableCell>
          {isRetirado ? (
            <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">
              Baja
            </Badge>
          ) : isEgresado ? (
            <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">
              Egresado
            </Badge>
          ) : (
            <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
              Activo
            </Badge>
          )}
        </TableCell>
        <TableCell>
          {new Date(student.fecha_matricula).toLocaleDateString()}
        </TableCell>
        <TableCell className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-blue-600 hover:bg-blue-50"
            onClick={() =>
              setShowParent(
                showParent === student.alumno_id
                  ? null
                  : student.alumno_id
              )
            }
            title="Ver Apoderados"
          >
            {showParent === student.alumno_id ? "Ocultar" : "Apoderados"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleEstado(student.alumno_id, student.estado)}
            disabled={disabled || isEgresado}
            className={isRetirado
              ? "text-green-600 border-green-200 hover:bg-green-50"
              : "text-red-600 border-red-200 hover:bg-red-50"
            }
            title={isRetirado ? "Re-incorporar Estudiante" : isEgresado ? "Alumno Egresado" : "Dar de Baja"}
          >
            {isRetirado ? <UserPlus className="w-4 h-4 mr-1" /> : <UserX className="w-4 h-4 mr-1" />}
            {isRetirado ? "Habilitar" : "Dar de baja"}
          </Button>


        </TableCell>
      </TableRow>

      {showParent === student.alumno_id && (
        <TableRow>
          <TableCell
            colSpan={6}
            className="bg-muted px-6 py-4 text-sm"
          >
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700">Información de Apoderados:</h4>
              {student.apoderados && student.apoderados.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {student.apoderados.map((apoderado: any, index: number) => (
                    <div key={index} className="bg-white p-3 rounded border shadow-sm">
                      <div className="font-medium text-primary mb-1">{apoderado.parentesco}</div>
                      <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-sm">
                        <span className="text-slate-600 font-medium">Nombre:</span>
                        <span>{apoderado.nombre} {apoderado.apellido_paterno} {apoderado.apellido_materno}</span>

                        <span className="text-slate-600 font-medium">DNI:</span>
                        <span>{apoderado.dni}</span>

                        <span className="text-slate-600 font-medium">Teléfono:</span>
                        <span>{apoderado.telefono || "No registrado"}</span>

                        <span className="text-slate-600 font-medium">Correo:</span>
                        <span>{apoderado.email || "No registrado"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-600 italic">No hay apoderados registrados para este alumno.</div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
