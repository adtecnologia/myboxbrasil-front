import { TbReportAnalytics } from "react-icons/tb";
import { verifyConfig } from "@/services";
import type { MenuItemProps } from ".";

const reportItems: MenuItemProps = {
  key: "relatorios",
  label: "Relatórios",
  icon: <TbReportAnalytics />,
  disabled: !verifyConfig([
    "rpt.vdp",
    "rpt.ddr",
    "rpt.cdr",
    "rpt.eml",
    "rpt.ieo",
    "rpt.ima",
    "rpt.lac",
    "rpt.cpb",
    "rpt.rkc",
    "rpt.pmt",
    "rpt.lpo",
    "rpt.gap",
    "rpt.ids",
    "rpt.rdr",
    "rpt.qlp",
    "rpt.cmb",
    "rpt.aor",
  ]),
  children: [
    {
      key: "relatorios&locacoes",
      label: "Locações",
      disabled: !verifyConfig(["rpt.lac"]),
    },
    {
      key: "relatorios&porbairro",
      label: "Caçambas por Bairro",
      disabled: !verifyConfig(["rpt.cpb"]),
    },
    {
      key: "relatorios&porobra",
      label: "Caçambas por Obra",
      disabled: !verifyConfig(["rpt.cpo"]),
    },
    {
      key: "relatorios&ranking",
      label: "Ranking de clientes",
      disabled: !verifyConfig(["rpt.rkc"]),
    },
    {
      key: "relatorios&performancemotoristas",
      label: "Performance de Motoristas",
      disabled: !verifyConfig(["rpt.pmt"]),
    },
    {
      key: "relatorios&contatos",
      label: "Índice de Satisfação",
      disabled: !verifyConfig(["rpt.ids"]),
    },
    {
      key: "relatorios&contatos",
      label: "Quilometragem Percorrida",
      disabled: !verifyConfig(["rpt.qlp"]),
    },
    {
      key: "relatorios&contatos",
      label: "Roteiros Diários Realizados",
      disabled: !verifyConfig(["rpt.rdr"]),
    },
    {
      key: "relatorios&contatos",
      label: "Registro de Caçambas",
      disabled: !verifyConfig(["rpt.cmb"]),
    },
    {
      key: "relatorios&contatos",
      label: "Atrasos e Ocorrências Registradas",
      disabled: !verifyConfig(["rpt.aor"]),
    },
    {
      key: "relatorios&vencimentoprazo",
      label: "Vencimento de Prazo",
      disabled: !verifyConfig(["rpt.vdp"]),
    },
    {
      key: "relatorios&destinacaoresiduos",
      label: "Destinação de Resíduos",
      disabled: !verifyConfig(["rpt.ddr"]),
    },
    {
      key: "relatorios&classesderesiduos",
      label: "Classes de Resíduos",
      disabled: !verifyConfig(["rpt.cdr"]),
    },
    {
      key: "relatorios&situacaolocadores",
      label: "Situação Locadores",
      disabled: !verifyConfig(["rpt.eml"]),
    },
    {
      key: "relatorios&situacaodestinofinal",
      label: "Situação Destino Final",
      disabled: !verifyConfig(["rpt.eml"]),
    },
  ],
};

export default reportItems;
