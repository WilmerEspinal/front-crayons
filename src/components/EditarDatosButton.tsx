import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { Edit } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

interface DatosAlumno {
  alumno_id: number;
  persona_id: number;
  dni: string;
  nombre: string;
  ap_p: string;
  ap_m: string;
  fecha_nacimiento: string;
  created_at: string;
  updated_at: string;
}

interface FormData {
  dni: string;
  nombre: string;
  ap_p: string;
  ap_m: string;
  fecha_nacimiento: string;
}

interface EditarDatosButtonProps {
  onDataUpdated?: (data: DatosAlumno) => void;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
  // Nuevas props para editar alumno específico
  alumnoId?: number;
  alumnoData?: {
    dni: string;
    nombre: string;
    ap_p: string;
    ap_m: string;
    fecha_nacimiento: string;
  };
  disabled?: boolean;
}

export default function EditarDatosButton({
  onDataUpdated,
  className = "",
  variant = "default",
  size = "default",
  children,
  alumnoId,
  alumnoData,
  disabled = false
}: EditarDatosButtonProps) {
  const { token } = useAuth();
  const [, setDatosAlumno] = useState<DatosAlumno | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    dni: "",
    nombre: "",
    ap_p: "",
    ap_m: "",
    fecha_nacimiento: "",
  });

  const cargarDatosAlumno = async () => {
    if (!token) {
      setMessage({ text: "No hay token de autenticación", isError: true });
      return;
    }

    setIsLoading(true);
    try {
      let response;

      // Si tenemos datos del alumno específico, los usamos directamente
      if (alumnoData) {
        setFormData({
          dni: alumnoData.dni,
          nombre: alumnoData.nombre,
          ap_p: alumnoData.ap_p,
          ap_m: alumnoData.ap_m,
          fecha_nacimiento: alumnoData.fecha_nacimiento.split('T')[0],
        });
        setMessage({ text: "Datos cargados correctamente", isError: false });
      } else {
        // Si no, hacemos la llamada a la API para obtener datos del alumno logueado
        response = await axios.get(`${API_URL}/alumno/mis-datos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setDatosAlumno(response.data.data);
          setFormData({
            dni: response.data.data.dni,
            nombre: response.data.data.nombre,
            ap_p: response.data.data.ap_p,
            ap_m: response.data.data.ap_m,
            fecha_nacimiento: response.data.data.fecha_nacimiento.split('T')[0],
          });
          setMessage({ text: "Datos cargados correctamente", isError: false });
        } else {
          setMessage({ text: "Error al cargar los datos", isError: true });
        }
      }
    } catch (error) {
      setMessage({
        text: "Error al cargar los datos del alumno",
        isError: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!token) {
      setMessage({ text: "No hay token de autenticación", isError: true });
      return;
    }

    setIsSaving(true);
    try {
      // Usar el endpoint correcto que existe en el backend
      const dataToSend = {
        dni: formData.dni, // Incluir el DNI para identificar al alumno
        nombre: formData.nombre,
        ap_p: formData.ap_p,
        ap_m: formData.ap_m,
        fecha_nacimiento: formData.fecha_nacimiento,
      };

      // Usar el endpoint correcto con el ID del alumno
      const endpoint = alumnoId
        ? `${API_URL}/alumno/estudiante/${alumnoId}`
        : `${API_URL}/alumno/mis-datos`;

      const response = await axios.put(endpoint, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        setDatosAlumno(response.data.data);
        setMessage({ text: "Datos actualizados correctamente", isError: false });

        // Llamar al callback inmediatamente para actualizar la lista
        if (onDataUpdated) {
          onDataUpdated(response.data.data);
        }

        // Cerrar modal después de un breve delay para que se vea el mensaje de éxito
        setTimeout(() => {
          setIsModalOpen(false);
        }, 1000);
      } else {
        setMessage({ text: "Error al actualizar los datos", isError: true });
      }
    } catch (error) {
      setMessage({
        text: "Error al actualizar los datos del alumno",
        isError: true
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    cargarDatosAlumno();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={handleOpenModal}
          variant={variant}
          size={size}
          disabled={disabled}
          className={className}
        >
          {children || (
            <>
              <Edit className="w-4 h-4 mr-2" />
              Editar Datos
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-[#3E328C]">Editar Datos Personales</DialogTitle>
          <DialogDescription>
            Modifica tu información personal. Los cambios se guardarán automáticamente.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3E328C] mx-auto mb-2"></div>
              <p className="text-[#3E328C] text-sm">Cargando datos...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dni" className="text-[#3E328C] font-semibold">
                    DNI
                  </Label>
                  <Input
                    id="dni"
                    name="dni"
                    value={formData.dni}
                    disabled={true}
                    className="border-[#3E328C] bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha_nacimiento" className="text-[#3E328C] font-semibold">
                    Fecha de Nacimiento
                  </Label>
                  <Input
                    id="fecha_nacimiento"
                    name="fecha_nacimiento"
                    type="date"
                    value={formData.fecha_nacimiento}
                    onChange={handleInputChange}
                    className="border-[#3E328C] focus:border-[#F26513]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-[#3E328C] font-semibold">
                  Nombres
                </Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ingrese sus nombres"
                  className="border-[#3E328C] focus:border-[#F26513]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ap_p" className="text-[#3E328C] font-semibold">
                    Apellido Paterno
                  </Label>
                  <Input
                    id="ap_p"
                    name="ap_p"
                    value={formData.ap_p}
                    onChange={handleInputChange}
                    placeholder="Ingrese su apellido paterno"
                    className="border-[#3E328C] focus:border-[#F26513]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ap_m" className="text-[#3E328C] font-semibold">
                    Apellido Materno
                  </Label>
                  <Input
                    id="ap_m"
                    name="ap_m"
                    value={formData.ap_m}
                    onChange={handleInputChange}
                    placeholder="Ingrese su apellido materno"
                    className="border-[#3E328C] focus:border-[#F26513]"
                  />
                </div>
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded-md mb-4 ${message.isError
                ? 'bg-red-100 text-red-700 border border-red-300'
                : 'bg-green-100 text-green-700 border border-green-300'
                }`}>
                {message.text}
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="border-[#3E328C] text-[#3E328C] hover:bg-[#3E328C] hover:text-white"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#F26513] hover:bg-orange-600 text-white"
              >
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </Button>
              {message && !message.isError && (
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="border-green-500 text-green-600 hover:bg-green-50"
                >
                  Cerrar
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
