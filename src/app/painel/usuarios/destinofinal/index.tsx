// react libraries

import { ExclamationCircleOutlined } from '@ant-design/icons';
import {
  Avatar,
  Col,
  Modal,
  message,
  Row,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';
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
  TableTrPassword,
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

const FinalDestinationList = ({ type, path, permission }: PageDefaultProps) => {
  // states
  const [action, setAction] = useState<boolean>(false);
  const [approve, setApprove] = useState<boolean>(false);

  const onLicense = (item: any) => {
    Modal.confirm({
      title: 'Mudar situação da licença ambiental para:',
      icon: <ExclamationCircleOutlined />,
      cancelText: 'Recusar',
      okText: 'Aprovar',
      closable: true,
      onOk() {
        message.open({
          type: 'loading',
          content: 'Atualizando...',
          key: 'screen',
        });
        POST_API('/user', { environmental_license_verify: 'y' }, item.id)
          .then((rs) => {
            if (rs.ok) {
              message.success({
                content: 'Situação atualizada',
                key: 'screen',
              });
              setAction(!action);
            } else {
              Modal.warning({
                title: 'Algo deu errado',
                content: 'Não foi possível atualizar situação.',
              });
            }
          })
          .catch(POST_CATCH);
      },
      onCancel() {
        message.open({
          type: 'loading',
          content: 'Atualizando...',
          key: 'screen',
        });
        POST_API('/user', { environmental_license_verify: 'n' }, item.id)
          .then((rs) => {
            if (rs.ok) {
              message.success({
                content: 'Situação atualizada',
                key: 'screen',
              });
              setAction(!action);
            } else {
              Modal.warning({
                title: 'Algo deu errado',
                content: 'Não foi possível atualizar situação.',
              });
            }
          })
          .catch(POST_CATCH);
      },
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
      title: 'Ações',
      dataIndex: null,
      width: '120px',
      hide: getProfileType() === 'CITY' && !approve,
      sorter: false,
      align: 'center',
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
          {/* <TableTrPassword type={type} permission={permission} item={item} action={() => setAction(!action)} path="user" /> */}
        </Row>
      ),
    },
  ];

  return (
    <PageDefault
      items={[
        { title: <Link to={type === 'list' ? '#' : '..'}>Destino final</Link> },
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
                  : [
                      {
                        type: 'select',
                        name: 'municipalApproval',
                        label: 'Situação',
                        items: [
                          { value: 1, label: 'Aprovado' },
                          { value: 0, label: 'Recusado / Aguardando' },
                        ],
                      },
                    ]
              }
            />
          </CardItem>
        </Col>
      </Row>
    </PageDefault>
  );
};

export default FinalDestinationList;
