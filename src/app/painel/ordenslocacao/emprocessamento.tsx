// BIBLIOTECAS REACT

import { ExclamationCircleOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Divider,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Row,
  Tag,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { IoClose, IoDocumentAttachOutline } from "react-icons/io5";
import { MdCheckBoxOutlineBlank, MdOutlineCheckBox } from "react-icons/md";
import { TbCamera } from "react-icons/tb";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import CardItem from "../../../components/CardItem";
import LoadItem from "../../../components/LoadItem";
import MapFullScreen from "../../../components/MapFullScreen";
// COMPONENTES
import PageDefault from "../../../components/PageDefault";
import SelectSearch from "../../../components/SelectSearch";
import Table from "../../../components/Table";
import { TableTrMapProductButton } from "../../../components/Table/buttons";
// SERVIÇOS
import {
  GET_API,
  getProfileType,
  type PageDefaultProps,
  POST_API,
  POST_CATCH,
  verifyConfig,
} from "../../../services";

const OrdemLocacaoEmProcessamento = ({
  type,
  path,
  permission,
}: PageDefaultProps) => {
  // ESTADOS DO COMPONENTE
  const [loadingButton, setLoadingButton] = useState(false);
  const [action, setAction] = useState(false);
  const [loadMap, setLoadMap] = useState(false);
  const [modalGallery, setModalGallery] = useState(false);
  const [coord, setCoord] = useState<any>(null);
  const [product, setProduct] = useState<any[]>([]);
  const [productSelect, setProductSelect] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [residue, setResidue] = useState<any[]>([]);
  const [mtr, setmtr] = useState<any>();
  const [open, setOpen] = useState<boolean>(false);

  const [modalForm, setModalForm] = useState(false);
  const [modal, setModal] = useState(false);
  const [file, setFile] = useState<any>("");

  const [modelValue, setModelValue] = useState<any>();

  const openPDF = (url: string) => {
    setFile(url);
    setModal(true);
  };

  const [destination] = useState<any>("");
  const [driver] = useState<any>("");
  const [vehicle] = useState<any>("");
  const [model] = useState<any>("");

  const onLoadMap = () => setLoadMap(!loadMap);
  const onModalGallery = () => setModalGallery(!modalGallery);
  const onModalForm = () => {
    setResidue([]);
    var temp: any = [];
    productSelect.map((v, i) =>
      v.mtr.items.map((v1: any) => {
        if (
          temp.filter((item: any) => item.residue_id === v1.residue_id).length >
          0
        ) {
        } else {
          temp.push(v1);
        }
      })
    );
    setTimeout(() => {
      setResidue(temp);
      setModalForm(!modalForm);
    }, 500);
  };

  const [form] = Form.useForm();

  const onProduct = (item: any) => {
    onLoadMap();

    var temp = productSelect;

    if (temp.filter((v) => Number(v.id) === Number(item.id)).length > 0) {
      temp.splice(temp.indexOf(item), 1);
    } else {
      temp.push(item);
    }

    setProductSelect(temp);

    onLoadMap();
  };

  // DEFINE COLUNAS DA TABELA
  const column = [
    {
      title: "Data Retirada",
      dataIndex: "DATETIME_UPDATE_FORMAT",
      table: "order_locations.created_at",
      width: "180px",
      sorter: true,
      align: "center",
      render: (item: any) => (
        <Row style={{ width: "100%" }}>
          <Col span={24}>
            <Typography style={{ textAlign: "center" }}>
              {item.withdraw_date_format}
            </Typography>
            <Typography>
              <center>
                <Tag color={item.status.color} style={{ margin: 0 }}>
                  {item.status.name}
                </Tag>
              </center>
            </Typography>
          </Col>
        </Row>
      ),
    },
    {
      title: "Local destino",
      dataIndex: "CLIENT_NAME",
      table: "order_locations.id",
      width: "auto",
      minWidth: "300px",
      sorter: true,
      align: "left",
      render: (item: any) => (
        <Row style={{ width: "100%" }}>
          <Col span={24}>
            <Typography>MTR: n° {item.mtr.id}</Typography>
            {getProfileType() === "LEGAL_SELLER" ||
            getProfileType() === "SELLER" ||
            getProfileType() === "SELLER_DRIVER" ? (
              <Typography>{item.order_location.client.name}</Typography>
            ) : null}
            <Typography style={{ color: "var(--color02)" }}>
              {item.order_location.provider_street},{" "}
              {item.order_location.provider_number} -{" "}
              {item.order_location.provider_district} -{" "}
              {item.order_location.provider_city?.name} /{" "}
              {item.order_location.provider_city?.state.acronym}
            </Typography>
          </Col>
        </Row>
      ),
    },
    {
      title: "Código Caçamba",
      dataIndex: "CODE",
      table: "stationary_bucket.CODE",
      width: "200px",
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
            {(getProfileType() === "LEGAL_SELLER" ||
              getProfileType() === "SELLER" ||
              getProfileType() === "SELLER_DRIVER") &&
            item.product.status.code !== "D" ? (
              <Tag
                color={item.product.status.color}
                onClick={() =>
                  item.product.status.code === "ML"
                    ? null
                    : updateStationary(item.product)
                }
                style={{ cursor: "pointer" }}
              >
                {" "}
                {item.product.status.code === "ML"
                  ? item.product.status.name
                  : "Enviar para Manutenção e Limpeza"}{" "}
              </Tag>
            ) : null}
          </Col>
        </Row>
      ),
    },
    {
      title: "Locação",
      dataIndex: "CODE",
      table: "stationary_bucket.CODE",
      width: "180px",
      sorter: false,
      align: "center",
      render: (item: any) => (
        <Row justify={"center"} style={{ width: "100%" }}>
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
      title: "Retirada",
      dataIndex: "CODE",
      table: "stationary_bucket.CODE",
      width: "180px",
      sorter: false,
      align: "center",
      render: (item: any) => (
        <Row justify={"center"} style={{ width: "100%" }}>
          {item.delivery_withdrawl_date ? (
            <Typography>
              <Tag color="green">
                {item.driver_withdraw.name} - {item.driver_withdraw.cnh}
              </Tag>
            </Typography>
          ) : null}
          {item.delivery_withdrawl_date ? (
            <Typography>
              <Tag color="red">
                {item.vehicle_withdraw.plate} -{" "}
                {item.vehicle_withdraw.vehicle_type.name}
              </Tag>
            </Typography>
          ) : null}
        </Row>
      ),
    },
    {
      title: "Ações",
      dataIndex: null,
      width: "120px",
      sorter: false,
      align: "center",
      render: (item: any) => (
        <Row justify={"center"} style={{ width: "100%" }}>
          {getProfileType() === "LEGAL_SELLER" ||
          getProfileType() === "SELLER" ||
          getProfileType() === "SELLER_DRIVER" ? (
            verifyConfig([`${permission}.edit`]) ? (
              productSelect.filter((v) => Number(v.id) === Number(item.id))
                .length > 0 ? (
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
            ) : null
          ) : null}
          <Col>
            <IoDocumentAttachOutline
              className="actions-button"
              onClick={() => openPDF(item.mtr.link)}
              size={18}
            />
          </Col>
          {getProfileType() === "LEGAL_SELLER" ||
          getProfileType() === "SELLER" ||
          getProfileType() === "SELLER_DRIVER" ? (
            <Col>
              <TbCamera
                className="actions-button"
                onClick={() => openGallery(item)}
                size={18}
              />
            </Col>
          ) : null}
          <TableTrMapProductButton
            item={item}
            path={path}
            permission={permission}
            type={type}
          />
        </Row>
      ),
    },
  ];

  const updateStationary = (item: any) => {
    Modal.confirm({
      title: "Enivar caçamba para manutanção e limpeza?",
      icon: <ExclamationCircleOutlined />,
      cancelText: "Não",
      okText: "Sim",
      onOk() {
        POST_API("/stationary_bucket", { status: "ML" }, item.id)
          .then((rs) => {
            if (rs.ok) {
              setAction(!action);
              Modal.success({
                title: "Sucesso",
                content: "Caçamba atualizada com sucesso",
              });
            } else {
              Modal.warning({
                title: "Algo deu errado",
                content: "Não foi possível atualizar caçamba",
              });
            }
          })
          .catch(POST_CATCH);
      },
    });
  };

  const openGallery = (item: any) => {
    setGallery([]);
    onModalGallery();
    GET_API(
      `/order_location_product_gallery?orderLocationProductId=${item.id}&status=AR`
    )
      .then((rs) => rs.json())
      .then((res: any) => {
        setGallery(res.data);
      })
      .catch(POST_CATCH);
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

  const onSend = (values: any) => {
    var valores: any = [];
    Object.keys(mtr).map((v) => {
      valores.push({ id: v, meters: mtr[v] });
    });

    var uuid: any = [];
    productSelect.map((v) => {
      uuid.push(v.mtr.id);
    });

    console.log(uuid);
    setLoadingButton(true);

    try {
      productSelect.forEach((item) => {
        POST_API(
          "/order_location_product",
          { ...values, status: "ADF" },
          item.id
        )
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

      POST_API("/final_mtr", {
        mtrs: uuid,
        residues: JSON.stringify(valores),
      }).then((rs) => {
        if (rs.ok) {
          form.resetFields();
          setProductSelect([]);
          setAction(!action);
        } else {
          Modal.warning({
            title: "Algo deu errado",
            content: "Não foi possível emitir MTR Final",
          });
          return;
        }
      });
    } catch (error) {
      POST_CATCH();
    } finally {
      setLoadingButton(false);
    }
  };

  useEffect(() => load(), []);
  useEffect(() => onLoadMap(), [product]);

  return (
    <PageDefault
      items={[{ title: "Em processamento" }]}
      valid={`${permission}.list`}
    >
      <Row gutter={[16, 16]}>
        <Col
          md={
            (getProfileType() === "LEGAL_SELLER" ||
              getProfileType() === "SELLER" ||
              getProfileType() === "SELLER_DRIVER") &&
            verifyConfig([`${permission}.edit`])
              ? 16
              : 24
          }
          xs={24}
        >
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
                  {product.map((v, i) => (
                    <CircleMarker
                      center={[
                        Number(v.order_location.provider_latitude),
                        Number(v.order_location.provider_longitude),
                      ]}
                      key={i}
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
                        <br /> {v.order_location.provider_street},{" "}
                        {v.order_location.provider_number} -{" "}
                        {v.order_location.provider_district} -{" "}
                        {v.order_location.provider_city?.name} /{" "}
                        {v.order_location.provider_city?.state.acronym}{" "}
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
                  {product.map((v, i) => (
                    <CircleMarker
                      center={[
                        Number(v.order_location.provider_latitude),
                        Number(v.order_location.provider_longitude),
                      ]}
                      key={i}
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
                        <br /> {v.order_location.provider_street},{" "}
                        {v.order_location.provider_number} -{" "}
                        {v.order_location.provider_district} -{" "}
                        {v.order_location.provider_city?.name} /{" "}
                        {v.order_location.provider_city?.state.acronym}{" "}
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
        {(getProfileType() === "LEGAL_SELLER" ||
          getProfileType() === "SELLER" ||
          getProfileType() === "SELLER_DRIVER") &&
        verifyConfig([`${permission}.edit`]) ? (
          <Col md={verifyConfig([`${permission}.edit`]) ? 8 : 24} xs={24}>
            <CardItem
              title={`Enviar para Destino Final | ${productSelect.length} selecionado(s)`}
            >
              <Row gutter={[8, 8]}>
                {productSelect.map((v: any, i: any) => (
                  <Col key={i} span={24} style={{ display: "flex" }}>
                    <Typography>MTR nº {v.mtr.id}</Typography>
                    <IoClose
                      onClick={() => onProduct(v)}
                      style={{
                        position: "absolute",
                        right: "0.4em",
                        top: "0.4em",
                        cursor: "pointer",
                      }}
                    />
                  </Col>
                ))}
                <Col span={24}>
                  <Button
                    block
                    disabled={!(productSelect.length > 0)}
                    loading={loadingButton}
                    onClick={onModalForm}
                    type="primary"
                  >
                    Gerar MTR final e agendar destino final
                  </Button>
                </Col>
              </Row>
            </CardItem>
          </Col>
        ) : null}
        <Col md={24} xs={24}>
          <CardItem>
            <Table
              action={action}
              column={column}
              defaultFilter={{ statusIn: "ETP,EPRC" }}
              getList={setProduct}
              path={"order_location_product"}
              type={type}
            />
          </CardItem>
        </Col>
      </Row>
      <Modal
        footer={false}
        onCancel={onModalGallery}
        open={modalGallery}
        style={{ top: 20 }}
        title="Fotos da retirada"
      >
        <Row gutter={[8, 8]}>
          {gallery.length === 0 ? (
            <Col span={24}>
              <LoadItem type="alt" />
            </Col>
          ) : (
            gallery.map((v, i) => (
              <Col key={i} span={12}>
                <Image src={v.url} />
              </Col>
            ))
          )}
        </Row>
      </Modal>
      <Modal
        destroyOnClose
        footer={false}
        onCancel={() => setModal(false)}
        open={modal}
        style={{ top: 20 }}
        width={"100%"}
      >
        <Row>
          <Col span={24}>
            <object>
              <embed
                height="600"
                id="pdfID"
                src={`${file}`}
                type="text/html"
                width="100%"
              />
            </object>
          </Col>
        </Row>
      </Modal>
      <Modal
        destroyOnClose
        footer={false}
        onCancel={() => setModalForm(false)}
        open={modalForm}
        style={{ top: 20 }}
        title={"Gerar MTR final e agendar destino final"}
        width={"90%"}
      >
        <Form form={form} layout="vertical" onFinish={onSend}>
          <Row gutter={[8, 4]}>
            <Col span={24}>
              <Divider orientation="left">Dados agendamento</Divider>
            </Col>
            <Col lg={4} md={6} sm={8} xl={3} xs={24}>
              <Form.Item
                label="Data envio"
                name="delivery_final_destination"
                rules={[{ required: true, message: "Campo obrigatório!" }]}
              >
                <Input
                  min={new Date().toISOString().slice(0, 10)}
                  type="date"
                />
              </Form.Item>
            </Col>
            <Col lg={20} md={18} sm={16} xl={21} xs={24}>
              <Form.Item
                label="Destino final"
                name="destination_id"
                rules={[{ required: true, message: "Campo obrigatório!" }]}
              >
                <SelectSearch
                  change={(v: any) =>
                    form.setFieldValue("destination_id", v?.value)
                  }
                  effect={destination}
                  labelField={["name", "document_number"]}
                  placeholder="Nome - Documento"
                  url="/final_destination"
                  value={form.getFieldValue("destination_id")}
                />
              </Form.Item>
            </Col>
            <Col lg={5} md={5} sm={12} xl={5} xs={24}>
              <Form.Item
                label="Motorista"
                name="final_destination_driver_id"
                rules={[{ required: true, message: "Campo obrigatório!" }]}
              >
                <SelectSearch
                  change={(v: any) =>
                    form.setFieldValue("final_destination_driver_id", v?.value)
                  }
                  effect={driver}
                  labelField={["name", "cnh"]}
                  placeholder="Nome - CNH"
                  url="/driver"
                  value={form.getFieldValue("final_destination_driver_id")}
                />
              </Form.Item>
            </Col>
            <Col lg={5} md={5} sm={12} xl={5} xs={24}>
              <Form.Item
                label="Veiculo"
                name="final_destination_vehicle_id"
                rules={[{ required: true, message: "Campo obrigatório!" }]}
              >
                <SelectSearch
                  change={(v: any) =>
                    form.setFieldValue("final_destination_vehicle_id", v?.value)
                  }
                  effect={vehicle}
                  labelField={["plate", "vehicle_type.name"]}
                  placeholder="Placa - Tipo"
                  url="/vehicle"
                  value={form.getFieldValue("final_destination_vehicle_id")}
                />
              </Form.Item>
            </Col>
            <Col lg={5} md={5} sm={12} xl={5} xs={24}>
              <Form.Item
                label="Modelo de caçamba"
                rules={[{ required: true, message: "Campo obrigatório!" }]}
              >
                <SelectSearch
                  change={(v: any) => setModelValue(v?.value)}
                  effect={model}
                  labelField={["name", "m3"]}
                  placeholder="Nome - M³"
                  url="/stationary_bucket_type"
                  value={modelValue}
                />
              </Form.Item>
            </Col>
            <Col lg={5} md={5} sm={12} xl={5} xs={24}>
              <Form.Item
                label="Caçamba"
                name="final_stationary_bucket_id"
                rules={[{ required: true, message: "Campo obrigatório!" }]}
              >
                <SelectSearch
                  change={(v: any) =>
                    form.setFieldValue("final_stationary_bucket_id", v?.value)
                  }
                  effect={{ filters: { status: "D", type: modelValue } }}
                  filter={`&status=D&type=${modelValue}`}
                  labelField={["code", "status.name"]}
                  placeholder="Código - Situação"
                  url="/stationary_bucket"
                  value={form.getFieldValue("final_stationary_bucket_id")}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Divider orientation="left">Dados MTR</Divider>
            </Col>
            {residue.map((v1: any, i1: any) => (
              <Col md={8} sm={12} xs={24}>
                <InputNumber
                  addonAfter="m³"
                  addonBefore={
                    <Typography style={{ width: 100 }}>
                      {v1.residue.name}
                    </Typography>
                  }
                  onChange={(v) => setmtr({ ...mtr, [v1.residue_id]: v })}
                  style={{ width: "100%" }}
                />
              </Col>
            ))}
            <Col span={24}>
              <Button
                htmlType="submit"
                loading={loadingButton}
                style={{ float: "right" }}
                type="primary"
              >
                Gerar
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>
      <MapFullScreen open={open} setOpen={setOpen} />
    </PageDefault>
  );
};

export default OrdemLocacaoEmProcessamento;
