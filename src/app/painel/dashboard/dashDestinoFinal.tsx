// react libraries
import { Col, Row, Button, notification, Modal, List, Typography, Tag } from "antd"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

// icons
import { TbShoppingCart, TbShoppingCartPause, TbShoppingCartSearch } from "react-icons/tb"

// components
import CardItem from "../../../components/CardItem"
import CardKPISmall from "../../../components/CardKPISmall"
import GraphCDF from "../../../components/Graphics/graphCDF"
import GraphResiduosPorMes from "../../../components/Graphics/graphResiduos"

// services
import { GET_API } from "../../../services"
import LoadItem from "../../../components/LoadItem"

// interface
interface DashDestinoFinalInterface {
    filters: any
}

const DashDestinoFinal = ( { filters } : DashDestinoFinalInterface ) => {

    // router
    const navigate = useNavigate();

    // ref
    const ref = useRef<any>();

    // state
    const [ cdf, setCdf ] = useState<number>(-1)
    const [ cdfAguardando, setCdfAguardando ] = useState<number>(-1)
    const [ residuos, setResiduos ] = useState<number>(-1)
    const [ caminho, setCaminho ] = useState<number>(-1)

    const [api, contextHolder] = notification.useNotification();

    // load cdf
    useEffect(() => { setCdf(-1); GET_API(`/dashboard/cdf?ref=${filters.filterAno.value}-${filters.filterMes.value}`).then(rs => rs.json()).then(res => setCdf(res.data)) }, [filters])
    // load cdf aguardando emissão
    useEffect(() => { setCdfAguardando(-1); GET_API(`/dashboard/cdfwaiting?ref=${filters.filterAno.value}-${filters.filterMes.value}`).then(rs => rs.json()).then(res => setCdfAguardando(res.data)) }, [filters])
    // load sresiduos tratados
    useEffect(() => { setResiduos(-1); GET_API(`/dashboard/residue?ref=${filters.filterAno.value}-${filters.filterMes.value}`).then(rs => rs.json()).then(res => setResiduos(res.data || 0)) }, [filters])
    // load mtr a caminho
    useEffect(() => { setCaminho(-1); GET_API(`/dashboard/mtr?ref=${filters.filterAno.value}-${filters.filterMes.value}`).then(rs => rs.json()).then(res => setCaminho(res.data)) }, [filters])

    useEffect(() => {
        GET_API(`/me`).then((rs) => rs.json()).then((res) => {
            if (!res.data.environmental_license) {
                api.warning({
                    message: `Atenção`,
                    description: 'Ainda não identificamos sua Licença Ambiental. Sem este arquivo não será possível emitir CDFs',
                    placement: 'bottomRight',
                    showProgress: true,
                    btn: <Button type="primary" onClick={() => navigate('/painel/configuracoes')}>Atualizar licença ambiental</Button>
                });
            }
        })
    }, [])

    const [ openDetail, setOpenDetail ] = useState<boolean>(false)
    const [ loadingDetail, setLoadingDetail ] = useState<boolean>(true)
    const [ dataDetail, setDataDetail ] = useState<any[]>([])
    const [ typeDetail, setTypeDetail ] = useState<string>('productbytype')

    const onOpenDetail = (status?: string, url: string = 'productbytype') => {
        setLoadingDetail(true);
        setOpenDetail(true)
        setTypeDetail(url)
        GET_API(`/dashboard/${url}?status=${status}&ref=${filters.filterAno.value}-${filters.filterMes.value}`).then(rs => rs.json()).then(res => setDataDetail(res.data)).finally(() => setLoadingDetail(false))
    }

    const onCloseDetail = () => {
        setLoadingDetail(true);
        setOpenDetail(false)
        setDataDetail([]);
    }

    return (
        <Row gutter={[16,16]}>
            {contextHolder}
            <Col span={24}>
                <Row gutter={[16,16]}>
                    <Col xl={6} lg={6} md={6} sm={12} xs={24}>
                        <CardKPISmall title={"CDF emitidos"} icon={<TbShoppingCart className="card-kpi-small-icon" />} value={cdf} onClick={() => navigate('/painel/documentos')} />
                    </Col>
                    <Col xl={6} lg={6} md={6} sm={12} xs={24}>
                        <CardKPISmall title="CDF aguardando emissão" icon={<TbShoppingCartSearch className="card-kpi-small-icon" />} value={cdfAguardando} onClick={() => navigate('/painel/ordensdelocacao&emanalise')}  />
                    </Col>
                    <Col xl={6} lg={6} md={6} sm={12} xs={24}>
                        <CardKPISmall title="Resíduos tratados" icon={<TbShoppingCartPause className="card-kpi-small-icon" />} value={residuos} onClick={() => onOpenDetail('', 'residuebytype')} />
                    </Col>
                    <Col xl={6} lg={6} md={6} sm={12} xs={24}>
                        <CardKPISmall title="MTR a caminho" icon={<TbShoppingCartPause className="card-kpi-small-icon" />} value={caminho} onClick={() => navigate('/painel/ordensdelocacao&emanalise')} />
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
            <Modal title={  typeDetail === 'productbytype' ? "Caçambas por modelo" : "Resíduos por classificação"} open={openDetail} onCancel={onCloseDetail} footer={false} style={{top: 25}} destroyOnClose>
                <Row gutter={[8,8]}>
                    { loadingDetail ? <Col span={24}><LoadItem type="alt" title="Carregando" /></Col> : (
                        <Col span={24}>
                            <List
                                dataSource={dataDetail}
                                locale={{ emptyText: 'Nenhum dado encontrado' }}
                                renderItem={(item, index) => (
                                    <List.Item key={index}>
                                        <Row justify={'space-between'} style={{width: '100%'}} align={'middle'}>
                                            <Col><Typography className="dsh-item-link">{ typeDetail === 'productbytype' ? `Modelo ${item.name}` : item.name }</Typography></Col>
                                            <Col><Tag color="var(--color04)">{ typeDetail === 'productbytype' ? item.total : `${item.total || 0}m³`}</Tag></Col>
                                        </Row>
                                    </List.Item>
                                )}
                            />
                        </Col>
                    ) }
                </Row>
            </Modal>
        </Row>
    )

}

export default DashDestinoFinal