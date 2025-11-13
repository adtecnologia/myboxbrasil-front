// react libraries
/** biome-ignore-all lint/suspicious/noExplicitAny: <any */
import { Alert, Button, Col, List, Modal, Row, Tag, Typography } from "antd";
import { useEffect, useRef, useState } from "react";
import { AiOutlineClear } from "react-icons/ai";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
// icons
import {
  TbShoppingCart,
  TbShoppingCartCheck,
  TbShoppingCartPause,
  TbShoppingCartPin,
  TbShoppingCartSearch,
  TbTruckDelivery,
} from "react-icons/tb";
import { Link, useNavigate } from "react-router-dom";
import { OrderLocationProductStatusEnum } from "@/enums/order-location-product-status-enum";
// components
import CardItem from "../../../components/CardItem";
import CardKPISmall from "../../../components/CardKPISmall";
import GraphPedidos from "../../../components/Graphics/graphPedidos";
import GraphProdutosMaisPedidos from "../../../components/Graphics/graphProdutosMaisPedidos";
import LoadItem from "../../../components/LoadItem";
// services
import { GET_API, getProfileType } from "../../../services";

// interface
interface DashFornecedorInterface {
  filters: any;
}

const DashFornecedor = ({ filters }: DashFornecedorInterface) => {
  // router
  const navigate = useNavigate();

  // ref
  const ref = useRef<any>();

  // state
  const [approvalWait, setApprovalWait] = useState<boolean>(false);
  const [approval, setApproval] = useState<boolean>(false);
  const [cacambas, setCacambas] = useState<number>(-1);
  const [disponiveis, setDisponiveis] = useState<number>(-1);
  const [entrega, setEntrega] = useState<number>(-1);
  const [locadas, setLocadas] = useState<number>(-1);
  const [retirada, setRetirada] = useState<number>(-1);
  const [transito, setTransito] = useState<number>(-1);
  const [limpeza, setLimpeza] = useState<number>(-1);
  const [openDetail, setOpenDetail] = useState<boolean>(false);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(true);
  const [dataDetail, setDataDetail] = useState<any[]>([]);
  const [scroll, setScroll] = useState<boolean>(false);

  // load stationary bucket
  useEffect(() => {
    setCacambas(-1);
    GET_API(
      `/stationary_bucket?ref=${filters.filterAno.value}-${filters.filterMes.value}`
    )
      .then((rs) => rs.json())
      .then((res) => setCacambas(res.meta.total));
  }, [filters]);
  // load stationary bucket DISPONIVEIS
  useEffect(() => {
    setDisponiveis(-1);
    GET_API(
      `/stationary_bucket?isAvailable=true&ref=${filters.filterAno.value}-${filters.filterMes.value}`
    )
      .then((rs) => rs.json())
      .then((res) => setDisponiveis(res.meta.total));
  }, [filters]);
  // load stationary bucket ENTREGA
  useEffect(() => {
    setEntrega(-1);
    GET_API(
      `/order_location_product?status=${OrderLocationProductStatusEnum.PENDING_DELIVERY}&ref=${filters.filterAno.value}-${filters.filterMes.value}`
    )
      .then((rs) => rs.json())
      .then((res) => setEntrega(res.meta.total));
  }, [filters]);
  // load stationary bucket LOCADAS
  useEffect(() => {
    setLocadas(-1);
    GET_API(
      `/order_location_product?status=${OrderLocationProductStatusEnum.RENTED}&ref=${filters.filterAno.value}-${filters.filterMes.value}`
    )
      .then((rs) => rs.json())
      .then((res) => setLocadas(res.meta.total));
  }, [filters]);
  // load stationary bucket RETIRADA
  useEffect(() => {
    setRetirada(-1);
    GET_API(
      `/order_location_product?status=${OrderLocationProductStatusEnum.AWAITING_PICKUP}&ref=${filters.filterAno.value}-${filters.filterMes.value}`
    )
      .then((rs) => rs.json())
      .then((res) => setRetirada(res.meta.total));
  }, [filters]);
  // load stationary bucket TRÂNSITO
  useEffect(() => {
    setTransito(-1);
    GET_API(
      `/order_location_product?statusIn=${OrderLocationProductStatusEnum.IN_TRANSIT_TO_PICKUP},${OrderLocationProductStatusEnum.IN_TRANSIT_TO_RENTAL}&ref=${filters.filterAno.value}-${filters.filterMes.value}`
    )
      .then((rs) => rs.json())
      .then((res) => setTransito(res.meta.total));
  }, [filters]);
  // load stationary bucket LIMPEZA
  useEffect(() => {
    setLimpeza(-1);
    GET_API(
      `/stationary_bucket?isUnderMaintenance=true&ref=${filters.filterAno.value}-${filters.filterMes.value}`
    )
      .then((rs) => rs.json())
      .then((res) => setLimpeza(res.meta.total));
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
          setApproval(res.data.municipal_approval_status.name === "Aprovado");
          setApprovalWait(res.data.address.city.municipal_approval);
        });
    }
  }, []);

  const onCloseDetail = () => {
    setLoadingDetail(true);
    setOpenDetail(false);
    setDataDetail([]);
  };

  const onScroll = () => {
    setScroll(!scroll);
    ref.current?.scrollTo(scroll ? 0 : 1000, 0);
  };

  return (
    <Row gutter={[16, 16]}>
      {Boolean(approvalWait) && !approval && (
        <Col span={24}>
          <Link to={"/painel/configuracoes"}>
            <Alert
              message="Sua conta está em processo de aprovação na prefeitura. Alguns recursos podem estar limitados."
              type="warning"
            />
          </Link>
        </Col>
      )}
      <Col span={24}>
        <Row className="kpi-carousel" gutter={[16, 16]} ref={ref}>
          <Col lg={8} md={12} sm={24} xl={4} xs={24}>
            <CardKPISmall
              icon={<TbShoppingCart className="card-kpi-small-icon" />}
              onClick={() => navigate("/painel/produtos&cacambas&cadastros")}
              title={"Total Caçambas"}
              value={cacambas}
            />
          </Col>
          <Col lg={8} md={12} sm={12} xl={4} xs={24}>
            <CardKPISmall
              icon={<TbShoppingCartSearch className="card-kpi-small-icon" />}
              onClick={() => navigate("/painel/produtos&cacambas&cadastros")}
              title="Disponíveis"
              value={disponiveis}
            />
          </Col>
          <Col lg={8} md={12} sm={12} xl={4} xs={24}>
            <CardKPISmall
              icon={<TbShoppingCartPause className="card-kpi-small-icon" />}
              onClick={() =>
                navigate("/painel/ordensdelocacao&entregapendente")
              }
              title="Entregas Pendentes"
              value={entrega}
            />
          </Col>
          <Col lg={6} md={12} sm={12} xl={4} xs={24}>
            <CardKPISmall
              icon={<TbShoppingCartPin className="card-kpi-small-icon" />}
              onClick={() => navigate("/painel/ordensdelocacao&locada")}
              title="Locadas"
              value={locadas}
            />
          </Col>
          <Col lg={6} md={8} sm={12} xl={4} xs={24}>
            <CardKPISmall
              icon={<TbShoppingCartCheck className="card-kpi-small-icon" />}
              onClick={() =>
                navigate("/painel/ordensdelocacao&entregapendente")
              }
              title="Aguardando Retirada"
              value={retirada}
            />
          </Col>
          <Col lg={6} md={8} sm={12} xl={4} xs={24}>
            <CardKPISmall
              icon={<TbTruckDelivery className="card-kpi-small-icon" />}
              onClick={() => navigate("/painel/ordensdelocacao&emtransito")}
              title="Em Trânsito"
              value={transito}
            />
          </Col>
          <Col lg={6} md={8} sm={12} xl={4} xs={24}>
            <CardKPISmall
              icon={<AiOutlineClear className="card-kpi-small-icon" />}
              title="Limpeza e Manutenção"
              value={limpeza}
            />
          </Col>
        </Row>
        <Button
          className={`kpi-carousel-icon button-${scroll ? "inactive" : "active"}`}
          onClick={onScroll}
          shape="circle"
        >
          <IoChevronForward />
        </Button>
        <Button
          className={`kpi-carousel-icon-alt button-${scroll ? "active" : "inactive"}`}
          onClick={onScroll}
          shape="circle"
        >
          <IoChevronBack />
        </Button>
      </Col>
      <Col md={16} xs={24}>
        <CardItem title="Pedidos por mês">
          <GraphPedidos filters={filters} height="20em" />
        </CardItem>
      </Col>
      <Col md={8} xs={24}>
        <CardItem title="Produtos mais pedidos">
          <GraphProdutosMaisPedidos filters={filters} height="20em" />
        </CardItem>
      </Col>
      {/* MODAL DETALHES | CAÇAMBAS */}
      <Modal
        destroyOnClose
        footer={false}
        onCancel={onCloseDetail}
        open={openDetail}
        style={{ top: 25 }}
        title="Caçambas por modelo"
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
                          Modelo {item.name}
                        </Typography>
                      </Col>
                      <Col>
                        <Tag color="var(--color04)">{item.total}</Tag>
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

export default DashFornecedor;
