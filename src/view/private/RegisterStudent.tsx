"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import clsx from "clsx";
import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { FileText, RefreshCw, Loader2, Search, CheckCircle2, ChevronLeft } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const steps = [
  { id: 1, title: "Estudiante" },
  { id: 2, title: "Apoderado" },
  { id: 3, title: "Información Económica" },
  { id: 4, title: "Documentos" },
  { id: 5, title: "Confirmar" },
];

type Grado = {
  id: number;
  numero_grado: number;
  nombre: string;
};

interface Periodo {
  id: number;
  anio: number;
  costo_matricula: string;
  costo_cuota_mensual: string;
  numero_cuotas: number;
  activo: number;
}

interface FormData {
  // Alumno
  alumno_dni: string;
  alumno_nombre: string;
  alumno_ap_p: string;
  alumno_ap_m: string;
  alumno_fecha_nacimiento: string;
  alumno_email: string;
  alumno_sexo: string;
  alumno_lengua_materna: string;
  alumno_direccion: string;
  alumno_religion: string;
  id_grado: string;
  tipo_ingreso: string;

  // Padre
  padre_dni: string;
  padre_nombre: string;
  padre_ap_p: string;
  padre_ap_m: string;
  padre_fecha_nacimiento: string;
  padre_telefono: string;
  padre_ocupacion: string;
  padre_email: string;

  // Madre
  madre_dni: string;
  madre_nombre: string;
  madre_ap_p: string;
  madre_ap_m: string;
  madre_fecha_nacimiento: string;
  madre_telefono: string;
  madre_ocupacion: string;
  madre_email: string;

  // Apoderado (Principal)
  apoderado_dni: string;
  apoderado_nombre: string;
  apoderado_ap_p: string;
  apoderado_ap_m: string;
  apoderado_fecha_nacimiento: string;
  apoderado_telefono: string;
  apoderado_relacion: string;
  apoderado_ocupacion: string;

  // Documentos
  dni_entregado: boolean;
  certificado_estudios: boolean;
  partida_nacimiento: boolean;

  // Económico
  matricula_precio: number;
  costo_cuota: number;
  año_academico: string;
  // Cuotas mensuales
  [key: string]: string | number | boolean;
  c1: number;
  c2: number;
  c3: number;
  c4: number;
  c5: number;
  c6: number;
  c7: number;
  c8: number;
  c9: number;
  c10: number;
}

interface ErrorResponse {
  message: string;
}

