// BIBLIOTECAS REACT

import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Modal, message, Row, Tag } from 'antd';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

// COMPONENTES
import Table from '../../../../../components/Table';
import {
  TableNewButton,
  TableTrEditButton,
  TableTrQrCodeButton,
  TableTrRecoverButton,
  TableTrTrashButton,
} from '../../../../../components/Table/buttons';
// SERVIÇOS
import {
  type PageDefaultProps,
  POST_API,
  POST_CATCH,
  verifyConfig,
} from '../../../../../services';

interface StationaryBucketItensListProps extends PageDefaultProps {
  backTab: () => void;
}

const StationaryBucketItensList = ({
  type,
  path,
  permission,
  backTab,
}: StationaryBucketItensListProps) => {
  const [pageType, setPageType] = useState(type);

  // PARAMETROS
  const { ID } = useParams();

  // ESTADOS DO COMPONENTE
  const [action, setAction] = useState(false);
  const [open, setOpen] = useState(false);
  const [load, setLoad] = useState(false);

  const updateStationary = (item: any) => {
    Modal.confirm({
      title: "Mudar situação da caçamba para 'Disponível'?",
      icon: <ExclamationCircleOutlined />,
      cancelText: 'Não',
      okText: 'Sim',
      onOk() {
        POST_API('/stationary_bucket', { status: 'D' }, item.id)
          .then((rs) => {
            if (rs.ok) {
              setAction(!action);
              Modal.success({
                title: 'Sucesso',
                content: 'Caçamba atualizada com sucesso',
              });
            } else {
              Modal.warning({
                title: 'Algo deu errado',
                content: 'Não foi possível atualizar caçamba',
              });
            }
          })
          .catch(POST_CATCH);
      },
    });
  };

  // DEFINE COLUNAS DA TABELA
  const column = [
    {
      title: 'Código',
      dataIndex: 'code',
      table: 'code',
      width: 'auto',
      minWidth: '200px',
      sorter: true,
      align: 'left',
      render: null,
    },
    {
      title: 'Situação',
      dataIndex: 'status_name',
      table: 'status',
      width: '200px',
      sorter: true,
      align: 'center',
      render: (item: any) => (
        <Row justify={'center'} style={{ width: '100%' }}>
          <Tag
            color={item.status.color}
            onClick={() =>
              item.status.code === 'ML' ? updateStationary(item) : null
            }
            style={{
              margin: 0,
              cursor: item.status.code === 'ML' ? 'pointer' : 'default',
            }}
          >
            {item.status.name}
          </Tag>
        </Row>
      ),
    },
    {
      title: 'Ações',
      dataIndex: null,
      width: '120px',
      sorter: false,
      align: 'center',
      render: (item: any) => (
        <Row justify={'center'} style={{ width: '100%' }}>
          <TableTrQrCodeButton
            item={item}
            permission={permission}
            type={type}
          />
          <TableTrEditButton
            item={{ id: `itens/${item.id}` }}
            permission={permission}
            type={type}
          />
          <TableTrTrashButton
            action={() => setAction(!action)}
            item={item}
            path={path}
            permission={permission}
            type={type}
          />
          <TableTrRecoverButton
            action={() => setAction(!action)}
            item={item}
            path={path}
            permission={permission}
            type={type}
          />
        </Row>
      ),
    },
  ];

  const [form] = Form.useForm();

  const onSend = (values: any) => {
    setLoad(true);
    values.stationary_bucket_group_id = ID;
    POST_API(`/${path}/gerar`, values)
      .then((rs) => {
        if (rs.ok) {
          message.success('Salvo com sucesso!');
          setAction(!action);
          setOpen(false);
        } else {
          Modal.warning({ title: 'Algo deu errado', content: rs.statusText });
        }
      })
      .catch(POST_CATCH)
      .finally(() => setLoad(false));
  };

  return (
    <>
      <Row gutter={[8, 8]} justify={'end'} style={{ marginBottom: '15px' }}>
        <Col>
          <Button
            className="page-default-button-primary"
            onClick={() => setOpen(true)}
            size="small"
            type="primary"
          >
            Gerar Códigos
          </Button>
        </Col>
        {/* <TableNewButton type={pageType} permission={permission} buttonStyles={{ type: 'primary' }} link="itens/novo" /> */}
        {verifyConfig([`${permission}.trash`]) && (
          <Col>
            <Button
              className="page-default-button-primary"
              onClick={() => setPageType(pageType === 'add' ? 'trash' : 'add')}
              size="small"
              type="primary"
            >
              {pageType === 'add' ? 'lista' : 'lixeira'}
            </Button>
          </Col>
        )}
      </Row>

      <Table
        action={action}
        column={column}
        defaultFilter={{ group_id: ID }}
        path={path}
        type={pageType}
        useFilter={[
          {
            type: 'select',
            name: 'status',
            label: 'Situação',
            items: [
              { value: 'D', label: 'Disponível' },
              { value: 'EP', label: 'Entrega pendente' },
              { value: 'ETL', label: 'Em trânsito para locação' },
              { value: 'L', label: 'Locada' },
              { value: 'AR', label: 'Aguardando retirada' },
              { value: 'ETR', label: 'Em trânsito para descarte' },
            ],
          },
        ]}
      />

      <Button
        onClick={backTab}
        style={{ float: 'right', marginTop: '25px' }}
        type="default"
      >
        Voltar
      </Button>

      <Modal
        cancelText="Cancelar"
        confirmLoading={load}
        destroyOnClose
        okText="Gerar"
        onCancel={() => setOpen(false)}
        onOk={form.submit}
        open={open}
        title="Gerar códigos aleatórios"
      >
        <Form form={form} layout="vertical" onFinish={onSend}>
          <Form.Item
            label="Quantidade de códigos gerados"
            name={'quantity'}
            rules={[{ required: true, message: 'Campo obrigatório!' }]}
          >
            <Input placeholder="Quantidade de códigos gerados" type="number" />
          </Form.Item>
          <Form.Item
            label="Quantidade de caracteres por código"
            name={'caracters'}
            rules={[{ required: true, message: 'Campo obrigatório!' }]}
          >
            <Input
              placeholder="Quantidade de caracteres por código"
              type="number"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default StationaryBucketItensList;
