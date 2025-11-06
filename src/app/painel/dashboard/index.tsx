// react liraries
import { useEffect, useState } from "react"
import { Button, Col, Row } from "antd"
import { useNavigate } from "react-router-dom";

// components
import PageDefault from "../../../components/PageDefault"
import Filter from "../../../components/Filter"

// services
import { getProfileType } from "../../../services";

// pages
import DashCliente from "./dashCliente";
import LoadItem from "../../../components/LoadItem";
import DashFornecedor from "./dashFornecedor";
import DashMotorista from "./dashMotorista";
import DashAdmin from "./dashAdmin";
import DashDestinoFinal from "./dashDestinoFinal";
import DashPrefeituras from "./dashPrefeituras";
import DashFiscais from "./dashFiscais";

const Dashboard = ( ) => {

    // route
    const navigate = useNavigate();

    // dados filtros
    const meses = [{label: 'Janeiro', value: '01'}, {label: 'Fevereiro', value: '02'}, {label: 'Março', value: '03'}, {label: 'Abril', value: '04'}, {label: 'Maio', value: '05'}, {label: 'Junho', value: '06'}, {label: 'Julho', value: '07'}, {label: 'Agosto', value: '08'}, {label: 'Setembro', value: '09'}, {label: 'Outubro', value: '10'}, {label: 'Novembro', value: '11'}, {label: 'Dezembro', value: '12'}]
    const anos = [{label: '2023', value: '2023'}, {label: '2024', value: '2024'}, {label: '2025', value: '2025'}, , {label: '2026', value: '2026'}]

    // states
    const [type, setType] = useState('')
    const [filterMes, setFilterMes] = useState(meses[new Date().getMonth()])
    const [filterAno, setFilterAno] = useState({ label: new Date().getFullYear(), value: new Date().getFullYear()})

    // verificar tipo de usuário
    useEffect(() => {
        setTimeout(() => {
            if ( getProfileType() === 'ADMIN' || getProfileType() === 'ADMIN_EMPLOYEE' ) setType('ADM')
            if ( getProfileType() === 'CUSTOMER' || getProfileType() === 'LEGAL_CUSTOMER' || getProfileType() === 'CUSTOMER_EMPLOYEE' ) setType('CLN')
            if ( getProfileType() === 'SELLER' || getProfileType() === 'LEGAL_SELLER' || getProfileType() === 'SELLER_EMPLOYEE' ) setType('FNC')
            if ( getProfileType() === 'FINAL_DESTINATION' || getProfileType() === 'LEGAL_FINAL_DESTINATION' || getProfileType() === 'FINAL_DESTINATION_EMPLOYEE' ) setType('DTF')
            if ( getProfileType() === 'SELLER_DRIVER' ) setType('MTR')
            if ( getProfileType() === 'CITY' || getProfileType() === 'CITY_EMPLOYEE' ) setType('CTY')
            if ( getProfileType() === 'TAX' ) setType('TAX')
        }, 500);
    }, [])

    return (
        <PageDefault valid={true} items={[]} options={
            <Row gutter={[8,8]}>
                {/* { type === 'CLN' ? <Col><Button type="primary"  style={{height: 28}} onClick={() => navigate('/painel/pedircacamba')}>Solicitar caçamba</Button></Col> : null } */}
                <Col><Filter name='Mês' state={filterMes} setState={setFilterMes} list={meses} /></Col>
                <Col><Filter name='Ano' state={filterAno} setState={setFilterAno} list={anos} /></Col>
            </Row>
        }>
            { type === '' ? <LoadItem /> : null }
            { type === 'CTY' ? <DashPrefeituras filters={{filterMes, filterAno}} /> : null }
            { type === 'ADM' ? <DashAdmin filters={{filterMes, filterAno}} /> : null }
            { type === 'CLN' ? <DashCliente filters={{filterMes, filterAno}} /> : null }
            { type === 'FNC' ? <DashFornecedor filters={{filterMes, filterAno}} /> : null }
            { type === 'DTF' ? <DashDestinoFinal filters={{filterMes, filterAno}} /> : null }
            { type === 'MTR' ? <DashMotorista filters={{filterMes, filterAno}} /> : null }
            { type === 'TAX' ? <DashFiscais filters={{filterMes, filterAno}} /> : null }
        </PageDefault>
    )

}

export default Dashboard