export default function RegisterStudent() {
  const [step, setStep] = useState(0);
  const [activeTab, setActiveTab] = useState<'padre' | 'madre'>('padre');
  const [loading, setLoading] = useState(false);
  const [searchingFor, setSearchingFor] = useState<'alumno' | 'padre' | 'madre' | null>(null);
  const [message, setMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  // Form data state
  const [formData, setFormData] = useState<FormData>({
    // Alumno
    alumno_dni: "",
    alumno_nombre: "",
    alumno_ap_p: "",
    alumno_ap_m: "",
    alumno_fecha_nacimiento: "",
    alumno_email: "",
    alumno_sexo: "",
    alumno_lengua_materna: "",
    alumno_direccion: "",
    alumno_religion: "Católico", // Valor por defecto común o vacío
    id_grado: "",
    tipo_ingreso: "",

    // Padre
    padre_dni: "",
    padre_nombre: "",
    padre_ap_p: "",
    padre_ap_m: "",
    padre_fecha_nacimiento: "",
    padre_telefono: "",
    padre_ocupacion: "",
    padre_email: "",

    // Madre
    madre_dni: "",
    madre_nombre: "",
    madre_ap_p: "",
    madre_ap_m: "",
    madre_fecha_nacimiento: "",
    madre_telefono: "",
    madre_ocupacion: "",
    madre_email: "",

    // Apoderado
    apoderado_dni: "",
    apoderado_nombre: "",
    apoderado_ap_p: "",
    apoderado_ap_m: "",
    apoderado_fecha_nacimiento: "",
    apoderado_telefono: "",
    apoderado_relacion: "",
    apoderado_ocupacion: "",

    // Documentos
    dni_entregado: false,
    certificado_estudios: false,
    partida_nacimiento: false,

    // Económico
    matricula_precio: 0,
    costo_cuota: 0,
    año_academico: "",
    // Cuotas mensuales
    c1: 0,
    c2: 0,
    c3: 0,
    c4: 0,
    c5: 0,
    c6: 0,
    c7: 0,
    c8: 0,
    c9: 0,
    c10: 0,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);

  const formatDateForInput = (dateStr: string | undefined) => {
    if (!dateStr) return "";
    // Si ya está en formato YYYY-MM-DD, devolverlo
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    // Si está en formato DD/MM/YYYY, convertirlo
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    return dateStr;
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingPdf(true);
    setMessage({ text: "Procesando Ficha Única de Matrícula (n8n)...", isError: false });

    try {
      const formDataPdf = new FormData();
      formDataPdf.append('file', file);

      const response = await fetch(`${API_URL}/ocr/extraer-n8n`, {
        method: 'POST',
        body: formDataPdf,
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const data = await response.json();

      if (data.success && data.datos) {
        const ext = data.datos;
        const student = ext.estudiante || {};
        const padre = ext.padre || {};
        const madre = ext.madre || {};
        const matricula = ext.matricula || {};

        // Mapeo de sexo: H -> M (Masculino), M -> F (Femenino)
        let sexoMapeado = student.sexo;
        if (student.sexo === "H") sexoMapeado = "M";
        else if (student.sexo === "M") sexoMapeado = "F";

        // Mapear datos al formulario
        setFormData(prev => ({
          ...prev,
          // Alumno
          alumno_dni: student.numero_documento || prev.alumno_dni,
          alumno_nombre: student.nombres || prev.alumno_nombre,
          alumno_ap_p: student.apellido_paterno || prev.alumno_ap_p,
          alumno_ap_m: student.apellido_materno || prev.alumno_ap_m,
          alumno_fecha_nacimiento: formatDateForInput(student.fecha_nacimiento) || prev.alumno_fecha_nacimiento,
          alumno_sexo: sexoMapeado || prev.alumno_sexo,
          alumno_lengua_materna: student.lengua_materna || prev.alumno_lengua_materna,
          alumno_direccion: student.lugar_nacimiento ? `${student.lugar_nacimiento.departamento}, ${student.lugar_nacimiento.provincia}, ${student.lugar_nacimiento.distrito}` : prev.alumno_direccion,

          // Padre
          padre_nombre: padre.nombres || prev.padre_nombre,
          padre_ap_p: padre.apellido_paterno || prev.padre_ap_p,
          padre_ap_m: padre.apellido_materno || prev.padre_ap_m,
          padre_fecha_nacimiento: formatDateForInput(padre.fecha_nacimiento) || prev.padre_fecha_nacimiento,
          padre_ocupacion: padre.ocupacion || prev.padre_ocupacion,

          // Madre
          madre_nombre: madre.nombres || prev.madre_nombre,
          madre_ap_p: madre.apellido_paterno || prev.madre_ap_p,
          madre_ap_m: madre.apellido_materno || prev.madre_ap_m,
          madre_fecha_nacimiento: formatDateForInput(madre.fecha_nacimiento) || prev.madre_fecha_nacimiento,
          madre_ocupacion: madre.ocupacion || prev.madre_ocupacion,
        }));

        // Intentar pre-seleccionar el grado
        const gradoTexto = matricula.grado;
        if (gradoTexto) {
          const searchStr = gradoTexto.toString().toLowerCase().trim();
          const gradoEncontrado = grados.find(g => {
            const desc = g.nombre.toLowerCase();
            const gNum = g.numero_grado?.toString();
            return desc.includes(searchStr) ||
              searchStr.includes(desc) ||
              gNum === searchStr ||
              (searchStr.includes("primero") && desc.includes("primero")) ||
              (searchStr.includes("segundo") && desc.includes("segundo")) ||
              (searchStr.includes("tercero") && desc.includes("tercero")) ||
              (searchStr.includes("cuarto") && desc.includes("cuarto")) ||
              (searchStr.includes("quinto") && desc.includes("quinto"));
          });

          if (gradoEncontrado) {
            setFormData(prev => ({ ...prev, id_grado: gradoEncontrado.id.toString() }));
          }
        }

        setMessage({ text: "Datos extraídos correctamente de la FUM via n8n", isError: false });
      } else {
        throw new Error("No se pudieron extraer datos del PDF");
      }
    } catch (error) {
      setMessage({ text: "Error al procesar el PDF: " + (error instanceof Error ? error.message : "Error desconocido"), isError: true });
    } finally {
      setIsProcessingPdf(false);
      if (e.target) e.target.value = '';
    }
  };

  const validateField = (name: string, value: any) => {
    const stringValue = value?.toString().trim() || '';

    switch (name) {
      case 'alumno_dni':
        if (!stringValue) return 'Este campo es obligatorio';
        if (!/^\d{8}$/.test(stringValue)) return 'El DNI debe tener exactamente 8 dígitos numéricos';
        return '';
      case 'padre_dni':
      case 'madre_dni':
      case 'apoderado_dni':
        if (!stringValue) return 'Este campo es obligatorio';
        if (!/^\d{8}$/.test(stringValue)) return 'El DNI debe tener exactamente 8 dígitos numéricos';
        return '';
      case 'alumno_nombre':
      case 'alumno_ap_p':
      case 'alumno_ap_m':
      case 'alumno_fecha_nacimiento':
      case 'alumno_sexo':
      case 'alumno_direccion':
      case 'id_grado':
      case 'tipo_ingreso':
        if (!stringValue) return 'Este campo es obligatorio';
        return '';
      case 'alumno_religion':
      case 'alumno_lengua_materna':
      case 'alumno_email': // Ya no es obligatorio
        return '';
      // Family fields (Required if section is used, but we validate at submit. Let's keep basic required if typed)
      case 'padre_nombre':
      case 'padre_ap_p':
      case 'padre_ap_m':
      case 'padre_fecha_nacimiento':
      case 'madre_nombre':
      case 'madre_ap_p':
      case 'madre_ap_m':
      case 'madre_fecha_nacimiento':
      case 'año_academico':
        if (!stringValue) return 'Este campo es obligatorio';
        return '';
      case 'padre_email':
      case 'madre_email':
        if (!stringValue) return 'El correo del apoderado es obligatorio';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue)) return 'Formato de email inválido';
        return '';
      // Optional family fields
      case 'padre_ocupacion':
      case 'madre_ocupacion':
        return '';
      case 'padre_telefono':
      case 'madre_telefono':
      case 'apoderado_telefono':
        if (!stringValue) return 'Este campo es obligatorio';
        if (!/^\d{9}$/.test(stringValue)) return 'El teléfono debe tener exactamente 9 dígitos numéricos';
        return '';
      case 'matricula_precio':
      case 'costo_cuota':
        if (stringValue === '' || isNaN(Number(stringValue))) return 'Este campo es obligatorio';
        if (Number(stringValue) <= 0) return 'Debe ser mayor a 0';
        return '';
      default:
        return '';
    }
  };

  const validateStep = (currentStep: number) => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    if (currentStep === 0) {
      const requiredFields = [
        'alumno_dni', 'alumno_nombre', 'alumno_ap_p', 'alumno_ap_m',
        'alumno_fecha_nacimiento', 'alumno_sexo',
        'alumno_direccion', 'id_grado', 'tipo_ingreso'
      ];
      requiredFields.forEach(field => {
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      });
    } else if (currentStep === 1) {
      // Al menos uno debe estar presente
      const hasPadre = formData.padre_dni && formData.padre_nombre;
      const hasMadre = formData.madre_dni && formData.madre_nombre;

      if (!hasPadre && !hasMadre) {
        newErrors[activeTab + '_dni'] = 'Debe registrar al menos un padre o madre';
        isValid = false;
      } else {
        const prefix = hasPadre ? 'padre' : 'madre';
        const fields = [`${prefix}_dni`, `${prefix}_nombre`, `${prefix}_ap_p`, `${prefix}_ap_m`, `${prefix}_fecha_nacimiento`, `${prefix}_telefono`, `${prefix}_email`];
        fields.forEach(field => {
          const error = validateField(field, formData[field]);
          if (error) {
            newErrors[field] = error;
            isValid = false;
          }
        });
      }
    } else if (currentStep === 2) {
      const fields = ['año_academico', 'matricula_precio', 'costo_cuota'];
      fields.forEach(field => {
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      });
    }

    setErrors(newErrors);
    return isValid;
  };



  const nextStep = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, steps.length - 1));
      setMessage(null);
    } else {
      setMessage({ text: "Por favor complete todos los campos obligatorios (*) correctamente.", isError: true });
    }
  };
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  // Cargar grados y periodos usando React Query con caché
  const { data: grados = [] } = useQuery<Grado[]>({
    queryKey: ['grados'],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API_URL}/grado/lista-grado`, { headers });
      return response.data.data;
    },
    staleTime: 60 * 60 * 1000, // 1 hora
  });

  const { data: periodos = [] } = useQuery<Periodo[]>({
    queryKey: ['periodosA'],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API_URL}/cuotas/periodos`, { headers });
      return response.data.data;
    },
    staleTime: 60 * 60 * 1000, // 1 hora
  });

  const currentPeriodo = periodos.find((p: any) => p.anio.toString() === formData.año_academico);
  const isPeriodoInactivo = !!(currentPeriodo && currentPeriodo.activo === 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked :
      type === "number" ? Number(value) : value;

    setFormData(prev => {
      const newFormData = {
        ...prev,
        [name]: newValue,
      };

      // Si es un checkbox de cuota, actualizar el valor correspondiente
      if (name.startsWith('cuota_')) {
        const mesIndex = {
          'cuota_marzo': 'c1',
          'cuota_abril': 'c2',
          'cuota_mayo': 'c3',
          'cuota_junio': 'c4',
          'cuota_julio': 'c5',
          'cuota_agosto': 'c6',
          'cuota_septiembre': 'c7',
          'cuota_octubre': 'c8',
          'cuota_noviembre': 'c9',
          'cuota_diciembre': 'c10'
        }[name] as keyof FormData;

        if (mesIndex) {
          newFormData[mesIndex] = checked ? Number(prev.costo_cuota) : 0;
        }
      }

      return newFormData;
    });

    // Validar el campo
    const error = validateField(name, newValue);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    // Si cambia el costo de la cuota mensual, actualizar los montos de las cuotas ya marcadas
    if (name === 'costo_cuota') {
      const nuevoMonto = Number(newValue);
      setFormData(prev => {
        const updatedData = { ...prev } as any;
        ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10'].forEach(key => {
          if (Number(prev[key as keyof FormData]) > 0) {
            updatedData[key] = nuevoMonto;
          }
        });
        return updatedData;
      });
    }
  };

  // Función para obtener los costos del año

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'año_academico') {
      const periodoSeleccionado = periodos.find(p => p.anio.toString() === value);
      if (periodoSeleccionado) {
        const nuevoCostoCuota = parseFloat(periodoSeleccionado.costo_cuota_mensual);
        setFormData(prev => {
          const updatedData = {
            ...prev,
            año_academico: value,
            matricula_precio: parseFloat(periodoSeleccionado.costo_matricula),
            costo_cuota: nuevoCostoCuota
          };
          // Actualizar todas las cuotas marcadas con el nuevo monto
          ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10'].forEach(key => {
            if (Number(prev[key as keyof FormData]) > 0) {
              (updatedData as any)[key] = nuevoCostoCuota;
            }
          });
          return updatedData;
        });
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

    // Validar el campo
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const renderInput = (name: Extract<keyof FormData, string>, label: string, type: string = "text", placeholder: string = "", isOptional: boolean = false) => (
    <div className="space-y-1">
      <Label htmlFor={name} className="text-xs font-medium text-slate-700">
        {label} {!isOptional ? <span className="text-red-500"> *</span> : <span className="text-slate-400 font-normal ml-1">(Opcional)</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={type === 'number' && typeof formData[name] === 'number' && formData[name] === 0 ? '' : formData[name] as string | number}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={clsx(
          "h-9 bg-white border border-slate-300 rounded px-3 text-sm focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500",
          errors[name] ? "border-red-500" : ""
        )}
      />
      {errors[name] && (
        <p className="text-xs text-red-600 mt-0.5">{errors[name]}</p>
      )}
    </div>
  );

  const renderSelect = (name: Extract<keyof FormData, string>, label: string, options: { value: string; label: string }[], isOptional: boolean = false) => (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-slate-700">
        {label} {!isOptional ? <span className="text-red-500"> *</span> : <span className="text-slate-400 font-normal ml-1">(Opcional)</span>}
      </Label>
      <Select
        value={String(formData[name])}
        onValueChange={(value) => handleSelectChange(name, value)}
      >
        <SelectTrigger className={clsx(
          "h-9 bg-white border border-slate-300 rounded px-3 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
          errors[name] ? "border-red-500" : ""
        )}>
          <SelectValue placeholder="Seleccione..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} className="text-sm">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors[name] && (
        <p className="text-xs text-red-600 mt-0.5">{errors[name]}</p>
      )}
    </div>
  );

  const verificarAlumno = async () => {
    if (!formData.alumno_dni) {
      setMessage({ text: "Ingrese el DNI del alumno", isError: true });
      return;
    }

    try {
      setSearchingFor('alumno');
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/dni/buscar-dni/${formData.alumno_dni}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status) {
        // Autocompletar datos del alumno existente
        setFormData((prev) => ({
          ...prev,
          alumno_nombre: response.data.data.first_name || response.data.data.nombres,
          alumno_ap_p: response.data.data.first_last_name || response.data.data.apellidoPaterno,
          alumno_ap_m: response.data.data.second_last_name || response.data.data.apellidoMaterno,
        }));

        setMessage({
          text: "Alumno encontrado. Puede editar los datos si lo desea",
          isError: false,
        });
      } else {
        setMessage({
          text: "Alumno no registrado. Complete los datos",
          isError: false,
        });
      }
    } catch {
      setMessage({
        text: "Ocurrió un error al verificar el alumno",
        isError: true,
      });
    } finally {
      setSearchingFor(null);
    }
  };

  const verificarFamiliar = async (tipo: 'padre' | 'madre') => {
    const dni = tipo === 'padre' ? formData.padre_dni : formData.madre_dni;
    if (!dni) {
      setMessage({ text: `Ingrese el DNI del ${tipo}`, isError: true });
      return;
    }

    try {
      setSearchingFor(tipo);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/dni/buscar-dni/${dni}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status) {
        setFormData((prev) => ({
          ...prev,
          [`${tipo}_nombre`]: response.data.data.first_name || response.data.data.nombres,
          [`${tipo}_ap_p`]: response.data.data.first_last_name || response.data.data.apellidoPaterno,
          [`${tipo}_ap_m`]: response.data.data.second_last_name || response.data.data.apellidoMaterno,
        }));

        setMessage({
          text: `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} encontrado. Puede editar los datos si lo desea`,
          isError: false,
        });
      } else {
        setMessage({
          text: `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} no registrado. Complete los datos`,
          isError: false,
        });
      }
    } catch {
      setMessage({
        text: `Ocurrió un error al verificar el ${tipo}`,
        isError: true,
      });
    } finally {
      setSearchingFor(null);
    }
  };

  const verificarPadre = () => verificarFamiliar('padre');
  const verificarMadre = () => verificarFamiliar('madre');

  const handleSubmit = async () => {
    // Validación básica
    if (
      !formData.alumno_dni ||
      !formData.alumno_nombre ||
      !formData.alumno_ap_p ||
      !formData.alumno_ap_m ||
      !formData.alumno_fecha_nacimiento
    ) {
      setMessage({
        text: "Complete todos los campos obligatorios del alumno",
        isError: true,
      });
      return;
    }

    // Determinar apoderado automáticamente para el envío
    const apoderadoData = formData.padre_dni ? {
      apoderado_dni: formData.padre_dni,
      apoderado_nombre: formData.padre_nombre,
      apoderado_ap_p: formData.padre_ap_p,
      apoderado_ap_m: formData.padre_ap_m,
      apoderado_fecha_nacimiento: formData.padre_fecha_nacimiento,
      apoderado_telefono: formData.padre_telefono,
      apoderado_ocupacion: formData.padre_ocupacion,
      apoderado_relacion: "padre"
    } : {
      apoderado_dni: formData.madre_dni,
      apoderado_nombre: formData.madre_nombre,
      apoderado_ap_p: formData.madre_ap_p,
      apoderado_ap_m: formData.madre_ap_m,
      apoderado_fecha_nacimiento: formData.madre_fecha_nacimiento,
      apoderado_telefono: formData.madre_telefono,
      apoderado_ocupacion: formData.madre_ocupacion,
      apoderado_relacion: "madre"
    };

    if (!apoderadoData.apoderado_dni) {
      setMessage({ text: "Debe ingresar al menos un padre o madre con DNI", isError: true });
      return;
    }

    if (!formData.id_grado) {
      setMessage({ text: "Seleccione un grado", isError: true });
      return;
    }

    try {
      setLoading(true);

      const periodoSeleccionado = periodos.find(p => p.anio.toString() === formData.año_academico);

      // Construir el payload anidado según estructura requerida
      const payload = {
        estudiante: {
          dni: formData.alumno_dni,
          nombres: formData.alumno_nombre,
          apellido_paterno: formData.alumno_ap_p,
          apellido_materno: formData.alumno_ap_m,
          fecha_nacimiento: formData.alumno_fecha_nacimiento,
          sexo: formData.alumno_sexo,
          lengua_materna: formData.alumno_lengua_materna,
          tipo_ingreso: formData.tipo_ingreso,
          religion: formData.alumno_religion,
          telefono: apoderadoData.apoderado_telefono,
          direccion: formData.alumno_direccion,
          id_grado: Number(formData.id_grado),
          id_seccion: 1, // Por ahora fijo en 1
          id_periodo: periodoSeleccionado ? periodoSeleccionado.id : 1
        },
        padre: {
          dni: formData.padre_dni,
          nombres: formData.padre_nombre,
          apellido_paterno: formData.padre_ap_p,
          apellido_materno: formData.padre_ap_m,
          fecha_nacimiento: formData.padre_fecha_nacimiento,
          telefono: formData.padre_telefono,
          ocupacion: formData.padre_ocupacion,
          email: formData.padre_email
        },
        madre: {
          dni: formData.madre_dni,
          nombres: formData.madre_nombre,
          apellido_paterno: formData.madre_ap_p,
          apellido_materno: formData.madre_ap_m,
          fecha_nacimiento: formData.madre_fecha_nacimiento,
          telefono: formData.madre_telefono,
          ocupacion: formData.madre_ocupacion,
          email: formData.madre_email
        },
        economica: {
          precio_matricula: Number(formData.matricula_precio),
          costo_cuota_mensual: Number(formData.costo_cuota)
        },
        documentos: {
          dni_entregado: formData.dni_entregado,
          certificado_estudios: formData.certificado_estudios,
          partida_nacimiento: formData.partida_nacimiento
        }
      };

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/matricula/matricula`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({
        text: "Matrícula registrada correctamente",
        isError: false,
      });

      // Mostrar credenciales generadas para los padres
      if (response.data.data) {
        const { usuarios_padres } = response.data.data;
        if (usuarios_padres && usuarios_padres.length > 0) {
          const creds = usuarios_padres.map((u: any) =>
            `${u.relacion}: ${u.username} (Pass: ${u.password})`
          ).join(' | ');
          setMessage({
            text: `Matrícula exitosa! Credenciales: ${creds}`,
            isError: false,
          });
        } else {
          setMessage({
            text: "Matrícula registrada correctamente (No se generaron nuevas credenciales)",
            isError: false,
          });
        }
      }

      // Reset form
      setFormData({
        alumno_dni: "",
        alumno_nombre: "",
        alumno_ap_p: "",
        alumno_ap_m: "",
        alumno_fecha_nacimiento: "",
        alumno_email: "",
        alumno_sexo: "",
        alumno_lengua_materna: "",
        alumno_direccion: "",
        id_grado: "",
        padre_dni: "",
        padre_nombre: "",
        padre_ap_p: "",
        padre_ap_m: "",
        padre_fecha_nacimiento: "",
        padre_telefono: "",
        padre_ocupacion: "",
        padre_email: "",
        madre_dni: "",
        madre_nombre: "",
        madre_ap_p: "",
        madre_ap_m: "",
        madre_fecha_nacimiento: "",
        madre_telefono: "",
        madre_ocupacion: "",
        madre_email: "",
        apoderado_dni: "",
        apoderado_nombre: "",
        apoderado_ap_p: "",
        apoderado_ap_m: "",
        apoderado_fecha_nacimiento: "",
        apoderado_telefono: "",
        apoderado_relacion: "",
        apoderado_ocupacion: "",
        dni_entregado: false,
        certificado_estudios: false,
        partida_nacimiento: false,
        matricula_precio: 0,
        costo_cuota: 0,
        año_academico: "",
        c1: 0,
        c2: 0,
        c3: 0,
        c4: 0,
        c5: 0,
        c6: 0,
        c7: 0,
        c8: 0,
        c9: 0,
        c10: 0,
        tipo_ingreso: "",
        alumno_religion: "Católico",
      });
      setStep(0);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      setMessage({
        text:
          axiosError.response?.data?.message || "Error al registrar la matrícula",
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Registro de Matrícula</h1>
        <p className="text-sm text-slate-600 mt-1">Complete los datos del estudiante y apoderado</p>
      </div>

      {/* Banner de Periodo Inactivo */}
      {formData.año_academico && isPeriodoInactivo && (
        <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-lg flex items-center gap-3 text-sm font-medium mb-4">
          <span className="text-xl">⚠️</span>
          El periodo académico seleccionado está <strong className="font-bold">Inactivo</strong>.
          No se permite matricular alumnos en periodos inactivos.
        </div>
      )}
      {/* Stepper Header */}
      <div className="flex justify-between mb-6">
        {steps.map((s, idx) => (
          <div key={s.id} className="flex flex-col items-center flex-1">
            <div
              className={clsx(
                "w-8 h-8 flex items-center justify-center rounded-full border text-sm font-medium",
                step === idx
                  ? "bg-blue-600 border-blue-600 text-white"
                  : idx < step
                    ? "bg-green-600 border-green-600 text-white"
                    : "bg-white border-slate-300 text-slate-400"
              )}
            >
              {idx < step ? <CheckCircle2 className="w-4 h-4" /> : s.id}
            </div>
            <span
              className={clsx(
                "text-xs mt-1.5 font-medium",
                step === idx ? "text-blue-600" : "text-slate-500"
              )}
            >
              {s.title}
            </span>
          </div>
        ))}
      </div>

      {/* Message display */}
      {message && (
        <div
          className={clsx(
            "mb-4 p-3 rounded border text-sm",
            message.isError
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-green-50 text-green-700 border-green-200"
          )}
        >
          {message.text}
        </div>
      )}

      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">{steps[step].title}</CardTitle>
          {step === 0 && (
            <div className="flex items-center gap-2">
              <input
                type="file"
                id="fum-upload"
                className="hidden"
                accept=".pdf"
                onChange={handlePdfUpload}
                disabled={isProcessingPdf}
              />
              <Button
                variant="outline"
                size="sm"
                className="h-9"
                onClick={() => document.getElementById('fum-upload')?.click()}
                disabled={isProcessingPdf}
              >
                {isProcessingPdf ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                {isProcessingPdf ? "Procesando..." : "Cargar FUM"}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <div className="space-y-4">
              {/* DNI + Buscar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  {renderInput("alumno_dni", "DNI del Alumno")}
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    className="h-9 w-full"
                    onClick={verificarAlumno}
                    disabled={searchingFor === 'alumno'}
                  >
                    {searchingFor === 'alumno' ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Search className="w-4 h-4 mr-2" />
                    )}
                    {searchingFor === 'alumno' ? "Buscando..." : "Buscar"}
                  </Button>
                </div>
              </div>
              {/* Nombres y Apellidos */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {renderInput("alumno_nombre", "Nombres")}
                {renderInput("alumno_ap_p", "Apellido Paterno")}
                {renderInput("alumno_ap_m", "Apellido Materno")}
              </div>
              {/* Fecha, Sexo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {renderInput("alumno_fecha_nacimiento", "Fecha de Nacimiento", "date")}
                {renderSelect("alumno_sexo", "Sexo", [
                  { value: "M", label: "Masculino" },
                  { value: "F", label: "Femenino" },
                ])}
              </div>
              {/* Dirección, Lengua, Religión */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {renderInput("alumno_direccion", "Dirección")}
                {renderInput("alumno_lengua_materna", "Lengua Materna", "text", "", true)}
                {renderInput("alumno_religion", "Religión", "text", "", true)}
              </div>
              {/* Tipo de Ingreso y Grado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {renderSelect("tipo_ingreso", "Tipo de Ingreso", [
                  { value: "nuevo", label: "Nuevo Ingresante" },
                  { value: "traslado", label: "Traslado" },
                  { value: "repitente", label: "Repitente" },
                ])}
                {renderSelect("id_grado", "Grado", grados.map((g) => ({
                  value: g.id.toString(),
                  label: g.nombre
                })))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex gap-2 border-b">
                <button
                  type="button"
                  onClick={() => setActiveTab('padre')}
                  className={clsx(
                    "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                    activeTab === 'padre'
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  )}
                >
                  Padre
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('madre')}
                  className={clsx(
                    "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                    activeTab === 'madre'
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  )}
                >
                  Madre
                </button>
              </div>

              {/* DNI + Buscar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Label className="text-xs font-medium text-slate-700">
                    DNI <span className="text-red-500"> *</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Número de documento"
                    className={clsx(
                      "mt-1 h-9",
                      errors[`${activeTab}_dni`] && "border-red-500"
                    )}
                    value={formData[`${activeTab}_dni`] as string}
                    onChange={(e) => handleInputChange({ target: { name: `${activeTab}_dni`, value: e.target.value } } as any)}
                  />
                  {errors[`${activeTab}_dni`] && (
                    <p className="text-xs text-red-600 mt-0.5">{errors[`${activeTab}_dni`]}</p>
                  )}
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    className="h-9 w-full"
                    onClick={() => activeTab === 'padre' ? verificarPadre() : verificarMadre()}
                    disabled={searchingFor === activeTab}
                  >
                    {searchingFor === activeTab ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Search className="w-4 h-4 mr-2" />
                    )}
                    {searchingFor === activeTab ? "Buscando..." : "Buscar"}
                  </Button>
                </div>
              </div>

              {/* Nombres y Apellidos */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-medium text-slate-700">
                    Nombres <span className="text-red-500"> *</span>
                  </Label>
                  <Input
                    type="text"
                    className="mt-1 h-9"
                    value={formData[`${activeTab}_nombre`] as string}
                    onChange={(e) => handleInputChange({ target: { name: `${activeTab}_nombre`, value: e.target.value } } as any)}
                  />
                  {errors[`${activeTab}_nombre`] && (
                    <p className="text-xs text-red-600 mt-0.5">{errors[`${activeTab}_nombre`]}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs font-medium text-slate-700">
                    Apellido Paterno <span className="text-red-500"> *</span>
                  </Label>
                  <Input
                    type="text"
                    className="mt-1 h-9"
                    value={formData[`${activeTab}_ap_p`] as string}
                    onChange={(e) => handleInputChange({ target: { name: `${activeTab}_ap_p`, value: e.target.value } } as any)}
                  />
                  {errors[`${activeTab}_ap_p`] && (
                    <p className="text-xs text-red-600 mt-0.5">{errors[`${activeTab}_ap_p`]}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs font-medium text-slate-700">
                    Apellido Materno <span className="text-red-500"> *</span>
                  </Label>
                  <Input
                    type="text"
                    className="mt-1 h-9"
                    value={formData[`${activeTab}_ap_m`] as string}
                    onChange={(e) => handleInputChange({ target: { name: `${activeTab}_ap_m`, value: e.target.value } } as any)}
                  />
                  {errors[`${activeTab}_ap_m`] && (
                    <p className="text-xs text-red-600 mt-0.5">{errors[`${activeTab}_ap_m`]}</p>
                  )}
                </div>
              </div>

              {/* Fecha, Teléfono, Ocupación */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-medium text-slate-700">
                    Fecha de Nacimiento <span className="text-red-500"> *</span>
                  </Label>
                  <Input
                    type="date"
                    className="mt-1 h-9"
                    value={formData[`${activeTab}_fecha_nacimiento`] as string}
                    onChange={(e) => handleInputChange({ target: { name: `${activeTab}_fecha_nacimiento`, value: e.target.value } } as any)}
                  />
                  {errors[`${activeTab}_fecha_nacimiento`] && (
                    <p className="text-xs text-red-600 mt-0.5">{errors[`${activeTab}_fecha_nacimiento`]}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs font-medium text-slate-700">
                    Teléfono <span className="text-red-500"> *</span>
                  </Label>
                  <Input
                    type="tel"
                    placeholder="900 000 000"
                    className={clsx(
                      "mt-1 h-9",
                      errors[`${activeTab}_telefono`] && "border-red-500"
                    )}
                    value={formData[`${activeTab}_telefono`] as string}
                    onChange={(e) => handleInputChange({ target: { name: `${activeTab}_telefono`, value: e.target.value } } as any)}
                  />
                  {errors[`${activeTab}_telefono`] && (
                    <p className="text-xs text-red-600 mt-0.5">{errors[`${activeTab}_telefono`]}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs font-medium text-slate-700">
                    Ocupación <span className="text-slate-400 font-normal ml-1">(Opcional)</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Ej. Agricultor, Docente, etc."
                    className="mt-1 h-9"
                    value={formData[`${activeTab}_ocupacion`] as string}
                    onChange={(e) => handleInputChange({ target: { name: `${activeTab}_ocupacion`, value: e.target.value } } as any)}
                  />
                </div>
              </div>

              {/* Correo Electrónico */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-slate-700">
                    Correo Electrónico <span className="text-red-500"> *</span>
                  </Label>
                  <Input
                    type="email"
                    placeholder="ejemplo@correo.com"
                    className={clsx(
                      "mt-1 h-9",
                      errors[`${activeTab}_email`] && "border-red-500"
                    )}
                    value={formData[`${activeTab}_email`] as string}
                    onChange={(e) => handleInputChange({ target: { name: `${activeTab}_email`, value: e.target.value } } as any)}
                  />
                  {errors[`${activeTab}_email`] && (
                    <p className="text-xs text-red-600 mt-0.5">{errors[`${activeTab}_email`]}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {renderSelect("año_academico", "Año Académico", periodos.filter(p => p.activo === 1).map(p => ({
                  value: p.anio.toString(),
                  label: `${p.anio}`
                })))}
                {renderInput("matricula_precio", "Precio Matrícula", "number")}
                {renderInput("costo_cuota", "Costo Cuota", "number")}
              </div>

              <div className="border border-slate-200 rounded p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Cuotas Mensuales</h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="todas_cuotas"
                      className="h-4 w-4 rounded border-slate-300"
                      checked={Object.values(formData)
                        .filter((_, index) =>
                          index >= Object.keys(formData).indexOf('c1') &&
                          index <= Object.keys(formData).indexOf('c10')
                        )
                        .every((value) => Number(value) > 0)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData(prev => {
                          const newData = { ...prev } as any;
                          ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10'].forEach(
                            key => newData[key] = checked ? prev.costo_cuota : 0
                          );
                          return newData;
                        });
                      }}
                    />
                    <Label htmlFor="todas_cuotas" className="text-xs font-medium text-slate-700 cursor-pointer">
                      Seleccionar todas
                    </Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { mes: "Marzo", id: "marzo", cuota: "c1" as keyof FormData },
                    { mes: "Abril", id: "abril", cuota: "c2" as keyof FormData },
                    { mes: "Mayo", id: "mayo", cuota: "c3" as keyof FormData },
                    { mes: "Junio", id: "junio", cuota: "c4" as keyof FormData },
                    { mes: "Julio", id: "julio", cuota: "c5" as keyof FormData },
                    { mes: "Agosto", id: "agosto", cuota: "c6" as keyof FormData },
                    { mes: "Septiembre", id: "septiembre", cuota: "c7" as keyof FormData },
                    { mes: "Octubre", id: "octubre", cuota: "c8" as keyof FormData },
                    { mes: "Noviembre", id: "noviembre", cuota: "c9" as keyof FormData },
                    { mes: "Diciembre", id: "diciembre", cuota: "c10" as keyof FormData }
                  ].map(({ mes, id, cuota }) => {
                    const valorCuota = formData[cuota] as number;
                    const isActive = valorCuota > 0;
                    return (
                      <div
                        key={id}
                        className={clsx(
                          "flex flex-col items-center justify-center p-2 rounded border cursor-pointer transition-colors",
                          isActive
                            ? "bg-blue-50 border-blue-500 text-blue-900"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                        )}
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            [cuota]: isActive ? 0 : prev.costo_cuota
                          }));
                        }}
                      >
                        <span className="text-xs font-medium">{mes}</span>
                        <span className="text-xs mt-1">S/. {valorCuota > 0 ? valorCuota.toFixed(0) : "0"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-600">Total a Pagar</p>
                    <p className="text-2xl font-semibold text-slate-900 mt-1">
                      S/. {(
                        Number(formData.matricula_precio) +
                        ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10']
                          .reduce((sum, key) => sum + Number(formData[key as keyof FormData]), 0)
                      ).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-600">Cuotas seleccionadas</p>
                    <p className="text-lg font-medium text-slate-900 mt-1">
                      {Object.values(formData).filter((v, i) =>
                        i >= Object.keys(formData).indexOf('c1') &&
                        i <= Object.keys(formData).indexOf('c10') &&
                        Number(v) > 0
                      ).length} meses
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              {[
                { id: "dni_entregado", label: "Copia de DNI" },
                { id: "certificado_estudios", label: "Certificado de Estudios" },
                { id: "partida_nacimiento", label: "Partida de Nacimiento" }
              ].map((doc) => (
                <label
                  key={doc.id}
                  className="flex items-center gap-3 p-3 border border-slate-200 rounded cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    name={doc.id}
                    checked={!!formData[doc.id as keyof FormData]}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-700">{doc.label}</span>
                </label>
              ))}
            </div>
          )}

          {step === 4 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Verifica los datos ingresados:
              </p>
              <div className="bg-muted p-4 rounded text-xs space-y-2">
                <p>
                  <strong>Alumno:</strong> {formData.alumno_nombre}{" "}
                  {formData.alumno_ap_p} {formData.alumno_ap_m} (DNI:{" "}
                  {formData.alumno_dni})
                </p>
                <p>
                  <strong>Apoderado:</strong> {formData.apoderado_nombre}{" "}
                  {formData.apoderado_ap_p} {formData.apoderado_ap_m} (DNI:{" "}
                  {formData.apoderado_dni})
                </p>
                <p>
                  <strong>Grado:</strong>{" "}
                  {
                    grados.find((g) => g.id.toString() === formData.id_grado)
                      ?.nombre
                  }
                </p>
                <p>
                  <strong>Matrícula:</strong> S/ {formData.matricula_precio.toFixed(2)}
                </p>
                <p>
                  <strong>Cuotas:</strong> 10 de S/ {formData.c1.toFixed(2)} cada una
                </p>
                <p>
                  <strong>Documentos:</strong>{" "}
                  {formData.dni_entregado
                    ? "DNI entregado"
                    : "DNI no entregado"}
                  ,{" "}
                  {formData.certificado_estudios
                    ? "Certificado entregado"
                    : "Certificado no entregado"}
                  ,{" "}
                  {formData.partida_nacimiento
                    ? "Partida de nacimiento entregada"
                    : "Partida de nacimiento no entregada"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mt-6">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={step === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Atrás
        </Button>
        {step < steps.length - 1 ? (
          <Button onClick={nextStep}>
            Siguiente
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading || isPeriodoInactivo}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Registrando...
              </>
            ) : (
              "Finalizar Registro"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
