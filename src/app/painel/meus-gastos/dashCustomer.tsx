// react libraries
import { Col, Row } from "antd";
import { useEffect, useState } from "react";
// icons
import {
  TbCalendarDollar,
  TbClockDollar,
  TbMapPinDollar,
} from "react-icons/tb";
import GraphPedidosCustomer from "@/components/Graphics/graphPedidosCustomer";
import CardItem from "../../../components/CardItem";
// components
import CardKPISmall from "../../../components/CardKPISmall";
import { GET_API } from "../../../services";

// interface
interface DashCustomerInterface {
  filters: any;
}

const DashCustomer = ({ filters }: DashCustomerInterface) => {
  // state
  const [gastoMes, setGastoMes] = useState<number | string>(-1);
  const [gastoAno, setGastoAno] = useState<number | string>(-1);
  const [gastoTotal, setGastoTotal] = useState<number | string>(-1);

  // CARREGA FATURAMENTO MES
  useEffect(() => {
    setGastoMes(-1);
    GET_API(
      `/reports/customer-spent/month?ref=${filters.filterAno.value}-${filters.filterMes.value}`
    )
      .then((rs) => rs.json())
      .then((res) => setGastoMes(res.data));
  }, [filters]);
  // CARREGA FATURAMENTO ANO
  useEffect(() => {
    setGastoAno(-1);
    GET_API(`/reports/customer-spent/year?year=${filters.filterAno.value}`)
      .then((rs) => rs.json())
      .then((res) => setGastoAno(res.data));
  }, [filters]);
  // CARREGA META ANUAL
  useEffect(() => {
    setGastoTotal(-1);
    GET_API("/reports/customer-spent")
      .then((rs) => rs.json())
      .then((res) => {
        setGastoTotal(res.data);
      });
  }, []);

  return (
    <Row gutter={[16, 16]}>
      <Col lg={8} md={12} sm={12} xl={8} xs={24}>
        <CardKPISmall
          icon={<TbCalendarDollar className="card-kpi-small-icon" />}
          title={`Gasto acumulado ${filters.filterMes.label}/${filters.filterAno.value}`}
          value={gastoMes}
        />
      </Col>
      <Col lg={8} md={12} sm={12} xl={8} xs={24}>
        <CardKPISmall
          icon={<TbMapPinDollar className="card-kpi-small-icon" />}
          title={`Gasto acumulado ${filters.filterAno.value}`}
          value={gastoAno}
        />
      </Col>
      <Col lg={8} md={24} sm={24} xl={8} xs={24}>
        <CardKPISmall
          icon={<TbClockDollar className="card-kpi-small-icon" />}
          title="Gasto acumulado total"
          value={gastoTotal}
        />
      </Col>
      <Col md={24} xs={24}>
        <CardItem title={`Gasto por mês / ${filters.filterAno.label}`}>
          <GraphPedidosCustomer filters={filters} height="20em" />
        </CardItem>
      </Col>
    </Row>
  );
};

export default DashCustomer;
