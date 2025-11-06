// BIBLIOTECAS REACT

import { Button, Col, Input, Modal, Row, Tag, Typography } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvent,
  ZoomControl,
} from 'react-leaflet';

// services
import { GET_API } from '../../services';

// css
import './styles.css';
import { IoClose, IoSearch } from 'react-icons/io5';
import NavbarTopRigth from '../NavbarTopRight';
import { SearchMobileView } from './search-mobile-view';
import { SearchView } from './searchView';

// images
const logo = `${import.meta.env.VITE_URL_ASSETS}/3.png`;

interface IMapFullScreen {
  open: boolean;
  setOpen: Function;
  startStatus?: string[];
  drive?: boolean;
  field?: string;
}

const MapFullScreen = ({
  open,
  setOpen,
  startStatus,
  drive = false,
  field = '',
}: IMapFullScreen) => {
  // states
  const [show, setShow] = useState<boolean>(false);
  const [mobile, setMobile] = useState<boolean>(false);
  const [status, setStatus] = useState<string[]>(startStatus || []);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>();
  const [zoom, setZoom] = useState<number>(10);
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [focus, setFocus] = useState<any>(null);
  const [data, setData] = useState<any[]>([]);

  const loadData: any = () => {
    setLoading(true);
    GET_API(
      `/order_location_product?search=${search ?? ''}${status ? (status.length > 1 ? `&statusIn=${status}` : `&status=${status}`) : ''}&driver=${drive}${field ? `&${field}=1` : ''}`
    )
      .then((rs) => rs.json())
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    GET_API('/address?default=1')
      .then((rs) => rs.json())
      .then((res) => {
        setLatitude(res.data[0].latitude);
        setLongitude(res.data[0].longitude);
      });
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => setShow(true), 500);
    } else {
      setShow(false);
    }
  }, [open]);

  function MapView({ lat, log, item, color }: any) {
    const map = useMap();

    const changeCenter = (newCenter: any) => {
      map.setView(newCenter, map.getZoom());
      setFocus(item);
      setMobile(false);
    };

    if (item.id === focus?.id) {
      return (
        <Marker
          eventHandlers={{
            click: () => changeCenter([Number(lat), Number(log)]),
          }}
          position={[Number(lat), Number(log)]}
        />
      );
    }
    return (
      <CircleMarker
        center={[Number(lat), Number(log)]}
        eventHandlers={{
          click: () => changeCenter([Number(lat), Number(log)]),
        }}
        pathOptions={{ color }}
        radius={14}
      />
    );
  }

  return (
    <Modal
      className="modal-fullscreen"
      closable={false}
      destroyOnClose={true}
      footer={false}
      open={open}
      width={'100vw'}
    >
      <Row className="modal-fullscreen-row">
        <Col className="modal-fullscreen-col-map" flex={'auto'}>
          {latitude && longitude && show ? (
            <MapContainer
              center={[latitude, longitude]}
              scrollWheelZoom={false}
              style={{ width: '100%', height: '100%' }}
              zoom={zoom}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {data.map((v, i) => (
                <MapView
                  color={v.status.color}
                  item={v}
                  key={i}
                  lat={v.order_locations.client_latitude}
                  log={v.order_locations.client_longitude}
                />
              ))}
              <Button
                className="btn-map-screen-alt"
                onClick={() => setOpen(false)}
                type="text"
              />
              <img className="img-map-screen" src={logo} />
              <div className="user-map-screen">
                <NavbarTopRigth />
              </div>
              <ZoomControl position="bottomleft" />
              <SearchView
                data={data}
                focus={focus}
                loadData={loadData}
                loading={loading}
                search={search}
                setFocus={setFocus}
                setMobile={setMobile}
                setSearch={setSearch}
              />
              <SearchMobileView
                data={data}
                focus={focus}
                loadData={loadData}
                loading={loading}
                mobile={mobile}
                search={search}
                setFocus={setFocus}
                setMobile={setMobile}
                setSearch={setSearch}
              />
            </MapContainer>
          ) : null}
        </Col>
      </Row>
    </Modal>
  );
};

export default MapFullScreen;
