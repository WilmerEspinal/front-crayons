"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Upload, FileText, CheckCircle2, XCircle, Trash2, RefreshCw, Database, Save, File } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;

// Tipo para los datos de grado desde el API
interface GradoData {
    id: number;
    numero_grado: number;
    nombre: string;
}

// Tipo para los datos extraídos de cada ficha (Nuevo Formato)
interface StudentData {
    id: string;
    fileName: string;
    status: "pending" | "processing" | "success" | "error" | "registering" | "registered";

    // Datos del Estudiante
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    dni: string;
    fecha_nacimiento: string;
    sexo: string;
    lengua_materna: string;

    // Datos del Padre
    padre: {
        nombres: string;
        apellido_paterno: string;
        apellido_materno: string;
        ocupacion: string;
        fecha_de_nacimiento: string;
    };

    // Datos de la Madre
    madre: {
        nombres: string;
        apellido_paterno: string;
        apellido_materno: string;
        ocupacion: string;
        fecha_de_nacimiento: string;
    };

    // Historial Académico
    historial_academico: Array<{
        año: string;
        grado: string;
        institucion: string;
    }>;

    // Campos de matrícula masiva
    gradoId?: number;
    grado?: number;
    seccion?: string;

    // Información Económica
    matricula_precio: number;
    costo_cuota: number;
    año_academico: string;
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

export default function BulkEnrollment() {
    const [files, setFiles] = useState<File[]>([]);
    const [studentsData, setStudentsData] = useState<StudentData[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Estados para asignación masiva de grado y sección desde API
    const [selectedGradoId, setSelectedGradoId] = useState<number | null>(null);

    // Cargar grados disponibles desde el API con React Query
    const { data: gradosDisponibles = [] } = useQuery<GradoData[]>({
        queryKey: ['grados'],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/grado/lista-grado`);
            const data = await response.json();
            if (data.status && data.data) {
                return data.data;
            }
            return [];
        },
        staleTime: 60 * 60 * 1000, // 1 hora
    });

    // Seleccionar el primer grado por defecto cuando cargan
    useEffect(() => {
        if (gradosDisponibles.length > 0 && !selectedGradoId) {
            setSelectedGradoId(gradosDisponibles[0].id);
        }
    }, [gradosDisponibles, selectedGradoId]);

    // Función para obtener los costos del año
    const obtenerCostosAnio = async (anio: string, index: number) => {
        try {
            const response = await fetch(`${API_URL}/cuotas/anio/${anio}`);
            const data = await response.json();
            if (data.success) {
                setStudentsData(prev => {
                    const newData = [...prev];
                    newData[index].matricula_precio = parseFloat(data.data.costo_matricula);
                    newData[index].costo_cuota = parseFloat(data.data.costo_cuotas);
                    // Por defecto marcar todas las cuotas
                    ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10'].forEach(
                        key => (newData[index] as any)[key] = parseFloat(data.data.costo_cuotas)
                    );
                    return newData;
                });
            }
        } catch (error) {
        }
    };

    // Manejar la selección de archivos
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);

        if (selectedFiles.length === 0) return;

        // Limitar a 1 archivo
        const file = selectedFiles[0];
        setFiles([file]);

        // Inicializar datos vacíos para el archivo
        const initialData: StudentData = {
            id: `student-0`,
            fileName: file.name,
            status: "pending",
            nombres: "",
            apellido_paterno: "",
            apellido_materno: "",
            dni: "",
            fecha_nacimiento: "",
            sexo: "",
            lengua_materna: "",
            padre: {
                nombres: "",
                apellido_paterno: "",
                apellido_materno: "",
                ocupacion: "",
                fecha_de_nacimiento: "",
            },
            madre: {
                nombres: "",
                apellido_paterno: "",
                apellido_materno: "",
                ocupacion: "",
                fecha_de_nacimiento: "",
            },
            historial_academico: [],
            matricula_precio: 0,
            costo_cuota: 0,
            año_academico: new Date().getFullYear().toString(),
            c1: 0, c2: 0, c3: 0, c4: 0, c5: 0, c6: 0, c7: 0, c8: 0, c9: 0, c10: 0
        };

        setStudentsData([initialData]);
        obtenerCostosAnio(initialData.año_academico, 0);
        setProgress(0);
        setErrorMessage(null);
        setSuccessMessage(null);
    };

    // Procesar archivos con la API real
    const processFiles = async () => {
        if (files.length === 0) return;

        setIsProcessing(true);
        setProgress(0);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            // Marcar como procesando
            setStudentsData(prev =>
                prev.map(student => ({ ...student, status: "processing" as const }))
            );

            const file = files[0];
            const formData = new FormData();
            formData.append('pdf', file);

            // Llamar a la API para este archivo
            const response = await fetch(`${API_URL}/ocr/extraer-ficha`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.datos) {
                const extraido = data.datos;

                setStudentsData(prev =>
                    prev.map((student, index) => {
                        if (index === 0) {
                            return {
                                ...student,
                                ...extraido.estudiante,
                                padre: extraido.padre,
                                madre: extraido.madre,
                                historial_academico: extraido.historial_academico,
                                status: "success" as const,
                            };
                        }
                        return student;
                    })
                );
                setProgress(100);
                setSuccessMessage("Ficha procesada exitosamente");
            } else {
                throw new Error(data.error || "No se pudieron extraer los datos");
            }

        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? `Error: ${error.message}`
                    : 'Error desconocido al procesar el archivo.'
            );
            setStudentsData(prev =>
                prev.map(student => ({ ...student, status: "error" as const }))
            );
        } finally {
            setIsProcessing(false);
        }
    };



    // Reprocesar un archivo específico
    const reprocessFile = async (index: number) => {
        const fileToReprocess = files[index];
        if (!fileToReprocess) return;

        // Marcar el archivo como procesando
        setStudentsData(prev =>
            prev.map((student, i) =>
                i === index ? { ...student, status: "processing" as const } : student
            )
        );

        try {
            // Crear FormData con el archivo específico
            const formData = new FormData();
            formData.append('pdf', fileToReprocess);

            // Llamar a la API
            const response = await fetch(`${API_URL}/ocr/extraer-ficha`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }

            const data = await response.json();

            // Actualizar solo el archivo reprocesado
            if (data.success && data.datos) {
                const extraido = data.datos;
                setStudentsData(prev =>
                    prev.map((student, i) => {
                        if (i === index) {
                            return {
                                ...student,
                                ...extraido.estudiante,
                                padre: extraido.padre,
                                madre: extraido.madre,
                                historial_academico: extraido.historial_academico,
                                status: "success" as const,
                            };
                        }
                        return student;
                    })
                );

                setSuccessMessage(`Archivo "${fileToReprocess.name}" reprocesado exitosamente`);
            } else {
                throw new Error(data.error || 'Respuesta inválida del servidor');
            }
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? `Error al reprocesar: ${error.message}`
                    : 'Error desconocido al reprocesar el archivo'
            );
            // Marcar como error
            setStudentsData(prev =>
                prev.map((student, i) =>
                    i === index ? { ...student, status: "error" as const } : student
                )
            );
        }
    };

    // Ver el PDF original en una nueva ventana
    const handleViewPdf = (index: number) => {
        const file = files[index];
        if (file) {
            const url = URL.createObjectURL(file);
            window.open(url, '_blank');
        }
    };

    // Eliminar un archivo
    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setStudentsData(prev => prev.filter((_, i) => i !== index));
    };

    // Limpiar todo
    const clearAll = () => {
        setFiles([]);
        setStudentsData([]);
        setProgress(0);
        setIsProcessing(false);
    };

    // Registrar un estudiante en la base de datos
    const handleInsertData = async (student: StudentData, index: number) => {
        // Actualizar estado a registrando
        setStudentsData(prev => prev.map((s, i) => i === index ? { ...s, status: "registering" as const } : s));
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            const response = await fetch(`${API_URL}/matricula/matricula/insertar-extraidos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ datos: student }),
            });

