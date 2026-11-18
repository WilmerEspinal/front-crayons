import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { BarChart, LineChart, PieChart } from "echarts/charts";
import { GridComponent, TooltipComponent, LegendComponent } from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import type { EChartsCoreOption } from "echarts/core";

// Solo las piezas que usa el sistema, para no cargar toda la libreria
echarts.use([BarChart, LineChart, PieChart, GridComponent, TooltipComponent, LegendComponent, SVGRenderer]);

const FUENTE = "Inter, ui-sans-serif, system-ui, sans-serif";

interface GraficoEChartsProps {
  opciones: EChartsCoreOption;
  alto: number;
  ancho?: number | string;
}

/**
 * Dibuja un grafico de ECharts y lo ajusta cuando cambia el tamanio de su contenedor.
 * @param opciones - configuracion de ECharts (series, ejes, leyenda, tooltip)
 * @param alto - alto en px
 * @param ancho - ancho en px o porcentaje; por defecto ocupa todo el contenedor
 */
export default function GraficoECharts({ opciones, alto, ancho = "100%" }: GraficoEChartsProps) {
  const contenedor = useRef<HTMLDivElement>(null);
  const grafico = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!contenedor.current) return;
    const instancia = echarts.init(contenedor.current, undefined, { renderer: "svg" });
    grafico.current = instancia;
    const observador = new ResizeObserver(() => instancia.resize());
    observador.observe(contenedor.current);
    return () => {
      observador.disconnect();
      instancia.dispose();
      grafico.current = null;
    };
  }, []);

  useEffect(() => {
    grafico.current?.setOption({ textStyle: { fontFamily: FUENTE }, animationDuration: 500, ...opciones }, true);
  }, [opciones]);

  return <div ref={contenedor} style={{ height: alto, width: ancho, minWidth: 0, overflow: "hidden" }} />;
}
