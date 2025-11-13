import { Col, Row } from "antd";
import { useEffect, useState } from "react";
import Filter from "@/components/Filter";
import LoadItem from "@/components/LoadItem";
import PageDefault from "@/components/PageDefault";
import { getProfileType } from "@/services";
import DashAdmin from "./dashAdmin";
import DashFornecedor from "./dashFornecedor";

const Financeiro = () => {
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
  const [type, setType] = useState("");
  const [filterMes, setFilterMes] = useState(meses[new Date().getMonth()]);
  const [filterAno, setFilterAno] = useState({
    label: new Date().getFullYear(),
    value: new Date().getFullYear(),
  });

  // type dash
  useEffect(() => {
    setTimeout(() => {
      if (
        getProfileType() === "ADMIN" ||
        getProfileType() === "ADMIN_EMPLOYEE"
      ) {
        setType("ADM");
      }
      if (
        getProfileType() === "SELLER" ||
        getProfileType() === "LEGAL_SELLER" ||
        getProfileType() === "SELLER_EMPLOYEE"
      ) {
        setType("FNC");
      }
    }, 500);
  }, []);

  return (
    <PageDefault
      items={[
        {
          title:
            getProfileType() === "ADMIN" ||
            getProfileType() === "ADMIN_EMPLOYEE"
              ? "Resumo financeiro da plataforma"
              : "Resumo financeiro",
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
      {type === "" && <LoadItem />}
      {type === "ADM" && <DashAdmin filters={{ filterMes, filterAno }} />}
      {type === "FNC" && <DashFornecedor filters={{ filterMes, filterAno }} />}
    </PageDefault>
  );
};

export default Financeiro;