            if (!response.ok) {
                throw new Error('Error al registrar en la base de datos');
            }

            // Actualizar estado a registrado
            setStudentsData(prev => prev.map((s, i) => i === index ? { ...s, status: "registered" as const } : s));
            setSuccessMessage(`Estudiante ${student.nombres} registrado correctamente`);

        } catch (error) {
            setErrorMessage(`Error al registrar a ${student.nombres}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            // Revertir estado a success para permitir reintento
            setStudentsData(prev => prev.map((s, i) => i === index ? { ...s, status: "success" as const } : s));
        }
    };


    const getStatusBadge = (status: StudentData["status"]) => {
        const baseClass = "px-2.5 py-0.5 rounded-md text-xs font-semibold flex items-center gap-1.5 w-fit border";
        switch (status) {
            case "pending":
                return <Badge variant="outline" className={`${baseClass} bg-slate-50 text-slate-600 border-slate-200`}>
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-400"></div>
                    Pendiente
                </Badge>;
            case "processing":
                return <Badge variant="outline" className={`${baseClass} bg-blue-50 text-blue-700 border-blue-200`}>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Procesando
                </Badge>;
            case "success":
                return <Badge variant="outline" className={`${baseClass} bg-green-50 text-green-700 border-green-200`}>
                    <CheckCircle2 className="h-3 w-3" />
                    Exitoso
                </Badge>;
            case "error":
                return <Badge variant="outline" className={`${baseClass} bg-red-50 text-red-700 border-red-200`}>
                    <XCircle className="h-3 w-3" />
                    Error
                </Badge>;
            case "registering":
                return <Badge variant="outline" className={`${baseClass} bg-indigo-50 text-indigo-700 border-indigo-200`}>
                    <Database className="h-3 w-3 animate-pulse" />
                    Registrando
                </Badge>;
            case "registered":
                return <Badge variant="outline" className={`${baseClass} bg-purple-50 text-purple-700 border-purple-200`}>
                    <CheckCircle2 className="h-3 w-3" />
                    Registrado
                </Badge>;
        }
    };

    const successCount = studentsData.filter(s => s.status === "success").length;
    const errorCount = studentsData.filter(s => s.status === "error").length;

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-6">
            <div className="max-w-5xl mx-auto space-y-4">
                {/* Header Section */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-md">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold text-slate-900">
                                Matrícula con Ficha Única (FUM)
                            </h1>
                            <p className="text-sm text-slate-500">
                                Procesa fichas de matrícula PDF para registro automático.
                            </p>
                        </div>
                        {studentsData.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearAll}
                                disabled={isProcessing}
                                className="text-slate-500 hover:text-red-600 hover:border-red-200"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Limpiar Todo
                            </Button>
                        )}
                    </div>
                </div>

                {/* Messages */}
                <div className="space-y-4">
                    {/* Messages */}
                    <div className="space-y-2">
                        {successMessage && (
                            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <p>{successMessage}</p>
                            </div>
                        )}
                        {errorMessage && (
                            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium">
                                <XCircle className="h-4 w-4 text-red-600" />
                                <p>{errorMessage}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Upload Area */}
                <Card className="border border-slate-200 shadow-md rounded-xl overflow-hidden">
                    <CardContent className="p-6">
                        <div className="relative border-2 border-dashed border-slate-200 rounded-lg p-8 text-center bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-all">
                            <input
                                type="file"
                                id="file-upload"
                                multiple
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="hidden"
                                disabled={isProcessing}
                            />
                            <label
                                htmlFor="file-upload"
                                className="cursor-pointer flex flex-col items-center gap-4"
                            >
                                <div className="p-4 bg-white rounded-full shadow-sm border border-slate-100">
                                    <Upload className="h-8 w-8 text-slate-400" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-base font-semibold text-slate-800">
                                        Selecciona un archivo PDF
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Solo se permite un archivo a la vez
                                    </p>
                                </div>
                                <Button type="button" size="sm" variant="secondary" disabled={isProcessing} className="font-semibold">
                                    Explorar Archivos
                                </Button>
                            </label>
                        </div>

                        {files.length > 0 && (
                            <div className="mt-6">
                                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-50 rounded-md border border-slate-100">
                                            <FileText className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 truncate max-w-[200px]">
                                                {files[0].name}
                                            </p>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                                                {(files[0].size / 1024 / 1024).toFixed(2)} MB • PDF
                                            </p>
                                        </div>
                                    </div>
                                    {!isProcessing && studentsData.every(s => s.status === "pending") && (
                                        <Button
                                            onClick={processFiles}
                                            size="sm"
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                                        >
                                            <RefreshCw className="mr-2 h-4 w-4" />
                                            Procesar con IA
                                        </Button>
                                    )}
                                </div>

                                {isProcessing && (
                                    <div className="mt-6 space-y-3">
                                        <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                                            <span className="flex items-center gap-2">
                                                <RefreshCw className="h-3 w-3 animate-spin" />
                                                Analizando documento...
                                            </span>
                                            <span>{Math.round(progress)}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-600 transition-all duration-300"
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                {/* Statistics */}
                                {studentsData.length > 0 && studentsData[0].status !== "pending" && (
                                    <div className="grid grid-cols-3 gap-3 mt-6">
                                        <div className="bg-white border border-slate-200 p-3 rounded-lg flex flex-col items-center justify-center shadow-sm">
                                            <p className="text-lg font-bold text-slate-900">{studentsData.length}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</p>
                                        </div>
                                        <div className="bg-white border border-slate-200 p-3 rounded-lg flex flex-col items-center justify-center shadow-sm">
                                            <p className="text-lg font-bold text-green-600">{successCount}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Éxito</p>
                                        </div>
                                        <div className="bg-white border border-slate-200 p-3 rounded-lg flex flex-col items-center justify-center shadow-sm">
                                            <p className="text-lg font-bold text-red-600">{errorCount}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Error</p>
                                        </div>
                                    </div>
                                )}

                                {/* Data Review and Edit Section */}
                                {studentsData.length > 0 && studentsData[0].status === "success" && (
                                    <div className="space-y-6 mt-6">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-md">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-green-100 rounded-lg p-2">
                                                    <CheckCircle2 className="text-green-600 h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h2 className="text-lg font-bold text-slate-900">Datos Extraídos</h2>
                                                    <p className="text-slate-500 text-xs">Revisa la información antes de registrar</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewPdf(0)}
                                                    className="text-slate-600"
                                                >
                                                    <File className="mr-2 h-4 w-4" />
                                                    Ver PDF
                                                </Button>
                                                <Button
                                                    onClick={() => handleInsertData(studentsData[0], 0)}
                                                    size="sm"
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                                                >
                                                    <Database className="mr-2 h-4 w-4" />
                                                    Registrar
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {/* Datos del Estudiante */}
                                            <Card className="border border-slate-200 shadow-md rounded-xl overflow-hidden">
                                                <CardHeader className="bg-slate-50 border-b border-slate-200 py-3 px-4">
                                                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800">
                                                        <FileText className="h-4 w-4 text-indigo-600" />
                                                        Datos del Estudiante
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                                                    <div className="space-y-2">
                                                        <Label>DNI</Label>
                                                        <Input
                                                            value={studentsData[0].dni}
                                                            onChange={(e) => {
                                                                const newData = [...studentsData];
                                                                newData[0].dni = e.target.value;
                                                                setStudentsData(newData);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Nombres</Label>
                                                        <Input
                                                            value={studentsData[0].nombres}
                                                            onChange={(e) => {
                                                                const newData = [...studentsData];
                                                                newData[0].nombres = e.target.value;
                                                                setStudentsData(newData);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Apellido Paterno</Label>
                                                        <Input
                                                            value={studentsData[0].apellido_paterno}
                                                            onChange={(e) => {
                                                                const newData = [...studentsData];
                                                                newData[0].apellido_paterno = e.target.value;
                                                                setStudentsData(newData);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Apellido Materno</Label>
                                                        <Input
                                                            value={studentsData[0].apellido_materno}
                                                            onChange={(e) => {
                                                                const newData = [...studentsData];
                                                                newData[0].apellido_materno = e.target.value;
                                                                setStudentsData(newData);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Fecha de Nacimiento</Label>
                                                        <Input
                                                            value={studentsData[0].fecha_nacimiento}
                                                            onChange={(e) => {
                                                                const newData = [...studentsData];
                                                                newData[0].fecha_nacimiento = e.target.value;
                                                                setStudentsData(newData);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Sexo</Label>
                                                        <Select
                                                            value={studentsData[0].sexo}
                                                            onValueChange={(value) => {
                                                                const newData = [...studentsData];
                                                                newData[0].sexo = value;
                                                                setStudentsData(newData);
                                                            }}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Sexo" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="M">Masculino</SelectItem>
                                                                <SelectItem value="F">Femenino</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2 col-span-full">
                                                        <Label>Lengua Materna</Label>
                                                        <Input
                                                            value={studentsData[0].lengua_materna}
                                                            onChange={(e) => {
                                                                const newData = [...studentsData];
                                                                newData[0].lengua_materna = e.target.value;
                                                                setStudentsData(newData);
                                                            }}
                                                        />
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Asignación de Matrícula */}
                                            <Card className="border border-slate-200 shadow-md rounded-xl overflow-hidden">
                                                <CardHeader className="bg-slate-50 border-b border-slate-200 py-3 px-4">
                                                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800">
                                                        <Database className="h-4 w-4 text-blue-600" />
                                                        Asignación de Matrícula
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4 p-4">
                                                    <div className="space-y-2">
                                                        <Label>Grado y Sección Destino</Label>
                                                        <Select
                                                            onValueChange={(value) => {
                                                                const numValue = value ? Number(value) : null;
                                                                setSelectedGradoId(numValue);
                                                                const grado = gradosDisponibles.find(g => g.id.toString() === value);
                                                                if (grado) {
                                                                    const newData = [...studentsData];
                                                                    newData[0].gradoId = grado.id;
                                                                    newData[0].grado = grado.numero_grado;
                                                                    // newData[0].seccion = grado.seccion; // Seccion ya no existe en la respuesta
                                                                    setStudentsData(newData);
                                                                }
                                                            }}
                                                            value={selectedGradoId?.toString() || ""}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Seleccionar grado y sección" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {gradosDisponibles.map((grado) => (
                                                                    <SelectItem key={grado.id} value={grado.id.toString()}>
                                                                        {grado.nombre}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-800">
                                                        <p className="font-medium mb-0.5">Nota:</p>
                                                        Seleccione el grado y sección donde desea matricular al estudiante extraído.
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Datos del Padre */}
                                            <Card className="border border-slate-200 shadow-md rounded-xl overflow-hidden">
                                                <CardHeader className="bg-slate-50 border-b border-slate-200 py-3 px-4">
                                                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800">
                                                        <FileText className="h-4 w-4 text-slate-600" />
                                                        Datos del Padre
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                                                    <div className="space-y-2">
                                                        <Label>Nombres</Label>
                                                        <Input
                                                            value={studentsData[0].padre.nombres}
                                                            onChange={(e) => {
                                                                const newData = [...studentsData];
                                                                newData[0].padre.nombres = e.target.value;
                                                                setStudentsData(newData);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Apellido Paterno</Label>
                                                        <Input
                                                            value={studentsData[0].padre.apellido_paterno}
                                                            onChange={(e) => {
                                                                const newData = [...studentsData];
                                                                newData[0].padre.apellido_paterno = e.target.value;
                                                                setStudentsData(newData);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Apellido Materno</Label>
                                                        <Input
                                                            value={studentsData[0].padre.apellido_materno}
                                                            onChange={(e) => {
                                                                const newData = [...studentsData];
                                                                newData[0].padre.apellido_materno = e.target.value;
                                                                setStudentsData(newData);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Ocupación</Label>
                                                        <Input
                                                            value={studentsData[0].padre.ocupacion}
                                                            onChange={(e) => {
                                                                const newData = [...studentsData];
                                                                newData[0].padre.ocupacion = e.target.value;
                                                                setStudentsData(newData);
                                                            }}
                                                        />
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Datos de la Madre */}
                                            <Card className="border border-slate-200 shadow-md rounded-xl overflow-hidden">
                                                <CardHeader className="bg-slate-50 border-b border-slate-200 py-3 px-4">
                                                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800">
                                                        <FileText className="h-4 w-4 text-slate-600" />
                                                        Datos de la Madre
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                                                    <div className="space-y-2">
                                                        <Label>Nombres</Label>
                                                        <Input
                                                            value={studentsData[0].madre.nombres}
                                                            onChange={(e) => {
                                                                const newData = [...studentsData];
                                                                newData[0].madre.nombres = e.target.value;
                                                                setStudentsData(newData);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Apellido Paterno</Label>
                                                        <Input
                                                            value={studentsData[0].madre.apellido_paterno}
                                                            onChange={(e) => {
                                                                const newData = [...studentsData];
                                                                newData[0].madre.apellido_paterno = e.target.value;
                                                                setStudentsData(newData);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Apellido Materno</Label>
                                                        <Input
                                                            value={studentsData[0].madre.apellido_materno}
                                                            onChange={(e) => {
                                                                const newData = [...studentsData];
                                                                newData[0].madre.apellido_materno = e.target.value;
                                                                setStudentsData(newData);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Ocupación</Label>
                                                        <Input
                                                            value={studentsData[0].madre.ocupacion}
                                                            onChange={(e) => {
                                                                const newData = [...studentsData];
                                                                newData[0].madre.ocupacion = e.target.value;
                                                                setStudentsData(newData);
                                                            }}
                                                        />
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Información Económica */}
                                            <Card className="border border-slate-200 shadow-md rounded-xl overflow-hidden">
                                                <CardHeader className="bg-slate-50 border-b border-slate-200 py-3 px-4">
                                                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800">
                                                        <Database className="h-4 w-4 text-emerald-600" />
                                                        Información Económica
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4 p-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label>Año Académico</Label>
                                                            <Select
                                                                value={studentsData[0].año_academico}
                                                                onValueChange={(value) => {
                                                                    const newData = [...studentsData];
                                                                    newData[0].año_academico = value;
                                                                    setStudentsData(newData);
                                                                    obtenerCostosAnio(value, 0);
                                                                }}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Año" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value={new Date().getFullYear().toString()}>{new Date().getFullYear().toString()}</SelectItem>
                                                                    <SelectItem value={(new Date().getFullYear() + 1).toString()}>{(new Date().getFullYear() + 1).toString()}</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Precio Matrícula</Label>
                                                            <Input
                                                                type="number"
                                                                value={studentsData[0].matricula_precio}
                                                                onChange={(e) => {
                                                                    const newData = [...studentsData];
                                                                    newData[0].matricula_precio = parseFloat(e.target.value) || 0;
                                                                    setStudentsData(newData);
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Costo Cuota Mensual</Label>
                                                            <Input
                                                                type="number"
                                                                value={studentsData[0].costo_cuota}
                                                                onChange={(e) => {
                                                                    const newData = [...studentsData];
                                                                    const newCosto = parseFloat(e.target.value) || 0;
                                                                    newData[0].costo_cuota = newCosto;
                                                                    // Actualizar cuotas marcadas
                                                                    ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10'].forEach(key => {
                                                                        if ((newData[0] as any)[key] > 0) {
                                                                            (newData[0] as any)[key] = newCosto;
                                                                        }
                                                                    });
                                                                    setStudentsData(newData);
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="border rounded-lg p-3 bg-slate-50/50">
                                                        <h4 className="text-xs font-bold mb-3 text-slate-700 uppercase tracking-wider">Cuotas Mensuales</h4>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            {[
                                                                { mes: "Marzo", id: "c1" },
                                                                { mes: "Abril", id: "c2" },
                                                                { mes: "Mayo", id: "c3" },
                                                                { mes: "Junio", id: "c4" },
                                                                { mes: "Julio", id: "c5" },
                                                                { mes: "Agosto", id: "c6" },
                                                                { mes: "Septiembre", id: "c7" },
                                                                { mes: "Octubre", id: "c8" },
                                                                { mes: "Noviembre", id: "c9" },
                                                                { mes: "Diciembre", id: "c10" }
                                                            ].map(({ mes, id }) => (
                                                                <div key={id} className="flex items-center space-x-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`cuota-${id}`}
                                                                        checked={(studentsData[0] as any)[id] > 0}
                                                                        onChange={(e) => {
                                                                            const newData = [...studentsData];
                                                                            (newData[0] as any)[id] = e.target.checked ? newData[0].costo_cuota : 0;
                                                                            setStudentsData(newData);
                                                                        }}
                                                                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                                    />
                                                                    <Label htmlFor={`cuota-${id}`} className="text-xs cursor-pointer">
                                                                        {mes}
                                                                    </Label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                                        <div className="flex justify-between items-center text-xs">
                                                            <span className="text-slate-600 font-medium">Total a Pagar:</span>
                                                            <span className="text-indigo-700 font-bold text-sm">
                                                                S/. {(
                                                                    studentsData[0].matricula_precio +
                                                                    ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10']
                                                                        .reduce((sum, key) => sum + (studentsData[0] as any)[key], 0)
                                                                ).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Historial Académico */}
                                            <Card className="lg:col-span-2 border border-slate-200 shadow-md rounded-xl overflow-hidden">
                                                <CardHeader className="bg-slate-50 border-b border-slate-200 py-3 px-4">
                                                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800">
                                                        <FileText className="h-4 w-4 text-slate-600" />
                                                        Historial Académico
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-4">
                                                    <div className="border rounded-md overflow-hidden">
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead>Año</TableHead>
                                                                    <TableHead>Grado</TableHead>
                                                                    <TableHead>Institución</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {studentsData[0].historial_academico.map((item, hIndex) => (
                                                                    <TableRow key={hIndex}>
                                                                        <TableCell>
                                                                            <Input
                                                                                value={item.año}
                                                                                onChange={(e) => {
                                                                                    const newData = [...studentsData];
                                                                                    newData[0].historial_academico[hIndex].año = e.target.value;
                                                                                    setStudentsData(newData);
                                                                                }}
                                                                                className="h-8"
                                                                            />
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Input
                                                                                value={item.grado}
                                                                                onChange={(e) => {
                                                                                    const newData = [...studentsData];
                                                                                    newData[0].historial_academico[hIndex].grado = e.target.value;
                                                                                    setStudentsData(newData);
                                                                                }}
                                                                                className="h-8"
                                                                            />
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Input
                                                                                value={item.institucion}
                                                                                onChange={(e) => {
                                                                                    const newData = [...studentsData];
                                                                                    newData[0].historial_academico[hIndex].institucion = e.target.value;
                                                                                    setStudentsData(newData);
                                                                                }}
                                                                                className="h-8"
                                                                            />
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        <div className="flex justify-center pt-8 pb-12">
                                            <Button
                                                size="lg"
                                                onClick={() => handleInsertData(studentsData[0], 0)}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-6 text-lg font-bold rounded-xl shadow-md transition-all flex items-center gap-3"
                                                disabled={isProcessing}
                                            >
                                                <Save className="h-5 w-5" />
                                                Confirmar y Registrar Matrícula
                                            </Button>
                                        </div>
                                    </div>

                                )}

                                {/* Files Table - Solo mostrar si está pendiente o procesando */}
                                {studentsData.length > 0 && studentsData[0].status !== "success" && (
                                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mt-6">
                                        <Table>
                                            <TableHeader className="bg-slate-50">
                                                <TableRow className="hover:bg-transparent border-slate-200">
                                                    <TableHead className="font-bold text-slate-700 py-3 text-xs uppercase tracking-wider">Archivo</TableHead>
                                                    <TableHead className="font-bold text-slate-700 py-3 text-xs uppercase tracking-wider">Estado</TableHead>
                                                    <TableHead className="text-right font-bold text-slate-700 py-3 text-xs uppercase tracking-wider">Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {studentsData.map((student, index) => (
                                                    <TableRow key={student.id} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                                                        <TableCell className="py-3">
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="h-4 w-4 text-slate-400" />
                                                                <span className="font-medium text-slate-700 truncate max-w-[250px]" title={student.fileName}>
                                                                    {student.fileName}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-4">
                                                            {getStatusBadge(student.status)}
                                                        </TableCell>
                                                        <TableCell className="text-right py-4">
                                                            <div className="flex items-center justify-end gap-2">
                                                                {student.status === "error" && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => reprocessFile(index)}
                                                                        disabled={isProcessing}
                                                                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg"
                                                                    >
                                                                        <RefreshCw className="h-4 w-4 mr-2" />
                                                                        Reintentar
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => removeFile(index)}
                                                                    disabled={isProcessing}
                                                                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>


                {/* PDF Viewer Dialog */}
            </div>
        </div>
    );
}
