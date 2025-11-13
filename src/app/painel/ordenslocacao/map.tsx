import { Button, Col, Row } from "antd";
import { useEffect, useState } from "react";
// ICONES
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { Link, useParams } from "react-router-dom";
import CardItem from "../../../components/CardItem";
import LoadItem from "../../../components/LoadItem";
// COMPONENTES
import PageDefault from "../../../components/PageDefault";
// SERVIÇOS
import { GET_API } from "../../../services";

// GOOGLE MAPS
const google = `${import.meta.env.VITE_URL_ASSETS}/google-maps.png`;

const OrdemLocacaoMapa = () => {
  const { ID, TIPO } = useParams();

  const [order, setOrder] = useState<any>(null);

  // CARREGA MODELO
  const onView = () => {
    GET_API(`/order_location/${ID}`)
      .then((rs) => rs.json())
      .then((res) => {
        setOrder(res.data);
      });
  };

  useEffect(() => onView(), [ID]);

  return (
    <PageDefault
      items={[
        {
          title: (
            <Link to={`/painel/${TIPO}`}>
              {TIPO === "ordensdelocacao&entregapendente"
                ? "Entregas Pendentes"
                : null}
              {TIPO === "ordensdelocacao&emtransito" ? "Em Trânsito" : null}
              {TIPO === "ordensdelocacao&locada" ? "Locadas" : null}
              {TIPO === "ordensdelocacao&emanalise" ? "Em Análise" : null}
              {TIPO === "pedidos" ? "Pedidos" : null}
            </Link>
          ),
        },
        { title: "Mapa" },
      ]}
      options={
        <Row gutter={[8, 8]} justify={"end"}>
          <Link to={`/painel/${TIPO}`}>
            <Button className="page-default-button" size="small" type="default">
              voltar
            </Button>
          </Link>
        </Row>
      }
      valid={true}
    >
      {order === null ? (
        <LoadItem />
      ) : (
        <Row gutter={[8, 8]}>
          <Col span={24}>
            <CardItem>
              <Row gutter={[16, 8]}>
                <Col md={24} style={{ overflow: "hidden !important" }} xs={24}>
                  <MapContainer
                    center={[
                      Number(order.client_latitude),
                      Number(order.client_longitude),
                    ]}
                    scrollWheelZoom={false}
                    style={{ width: "100%", height: 500 }}
                    zoom={16}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <CircleMarker
                      center={[
                        Number(order.client_latitude),
                        Number(order.client_longitude),
                      ]}
                      pathOptions={{ color: "var(--color01)" }}
                      radius={10}
                    >
                      <Popup>
                        {" "}
                        {order.client_street}, {order.client_number} -{" "}
                        {order.client_district} - {order.client_city.name} /{" "}
                        {order.client_city.state.acronym}{" "}
                      </Popup>
                    </CircleMarker>
                  </MapContainer>
                  <Link
                    target="_blank"
                    to={`http://maps.google.com/?daddr=${order.client_street}, ${order.client_numb}, ${order.client_district}, ${order.client_city.name}, ${order.client_city.state.acronym}`}
                  >
                    <img alt="google" className="img-google" src={google} />
                  </Link>
                </Col>
              </Row>
            </CardItem>
          </Col>
        </Row>
      )}
    </PageDefault>
  );
};

export default OrdemLocacaoMapa;
