import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { Search, Loader2, AlertCircle, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const API_URL = import.meta.env.VITE_API_URL;

interface CursoAsignado {
  idCurso: number;
  idGrado: number;
}

interface GradoDisponibilidad {
  id_grado: number;
  numero_grado: number;
  nombre_grado: string;
  ocupado: boolean;
}

interface CursoItem {
  id_curso: number;
  nombre: string;
  grados: GradoDisponibilidad[];
}

interface Credenciales {
  username: string;
  password: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  credenciales: Credenciales;
}

interface DniResponse {
  status: boolean;
  data: {
    first_name?: string;
    last_name?: string;
    first_last_name?: string;
    second_last_name?: string;
    nombres?: string;
    apellidoMaterno?: string;
    apellidoPaterno?: string;
    nombre?: string;
    numeroDocumento?: string;
  };
}

import { useEffect } from "react";

const EMPTY_ARRAY: any[] = [];

export default function RegisterTeacher() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    dni: "",
    nombres: "",
    apellido_paterno: "",
    apellido_materno: "",
    fecha_nacimiento: "",
    sexo: "M",
    email: "",
    telefono: "",
    direccion: "",
    especialidad: "",
    grado_academico: "",
    id_periodo: "",
  });

  const [cursosAsignados, setCursosAsignados] = useState<CursoAsignado[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [credenciales, setCredenciales] = useState<Credenciales | null>(null);

  const [currentYear, setCurrentYear] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Custom Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    type: "info" | "success" | "danger" | "warning";
    showCancel?: boolean;
  }>({
    isOpen: false,
    title: "",
    description: "",
    type: "info",
    showCancel: false
  });

  const showAlert = (title: string, description: string, type: "success" | "danger" | "warning" | "info" = "info") => {
    setModalConfig({ isOpen: true, title, description, confirmText: "Aceptar", showCancel: false, type });
  };

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'dni':
        if (!value) return 'El DNI es obligatorio';
        if (!/^\d{8}$/.test(value)) return 'El DNI debe tener exactamente 8 dígitos numéricos';
        return '';
      case 'telefono':
        if (!value) return 'El teléfono es obligatorio';
        if (!/^\d{9}$/.test(value)) return 'El teléfono debe tener exactamente 9 dígitos numéricos';
        return '';
      case 'email':
        if (!value) return 'El email es obligatorio';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Formato de email inválido';
        return '';
      case 'nombres':
      case 'apellido_paterno':
      case 'apellido_materno':
      case 'fecha_nacimiento':
      case 'direccion':
        if (!value) return 'Este campo es obligatorio';
        return '';
      default:
        return '';
    }
  };

  // 1) Fetch periodos con useQuery
  const { data: periodos = EMPTY_ARRAY } = useQuery<any[]>({
    queryKey: ['periodosPromocion'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/promocion/periodos`);
      if (response.data.status) {
        return response.data.data;
      }
      return [];
    },
    staleTime: 60 * 60 * 1000,
  });

  // Ajustar el active period y currentYear cuando cargan los periodos
  useEffect(() => {
    if (periodos.length > 0 && !currentYear) {
      const active = periodos.find((p: any) => p.activo === 1) || periodos[0];
      if (active) {
        setCurrentYear(active.anio.toString());
        setFormData(prev => ({ ...prev, id_periodo: active.id.toString() }));
      }
    }
  }, [periodos, currentYear]);

  const currentPeriodo = periodos.find((p: any) => p.id.toString() === formData.id_periodo);
  const isPeriodoInactivo = !!(currentPeriodo && currentPeriodo.activo === 0);

  // 2) Fetch disponibilidad dependiente de currentYear
  const { data: cursosDisponibles = [] } = useQuery<CursoItem[]>({
    queryKey: ['disponibilidadCursos', currentYear],
    queryFn: async () => {
      if (!currentYear) return [];
      const response = await axios.get(`${API_URL}/docente/disponibilidad-cursos/${currentYear}`);
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    },
    enabled: !!currentYear,
    staleTime: 5 * 60 * 1000,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "dni") setSuccessMessage(null);
    setFormData((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleBuscar = async () => {
    if (!formData.dni || formData.dni.length !== 8) {
      showAlert("DNI inválido", "Por favor, ingrese un DNI válido de 8 dígitos.", "warning");
      return;
    }

    setSearching(true);
    setCredenciales(null);
    try {
      // 1. Intentar búsqueda local
      const localRes = await axios.get(`${API_URL}/docente/buscar-local/${formData.dni}`);

      if (localRes.data.success) {
        const d = localRes.data.data;
        setFormData((prev) => ({
          ...prev,
          nombres: d.nombres || "",
          apellido_paterno: d.apellido_paterno || "",
          apellido_materno: d.apellido_materno || "",
          email: d.email || "",
          telefono: d.telefono || "",
          direccion: d.direccion || "",
          especialidad: d.especialidad || "",
          grado_academico: d.grado_academico || "",
          sexo: d.sexo || "M",
          fecha_nacimiento: d.fecha_nacimiento ? d.fecha_nacimiento.split('T')[0] : "",
        }));
        setSuccessMessage("Docente encontrado en el sistema. Seleccione nuevos cursos para el período.");
        return;
      }

      // 2. Si no es local, buscar en RENIEC/DNI externo
      const response = await axios.get<DniResponse>(
        `${API_URL}/dni/buscar-dni/${formData.dni}`
      );

      if (response.data.status) {
        const d = response.data.data;
        setFormData((prev) => ({
          ...prev,
          nombres: d.first_name || d.nombres || d.nombre || "",
          apellido_paterno: d.first_last_name || d.apellidoPaterno || "",
          apellido_materno: d.second_last_name || d.apellidoMaterno || "",
          dni: d.numeroDocumento ? d.numeroDocumento.toString() : prev.dni
        }));
        setSuccessMessage(null);
      }
    } catch (error) {
      showAlert("Error", "No se pudo buscar el DNI. Intente nuevamente.", "danger");
    } finally {
      setSearching(false);
    }
  };

  const handleCursoChange = (
    idCurso: number,
    idGrado: number,
    checked: boolean
  ) => {
    setCursosAsignados((prev) => {
      if (checked) {
        return [...prev, { idCurso, idGrado }];
      }
      return prev.filter(
        (curso) => !(curso.idCurso === idCurso && curso.idGrado === idGrado)
      );
    });
  };

  const handleGuardar = async () => {
    // Validar todos los campos antes de guardar
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    Object.keys(formData).forEach(key => {
      const error = validateField(key, (formData as any)[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    if (!isValid) {
      setErrors(newErrors);
      showAlert("Formulario incompleto", "Por favor corrija los errores en el formulario antes de continuar.", "warning");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        id_periodo: Number(formData.id_periodo),
        cursos_asignados: cursosAsignados,
      };

      const { data } = await axios.post<ApiResponse>(
        `${API_URL}/docente/registrar-docente`,
        payload
      );

      if (data.success) {
        setCredenciales(data.credenciales);
        showAlert("Éxito", "El docente ha sido registrado exitosamente.", "success");
        setFormData({
          dni: "",
          nombres: "",
          apellido_paterno: "",
          apellido_materno: "",
          fecha_nacimiento: "",
          sexo: "M",
          email: "",
          telefono: "",
          direccion: "",
          especialidad: "",
          grado_academico: "",
          id_periodo: formData.id_periodo, // Mantiene el periodo seleccionado
        });
        setSuccessMessage(null);
        setCursosAsignados([]);

        // Refetch cursos disponibles usando el queryClient cache
        queryClient.invalidateQueries({ queryKey: ['disponibilidadCursos', currentYear] });
        queryClient.invalidateQueries({ queryKey: ['docentesList'] });
      }
    } catch (error) {
      showAlert("Error", "Ocurrió un error al registrar al docente. Intente nuevamente.", "danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-3xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900">Registro de Docente</h1>
          <p className="text-sm text-slate-600 mt-1">Complete los datos del docente y asigne sus cursos</p>
        </div>

        {/* Banner de Periodo Inactivo */}
        {formData.id_periodo && isPeriodoInactivo && (
          <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-lg flex items-center gap-3 text-sm font-medium mb-4">
            <span className="text-xl">⚠️</span>
            El periodo académico seleccionado está <strong className="font-bold">Inactivo</strong>.
            No se permite registrar docentes en periodos inactivos.
          </div>
        )}

        {successMessage && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-sm text-blue-800">
            {successMessage}
          </div>
        )}

        {credenciales && (
          <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
            <h3 className="text-sm font-semibold text-green-800 mb-2">Credenciales Generadas</h3>
            <div className="flex gap-6 text-sm">
              <div>
                <span className="text-green-700 font-medium">Usuario:</span>
                <span className="ml-2 text-green-600">{credenciales.username}</span>
              </div>
              <div>
                <span className="text-green-700 font-medium">Contraseña:</span>
                <span className="ml-2 text-green-600">{credenciales.password}</span>
              </div>
            </div>
          </div>
        )}

        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Datos Personales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* DNI + Buscar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Label className="text-xs font-medium text-slate-700">
                  DNI <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="dni"
                  type="number"
                  value={formData.dni}
                  onChange={handleInputChange}
                  placeholder="Número de documento"
                  className={`mt-1 h-9 bg-white border ${errors.dni ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-300 focus-visible:ring-blue-500'} rounded px-3 text-sm focus-visible:ring-1 focus-visible:border-blue-500`}
                />
                {errors.dni && <p className="text-[10px] text-red-500 mt-1">{errors.dni}</p>}
              </div>
              <div className="flex items-end">
                <Button onClick={handleBuscar} className="h-9 w-full" disabled={searching}>
                  {searching ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  {searching ? "Buscando..." : "Buscar"}
                </Button>
              </div>
            </div>

            {/* Nombres y Apellidos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs font-medium text-slate-700">
                  Nombres <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleInputChange}
                  className={`mt-1 h-9 bg-white border ${errors.nombres ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-300 focus-visible:ring-blue-500'} rounded px-3 text-sm focus-visible:ring-1 focus-visible:border-blue-500`}
                />
                {errors.nombres && <p className="text-[10px] text-red-500 mt-1">{errors.nombres}</p>}
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-700">
                  Apellido Paterno <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="apellido_paterno"
                  value={formData.apellido_paterno}
                  onChange={handleInputChange}
                  className={`mt-1 h-9 bg-white border ${errors.apellido_paterno ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-300 focus-visible:ring-blue-500'} rounded px-3 text-sm focus-visible:ring-1 focus-visible:border-blue-500`}
                />
                {errors.apellido_paterno && <p className="text-[10px] text-red-500 mt-1">{errors.apellido_paterno}</p>}
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-700">
                  Apellido Materno <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="apellido_materno"
                  value={formData.apellido_materno}
                  onChange={handleInputChange}
                  className={`mt-1 h-9 bg-white border ${errors.apellido_materno ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-300 focus-visible:ring-blue-500'} rounded px-3 text-sm focus-visible:ring-1 focus-visible:border-blue-500`}
                />
                {errors.apellido_materno && <p className="text-[10px] text-red-500 mt-1">{errors.apellido_materno}</p>}
              </div>
            </div>

            {/* Fecha, Sexo, Email */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs font-medium text-slate-700">
                  Fecha de Nacimiento <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="fecha_nacimiento"
                  type="date"
                  value={formData.fecha_nacimiento}
                  onChange={handleInputChange}
                  className={`mt-1 h-9 bg-white border ${errors.fecha_nacimiento ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-300 focus-visible:ring-blue-500'} rounded px-3 text-sm focus-visible:ring-1 focus-visible:border-blue-500`}
                />
                {errors.fecha_nacimiento && <p className="text-[10px] text-red-500 mt-1">{errors.fecha_nacimiento}</p>}
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-700">
                  Sexo <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.sexo}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, sexo: value }))}
                >
                  <SelectTrigger className="mt-1 h-9 bg-white border border-slate-300 rounded px-3 text-sm focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500">
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M" className="text-sm">Masculino</SelectItem>
                    <SelectItem value="F" className="text-sm">Femenino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-700">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="ejemplo@correo.com"
                  className={`mt-1 h-9 bg-white border ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-300 focus-visible:ring-blue-500'} rounded px-3 text-sm focus-visible:ring-1 focus-visible:border-blue-500`}
                />
                {errors.email && <p className="text-[10px] text-red-500 mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* Teléfono y Dirección */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium text-slate-700">
                  Teléfono <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="telefono"
                  type="number"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  placeholder="999888777"
                  className={`mt-1 h-9 bg-white border ${errors.telefono ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-300 focus-visible:ring-blue-500'} rounded px-3 text-sm focus-visible:ring-1 focus-visible:border-blue-500`}
                />
                {errors.telefono && <p className="text-[10px] text-red-500 mt-1">{errors.telefono}</p>}
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-700">
                  Dirección <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  className={`mt-1 h-9 bg-white border ${errors.direccion ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-300 focus-visible:ring-blue-500'} rounded px-3 text-sm focus-visible:ring-1 focus-visible:border-blue-500`}
                />
                {errors.direccion && <p className="text-[10px] text-red-500 mt-1">{errors.direccion}</p>}
              </div>
            </div>

            {/* Período Académico, Especialidad, Grado Académico */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs font-medium text-slate-700">
                  Período Académico <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.id_periodo}
                  onValueChange={(value) => {
                    const selected = periodos.find(p => p.id.toString() === value);
                    if (selected) {
                      setCurrentYear(selected.anio.toString());
                      setFormData(prev => ({ ...prev, id_periodo: value }));
                    }
                  }}
                >
                  <SelectTrigger className="mt-1 h-9 bg-white border border-slate-300 rounded px-3 text-sm focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500">
                    <SelectValue placeholder="Seleccione período..." />
                  </SelectTrigger>
                  <SelectContent>
                    {periodos.filter((p: any) => p.activo === 1).map((p: any) => (
                      <SelectItem key={p.id} value={p.id.toString()} className="text-sm">
                        Año {p.anio}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-700">
                  Especialidad <span className="text-slate-400 font-normal ml-1">(Opcional)</span>
                </Label>
                <Input
                  name="especialidad"
                  value={formData.especialidad}
                  onChange={handleInputChange}
                  className="mt-1 h-9 bg-white border border-slate-300 rounded px-3 text-sm focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-700">
                  Grado Académico <span className="text-slate-400 font-normal ml-1">(Opcional)</span>
                </Label>
                <Input
                  name="grado_academico"
                  value={formData.grado_academico}
                  onChange={handleInputChange}
                  className="mt-1 h-9 bg-white border border-slate-300 rounded px-3 text-sm focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                />
              </div>
            </div>

            {/* Cursos y Grados */}
            <div className="border border-slate-200 rounded p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Cursos y Grados</h3>
                <span className="text-xs text-slate-500">
                  {cursosAsignados.length} seleccionado(s)
                </span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start h-9 text-sm">
                    {cursosAsignados.length > 0
                      ? `${cursosAsignados.length} curso(s) seleccionado(s)`
                      : "Seleccionar cursos y grados"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-64 overflow-y-auto w-[350px] p-4">
                  {cursosDisponibles.map((curso) => (
                    <div key={curso.id_curso} className="space-y-2 mb-4">
                      <div className="text-sm font-semibold border-b pb-1 text-slate-700">{curso.nombre}</div>
                      <div className="grid grid-cols-3 gap-2">
                        {curso.grados.map((grado) => (
                          <div
                            key={grado.id_grado}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`${curso.id_curso}-${grado.id_grado}`}
                              checked={cursosAsignados.some(
                                (c) =>
                                  c.idCurso === curso.id_curso && c.idGrado === grado.id_grado
                              )}
                              disabled={grado.ocupado}
                              onCheckedChange={(checked) =>
                                handleCursoChange(
                                  curso.id_curso,
                                  grado.id_grado,
                                  Boolean(checked)
                                )
                              }
                            />
                            <Label
                              htmlFor={`${curso.id_curso}-${grado.id_grado}`}
                              className={`text-sm cursor-pointer ${grado.ocupado ? 'text-gray-400 line-through' : ''}`}
                              title={grado.ocupado ? "Grado ya ocupado" : ""}
                            >
                              {grado.numero_grado}° {grado.ocupado && "(Ocupado)"}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleGuardar} disabled={loading || isPeriodoInactivo}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  "Guardar Docente"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

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
            <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2">{modalConfig.title}</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">{modalConfig.description}</p>
          </div>
          <div className="flex border-t border-slate-100 h-14">
            <button
              onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
              className={`flex-1 text-sm font-bold hover:bg-slate-50 transition-colors uppercase tracking-widest ${modalConfig.type === "danger" ? "text-rose-600" : "text-blue-600"
                }`}
            >
              {modalConfig.confirmText || "Aceptar"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
