import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

// Controles compactos de la intranet (mismo estilo que NuevaOrdenModal de lessa)

export const claseInput =
  "h-[28px] w-full px-2 text-xs border border-slate-300 rounded-[4px] bg-white text-slate-800 outline-none focus:border-blue-500 disabled:opacity-60 disabled:bg-slate-50";

/** Marca un input/select con borde rojo cuando tiene error */
export const conError = (clase: string, error: boolean) =>
  error ? clase.replace("border-slate-300", "border-red-500") : clase;

// Tablas
export const claseTabla = "w-full border-collapse text-xs";
export const claseTheadFila = "bg-slate-100 text-left text-[11px] text-slate-600";
export const claseTh = "px-2 py-1 font-semibold";
export const claseTd = "px-2 py-1";
export const claseFila = "border-t border-slate-100 hover:bg-slate-50";

// Insignias de estado (5px de radio)
export const claseInsignia = "inline-block rounded-[5px] px-1.5 py-0.5 text-[10.5px] font-bold";

export function Etiqueta({ children, obligatorio = false }: { children: ReactNode; obligatorio?: boolean }) {
  return (
    <label className="whitespace-nowrap text-xs font-medium text-slate-700">
      {children}
      {obligatorio && <span className="text-red-500"> *</span>}
    </label>
  );
}

export function SelectCompacto({
  value,
  onChange,
  disabled,
  error = false,
  children,
}: {
  value: string;
  onChange: (valor: string) => void;
  disabled?: boolean;
  error?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`${conError(claseInput, error)} appearance-none pr-6 cursor-pointer`}
      >
        {children}
      </select>
      <ChevronDown size={12} className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

export function Seccion({
  titulo,
  extra,
  className = "",
  children,
}: {
  titulo: string;
  extra?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className={`relative min-w-0 rounded-md border border-slate-300 bg-white p-2.5 ${className}`}>
      <legend className="flex items-center gap-1.5 px-1 text-xs font-semibold text-slate-700">
        {titulo}
        {extra}
      </legend>
      {children}
    </fieldset>
  );
}

/**
 * Cabecera de pagina: icono en recuadro, titulo, subtitulo y acciones a la derecha.
 * conMenu muestra el boton del sidebar (el layout del docente no tiene cabecera propia).
 */
export function CabeceraPagina({
  icono: Icono,
  titulo,
  subtitulo,
  acciones,
  conMenu = false,
}: {
  icono: LucideIcon;
  titulo: string;
  subtitulo?: ReactNode;
  acciones?: ReactNode;
  conMenu?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        {conMenu && <SidebarTrigger className="-ml-1 text-slate-400 hover:text-slate-600" />}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] bg-blue-100 text-blue-600">
          <Icono size={16} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-base font-extrabold text-slate-900">{titulo}</h1>
          {subtitulo && <p className="text-xs text-slate-500">{subtitulo}</p>}
        </div>
      </div>
      {acciones && <div className="flex flex-wrap items-center gap-2">{acciones}</div>}
    </div>
  );
}

type VarianteBoton = "primario" | "secundario" | "contorno" | "peligro" | "exito";

const claseVariante: Record<VarianteBoton, string> = {
  primario: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400",
  secundario: "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50",
  contorno: "border border-blue-600 text-blue-600 hover:bg-blue-50",
  peligro: "border border-red-200 text-red-600 hover:bg-red-50",
  exito: "border border-green-200 text-green-600 hover:bg-green-50",
};

/** Boton compacto: 28px de alto, texto en mayusculas y 5px de radio */
export function BotonCompacto({
  variante = "primario",
  icono: Icono,
  cargando = false,
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: VarianteBoton;
  icono?: LucideIcon;
  cargando?: boolean;
}) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex h-[28px] cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-[10px] px-3 text-[11px] font-bold uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${claseVariante[variante]} ${className}`}
    >
      {cargando ? (
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        Icono && <Icono size={13} strokeWidth={2.5} />
      )}
      {children}
    </button>
  );
}

/** Boton pequeno solo con icono (acciones dentro de tablas) */
export function BotonIcono({
  icono: Icono,
  variante = "neutro",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { icono: LucideIcon; variante?: "neutro" | "peligro" | "exito" | "primario" }) {
  const color = {
    neutro: "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
    peligro: "text-red-500 hover:bg-red-50",
    exito: "text-green-600 hover:bg-green-50",
    primario: "text-blue-600 hover:bg-blue-50",
  }[variante];
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-[10px] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${color} ${className}`}
    >
      <Icono size={13} />
    </button>
  );
}

/** Mensaje de exito o error en linea */
export function MensajeCompacto({ texto, error }: { texto: string; error: boolean }) {
  return (
    <div
      className={`rounded-[5px] border px-2.5 py-2 text-xs font-semibold ${
        error ? "border-red-200 bg-red-50 text-red-600" : "border-green-200 bg-green-50 text-green-700"
      }`}
    >
      {texto}
    </div>
  );
}

/** Paginacion compacta para el pie de las tablas */
export function PaginacionCompacta({
  pagina,
  totalPaginas,
  total,
  etiqueta,
  deshabilitado = false,
  irA,
}: {
  pagina: number;
  totalPaginas: number;
  total?: number;
  etiqueta?: string;
  deshabilitado?: boolean;
  irA: (pagina: number) => void;
}) {
  if (totalPaginas <= 1) return null;
  const claseBoton =
    "h-[24px] cursor-pointer rounded-[10px] border border-slate-300 bg-white px-2.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-default disabled:opacity-40";
  return (
    <div className="mt-2 flex items-center justify-end gap-2 border-t border-slate-100 pt-2">
      {total !== undefined && (
        <span className="mr-auto text-[11px] text-slate-500">
          {total} {etiqueta}
        </span>
      )}
      <button type="button" onClick={() => irA(pagina - 1)} disabled={pagina <= 1 || deshabilitado} className={claseBoton}>
        Anterior
      </button>
      <span className="text-[11px] text-slate-600">
        Página <span className="font-bold text-blue-600">{pagina}</span> de {totalPaginas}
      </span>
      <button type="button" onClick={() => irA(pagina + 1)} disabled={pagina >= totalPaginas || deshabilitado} className={claseBoton}>
        Siguiente
      </button>
    </div>
  );
}

/** Fila de tabla para mensajes (cargando, sin datos) */
export function FilaMensaje({ columnas, children }: { columnas: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={columnas} className="px-2 py-5 text-center text-xs text-slate-400">
        {children}
      </td>
    </tr>
  );
}

/** Contenedor de pagina de la intranet */
export function PaginaCompacta({ children }: { children: ReactNode }) {
  return <div className="flex min-h-screen min-w-0 flex-1 flex-col gap-3 bg-slate-50 px-4 py-6">{children}</div>;
}

/** Tarjeta pequeña de un dato (icono, etiqueta en mayusculas y valor) */
export function TarjetaDato({
  icono: Icono,
  etiqueta,
  valor,
  color = "bg-blue-100 text-blue-600",
}: {
  icono: LucideIcon;
  etiqueta: string;
  valor: ReactNode;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-md border border-slate-300 bg-white px-3 py-2">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] ${color}`}>
        <Icono size={16} />
      </div>
      <div className="min-w-0">
        <div className="truncate text-[11px] font-semibold uppercase text-slate-400">{etiqueta}</div>
        <div className="truncate text-base font-extrabold text-slate-900">{valor}</div>
      </div>
    </div>
  );
}
