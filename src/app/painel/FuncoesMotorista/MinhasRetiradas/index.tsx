// BIBLIOTECAS REACT

// ICONS
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Scanner } from '@yudiel/react-qr-scanner';
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
} from 'antd';
import ImgCrop from 'antd-img-crop';
import { useEffect, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { Link } from 'react-router-dom';
import CardItem from '../../../../components/CardItem';
import LoadItem from '../../../../components/LoadItem';
// COMPONENTES
import PageDefault from '../../../../components/PageDefault';
import Table from '../../../../components/Table';
// SERVIÇOS
import {
  GET_API,
  getProfileID,
  getToken,
  type PageDefaultProps,
  POST_API,
  POST_CATCH,
  UPLOAD_API,
} from '../../../../services';

// GOOGLE MAPS
const google = `${import.meta.env.VITE_URL_ASSETS}/google-maps.png`;

import { MdCheckBoxOutlineBlank, MdOutlineCheckBox } from 'react-icons/md';
import DrawerEndereco from '../../../../components/DrawerEndereco';
import MapFullScreen from '../../../../components/MapFullScreen';
import { TableTrMapProductButton } from '../../../../components/Table/buttons';

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
  const [tabProduct, setTabProduct] = useState<string>('1');
  const [totalValue, setTotalValue] = useState<number>(0);
  const [classValue, setClassValue] = useState<any[]>([]);
  const [isFull, setIsFull] = useState(false);
  const [optionFinish, setOptionFinish] = useState<string>('');
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
      title: 'Data Retirada',
      dataIndex: 'DATETIME_UPDATE_FORMAT',
      table: 'order_location_products.delivery_withdrawl_date',
      width: '180px',
      sorter: true,
      align: 'center',
      render: (item: any) => (
        <Row style={{ width: '100%' }}>
          <Col span={24}>
            <Typography style={{ textAlign: 'center' }}>
              {item.delivery_withdrawl_date_format}
            </Typography>
            {item.status.code === 'AR' ? (
              <Typography
                style={{ textAlign: 'center', color: 'var(--color02)' }}
              >
                {product.filter((v) => Number(v.id) === Number(item.id))
                  .length > 0
                  ? 'Selecionada'
                  : 'Não Selecionada'}
              </Typography>
            ) : (
              <Typography
                style={{ textAlign: 'center', color: 'var(--color02)' }}
              >
                {item.status.code === 'ETR'
                  ? 'A caminho do cliente'
                  : 'A caminho do destino'}
              </Typography>
            )}
          </Col>
        </Row>
      ),
    },
    {
      title: 'Destino',
      dataIndex: 'CLIENT_NAME',
      table: 'client.NAME',
      width: 'auto',
      minWidth: '300px',
      sorter: false,
      align: 'left',
      render: (item: any) => (
        <Row style={{ width: '100%' }}>
          <Col span={24}>
            <Typography>Pedido: n° {item.order_locations_id}</Typography>
            <Typography>
              {item.status.code === 'AR' || item.status.code === 'ETR'
                ? `Cliente: ${item.order_locations.client.name}`
                : item.status.code === 'ETDF'
                  ? `Destino final: ${item.destination.name}`
                  : item.status.code === 'ETP' ||
                      item.product.status.code === 'ETLD'
                    ? 'Retornar ao locador'
                    : '-'}
            </Typography>
            <Typography style={{ color: 'var(--color02)' }}>
              {item.status.code === 'AR' || item.status.code === 'ETR'
                ? `${item.order_locations.client_street}, ${item.order_locations.client_number} - ${item.order_locations.client_district} - ${item.order_locations.client_city.name} / ${item.order_locations.client_city.state.acronym}`
                : item.status.code === 'ETDF'
                  ? `${item.final_destination_street}, ${item.final_destination_number} - ${item.final_destination_district} - ${item.final_destination_city.name} / ${item.final_destination_city.state.acronym}`
                  : item.product.status.code === 'ETLD'
                    ? `${item.order_locations.provider_street}, ${item.order_locations.provider_number} - ${item.order_locations.provider_district} - ${item.order_locations.provider_city.name} / ${item.order_locations.provider_city.state.acronym}`
                    : '-'}
            </Typography>
            <Typography style={{ color: 'var(--color02)' }} />
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
      title: 'Distância',
      dataIndex: 'order_locations.distance',
      width: '180px',
      sorter: false,
      align: 'center',
      render: (item: any) => (
        <Row justify={'center'} style={{ width: '100%' }}>
          <Typography style={{ textAlign: 'center' }}>
            {item.order_locations.distance} km
          </Typography>
        </Row>
      ),
    },
    {
      title: 'Veículo',
      dataIndex: 'CODE',
      table: 'stationary_buckets.code',
      width: '180px',
      sorter: false,
      align: 'center',
      render: (item: any) => (
        <Row justify={'center'} style={{ width: '100%' }}>
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
          {typeLoad === 'AR' ? (
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
    GET_API('/address?default=1')
      .then((rs) => rs.json())
      .then((res) => {
        setCoord([res.data[0].latitude, res.data[0].longitude]);
      })
      .catch(POST_CATCH);
  };

  const reader = (result: any) => {
    if (typeLoad === 'AR') {
      GET_API(`/order_location_product?code=${result[0].rawValue}&status=AR`)
        .then((rs) => rs.json())
        .then((res) => {
          if (res.data.length > 0) {
            setTempProd(res.data[0]);
            onModal();
            onPhotoModal();
            message.success({ content: 'Caçamba selecionada', key: '09op' });
          } else {
            message.error({ content: 'Caçamba não encontrada', key: '09op' });
          }
        })
        .catch(POST_CATCH);
    } else if (result[0].rawValue === productSelect?.product.code) {
      onModal();
      onPhotoModal();
    } else {
      message.error({ content: 'Caçamba inválida', key: '09op' });
    }
  };

  const readerWrite = (result: any) => {
    if (typeLoad === 'AR') {
      GET_API(`/order_location_product?code=${result}&status=AR`)
        .then((rs) => rs.json())
        .then((res) => {
          if (res.data.length > 0) {
            setTempProd(res.data[0]);
            onModal();
            onPhotoModal();
            message.success({ content: 'Caçamba selecionada', key: '09op' });
          } else {
            message.error({ content: 'Caçamba não encontrada', key: '09op' });
          }
        })
        .catch(POST_CATCH);
    } else if (result === productSelect.product.code) {
      onModal();
      onPhotoModal();
    } else {
      message.error({ content: 'Caçamba inválida', key: '09op' });
    }
  };

  //  FUNÇÃO PARA INICIAR RETIRADA
  const onSend = () => {
    Modal.confirm({
      title: 'Inicar retirada dos itens selecionados?',
      icon: <ExclamationCircleOutlined />,
      cancelText: 'Não',
      okText: 'Sim',
      onOk() {
        try {
          product.forEach((item) => {
            POST_API('/order_location_product', { status: 'ETR' }, item.id)
              .then((rs) => {
                if (rs.ok) {
                  loadDelivery();
                  message.success({ content: 'Retirada iniciada!' });
                } else {
                  Modal.warning({
                    title: 'Algo deu errado',
                    content: 'Não foi possível agendar entrega',
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
    POST_API('/order_location_product', { status: 'ETDF' }, productSelect.id)
      .then((rs) => {
        if (rs.ok) {
          POST_API('/mtr', {
            order_location_product_id: productSelect.id,
            meters: totalValue,
            items: JSON.stringify(Object.values(classValue)),
          })
            .then((rs) => {
              if (rs.ok) {
                fileList.forEach((item) => {
                  POST_API('/order_location_product_gallery', {
                    status: 'AR',
                    order_location_product_id: productSelect.id,
                    url: item.response.url,
                  }).then((rs) => {
                    if (!rs.ok) {
                      Modal.warning({
                        title: 'Algo deu errado',
                        content: 'Não foi possível salvar imagem',
                      });
                      return;
                    }
                  });
                });

                onPhotoModal();
                loadDelivery();
                Modal.success({
                  title: 'Sucesso',
                  content: 'Produto foi retirado e MTR foi emitido',
                });
                setAction(!action);
              } else {
                Modal.warning({
                  title: 'Algo deu errado',
                  content: 'Não foi possível emitir MTR',
                });
                return;
              }
            })
            .finally(() => setLoadingButton(false));
        } else {
          Modal.warning({
            title: 'Algo deu errado',
            content: 'Não foi possível retirar produto',
          });
        }
      })
      .catch(POST_CATCH);
  };

  const loadDelivery = () => {
    GET_API('/order_location_product?statusIn=ETR,ETDF&driver=true')
      .then((rs) => rs.json())
      .then((res) => {
        if (res.data.length > 0) {
          setTypeLoad('ETR');
          setProduct(res.data);
        } else {
          setTypeLoad('AR');
          setProduct([]);
        }
      })
      .catch(POST_CATCH);
  };

  const onModal = () => {
    if (productSelect?.product?.status?.code === 'ETLD') {
      Modal.confirm({
        title: 'Confirmar entrega da caçamba no locador?',
        icon: <ExclamationCircleOutlined />,
        cancelText: 'Não',
        okText: 'Sim',
        onOk: () => {
          POST_API(
            '/stationary_bucket',
            { status: 'ML' },
            productSelect.product.id
          )
            .then((rs) => {
              if (rs.ok) {
                setAction(!action);
                loadDelivery();
                Modal.success({
                  title: 'Sucesso',
                  content: 'Caçamba entregue com sucesso',
                });
              } else {
                Modal.warning({
                  title: 'Algo deu errado',
                  content: 'Não foi possível finalizar entrega da caçamba',
                });
              }
            })
            .catch(POST_CATCH);
        },
      });
    } else {
      setModal(!modal);
    }
  };

  const onPhotoModal = () => setPhotoModal(!photoModal);

  const onFinishProcess = () => {
    setLoadingButton(true);
    POST_API('/order_location_product', { status: 'ML' }, productSelect.id)
      .then((rs) => {
        if (rs.ok) {
          POST_API('/mtr', { status: 'DELIVERED' }, productSelect.mtr.id);
          onPhotoModal();
          loadDelivery();
          Modal.success({ title: 'Sucesso', content: 'Processo finalizado' });
          setAction(!action);
        } else {
          Modal.warning({
            title: 'Algo deu errado',
            content: 'Não foi possível finalizar processo',
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
    setTabProduct('1');
    setFileList([]);
  }, [photoModal]);

  useEffect(() => {
    setClassValue([]);
    var temp: any = [];
    productSelect?.order_locations.cart_product.residues.map((value: any) => {
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
    <PageDefault items={[{ title: 'Retiradas Agendadas' }]} valid={'fmt.vrp'}>
      {typeLoad ? (
        <Row gutter={[16, 16]}>
          {typeLoad === 'ETR' ? (
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
                    style={{ width: '100%', height: 330 }}
                    zoom={14}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <CircleMarker
                      center={[Number(coord[0]), Number(coord[1])]}
                      pathOptions={{ color: 'blue' }}
                      radius={10}
                    >
                      <Popup> Minha empresa </Popup>
                    </CircleMarker>
                    {product.map((v, i) =>
                      v.status.code === 'ETDF' ? (
                        <CircleMarker
                          center={[
                            Number(v.final_destination_latitude),
                            Number(v.final_destination_longitude),
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
                            <br /> {v.final_destination_street},{' '}
                            {v.final_destination_number} -{' '}
                            {v.final_destination_district} -{' '}
                            {v.final_destination_city.name} /{' '}
                            {v.final_destination_city.state.acronym}{' '}
                          </Popup>
                        </CircleMarker>
                      ) : v.product.status.code === 'ETLD' ? (
                        <CircleMarker
                          center={[
                            Number(v.order_locations.provider_latitude),
                            Number(v.order_locations.provider_longitude),
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
                            <br /> {v.order_locations.provider_street},{' '}
                            {v.order_locations.provider_number} -{' '}
                            {v.order_locations.provider_district} -{' '}
                            {v.order_locations.provider_city.name} /{' '}
                            {v.order_locations.provider_city.state.acronym}{' '}
                          </Popup>
                        </CircleMarker>
                      ) : (
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
                            {v.order_locations.client_city.name} /{' '}
                            {v.order_locations.client_city.state.acronym}{' '}
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
                    style={{ width: '100%', height: 330 }}
                    zoom={14}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <CircleMarker
                      center={[Number(coord[0]), Number(coord[1])]}
                      pathOptions={{ color: 'blue' }}
                      radius={10}
                    >
                      <Popup> Minha empresa </Popup>
                    </CircleMarker>
                    {product.map((v, i) =>
                      v.status.code === 'ETDF' ? (
                        <CircleMarker
                          center={[
                            Number(v.final_destination_latitude),
                            Number(v.final_destination_longitude),
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
                            <br /> {v.final_destination_street},{' '}
                            {v.final_destination_number} -{' '}
                            {v.final_destination_district} -{' '}
                            {v.final_destination_city.name} /{' '}
                            {v.final_destination_city.state.acronym}{' '}
                          </Popup>
                        </CircleMarker>
                      ) : v.product.status.code === 'ETLD' ? (
                        <CircleMarker
                          center={[
                            Number(v.order_locations.provider_latitude),
                            Number(v.order_locations.provider_longitude),
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
                            <br /> {v.order_locations.provider_street},{' '}
                            {v.order_locations.provider_number} -{' '}
                            {v.order_locations.provider_district} -{' '}
                            {v.order_locations.provider_city.name} /{' '}
                            {v.order_locations.provider_city.state.acronym}{' '}
                          </Popup>
                        </CircleMarker>
                      ) : (
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
                            {v.order_locations.client_city.name} /{' '}
                            {v.order_locations.client_city.state.acronym}{' '}
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
              {productSelect?.order_locations ? (
                productSelect?.status.code === 'AR' ||
                productSelect?.status.code === 'ETR' ? (
                  <Link
                    target="_blank"
                    to={`http://maps.google.com/?daddr=${productSelect.order_locations.client_street},${productSelect.order_locations.client_number} - ${productSelect.order_locations.client_district} - ${productSelect.order_locations.client_city.name} / ${productSelect.order_locations.client_city.state.acronym}}`}
                  >
                    <img className="img-google" src={google} />
                  </Link>
                ) : productSelect?.status.code === 'ETDF' ? (
                  <Link
                    target="_blank"
                    to={`http://maps.google.com/?daddr=${productSelect.final_destination_street},${productSelect.final_destination_number} - ${productSelect.final_destination_district} - ${productSelect.final_destination_city.name} / ${productSelect.final_destination_city.state.acronym}}`}
                  >
                    <img className="img-google" src={google} />
                  </Link>
                ) : null
              ) : (
                '-'
              )}
            </CardItem>
          </Col>
          <Col md={8} xs={24}>
            <CardItem
              title={`${typeLoad === 'AR' ? 'Iniciar retirada' : 'Retirada iniciada'} | ${product.length} selecionado(s)`}
            >
              <Radio.Group
                onChange={(v) => setProductSelect(v.target.value)}
                style={{ width: '100%' }}
                value={productSelect}
              >
                <Row gutter={[8, 8]} style={{ width: '100%' }}>
                  {product.map((v: any, i: any) => (
                    <Col key={i} span={24} style={{ display: 'flex' }}>
                      {typeLoad === 'ETR' ? <Radio value={v} /> : null}
                      <Typography>
                        {v.product.code}{' '}
                        {v.status.code === 'AR'
                          ? ''
                          : v.status.code === 'ETR'
                            ? ' - A caminho'
                            : ` - Retirada concluida, a caminho do ${v.status.code === 'ETP' || v.product.status.code === 'ETLD' ? 'locador' : 'do destino final'}`}
                      </Typography>
                      {typeLoad === 'AR' ? (
                        <IoClose
                          onClick={() => onDelProduct(v)}
                          style={{
                            position: 'absolute',
                            right: '0.4em',
                            top: '0.4em',
                            cursor: 'pointer',
                          }}
                        />
                      ) : null}
                    </Col>
                  ))}
                  {typeLoad === 'AR' ? (
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
                        {productSelect?.status.code === 'ETDF' ||
                        productSelect?.status.code === 'ETP' ||
                        productSelect?.product.status.code === 'ETLD'
                          ? 'Descarregar produto'
                          : 'Confirmar retirada'}
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
                  statusIn: ['AR', 'ETR', 'ETDF'],
                  driver: true,
                }}
                path={'order_location_product'}
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
                textAlign: 'center',
                fontSize: '1.4em',
                marginTop: '1em',
                color: 'var(--color02)',
              }}
            >
              {' '}
              {typeLoad === 'AR'
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
            {productSelect?.status.code === 'ETDF' ||
            productSelect?.status.code === 'ETP' ? (
              <Row gutter={[8, 8]}>
                <Col span={24}>
                  <Typography style={{ fontWeight: 600, fontSize: '1.2em' }}>
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
                <Tabs.TabPane key={'1'} tabKey={'1'}>
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
                            Authorization: 'Bearer ' + getToken(),
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
                        onClick={() => setTabProduct('2')}
                        type="primary"
                      >
                        Continuar
                      </Button>
                    </Col>
                  </Row>
                </Tabs.TabPane>
                <Tabs.TabPane key={'2'} tabKey={'2'}>
                  <Row gutter={[8, 8]}>
                    <Col span={24}>
                      <Checkbox
                        checked={isFull}
                        onChange={(e) => setIsFull(e.target.checked)}
                      >
                        Caçamba está cheia?
                      </Checkbox>
                    </Col>
                    {productSelect?.order_locations.cart_product.residues.map(
                      (value: any, index: number) => (
                        <Col key={`residueproduct${index}`} span={24}>
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
                              productSelect?.order_locations.cart_product
                                .residues.length > 1
                                ? 'Caso não saiba, mantenha vazio'
                                : 'Valor obrigatório'
                            }
                            style={{ width: '100%' }}
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
                        style={{ width: '100%' }}
                        value={totalValue}
                      />
                    </Col>
                    <Col span={12}>
                      <Button
                        block
                        onClick={() => setTabProduct('1')}
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
        startStatus={['AR', 'ETR', 'ETP', 'ETDF', 'ETLD']}
      />
    </PageDefault>
  );
};

export default MinhasRetiradas;
