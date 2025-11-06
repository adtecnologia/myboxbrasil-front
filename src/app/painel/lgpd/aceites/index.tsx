/** biome-ignore-all lint/suspicious/noExplicitAny: ignorar */
import { InboxOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  message,
  Row,
  Tag,
  Typography,
  Upload,
} from 'antd';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import CardItem from '@/components/CardItem';
// components
import PageDefault from '@/components/PageDefault';
import Table from '@/components/Table';
// services
import {
  getUPLOADAPI,
  type PageDefaultProps,
  POST_API,
  POST_CATCH,
} from '@/services';

const AcceptList = ({ type, path, permission }: PageDefaultProps) => {
  // state
  const [action, setAction] = useState(false);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // table columns
  const column = [
    {
      title: 'Data e hora',
      dataIndex: 'accepted_at',
      table: 'accepted_at',
      width: '160px',
      sorter: true,
      align: 'center',
      render: null,
    },
    {
      title: 'Usuário',
      dataIndex: 'user.name',
      table: 'users.name',
      width: '200px',
      sorter: true,
      align: 'left',
      render: null,
    },
    {
      title: 'Documento',
      dataIndex: 'title',
      table: 'title',
      width: '200px',
      sorter: true,
      align: 'left',
      render: (item: any) => {
        if (item.privacy_policy) {
          return (
            <Row gutter={[8, 8]} justify={'start'} style={{ width: '100%' }}>
              <Col>
                <Typography>Política de privacidade</Typography>
              </Col>
              <Col>
                <Tag color={item.privacy_policy.active ? 'green' : 'red'}>
                  {item.privacy_policy.version}
                </Tag>
              </Col>
            </Row>
          );
        }
        if (item.term_of_use) {
          return (
            <Row gutter={[8, 8]} justify={'start'} style={{ width: '100%' }}>
              <Col>
                <Typography>Termos de uso</Typography>
              </Col>
              <Col>
                <Tag color={item.term_of_use.active ? 'green' : 'red'}>
                  {item.term_of_use.version}
                </Tag>
              </Col>
            </Row>
          );
        }
      },
    },
    {
      title: 'Visualizar dados',
      dataIndex: 'device',
      table: 'device',
      minWidth: '200px',
      width: 'auto',
      sorter: true,
      align: 'center',
      render: (item: any) => (
        <Row justify={'center'}>
          <Col span={24}>
            <Typography>
              <b>IP:</b> {item.ip_address}
            </Typography>
            <Typography>
              <b>Dispositivo:</b> {item.device}
            </Typography>
            <Typography>
              <b>S.O.:</b> {item.os}
            </Typography>
            <Typography>
              <b>Navegador:</b> {item.browser}
            </Typography>
            <Typography>
              <b>Agente:</b> {item.user_agent}
            </Typography>
          </Col>
        </Row>
      ),
    },
  ];

  const onSend = (values: any) => {
    values.document = values.document.file.response.url;
    setLoading(true);
    POST_API('/term_of_use', values)
      .then((rs) => {
        if (rs.ok) {
          message.success('Salvo com sucesso!');
          setAction(!action);
          setModal(false);
        } else {
          Modal.warning({ title: 'Algo deu errado', content: rs.statusText });
        }
      })
      .catch(POST_CATCH)
      .finally(() => setLoading(false));
  };

  return (
    <PageDefault
      items={[
        {
          title: (
            <Link to={type === 'list' ? '#' : '..'}>Aceites dos usuários</Link>
          ),
        },
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
              sorterActive={{ selectColumn: 'created_at', order: 'DESC' }}
              type={type}
            />
          </CardItem>
        </Col>
      </Row>
      <Modal
        closable={false}
        destroyOnHidden
        footer={false}
        onCancel={() => setModal(false)}
        open={modal}
        style={{ top: 20 }}
        title="Atualizar termo de uso"
      >
        <Form layout="vertical" onFinish={onSend}>
          <Form.Item
            label="Título"
            name="title"
            rules={[{ required: true, message: 'Campo obrigatório!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Versão"
            name="version"
            rules={[{ required: true, message: 'Campo obrigatório!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Documento"
            name="document"
            rules={[{ required: true, message: 'Campo obrigatório!' }]}
          >
            <Upload.Dragger
              accept="application/pdf"
              action={getUPLOADAPI}
              maxCount={1}
              showUploadList={true}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Clique aqui ou arraste o documento para essa área.
              </p>
              <p className="ant-upload-hint">Suporte para upload único.</p>
            </Upload.Dragger>
          </Form.Item>
          <Row gutter={[8, 8]} justify={'end'}>
            <Col>
              <Button onClick={() => setModal(false)} type="default">
                Cancelar
              </Button>
            </Col>
            <Col>
              <Button htmlType="submit" loading={loading} type="primary">
                Enviar arquivo
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>
    </PageDefault>
  );
};

export default AcceptList;
