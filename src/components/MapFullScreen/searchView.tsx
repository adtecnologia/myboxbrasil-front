/** biome-ignore-all lint/suspicious/noExplicitAny: ignorar */
/** biome-ignore-all lint/suspicious/noArrayIndexKey: ignorar */
/** biome-ignore-all lint/nursery/noNoninteractiveElementInteractions: ignorar */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: ignorar */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: ignorar */
import { Button, Col, Input, Row, Typography } from 'antd';
import { IoClose, IoSearch } from 'react-icons/io5';
import { useMap } from 'react-leaflet';

export function SearchView({
  focus,
  setFocus,
  setMobile,
  search,
  setSearch,
  loadData,
  loading,
  data,
}: any) {
  const map = useMap();

  const changeCenter = (newCenter: any, item: any) => {
    map.setView(newCenter, map.getZoom());
    setFocus(item);
    setMobile(false);
  };

  return (
    <div className="search-map-screen">
      <Row
        gutter={[8, 12]}
        style={{
          paddingTop: 10,
          paddingLeft: 10,
          paddingRight: 10,
          paddingBottom: 20,
        }}
      >
        <Col span={24}>
          <div className="input-map-screen">
            <Row align={'middle'}>
              <Col flex={'auto'}>
                <Input
                  allowClear
                  className="input-field-map-screen"
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(event) =>
                    event.key === 'Enter' ? loadData() : null
                  }
                  placeholder="Pesquisar..."
                  value={search}
                />
              </Col>
              <Col flex={'32px'}>
                <Button
                  disabled={loading}
                  onClick={focus ? () => setFocus(null) : loadData}
                  shape="circle"
                >
                  {focus ? <IoClose /> : <IoSearch />}
                </Button>
              </Col>
            </Row>
          </div>
        </Col>
        {focus ? (
          <Col span={24}>
            <div
              className="card-map-screen"
              style={{ borderLeftColor: focus.status.color }}
            >
              <Typography
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'var(--color03)',
                }}
              >
                {focus.order_locations.client_street},{' '}
                {focus.order_locations.client_number} -{' '}
                {focus.order_locations.client_district} -{' '}
                {focus.order_locations.client_city.name} /{' '}
                {focus.order_locations.client_city.state.acronym}
              </Typography>
              <hr />
              <Typography>
                <b>Situação:</b> {focus.status.name}
              </Typography>
              <hr />
              <Typography>
                <b>Locatário:</b> {focus.order_locations.client.name}
              </Typography>
              <Typography>
                <b>Locador:</b> {focus.order_locations.provider.name}
              </Typography>
              <hr />
              <Typography>
                <b>Identificação:</b> {focus.product.code}
              </Typography>
              <Typography>
                <b>Modelo:</b>{' '}
                {
                  focus.product.stationary_bucket_group.stationary_bucket_type
                    .name
                }
              </Typography>
              <hr />
              <Typography>
                <b>Tipo de locação:</b>{' '}
                {focus.order_locations.cart_product.type_local === 'E'
                  ? 'Externo'
                  : 'Interno'}{' '}
                | {focus.order_locations.cart_product.days} dias
              </Typography>
              <Typography>
                <b>Data locação:</b>{' '}
                {focus.status.code === 'EP' || focus.status.code === 'ETL'
                  ? 'Aguardando locação'
                  : focus.location_date_format}
              </Typography>
            </div>
          </Col>
        ) : data.length > 0 ? (
          data.map((item: any, index: number) => (
            <Col key={index} span={24}>
              <div
                className="card-map-screen"
                onClick={() =>
                  changeCenter(
                    [
                      item.order_locations.client_latitude,
                      item.order_locations.client_longitude,
                    ],
                    item
                  )
                }
                style={{ borderLeftColor: item.status.color }}
              >
                <Typography
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'var(--color03)',
                  }}
                >
                  {item.order_locations.client_street},{' '}
                  {item.order_locations.client_number} -{' '}
                  {item.order_locations.client_district} -{' '}
                  {item.order_locations.client_city.name} /{' '}
                  {item.order_locations.client_city.state.acronym}
                </Typography>
                <hr />
                <Typography>
                  <b>Situação:</b> {item.status.name}
                </Typography>
              </div>
            </Col>
          ))
        ) : (
          <Col span={24}>
            {/* <Typography style={{textAlign: 'center', textTransform: 'uppercase', color: '#000000ab'}}>Nenhuma caçamba encontrada</Typography> */}
          </Col>
        )}
      </Row>
    </div>
  );
}
