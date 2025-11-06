/** biome-ignore-all lint/suspicious/noExplicitAny: ignorar */
import { ExclamationCircleOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Form,
  Image,
  Input,
  Modal,
  Row,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import { MdCheckBoxOutlineBlank, MdOutlineCheckBox } from 'react-icons/md';
import { TbCamera, TbSend2 } from 'react-icons/tb';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import CardItem from '../../../components/CardItem';
import LoadItem from '../../../components/LoadItem';
import MapFullScreen from '../../../components/MapFullScreen';
// COMPONENTES
import PageDefault from '../../../components/PageDefault';
import SelectSearch from '../../../components/SelectSearch';
import Table from '../../../components/Table';
import { TableTrMapProductButton } from '../../../components/Table/buttons';
// SERVIÇOS
import {
  GET_API,
  getProfileType,
  type PageDefaultProps,
  POST_API,
  POST_CATCH,
  verifyConfig,
} from '../../../services';

const OrdemLocacaoLocada = ({ type, path, permission }: PageDefaultProps) => {
  // ESTADOS DO COMPONENTE
  const [loadingButton, setLoadingButton] = useState(false);
  const [action, setAction] = useState(false);
  const [loadMap, setLoadMap] = useState(false);
  const [modalGallery, setModalGallery] = useState(false);
  const [coord, setCoord] = useState<any>(null);
  const [product, setProduct] = useState<any[]>([]);
  const [productSelect, setProductSelect] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [open, setOpen] = useState<boolean>(false);

  const [destination] = useState<any>('');
  const [driver] = useState<any>('');
  const [vehicle] = useState<any>('');
  const [typeDestination, setTypeDestination] = useState<
    '' | 'return_provider' | 'go_to_the_final_destination'
  >('go_to_the_final_destination');

  const onLoadMap = () => setLoadMap(!loadMap);
  const onModalGallery = () => setModalGallery(!modalGallery);

  const [form] = Form.useForm();

  const onProduct = (item: any) => {
    onLoadMap();

    const temp = productSelect;

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
      title: 'Data Locação',
      dataIndex: 'DATETIME_UPDATE_FORMAT',
      table: 'order_locations.created_at',
      width: '180px',
      sorter: true,
      align: 'center',
      render: (item: any) => (
        <Row style={{ width: '100%' }}>
          <Col span={24}>
            <Typography style={{ textAlign: 'center' }}>
              {item.location_date_format}
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
      title: 'Local locação',
      dataIndex: 'CLIENT_NAME',
      table: 'order_locations.id',
      width: 'auto',
      minWidth: '300px',
      sorter: true,
      align: 'left',
      render: (item: any) => (
        <Row style={{ width: '100%' }}>
          <Col span={24}>
            <Typography>Pedido: n° {item.order_locations_id}</Typography>
            {getProfileType() === 'LEGAL_SELLER' ||
            getProfileType() === 'SELLER' ||
            getProfileType() === 'SELLER_DRIVER' ? (
              <Typography>{item.order_locations.client.name}</Typography>
            ) : null}
            <Typography style={{ color: 'var(--color02)' }}>
              {item.order_locations.client_street},{' '}
              {item.order_locations.client_number} -{' '}
              {item.order_locations.client_district} -{' '}
              {item.order_locations.client_city?.name} /{' '}
              {item.order_locations.client_city?.state.acronym}
            </Typography>
          </Col>
        </Row>
      ),
    },
    {
      title: 'Código Caçamba',
      dataIndex: 'CODE',
      table: 'stationary_bucket.CODE',
      width: '180px',
      sorter: true,
      align: 'center',
      render: (item: any) => (
        <Row style={{ width: '100%' }}>
          <Col span={24}>
            <Typography style={{ textAlign: 'center' }}>
              {item.product.code}
            </Typography>
            <Typography
              style={{ color: 'var(--color02)', textAlign: 'center' }}
            >
              Modelo{' '}
              {item.product.stationary_bucket_group.stationary_bucket_type.name}
            </Typography>
          </Col>
        </Row>
      ),
    },
    {
      title: 'Tempo Restante',
      dataIndex: 'TIME_LEFT',
      table: 'timedif',
      width: '180px',
      sorter: true,
      align: 'center',
      render: (item: any) => (
        <Row style={{ width: '100%' }}>
          <Col span={24}>
            <Typography
              style={{
                textAlign: 'center',
                color: item.timedif > -1 ? 'green' : 'red',
              }}
            >
              {item.timedif} dia(s) de locação
            </Typography>
          </Col>
        </Row>
      ),
    },
    {
      title: 'Locação',
      dataIndex: 'CODE',
      table: 'stationary_bucket.CODE',
      width: '180px',
      sorter: false,
      align: 'center',
      render: (item: any) => (
        <Row justify={'center'} style={{ width: '100%' }}>
          {item.delivery_location_date ? (
            <Typography>
              <Tag color="green">
                {item.driver_location.name} - {item.driver_location.cnh}
              </Tag>
            </Typography>
          ) : null}
          {item.delivery_location_date ? (
            <Typography>
              <Tag color="red">
                {item.vehicle_location.plate} -{' '}
                {item.vehicle_location.vehicle_type.name}
              </Tag>
            </Typography>
          ) : null}
        </Row>
      ),
    },
    {
      title: 'Retirada',
      dataIndex: 'CODE',
      table: 'stationary_bucket.CODE',
      width: '180px',
      sorter: false,
      align: 'center',
      render: (item: any) => (
        <Row justify={'center'} style={{ width: '100%' }}>
          <Typography>
            <Tag style={{ textAlign: 'center' }}>
              {item.delivery_withdrawl_date
                ? `Agendado para ${item.delivery_withdrawl_date_format}`
                : 'Aguardando retirada'}
            </Tag>
          </Typography>
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
                {item.vehicle_withdraw.plate} -{' '}
                {item.vehicle_withdraw.vehicle_type.name}
              </Tag>
            </Typography>
          ) : null}
        </Row>
      ),
    },
    {
      title: 'Ações',
      dataIndex: null,
      width: '100px',
      sorter: false,
      align: 'center',
      render: (item: any) => (
        <Row justify={'center'} style={{ width: '100%' }}>
          {getProfileType() === 'LEGAL_SELLER' ||
          getProfileType() === 'SELLER' ||
          getProfileType() === 'SELLER_DRIVER' ? (
            verifyConfig([`${permission}.edit`]) ? (
              productSelect.filter((v) => Number(v.id) === Number(item.id))
                .length > 0 ? (
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
            ) : null
          ) : item.status.code === 'L' && getProfileType() !== 'CITY' ? (
            <Col>
              <Tooltip title="Pedir retirada">
                <TbSend2
                  className="actions-button"
                  onClick={() => pedirRetirada(item)}
                  size={18}
                />
              </Tooltip>
            </Col>
          ) : null}
          {getProfileType() === 'LEGAL_SELLER' ||
          getProfileType() === 'SELLER' ||
          getProfileType() === 'SELLER_DRIVER' ? (
            <Col>
              <Tooltip title="Abrir imagens">
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

  const pedirRetirada = (item: any) => {
    Modal.confirm({
      title: 'Pedir retirada desta caçamba?',
      icon: <ExclamationCircleOutlined />,
      cancelText: 'Não',
      okText: 'Sim',
      onOk() {
        POST_API('/order_location_product', { status: 'AR' }, item.id)
          .then((rs) => {
            setAction(!action);
            if (rs.ok) {
            } else {
              Modal.warning({
                title: 'Algo deu errado',
                content: 'Não foi possível pedir retirada',
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
      `/order_location_product_gallery?orderLocationProductId=${item.id}&status=L`
    )
      .then((rs) => rs.json())
      .then((res: any) => {
        setGallery(res.data);
      })
      .catch(POST_CATCH);
  };

  // CARREGA DADOS
  const load = () => {
    form.setFieldValue('type_destination', 'go_to_the_final_destination');
    GET_API('/address?default=1')
      .then((rs) => rs.json())
      .then((res) => {
        setCoord([res.data[0].latitude, res.data[0].longitude]);
      })
      .catch(POST_CATCH);
  };

  const onSend = (values: any) => {
    setLoadingButton(true);

    values.type_destination = typeDestination;
    values.status = 'AR';

    try {
      productSelect.forEach((item) => {
        POST_API('/order_location_product', values, item.id)
          .then((rs) => {
            if (rs.ok) {
            } else {
              Modal.warning({
                title: 'Algo deu errado',
                content: 'Não foi possível agendar entrega',
              });
            }
          })
          .catch(POST_CATCH);
      });

      form.resetFields();
      setProductSelect([]);
      setAction(!action);
    } catch (error) {
      POST_CATCH();
    } finally {
      setLoadingButton(false);
    }
  };

  useEffect(() => load(), []);
  useEffect(() => onLoadMap(), [product]);
  useEffect(() => {
    GET_API('/me')
      .then((rs) => {
        if (rs.ok) return rs.json();
        Modal.warning({ title: 'Algo deu errado', content: rs.statusText });
      })
      .then((res) => {
        setTypeDestination('go_to_the_final_destination');
      })
      .catch(POST_CATCH);
  }, []);

  return (
    <PageDefault items={[{ title: 'Locadas' }]} valid={`${permission}.list`}>
      <Row gutter={[16, 16]}>
        <Col
          md={
            (getProfileType() === 'LEGAL_SELLER' ||
              getProfileType() === 'SELLER' ||
              getProfileType() === 'SELLER_DRIVER') &&
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
                  style={{ width: '100%', height: 330 }}
                  zoom={14}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {getProfileType() === 'LEGAL_SELLER' ||
                  getProfileType() === 'SELLER' ||
                  getProfileType() === 'SELLER_DRIVER' ? (
                    <CircleMarker
                      center={[Number(coord[0]), Number(coord[1])]}
                      pathOptions={{ color: 'blue' }}
                      radius={10}
                    >
                      <Popup> Minha empresa </Popup>
                    </CircleMarker>
                  ) : null}
                  {product.map((v, i) => (
                    <CircleMarker
                      center={[
                        Number(v.order_locations.client_latitude),
                        Number(v.order_locations.client_longitude),
                      ]}
                      key={i}
                      pathOptions={{ color: v.status.color }}
                      radius={10}
                    >
                      <Popup>
                        {' '}
                        <Typography
                          style={{
                            textAlign: 'center',
                            color: v.status.color,
                            fontSize: '1.2em',
                          }}
                        >
                          {v.status.name}
                        </Typography>{' '}
                        <br /> {v.order_locations.client_street},{' '}
                        {v.order_locations.client_number} -{' '}
                        {v.order_locations.client_district} -{' '}
                        {v.order_locations.client_city?.name} /{' '}
                        {v.order_locations.client_city?.state.acronym}{' '}
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
                  style={{ width: '100%', height: 330 }}
                  zoom={14}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {getProfileType() === 'LEGAL_SELLER' ||
                  getProfileType() === 'SELLER' ||
                  getProfileType() === 'SELLER_DRIVER' ? (
                    <CircleMarker
                      center={[Number(coord[0]), Number(coord[1])]}
                      pathOptions={{ color: 'blue' }}
                      radius={10}
                    >
                      <Popup> Minha empresa </Popup>
                    </CircleMarker>
                  ) : null}
                  {product.map((v, i) => (
                    <CircleMarker
                      center={[
                        Number(v.order_locations.client_latitude),
                        Number(v.order_locations.client_longitude),
                      ]}
                      key={i}
                      pathOptions={{ color: v.status.color }}
                      radius={10}
                    >
                      <Popup>
                        {' '}
                        <Typography
                          style={{
                            textAlign: 'center',
                            color: v.status.color,
                            fontSize: '1.2em',
                          }}
                        >
                          {v.status.name}
                        </Typography>{' '}
                        <br /> {v.order_locations.client_street},{' '}
                        {v.order_locations.client_number} -{' '}
                        {v.order_locations.client_district} -{' '}
                        {v.order_locations.client_city?.name} /{' '}
                        {v.order_locations.client_city?.state.acronym}{' '}
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
        {(getProfileType() === 'LEGAL_SELLER' ||
          getProfileType() === 'SELLER' ||
          getProfileType() === 'SELLER_DRIVER') &&
        verifyConfig([`${permission}.edit`]) ? (
          <Col md={verifyConfig([`${permission}.edit`]) ? 8 : 24} xs={24}>
            <CardItem
              title={`Agendar retirada | ${productSelect.length} selecionado(s)`}
            >
              <Form form={form} layout="vertical" onFinish={onSend}>
                <Row gutter={[8, 0]}>
                  <Col span={8}>
                    <Form.Item
                      label="Data retirada"
                      name="delivery_withdrawl_date"
                      rules={[
                        { required: true, message: 'Campo obrigatório!' },
                      ]}
                    >
                      <Input
                        max={'9999-12-31'}
                        min={new Date().toISOString().slice(0, 10)}
                        type="date"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={16}>
                    <Form.Item
                      label="Veículo"
                      name="withdraw_vehicle_id"
                      rules={[
                        { required: true, message: 'Campo obrigatório!' },
                      ]}
                    >
                      <SelectSearch
                        change={(v: any) =>
                          form.setFieldValue('withdraw_vehicle_id', v?.value)
                        }
                        effect={vehicle}
                        labelField={['plate', 'vehicle_type.name']}
                        placeholder="Placa - Tipo"
                        url="/vehicle"
                        value={form.getFieldValue('withdraw_vehicle_id')}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item
                  label="Motorista"
                  name="withdraw_driver_id"
                  rules={[{ required: true, message: 'Campo obrigatório!' }]}
                >
                  <SelectSearch
                    change={(v: any) =>
                      form.setFieldValue('withdraw_driver_id', v?.value)
                    }
                    effect={driver}
                    labelField={['name', 'cnh']}
                    placeholder="Nome - CNH"
                    url="/driver"
                    value={form.getFieldValue('withdraw_driver_id')}
                  />
                </Form.Item>
                {typeDestination === 'go_to_the_final_destination' ? (
                  <Form.Item
                    label="Destino final"
                    name="destination_id"
                    rules={[{ required: true, message: 'Campo obrigatório!' }]}
                  >
                    <SelectSearch
                      change={(v: any) =>
                        form.setFieldValue('destination_id', v?.value)
                      }
                      effect={destination}
                      labelField={['name', 'document_number']}
                      placeholder="Nome - Documento"
                      url="/final_destination"
                      value={form.getFieldValue('destination_id')}
                    />
                  </Form.Item>
                ) : null}

                <Button
                  block
                  disabled={!(productSelect.length > 0)}
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
              defaultFilter={{ statusIn: 'L,AR,ETR' }}
              getList={setProduct}
              path={'order_location_product'}
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
        title="Fotos da locação"
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
      <MapFullScreen
        open={open}
        setOpen={setOpen}
        startStatus={['L', 'AR', 'ETR']}
      />
    </PageDefault>
  );
};

export default OrdemLocacaoLocada;
