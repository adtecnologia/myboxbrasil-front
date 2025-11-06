/** biome-ignore-all lint/suspicious/noExplicitAny: ignorar */

import { Col, Popover, Row, Tag, Typography } from 'antd';
import { useState } from 'react';
import { TbEye } from 'react-icons/tb';
import { Link } from 'react-router-dom';
import CardItem from '../../../components/CardItem';
// components
import PageDefault from '../../../components/PageDefault';
import Table from '../../../components/Table';
// services
import { getProfileType, type PageDefaultProps } from '../../../services';

const ReportList = ({ type, path, permission }: PageDefaultProps) => {
  // state
  const [action] = useState(false);

  // table columns
  const column = [
    {
      title: 'Data e hora',
      dataIndex: 'created_at',
      table: 'created_at',
      width: '160px',
      sorter: true,
      align: 'center',
      render: null,
    },
    {
      title: 'Ocorrência',
      dataIndex: 'description',
      table: 'description',
      width: 'auto',
      minWidth: '200px',
      sorter: true,
      align: 'left',
      render: (item: any) => (
        <Row style={{ width: '100%' }}>
          <Col>
            <Tag color={item.type === 'ROUTE' ? 'red' : 'blue'}>
              {item.type === 'ROUTE' ? 'Rota' : 'Caçamba'}
            </Tag>
          </Col>
          <Col span={24}>
            <Typography>{item.description}</Typography>
          </Col>
        </Row>
      ),
    },
    {
      title: 'Locatário',
      dataIndex: 'order_location_product.client.name',
      table: 'order_location_product.client.name',
      width: '200px',
      sorter: false,
      align: 'center',
      render: null,
    },
    {
      title: 'Locador',
      dataIndex: 'order_location_product.provider.name',
      table: 'order_location_product.provider.name',
      width: '200px',
      sorter: false,
      align: 'center',
      render: null,
    },
    {
      title: 'Realizado por',
      dataIndex: 'user',
      table: 'user_id',
      width: '200px',
      sorter: true,
      align: 'center',
      render: null,
      hide: getProfileType() === 'TAX',
    },
    {
      title: 'Ações',
      dataIndex: null,
      width: '80px',
      sorter: false,
      align: 'center',
      render: (item: any) => (
        <Row justify={'center'} style={{ width: '100%' }}>
          <Col>
            <Link to={String(item.id)}>
              <Popover content="Visualizar" trigger="hover">
                <TbEye className="actions-button" size={18} />
              </Popover>
            </Link>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <PageDefault
      items={[
        { title: <Link to={type === 'list' ? '#' : '..'}>Ocorrências</Link> },
        { title: type === 'list' ? 'Lista' : 'Lixeira' },
      ]}
      valid={`${permission}.${type}`}
    >
      <Row gutter={[16, 16]}>
        <Col md={24} xs={24}>
          <CardItem>
            <Table action={action} column={column} path={path} type={type} />
          </CardItem>
        </Col>
      </Row>
    </PageDefault>
  );
};

export default ReportList;
