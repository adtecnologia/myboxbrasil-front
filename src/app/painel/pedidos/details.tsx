// react libraries

import {
  Button,
  Card,
  Checkbox,
  Col,
  Drawer,
  Image,
  Input,
  Modal,
  message,
  Row,
  Tag,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CardItem from '../../../components/CardItem';
import LoadItem from '../../../components/LoadItem';
// components
import PageDefault from '../../../components/PageDefault';
import { TableReturnButton } from '../../../components/Table/buttons';

// css
import './style.css';

// icons
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { IoSearch } from 'react-icons/io5';

// services
import {
  GET_API,
  getProfileType,
  IMAGE_NOT_FOUND,
  type PageDefaultProps,
  POST_API,
  POST_CATCH,
  verifyConfig,
} from '../../../services';

const OrderDetails = ({ type, path, permission }: PageDefaultProps) => {
  // RESPONSAVEL PELA ROTA
  const navigate = useNavigate();

  const { ID } = useParams();

  const [order, setOrder] = useState<any>(null);
  const [loadCheck, setLoadCheck] = useState<boolean>(false);
  const [load, setLoad] = useState<boolean>(false);
  const [loadButton, setLoadButton] = useState<any>(true);
  const [loadSelect, setLoadSelect] = useState<any>(false);
  const [image, setImage] = useState<any>(null);
  const [search, setSearch] = useState<any>('');
  const [cacamba, setCacamba] = useState<any[]>([]);
  const [cacambaSelect, setCacambaSelect] = useState<string[]>([]);
  const [verify, setVerify] = useState<number>(0);

  const [open, setOpen] = useState<boolean>(false);

  const onOpen = () => setOpen(!open);

  // CARREGA MODELO
  const onView = () => {
    setCacambaSelect([]);
    setTimeout(() => {
      GET_API(`/order_location/${ID}`)
        .then((rs) => rs.json())
        .then((res) => {
          setOrder(res.data);
          if (!(res.data.cart_product.product.gallery.length > 0)) {
            res.data.cart_product.product.gallery = [{ url: IMAGE_NOT_FOUND }];
          }
          var temp: any = [];
          res.data.items.forEach((v: any) => {
            temp.push(v.product.id);
          });
          setCacambaSelect(temp);
          setImage(res.data.cart_product.product.gallery[0].url);
          setVerify(Number(res.data.items.length));
        });
    }, 500);
  };

  // AÇÃO DE ACEITE
  const onAccept = () => {
    Modal.confirm({
      title: 'Aceitar pedido?',
      icon: <ExclamationCircleOutlined />,
      cancelText: 'Não',
      okText: 'Sim',
      onOk() {
        setLoad(true);
        POST_API('/order_location', { status: 'PA' }, ID)
          .then((rs) => {
            if (rs.ok) {
              message.success({ content: 'Pedido aceito', key: 'screen' });
              navigate('..');
            } else {
              Modal.warning({
                title: 'Algo deu errado',
                content: 'Não foi possível aceitar pedido',
              });
            }
          })
          .catch(POST_CATCH)
          .finally(() => setLoad(false));
      },
      onCancel() {},
    });
  };

  // AÇÃO DE RECUSA
  const onRecuse = () => {
    Modal.confirm({
      title: 'Cancelar pedido?',
      icon: <ExclamationCircleOutlined />,
      cancelText: 'Não',
      okText: 'Sim',
      onOk() {
        setLoad(true);
        POST_API(`/order_location/${ID}/refund`, {})
          .then((rs) => {
            if (rs.ok) {
              POST_API('/order_location', { status: 'PC' }, ID)
                .then((rs) => {
                  if (rs.ok) {
                    message.success({
                      content:
                        'Pedido cancelado. Por favor, aguarde enquanto providenciamos o estorno da sua compra.',
                      key: 'screen',
                    });
                    navigate('..');
                  } else {
                    Modal.warning({
                      title: 'Algo deu errado',
                      content: 'Não foi possível cancelar pedido',
                    });
                  }
                })
                .catch(POST_CATCH);
            } else
              Modal.warning({
                title: 'Algo deu errado',
                content: 'Não foi possível cancelar pedido',
              });
          })
          .catch(POST_CATCH)
          .finally(() => setLoad(false));
      },
      onCancel() {},
    });
  };

  // FUNÇÃO PESQUISAR
  const onSearch = () => {
    setLoadButton(true);
    GET_API(
      `/stationary_bucket?group_id=${order.cart_product.product.id}&status=D&search=${search}`
    )
      .then((rs) => rs.json())
      .then((res) => {
        setCacamba(res.data);
      })
      .catch(POST_CATCH)
      .finally(() => setLoadButton(false));
  };

  // FUNÇÃO SELECIONAR
  const onCacambaSelect = (id: string, value: any) => {
    var temp = cacambaSelect;

    if (value.target.checked) {
      temp.push(id);
    } else {
      temp.splice(temp.indexOf(id), 1);
    }

    setCacambaSelect(temp);
    setVerify(value.target.checked ? verify + 1 : verify - 1);
    setTimeout(() => setLoadCheck(!loadCheck), 500);
  };

  const onOrderProduct = () => {
    if (!(verify < order.cart_product.quantity)) {
      setLoadSelect(true);
      POST_API('/order_location_product', {
        order_location_id: ID,
        products: cacambaSelect,
      })
        .then((rs) => {
          if (rs.ok) {
            message.success('Salvo com sucesso!');
            setOpen(false);
            onView();
          } else {
            Modal.warning({ title: 'Algo deu errado', content: rs.statusText });
          }
        })
        .catch(POST_CATCH)
        .finally(() => setLoadSelect(false));
    }
  };

  useEffect(() => {
    if (open) onSearch();
  }, [search, open]);

  useEffect(onView, [ID]);

  return (
    <PageDefault
      items={[
        { title: <Link to="/painel/pedidos">Pedidos</Link> },
        { title: 'Detalhes' },
      ]}
      options={
        <Row gutter={[8, 8]} justify={'end'}>
          <TableReturnButton permission={true} type={'list'} />
        </Row>
      }
      valid={`${permission}.${type}`}
    >
      {order === null ? (
        <LoadItem />
      ) : (
        <Row gutter={[8, 8]}>
          <Col span={24}>
            <CardItem>
              <Row gutter={[16, 8]}>
                <Col md={10} style={{ overflow: 'hidden !important' }} xs={24}>
                  <Row gutter={[2, 2]}>
                    <Col span={4}>
                      <Row gutter={[2, 2]}>
                        {order.cart_product.product.gallery.map(
                          (v: any, i: any) => (
                            <Col key={i} span={24}>
                              <Image
                                onClick={() => setImage(v.url)}
                                preview={false}
                                src={v.url}
                                style={{
                                  cursor: 'pointer',
                                  borderRadius: '8px',
                                }}
                                width={'100%'}
                              />
                            </Col>
                          )
                        )}
                      </Row>
                    </Col>
                    <Col span={20}>
                      <Image
                        src={image}
                        style={{ borderRadius: '8px' }}
                        width={'100%'}
                      />
                    </Col>
                  </Row>
                </Col>
                <Col md={14} xs={24}>
                  <Typography className="cacamba-name">
                    Modelo{' '}
                    {order.cart_product.product.stationary_bucket_type.name}
                  </Typography>
                  <Row gutter={[8, 8]}>
                    <Col md={8} xs={24}>
                      <Typography className="cacamba-title">Estoque</Typography>
                      <Typography className="cacamba-desc">
                        <span>{order.cart_product.product.stock}</span> cacambas
                      </Typography>
                      <Typography className="cacamba-title">
                        Quantidade pedida
                      </Typography>
                      <Typography className="cacamba-desc">
                        <span>{order.cart_product.quantity}</span> cacambas
                      </Typography>
                    </Col>
                    <Col md={8} xs={12}>
                      <Typography className="cacamba-title">
                        Detalhes
                      </Typography>
                      <Typography className="cacamba-desc">
                        <span>Tipo de tampa:</span>{' '}
                        {order.cart_product.product.type_lid_name}
                      </Typography>
                      <Typography className="cacamba-desc">
                        <span>Cor:</span> {order.cart_product.product.color}
                      </Typography>
                      <Typography className="cacamba-desc">
                        <span>Material:</span>{' '}
                        {order.cart_product.product.material}
                      </Typography>
                    </Col>
                    <Col md={8} xs={12}>
                      <Typography className="cacamba-title">
                        Dimensões
                      </Typography>
                      <Typography className="cacamba-desc">
                        <span>Comprimento:</span>{' '}
                        {
                          order.cart_product.product.stationary_bucket_type
                            .letter_a_name
                        }
                      </Typography>
                      <Typography className="cacamba-desc">
                        <span>Largura:</span>{' '}
                        {
                          order.cart_product.product.stationary_bucket_type
                            .letter_b_name
                        }
                      </Typography>
                      <Typography className="cacamba-desc">
                        <span>Altura:</span>{' '}
                        {
                          order.cart_product.product.stationary_bucket_type
                            .letter_c_name
                        }
                      </Typography>
                    </Col>
                  </Row>

                  <Typography className="cacamba-title">
                    Tipo de locação
                  </Typography>
                  <Row gutter={[8, 8]}>
                    {order.cart_product.type_local === 'E' ? (
                      <Col>
                        <Tag className={'mf-tag active'}>
                          Locação Externa | até {order.cart_product.days} dias
                        </Tag>
                      </Col>
                    ) : null}
                    {order.cart_product.type_local === 'I' ? (
                      <Col>
                        <Tag className={'mf-tag active'}>
                          Locação Interna | até {order.cart_product.days} dias
                        </Tag>
                      </Col>
                    ) : null}
                  </Row>

                  <Typography className="cacamba-title">
                    Classes de resíduo
                  </Typography>
                  <Row gutter={[8, 8]}>
                    {order.cart_product.residues.map((value: any, key: any) => (
                      <Col key={key}>
                        <Tag color="var(--color01)">{value.name}</Tag>
                      </Col>
                    ))}
                  </Row>

                  <Typography className="cacamba-title">
                    Endereço de entrega
                  </Typography>
                  <Typography className="cacamba-address">
                    {order.cart_product.address.street},{' '}
                    {order.cart_product.address.number} -{' '}
                    {order.cart_product.address.district} -{' '}
                    {order.cart_product.address.city.name} /{' '}
                    {order.cart_product.address.city.state.acronym}
                  </Typography>

                  <Row gutter={[8, 8]}>
                    <Col md={8} xs={24}>
                      <Typography className="cacamba-title">
                        Valor do pedido
                      </Typography>
                      <Typography className="cacamba-desc">
                        <span>R$ {Number(order.total).toLocaleString()}</span>
                      </Typography>
                    </Col>
                    {getProfileType() === 'SELLER' ||
                    getProfileType() === 'LEGAL_SELLER' ||
                    getProfileType() === 'SELLER_EMPLOYEE' ? (
                      <Col md={8} xs={24}>
                        <Typography className="cacamba-title">
                          Valor à receber
                        </Typography>
                        <Typography className="cacamba-desc">
                          <span>R$ {Number(order.total).toLocaleString()}</span>
                        </Typography>
                      </Col>
                    ) : null}
                  </Row>

                  <Typography className="cacamba-title">Caçambas</Typography>
                  {(getProfileType() === 'SELLER' ||
                    getProfileType() === 'LEGAL_SELLER' ||
                    getProfileType() === 'SELLER_EMPLOYEE') &&
                  verifyConfig([`${permission}.edit`]) &&
                  order.status.code === 'AR' ? (
                    <Typography className="cacamba-address" onClick={onOpen}>
                      Selecionar caçambas
                    </Typography>
                  ) : null}
                  {(getProfileType() === 'SELLER' ||
                    getProfileType() === 'LEGAL_SELLER' ||
                    getProfileType() === 'SELLER_EMPLOYEE') &&
                  verifyConfig([`${permission}.edit`]) &&
                  order.status.code === 'AR'
                    ? order.items.map((v: any, i: any) => (
                        <Typography className="cacamba-desc" key={i}>
                          <span>{v.product.code}</span> - Aguardando confirmação
                          do pedido
                        </Typography>
                      ))
                    : null}
                  {(getProfileType() === 'SELLER' ||
                    getProfileType() === 'LEGAL_SELLER' ||
                    getProfileType() === 'SELLER_EMPLOYEE') &&
                  verifyConfig([`${permission}.edit`]) &&
                  order.status.code === 'PA'
                    ? order.items.map((v: any, i: any) => (
                        <Typography className="cacamba-desc" key={i}>
                          <span>{v.product.code}</span> -{' '}
                          {v.product.status.name}
                        </Typography>
                      ))
                    : null}
                  {(getProfileType() === 'CUSTOMER' ||
                    getProfileType() === 'LEGAL_CUSTOMER' ||
                    getProfileType() === 'CUSTOMER_EMPLOYEE' ||
                    getProfileType() === 'ADMIN' ||
                    getProfileType() === 'ADMIN_EMPLOYEE') &&
                  order.status.code === 'AR' ? (
                    order.items.lenght > 0 ? (
                      order.items.map((v: any, i: any) => (
                        <Typography className="cacamba-desc" key={i}>
                          <span>{v.product.code}</span> -{' '}
                          {v.product.status.name}
                        </Typography>
                      ))
                    ) : (
                      <Typography>Nenhuma caçamba selecionada</Typography>
                    )
                  ) : null}
                  {(getProfileType() === 'CUSTOMER' ||
                    getProfileType() === 'LEGAL_CUSTOMER' ||
                    getProfileType() === 'CUSTOMER_EMPLOYEE' ||
                    getProfileType() === 'ADMIN' ||
                    getProfileType() === 'ADMIN_EMPLOYEE') &&
                  order.status.code === 'PA'
                    ? order.items.map((v: any, i: any) => (
                        <Typography className="cacamba-desc" key={i}>
                          <span>{v.product.code}</span> -{' '}
                          {v.product.status.name}
                        </Typography>
                      ))
                    : null}
                </Col>

                {(getProfileType() === 'SELLER' ||
                  getProfileType() === 'LEGAL_SELLER' ||
                  getProfileType() === 'SELLER_EMPLOYEE') &&
                verifyConfig([`${permission}.edit`]) &&
                order.status.code === 'AR' ? (
                  <Col
                    md={{ offset: 12, span: 12 }}
                    xs={{ offset: 0, span: 24 }}
                  >
                    <Row gutter={[8, 8]} justify={'end'}>
                      {/* <Col md={12} xs={12}>
                                                <Button type="default"  block onClick={onRecuse} loading={load}>Recusar pedido</Button>
                                            </Col> */}
                      <Col md={12} xs={12}>
                        <Button
                          block
                          disabled={
                            Number(order.items.length) !==
                            Number(order.cart_product.quantity)
                          }
                          loading={load}
                          onClick={onAccept}
                          type="primary"
                        >
                          Aceitar pedido
                        </Button>
                      </Col>
                    </Row>
                  </Col>
                ) : null}
                {(getProfileType() === 'CUSTOMER' ||
                  getProfileType() === 'LEGAL_CUSTOMER' ||
                  getProfileType() === 'CUSTOMER_EMPLOYEE') &&
                verifyConfig([`${permission}.edit`]) &&
                order.status.code === 'AR' ? (
                  <Col
                    md={{ offset: 12, span: 12 }}
                    xs={{ offset: 0, span: 24 }}
                  >
                    <Row gutter={[8, 8]} justify={'end'}>
                      <Col md={12} xs={12}>
                        <Button
                          block
                          loading={load}
                          onClick={onRecuse}
                          type="default"
                        >
                          Cancelar pedido
                        </Button>
                      </Col>
                    </Row>
                  </Col>
                ) : null}
              </Row>
            </CardItem>
          </Col>

          <Drawer onClose={onOpen} open={open} title="Selecionar caçambas">
            <Row gutter={[8, 16]}>
              <Col span={24}>
                <Input
                  onChange={(v) => setSearch(v.target.value)}
                  placeholder="Buscar caçamba"
                  prefix={<IoSearch color="var(--color02)" />}
                  size="large"
                  value={search}
                />
              </Col>
              {loadButton ? (
                <Col span={24}>
                  <LoadItem type="alt" />
                </Col>
              ) : cacamba.length > 0 ? (
                cacamba.map((v, i) => (
                  <Col key={i} span={24}>
                    <Card hoverable size="small">
                      {loadCheck ? (
                        <Checkbox
                          defaultChecked={cacambaSelect.indexOf(v.id) !== -1}
                          disabled={
                            Number(verify) >=
                              Number(order.cart_product.quantity) &&
                            !(cacambaSelect.indexOf(v.id) !== -1)
                          }
                          onChange={(value) => onCacambaSelect(v.id, value)}
                        >
                          <Typography className={'ad-title'}>
                            {v.code}
                          </Typography>
                        </Checkbox>
                      ) : (
                        <Checkbox
                          defaultChecked={cacambaSelect.indexOf(v.id) !== -1}
                          disabled={
                            Number(verify) >=
                              Number(order.cart_product.quantity) &&
                            !(cacambaSelect.indexOf(v.id) !== -1)
                          }
                          onChange={(value) => onCacambaSelect(v.id, value)}
                        >
                          <Typography className={'ad-title'}>
                            {v.code}
                          </Typography>
                        </Checkbox>
                      )}
                    </Card>
                  </Col>
                ))
              ) : (
                <Col span={24}>
                  <Typography>Não há mais caçambas</Typography>
                </Col>
              )}
              <Col span={24}>
                <Button
                  block
                  disabled={verify < order.cart_product.quantity}
                  loading={loadSelect}
                  onClick={onOrderProduct}
                  type="primary"
                >
                  Selecionar caçambas
                </Button>
              </Col>
            </Row>
          </Drawer>
        </Row>
      )}
    </PageDefault>
  );
};

export default OrderDetails;
