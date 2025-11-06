// react libraries
import { useEffect, useState } from "react"
import { Col, List, Modal, Row, Tag, Typography } from "antd"
import { Link } from "react-router-dom"

// icons
import { IoBusinessOutline, IoCardOutline, IoCartOutline, IoPeopleOutline } from "react-icons/io5"

// components
import CardItem from "../../../components/CardItem"
import CardKPISmall from "../../../components/CardKPISmall"
import GraphPedidos from "../../../components/Graphics/graphPedidos"
import GraphMunicipiosComMaisPedidos from "../../../components/Graphics/graphMunicipiosComMaisPedidos"
import GraphCacambasPorMes from "../../../components/Graphics/graphCacambasPorMes"
import GraphUsuariosPorMes from "../../../components/Graphics/graphUsuariosPorMes"
import LoadItem from "../../../components/LoadItem"

// services
import { GET_API } from "../../../services"
import { TbShoppingCartPin } from "react-icons/tb"
import GraphMapaCacambasLocadas from "../../../components/Graphics/graphMapaCacambasLocadas"
import GraphMapaCacambasLocadasFiscal from "../../../components/Graphics/graphMapaCacambasLocadasFiscal"

// interface
interface DashFiscaisInterface {
    filters: any
}

const DashFiscais = ( { filters } : DashFiscaisInterface ) => {

    // states
    const [ locadores, setLocadores ]                       = useState<number>(-1)
    const [ locatarios, setLocatarios ]                     = useState<number>(-1)
    const [ destinoFinal, setDestinoFinal ]                 = useState<number>(-1)
    const [ locadas, setLocadas ]                           = useState<number>(-1)
    const [ fiscais, setFiscais ]                           = useState<number>(-1)
    const [ cacambas, setCacambas ]                         = useState<number>(-1)
    const [ openCacambas, setOpenCacambas ]                 = useState<boolean>(false)
    const [ openCacambasData, setOpenCacambasData ]         = useState<any[]>([])
    const [ openCacambasLoading, setOpenCacambasLoading ]   = useState<boolean>(true)
    const [ openDetail, setOpenDetail ] = useState<boolean>(false)
    const [ loadingDetail, setLoadingDetail ] = useState<boolean>(true)
    const [ dataDetail, setDataDetail ] = useState<any[]>([])

    // carrega fiscais
    // useEffect(() => { setFiscais(-1); GET_API(`/tax?ref=${filters.filterAno.value}-${filters.filterMes.value}`).then(rs => rs.json()).then(res => setFiscais(res.meta.total)) }, [filters])
    // // carrega locadores
    // useEffect(() => { setLocadores(-1); GET_API(`/user?provider=1&ref=${filters.filterAno.value}-${filters.filterMes.value}`).then(rs => rs.json()).then(res => setLocadores(res.meta.total)) }, [filters])
    // // carrega locatarios
    // useEffect(() => { setLocatarios(-1); GET_API(`/user?client=1&ref=${filters.filterAno.value}-${filters.filterMes.value}`).then(rs => rs.json()).then(res => setLocatarios(res.meta.total)) }, [filters])
    // // carrega destino final
    // useEffect(() => { setLocatarios(-1); GET_API(`/user?finalDestination=1&ref=${filters.filterAno.value}-${filters.filterMes.value}`).then(rs => rs.json()).then(res => setDestinoFinal(res.meta.total)) }, [filters])
    // // carrega caçambas
    // useEffect(() => { setCacambas(-1); GET_API(`/stationary_bucket?ref=${filters.filterAno.value}-${filters.filterMes.value}`).then(rs => rs.json()).then(res => setCacambas(res.meta.total)) }, [filters])
    // // carrega locadas
    // useEffect(() => { setLocadas(-1); GET_API(`/dashboard/stationary?ref=${filters.filterAno.value}-${filters.filterMes.value}`).then(rs => rs.json()).then(res => setLocadas(res.data.locada)) }, [filters])

    // verifica open caçamba
    // useEffect(() => {
    //     setOpenCacambasLoading(true);
    //     if (openCacambas) GET_API(`/dashboard/productbytype?ref=${filters.filterAno.value}-${filters.filterMes.value}`).then(rs => rs.json()).then(res => setOpenCacambasData(res.data)).finally(() => setOpenCacambasLoading(false))
    // }, [openCacambas]) 

    // const onOpenDetail = (status?: string) => {
    //     setLoadingDetail(true);
    //     setOpenDetail(true)
    //     GET_API(`/dashboard/productbytype?status=${status}&ref=${filters.filterAno.value}-${filters.filterMes.value}`).then(rs => rs.json()).then(res => setDataDetail(res.data)).finally(() => setLoadingDetail(false))
    // }

    // const onCloseDetail = () => {
    //     setLoadingDetail(true);
    //     setOpenDetail(false)
    //     setDataDetail([]);
    // }

    return (
        <Row gutter={[16,16]}>
            <Col span={24}>
                <CardItem title={``}>
                    <GraphMapaCacambasLocadas height="40em" />
                </CardItem>
            </Col>
        </Row>
    )

}

export default DashFiscais