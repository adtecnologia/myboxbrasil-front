// BIBLIOTECA REACT
import { Col, Row } from "antd";
import { useEffect, useState } from "react";
// ICONES
import { TbTruckDelivery } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { OrderLocationProductStatusEnum } from "@/enums/order-location-product-status-enum";
// COMPONENTES
import CardItem from "../../../components/CardItem";
import CardKPISmall from "../../../components/CardKPISmall";
import GraphEntregasPorMes from "../../../components/Graphics/graphEntregasPorMes";
import GraphEntregaRetiradaHoje from "../../../components/Graphics/graphMapaEntregaRetiradaHoje";
// SERVIÇOS
import { GET_API } from "../../../services";

// INTERFACE
interface DashMotoristaInterface {
  filters: any;
}

const DashMotorista = ({ filters }: DashMotoristaInterface) => {
  // router
  const navigate = useNavigate();

  // ESTADOS DO COMPONENTE
  const [entregas, setEntregas] = useState<number>(-1);
  const [entregasAtrasadas, setEntregasAtrasadas] = useState<number>(-1);
  const [retiradas, setRetiradas] = useState<number>(-1);
  const [retiradasAtrasadas, setRetiradasAtrasadas] = useState<number>(-1);

  // CARREGA ENTREGAS HOJE
  useEffect(() => {
    setEntregas(-1);
    GET_API(
      `/order_location_product?driver=true&statusIn=${OrderLocationProductStatusEnum.PENDING_DELIVERY},${OrderLocationProductStatusEnum.IN_TRANSIT_TO_RENTAL}&today=1`
    )
      .then((rs) => rs.json())
      .then((res) => setEntregas(res.meta.total));
  }, [filters]);
  // CARREGA ENTREGAS ATRASADAS
  // useEffect(() => { setEntregasAtrasadas(-1); GET_API(`/order_location_product?driver=true&status=EP&late=1`).then(rs => rs.json()).then(res => setEntregasAtrasadas(res.meta.total)) }, [filters])
  // CARREGA RETIRADAS HOJE
  useEffect(() => {
    setRetiradas(-1);
    GET_API(
      `/order_location_product?driver=true&statusIn=${OrderLocationProductStatusEnum.AWAITING_PICKUP},${OrderLocationProductStatusEnum.IN_TRANSIT_TO_RENTAL}&todayWithdrawl=1`
    )
      .then((rs) => rs.json())
      .then((res) => setRetiradas(res?.meta?.total));
  }, [filters]);
  // CARREGA RETIRADAS ATRASADAS
  // useEffect(() => { setRetiradasAtrasadas(-1); GET_API(`/order_location_product?driver=true&status=AR&lateWithdrawl=1`).then(rs => rs.json()).then(res => setRetiradasAtrasadas(res.meta.total)) }, [filters])

  return (
    <Row gutter={[16, 16]}>
      <Col lg={12} md={12} sm={12} xl={12} xs={24}>
        <CardKPISmall
          icon={<TbTruckDelivery className="card-kpi-small-icon" />}
          onClick={() => navigate("/painel/entregasagendadas")}
          title="Entregas Agendadas"
          value={entregas}
        />
      </Col>
      {/* <Col xl={6} lg={6} md={12} sm={12} xs={24}>
                <CardKPISmall title="Entregas Agendadas" icon={<TbTruckDelivery className="card-kpi-small-icon" />} value={entregasAtrasadas} />
            </Col> */}
      <Col lg={12} md={12} sm={12} xl={12} xs={24}>
        <CardKPISmall
          icon={<TbTruckDelivery className="card-kpi-small-icon" />}
          onClick={() => navigate("/painel/retiradasagendadas")}
          title="Retiradas Agendadas"
          value={retiradas}
        />
      </Col>
      {/* <Col xl={6} lg={6} md={12} sm={12} xs={24}>
                <CardKPISmall title="Retiradas Agendadas" icon={<TbTruckDelivery className="card-kpi-small-icon" />} value={retiradasAtrasadas} />
            </Col> */}
      <Col lg={12} md={24} sm={24} xl={12} xs={24}>
        <CardItem title="Mapa entregas agendadas">
          <GraphEntregaRetiradaHoje
            field="today"
            height="20em"
            status={[
              OrderLocationProductStatusEnum.PENDING_DELIVERY,
              OrderLocationProductStatusEnum.IN_TRANSIT_TO_RENTAL,
            ]}
          />
        </CardItem>
      </Col>
      <Col lg={12} md={24} sm={24} xl={12} xs={24}>
        <CardItem title="Mapa retiradas agendadas">
          <GraphEntregaRetiradaHoje
            field="todayWithdrawl"
            height="20em"
            status={[
              OrderLocationProductStatusEnum.AWAITING_PICKUP,
              OrderLocationProductStatusEnum.IN_TRANSIT_TO_PICKUP,
            ]}
          />
        </CardItem>
      </Col>
      <Col lg={24} md={24} sm={24} xl={24} xs={24}>
        <CardItem title="Entregas agendadas por mês">
          <GraphEntregasPorMes filters={filters} height="20em" />
        </CardItem>
      </Col>
    </Row>
  );
};

export default DashMotorista;
