import { Col, Row } from "antd";
import { useState } from "react";
import Filter from "../../../components/Filter";
// components
import PageDefault from "../../../components/PageDefault";
// pages
import DashFornecedor from "./dashCustomer";

export default function MeusGastos() {
  // filter
  const meses = [
    { label: "Janeiro", value: "01" },
    { label: "Fevereiro", value: "02" },
    { label: "Março", value: "03" },
    { label: "Abril", value: "04" },
    { label: "Maio", value: "05" },
    { label: "Junho", value: "06" },
    { label: "Julho", value: "07" },
    { label: "Agosto", value: "08" },
    { label: "Setembro", value: "09" },
    { label: "Outubro", value: "10" },
    { label: "Novembro", value: "11" },
    { label: "Dezembro", value: "12" },
  ];
  const anos = [
    { label: "2023", value: "2023" },
    { label: "2024", value: "2024" },
    { label: "2025", value: "2025" },
    { label: "2026", value: "2026" },
  ];

  // state
  const [filterMes, setFilterMes] = useState(meses[new Date().getMonth()]);
  const [filterAno, setFilterAno] = useState({
    label: new Date().getFullYear(),
    value: new Date().getFullYear(),
  });

  return (
    <PageDefault
      items={[
        {
          title: "Meus gastos",
        },
      ]}
      options={
        <Row gutter={[8, 8]}>
          <Col>
            <Filter
              list={meses}
              name="Mês"
              setState={setFilterMes}
              state={filterMes}
            />
          </Col>
          <Col>
            <Filter
              list={anos}
              name="Ano"
              setState={setFilterAno}
              state={filterAno}
            />
          </Col>
        </Row>
      }
      valid={true}
    >
      <DashFornecedor filters={{ filterMes, filterAno }} />
    </PageDefault>
  );
}
