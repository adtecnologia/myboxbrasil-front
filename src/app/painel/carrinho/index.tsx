// BIBLIOTECAS REACT

import {
  Button,
  Card,
  Col,
  Form,
  Image,
  Input,
  Modal,
  message,
  Progress,
  Result,
  Row,
  Tag,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import Cards from 'react-credit-cards-2';
import {
  FaBarcode,
  FaCreditCard,
  FaDollarSign,
  FaMoneyBillTransfer,
  FaPix,
} from 'react-icons/fa6';
// ICONES
import { IoChevronDown, IoChevronForward } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import CardCacamba from '../../../components/CardCacamba';
import CardItem from '../../../components/CardItem';
import LoadItem from '../../../components/LoadItem';
// COMPONENETES
import PageDefault from '../../../components/PageDefault';
// SERVIÇOS
import { GET_API, getToken, POST_API } from '../../../services';

// CSS
import './styles.css';
import { InputMaskCorrect } from '../../../components/InputMask';

const Cart = () => {
  // RESPONSAVEL PELA ROTA
  const navigate = useNavigate();

  // ESTADOS DO COMPONENTE
  const [load, setLoad] = useState<boolean>(true);
  const [loadFinish, setLoadFinish] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [total, setTotal] = useState<string>('R$ 0,00');
  const [selectType, setSelectType] = useState<string>('');
  const [pix, setPix] = useState<any>(false);
  const [received, setReceived] = useState<any>(false);
  const [openPix, setOpenPix] = useState<boolean>(false);
  const [time, setTime] = useState<any>(0);

  const [cvc, setCvc] = useState<string>('');
  const [expiry, setExpiry] = useState<string>('');
  const [focus, setFocus] = useState<any>('');
  const [name, setName] = useState<string>('');
  const [number, setNumber] = useState<string>('');

  useEffect(() => {
    if (time > 0) {
      setTimeout(() => {
        setTime(time - 1);
      }, 500);
    } else {
      setPix(false);
    }
  }, [time]);

  // CARREGA DADOS
  const loadCart = () => {
    setLoad(true);
    setSelectType('');
    form.resetFields();
    POST_API('/cart', {})
      .then((rs) => {
        if (!rs.ok) {
          Modal.warning({ title: 'Algo deu errado', content: rs.statusText });
        }
        return rs.json();
      })
      .then((res) => {
        setData(res.data);
        setCart(res.data.products);
        setTotal(res.data.total);
      })
      .finally(() => setLoad(false));
  };

  const loadOrder = () => [GET_API('/order?sort=-created_at&per_page=1')];

  const onFinish = (values: any) => {
    setLoadFinish(true);
    var dados = null;
    if (selectType === 'CREDIT_CARD') {
      dados = {
        card_number: number,
        holder_name: name,
        expiry_month: expiry.split('/')[0],
        expiry_year: expiry.split('/')[1],
        ccv: cvc,
        billingType: selectType,
        cart_id: data.id,
        use_client_info: 1,
        address_id: 1,
      };
    } else {
      dados = {
        billingType: selectType,
        cart_id: data.id,
        use_client_info: 1,
        address_id: 1,
      };
    }

    POST_API('/order', dados)
      .then((rs) => {
        if (rs.ok) {
          loadCart();
          loadOrder();
          setLoadFinish(false);
          return rs.json();
        }
        Modal.warning({ title: 'Algo deu errado', content: rs.statusText });
      })
      .then((res) => {
        if (res.data.payment_type === 'PIX') {
          setTime(100);
          setPix(res.data);
          setOpenPix(true);

          window.Echo.channel('order').listen(
            '.App\\Events\\Order\\StatusUpdated',
            (e: any) => {
              if (
                e.order.id === res.data.id &&
                (e.order.payment_status === 'RECEIVED' ||
                  e.order.payment_status === 'CONFIRMED')
              ) {
                setReceived(true);
                setPix(false);
              }
            }
          );
        }
      })
      .finally(() => setLoadFinish(false));
  };

  const [form] = Form.useForm();

  useEffect(() => {
    loadCart();
    loadOrder();
  }, []);

  return (
    <PageDefault items={[{ title: 'Carrinho' }]} valid={true}>
      {load ? (
        <LoadItem />
      ) : loadFinish ? (
        <LoadItem title="Enviando pedido" />
      ) : (
        <Row gutter={[16, 16]}>
          <Col lg={16} md={24} sm={24} xl={17} xs={24}>
            <CardItem title="Meu carrinho">
              <Row gutter={[8, 8]}>
                {cart?.length > 0 ? (
                  cart.map((v: any, i: any) => (
                    <Col key={i} span={24}>
                      <CardCacamba item={v} type="cart" />
                    </Col>
                  ))
                ) : (
                  <Col span={24}>
                    <Typography>Nenhum produto adicionado.</Typography>
                  </Col>
                )}
                <Col span={24}>
                  <Typography className="cr-total">
                    Valor total:{' '}
                    <span>R$ {Number(total).toLocaleString('pt-br')}</span>
                  </Typography>
                </Col>
              </Row>
            </CardItem>
          </Col>
          <Col lg={8} md={24} sm={24} xl={7} xs={24}>
            <CardItem title="Formas de Pagamento">
              <Row gutter={[8, 8]}>
                {/* <Col span={24}> <div className="fdp-div" onClick={onFinish}> <FaDollarSign className="fdp-icon" /> <Typography className="fdp-text">Saldo da conta</Typography> <Tag color="var(--color02)" className="fdp-tag">R$ 0,00</Tag> <IoChevronForward className="fdp-arrow" /> </div> </Col> */}
                {/* <Col span={24}> <div className="fdp-div" onClick={onFinish}> <FaMoneyBillTransfer className="fdp-icon" /> <Typography className="fdp-text">Débito online</Typography> <IoChevronForward className="fdp-arrow" /> </div> </Col> */}
                <Col span={24}>
                  <div
                    className="fdp-div"
                    onClick={() => setSelectType('CREDIT_CARD')}
                  >
                    <FaCreditCard className="fdp-icon" />
                    <Typography className="fdp-text">
                      Cartão de crédito
                    </Typography>
                    {selectType === 'CREDIT_CARD' ? (
                      <IoChevronDown className="fdp-arrow" />
                    ) : (
                      <IoChevronForward className="fdp-arrow" />
                    )}
                  </div>
                </Col>
                {selectType === 'CREDIT_CARD' ? (
                  <Col span={24}>
                    <Form form={form} layout="vertical" onFinish={onFinish}>
                      <Row gutter={[8, 0]}>
                        <Col
                          span={24}
                          style={{ marginTop: 10, marginBottom: 16 }}
                        >
                          <Cards
                            cvc={cvc}
                            expiry={expiry || ''}
                            focused={focus}
                            locale={{ valid: 'Validade' }}
                            name={name}
                            number={number}
                            placeholders={{ name: 'NOME TITULAR' }}
                          />
                        </Col>
                        <Col span={24}>
                          <Form.Item
                            label="Número do Cartão"
                            name="card_number"
                            rules={[
                              { required: true, message: 'Campo obrigatório' },
                            ]}
                          >
                            <InputMaskCorrect
                              autoComplete="off"
                              mask={'9999 9999 9999 9999'}
                              maskChar={''}
                              onChange={(e) => setNumber(e.target.value)}
                              onFocus={() => setFocus('number')}
                            >
                              {() => <Input maxLength={19} />}
                            </InputMaskCorrect>
                          </Form.Item>
                        </Col>
                        <Col span={24}>
                          <Form.Item
                            label="Nome do Titular"
                            name="holder_name"
                            rules={[
                              { required: true, message: 'Campo obrigatório' },
                            ]}
                          >
                            <Input
                              onChange={(e) => setName(e.target.value)}
                              onFocus={() => setFocus('name')}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={16}>
                          <Form.Item
                            label="Vencimento"
                            name="expiry_month"
                            rules={[
                              { required: true, message: 'Campo obrigatório' },
                            ]}
                          >
                            <InputMaskCorrect
                              autoComplete="off"
                              mask={'99/99'}
                              maskChar={''}
                              onChange={(e) => setExpiry(e.target.value)}
                              onFocus={() => setFocus('expiry')}
                            >
                              {() => (
                                <Input maxLength={5} placeholder="MM/AA" />
                              )}
                            </InputMaskCorrect>
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            label="ccv"
                            name="ccv"
                            rules={[
                              { required: true, message: 'Campo obrigatório' },
                            ]}
                          >
                            <InputMaskCorrect
                              autoComplete="off"
                              mask={'999'}
                              maskChar={''}
                              onChange={(e) => setCvc(e.target.value)}
                              onFocus={() => setFocus('cvc')}
                            >
                              {() => <Input maxLength={3} placeholder="" />}
                            </InputMaskCorrect>
                          </Form.Item>
                        </Col>
                        <Col span={24}>
                          <Button
                            block
                            disabled={!cart.length}
                            htmlType="submit"
                            type="primary"
                          >
                            Concluir pagamento
                          </Button>
                        </Col>
                      </Row>
                    </Form>
                  </Col>
                ) : null}
                {/* <Col span={24}>
                  <div
                    className="fdp-div"
                    onClick={() => setSelectType("BOLETO")}
                  >
                    <FaBarcode className="fdp-icon" />
                    <Typography className="fdp-text">
                      Boleto bancário
                    </Typography>
                    <Typography className="fdp-tag">
                      Até 3 dias úteis
                    </Typography>
                    {selectType === "BOLETO" ? (
                      <IoChevronDown className="fdp-arrow" />
                    ) : (
                      <IoChevronForward className="fdp-arrow" />
                    )}
                  </div>
                </Col> */}
                {selectType === 'BOLETO' ? (
                  <>
                    <Col span={24}>
                      <Button
                        block
                        disabled
                        onClick={() => onFinish({})}
                        type="primary"
                      >
                        {/* Gerar boleto e concluir pedido */}
                        Desabilitado temporariamente
                      </Button>
                    </Col>
                  </>
                ) : null}
                <Col span={24}>
                  <div className="fdp-div" onClick={() => setSelectType('PIX')}>
                    <FaPix className="fdp-icon" />
                    <Typography className="fdp-text">Chave pix</Typography>
                    {selectType === 'PIX' ? (
                      <IoChevronDown className="fdp-arrow" />
                    ) : (
                      <IoChevronForward className="fdp-arrow" />
                    )}
                  </div>
                </Col>
                {selectType === 'PIX' ? (
                  <>
                    <Col span={24}>
                      <Button
                        block
                        disabled
                        onClick={() => onFinish({})}
                        type="primary"
                      >
                        {/* Gerar pix */}
                        Desabilitado temporariamente
                      </Button>
                    </Col>
                  </>
                ) : null}
              </Row>
            </CardItem>
          </Col>
        </Row>
      )}
      <Modal
        closable={false}
        destroyOnClose
        footer={false}
        onCancel={() => (pix ? null : setOpenPix(false))}
        open={openPix}
      >
        {pix?.encoded_image ? (
          <Row>
            <Col span={24}>
              <Progress
                percent={time}
                showInfo={false}
                strokeColor="var(--color02)"
              />
            </Col>
            <Col span={24}>
              <Image
                preview={false}
                src={`data:image/png;base64,${pix?.encoded_image}`}
                width={'100%'}
              />
            </Col>
            <Col span={24}>
              <center>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(pix?.payload);
                    message.success('Chave copiada');
                  }}
                  type="primary"
                >
                  Copiar chave pix
                </Button>
              </center>
            </Col>
          </Row>
        ) : (
          <Row>
            <Col span={24}>
              {received ? (
                <Result
                  extra={[
                    <Button
                      onClick={() => setOpenPix(false)}
                      style={{ marginTop: 10 }}
                      type="primary"
                    >
                      Fechar
                    </Button>,
                  ]}
                  status="success"
                  title="Recebemos seu pagamento!"
                />
              ) : (
                <Result
                  extra={[
                    <Button
                      onClick={() => setOpenPix(false)}
                      style={{ marginTop: 10 }}
                      type="primary"
                    >
                      Fechar
                    </Button>,
                  ]}
                  status="warning"
                  subTitle="Caso não tenha consegudo realizar o pagamento, por favor refaça a compra novamente, caso contrário aguarde a confirmação do pagamento."
                  title="QR Code expirado!"
                />
              )}
            </Col>
          </Row>
        )}
      </Modal>
    </PageDefault>
  );
};

export default Cart;
