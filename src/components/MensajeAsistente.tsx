import React from "react";

/**
 * Convierte **negrita** y *cursiva* en elementos de React sin usar HTML crudo.
 * @param texto - una linea de la respuesta
 */
function formatearLinea(texto: string): React.ReactNode[] {
  const partes = texto.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g);
  return partes.map((parte, i) => {
    if (/^\*\*[^*]+\*\*$/.test(parte)) {
      return <strong key={i} className="font-semibold text-slate-900">{parte.slice(2, -2)}</strong>;
    }
    if (/^\*[^*\s][^*]*\*$/.test(parte)) {
      return <em key={i}>{parte.slice(1, -1)}</em>;
    }
    return parte;
  });
}

type Bloque =
  | { tipo: "parrafo"; texto: string }
  | { tipo: "titulo"; texto: string }
  | { tipo: "lista"; ordenada: boolean; items: { texto: string; nivel: number }[] };

/**
 * Agrupa las lineas de la respuesta en parrafos, titulos y listas.
 * @param texto - respuesta completa del asistente
 */
function separarBloques(texto: string): Bloque[] {
  const bloques: Bloque[] = [];
  for (const lineaOriginal of texto.replace(/\r/g, "").split("\n")) {
    const linea = lineaOriginal.replace(/\s+$/, "");
    if (!linea.trim()) continue;

    const item = linea.match(/^(\s*)([*\-•]|\d+[.)])\s+(.*)$/);
    if (item) {
      const ordenada = /\d/.test(item[2]);
      const nivel = item[1].length >= 2 ? 1 : 0;
      const ultimo = bloques[bloques.length - 1];
      if (ultimo && ultimo.tipo === "lista") {
        ultimo.items.push({ texto: item[3], nivel });
      } else {
        bloques.push({ tipo: "lista", ordenada, items: [{ texto: item[3], nivel }] });
      }
      continue;
    }

    const titulo = linea.match(/^#{1,4}\s+(.*)$/);
    if (titulo) {
      bloques.push({ tipo: "titulo", texto: titulo[1] });
      continue;
    }
    bloques.push({ tipo: "parrafo", texto: linea.trim() });
  }
  return bloques;
}

/**
 * Muestra la respuesta del asistente con negritas, titulos y listas bien formateadas.
 */
export default function MensajeAsistente({ texto }: { texto: string }) {
  const bloques = separarBloques(texto);
  return (
    <div className="space-y-1.5">
      {bloques.map((bloque, i) => {
        if (bloque.tipo === "titulo") {
          return <p key={i} className="font-semibold text-slate-900 pt-1">{formatearLinea(bloque.texto)}</p>;
        }
        if (bloque.tipo === "parrafo") {
          return <p key={i}>{formatearLinea(bloque.texto)}</p>;
        }
        const Lista = bloque.ordenada ? "ol" : "ul";
        return (
          <Lista key={i} className={`${bloque.ordenada ? "list-decimal" : "list-disc"} pl-4 space-y-1 marker:text-blue-500`}>
            {bloque.items.map((item, j) => (
              <li key={j} className={item.nivel ? "ml-3 list-[circle] text-slate-700" : ""}>
                {formatearLinea(item.texto)}
              </li>
            ))}
          </Lista>
        );
      })}
    </div>
  );
}
