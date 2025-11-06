/** biome-ignore-all lint/suspicious/noExplicitAny: ignorar */
import { Col, Row, Tag, Typography } from 'antd';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import CardItem from '@/components/CardItem';
import PageDefault from '@/components/PageDefault';
import { GET_API, type PageDefaultProps } from '@/services';

const iconCache = new Map<string, L.DivIcon>();

function getMemoizedAvatarIcon(photoUrl: string, status: string): any {
  if (!photoUrl) {
    return null;
  }
  if (iconCache.has(photoUrl)) {
    // biome-ignore lint/style/noNonNullAssertion: necessário
    return iconCache.get(photoUrl)!;
  }

  const icon = L.divIcon({
    className: '',
    html: `<div style="
            border-radius: 50%;
            overflow: hidden;
            width: 36px;
            height: 36px;
            border: 4px solid ${status === 'on' ? '#05c415ff' : '#ff1818ff'} ;
            box-shadow: 0 0 5px rgba(0,0,0,0.3);
          ">
            <img src="${photoUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
         </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });

  iconCache.set(photoUrl, icon);
  return icon;
}

export default function RastreamentoPage({
  permission,
  type,
}: PageDefaultProps) {
  const [coord, setCoord] = useState<any>(null);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    GET_API('/address?default=1')
      .then((rs) => rs.json())
      .then((res) => {
        setCoord([res.data[0].latitude, res.data[0].longitude]);
      });
  }, []);

  useEffect(() => {
    const routeInterval = setInterval(() => {
      GET_API('/routes/driver')
        .then((rs) => rs.json())
        .then((res) => {
          setData((prevData) => {
            const updated = res.data;

            return updated.map((newItem: any) => {
              const existing = prevData.find(
                (oldItem) => oldItem.user_id === newItem.user_id
              );

              // Se já existia, reaproveita dados estáticos como foto e ícone
              if (existing) {
                return {
                  ...existing,
                  latitude: newItem.latitude,
                  longitude: newItem.longitude,
                  status: newItem.status,
                  last_update: newItem.last_update,
                  // qualquer outro campo dinâmico
                };
              }

              // Se é novo, adiciona como está
              return newItem;
            });
          });
        });
    }, 5000);

    return () => {
      clearInterval(routeInterval);
    };
  }, []);

  return (
    <PageDefault
      items={[{ title: 'Rastreamento' }]}
      valid={`${permission}.${type}`}
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <CardItem>
            <div style={{ height: 500, overflow: 'hidden' }}>
              {coord !== null && (
                <MapContainer
                  center={[coord[0], coord[1]]}
                  scrollWheelZoom={false}
                  style={{ width: '100%', height: '100%' }}
                  zoom={14}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {data.map((v) => (
                    <Marker
                      icon={getMemoizedAvatarIcon(v.driver.photo, v.status)}
                      key={v.user_id}
                      position={[Number(v.latitude), Number(v.longitude)]}
                    >
                      <Popup>
                        <Typography
                          style={{
                            textAlign: 'center',
                            fontSize: '0.8em',
                            color: '#0000009f',
                          }}
                        >
                          {v.last_update}
                        </Typography>
                        <Typography
                          style={{ textAlign: 'center', fontSize: '1.2em' }}
                        >
                          {v.driver.name}
                        </Typography>
                        <Tag
                          color={v.status === 'on' ? 'green' : 'red'}
                          style={{ marginTop: 6 }}
                        >
                          {v.status === 'on' ? 'Online' : 'Offline'}
                        </Tag>
                      </Popup>
                    </Marker>
                  ))}

                  {/* {data.map((v) => (
                    <CircleMarker
                      center={[Number(v.latitude), Number(v.longitude)]}
                      key={v.user_id}
                      radius={8}
                    >
                      <Popup>
                        <Typography
                          style={{
                            textAlign: 'center',
                            fontSize: '1.2em',
                          }}
                        >
                          {v.driver.name}
                        </Typography>
                      </Popup>
                    </CircleMarker>
                  ))} */}
                </MapContainer>
              )}
            </div>
          </CardItem>
        </Col>
      </Row>
    </PageDefault>
  );
}
