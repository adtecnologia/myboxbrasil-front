// react libraries
/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import { Alert, Col, List, Modal, Row, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
// icons
import {
  TbShoppingCart,
  TbShoppingCartPause,
  TbShoppingCartSearch,
} from "react-icons/tb";
import { Link, useNavigate } from "react-router-dom";
// components
import CardItem from "../../../components/CardItem";
import CardKPISmall from "../../../components/CardKPISmall";
import GraphCDF from "../../../components/Graphics/graphCDF";
import GraphResiduosPorMes from "../../../components/Graphics/graphResiduos";
import LoadItem from "../../../components/LoadItem";
// services
import { GET_API, getProfileType } from "../../../services";

// interface
interface DashDestinoFinalInterface {
  filters: any;
}

const DashDestinoFinal = ({ filters }: DashDestinoFinalInterface) => {
  // router
  const navigate = useNavigate();

  // state
  const [approvalWait, setApprovalWait] = useState<boolean>(false);
  const [approval, setApproval] = useState<{ name: string; color: string }>();
  const [cdf, setCdf] = useState<number>(-1);
  const [cdfAguardando, setCdfAguardando] = useState<number>(-1);
  const [residuos, setResiduos] = useState<number>(-1);
  const [caminho, setCaminho] = useState<number>(-1);

  // load cdf
  useEffect(() => {
    setCdf(-1);
    GET_API(
      `/dashboard/cdf?ref=${filters.filterAno.value}-${filters.filterMes.value}`
    )
      .then((rs) => rs.json())
      .then((res) => setCdf(res.data));
  }, [filters]);
  // load cdf aguardando emissão
  useEffect(() => {
    setCdfAguardando(-1);
    GET_API(
      `/dashboard/cdfwaiting?ref=${filters.filterAno.value}-${filters.filterMes.value}`
    )
      .then((rs) => rs.json())
      .then((res) => setCdfAguardando(res.data));
  }, [filters]);
  // load sresiduos tratados
  useEffect(() => {
    setResiduos(-1);
    GET_API(
      `/dashboard/residue?ref=${filters.filterAno.value}-${filters.filterMes.value}`
    )
      .then((rs) => rs.json())
      .then((res) => setResiduos(res.data || 0));
  }, [filters]);
  // load mtr a caminho
  useEffect(() => {
    setCaminho(-1);
    GET_API(
      `/dashboard/mtr?ref=${filters.filterAno.value}-${filters.filterMes.value}`
    )
      .then((rs) => rs.json())
      .then((res) => setCaminho(res.data));
  }, [filters]);

  useEffect(() => {
    if (
      getProfileType() === "SELLER" ||
      getProfileType() === "LEGAL_SELLER" ||
      getProfileType() === "FINAL_DESTINATION" ||
      getProfileType() === "LEGAL_FINAL_DESTINATION"
    ) {
      GET_API("/me")
        .then((rs) => {
          if (rs.ok) {
            return rs.json();
          }
          Modal.warning({ title: "Algo deu errado", content: rs.statusText });
        })
        .then((res) => {
          setApproval(res.data.municipal_approval_status);
          setApprovalWait(res.data.address.city.municipal_approval);
        });
    }
  }, []);

  const [openDetail, setOpenDetail] = useState<boolean>(false);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(true);
  const [dataDetail, setDataDetail] = useState<any[]>([]);
  const [typeDetail, setTypeDetail] = useState<string>("productbytype");

  const onOpenDetail = (status?: string, url = "productbytype") => {
    setLoadingDetail(true);
    setOpenDetail(true);
    setTypeDetail(url);
    GET_API(
      `/dashboard/${url}?status=${status}&ref=${filters.filterAno.value}-${filters.filterMes.value}`
    )
      .then((rs) => rs.json())
      .then((res) => setDataDetail(res.data))
      .finally(() => setLoadingDetail(false));
  };

  const onCloseDetail = () => {
    setLoadingDetail(true);
    setOpenDetail(false);
    setDataDetail([]);
  };

  return (
    <Row gutter={[16, 16]}>
      {Boolean(approvalWait) && approval?.name !== "Aprovado" && (
        <Col span={24}>
          <Link to={"/painel/configuracoes"}>
            <Alert
              message={
                approval?.name === "Rejeitado"
                  ? "Sua conta foi recusada! Verifique os dados e envie novamente para aprovação."
                  : "Sua conta está em processo de aprovação na prefeitura. Alguns recursos podem estar limitados."
              }
              type={approval?.name === "Rejeitado" ? "error" : "warning"}
            />
          </Link>
        </Col>
      )}
      <Col span={24}>
        <Row gutter={[16, 16]}>
          <Col lg={6} md={6} sm={12} xl={6} xs={24}>
            <CardKPISmall
              icon={<TbShoppingCart className="card-kpi-small-icon" />}
              onClick={() => navigate("/painel/documentos")}
              title={"CDF emitidos"}
              value={cdf}
            />
          </Col>
          <Col lg={6} md={6} sm={12} xl={6} xs={24}>
            <CardKPISmall
              icon={<TbShoppingCartSearch className="card-kpi-small-icon" />}
              onClick={() => navigate("/painel/ordensdelocacao&emanalise")}
              title="CDF aguardando emissão"
              value={cdfAguardando}
            />
          </Col>
          <Col lg={6} md={6} sm={12} xl={6} xs={24}>
            <CardKPISmall
              icon={<TbShoppingCartPause className="card-kpi-small-icon" />}
              onClick={() => onOpenDetail("", "residuebytype")}
              title="Resíduos tratados"
              value={residuos}
            />
          </Col>
          <Col lg={6} md={6} sm={12} xl={6} xs={24}>
            <CardKPISmall
              icon={<TbShoppingCartPause className="card-kpi-small-icon" />}
              onClick={() => navigate("/painel/ordensdelocacao&emanalise")}
              title="MTR a caminho"
              value={caminho}
            />
          </Col>
        </Row>
      </Col>
      <Col md={14} xs={24}>
        <CardItem title="CDF emitidos por mês">
          <GraphCDF filters={filters} height="20em" />
        </CardItem>
      </Col>
      <Col md={10} xs={24}>
        <CardItem title="Resíduos tratados por mês">
          <GraphResiduosPorMes filters={filters} height="20em" />
        </CardItem>
      </Col>
      {/* MODAL DETALHES | CAÇAMBAS */}
      <Modal
        destroyOnClose
        footer={false}
        onCancel={onCloseDetail}
        open={openDetail}
        style={{ top: 25 }}
        title={
          typeDetail === "productbytype"
            ? "Caçambas por modelo"
            : "Resíduos por classificação"
        }
      >
        <Row gutter={[8, 8]}>
          {loadingDetail ? (
            <Col span={24}>
              <LoadItem title="Carregando" type="alt" />
            </Col>
          ) : (
            <Col span={24}>
              <List
                dataSource={dataDetail}
                locale={{ emptyText: "Nenhum dado encontrado" }}
                renderItem={(item, index) => (
                  <List.Item key={index}>
                    <Row
                      align={"middle"}
                      justify={"space-between"}
                      style={{ width: "100%" }}
                    >
                      <Col>
                        <Typography className="dsh-item-link">
                          {typeDetail === "productbytype"
                            ? `Modelo ${item.name}`
                            : item.name}
                        </Typography>
                      </Col>
                      <Col>
                        <Tag color="var(--color04)">
                          {typeDetail === "productbytype"
                            ? item.total
                            : `${item.total || 0}m³`}
                        </Tag>
                      </Col>
                    </Row>
                  </List.Item>
                )}
              />
            </Col>
          )}
        </Row>
      </Modal>
    </Row>
  );
};

export default DashDestinoFinal;
