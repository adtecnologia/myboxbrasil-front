// react libraries
import { Col, Row } from "antd"
import { useEffect, useState } from "react"
import { GET_API } from "../../../../services"

// icons
import { TbCalendarDollar, TbClockDollar, TbMapPinDollar, TbUserDollar } from "react-icons/tb"

// components
import CardKPISmall from "../../../../components/CardKPISmall"
import CardItem from "../../../../components/CardItem"
import GraphMeta from "../../../../components/Graphics/graphMeta"
import GraphPedidosRS from "../../../../components/Graphics/graphPedidosRS"

// interface
interface DashAdminInterface {
    filters: any
}

const DashAdmin = ( { filters } : DashAdminInterface ) => {

    // state
    const [ meuSaldo, setMeuSaldo ] = useState<number|string>(-1)
    const [ faturamentoMes, setFaturamentoMes ] = useState<number|string>(-1)
    const [ faturamentoAno, setFaturamentoAno ] = useState<number|string>(-1)
    const [ metaAnual, setMetaAnual ] = useState<number|string>(-1)

    // CARREGA MEU SALDO
    useEffect(() => {
        GET_API('/me').then(rs => rs.json()).then(res => {
            setMeuSaldo(`R$ ${Number(res.data.available_balance).toLocaleString('pt-br', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`)
        })
    }, [])
    // CARREGA FATURAMENTO MES
    useEffect(() => { setFaturamentoMes(-1); GET_API(`/financial/month?ref=${filters.filterAno.value}-${filters.filterMes.value}`).then(rs => rs.json()).then(res => setFaturamentoMes(res.data)) }, [filters])
    // CARREGA FATURAMENTO ANO
    useEffect(() => { setFaturamentoAno(-1); GET_API(`/financial/year?ref=${filters.filterAno.value}-${filters.filterMes.value}`).then(rs => rs.json()).then(res => setFaturamentoAno(res.data)) }, [filters])
    // CARREGA META ANUAL
    useEffect(() => { setMetaAnual(-1); GET_API(`/goal?year=${filters.filterAno.value}`).then(rs => rs.json()).then(res => {
        if (res.data[0]?.goal) {
            setMetaAnual(res.data[0]?.goal_format) 
        } else { 
            setMetaAnual('R$ 0,00')
        }
    }) }, [filters])

    return (
        <Row gutter={[16,16]}>
            <Col xl={6} lg={6} md={12} sm={12} xs={24}>
                <CardKPISmall title="Meu Saldo (hoje)" icon={<TbUserDollar className="card-kpi-small-icon" />} value={meuSaldo} />
            </Col>
            <Col xl={6} lg={6} md={12} sm={12} xs={24}>
                <CardKPISmall title="Faturamento mês" icon={<TbClockDollar className="card-kpi-small-icon" />} value={faturamentoMes} />
            </Col>
            <Col xl={6} lg={6} md={12} sm={12} xs={24}>
                <CardKPISmall title="Faturamento ano" icon={<TbMapPinDollar className="card-kpi-small-icon" />} value={faturamentoAno} />
            </Col>
            <Col xl={6} lg={6} md={12} sm={12} xs={24}>
                <CardKPISmall title="Meta Anual" icon={<TbCalendarDollar className="card-kpi-small-icon" />} value={metaAnual} />
            </Col>
            <Col md={16} xs={24}>
                <CardItem title={`Faturamento por mês / ${filters.filterAno.label}`}>
                    <GraphPedidosRS filters={filters} height="20em" />
                </CardItem>
            </Col>
            <Col md={8} xs={24}>
                <CardItem title={`Meta anual / ${filters.filterAno.label}`}>
                    <GraphMeta filters={filters} height="20em" />
                </CardItem>
            </Col>
        </Row>
    )

}

export default DashAdmin