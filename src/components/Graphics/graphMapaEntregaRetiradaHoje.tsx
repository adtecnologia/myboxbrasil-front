// BIBLIOTECAS REACT

import { Button, Row, Typography } from "antd";
import { useEffect, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { Oval } from "react-loader-spinner";
import { GET_API } from "../../services";

// INTERFACE
interface GraphEntregaRetiradaHojeInterface {
  height?: string;
  status: string[];
  field: string;
}

// CSS
import "./styles.css";
import MapFullScreen from "../MapFullScreen";

const GraphEntregaRetiradaHoje = ({
  height,
  status,
  field,
}: GraphEntregaRetiradaHojeInterface) => {
  // ESTADOS DO COMPONENTE
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any[]>([]);
  const [coord, setCoord] = useState<any>(null);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    GET_API("/address?active=1")
      .then((rs) => rs.json())
      .then((res) => {
        setCoord([res.data[0].latitude, res.data[0].longitude]);
      });
  }, []);

  // CARREGA ENTREGAS HOJE
  useEffect(() => {
    setLoading(true);
    GET_API(`/order_location_product?driver=true&statusIn=${status}&${field}=1`)
      .then((rs) => rs.json())
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ height, overflow: "hidden" }}>
      {coord === null || loading ? (
        <Row
          align={"middle"}
          className="loading-graph"
          justify={"center"}
          style={{ height: "90%", zIndex: 100 }}
        >
          <Oval
            ariaLabel="oval-loading"
            color="var(--color01)"
            height="50"
            secondaryColor="var(--color01)"
            visible={true}
            width="50"
            wrapperClass=""
            wrapperStyle={{}}
          />
        </Row>
      ) : null}
      {coord !== null && !loading ? (
        <MapContainer
          center={[coord[0], coord[1]]}
          scrollWheelZoom={false}
          style={{ width: "100%", height: "100%" }}
          zoom={14}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <CircleMarker
            center={[Number(coord[0]), Number(coord[1])]}
            pathOptions={{ color: "green" }}
            radius={10}
          >
            <Popup> Meu local </Popup>
          </CircleMarker>
          {data.map((v) => (
            <CircleMarker
              center={[
                Number(v.order_location.client_latitude),
                Number(v.order_location.client_longitude),
              ]}
              key={v.id}
              pathOptions={{ color: v.status.color }}
              radius={10}
            >
              <Popup>
                {" "}
                <Typography
                  style={{
                    textAlign: "center",
                    color: v.status.color,
                    fontSize: "1.2em",
                  }}
                >
                  {v.status.name}
                </Typography>{" "}
                <br /> {v.order_location.client_street},{" "}
                {v.order_location.client_number} -{" "}
                {v.order_location.client_district} -{" "}
                {v.order_location.client_city.name} /{" "}
                {v.order_location.client_city.state.acronym}{" "}
              </Popup>
            </CircleMarker>
          ))}
          <Button
            className="btn-map-screen"
            onClick={() => setOpen(true)}
            type="text"
          />
        </MapContainer>
      ) : null}
      <MapFullScreen
        drive={true}
        field={field}
        open={open}
        setOpen={setOpen}
        startStatus={status}
      />
    </div>
  );
};

export default GraphEntregaRetiradaHoje;
