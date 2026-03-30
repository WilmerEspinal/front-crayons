import { useState, useEffect } from "react";
import axios from "axios";
import { Download, Loader2, ChevronDown, ChevronUp, UserX, UserCheck } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AlertCircle, AlertTriangle, CheckCircle2, X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

interface Curso {
  id_asignacion?: number;
  curso: string;
  grado: string;
}

interface Docente {
  docente_id: number;
  dni: string;
  nombre_completo: string;
  fecha_registro: string;
  cursos: Curso[];
  activo?: number;
  periodo_activo?: number;
}

interface ApiResponse {
  success: boolean;
  data: Docente[];
  anio: string;
}

const EMPTY_ARRAY: any[] = [];

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  { bg: "#dbeafe", color: "#1d4ed8" },
  { bg: "#dcfce7", color: "#15803d" },
  { bg: "#fef9c3", color: "#a16207" },
  { bg: "#fce7f3", color: "#9d174d" },
  { bg: "#ede9fe", color: "#6d28d9" },
  { bg: "#ffedd5", color: "#c2410c" },
];

export default function ListTeacher() {
  const [anioSeleccionado, setAnioSeleccionado] = useState<string>("");
  const [appliedAnio, setAppliedAnio] = useState<string>("");
  const [expandedDocente, setExpandedDocente] = useState<number | null>(null);

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

  const { data: periodosData = EMPTY_ARRAY, isLoading: isLoadingAnios } = useQuery<any[]>({
    queryKey: ["periodosA_anios"],
    queryFn: async () => {
      const periodsRes = await axios.get(`${API_URL}/cuotas/periodos`);
      const data = periodsRes.data;
      if (data && data.success) {
        return data.data; // Array of { id, anio, activo, ... }
      }
      return [];
    },
    staleTime: 60 * 60 * 1000,
  });

  const anios = Array.from(new Set(periodosData.map((p: any) => p.anio?.toString()))).sort((a: any, b: any) => Number(b) - Number(a)) as string[];
  const currentPeriodoActivo = periodosData.find(p => p.anio.toString() === appliedAnio)?.activo;

  useEffect(() => {
    if (anios.length > 0 && !anioSeleccionado) {
      setAnioSeleccionado(anios[0]);
    }
  }, [anios, anioSeleccionado]);

  const { data: docentes = EMPTY_ARRAY, isLoading } = useQuery<Docente[]>({
    queryKey: ["docentesList", appliedAnio],
    queryFn: async () => {
      if (!appliedAnio) return [];
      const { data } = await axios.get<ApiResponse>(
        `${API_URL}/docente/lista-docentes/${appliedAnio}`
      );
      return data.success ? data.data : [];
    },
    enabled: !!appliedAnio,
  });

  const queryClient = useQueryClient();

  const handleSearch = () => {
    setAppliedAnio(anioSeleccionado);
  };

  const handleExportar = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/docente/exportar/${anioSeleccionado}`,
        { responseType: "blob", params: { orden: "desc" } }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `docentes_${anioSeleccionado}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      showAlert("Error", "No se pudieron exportar los datos en este momento.", "danger");
    }
  };

  const handleToggleEstado = async (id_docente: number, currentEstado: number) => {
    if (currentPeriodoActivo === 0) {
      showAlert("Acción restringida", "No se pueden realizar cambios en un periodo académico inactivo.", "warning");
      return;
    }

    const token = localStorage.getItem("token");
    const nuevoEstado = currentEstado === 1 ? 0 : 1;
    const confirmMsg = nuevoEstado === 1
      ? "¿Estás seguro de que deseas HABALITAR el acceso a este docente?"
      : "¿Estás seguro de que deseas RETIRAR a este docente y quitar su acceso?";

    showConfirm(
      nuevoEstado === 1 ? "Habilitar Docente" : "Retirar Docente",
      confirmMsg,
      async () => {
        try {
          const { data } = await axios.patch(
            `${API_URL}/docente/toggle-estado/${id_docente}`,
            { activo: nuevoEstado },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (data.success) {
            queryClient.invalidateQueries({ queryKey: ["docentesList"] });
            showAlert("Éxito", `El docente ha sido ${nuevoEstado === 1 ? "habilitado" : "retirado"} correctamente.`, "success");
          } else {
            showAlert("Error", data.message || "No se pudo cambiar el estado del docente.", "danger");
          }
        } catch (error: any) {
          showAlert("Error de Conexión", error.response?.data?.message || "No se pudo conectar con el servidor.", "danger");
        }
      },
      nuevoEstado === 1 ? "success" : "danger"
    );
  };

  if (isLoadingAnios || (!anioSeleccionado && anios.length > 0)) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
        <Loader2 style={{ width: 28, height: 28, color: "#2563eb" }} className="animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", maxWidth: 960, margin: "0 auto", padding: "28px 24px", color: "#1a1d23" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Banner de Periodo Inactivo */}
      {appliedAnio && currentPeriodoActivo === 0 && (
        <div style={{
          background: "#fff7ed", border: "1px solid #ffedd5", borderRadius: 8,
          padding: "10px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10,
          color: "#9a3412", fontSize: 13, fontWeight: 500
        }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          Este periodo académico está <strong>Inactivo</strong>. Las acciones de retiro y edición están deshabilitadas.
        </div>
      )}

      {/* Encabezado */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
            Personal docente
          </p>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>Lista de Docentes</h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={handleExportar}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: 7,
              padding: "7px 14px", fontSize: 13, fontWeight: 600, color: "#111827",
              cursor: "pointer",
            }}
          >
            <Download style={{ width: 14, height: 14 }} />
            Exportar Excel
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>Año:</span>
            <select
              value={anioSeleccionado}
              onChange={(e) => setAnioSeleccionado(e.target.value)}
              style={{
                border: "1px solid #e2e4e9", borderRadius: 6, padding: "6px 10px",
                fontSize: 13, fontWeight: 600, color: "#374151", background: "#f9fafb", outline: "none",
              }}
            >
              {anios.map((anio) => {
                const periodo = periodosData.find(p => p.anio.toString() === anio);
                return (
                  <option key={anio} value={anio} style={{ color: periodo?.activo === 0 ? "#9ca3af" : "inherit" }}>
                    {anio} {periodo?.activo === 0 ? "(Inactivo)" : ""}
                  </option>
                );
              })}
            </select>

            <button
              onClick={handleSearch}
              disabled={isLoading}
              style={{
                background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 7,
                padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6, opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : null}
              Buscar
            </button>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div style={{ background: "#fff", border: "1px solid #e2e4e9", borderRadius: 8, overflow: "hidden" }}>

        {/* Cabecera de columnas */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "110px 1fr 110px",
          padding: "12px 24px",
          background: "#f8f9fb",
          borderBottom: "1px solid #e2e4e9",
        }}>
          {["DNI", "Docente", "Acciones"].map((h, i) => (
            <span
              key={i}
              style={{
                fontSize: 11, fontWeight: 700, color: "#4b5563",
                textTransform: "uppercase", letterSpacing: "0.06em",
                textAlign: i === 2 ? "right" : "left",
              }}
            >{h}</span>
          ))}
        </div>

        {/* Filas */}
        {isLoading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#374151", fontSize: 13 }}>
            <Loader2 style={{ width: 20, height: 20, display: "inline-block", marginRight: 8 }} className="animate-spin" />
            Cargando datos...
          </div>
        ) : docentes.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#374151", fontSize: 13 }}>
            {appliedAnio ? "No hay docentes registrados para este período." : "Selecciona un año y haz clic en Buscar."}
          </div>
        ) : (
          docentes.map((docente, idx) => {
            const initials = getInitials(docente.nombre_completo);
            const avatarStyle = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            const fecha = new Date(docente.fecha_registro).toLocaleDateString("es-PE", {
              day: "2-digit", month: "short", year: "numeric",
            });

            const isExpanded = expandedDocente === docente.docente_id;

            return (
              <div key={docente.docente_id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "110px 1fr 110px",
                    alignItems: "center",
                    padding: "14px 24px",
                    transition: "background 0.1s",
                    cursor: "pointer",
                  }}
                  onClick={() => setExpandedDocente(isExpanded ? null : docente.docente_id)}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {/* DNI */}
                  <span style={{ fontSize: 13, color: "#374151", fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>
                    {docente.dni}
                  </span>

                  {/* Nombre + Avatar */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: avatarStyle.bg, color: avatarStyle.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700, flexShrink: 0,
                    }}>
                      {initials}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                        {docente.nombre_completo}
                      </div>
                      <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2, fontWeight: 500 }}>
                        Ingresó el {fecha}
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", alignItems: "center" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleEstado(docente.docente_id, docente.activo ?? 1);
                      }}
                      disabled={currentPeriodoActivo === 0}
                      style={{
                        padding: "4px 12px",
                        fontSize: 11,
                        fontWeight: 700,
                        borderRadius: 6,
                        border: "none",
                        cursor: currentPeriodoActivo === 0 ? "not-allowed" : "pointer",
                        textTransform: "uppercase",
                        letterSpacing: "0.02em",
                        backgroundColor: docente.activo === 0 ? "#f0fdf4" : "#fef2f2",
                        color: docente.activo === 0 ? "#15803d" : "#b91c1c",
                        opacity: currentPeriodoActivo === 0 ? 0.6 : 1,
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        gap: 4
                      }}
                    >
                      {docente.activo === 0 ? (
                        <>
                          <UserCheck size={14} />
                          Habilitar
                        </>
                      ) : (
                        <>
                          <UserX size={14} />
                          Retirar
                        </>
                      )}
                    </button>

                    {isExpanded ? <ChevronUp size={20} color="#9ca3af" /> : <ChevronDown size={20} color="#9ca3af" />}
                  </div>
                </div>

                {/* Cursos Colapsables */}
                {isExpanded && (
                  <div style={{ padding: "0 24px 16px 146px", animation: "fadeIn 0.2s ease-out" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.04em" }}>
                      Cursos Asignados:
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {docente.cursos.length === 0 ? (
                        <span style={{ fontSize: 13, color: "#9ca3af", fontStyle: "italic" }}>Sin cursos asignados para el periodo {appliedAnio}</span>
                      ) : (
                        docente.cursos.map((curso: Curso, ci: number) => (
                          <div
                            key={curso.id_asignacion || `${curso.curso}-${ci}`}
                            style={{
                              background: "#eff6ff", color: "#1e40af",
                              borderRadius: 6, padding: "6px 12px",
                              fontSize: 12, fontWeight: 500, border: "1px solid #bfdbfe",
                              display: "flex", alignItems: "center", gap: 6
                            }}
                          >
                            <span style={{ fontWeight: 700 }}>{curso.curso}</span>
                            <span style={{ color: "#60a5fa" }}>•</span>
                            <span style={{ color: "#3b82f6" }}>{curso.grado}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Pie */}
        {docentes.length > 0 && (
          <div style={{
            padding: "8px 16px", borderTop: "1px solid #f3f4f6", background: "#f8f9fb",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontSize: 11, color: "#4b5563", fontWeight: 500 }}>
              {docentes.length} docente{docentes.length !== 1 ? "s" : ""} · Período {appliedAnio}
            </span>
          </div>
        )}
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
