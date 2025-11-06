// BIBLIOTECAS REACT

import { Col, Image, Modal, Row, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { TbCamera } from 'react-icons/tb';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import CardItem from '../../../../components/CardItem';
import LoadItem from '../../../../components/LoadItem';
// COMPONENTES
import PageDefault from '../../../../components/PageDefault';
import Table from '../../../../components/Table';
import { TableTrMapProductButton } from '../../../../components/Table/buttons';
// SERVIÇOS
import {
  GET_API,
  getToken,
  type PageDefaultProps,
  POST_API,
  POST_CATCH,
} from '../../../../services';

const LocadasList = ({ type, path, permission }: PageDefaultProps) => {
  // ESTADOS DO COMPONENTE
  const [action] = useState(false);
  const [loadMap, setLoadMap] = useState(false);
  const [modalGallery, setModalGallery] = useState(false);
  const [coord, setCoord] = useState<any>(null);
  const [product, setProduct] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);

  const onLoadMap = () => setLoadMap(!loadMap);
  const onModalGallery = () => setModalGallery(!modalGallery);

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
                <Tag color={item.product.status.color} style={{ margin: 0 }}>
                  {item.product.status.name}
                </Tag>
              </center>
            </Typography>
          </Col>
        </Row>
      ),
    },
    {
      title: 'Cliente',
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
            <Typography>{item.order_locations.client.name}</Typography>
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
      table:
        '( order_location.DAYS - DATEDIFF(CURRENT_DATE(), order_location_product.DATE_LOCADA))',
      width: '180px',
      sorter: true,
      align: 'center',
      render: (item: any) => (
        <Row style={{ width: '100%' }}>
          <Col span={24}>
            <Typography
              style={{
                textAlign: 'center',
                color: item.TIME_LEFT > -1 ? 'green' : 'red',
              }}
            >
              {item.TIME_LEFT} dia(s) de locação
            </Typography>
          </Col>
        </Row>
      ),
    },
    {
      title: 'Motorista / Veículo',
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
      title: 'Ações',
      dataIndex: null,
      width: '100px',
      sorter: false,
      align: 'center',
      render: (item: any) => (
        <Row justify={'center'} style={{ width: '100%' }}>
          <Col>
            <TbCamera
              className="actions-button"
              onClick={() => openGallery(item)}
              size={18}
            />
          </Col>
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
    GET_API('/address?active=1')
      .then((rs) => rs.json())
      .then((res) => {
        setCoord([res.data[0].latitude, res.data[0].longitude]);
      })
      .catch(POST_CATCH);
  };

  useEffect(() => load(), []);
  useEffect(() => onLoadMap(), [product]);

  return (
    <PageDefault items={[{ title: 'Locadas' }]} valid={'vlc.list'}>
      <Row gutter={[16, 16]}>
        <Col md={24} xs={24}>
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
                  {product.map((v, i) => (
                    <CircleMarker
                      center={[
                        Number(v.order_locations.client_latitude),
                        Number(v.order_locations.client_longitude),
                      ]}
                      key={i}
                      pathOptions={{ color: v.product.status.color }}
                      radius={10}
                    >
                      <Popup>
                        {' '}
                        <Typography
                          style={{
                            textAlign: 'center',
                            color: v.product.status.color,
                            fontSize: '1.2em',
                          }}
                        >
                          {v.product.status.name}
                        </Typography>{' '}
                        <br /> {v.order_locations.client_street},{' '}
                        {v.order_locations.client_number} -{' '}
                        {v.order_locations.client_district} -{' '}
                        {v.order_locations.client_city?.name} /{' '}
                        {v.order_locations.client_city?.state.acronym}{' '}
                      </Popup>
                    </CircleMarker>
                  ))}
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
                  {product.map((v, i) => (
                    <CircleMarker
                      center={[
                        Number(v.order_locations.client_latitude),
                        Number(v.order_locations.client_longitude),
                      ]}
                      key={i}
                      pathOptions={{ color: v.product.status.color }}
                      radius={10}
                    >
                      <Popup>
                        {' '}
                        <Typography
                          style={{
                            textAlign: 'center',
                            color: v.product.status.color,
                            fontSize: '1.2em',
                          }}
                        >
                          {v.product.status.name}
                        </Typography>{' '}
                        <br /> {v.order_locations.client_street},{' '}
                        {v.order_locations.client_number} -{' '}
                        {v.order_locations.client_district} -{' '}
                        {v.order_locations.client_city?.name} /{' '}
                        {v.order_locations.client_city?.state.acronym}{' '}
                      </Popup>
                    </CircleMarker>
                  ))}
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
              defaultFilter={{ status: 'L' }}
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
    </PageDefault>
  );
};

export default LocadasList;
