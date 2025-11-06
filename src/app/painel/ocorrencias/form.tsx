/** biome-ignore-all lint/nursery/noNoninteractiveElementInteractions: ignorar */
/** biome-ignore-all lint/suspicious/noExplicitAny: ignorar */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: ignorar */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: ignorar */

import { InboxOutlined } from '@ant-design/icons';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  message,
  Row,
  Statistic,
  Typography,
  Upload,
} from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// components
import CardItem from '../../../components/CardItem';
import PageDefault from '../../../components/PageDefault';
import { TableReturnButton } from '../../../components/Table/buttons';
// services
import {
  GET_API,
  getProfileID,
  getToken,
  getUPLOADAPI,
  type PageDefaultProps,
  POST_API,
  POST_CATCH,
} from '../../../services';

const ReportForm = ({ permission }: PageDefaultProps) => {
  // RESPONSAVEL PELA ROTA
  const navigate = useNavigate();

  // ESTADOS DO COMPONENTE
  const [type, setType] = useState<'' | 'stationary' | 'route'>('');
  const [modalStationary, setModalStationary] = useState<boolean>(false);
  const [product, setProduct] = useState<any>();
  const [loadButton, setLoadButton] = useState<boolean>(false);

  // CAMPOS FORMULARIO
  const [form] = Form.useForm();

  const onReader = (param: string) => {
    setLoadButton(true);
    GET_API(`/order_location_product?${param}`)
      .then((rs) => rs.json())
      .then((res) => {
        if (res.data.length > 0) {
          setProduct(res.data[0]);
          setModalStationary(false);
          message.success({ content: 'Caçamba encontrada', key: '09op' });
        } else {
          message.error({ content: 'Caçamba não encontrada', key: '09op' });
        }
      })
      .catch(POST_CATCH)
      .finally(() => setLoadButton(false));
  };

  const reader = (result: any) => {
    if (result[0].rawValue) {
      onReader(`code=${result[0].rawValue}`);
    }
  };

  const readerWrite = (result: any) => {
    if (result) {
      onReader(`code=${result}`);
    }
  };

  // FUNÇÃO SALVAR
  const onSend = (values: any) => {
    const urls = values.archives.fileList.map((file: any) => file.response.url);
    setLoadButton(true);
    POST_API('/report', {
      ...values,
      order_location_product_id: product.id,
      type,
      archives: urls,
    })
      .then((rs) => {
        if (rs.ok) {
          message.success('Salvo com sucesso!');
          navigate('..');
        } else {
          Modal.warning({ title: 'Algo deu errado', content: rs.statusText });
        }
      })
      .catch(POST_CATCH)
      .finally(() => setLoadButton(false));
  };

  return (
    <PageDefault
      items={[
        { title: <Link to={'..'}>Ocorrências</Link> },
        { title: 'Nova ocorrência' },
      ]}
      options={
        <Row gutter={[8, 8]} justify={'end'}>
          <TableReturnButton permission={permission} type={'add'} />
        </Row>
      }
      valid={`${permission}.add`}
    >
      <Row gutter={[16, 16]}>
        <Col md={24} xs={24}>
          <CardItem title="Qual o tipo da ocorrência?">
            <Row gutter={[16, 16]}>
              <Col md={12} xs={24}>
                <div
                  className={`pd-painel ${type === 'stationary' && 'active'}`}
                  onClick={() => {
                    setType('stationary');
                    setModalStationary(true);
                  }}
                  style={{
                    backgroundImage: `url(${import.meta.env.VITE_URL_ASSETS}/externo.jpg)`,
                  }}
                >
                  <div className="pd-painel-pele" />
                  <Typography className="pd-painel-texto">Caçamba</Typography>
                </div>
              </Col>
              <Col md={12} xs={24}>
                <div
                  className={`pd-painel ${type === 'route' && 'active'}`}
                  onClick={() => setType('route')}
                  style={{
                    backgroundImage: `url(${import.meta.env.VITE_URL_ASSETS}/interno.webp)`,
                  }}
                >
                  <div className="pd-painel-pele" />
                  <Typography className="pd-painel-texto">Rota</Typography>
                </div>
              </Col>
            </Row>
          </CardItem>
        </Col>
        {type === 'stationary' && product && (
          <Col md={24} xs={24}>
            <CardItem
              title={`${product.product.code} - Modelo 
                    ${
                      product.product.stationary_bucket_group
                        .stationary_bucket_type.name
                    }`}
            >
              <Row gutter={[8, 8]}>
                <Col lg={3} md={4} sm={6} xl={3} xs={8}>
                  <Statistic
                    style={{ fontSize: 10 }}
                    title="Situação"
                    value={product.status.name}
                  />
                </Col>
                <Col lg={3} md={4} sm={6} xl={3} xs={8}>
                  <Statistic
                    style={{ fontSize: 10 }}
                    title="Data locação"
                    value={
                      product.location_date ? product.location_date_format : '-'
                    }
                  />
                </Col>
                <Col lg={3} md={4} sm={6} xl={3} xs={8}>
                  <Statistic
                    style={{ fontSize: 10 }}
                    title="Data retirada"
                    value={
                      product.withdraw_date ? product.withdraw_date_format : '-'
                    }
                  />
                </Col>
                <Col lg={3} md={4} sm={6} xl={3} xs={8}>
                  <Statistic
                    style={{ fontSize: 10 }}
                    title="Data análise"
                    value={
                      product.date_analysis ? product.date_analysis_format : '-'
                    }
                  />
                </Col>
                <Col lg={12} md={12} xl={12} xs={24}>
                  <Statistic
                    style={{ fontSize: 10 }}
                    title="Transportador(a)"
                    value={product.driver_location?.name ?? '-'}
                  />
                </Col>
                <Col lg={12} md={12} xl={12} xs={24}>
                  <Statistic
                    style={{ fontSize: 10 }}
                    title="Locador(a)"
                    value={product.order_locations.provider.name ?? '-'}
                  />
                </Col>
                <Col lg={12} md={12} xl={12} xs={24}>
                  <Statistic
                    style={{ fontSize: 10 }}
                    title="Locatário(a)"
                    value={product.order_locations.client.name ?? '-'}
                  />
                </Col>
                <Col lg={12} md={12} xl={12} xs={24}>
                  <Statistic
                    style={{ fontSize: 10 }}
                    title="Destinador final"
                    value={product.destination?.name ?? '-'}
                  />
                </Col>
                <Col lg={12} md={12} xl={12} xs={24}>
                  <Statistic
                    style={{ fontSize: 10 }}
                    title="Locação"
                    value={`${product.order_locations.client_street} ${product.order_locations.client_number} - ${product.order_locations.client_district}`}
                  />
                </Col>
                <Col lg={24} md={24} xl={24} xs={24}>
                  <Statistic
                    style={{ fontSize: 10 }}
                    title="Resíduos"
                    value={`${product.order_locations.cart_product.residues.map((item: any) => item.name).join(', ')}`}
                  />
                </Col>
              </Row>
            </CardItem>
          </Col>
        )}
        {type === 'stationary' && product && (
          <Col span={24}>
            <CardItem title={'Preencha os dados'}>
              <Form form={form} layout="vertical" onFinish={onSend}>
                <Form.Item
                  label="Arquivos"
                  name={'archives'}
                  rules={[{ required: true, message: 'Campo obrigatório' }]}
                >
                  <Upload.Dragger
                    action={getUPLOADAPI}
                    beforeUpload={(file) => {
                      const isSizeValid =
                        file.size / 1024 / 1024 <
                        import.meta.env.VITE_MAX_UPLOAD;
                      if (!isSizeValid) {
                        message.error(
                          `O arquivo "${file.name}" excede o tamanho máximo de ${import.meta.env.VITE_MAX_UPLOAD}MB.`
                        );
                      }
                      return isSizeValid || Upload.LIST_IGNORE; // impede o envio se for falso
                    }}
                    headers={{
                      Authorization: `Bearer ${getToken()}`,
                      Profile: getProfileID(),
                    }}
                    showUploadList={true}
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">
                      Clique aqui ou arraste o arquivo para essa área
                    </p>
                    <p className="ant-upload-hint">
                      Você pode anexa 1 ou mais arquivos na ocorrência
                    </p>
                  </Upload.Dragger>
                </Form.Item>
                <Form.Item
                  label="Descreva a ocorrência"
                  name={'description'}
                  rules={[{ required: true, message: 'Campo obrigatório' }]}
                >
                  <Input.TextArea rows={4} />
                </Form.Item>
                <Button htmlType="submit" type="primary">
                  Enviar ocorrência
                </Button>
              </Form>
            </CardItem>
          </Col>
        )}
      </Row>
      <Modal
        closable={false}
        destroyOnClose
        footer={false}
        onCancel={() => setModalStationary(false)}
        open={modalStationary}
        style={{ top: 20 }}
      >
        <Scanner onScan={reader} styles={{ container: { height: 472 } }} />
        <Input.Search
          enterButton="Procurar caçamba"
          loading={loadButton}
          onSearch={readerWrite}
          placeholder="Pesquisar código caçamba"
          size="large"
          style={{ marginTop: 10 }}
        />
      </Modal>
    </PageDefault>
  );
};

export default ReportForm;
