/** biome-ignore-all lint/suspicious/noExplicitAny: ignorar */
import { Col, Row, Tag, Typography } from 'antd';
import { useState } from 'react';
import Table from '@/components/Table';

export default function RelatorioLocacoesTable() {
  const [action] = useState<boolean>(false);

  const column = [
    {
      title: 'Data Pedido',
      dataIndex: 'created_at',
      table: 'order_locations.created_at',
      width: '160px',
      sorter: true,
      align: 'center',
      render: (item: any) => (
        <Row justify="center" style={{ width: '100%' }}>
          <Col span={24}>
            <Typography
              style={{ color: 'var(--color01)', textAlign: 'center' }}
            >
              {item.created_at}
            </Typography>
            <Tag color={item.status.code === 'CDFE' ? 'green' : 'orange'}>
              {item.status.code === 'CDFE' ? 'Concluído' : 'Em andamento'}
            </Tag>
          </Col>
        </Row>
      ),
    },
    {
      title: 'Detalhes locação',
      dataIndex: 'created_at',
      table: 'order_locations.created_at',
      width: 'auto',
      minWidth: '400px',
      sorter: false,
      align: 'left',
      render: (item: any) => (
        <Row>
          <Col span={24}>
            <Typography style={{ color: 'var(--color01)' }}>
              {item.product.stationary_bucket_group.stationary_bucket_type.name}{' '}
              - <b>{item.product.code}</b>
            </Typography>
            <hr />
            <Typography>
              Locatário: <b>{item.order_locations.client.name}</b>
            </Typography>
            <Typography>
              Endereço:{' '}
              <b>
                {item.order_locations.client_street}{' '}
                {item.order_locations.client_number},{' '}
                {item.order_locations.client_district} -{' '}
                {item.order_locations.client_city.name}/
                {item.order_locations.client_city.state.acronym}
              </b>
            </Typography>
            <Typography>
              Data locação:{' '}
              <b>{item.location_date ? item.location_date_format : '-'}</b>
            </Typography>
            {item.destination?.name && (
              <>
                <hr />
                <Typography>
                  Destino final: <b>{item.destination.name ?? '-'}</b>
                </Typography>
                <Typography>
                  Endereço:{' '}
                  <b>
                    {item.final_destination_street}{' '}
                    {item.final_destination_number},{' '}
                    {item.final_destination_district} -{' '}
                    {item.final_destination_city.name}/
                    {item.final_destination_city.state.acronym}
                  </b>
                </Typography>
                <Typography>
                  Data retirada:{' '}
                  <b>{item.withdraw_date ? item.withdraw_date_format : '-'}</b>
                </Typography>
              </>
            )}
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <Table
      {...{ action, column }}
      path="reports/locations"
      type="list"
      useFilter={[
        { type: 'date', field: 'created_at', label: 'Data Início' },
        { type: 'date', field: 'created_at', label: 'Data Final' },
      ]}
    />
  );
}
