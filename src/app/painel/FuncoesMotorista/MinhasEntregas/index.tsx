import { Scanner } from "@yudiel/react-qr-scanner";
import {
  Alert,
  Button,
  Col,
  Input,
  Modal,
  message,
  Radio,
  Row,
  Tag,
  Typography,
  Upload,
} from "antd";
import ImgCrop from "antd-img-crop";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { Link } from "react-router-dom";
import { OrderLocationProductStatusEnum } from "@/enums/order-location-product-status-enum";
import CardItem from "../../../../components/CardItem";
import LoadItem from "../../../../components/LoadItem";
import MapFullScreen from "../../../../components/MapFullScreen";
// COMPONENTES
import PageDefault from "../../../../components/PageDefault";
import Table from "../../../../components/Table";
import { TableTrMapProductButton } from "../../../../components/Table/buttons";
// SERVIÇOS
import {
  GET_API,
  getProfileID,
  getToken,
  type PageDefaultProps,
  POST_API,
  POST_CATCH,
  UPLOAD_API,
} from "../../../../services";

// GOOGLE MAPS
const google = `${import.meta.env.VITE_URL_ASSETS}/google-maps.png`;

const MinhasEntregas = ({ type, path, permission }: PageDefaultProps) => {
  // ESTADOS DO COMPONENTE
  const [loadingButton, setLoadingButton] = useState<boolean>(false);
  const [typeLoad, setTypeLoad] = useState<any>(null);
  const [action, setAction] = useState(false);
  const [modal, setModal] = useState(false);
  const [photoModal, setPhotoModal] = useState(false);
  const [loadMap, setLoadMap] = useState(false);
  const [coord, setCoord] = useState<any>(null);
  const [myCoord, setMyCoord] = useState<any>(null);
  const [product, setProduct] = useState<any[]>([]);
  const [fileList, setFileList] = useState<any[]>([]);
  const [productSelect, setProductSelect] = useState<any>(null);
  const [open, setOpen] = useState<boolean>(false);

  const onProduct = (item: any) => {
    const temp = product;

    if (temp.filter((v) => Number(v.ID) === Number(item.ID)).length > 0) {
      message.warning({ content: "Caçamba já selecionada", key: "09op" });
    } else {
      temp.push(item);
    }

    setProduct(temp);
  };

  const onDelProduct = (item: any) => {
    const temp = product;

    if (temp.filter((v) => Number(v.ID) === Number(item.ID)).length > 0) {
      temp.splice(temp.indexOf(item), 1);
    }

    setProduct(temp);
  };

  const onLoadMap = () => setLoadMap(!loadMap);

  // DEFINE COLUNAS DA TABELA
  const column = [
    {
      title: "Data Entrega",
      dataIndex: "DATETIME_UPDATE_FORMAT",
      table: "order_location_products.scheduled_location_date",
      width: "180px",
      sorter: true,
      align: "center",
      render: (item: any) => (
        <Row style={{ width: "100%" }}>
          <Col span={24}>
            <Typography style={{ textAlign: "center" }}>
              {item.scheduled_location_date_format}
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
      title: "Cliente",
      dataIndex: "CLIENT_NAME",
      table: "client.NAME",
      width: "auto",
      minWidth: "300px",
      sorter: false,
      align: "left",
      render: (item: any) => (
        <Row style={{ width: "100%" }}>
          <Col span={24}>
            <Typography>Pedido: n° {item.order_location_id}</Typography>
            <Typography>{item.order_location?.client.name}</Typography>
            <Typography style={{ color: "var(--color02)" }}>
              {item.order_location?.client_street},{" "}
              {item.order_location?.client_number} -{" "}
              {item.order_location?.client_district} -{" "}
              {item.order_location?.client_city?.name} /{" "}
              {item.order_location?.client_city?.state.acronym}
            </Typography>
          </Col>
        </Row>
      ),
    },
    {
      title: "Código Caçamba",
      dataIndex: "CODE",
      table: "stationary_bucket.CODE",
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
      dataIndex: "order_location?.distance",
      width: "180px",
      sorter: false,
      align: "center",
      render: (item: any) => (
        <Row justify={"center"} style={{ width: "100%" }}>
          <Typography style={{ textAlign: "center" }}>
            {item.order_location?.distance} km
          </Typography>
        </Row>
      ),
    },
    {
      title: "Veículo",
      dataIndex: "CODE",
      table: "stationary_bucket.CODE",
      width: "180px",
      sorter: false,
      align: "center",
      render: (item: any) => (
        <Row justify={"center"} style={{ width: "100%" }}>
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

  const reader = (result: any) => {
    if (typeLoad === OrderLocationProductStatusEnum.PENDING_DELIVERY) {
      GET_API(
        `/order_location_product?code=${result[0].rawValue}&status=${OrderLocationProductStatusEnum.PENDING_DELIVERY}`
      )
        .then((rs) => rs.json())
        .then((res) => {
          if (res.data.length > 0) {
            onProduct(res.data[0]);
            onModal();
            message.success({ content: "Caçamba selecionada", key: "09op" });
          } else {
            message.error({ content: "Caçamba não encontrada", key: "09op" });
          }
        })
        .catch(POST_CATCH);
    } else if (result[0].rawValue === productSelect?.product.code) {
      onModal();
      onPhotoModal();
    } else {
      message.error({ content: "Caçamba inválida", key: "09op" });
    }
  };

  const readerWrite = (result: any) => {
    if (typeLoad === OrderLocationProductStatusEnum.PENDING_DELIVERY) {
      GET_API(
        `/order_location_product?code=${result}&status=${OrderLocationProductStatusEnum.PENDING_DELIVERY}`
      )
        .then((rs) => rs.json())
        .then((res) => {
          if (res.data.length > 0) {
            onProduct(res.data[0]);
            onModal();
            message.success({ content: "Caçamba selecionada", key: "09op" });
          } else {
            message.error({ content: "Caçamba não encontrada", key: "09op" });
          }
        })
        .catch(POST_CATCH);
    } else if (result === productSelect.product.code) {
      onModal();
      onPhotoModal();
    } else {
      message.error({ content: "Caçamba inválida", key: "09op" });
    }
  };

  const onSend = async (values: any) => {
    setLoadingButton(true);

    try {
      await product.forEach((item) => {
        POST_API(
          "/order_location_product",
          { status: OrderLocationProductStatusEnum.IN_TRANSIT_TO_RENTAL },
          item.id
        )
          .then((rs) => {
            if (rs.ok) {
              loadDelivery();
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
      setProduct([]);
      setAction(!action);
      setLoadingButton(false);
    }
  };

  const onFinish = () => {
    setLoadingButton(true);
    POST_API(
      "/order_location_product",
      { status: OrderLocationProductStatusEnum.RENTED },
      productSelect.id
    )
      .then((rs) => {
        if (rs.ok) {
          fileList.forEach((item) => {
            POST_API("/order_location_product_gallery", {
              status: OrderLocationProductStatusEnum.RENTED,
              order_location_product_id: productSelect.id,
              url: item.response.url,
            }).then((rs) => {
              if (!rs.ok) {
                Modal.warning({
                  title: "Algo deu errado",
                  content: "Não foi possível salvar imagem",
                });
                return;
              }
            });
          });

          onPhotoModal();
          loadDelivery();
          Modal.success({ title: "Sucesso", content: "Produto locado" });
          setAction(!action);
        } else {
          Modal.warning({
            title: "Algo deu errado",
            content: "Não foi possível locar produto",
          });
        }
      })
      .catch(POST_CATCH)
      .finally(() => setLoadingButton(false));
  };

  const loadDelivery = () => {
    GET_API(
      `/order_location_product?status=${OrderLocationProductStatusEnum.IN_TRANSIT_TO_RENTAL}&driver=true`
    )
      .then((rs) => rs.json())
      .then((res) => {
        if (res.data.length > 0) {
          setTypeLoad(OrderLocationProductStatusEnum.IN_TRANSIT_TO_RENTAL);
          setProduct(res.data);
        } else {
          setTypeLoad(OrderLocationProductStatusEnum.PENDING_DELIVERY);
          setProduct([]);
        }
      })
      .catch(POST_CATCH);
  };

  const onModal = () => setModal(!modal);
  const onPhotoModal = () => setPhotoModal(!photoModal);

  useEffect(() => {
    load();
    // if (!navigator.geolocation) { Modal.error({title: 'Atenção', content: 'Seu navegador não suporta geolocalização, o que torna impossível a utilização do mapa'}) }
    // navigator.geolocation.getCurrentPosition((position) => setMyCoord([position.coords.latitude, position.coords.longitude]), () =>  Modal.warning({title: 'Atenção', content: 'Não foi possível recuperar sua localização'}) );
  }, []);

  useEffect(() => {
    onLoadMap();
  }, [coord, myCoord, product, productSelect]);

  useEffect(() => loadDelivery(), []);

  return (
    <PageDefault items={[{ title: "Entregas Agendadas" }]} valid={"fmt.vep"}>
      {typeLoad ? (
        <Row gutter={[16, 16]}>
          {typeLoad === OrderLocationProductStatusEnum.IN_TRANSIT_TO_RENTAL ? (
            <Col span={24}>
              <Alert
                description="Finalize a entrega para iniciar outra."
                message="Entrega iniciada"
                showIcon
                type="info"
              />
            </Col>
          ) : null}
          <Col md={16} xs={24}>
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
                    <CircleMarker
                      center={[Number(coord[0]), Number(coord[1])]}
                      pathOptions={{ color: "blue" }}
                      radius={10}
                    >
                      <Popup> Minha empresa </Popup>
                    </CircleMarker>
                    {product.map((v) => (
                      <CircleMarker
                        center={[
                          Number(v.order_location?.client_latitude),
                          Number(v.order_location?.client_longitude),
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
                          <br /> {v.order_location?.client_street},{" "}
                          {v.order_location?.client_number} -{" "}
                          {v.order_location?.client_district} -{" "}
                          {v.order_location?.client_city?.name} /{" "}
                          {v.order_location?.client_city?.state.acronym}{" "}
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
                    <CircleMarker
                      center={[Number(coord[0]), Number(coord[1])]}
                      pathOptions={{ color: "blue" }}
                      radius={10}
                    >
                      <Popup> Minha empresa </Popup>
                    </CircleMarker>
                    {product.map((v) => (
                      <CircleMarker
                        center={[
                          Number(v.order_location?.client_latitude),
                          Number(v.order_location?.client_longitude),
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
                          <br /> {v.order_location?.client_street},{" "}
                          {v.order_location?.client_number} -{" "}
                          {v.order_location?.client_district} -{" "}
                          {v.order_location?.client_city?.name} /{" "}
                          {v.order_location?.client_city?.state.acronym}{" "}
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
              {productSelect?.order_location ? (
                <Link
                  target="_blank"
                  to={`http://maps.google.com/?daddr=${productSelect.order_location?.client_street},${productSelect.order_location?.client_number} - ${productSelect.order_location?.client_district} - ${productSelect.order_location?.client_city?.name} / ${productSelect.order_location?.client_city?.state.acronym}}`}
                >
                  <img alt="google" className="img-google" src={google} />
                </Link>
              ) : null}
            </CardItem>
          </Col>
          <Col md={8} xs={24}>
            <CardItem
              title={`${typeLoad === OrderLocationProductStatusEnum.PENDING_DELIVERY ? "Iniciar entrega" : "Entrega iniciada"} | ${product.length} selecionado(s)`}
            >
              <Radio.Group
                onChange={(v) => setProductSelect(v.target.value)}
                style={{ width: "100%" }}
                value={productSelect}
              >
                <Row gutter={[8, 8]} style={{ width: "100%" }}>
                  {product.map((v: any) => (
                    <Col key={v.id} span={24} style={{ display: "flex" }}>
                      {typeLoad ===
                      OrderLocationProductStatusEnum.IN_TRANSIT_TO_RENTAL ? (
                        <Radio value={v} />
                      ) : null}
                      <Typography>{v.product.code}</Typography>
                      {typeLoad ===
                      OrderLocationProductStatusEnum.PENDING_DELIVERY ? (
                        <IoClose
                          onClick={() => onDelProduct(v)}
                          style={{
                            position: "absolute",
                            right: "0.4em",
                            top: "0.4em",
                            cursor: "pointer",
                          }}
                        />
                      ) : null}
                    </Col>
                  ))}
                  {typeLoad ===
                  OrderLocationProductStatusEnum.PENDING_DELIVERY ? (
                    <>
                      <Col span={12}>
                        <Button block onClick={onModal} type="default">
                          Ler QRcode
                        </Button>
                      </Col>
                      <Col span={12}>
                        <Button
                          block
                          disabled={!(product.length > 0)}
                          loading={loadingButton}
                          onClick={onSend}
                          type="primary"
                        >
                          Iniciar
                        </Button>
                      </Col>
                    </>
                  ) : (
                    <Col span={24}>
                      <Button
                        block
                        disabled={!(productSelect?.id > 0)}
                        onClick={onModal}
                        type="primary"
                      >
                        Confirmar entrega
                      </Button>
                    </Col>
                  )}
                </Row>
              </Radio.Group>
            </CardItem>
          </Col>
          <Col md={24} xs={24}>
            <CardItem>
              <Table
                action={action}
                column={column}
                defaultFilter={{
                  statusIn: [
                    OrderLocationProductStatusEnum.PENDING_DELIVERY,
                    OrderLocationProductStatusEnum.IN_TRANSIT_TO_RENTAL,
                  ],
                  driver: true,
                }}
                path={"order_location_product"}
                type={type}
              />
            </CardItem>
          </Col>
          <Modal
            closable={false}
            destroyOnClose
            footer={false}
            onCancel={onModal}
            open={modal}
            style={{ top: 20 }}
          >
            <Scanner onScan={reader} styles={{ container: { height: 472 } }} />
            <Input.Search
              enterButton="Procurar caçamba"
              onSearch={readerWrite}
              placeholder="Pesquisar código caçamba"
              size="large"
              style={{ marginTop: 10 }}
            />
            <Typography
              style={{
                textAlign: "center",
                fontSize: "1.4em",
                marginTop: "1em",
                color: "var(--color02)",
              }}
            >
              {" "}
              {typeLoad === OrderLocationProductStatusEnum.PENDING_DELIVERY
                ? `${product.length} caçamba(s) selecionado(s)`
                : `Confirmar entrega de ${productSelect?.product.code}`}
            </Typography>
          </Modal>
          <Modal
            closable={false}
            destroyOnClose
            footer={false}
            onCancel={onPhotoModal}
            open={photoModal}
            style={{ top: 20 }}
          >
            <Row gutter={[8, 8]}>
              <Col span={24}>
                <ImgCrop
                  modalCancel="Cancelar"
                  modalOk="Ok"
                  modalTitle="Editar imagem"
                >
                  <Upload
                    action={UPLOAD_API}
                    headers={{
                      Authorization: `Bearer ${getToken()}`,
                      Profile: getProfileID(),
                    }}
                    listType="picture"
                    onChange={({ fileList: newFileList }) => {
                      setFileList(newFileList);
                    }}
                  >
                    <Button block type="default">
                      Selecionar fotos
                    </Button>
                  </Upload>
                </ImgCrop>
              </Col>
              <Col span={12}>
                <Button block onClick={onPhotoModal} type="default">
                  Cancelar
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  block
                  disabled={!(fileList.length > 0)}
                  loading={loadingButton}
                  onClick={onFinish}
                  type="primary"
                >
                  Finalizar entrega
                </Button>
              </Col>
            </Row>
          </Modal>
        </Row>
      ) : (
        <Row>
          <Col span={24}>
            <LoadItem />
          </Col>
        </Row>
      )}
      <MapFullScreen
        drive={true}
        open={open}
        setOpen={setOpen}
        startStatus={[
          OrderLocationProductStatusEnum.PENDING_DELIVERY,
          OrderLocationProductStatusEnum.IN_TRANSIT_TO_RENTAL,
        ]}
      />
    </PageDefault>
  );
};

export default MinhasEntregas;
