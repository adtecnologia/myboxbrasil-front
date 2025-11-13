import { Button, Col, Form, Input, Modal, Row, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import { MdCheckBoxOutlineBlank, MdOutlineCheckBox } from "react-icons/md";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { OrderLocationProductStatusEnum } from "@/enums/order-location-product-status-enum";
import CardItem from "../../../components/CardItem";
import LoadItem from "../../../components/LoadItem";
import MapFullScreen from "../../../components/MapFullScreen";
import PageDefault from "../../../components/PageDefault";
import SelectSearch from "../../../components/SelectSearch";
import Table from "../../../components/Table";
import { TableTrMapProductButton } from "../../../components/Table/buttons";
import {
  GET_API,
  getProfileType,
  type PageDefaultProps,
  POST_API,
  POST_CATCH,
  verifyConfig,
} from "../../../services";

const OrdemLocacaoEntregaPendente = ({
  type,
  path,
  permission,
}: PageDefaultProps) => {
  // ESTADOS DO COMPONENTE
  const [loadingButton, setLoadingButton] = useState(false);
  const [action, setAction] = useState(false);
  const [loadMap, setLoadMap] = useState(false);
  const [coord, setCoord] = useState<any>(null);
  const [product, setProduct] = useState<any[]>([]);
  const [driver, setDriver] = useState<any>("");
  const [vehicle, setVehicle] = useState<any>("");
  const [open, setOpen] = useState<boolean>(false);

  const onProduct = (item: any) => {
    onLoadMap();

    var temp = product;

    if (temp.filter((v) => Number(v.id) === Number(item.id)).length > 0) {
      temp.splice(temp.indexOf(item), 1);
    } else {
      temp.push(item);
    }

    setProduct(temp);

    onLoadMap();
  };

  const onLoadMap = () => setLoadMap(!loadMap);

  // DEFINE COLUNAS DA TABELA
  const column = [
    {
      title: "Data Pedido",
      dataIndex: "DATETIME_UPDATE_FORMAT",
      table: "order_locations.created_at",
      width: "180px",
      sorter: true,
      align: "center",
      render: (item: any) => (
        <Row style={{ width: "100%" }}>
          <Col span={24}>
            <Typography style={{ textAlign: "center" }}>
              {item.created_at}
            </Typography>
            <Typography
              style={{ textAlign: "center", color: "var(--color02)" }}
            >
              {product.filter((v) => Number(v.id) === Number(item.id)).length >
              0
                ? "Selecionada"
                : "Não Selecionada"}
            </Typography>
          </Col>
        </Row>
      ),
    },
    {
      title: "Local locação",
      dataIndex: "CLIENT_NAME",
      table: "order_locations.id",
      width: "auto",
      minWidth: "300px",
      sorter: true,
      align: "left",
      render: (item: any) => (
        <Row style={{ width: "100%" }}>
          <Col span={24}>
            <Typography>Pedido: n° {item.order_location_id}</Typography>
            {getProfileType() === "LEGAL_SELLER" ||
            getProfileType() === "SELLER" ||
            getProfileType() === "SELLER_DRIVER" ? (
              <Typography>{item.order_location.client.name}</Typography>
            ) : null}
            <Typography style={{ color: "var(--color02)" }}>
              {item.order_location.client_street},{" "}
              {item.order_location.client_number} -{" "}
              {item.order_location.client_district} -{" "}
              {item.order_location.client_city?.name} /{" "}
              {item.order_location.client_city?.state.acronym}
            </Typography>
          </Col>
        </Row>
      ),
    },
    {
      title: "Código Caçamba",
      dataIndex: "CODE",
      table: "stationary_buckets.code",
      width: "180px",
      sorter: true,
      align: "center",
      render: (item: any) => (
        <Row style={{ width: "100%" }}>
          <Col span={24}>
            <Typography style={{ textAlign: "center" }}>
              {item.product.code}
            </Typography>
            <Typography
              style={{ color: "var(--color02)", textAlign: "center" }}
            >
              Modelo{" "}
              {item.product.stationary_bucket_group.stationary_bucket_type.name}
            </Typography>
          </Col>
        </Row>
      ),
    },
    {
      title: "Distância",
      dataIndex: "order_locations.distance",
      width: "180px",
      sorter: false,
      align: "center",
      render: (item: any) => (
        <Row justify={"center"} style={{ width: "100%" }}>
          <Typography style={{ textAlign: "center" }}>
            {item.order_location.distance} km
          </Typography>
        </Row>
      ),
    },
    {
      title: "Data Entrega",
      dataIndex: "CODE",
      table: "order_location_products.scheduled_location_date",
      width: "180px",
      sorter: true,
      align: "center",
      render: (item: any) => (
        <Row justify={"center"} style={{ width: "100%" }}>
          <Typography>
            <Tag style={{ textAlign: "center" }}>
              {item.scheduled_location_date
                ? `Agendado para ${item.scheduled_location_date_format}`
                : "Aguardando agendamento"}
            </Tag>
          </Typography>
          {item.scheduled_location_date ? (
            <Typography>
              <Tag color="green">
                {item.driver_location.name} - {item.driver_location.cnh}
              </Tag>
            </Typography>
          ) : null}
          {item.scheduled_location_date ? (
            <Typography>
              <Tag color="red">
                {item.vehicle_location.plate} -{" "}
                {item.vehicle_location.vehicle_type.name}
              </Tag>
            </Typography>
          ) : null}
        </Row>
      ),
    },
    {
      title: "Ações",
      dataIndex: null,
      width: "100px",
      sorter: false,
      align: "center",
      render: (item: any) => (
        <Row justify={"center"} style={{ width: "100%" }}>
          {verifyConfig([`${permission}.edit`]) ? (
            product.filter((v) => Number(v.id) === Number(item.id)).length >
            0 ? (
              <Col>
                <MdOutlineCheckBox
                  className="actions-button"
                  onClick={() => onProduct(item)}
                  size={18}
                />
              </Col>
            ) : (
              <Col>
                <MdCheckBoxOutlineBlank
                  className="actions-button"
                  onClick={() => onProduct(item)}
                  size={18}
                />
              </Col>
            )
          ) : null}
          <TableTrMapProductButton
            action={() => setAction(!action)}
            item={item}
            path={path}
            permission={permission}
            type={type}
          />
        </Row>
      ),
    },
  ];

  // CARREGA DADOS
  const load = () => {
    GET_API("/address?default=1")
      .then((rs) => rs.json())
      .then((res) => {
        setCoord([res.data[0].latitude, res.data[0].longitude]);
      })
      .catch(POST_CATCH);
  };

  const [form] = Form.useForm();

  const onSend = (values: any) => {
    setLoadingButton(true);

    try {
      product.forEach((item) => {
        POST_API("/order_location_product", values, item.id)
          .then((rs) => {
            if (rs.ok) {
            } else {
              Modal.warning({
                title: "Algo deu errado",
                content: "Não foi possível agendar entrega",
              });
            }
          })
          .catch(POST_CATCH);
      });
    } catch (error) {
      POST_CATCH();
    } finally {
      form.resetFields();
      setProduct([]);
      setLoadingButton(false);
      setTimeout(() => {
        setAction(!action);
      }, 500);
    }
  };

  useEffect(() => load(), []);

  return (
    <PageDefault
      items={[{ title: "Entregas Pendentes" }]}
      valid={`${permission}.list`}
    >
      <Row gutter={[16, 16]}>
        <Col md={verifyConfig([`${permission}.edit`]) ? 16 : 24} xs={24}>
          <CardItem>
            {coord ? (
              loadMap ? (
                <MapContainer
                  center={[Number(coord[0]), Number(coord[1])]}
                  scrollWheelZoom={false}
                  style={{ width: "100%", height: 330 }}
                  zoom={14}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {getProfileType() === "LEGAL_SELLER" ||
                  getProfileType() === "SELLER" ||
                  getProfileType() === "SELLER_DRIVER" ? (
                    <CircleMarker
                      center={[Number(coord[0]), Number(coord[1])]}
                      pathOptions={{ color: "blue" }}
                      radius={10}
                    >
                      <Popup> Minha empresa </Popup>
                    </CircleMarker>
                  ) : null}
                  {product.map((v) => (
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
                        {v.order_location.client_city?.name} /{" "}
                        {v.order_location.client_city?.state?.acronym}{" "}
                      </Popup>
                    </CircleMarker>
                  ))}
                  <Button
                    className="btn-map-screen"
                    onClick={() => setOpen(true)}
                    type="text"
                  />
                </MapContainer>
              ) : (
                <MapContainer
                  center={[Number(coord[0]), Number(coord[1])]}
                  scrollWheelZoom={false}
                  style={{ width: "100%", height: 330 }}
                  zoom={14}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {getProfileType() === "LEGAL_SELLER" ||
                  getProfileType() === "SELLER" ||
                  getProfileType() === "SELLER_DRIVER" ? (
                    <CircleMarker
                      center={[Number(coord[0]), Number(coord[1])]}
                      pathOptions={{ color: "blue" }}
                      radius={10}
                    >
                      <Popup> Minha empresa </Popup>
                    </CircleMarker>
                  ) : null}
                  {product.map((v) => (
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
                        {v.order_location.client_city?.name} /{" "}
                        {v.order_location.client_city?.state?.acronym}{" "}
                      </Popup>
                    </CircleMarker>
                  ))}
                  <Button
                    className="btn-map-screen"
                    onClick={() => setOpen(true)}
                    type="text"
                  />
                </MapContainer>
              )
            ) : (
              <LoadItem type="alt" />
            )}
          </CardItem>
        </Col>
        {verifyConfig([`${permission}.edit`]) ? (
          <Col md={verifyConfig([`${permission}.edit`]) ? 8 : 24} xs={24}>
            <CardItem
              title={`Agendar entrega | ${product.length} selecionado(s)`}
            >
              <Form form={form} layout="vertical" onFinish={onSend}>
                <Form.Item
                  label="Data entrega"
                  name="scheduled_location_date"
                  rules={[{ required: true, message: "Campo obrigatório!" }]}
                >
                  <Input
                    max={"9999-12-31"}
                    min={new Date().toISOString().slice(0, 10)}
                    type="date"
                  />
                </Form.Item>
                <Form.Item
                  label="Motorista"
                  name="driver_id"
                  rules={[{ required: true, message: "Campo obrigatório!" }]}
                >
                  <SelectSearch
                    change={(v: any) =>
                      form.setFieldValue("driver_id", v?.value)
                    }
                    effect={driver}
                    labelField={["name", "cnh"]}
                    placeholder="Nome - CNH"
                    url="/driver"
                    value={form.getFieldValue("driver_id")}
                  />
                </Form.Item>
                <Form.Item
                  label="Veículo"
                  name="vehicle_id"
                  rules={[{ required: true, message: "Campo obrigatório!" }]}
                >
                  <SelectSearch
                    change={(v: any) =>
                      form.setFieldValue("vehicle_id", v?.value)
                    }
                    effect={vehicle}
                    labelField={["plate", "vehicle_type.name"]}
                    placeholder="Placa - Tipo"
                    url="/vehicle"
                    value={form.getFieldValue("vehicle_id")}
                  />
                </Form.Item>
                <Button
                  block
                  disabled={!(product.length > 0)}
                  htmlType="submit"
                  loading={loadingButton}
                  type="primary"
                >
                  Agendar
                </Button>
              </Form>
            </CardItem>
          </Col>
        ) : null}
        <Col md={24} xs={24}>
          <CardItem>
            <Table
              action={action}
              column={column}
              defaultFilter={{
                STATUS: OrderLocationProductStatusEnum.PENDING_DELIVERY,
              }}
              getList={(data: any) =>
                getProfileType() === "LEGAL_SELLER" ||
                getProfileType() === "SELLER" ||
                getProfileType() === "SELLER_DRIVER"
                  ? null
                  : setProduct(data)
              }
              path={"order_location_product"}
              type={type}
            />
          </CardItem>
        </Col>
      </Row>
      <MapFullScreen
        open={open}
        setOpen={setOpen}
        startStatus={[OrderLocationProductStatusEnum.PENDING_DELIVERY]}
      />
    </PageDefault>
  );
};

export default OrdemLocacaoEntregaPendente;
