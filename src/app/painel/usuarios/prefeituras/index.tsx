import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Col, Modal, message, Popover, Row, Tag } from 'antd';
import { useState } from 'react';
import { LuClipboardPenLine } from 'react-icons/lu';
import { TbLockAccess, TbLockAccessOff, TbPencil } from 'react-icons/tb';

import { Link } from 'react-router-dom';
// components
import CardItem from '../../../../components/CardItem';
import PageDefault from '../../../../components/PageDefault';
import Table from '../../../../components/Table';
// services
import {
  DELETE_API,
  type PageDefaultProps,
  POST_CATCH,
} from '../../../../services';

const CityhallList = ({ type, path, permission }: PageDefaultProps) => {
  // states
  const [action, setAction] = useState(false);

  const onDelete = (id: number) => {
    Modal.confirm({
      title: 'Bloquear acesso?',
      icon: <ExclamationCircleOutlined />,
      cancelText: 'Não',
      okText: 'Sim',
      onOk() {
        message.open({
          type: 'loading',
          content: 'Deletando...',
          key: 'screen',
        });
        DELETE_API(`/cityhall/${id}`)
          .then((rs) => {
            if (rs.ok) {
              message.success({
                content: 'Deletado com sucesso',
                key: 'screen',
              });
              setAction(!action);
            } else {
              Modal.warning({
                title: 'Algo deu errado',
                content: 'Não foi possível deletar registro.',
              });
            }
          })
          .catch(POST_CATCH);
      },
      onCancel() {},
    });
  };

  // table columns
  const column = [
    {
      title: 'Acesso',
      table: 'users.id',
      width: '100px',
      sorter: true,
      align: 'center',
      render: (item: any) => (
        <Row style={{ width: '100%' }}>
          <Col span={24}>
            <Tag
              color={item.access.color}
              style={{ marginRight: 0, width: '100%' }}
            >
              {item.access.name}
            </Tag>
          </Col>
        </Row>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'state.acronym',
      table: 'states.name',
      width: '80px',
      sorter: true,
      align: 'center',
      render: null,
    },
    {
      title: 'Cidade',
      dataIndex: 'name',
      table: 'cities.name',
      width: 'auto',
      minWidth: '200px',
      sorter: true,
      align: 'left',
      render: null,
    },
    {
      title: 'Contato',
      dataIndex: 'user.email',
      table: 'users.email',
      width: '300px',
      sorter: true,
      align: 'left',
      render: null,
    },
    {
      title: 'Login',
      dataIndex: 'user.document_number',
      table: 'users.document_number',
      width: '200px',
      sorter: true,
      align: 'center',
      render: null,
    },
    {
      title: 'Ações',
      dataIndex: null,
      width: '100px',
      sorter: false,
      align: 'center',
      render: (item: any) => (
        <Row justify={'center'} style={{ width: '100%' }}>
          {item.user ? (
            <>
              <Col>
                <Link to={`${item.id}/populardados`}>
                  <Popover content="Popular dados" trigger="hover">
                    <LuClipboardPenLine className="actions-button" size={18} />
                  </Popover>
                </Link>
              </Col>
              <Col>
                <Link to={`${item.id}/${item.user.id}`}>
                  <Popover content="Editar" trigger="hover">
                    <TbPencil className="actions-button" size={18} />
                  </Popover>
                </Link>
              </Col>
              <Col>
                <Popover content="Cancelar acesso" trigger="hover">
                  <TbLockAccessOff
                    className="actions-button"
                    onClick={() => onDelete(item.id)}
                    size={18}
                  />
                </Popover>
              </Col>
            </>
          ) : (
            <Col>
              <Link to={String(item.id)}>
                <Popover content="Liberar acesso" trigger="hover">
                  <TbLockAccess className="actions-button" size={18} />
                </Popover>
              </Link>
            </Col>
          )}
        </Row>
      ),
    },
  ];

  return (
    <PageDefault
      items={[
        { title: <Link to={type === 'list' ? '#' : '..'}>Prefeituras</Link> },
        { title: type === 'list' ? 'Lista' : 'Lixeira' },
      ]}
      options={<Row gutter={[8, 8]} justify={'end'} />}
      valid={`${permission}.${type}`}
    >
      <Row gutter={[16, 16]}>
        <Col md={24} xs={24}>
          <CardItem>
            <Table
              action={action}
              column={column}
              path={path}
              sorterActive={{ selectColumn: 'users.id', order: 'DESC' }}
              type={type}
            />
          </CardItem>
        </Col>
      </Row>
    </PageDefault>
  );
};

export default CityhallList;
