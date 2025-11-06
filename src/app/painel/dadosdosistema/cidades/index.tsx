// react libraries

import { Col, Modal, Row, Tag, Typography } from 'antd';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import CardItem from '../../../../components/CardItem';
import PageDefault from '../../../../components/PageDefault';
// components
import Table from '../../../../components/Table';

// services
import {
  type PageDefaultProps,
  POST_API,
  POST_CATCH,
} from '../../../../services';

const CityList = ({ type, path, permission }: PageDefaultProps) => {
  // state
  const [action, setAction] = useState(false);

  // table columns
  const column = [
    {
      title: 'Nome',
      dataIndex: 'name',
      table: 'cities.name',
      width: 'auto',
      minWidth: '200px',
      sorter: true,
      align: 'left',
      render: (item: any) => <Typography>{item.name}</Typography>,
    },
    {
      title: 'Estado',
      dataIndex: 'state.name',
      table: 'states.acronym',
      width: '150px',
      sorter: true,
      align: 'left',
      render: null,
    },
    {
      title: 'IBGE',
      dataIndex: 'ibge_code',
      table: 'cities.ibge_code',
      width: '100px',
      sorter: true,
      align: 'center',
      render: null,
    },
    {
      title: 'Recebe ao finalizar processo',
      dataIndex: 'receive_only_finished',
      table: 'cities.receive_only_finished',
      width: '200px',
      sorter: true,
      align: 'center',
      render: (item: any) => (
        <Row justify={'center'} style={{ width: '100%' }}>
          <Tag
            color={item.receive_only_finished_color}
            onClick={() => onChange(item, 'receive_only_finished')}
            style={{
              margin: 0,
              width: '100%',
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            {item.receive_only_finished_name}
          </Tag>
        </Row>
      ),
    },
    {
      title: 'Validação da prefeitura',
      dataIndex: 'municipal_approval',
      table: 'cities.municipal_approval',
      width: '160px',
      sorter: true,
      align: 'center',
      render: (item: any) => (
        <Row justify={'center'} style={{ width: '100%' }}>
          <Tag
            color={item.municipal_approval_color}
            onClick={() => onChange(item, 'municipal_approval')}
            style={{
              margin: 0,
              width: '100%',
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            {item.municipal_approval_name}
          </Tag>
        </Row>
      ),
    },
  ];

  const onChange = (item: any, field: string) => {
    Modal.confirm({
      title: 'Atenção',
      content: `Deseja alterar o valor para ${item[field] === 1 ? 'NÃO' : 'SIM'}?`,
      okText: 'Sim',
      cancelText: 'Não',
      onOk: () => {
        POST_API(`/${path}`, { [field]: item[field] === 1 ? 0 : 1 }, item.id)
          .then((rs) => {
            if (rs.ok) setAction(!action);
            else
              Modal.warning({
                title: 'Algo deu errado',
                content: rs.statusText,
              });
          })
          .catch(POST_CATCH);
      },
    });
  };

  return (
    <PageDefault
      items={[
        { title: <Link to={type === 'list' ? '#' : '..'}>Cidades</Link> },
        { title: type === 'list' ? 'Lista' : 'Lixeira' },
      ]}
      valid={`${permission}.${type}`}
    >
      <Row gutter={[16, 16]}>
        <Col md={24} xs={24}>
          <CardItem>
            <Table
              action={action}
              column={column}
              path={path}
              type={type}
              useFilter={[
                {
                  type: 'search',
                  name: 'state',
                  label: 'Estado',
                  url: '/state',
                  labelField: ['acronym', 'name'],
                },
              ]}
            />
          </CardItem>
        </Col>
      </Row>
    </PageDefault>
  );
};

export default CityList;
