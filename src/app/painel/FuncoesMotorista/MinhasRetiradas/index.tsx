// BIBLIOTECAS REACT

// ICONS
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Scanner } from "@yudiel/react-qr-scanner";
import {
  Alert,
  Button,
  Checkbox,
  Col,
  Input,
  InputNumber,
  Modal,
  message,
  Radio,
  Row,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  Upload,
} from "antd";
import ImgCrop from "antd-img-crop";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { Link } from "react-router-dom";
import CardItem from "../../../../components/CardItem";
import LoadItem from "../../../../components/LoadItem";
// COMPONENTES
import PageDefault from "../../../../components/PageDefault";
import Table from "../../../../components/Table";
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

import { MdCheckBoxOutlineBlank, MdOutlineCheckBox } from "react-icons/md";
import { OrderLocationProductStatusEnum } from "@/enums/order-location-product-status-enum";
import DrawerEndereco from "../../../../components/DrawerEndereco";
import MapFullScreen from "../../../../components/MapFullScreen";
import { TableTrMapProductButton } from "../../../../components/Table/buttons";

const MinhasRetiradas = ({ type, path, permission }: PageDefaultProps) => {
  // ESTADOS DO COMPONENTE
  const [loadingButton, setLoadingButton] = useState<boolean>(false);
  const [typeLoad, setTypeLoad] = useState<any>(null);
  const [address, setAddress] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState(false);
  const [modal, setModal] = useState(false);
  const [photoModal, setPhotoModal] = useState(false);
  const [loadMap, setLoadMap] = useState(false);
  const [coord, setCoord] = useState<any>(null);
  const [myCoord, setMyCoord] = useState<any>(null);
  const [product, setProduct] = useState<any[]>([]);
  const [tempProd, setTempProd] = useState<any>(null);
  const [fileList, setFileList] = useState<any[]>([]);
  const [productSelect, setProductSelect] = useState<any>(null);
  const [tabProduct, setTabProduct] = useState<string>("1");
  const [totalValue, setTotalValue] = useState<number>(0);
  const [classValue, setClassValue] = useState<any[]>([]);
  const [isFull, setIsFull] = useState(false);
  const [optionFinish, setOptionFinish] = useState<string>("");
  const [openModal, setOpenModal] = useState<boolean>(false);

  // SELECIONAR PARA INICIAR RETIRADA
  const onDelProduct = (item: any) => {
    var temp = product;
    temp = temp.filter((v) => Number(v.id) !== Number(item.id));
    setProduct(temp);
  };

  const onLoadMap = () => setLoadMap(!loadMap);

  // DEFINE COLUNAS DA TABELA
  const column = [
    {
      title: "Data Retirada",
      dataIndex: "DATETIME_UPDATE_FORMAT",
      table: "order_location_products.scheduled_withdrawal_date",
      width: "180px",
      sorter: true,
      align: "center",
      render: (item: any) => (
        <Row style={{ width: "100%" }}>
          <Col span={24}>
            <Typography style={{ textAlign: "center" }}>
              {item.scheduled_withdrawal_date_format}
            </Typography>
            {item.status.code ===
            OrderLocationProductStatusEnum.AWAITING_PICKUP ? (
              <Typography
                style={{ textAlign: "center", color: "var(--color02)" }}
              >
                {product.filter((v) => Number(v.id) === Number(item.id))
                  .length > 0
                  ? "Selecionada"
                  : "Não Selecionada"}
              </Typography>
            ) : (
              <Typography
                style={{ textAlign: "center", color: "var(--color02)" }}
              >
                {item.status.code ===
                OrderLocationProductStatusEnum.IN_TRANSIT_TO_PICKUP
                  ? "A caminho do cliente"
                  : "A caminho do destino"}
              </Typography>
            )}
          </Col>
        </Row>
      ),
    },
    {
      title: "Destino",
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
            <Typography>
              {item.status.code ===
                OrderLocationProductStatusEnum.AWAITING_PICKUP ||
              item.status.code ===
                OrderLocationProductStatusEnum.IN_TRANSIT_TO_PICKUP
                ? `Cliente: ${item.order_location.client.name}`
                : item.status.code ===
                    OrderLocationProductStatusEnum.IN_TRANSIT_TO_FINAL_DESTINATION
                  ? `Destino final: ${item.destination.name}`
                  : "-"}
            </Typography>
            <Typography style={{ color: "var(--color02)" }}>
              {item.status.code ===
                OrderLocationProductStatusEnum.AWAITING_PICKUP ||
              item.status.code ===
                OrderLocationProductStatusEnum.IN_TRANSIT_TO_PICKUP
                ? `${item.order_location.client_street}, ${item.order_location.client_number} - ${item.order_location.client_district} - ${item.order_location.client_city.name} / ${item.order_location.client_city.state.acronym}`
                : item.status.code ===
                    OrderLocationProductStatusEnum.IN_TRANSIT_TO_FINAL_DESTINATION
                  ? `${item.final_destination_street}, ${item.final_destination_number} - ${item.final_destination_district} - ${item.final_destination_city.name} / ${item.final_destination_city.state.acronym}`
                  : "-"}
            </Typography>
            <Typography style={{ color: "var(--color02)" }} />
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
      title: "Veículo",
      dataIndex: "CODE",
      table: "stationary_buckets.code",
      width: "180px",
      sorter: false,
      align: "center",
      render: (item: any) => (
        <Row justify={"center"} style={{ width: "100%" }}>
          {item.scheduled_withdrawal_date ? (
            <Typography>
              <Tag color="red">
                {item.vehicle_withdrawal.plate} -{" "}
                {item.vehicle_withdrawal.vehicle_type.name}
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
          {typeLoad === OrderLocationProductStatusEnum.AWAITING_PICKUP ? (
            product.filter((v) => Number(v.id) === Number(item.id)).length >
            0 ? (
              <Col>
                <Tooltip title="Deselecionar">
                  <MdOutlineCheckBox
                    className="actions-button"
                    onClick={() => onProduct(item)}
                    size={18}
                  />
                </Tooltip>
              </Col>
            ) : (
              <Col>
                <Tooltip title="Selecionar">
                  <MdCheckBoxOutlineBlank
                    className="actions-button"
                    onClick={() => onProduct(item)}
                    size={18}
                  />
                </Tooltip>
              </Col>
            )
          ) : null}
          <TableTrMapProductButton
            action={() => setAction(!action)}
            item={item}
            newId={item.id}
            path={path}
            permission={permission}
            type={type}
          />
        </Row>
      ),
    },
  ];

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
    if (typeLoad === OrderLocationProductStatusEnum.AWAITING_PICKUP) {
      GET_API(
        `/order_location_product?code=${result[0].rawValue}&status=${OrderLocationProductStatusEnum.AWAITING_PICKUP}`
      )
        .then((rs) => rs.json())
        .then((res) => {
          if (res.data.length > 0) {
            setTempProd(res.data[0]);
            onModal();
            onPhotoModal();
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
    if (typeLoad === OrderLocationProductStatusEnum.AWAITING_PICKUP) {
      GET_API(
        `/order_location_product?code=${result}&status=${OrderLocationProductStatusEnum.AWAITING_PICKUP}`
      )
        .then((rs) => rs.json())
        .then((res) => {
          if (res.data.length > 0) {
            setTempProd(res.data[0]);
            onModal();
            onPhotoModal();
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

  //  FUNÇÃO PARA INICIAR RETIRADA
  const onSend = () => {
    Modal.confirm({
      title: "Inicar retirada dos itens selecionados?",
      icon: <ExclamationCircleOutlined />,
      cancelText: "Não",
      okText: "Sim",
      onOk() {
        try {
          product.forEach((item) => {
            POST_API(
              "/order_location_product",
              { status: OrderLocationProductStatusEnum.IN_TRANSIT_TO_PICKUP },
              item.id
            )
              .then((rs) => {
                if (rs.ok) {
                  loadDelivery();
                  message.success({ content: "Retirada iniciada!" });
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
      },
      onCancel() {},
    });

    setLoadingButton(true);
  };

  const onFinish = () => {
    setLoadingButton(true);
    POST_API(
      "/order_location_product",
      {
        status: OrderLocationProductStatusEnum.IN_TRANSIT_TO_FINAL_DESTINATION,
      },
      productSelect.id
    )
      .then((rs) => {
        if (rs.ok) {
          POST_API("/mtr", {
            order_location_product_id: productSelect.id,
            meters: totalValue,
            items: JSON.stringify(Object.values(classValue)),
          })
            .then((rs) => {
              if (rs.ok) {
                fileList.forEach((item) => {
                  POST_API("/order_location_product_gallery", {
                    status: OrderLocationProductStatusEnum.AWAITING_PICKUP,
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
                Modal.success({
                  title: "Sucesso",
                  content: "Produto foi retirado e MTR foi emitido",
                });
                setAction(!action);
              } else {
                Modal.warning({
                  title: "Algo deu errado",
                  content: "Não foi possível emitir MTR",
                });
                return;
              }
            })
            .finally(() => setLoadingButton(false));
        } else {
          Modal.warning({
            title: "Algo deu errado",
            content: "Não foi possível retirar produto",
          });
        }
      })
      .catch(POST_CATCH);
  };

  const loadDelivery = () => {
    GET_API(
      `/order_location_product?statusIn=${OrderLocationProductStatusEnum.AWAITING_PICKUP},${OrderLocationProductStatusEnum.IN_TRANSIT_TO_FINAL_DESTINATION}&driver=true`
    )
      .then((rs) => rs.json())
      .then((res) => {
        if (res.data.length > 0) {
          setTypeLoad(OrderLocationProductStatusEnum.IN_TRANSIT_TO_PICKUP);
          setProduct(res.data);
        } else {
          setTypeLoad(OrderLocationProductStatusEnum.AWAITING_PICKUP);
          setProduct([]);
        }
      })
      .catch(POST_CATCH);
  };

  const onModal = () => {
    setModal(!modal);
  };

  const onPhotoModal = () => setPhotoModal(!photoModal);

  const onFinishProcess = () => {
    setLoadingButton(true);
    POST_API(
      "/order_location_product",
      { status: OrderLocationProductStatusEnum.AWAITING_ANALISYS },
      productSelect.id
    )
      .then((rs) => {
        if (rs.ok) {
          POST_API("/mtr", { status: "DELIVERED" }, productSelect.mtr.id);
          onPhotoModal();
          loadDelivery();
          Modal.success({ title: "Sucesso", content: "Processo finalizado" });
          setAction(!action);
        } else {
          Modal.warning({
            title: "Algo deu errado",
            content: "Não foi possível finalizar processo",
          });
        }
      })
      .catch(POST_CATCH)
      .finally(() => setLoadingButton(false));
  };

  useEffect(() => {
    load();
    // if (!navigator.geolocation) { Modal.error({title: 'Atenção', content: 'Seu navegador não suporta geolocalização, o que torna impossível a utilização do mapa'}) }
    // navigator.geolocation.getCurrentPosition((position) => setMyCoord([position.coords.latitude, position.coords.longitude]), () =>  Modal.warning({title: 'Atenção', content: 'Não foi possível recuperar sua localização'}) );
  }, []);

  useEffect(() => {
    onLoadMap();
  }, [coord, myCoord, product, productSelect]);

  useEffect(() => {
    setTabProduct("1");
    setFileList([]);
  }, [photoModal]);

  useEffect(() => {
    setClassValue([]);
    var temp: any = [];
    productSelect?.order_location.residues.map((value: any) => {
      temp.push({ residue_id: value.id, meters: null });
    });
    setClassValue(temp);
  }, [productSelect]);

  useEffect(() => {
    var newValue = 0;
    Object.keys(classValue).map((v: string, i) => {
      newValue += classValue[i]?.meters;
    });
    setTotalValue(newValue);
  }, [classValue]);

  useEffect(() => {
    setIsFull(
      productSelect?.product.stationary_bucket_group.stationary_bucket_type
        .m3 === totalValue
    );
  }, [totalValue]);

  useEffect(() => {
    if (
      isFull &&
      productSelect?.product.stationary_bucket_group.stationary_bucket_type
        .m3 !== totalValue
    ) {
      setTotalValue(
        productSelect?.product.stationary_bucket_group.stationary_bucket_type.m3
      );
    }
  }, [isFull]);

  useEffect(() => loadDelivery(), []);

  return (
    <PageDefault items={[{ title: "Retiradas Agendadas" }]} valid={"fmt.vrp"}>
      {typeLoad ? (
        <Row gutter={[16, 16]}>
          {typeLoad === OrderLocationProductStatusEnum.IN_TRANSIT_TO_PICKUP ? (
            <Col span={24}>
              <Alert
                description="Finalize a retirada para iniciar outra."
                message="Retirada iniciada"
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
                    {product.map((v) =>
                      v.status.code ===
                      OrderLocationProductStatusEnum.IN_TRANSIT_TO_FINAL_DESTINATION ? (
                        <CircleMarker
                          center={[
                            Number(v.final_destination_latitude),
                            Number(v.final_destination_longitude),
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
                            <br /> {v.final_destination_street},{" "}
                            {v.final_destination_number} -{" "}
                            {v.final_destination_district} -{" "}
                            {v.final_destination_city.name} /{" "}
                            {v.final_destination_city.state.acronym}{" "}
                          </Popup>
                        </CircleMarker>
                      ) : (
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
                      )
                    )}
                    <Button
                      className="btn-map-screen"
                      onClick={() => setOpenModal(true)}
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
                    {product.map((v) =>
                      v.status.code ===
                      OrderLocationProductStatusEnum.IN_TRANSIT_TO_FINAL_DESTINATION ? (
                        <CircleMarker
                          center={[
                            Number(v.final_destination_latitude),
                            Number(v.final_destination_longitude),
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
                            <br /> {v.final_destination_street},{" "}
                            {v.final_destination_number} -{" "}
                            {v.final_destination_district} -{" "}
                            {v.final_destination_city.name} /{" "}
                            {v.final_destination_city.state.acronym}{" "}
                          </Popup>
                        </CircleMarker>
                      ) : (
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
                      )
                    )}
                    <Button
                      className="btn-map-screen"
                      onClick={() => setOpenModal(true)}
                      type="text"
                    />
                  </MapContainer>
                )
              ) : (
                <LoadItem type="alt" />
              )}
              {productSelect?.order_location ? (
                productSelect?.status.code ===
                  OrderLocationProductStatusEnum.AWAITING_PICKUP ||
                productSelect?.status.code ===
                  OrderLocationProductStatusEnum.IN_TRANSIT_TO_PICKUP ? (
                  <Link
                    target="_blank"
                    to={`http://maps.google.com/?daddr=${productSelect.order_location.client_street},${productSelect.order_location.client_number} - ${productSelect.order_location.client_district} - ${productSelect.order_location.client_city.name} / ${productSelect.order_location.client_city.state.acronym}}`}
                  >
                    <img className="img-google" src={google} />
                  </Link>
                ) : productSelect?.status.code ===
                  OrderLocationProductStatusEnum.IN_TRANSIT_TO_FINAL_DESTINATION ? (
                  <Link
                    target="_blank"
                    to={`http://maps.google.com/?daddr=${productSelect.final_destination_street},${productSelect.final_destination_number} - ${productSelect.final_destination_district} - ${productSelect.final_destination_city.name} / ${productSelect.final_destination_city.state.acronym}}`}
                  >
                    <img className="img-google" src={google} />
                  </Link>
                ) : null
              ) : (
                "-"
              )}
            </CardItem>
          </Col>
          <Col md={8} xs={24}>
            <CardItem
              title={`${typeLoad === OrderLocationProductStatusEnum.AWAITING_PICKUP ? "Iniciar retirada" : "Retirada iniciada"} | ${product.length} selecionado(s)`}
            >
              <Radio.Group
                onChange={(v) => setProductSelect(v.target.value)}
                style={{ width: "100%" }}
                value={productSelect}
              >
                <Row gutter={[8, 8]} style={{ width: "100%" }}>
                  {product.map((v: any, i: any) => (
                    <Col key={v.id} span={24} style={{ display: "flex" }}>
                      {typeLoad ===
                      OrderLocationProductStatusEnum.IN_TRANSIT_TO_PICKUP ? (
                        <Radio value={v} />
                      ) : null}
                      <Typography>
                        {v.product.code}{" "}
                        {v.status.code ===
                        OrderLocationProductStatusEnum.AWAITING_PICKUP
                          ? ""
                          : v.status.code ===
                              OrderLocationProductStatusEnum.IN_TRANSIT_TO_PICKUP
                            ? " - A caminho"
                            : " - Retirada concluida, a caminho do destino final"}
                      </Typography>
                      {typeLoad ===
                      OrderLocationProductStatusEnum.AWAITING_PICKUP ? (
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
                  OrderLocationProductStatusEnum.AWAITING_PICKUP ? (
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
                        {productSelect?.status.code ===
                          OrderLocationProductStatusEnum.IN_TRANSIT_TO_FINAL_DESTINATION ||
                        productSelect?.status.code === "ETP"
                          ? "Descarregar produto"
                          : "Confirmar retirada"}
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
                    OrderLocationProductStatusEnum.AWAITING_PICKUP,
                    OrderLocationProductStatusEnum.IN_TRANSIT_TO_PICKUP,
                    OrderLocationProductStatusEnum.IN_TRANSIT_TO_FINAL_DESTINATION,
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
            destroyOnClose={true}
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
              {typeLoad === OrderLocationProductStatusEnum.AWAITING_PICKUP
                ? `${product.length} caçamba(s) selecionado(s)`
                : `Confirmar retirada de ${productSelect?.product.code}`}
            </Typography>
          </Modal>
          <Modal
            closable={false}
            destroyOnClose={true}
            footer={false}
            onCancel={onPhotoModal}
            open={photoModal}
            style={{ top: 20 }}
          >
            {productSelect?.status.code ===
              OrderLocationProductStatusEnum.IN_TRANSIT_TO_FINAL_DESTINATION ||
            productSelect?.status.code === "ETP" ? (
              <Row gutter={[8, 8]}>
                <Col span={24}>
                  <Typography style={{ fontWeight: 600, fontSize: "1.2em" }}>
                    Por favor, clique no botão abaixo para finalizar
                  </Typography>
                </Col>
                <Col span={12}>
                  <Button block onClick={onPhotoModal} type="default">
                    Cancelar
                  </Button>
                </Col>
                <Col span={12}>
                  <Button
                    block
                    loading={loadingButton}
                    onClick={onFinishProcess}
                    type="primary"
                  >
                    Finalizar
                  </Button>
                </Col>
              </Row>
            ) : (
              <Tabs activeKey={tabProduct}>
                <Tabs.TabPane key={"1"} tabKey={"1"}>
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
                        onClick={() => setTabProduct("2")}
                        type="primary"
                      >
                        Continuar
                      </Button>
                    </Col>
                  </Row>
                </Tabs.TabPane>
                <Tabs.TabPane key={"2"} tabKey={"2"}>
                  <Row gutter={[8, 8]}>
                    <Col span={24}>
                      <Checkbox
                        checked={isFull}
                        onChange={(e) => setIsFull(e.target.checked)}
                      >
                        Caçamba está cheia?
                      </Checkbox>
                    </Col>
                    {productSelect?.order_location.residues.map(
                      (value: any, index: number) => (
                        <Col key={`residueproduct${value.id}`} span={24}>
                          <InputNumber
                            addonAfter="m³"
                            addonBefore={
                              <Typography style={{ width: 100 }}>
                                {value.name}
                              </Typography>
                            }
                            max={
                              productSelect?.product.stationary_bucket_group
                                .stationary_bucket_type.m3
                            }
                            onChange={(v) =>
                              setClassValue({
                                ...classValue,
                                [index]: { residue_id: value.id, meters: v },
                              })
                            }
                            placeholder={
                              productSelect?.order_location.residues.length > 1
                                ? "Caso não saiba, mantenha vazio"
                                : "Valor obrigatório"
                            }
                            style={{ width: "100%" }}
                            value={classValue?.[index]?.meters}
                          />
                        </Col>
                      )
                    )}
                    <Col span={24}>
                      <InputNumber
                        addonAfter="m³"
                        addonBefore={
                          <Typography style={{ width: 100 }}>Total</Typography>
                        }
                        className="p-inputnumber"
                        max={
                          productSelect?.product.stationary_bucket_group
                            .stationary_bucket_type.m3
                        }
                        onChange={(v) => setTotalValue(v)}
                        placeholder="Valor obrigatório"
                        readOnly
                        style={{ width: "100%" }}
                        value={totalValue}
                      />
                    </Col>
                    <Col span={12}>
                      <Button
                        block
                        onClick={() => setTabProduct("1")}
                        type="default"
                      >
                        Voltar
                      </Button>
                    </Col>
                    <Col span={12}>
                      <Button
                        block
                        loading={loadingButton}
                        onClick={onFinish}
                        type="primary"
                      >
                        Finalizar retirada
                      </Button>
                    </Col>
                  </Row>
                </Tabs.TabPane>
              </Tabs>
            )}
          </Modal>
        </Row>
      ) : (
        <Row>
          <Col span={24}>
            <LoadItem />
          </Col>
        </Row>
      )}
      <DrawerEndereco
        address={address}
        close={() => setOpen(false)}
        open={open}
        setAddress={setAddress}
      />
      <MapFullScreen
        drive={true}
        open={openModal}
        setOpen={setOpenModal}
        startStatus={[
          OrderLocationProductStatusEnum.AWAITING_PICKUP,
          OrderLocationProductStatusEnum.IN_TRANSIT_TO_PICKUP,
          OrderLocationProductStatusEnum.IN_TRANSIT_TO_FINAL_DESTINATION,
        ]}
      />
    </PageDefault>
  );
};

export default MinhasRetiradas;
