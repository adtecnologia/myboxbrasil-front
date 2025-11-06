// BIBLIOTECAS REACT
import { useEffect, useState } from "react"
import { Row, Typography } from "antd";
import { Oval } from "react-loader-spinner";
import { GET_API } from "../../services";
import { CircleMarker, MapContainer, Popup, TileLayer, ZoomControl } from "react-leaflet";

// INTERFACE
interface GraphMapaCacambasLocadasFiscalInterface {
    height?: string,
}

// CSS
import './styles.css'

const GraphMapaCacambasLocadasFiscal = ( { height } : GraphMapaCacambasLocadasFiscalInterface ) => {

    // ESTADOS DO COMPONENTE
    const [ loading, setLoading ] = useState<boolean>(true)
    const [ data, setData ] = useState<any[]>([])
    const [ coord, setCoord ] = useState<any>(null)

    useEffect(() => {
        GET_API('/address?active=1').then(rs => rs.json()).then(res => {
            setCoord([ res.data[0].latitude, res.data[0].longitude ])
        })
    }, [])

// CARREGA ENTREGAS HOJE
    useEffect(() => { 
        setLoading(true);
        GET_API(`/order_location_product?status=L`).then(rs => rs.json()).then(res => setData(res.data)).finally(() => setLoading(false))
    }, [])

    return (
        <div className="mapa-all" style={{overflow: 'hidden', marginLeft: -40, zIndex: 1}}>
            { coord === null || loading ? (
                <Row style={{height: '90%', zIndex: 100}} className="loading-graph" justify={'center'} align={'middle'}>
                    <Oval visible={true} height="50" width="50" color="var(--color01)" secondaryColor="var(--color01)" ariaLabel="oval-loading" wrapperStyle={{}} wrapperClass="" />
                </Row>
            ) : null }
            { coord !== null && !loading ? 
                <MapContainer center={[coord[0], coord[1]]} zoom={14} zoomControl={false} scrollWheelZoom={false} style={{width:'100%',height: '100%'}}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <CircleMarker center={[Number(coord[0]), Number(coord[1])]} pathOptions={{ color: 'green'}} radius={10}>
                        <Popup> Meu local </Popup>
                    </CircleMarker>
                    { data.map((v, i) => (
                        <CircleMarker key={i} center={[Number(v.order_locations.cart_product.address.latitude), Number(v.order_locations.cart_product.address.longitude)]} pathOptions={{ color: v.product.status.color}} radius={10}>
                            <Popup> <Typography style={{textAlign: 'center', color: v.product.status.color, fontSize: '1.2em'}}>{v.product.status.name}</Typography> <br/> {v.order_locations.cart_product.address.street}, {v.order_locations.cart_product.address.number} - {v.order_locations.cart_product.address.district} - {v.order_locations.cart_product.address.city.name} / {v.order_locations.cart_product.address.city.state.acronym} </Popup>
                        </CircleMarker>
                    )) }
                    <ZoomControl position="bottomright" /> 
                </MapContainer>
            : null }
        </div>
    )

}

export default GraphMapaCacambasLocadasFiscal