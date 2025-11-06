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
  verifyConfig,
} from '@/services';

const TermOfUseList = ({ type, path, permission }: PageDefaultProps) => {
  // state
  const [action, setAction] = useState(false);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // table columns
  const column = [
    {
      title: 'Data',
      dataIndex: 'created_at',
      table: 'created_at',
      width: '160px',
      sorter: true,
      align: 'center',
      render: null,
    },
    {
      title: 'Versão',
      dataIndex: 'version',
      table: 'version',
      width: '100px',
      sorter: true,
      align: 'center',
      render: (item: any) => (
        <Row justify={'center'} style={{ width: '100%' }}>
          <Link target="_blank" to={item.document}>
            {item.version}
          </Link>
        </Row>
      ),
    },
    {
      title: 'Título',
      dataIndex: 'title',
      table: 'title',
      width: 'auto',
      minWidth: '200px',
      sorter: true,
      align: 'left',
      render: null,
    },
    {
      title: 'Situação',
      dataIndex: 'active',
      table: 'active',
      width: '100px',
      sorter: true,
      align: 'center',
      render: (item: any) => (
        <Row justify={'center'} style={{ width: '100%' }}>
          <Col>
            {item.active ? (
              <Tag color="green" style={{ marginRight: 0 }}>
                Em vigência
              </Tag>
            ) : (
              <Tag color="red" style={{ marginRight: 0 }}>
                Arquivado
              </Tag>
            )}
          </Col>
        </Row>
      ),
    },
    {
      title: 'Upload feito por',
      dataIndex: 'user.name',
      table: 'user_id',
      width: '180px',
      sorter: true,
      align: 'center',
      render: null,
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
        { title: <Link to={type === 'list' ? '#' : '..'}>Termos de uso</Link> },
        { title: type === 'list' ? 'Lista' : 'Lixeira' },
      ]}
      options={
        <Row gutter={[8, 8]} justify={'end'}>
          {verifyConfig([`${permission}.add`]) && (
            <Col>
              <Button
                className="page-default-button-primary"
                onClick={() => setModal(true)}
                size="small"
                type={'primary'}
              >
                atualizar documento
              </Button>
            </Col>
          )}
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

export default TermOfUseList;
