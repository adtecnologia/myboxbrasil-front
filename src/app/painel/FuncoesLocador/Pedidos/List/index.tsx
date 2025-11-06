// BIBLIOTECAS REACT
import { useEffect, useState } from "react";
import { Col, Row, Tag, Typography } from "antd";

// SERVIÇOS
import { GET_API, PageDefaultProps } from "../../../../../services";

// COMPONENTES
import PageDefault from "../../../../../components/PageDefault";
import CardItem from "../../../../../components/CardItem";
import Table from "../../../../../components/Table";
import CardKPISmall from "../../../../../components/CardKPISmall";
import { TableTrDetailButton, TableTrMapButton } from "../../../../../components/Table/buttons";
import { TbShoppingCartX, TbShoppingCartCheck, TbShoppingCartOff, TbShoppingCartPause } from "react-icons/tb";

const PedidosList = ({ type, path, permission } : PageDefaultProps ) => {

    // ESTADOS DO COMPONENTE
    const [ action, setAction ] = useState(false);

    const [ aguardando, setAguardando ] = useState<number>(-1)
    const [ aceitos, setAceitos ] = useState<number>(-1)
    const [ recusados, setRecusados ] = useState<number>(-1)
    const [ cancelados, setCancelados ] = useState<number>(-1)

    // DEFINE COLUNAS DA TABELA
    const column = [
        { title: 'Data Abertura', dataIndex: 'created_at', table: 'order_locations.created_at', width: '180px', sorter: true, align: 'center', render: (item:any) => (
            <Row justify={'center'} style={{width: '100%'}}>
                <Typography>{item.created_at}</Typography>
                <Tag color={item.status.color} style={{textAlign: 'center'}}>{item.status.name} <br/>{item.status.code !== 'AR' ? item.updated_at : null }</Tag>
            </Row>
        ) },
        { title: 'Locatário / Local locação', dataIndex: 'provider.name', table: 'order_locations.id', width: 'auto', minWidth: '300px', sorter: true, align: 'left', render: (item:any) => (
            <Row style={{width: '100%'}}>
                <Col span={24}>
                    <Typography>Pedido: n° {item.id}</Typography>
                    <Typography>{item.client.name}</Typography>
                    <Typography style={{color: 'var(--color02)'}}>{item.client_street}, {item.client_number} - {item.client_district} - {item.client_city?.name} / {item.client_city?.state?.acronym}</Typography>
                </Col>
            </Row>
        ) },
        { title: 'Quantidade', dataIndex: 'cart_product.quantity', table: 'order_locations.quantity', width: '100px', sorter: true, align: 'center', render: null },
        { title: 'Valor Total', dataIndex: 'total', table: '(order_location.PRICE*order_location.QTDE)', width: '160px', sorter: false, align: 'center', render: null },
        { title: 'Situação Caçambas', dataIndex: 'STATUS_NAME', table: 'order_location.STATUS', width: '300px', sorter: false, align: 'center', render: (item:any) => (
            <Row style={{width: '100%', flexDirection: 'column'}}>
                <Col><Typography className="cacamba-desc" style={{textAlign: 'center'}}><span>Modelo {item.cart_product.product.stationary_bucket_type.name}</span></Typography></Col>
                { item?.items.map((v:any, i:any) => <Col><Typography className="cacamba-desc"><span>{v.product.code} - </span>{item.status.code === 'AR' ? 'Aguardando' : v.product.status.name}</Typography></Col>) }
            </Row>
        ) },
        { title: 'Ações', dataIndex: null, width: '100px', sorter: false, align: 'center', render: (item: any) => (
            <Row justify={'center'} style={{width: '100%'}}>
                <TableTrDetailButton type={type} permission={permission} item={item} action={() => setAction(!action)} path={path} />
                <TableTrMapButton type={type} permission={permission} item={item} action={() => setAction(!action)} path={path} />
            </Row>
        ) },
    ]

    // CARREGA AGUARDANDO
    useEffect(() => { setAguardando(-1); GET_API(`/order_location?status=AR`).then(rs => rs.json()).then(res => setAguardando(res.meta.total)) }, [])
    // CARREGA ACEITO
    useEffect(() => { setAceitos(-1); GET_API(`/order_location?status=PA`).then(rs => rs.json()).then(res => setAceitos(res.meta.total)) }, [])
    // CARREGA RECUSADOS
    useEffect(() => { setRecusados(-1); GET_API(`/order_location?status=PR`).then(rs => rs.json()).then(res => setRecusados(res.meta.total)) }, [])
    // CARREGA CANCELADOS
    useEffect(() => { setCancelados(-1); GET_API(`/order_location?status=PC`).then(rs => rs.json()).then(res => setCancelados(res.meta.total)) }, [])

    return (
        <PageDefault valid={`vpr.list`} items={[
            { title: 'Pedidos' }
        ]}>
            <Row gutter={[16,16]}>
                <Col xl={6} lg={6} md={12} sm={12} xs={24}>
                    <CardKPISmall title="Aguardando confirmação" value={aguardando} icon={<TbShoppingCartPause className="card-kpi-small-icon" />} />
                </Col>
                <Col xl={6} lg={6} md={12} sm={12} xs={24}>
                    <CardKPISmall title="Pedidos aceitos" value={aceitos} icon={<TbShoppingCartCheck className="card-kpi-small-icon" />} />
                </Col>
                <Col xl={6} lg={6} md={12} sm={12} xs={24}>
                    <CardKPISmall title="Pedidos recusados" value={recusados} icon={<TbShoppingCartX className="card-kpi-small-icon" />} />
                </Col>
                <Col xl={6} lg={6} md={12} sm={12} xs={24}>
                    <CardKPISmall title="Pedidos cancelados" value={cancelados} icon={<TbShoppingCartOff className="card-kpi-small-icon" />} />
                </Col>
                <Col md={24} xs={24}>
                    <CardItem>
                        <Table
                            column={column}
                            path={path}
                            type={type}
                            action={action}
                            defaultFilter={{ TYPE_USER: 'PROVIDER_ID' }}
                            useFilter={[
                                { type: 'select', label: 'Situação', name: 'status', items: [
                                    { label: 'Aguardando confirmação', value: 'AR' },
                                    { label: 'Pedido aceito', value: 'PA' },
                                    { label: 'Pedido recusado', value: 'PR' },
                                    { label: 'Pedido cancelado', value: 'PC' },
                                ] }
                            ]}
                        />
                    </CardItem>
                </Col>
            </Row>
        </PageDefault>
    )

}

export default PedidosList;