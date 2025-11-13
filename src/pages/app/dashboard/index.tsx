// react liraries

import { Col, Row } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Filter from "../../../components/Filter";
// pages
//import DashCliente from "./dashCliente";
import LoadItem from "../../../components/LoadItem";
// components
import PageDefault from "../../../components/PageDefault";

//import DashFornecedor from "./dashFornecedor";
//import DashMotorista from "./dashMotorista";
//import DashAdmin from "./dashAdmin";
//import DashDestinoFinal from "./dashDestinoFinal";
//import DashPrefeituras from "./dashPrefeituras";
//import DashFiscais from "./dashFiscais";

export default function DashboardPage() {
  // route
  const navigate = useNavigate();

  // dados filtros
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
    ,
    { label: "2026", value: "2026" },
  ];

  // states
  const [type, setType] = useState("");
  const [filterMes, setFilterMes] = useState(meses[new Date().getMonth()]);
  const [filterAno, setFilterAno] = useState({
    label: new Date().getFullYear(),
    value: new Date().getFullYear(),
  });

  // verificar tipo de usuário
  useEffect(() => {
    setTimeout(() => {}, 500);
  }, []);

  return (
    <PageDefault
      items={[]}
      options={
        <Row gutter={[8, 8]}>
          {/* { type === 'CLN' ? <Col><Button type="primary"  style={{height: 28}} onClick={() => navigate('/painel/pedircacamba')}>Solicitar caçamba</Button></Col> : null } */}
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
      {type === "" ? <LoadItem /> : null}
    </PageDefault>
  );
}
