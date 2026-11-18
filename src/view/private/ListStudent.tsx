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
import { Loader2, UserX, UserPlus, Ban, GraduationCap, AlertCircle, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DetalleAlumnoModal } from "@/components/DetalleAlumnoModal";
import { HistorialEstadoAlumnoModal } from "@/components/HistorialEstadoAlumnoModal";
import { BotonCompacto, claseInput, Etiqueta } from "@/components/FormularioCompacto";

const API_URL = import.meta.env.VITE_API_URL;

// Codigos de tab_parametro '0001' (estado del alumno)
const ESTADO = { ACTIVO: "AC", RETIRADO: "RE", EGRESADO: "EG", EXPULSADO: "EX" } as const;

const ACCIONES_ESTADO: Record<string, { titulo: string; boton: string; descripcion: string; tipo: "danger" | "success" }> = {
  [ESTADO.RETIRADO]: {
    titulo: "Retirar alumno",
    boton: "Retirar",
    descripcion: "El alumno dejará de estudiar y perderá el acceso al sistema junto con sus apoderados.",
    tipo: "danger",
  },
  [ESTADO.EXPULSADO]: {
    titulo: "Expulsar alumno",
    boton: "Expulsar",
    descripcion: "Se registrará la separación definitiva del alumno y perderá el acceso al sistema.",
    tipo: "danger",
  },
  [ESTADO.ACTIVO]: {
    titulo: "Reactivar alumno",
    boton: "Reactivar",
    descripcion: "El alumno vuelve a estudiar y recupera el acceso al sistema junto con sus apoderados.",
    tipo: "success",
  },
};

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
  hijos?: { nombre: string; grado: string }[];
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
  estado_nombre: string | null;
  motivo_estado: string | null;
  fecha_estado: string | null;
  es_ultimo_grado: boolean;
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
  const [alumnoDetalle, setAlumnoDetalle] = useState<Student | null>(null);
  const [alumnoHistorial, setAlumnoHistorial] = useState<Student | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<{ year: string; grade: string } | null>(null);
  const [updateMessage, setUpdateMessage] = useState<{
    text: string;
    isSuccess: boolean;
  } | null>(null);

  // Cambio de estado con motivo (RE, EX, AC) y egreso del ultimo grado
  const [cambioEstado, setCambioEstado] = useState<{ student: Student; idEstado: string } | null>(null);
  const [egreso, setEgreso] = useState<{ todos: boolean } | null>(null);
  const [motivo, setMotivo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [seleccionados, setSeleccionados] = useState<number[]>([]);

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

  const periodoInactivo = () => {
    if (currentPeriodoActivo === 0) {
      showAlert("Acción restringida", "No se pueden realizar cambios en un periodo académico inactivo.", "warning");
      return true;
    }
    return false;
  };

  const abrirCambioEstado = (student: Student, idEstado: string) => {
    if (periodoInactivo()) return;
    setMotivo("");
    setCambioEstado({ student, idEstado });
  };

  const abrirEgreso = (todos: boolean) => {
    if (periodoInactivo()) return;
    setMotivo("");
    setEgreso({ todos });
  };

  const refrescarLista = (mensaje: string) => {
    setSeleccionados([]);
    queryClient.invalidateQueries({ queryKey: ['studentsList'] });
    setUpdateMessage({ text: mensaje, isSuccess: true });
    setTimeout(() => setUpdateMessage(null), 3000);
  };

  const guardarCambioEstado = async () => {
    if (!cambioEstado) return;
    if (motivo.trim().length < 5) return;

    setGuardando(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.patch(
        `${API_URL}/alumno/estado/${cambioEstado.student.alumno_id}`,
        { id_estado: cambioEstado.idEstado, motivo: motivo.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCambioEstado(null);
      refrescarLista(data.message);
    } catch (error: any) {
      showAlert("Error", error.response?.data?.message || "Error al conectar con el servidor", "danger");
    } finally {
      setGuardando(false);
    }
  };

  const guardarEgreso = async () => {
    if (!egreso) return;

    setGuardando(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `${API_URL}/alumno/egresar`,
        egreso.todos
          ? { todos: true, motivo: motivo.trim() || undefined }
          : { ids: seleccionados, motivo: motivo.trim() || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEgreso(null);
      refrescarLista(data.message);
    } catch (error: any) {
      showAlert("Error", error.response?.data?.message || "Error al conectar con el servidor", "danger");
    } finally {
      setGuardando(false);
    }
  };

  const esUltimoGrado = students.some((st: Student) => st.es_ultimo_grado);
  const activosPagina = filteredStudents.filter((st) => st.estado === ESTADO.ACTIVO).map((st) => st.alumno_id);
  const todosPaginaSeleccionados = activosPagina.length > 0 && activosPagina.every((id) => seleccionados.includes(id));

  const alternarSeleccion = (id: number, marcado: boolean) => {
    setSeleccionados((prev) => (marcado ? [...prev, id] : prev.filter((x) => x !== id)));
  };

  const alternarPagina = (marcado: boolean) => {
    setSeleccionados((prev) =>
      marcado ? [...new Set([...prev, ...activosPagina])] : prev.filter((id) => !activosPagina.includes(id))
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
    setSeleccionados([]);
  }, [appliedFilters]);

  const handleSearch = () => {
    setAppliedFilters({ year, grade });
    setPage(1);
  };

  const columnas = esUltimoGrado ? 7 : 6;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Banner de Periodo Inactivo */}
      {appliedFilters?.year && currentPeriodoActivo === 0 && (
        <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-lg flex items-center gap-3 text-sm font-medium">
          <span className="text-xl">⚠️</span>
          Este periodo académico está <strong className="font-bold">Inactivo</strong>. Las acciones de retiro, reactivación y egreso están deshabilitadas.
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
            inputMode="numeric"
            maxLength={8}
            onChange={(e) => setDniSearch(e.target.value.replace(/\D/g, "").slice(0, 8))}
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

      {esUltimoGrado && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-[5px] border border-amber-200 bg-amber-50 px-2.5 py-2 text-xs text-amber-800">
          <span>
            Último grado: marca a los alumnos que culminaron el nivel para pasarlos a <strong>Egresado</strong>.
          </span>
          <div className="flex gap-2">
            <BotonCompacto
              variante="secundario"
              icono={GraduationCap}
              disabled={seleccionados.length === 0 || currentPeriodoActivo === 0}
              onClick={() => abrirEgreso(false)}
            >
              Egresar seleccionados ({seleccionados.length})
            </BotonCompacto>
            <BotonCompacto
              icono={GraduationCap}
              className="!bg-amber-600 hover:!bg-amber-700"
              disabled={currentPeriodoActivo === 0}
              onClick={() => abrirEgreso(true)}
            >
              Egresar todo el grado
            </BotonCompacto>
          </div>
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
              {esUltimoGrado && (
                <TableHead className="w-8">
                  <Checkbox
                    checked={todosPaginaSeleccionados}
                    onCheckedChange={(v) => alternarPagina(v === true)}
                    disabled={activosPagina.length === 0}
                    title="Seleccionar activos de esta página"
                  />
                </TableHead>
              )}
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
                <TableCell colSpan={columnas} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-sm text-slate-500">Cargando estudiantes...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnas} className="text-center py-4">
                  {dniSearch.trim() !== ""
                    ? `No se encontraron estudiantes con DNI: ${dniSearch}`
                    : !appliedFilters ? "Seleccione Año y Grado, luego presione Ver" : "No hay estudiantes registrados"
                  }
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <FilaAlumno
                  key={student.alumno_id}
                  student={student}
                  verDetalle={setAlumnoDetalle}
                  verHistorial={setAlumnoHistorial}
                  abrirCambioEstado={abrirCambioEstado}
                  disabled={currentPeriodoActivo === 0}
                  conSeleccion={esUltimoGrado}
                  seleccionado={seleccionados.includes(student.alumno_id)}
                  alternarSeleccion={alternarSeleccion}
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

      {alumnoHistorial && (
        <HistorialEstadoAlumnoModal
          idAlumno={alumnoHistorial.alumno_id}
          nombreAlumno={`${alumnoHistorial.alumno_nombre} ${alumnoHistorial.alumno_apellido_paterno} ${alumnoHistorial.alumno_apellido_materno}`}
          estilosEstado={ESTILO_ESTADO}
          onClose={() => setAlumnoHistorial(null)}
        />
      )}

      {alumnoDetalle && (
        <DetalleAlumnoModal
          alumno={alumnoDetalle}
          estiloEstado={ESTILO_ESTADO[alumnoDetalle.estado] || ""}
          onClose={() => setAlumnoDetalle(null)}
        />
      )}

      <Dialog
        open={!!cambioEstado || !!egreso}
        onOpenChange={(open) => {
          if (!open && !guardando) {
            setCambioEstado(null);
            setEgreso(null);
          }
        }}
      >
        <DialogContent className="max-w-md gap-0 rounded-lg p-0 [&>button]:hidden">
          {(() => {
            const accion = cambioEstado ? ACCIONES_ESTADO[cambioEstado.idEstado] : null;
            const motivoObligatorio = !!cambioEstado;
            const motivoValido = !motivoObligatorio || motivo.trim().length >= 5;
            const cerrar = () => {
              setCambioEstado(null);
              setEgreso(null);
            };
            return (
              <>
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div>
                    <div className="text-[15px] font-extrabold text-slate-900">
                      {accion ? accion.titulo : "Pasar a egresado"}
                    </div>
                    {cambioEstado && (
                      <div className="text-xs text-slate-500">
                        {cambioEstado.student.alumno_nombre} {cambioEstado.student.alumno_apellido_paterno}{" "}
                        {cambioEstado.student.alumno_apellido_materno} · DNI {cambioEstado.student.alumno_dni}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={cerrar}
                    disabled={guardando}
                    aria-label="Cerrar"
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[10px] bg-slate-100 text-slate-500 hover:text-slate-900"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex flex-col gap-3 px-5 py-4">
                  <p className="text-xs text-slate-600">
                    {accion
                      ? accion.descripcion
                      : egreso?.todos
                        ? "Todos los alumnos activos del último grado pasarán a Egresado y perderán el acceso al sistema."
                        : `${seleccionados.length} alumno(s) pasarán a Egresado y perderán el acceso al sistema.`}
                  </p>
                  <div className="flex flex-col gap-1">
                    <Etiqueta obligatorio={motivoObligatorio}>Motivo {motivoObligatorio ? "" : "(opcional)"}</Etiqueta>
                    <textarea
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      maxLength={255}
                      rows={3}
                      placeholder={motivoObligatorio ? "Describe el motivo..." : "Culminó el nivel educativo"}
                      className={`${claseInput} !h-auto resize-none py-1`}
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{motivoObligatorio && !motivoValido ? "Mínimo 5 caracteres." : ""}</span>
                      <span>{motivo.length}/255</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">
                  <BotonCompacto variante="secundario" disabled={guardando} onClick={cerrar}>
                    Cancelar
                  </BotonCompacto>
                  <BotonCompacto
                    cargando={guardando}
                    disabled={guardando || !motivoValido}
                    onClick={cambioEstado ? guardarCambioEstado : guardarEgreso}
                    className={
                      accion?.tipo === "danger"
                        ? "!bg-red-600 hover:!bg-red-700"
                        : accion
                          ? "!bg-green-600 hover:!bg-green-700"
                          : "!bg-amber-600 hover:!bg-amber-700"
                    }
                  >
                    {accion ? accion.boton : "Pasar a egresado"}
                  </BotonCompacto>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

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
                className="rounded-[10px] flex-1 text-sm font-bold text-slate-400 hover:bg-slate-50 transition-colors uppercase tracking-widest border-r border-slate-100"
              >
                {modalConfig.cancelText || "Cancelar"}
              </button>
            )}
            <button
              onClick={() => {
                if (modalConfig.onConfirm) modalConfig.onConfirm();
                setModalConfig(prev => ({ ...prev, isOpen: false }));
              }}
              className={`rounded-[10px] flex-1 text-sm font-bold hover:bg-slate-50 transition-colors uppercase tracking-widest ${modalConfig.type === "danger" ? "text-rose-600" : "text-blue-600"
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

const ESTILO_ESTADO: Record<string, string> = {
  [ESTADO.ACTIVO]: "bg-green-100 text-green-700",
  [ESTADO.RETIRADO]: "bg-red-100 text-red-700",
  [ESTADO.EGRESADO]: "bg-amber-100 text-amber-700",
  [ESTADO.EXPULSADO]: "bg-slate-800 text-white",
};

type FilaAlumnoProps = {
  student: Student;
  verDetalle: (student: Student) => void;
  verHistorial: (student: Student) => void;
  abrirCambioEstado: (student: Student, idEstado: string) => void;
  disabled: boolean;
  conSeleccion: boolean;
  seleccionado: boolean;
  alternarSeleccion: (id: number, marcado: boolean) => void;
};

// Fila de la tabla de alumnos
function FilaAlumno({ student, verDetalle, verHistorial, abrirCambioEstado, disabled, conSeleccion, seleccionado, alternarSeleccion }: FilaAlumnoProps) {
  const esActivo = student.estado === ESTADO.ACTIVO;
  const esEgresado = student.estado === ESTADO.EGRESADO;
  const fueraDelColegio = student.estado === ESTADO.RETIRADO || student.estado === ESTADO.EXPULSADO;
  const claseBotonFila = "!h-[24px] !px-2 !text-[10.5px]";
  const claseEstado = `border-transparent ${ESTILO_ESTADO[student.estado] || "bg-slate-100 text-slate-600"}`;

  return (
    <TableRow className={fueraDelColegio ? "bg-slate-50 opacity-80" : ""}>
      {conSeleccion && (
        <TableCell>
          <Checkbox
            checked={seleccionado}
            onCheckedChange={(v) => alternarSeleccion(student.alumno_id, v === true)}
            disabled={!esActivo || disabled}
          />
        </TableCell>
      )}
      <TableCell className="font-mono text-xs">
        <button
          type="button"
          onClick={() => verDetalle(student)}
          className="rounded-[10px] cursor-pointer font-semibold text-blue-700 hover:underline"
          title="Ver detalle del alumno y apoderados"
        >
          {student.alumno_dni}
        </button>
      </TableCell>
      <TableCell>
        <span className="font-semibold text-slate-900">
          {student.alumno_nombre} {student.alumno_apellido_paterno}{" "}
          {student.alumno_apellido_materno}
        </span>
      </TableCell>
      <TableCell>{student.grado}</TableCell>
      <TableCell>
        {student.fecha_estado ? (
          <button
            type="button"
            onClick={() => verHistorial(student)}
            title="Ver historial y observaciones del estado"
            className="rounded-[10px] cursor-pointer"
          >
            <Badge className={`${claseEstado} underline-offset-2 hover:underline`}>
              {student.estado_nombre || student.estado}
            </Badge>
          </button>
        ) : (
          <Badge className={claseEstado}>{student.estado_nombre || student.estado}</Badge>
        )}
      </TableCell>
      <TableCell>
        {new Date(student.fecha_matricula).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-1.5">
          {esActivo && (
            <>
              <BotonCompacto
                variante="peligro"
                icono={UserX}
                className={claseBotonFila}
                onClick={() => abrirCambioEstado(student, ESTADO.RETIRADO)}
                disabled={disabled}
                title="Retirar alumno"
              >
                Retirar
              </BotonCompacto>
              <BotonCompacto
                variante="secundario"
                icono={Ban}
                className={claseBotonFila}
                onClick={() => abrirCambioEstado(student, ESTADO.EXPULSADO)}
                disabled={disabled}
                title="Expulsar alumno"
              >
                Expulsar
              </BotonCompacto>
            </>
          )}
          {fueraDelColegio && (
            <BotonCompacto
              variante="exito"
              icono={UserPlus}
              className={claseBotonFila}
              onClick={() => abrirCambioEstado(student, ESTADO.ACTIVO)}
              disabled={disabled}
              title="Reactivar alumno"
            >
              Reactivar
            </BotonCompacto>
          )}
          {esEgresado && <span className="text-[11px] text-slate-400">Sin acciones</span>}
        </div>
      </TableCell>
    </TableRow>
  );
}
