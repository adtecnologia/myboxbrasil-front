// react libraries

import { ExclamationCircleOutlined } from '@ant-design/icons';
import {
  Avatar,
  Col,
  Input,
  InputNumber,
  Modal,
  message,
  Row,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import { HiDesktopComputer } from 'react-icons/hi';
import { IoSaveOutline } from 'react-icons/io5';
import { TbClipboardSearch } from 'react-icons/tb';
import { Link } from 'react-router-dom';
import CardItem from '../../../../components/CardItem';
import PageDefault from '../../../../components/PageDefault';
// components
import Table from '../../../../components/Table';
import {
  TableNewButton,
  TableReturnButton,
  TableTrashButton,
  TableTrEditButton,
  TableTrPhotoButton,
  TableTrRecoverButton,
  TableTrTrashButton,
} from '../../../../components/Table/buttons';
// services
import {
  GET_API,
  getProfileType,
  type PageDefaultProps,
  POST_API,
  POST_CATCH,
} from '../../../../services';

const LandlordList = ({ type, path, permission }: PageDefaultProps) => {
  // states
  const [action, setAction] = useState<boolean>(false);

  const [approve, setApprove] = useState<boolean>(false);

  const onSaveConfig = (user: any) => {
    var value: any = window.document.getElementById(`user${user}`);

    Modal.confirm({
      title: 'Mudar valor da taxa apra esse usuário?',
      icon: <ExclamationCircleOutlined />,
      cancelText: 'Não',
      okText: 'Sim',
      onOk() {
        POST_API('/user', { tax: Number(value.value) }, user)
          .then((rs) => {
            if (rs.ok) {
              message.success({ content: 'Taxa atualizada', key: 'screen' });
              setAction(!action);
            } else {
              Modal.warning({
                title: 'Algo deu errado',
                content: 'Não foi possível atualizar taxa.',
              });
            }
          })
          .catch(POST_CATCH);
      },
      onCancel() {},
    });
  };

  useEffect(() => {
    GET_API('/me')
      .then((rs) => rs.json())
      .then((res) => {
        setApprove(res.data.address.city.municipal_approval === 1);
      });
  }, []);

  // table columns
  const column = [
    {
      title: 'Logo',
      dataIndex: 'photo',
      table: 'photo',
      width: '60px',
      sorter: false,
      align: 'center',
      render: (item: any) => (
        <Row justify={'center'} style={{ width: '100%' }}>
          <Avatar src={item.photo ? item.photo : null} />
        </Row>
      ),
    },
    {
      title: 'Nome',
      dataIndex: 'name',
      table: 'name',
      width: 'auto',
      minWidth: '200px',
      sorter: true,
      align: 'left',
      render: null,
    },
    {
      title: 'Licença ambiental',
      dataIndex: 'environmental_license',
      table: 'environmental_license',
      width: '200px',
      sorter: true,
      align: 'center',
      render: (item: any) => (
        <Row justify={'center'} style={{ width: '100%' }}>
          <Col span={24}>
            {item.environmental_license ? (
              <Typography style={{ textAlign: 'center' }}>
                <Link target="_blank" to={item.environmental_license}>
                  Anexo licença ambiental
                </Link>
                <center>
                  <Tooltip title="Validade">
                    <Typography>
                      {item.environmental_license_expiration_format}
                    </Typography>
                  </Tooltip>
                </center>
              </Typography>
            ) : (
              <Typography style={{ textAlign: 'center' }}>Sem anexo</Typography>
            )}
            {getProfileType() === 'CITY' && approve && (
              <Tag
                color={item.municipal_approval === 1 ? 'green' : 'warning'}
                style={{ width: '100%' }}
              >
                {item.municipal_approval === 1
                  ? 'Aprovado'
                  : 'Recusado / Aguardando'}
              </Tag>
            )}
          </Col>
        </Row>
      ),
    },
    {
      title: 'CPF/CNPJ',
      dataIndex: 'document_number',
      table: 'document_number',
      width: '200px',
      sorter: true,
      align: 'center',
      render: null,
    },
    {
      title: 'Cidade',
      dataIndex: 'address.city.name',
      table: 'cities.name',
      width: '150px',
      sorter: true,
      align: 'center',
      render: null,
    },
    {
      title: 'Estado',
      dataIndex: 'address.city.state.name',
      table: 'states.name',
      width: '100px',
      sorter: true,
      align: 'center',
      render: null,
    },
    {
      title: 'Taxa',
      dataIndex: 'tax',
      table: 'tax',
      width: '100px',
      sorter: false,
      align: 'center',
      hide: getProfileType() === 'CITY',
      render: (item: any) => (
        <InputNumber
          addonAfter={
            <IoSaveOutline
              onClick={(e: any) => onSaveConfig(item.id)}
              style={{ cursor: 'pointer' }}
            />
          }
          defaultValue={item.tax || 0}
          id={`user${item.id}`}
          size="small"
        />
      ),
    },
    {
      title: 'Ações',
      dataIndex: null,
      width: '120px',
      sorter: false,
      align: 'center',
      hide: getProfileType() === 'CITY' && !approve,
      render: (item: any) => (
        <Row justify={'center'} style={{ width: '100%' }}>
          <TableTrPhotoButton
            action={() => setAction(!action)}
            item={item}
            permission={permission}
            type={type}
          />
          <TableTrEditButton item={item} permission={permission} type={type} />
          <TableTrTrashButton
            action={() => setAction(!action)}
            item={item}
            path="user"
            permission={permission}
            type={type}
          />
          <TableTrRecoverButton
            action={() => setAction(!action)}
            item={item}
            path="user"
            permission={permission}
            type={type}
          />
          {getProfileType() === 'CITY' && (
            <Col>
              <Tooltip title="Validar Cadastro">
                <Link to={`${item.id}/validacao`}>
                  <TbClipboardSearch className="actions-button" size={18} />
                </Link>
              </Tooltip>
            </Col>
          )}
        </Row>
      ),
    },
  ];

  return (
    <PageDefault
      items={[
        { title: <Link to={type === 'list' ? '#' : '..'}>Locadores</Link> },
        { title: type === 'list' ? 'Lista' : 'Lixeira' },
      ]}
      options={
        <Row gutter={[8, 8]} justify={'end'}>
          <TableNewButton permission={permission} type={type} />
          <TableTrashButton permission={permission} type={type} />
          <TableReturnButton permission={permission} type={type} />
        </Row>
      }
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
              useFilter={
                getProfileType() === 'ADMIN' ||
                getProfileType() === 'ADMIN_EMPLOYEE'
                  ? [
                      {
                        type: 'search',
                        name: 'state',
                        label: 'Estado',
                        url: '/state',
                        labelField: ['acronym', 'name'],
                      },
                      {
                        type: 'search',
                        name: 'city',
                        label: 'Cidade',
                        url: '/city',
                        labelField: 'name',
                      },
                    ]
                  : []
              }
            />
          </CardItem>
        </Col>
      </Row>
    </PageDefault>
  );
};

export default LandlordList;
