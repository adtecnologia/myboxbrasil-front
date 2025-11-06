// BIBLIOTECA REACT
import { Col, Row } from "antd"
import { useEffect, useState } from "react"

// COMPONENTES
import CardItem from "../../../components/CardItem"
import CardKPISmall from "../../../components/CardKPISmall"
import GraphEntregaRetiradaHoje from "../../../components/Graphics/graphMapaEntregaRetiradaHoje"
import GraphEntregasPorMes from "../../../components/Graphics/graphEntregasPorMes"

// ICONES
import { TbTruckDelivery } from "react-icons/tb"

// SERVIÇOS
import { GET_API } from "../../../services"
import { useNavigate } from "react-router-dom"

// INTERFACE
interface DashMotoristaInterface {
    filters: any
}

const DashMotorista = ( { filters } : DashMotoristaInterface ) => {

    // router
    const navigate = useNavigate();

    // ESTADOS DO COMPONENTE
    const [ entregas, setEntregas ] = useState<number>(-1)
    const [ entregasAtrasadas, setEntregasAtrasadas ] = useState<number>(-1)
    const [ retiradas, setRetiradas ] = useState<number>(-1)
    const [ retiradasAtrasadas, setRetiradasAtrasadas ] = useState<number>(-1)

    // CARREGA ENTREGAS HOJE
    useEffect(() => { setEntregas(-1); GET_API(`/order_location_product?driver=true&statusIn=EP,ETL&today=1`).then(rs => rs.json()).then(res => setEntregas(res.meta.total)) }, [filters])
    // CARREGA ENTREGAS ATRASADAS
    // useEffect(() => { setEntregasAtrasadas(-1); GET_API(`/order_location_product?driver=true&status=EP&late=1`).then(rs => rs.json()).then(res => setEntregasAtrasadas(res.meta.total)) }, [filters])
    // CARREGA RETIRADAS HOJE
    useEffect(() => { setRetiradas(-1); GET_API(`/order_location_product?driver=true&statusIn=AR,ETR&todayWithdrawl=1`).then(rs => rs.json()).then(res => setRetiradas(res.meta.total)) }, [filters])
    // CARREGA RETIRADAS ATRASADAS
    // useEffect(() => { setRetiradasAtrasadas(-1); GET_API(`/order_location_product?driver=true&status=AR&lateWithdrawl=1`).then(rs => rs.json()).then(res => setRetiradasAtrasadas(res.meta.total)) }, [filters])


    return (
        <Row gutter={[16,16]}>
            <Col xl={12} lg={12} md={12} sm={12} xs={24}>
                <CardKPISmall title="Entregas Agendadas" icon={<TbTruckDelivery className="card-kpi-small-icon" />} value={entregas} onClick={() => navigate('/painel/entregasagendadas')} />
            </Col>
            {/* <Col xl={6} lg={6} md={12} sm={12} xs={24}>
                <CardKPISmall title="Entregas Agendadas" icon={<TbTruckDelivery className="card-kpi-small-icon" />} value={entregasAtrasadas} />
            </Col> */}
            <Col xl={12} lg={12} md={12} sm={12} xs={24}>
                <CardKPISmall title="Retiradas Agendadas" icon={<TbTruckDelivery className="card-kpi-small-icon" />} value={retiradas} onClick={() => navigate('/painel/retiradasagendadas')} />
            </Col>
            {/* <Col xl={6} lg={6} md={12} sm={12} xs={24}>
                <CardKPISmall title="Retiradas Agendadas" icon={<TbTruckDelivery className="card-kpi-small-icon" />} value={retiradasAtrasadas} />
            </Col> */}
            <Col xl={12} lg={12} md={24} sm={24} xs={24}>
                <CardItem title="Mapa entregas agendadas">
                    <GraphEntregaRetiradaHoje height="20em" status={["EP","ETL"]} field="today" />
                </CardItem>
            </Col>
            <Col xl={12} lg={12} md={24} sm={24} xs={24}>
                <CardItem title="Mapa retiradas agendadas">
                    <GraphEntregaRetiradaHoje height="20em" status={["AR","ETR"]} field="todayWithdrawl" />
                </CardItem>
            </Col>
            <Col xl={24} lg={24} md={24} sm={24} xs={24}>
                <CardItem title="Entregas agendadas por mês">
                    <GraphEntregasPorMes filters={filters} height="20em" />
                </CardItem>
            </Col>
        </Row>
    )

}

export default DashMotorista