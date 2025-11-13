// BIBLIOTECAS REACT

import { Row } from "antd";
import * as echarts from "echarts";
import { useEffect, useRef, useState } from "react";
import { Oval } from "react-loader-spinner";

// SERVIÇOS
import { cor3, cor4, cor5, GET_API } from "../../services";

// INTERFACE
interface GraphPedidosCustomerInterface {
  filters?: any;
  height?: string;
}

// CSS
import "./styles.css";

const GraphPedidosCustomer = ({
  filters,
  height,
}: GraphPedidosCustomerInterface) => {
  // ESTADOS DO COMPONENTE
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<number[]>([
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ]);
  const [chart, setChart] = useState<any>(null);

  // REF GRAFICO
  const thisGraph = useRef<any>();

  useEffect(() => {
    setChart(echarts.init(thisGraph.current));
    const observer = new ResizeObserver((entries) => {
      echarts.getInstanceByDom(thisGraph.current).resize();
    });
    observer.observe(thisGraph.current);
  }, []);

  useEffect(() => {
    if (chart) {
      const option: any = {
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: [
            "Jan",
            "Fev",
            "Mar",
            "Abr",
            "Mai",
            "Jun",
            "Jul",
            "Ago",
            "Set",
            "Out",
            "Nov",
            "Dez",
          ],
        },
        yAxis: {
          type: "value",
          axisLabel: {
            formatter: (value: any) =>
              `R$ ${Number(value).toLocaleString("pt-br")}`,
          },
        },
        tooltip: {
          trigger: "axis",
          position(pt: any) {
            return ["10%", "10%"];
          },
          valueFormatter: (value: any) =>
            `R$ ${Number(value).toLocaleString("pt-br")}`,
        },
        grid: {
          left: "0px",
          right: "20px",
          bottom: "10px",
          top: "20px",
          containLabel: true,
        },
        dataZoom: [{ type: "inside", start: 0, end: "100%" }],
        lineStyle: { color: cor3, width: 2 },
        series: [
          {
            name: "Gastos",
            type: "line",
            smooth: true,
            symbol: "none",
            areaStyle: {
              opacity: 0.8,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: cor4 },
                { offset: 1, color: cor5 },
              ]),
            },
            data,
          },
        ],
      };

      chart.setOption(option);
    }
  }, [chart, data]);

  // CARREGA PEDIDOS
  useEffect(() => {
    setLoading(true);
    GET_API(
      `/reports/customer-spent/by-month?ref=${filters.filterAno.value}-${filters.filterMes.value}`
    )
      .then((rs) => rs.json())
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <>
      <div ref={thisGraph} style={{ height, overflow: "hidden" }} />
      {loading ? (
        <Row
          align={"middle"}
          className="loading-graph"
          justify={"center"}
          style={{ height: "90%" }}
        >
          <Oval
            ariaLabel="oval-loading"
            color="var(--color01)"
            height="50"
            secondaryColor="var(--color01)"
            visible={true}
            width="50"
            wrapperClass=""
            wrapperStyle={{}}
          />
        </Row>
      ) : null}
    </>
  );
};

export default GraphPedidosCustomer;
