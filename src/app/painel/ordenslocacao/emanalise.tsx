import {
  Button,
  Col,
  Divider,
  Form,
  Image,
  Input,
  InputNumber,
  List,
  Modal,
  Row,
  Select,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { IoDocumentAttachOutline } from "react-icons/io5";
import { TbCamera, TbFileSearch } from "react-icons/tb";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { OrderLocationProductStatusEnum } from "@/enums/order-location-product-status-enum";
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

const OrdemLocacaoEmAnalise = ({
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
  const [productSelect, setProductSelect] = useState<any>(null);
  const [gallery, setGallery] = useState<any[]>([]);
  const [residue, setResidue] = useState<any[]>([]);
  const [mtr, setmtr] = useState<any>();
  const [valid, setValid] = useState<boolean>(false);

  const [modalForm, setModalForm] = useState(false);
  const [modal, setModal] = useState(false);
  const [file, setFile] = useState<any>("");

  const [modelValue, setModelValue] = useState<any>();
  const [modalCDF, setModalCDF] = useState<boolean>(false);
  const [CDF, setCDF] = useState<any[]>([]);
  const [modalQRCode, setModalQRCode] = useState<boolean>(false);

  const openPDF = (url: string) => {
    setFile(url);
    setModal(true);
  };

  const [destination] = useState<any>("");
  const [driver] = useState<any>("");
  const [vehicle] = useState<any>("");
  const [model] = useState<any>("");
  const [open, setOpen] = useState<boolean>(false);

  const onLoadMap = () => setLoadMap(!loadMap);
  const onModalGallery = () => setModalGallery(!modalGallery);

  const [form] = Form.useForm();

  const onProductSelect = (item: any) => {
    GET_API(`/cdf/${item.mtr.cdf_id}`)
      .then((rs) => {
        if (rs.ok) {
          return rs.json();
        }
        Modal.warning({
          title: "Algo deu errado",
          content: "Não foi possível atualizar caçamba",
        });
      })
      .then((res) => {
        console.log(res.data.items);
        setTimeout(() => {
          setCDF(res.data.items);
          setProductSelect(item);
          setModalCDF(true);
        }, 500);
      })
      .catch(POST_CATCH);
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
              {item.withdrawal_date_format}
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
            {getProfileType() === "LEGAL_FINAL_DESTINATION" ||
            getProfileType() === "FINAL_DESTINATION" ||
            getProfileType() === "FINAL_DESTINATION_DRIVER" ? (
              <Typography>{item.order_location.client.name}</Typography>
            ) : null}
            <Typography style={{ color: "var(--color02)" }}>
              {item.final_destination_street}, {item.final_destination_number} -{" "}
              {item.final_destination_district} -{" "}
              {item.final_destination_city?.name} /{" "}
              {item.final_destination_city?.state.acronym}
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
                {item.driver_location?.name} - {item.driver_location?.cnh}
              </Tag>
            </Typography>
          ) : null}
          {item.scheduled_location_date ? (
            <Typography>
              <Tag color="red">
                {item.vehicle_location?.plate} -{" "}
                {item.vehicle_location?.vehicle_type.name}
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
          {item.scheduled_withdrawal_date ? (
            <Typography>
              <Tag color="green">
                {item.driver_withdrawal?.name} - {item.driver_withdrawal?.cnh}
              </Tag>
            </Typography>
          ) : null}
          {item.scheduled_withdrawal_date ? (
            <Typography>
              <Tag color="red">
                {item.vehicle_withdrawal?.plate} -{" "}
                {item.vehicle_withdrawal?.vehicle_type.name}
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
          {valid ? (
            verifyConfig([`${permission}.edit`]) &&
            item.mtr.status === "DELIVERED" ? (
              <Col>
                <Tooltip title="CDF não emitido">
                  <TbFileSearch
                    className="actions-button"
                    onClick={() => onProductSelect(item)}
                  />
                </Tooltip>
              </Col>
            ) : null
          ) : null}
          <Col>
            <Tooltip title="MTR">
              <IoDocumentAttachOutline
                className="actions-button"
                onClick={() => openPDF(item.mtr.link)}
                size={18}
              />
            </Tooltip>
          </Col>
          {getProfileType() === "LEGAL_SELLER" ||
          getProfileType() === "SELLER" ||
          getProfileType() === "SELLER_EMPLOYEE" ? (
            <Col>
              <Tooltip title="Fotos">
                <TbCamera
                  className="actions-button"
                  onClick={() => openGallery(item)}
                  size={18}
                />
              </Tooltip>
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

  const onAddItem = () => {
    setCDF([
      ...CDF,
      { residue_id: null, meters: null, residue_tecnology_id: null },
    ]);
  };

  const openGallery = (item: any) => {
    setGallery([]);
    onModalGallery();
    GET_API(
      `/order_location_product_gallery?orderLocationProductId=${item.id}&status=${OrderLocationProductStatusEnum.AWAITING_PICKUP}`
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

    try {
      POST_API(
        "/order_location_product",
        { ...values, status: "ADF" },
        productSelect.id
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

      POST_API("/final_mtr", {
        mtrs: productSelect.id,
        residues: JSON.stringify(valores),
      }).then((rs) => {
        if (rs.ok) {
          form.resetFields();
          setProductSelect(null);
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

  const onUpdateCDF = (value: any, field: any, index: any) => {
    var temp = CDF;
    temp[index][field] = value;
    setCDF(temp);
  };

  const onSendCDFFinaly = () => {
    setModalQRCode(true);
    POST_API(
      "/cdf",
      { items: JSON.stringify(Object.values(CDF)) },
      productSelect.mtr.cdf_id
    )
      .then((rs) => {
        if (rs.ok) {
          POST_API(
            "/order_location_product",
            { status: OrderLocationProductStatusEnum.INVOICE_ISSUED },
            productSelect.id
          );
          setModalCDF(false);
          setAction(!action);
          Modal.success({ title: "Sucesso", content: "CDF emitido" });
        } else {
          Modal.warning({
            title: "Algo deu errado",
            content: "Não foi possível emitir CDF",
          });
          return;
        }
      })
      .finally(() => setModalQRCode(false));
  };

  useEffect(() => load(), []);
  useEffect(() => onLoadMap(), [product]);
  useEffect(() => {
    GET_API("/me")
      .then((rs) => {
        if (rs.ok) return rs.json();
        Modal.warning({ title: "Algo deu errado", content: rs.statusText });
      })
      .then((res) => {
        setValid(res.data.environmental_license);
      })
      .catch(POST_CATCH);
  }, []);

  return (
    <PageDefault items={[{ title: "Em análise" }]} valid={`${permission}.list`}>
      <Row gutter={[16, 16]}>
        <Col md={24} xs={24}>
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
                  {getProfileType() === "LEGAL_FINAL_DESTINATION" ||
                  getProfileType() === "FINAL_DESTINATION" ||
                  getProfileType() === "FINAL_DESTINATION_DRIVER" ? (
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
                        {v.final_destination_city?.name} /{" "}
                        {v.final_destination_city?.state.acronym}{" "}
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
                  {getProfileType() === "LEGAL_FINAL_DESTINATION" ||
                  getProfileType() === "FINAL_DESTINATION" ||
                  getProfileType() === "FINAL_DESTINATION_DRIVER" ? (
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
                        {v.final_destination_city?.name} /{" "}
                        {v.final_destination_city?.state.acronym}{" "}
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
        <Col md={24} xs={24}>
          <CardItem>
            <Table
              action={action}
              column={column}
              defaultFilter={{
                statusIn: [
                  OrderLocationProductStatusEnum.IN_TRANSIT_TO_FINAL_DESTINATION,
                  OrderLocationProductStatusEnum.AWAITING_ANALISYS,
                ],
              }}
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
            gallery.map((v) => (
              <Col key={v.id} span={12}>
                <Image src={v.url} />
              </Col>
            ))
          )}
        </Row>
      </Modal>
      <Modal
        className="modalpdf"
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
        onCancel={() => setModalCDF(false)}
        open={modalCDF}
        title={`Tratamento resíduos MTR nº${productSelect?.mtr?.id}`}
        width={"90%"}
      >
        <List
          bordered
          dataSource={CDF}
          footer={
            <Row gutter={[8, 8]} justify={"end"}>
              <Col>
                <Button
                  loading={modalQRCode}
                  onClick={onSendCDFFinaly}
                  type="primary"
                >
                  Salvar e emitir CDF
                </Button>
              </Col>
            </Row>
          }
          header={
            <Row justify={"end"}>
              <Button onClick={onAddItem} type="primary">
                Adicionar tratamento
              </Button>
            </Row>
          }
          locale={{ emptyText: "Nenhum item cadastrado" }}
          renderItem={(item, index) => (
            <List.Item key={index}>
              <Row gutter={[8, 8]} style={{ width: "100%" }}>
                <Col md={9} xs={8}>
                  <Select
                    onChange={(v) => onUpdateCDF(v, "residue_id", index)}
                    placeholder="Classe resíduo"
                    style={{ width: "100%" }}
                  >
                    {productSelect.mtr.items.map((v: any, i: any) => (
                      <Select.Option key={i} value={v.residue_id}>
                        {v.residue.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
                <Col md={9} xs={16}>
                  <SelectSearch
                    change={(v: any) =>
                      onUpdateCDF(v?.value, "residue_tecnology_id", index)
                    }
                    effect={item.residue_tecnology_id}
                    labelField={["id", "name"]}
                    placeholder="Tratamento"
                    url="/residue_tecnology"
                  />
                </Col>
                <Col md={4} xs={20}>
                  <InputNumber
                    onChange={(v) => onUpdateCDF(v, "meters", index)}
                    placeholder="M³"
                    style={{ width: "100%" }}
                  />
                </Col>
                <Col md={2} xs={4}>
                  <Button
                    block
                    onClick={() =>
                      setCDF(CDF.filter((val, inx) => inx !== index))
                    }
                  >
                    X
                  </Button>
                </Col>
              </Row>
            </List.Item>
          )}
          size="small"
        />
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
      <MapFullScreen
        open={open}
        setOpen={setOpen}
        startStatus={[
          OrderLocationProductStatusEnum.IN_TRANSIT_TO_FINAL_DESTINATION,
          OrderLocationProductStatusEnum.AWAITING_ANALISYS,
        ]}
      />
    </PageDefault>
  );
};

export default OrdemLocacaoEmAnalise;
