import {
  Avatar,
  Button,
  Col,
  Form,
  Input,
  List,
  Modal,
  message,
  Row,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import Cards from "react-credit-cards-2";
import { FaCreditCard } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import CardCacamba from "../../../components/CardCacamba";
import CardItem from "../../../components/CardItem";
import LoadItem from "../../../components/LoadItem";
import PageDefault from "../../../components/PageDefault";
import { GET_API, POST_API } from "../../../services";
import "./styles.css";
import ButtonGroup from "antd/es/button/button-group";
import { InputMaskCorrect } from "../../../components/InputMask";

const Cart = () => {
  // RESPONSAVEL PELA ROTA
  const navigate = useNavigate();

  // ESTADOS DO COMPONENTE
  const [load, setLoad] = useState<boolean>(true);
  const [loadFinish, setLoadFinish] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [total, setTotal] = useState<string>("R$ 0,00");
  const [selectType, setSelectType] = useState<string>("");
  const [pix, setPix] = useState<any>(false);
  const [received, setReceived] = useState<any>(false);
  const [openPix, setOpenPix] = useState<boolean>(false);
  const [time, setTime] = useState<any>(0);
  type PaymentState = Record<
    number,
    { id: number; type?: "immediate" | "periodic"; period_days?: number }
  >;
  const [payments, setPayments] = useState<PaymentState>({});
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [openInvoice, setOpenInvoice] = useState<any[]>([]);
  const [overdueInvoice, setOverdueInvoice] = useState<any[]>([]);
  const [hasPeriodicProvider, setHasPeriodicProvider] =
    useState<boolean>(false);

  const [cvc, setCvc] = useState<string>("");
  const [expiry, setExpiry] = useState<string>("");
  const [focus, setFocus] = useState<any>("");
  const [name, setName] = useState<string>("");
  const [number, setNumber] = useState<string>("");

  const [modalCard, setModalCard] = useState<boolean>(false);
  const [modalPix, setModalPix] = useState<boolean>(false);

  useEffect(() => {
    if (time > 0) {
      setTimeout(() => {
        setTime(time - 1);
      }, 500);
    } else {
      setPix(false);
    }
  }, [time]);

  const onPaymentMethods = () => {
    GET_API("/payment-methods?active=1&sort=period_days,name")
      .then((rs) => rs.json())
      .then((res) => {
        setPaymentMethods(res.data);
      });
  };

  const onOpenInvoice = () => {
    GET_API("/verify-open")
      .then((rs) => rs.json())
      .then((res) => {
        setOpenInvoice(res.data);
      });
    GET_API("/verify-overdue")
      .then((rs) => rs.json())
      .then((res) => {
        setOverdueInvoice(res.data);
      });
  };

  // CARREGA DADOS
  const loadCart = () => {
    setLoad(true);
    setSelectType("");
    form.resetFields();
    POST_API("/cart", {})
      .then((rs) => {
        if (!rs.ok) {
          Modal.warning({ title: "Algo deu errado", content: rs.statusText });
        }
        return rs.json();
      })
      // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: ignore
      .then((res) => {
        setData(res.data);
        setCart(res.data.products);
        setTotal(res.data.total);

        const initialPayments: PaymentState = {};

        for (const item of Object.values(res.data.products)) {
          const providerId = item[0].product.provider_id;
          const providerPeriodic =
            item[0].product.provider_use_periodic_payment;
          // se ainda não existe, inicializa como 0
          if (!initialPayments[providerId]) {
            initialPayments[providerId] = providerPeriodic
              ? { id: 0 }
              : { id: 0, type: "immediate" };
          }

          if (item[0].product.provider_use_periodic_payment) {
            setHasPeriodicProvider(true);
          }
        }

        setPayments(initialPayments);
      })
      .finally(() => setLoad(false));
  };

  const loadOrder = () => [GET_API("/order?sort=-created_at&per_page=1")];

  const onFinish = () => {
    if (
      !hasPeriodicProvider ||
      Object.values(payments).some((p: any) => p?.type === "immediate")
    ) {
      onFinishWithImmediate();
    }
    if (Object.values(payments).every((p: any) => p?.type === "periodic")) {
      onPayPeriodic();
    }
  };

  const onFinishWithImmediate = () => {
    const firstImmediatePayment = Object.values(payments).find(
      (p: any) => p?.type === "immediate"
    );

    if (!firstImmediatePayment) {
      Modal.warning({
        title: "Ops!",
        content: "Nenhum pagamento à vista selecionado.",
      });
      return;
    }

    const selectedPaymentMethod = paymentMethods.find(
      (pm) => pm.id === firstImmediatePayment.id
    );

    setSelectType(selectedPaymentMethod.key);
    if (selectedPaymentMethod.key === "PIX") {
    } else {
      setModalCard(true);
    }
  };

  const onPay = () => {
    setLoadFinish(true);

    const payload = {
      card_number: number,
      holder_name: name,
      expiry_month: expiry.split("/")[0],
      expiry_year: expiry.split("/")[1],
      ccv: cvc,
      billingType: selectType ?? "",
      cart_id: data.id,
      use_client_info: 1,
      address_id: 1,
      hasPeriodicProvider,
      payments: JSON.stringify(payments),
    };

    POST_API("/order", payload)
      .then(async (rs) => ({ response: await rs.json(), status: rs.ok }))
      .then(({ response, status }) => {
        if (status) {
          loadCart();
          loadOrder();
          setModalCard(false);
          Modal.success({ title: "Sucesso", content: response.message });
        } else {
          Modal.warning({
            title: "Algo deu errado",
            content: response.message,
          });
        }
      })
      .finally(() => setLoadFinish(false));
  };

  const onPayPeriodic = () => {
    setLoadFinish(true);

    const payload = {
      billingType: "BOLETO",
      cart_id: data.id,
      use_client_info: 1,
      address_id: 1,
      hasPeriodicProvider,
      payments: JSON.stringify(payments),
    };

    POST_API("/order", payload)
      .then(async (rs) => ({ response: await rs.json(), status: rs.ok }))
      .then(({ response, status }) => {
        if (status) {
          loadCart();
          loadOrder();
          setModalCard(false);
          Modal.success({ title: "Sucesso", content: response.message });
        } else {
          Modal.warning({
            title: "Algo deu errado",
            content: response.message,
          });
        }
      })
      .finally(() => setLoadFinish(false));
  };

  const [form] = Form.useForm();

  useEffect(() => {
    onPaymentMethods();
    onOpenInvoice();
    loadCart();
    loadOrder();
  }, []);

  return (
    <PageDefault items={[{ title: "Carrinho" }]} valid={true}>
      {load && <LoadItem />}
      {!load && loadFinish && <LoadItem title="Enviando pedido" />}
      {!(load || loadFinish) && (
        <Row gutter={[16, 16]}>
          <Col lg={16} md={24} sm={24} xl={17} xs={24}>
            <CardItem title="Meu carrinho">
              <Row gutter={[8, 8]}>
                {cart && Object.keys(cart).length > 0 ? (
                  Object.entries(cart).map(([providerId, products]: any) => (
                    <Col key={providerId} span={24}>
                      <List
                        bordered
                        dataSource={products}
                        header={
                          <Typography
                            className="card-cacamba-title"
                            onClick={() =>
                              navigate(
                                `/painel/pedirlocacao/fornecedor/${products[0].product.provider_name}`
                              )
                            }
                          >
                            <Avatar
                              className="card-cacamba-title-avt"
                              src={products[0].product.provider_photo}
                            />
                            {String(
                              products[0].product.provider_name
                            ).toLocaleUpperCase()}
                          </Typography>
                        }
                        renderItem={(item) => (
                          <CardCacamba item={item} type="cart" />
                        )}
                        size="small"
                      />
                    </Col>
                  ))
                ) : (
                  <Col span={24}>
                    <Typography>Nenhum produto adicionado.</Typography>
                  </Col>
                )}
                <Col span={24}>
                  <Typography className="cr-total">
                    Valor total:{" "}
                    <span>R$ {Number(total).toLocaleString("pt-br")}</span>
                  </Typography>
                </Col>
              </Row>
            </CardItem>
          </Col>
          <Col lg={8} md={24} sm={24} xl={7} xs={24}>
            <Row gutter={[16, 16]}>
              {cart && Object.keys(cart).length > 0 ? (
                <>
                  {hasPeriodicProvider &&
                    // 🔸 Caso 1 — tem fornecedor que aceita periodic
                    Object.entries(cart).map(([providerId, products]: any) => {
                      const subtotal = products.reduce(
                        (sum: number, item: any) =>
                          sum + item.quantity * item.price,
                        0
                      );

                      const providerName = products[0].product.provider_name;
                      const providerAllowsPeriodic =
                        products[0].product.provider_use_periodic_payment ===
                        true;

                      const existingInvoice = openInvoice?.find(
                        (inv) => inv.provider_id === Number(providerId)
                      );

                      if (!providerAllowsPeriodic) {
                        return null;
                      }

                      return (
                        <Col key={providerId} span={24}>
                          <CardItem>
                            <Typography>
                              Qual o tipo de pagamento para o locador{" "}
                              <span style={{ color: "var(--color01)" }}>
                                {providerName}
                              </span>{" "}
                              no valor de{" "}
                              <span style={{ color: "var(--color01)" }}>
                                R$ {subtotal.toFixed(2)}
                              </span>
                              ?
                            </Typography>
                            <ButtonGroup
                              style={{ width: "100%", marginTop: 6 }}
                            >
                              <Button
                                onClick={() =>
                                  setPayments({
                                    ...payments,
                                    [providerId]: {
                                      id: 0,
                                      type: "immediate",
                                    },
                                  })
                                }
                                style={{ width: "50%" }}
                                type={
                                  payments[providerId]?.type === "immediate"
                                    ? "primary"
                                    : "default"
                                }
                              >
                                À vista
                              </Button>
                              <Button
                                onClick={() => {
                                  if (overdueInvoice.length > 0) {
                                    Modal.warning({
                                      title: "Ops",
                                      content: `Identificamos que você possui uma fatura vencida do dia ${overdueInvoice[0].due_date}. Para continuar realizando locações com pagamento a prazo, por favor, regularize o pagamento pendente. Após a quitação, novas locações a prazo serão liberadas automaticamente.`,
                                    });
                                    return;
                                  }
                                  setPayments({
                                    ...payments,
                                    [providerId]: {
                                      id: existingInvoice
                                        ? existingInvoice.payment_method_id
                                        : 0,
                                      type: "periodic",
                                    },
                                  });
                                }}
                                onError={() => message.info("fdsdf")}
                                style={{ width: "50%" }}
                                type={
                                  payments[providerId]?.type === "periodic"
                                    ? "primary"
                                    : "default"
                                }
                              >
                                A prazo
                              </Button>
                            </ButtonGroup>
                            {payments[providerId]?.type === "periodic" &&
                              existingInvoice && (
                                <Typography
                                  style={{
                                    marginTop: 10,
                                    color: "var(--color01)",
                                  }}
                                >
                                  Já existe um pagamento a prazo aberto para
                                  este fornecedor.
                                  <br />
                                  Este novo pedido será{" "}
                                  <strong>incluído na mesma fatura</strong>.
                                  <br />
                                  Vencimento em{" "}
                                  <strong>{existingInvoice.period_end}</strong>
                                  <br />
                                  Total atual: R${" "}
                                  {Number(existingInvoice.total).toFixed(2)}
                                </Typography>
                              )}
                            {payments[providerId]?.type === "periodic" &&
                              !existingInvoice && (
                                <ButtonGroup
                                  style={{ width: "100%", marginTop: 6 }}
                                >
                                  {paymentMethods
                                    .filter((pm) => pm.type === "periodic")
                                    .map((paymentMethod) => (
                                      <Button
                                        key={paymentMethod.id}
                                        onClick={() =>
                                          setPayments({
                                            ...payments,
                                            [providerId]: {
                                              id: paymentMethod.id,
                                              type: "periodic",
                                              period_days:
                                                paymentMethod.period_days,
                                            },
                                          })
                                        }
                                        style={{ width: "50%" }}
                                        type={
                                          payments[providerId]?.id ===
                                          paymentMethod.id
                                            ? "primary"
                                            : "default"
                                        }
                                      >
                                        {paymentMethod.period_days} dias
                                      </Button>
                                    ))}
                                </ButtonGroup>
                              )}
                            {payments[providerId]?.period_days && (
                              <Typography
                                style={{ marginTop: 10, textAlign: "center" }}
                              >
                                Vencimento em{" "}
                                <span
                                  style={{
                                    color: "var(--color01)",
                                    fontWeight: 600,
                                  }}
                                >
                                  {new Date(
                                    Date.now() +
                                      payments[providerId].period_days *
                                        24 *
                                        60 *
                                        60 *
                                        1000
                                  ).toLocaleDateString("pt-BR", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  })}
                                </span>
                              </Typography>
                            )}
                          </CardItem>
                        </Col>
                      );
                    })}

                  {Object.values(payments).some(
                    (p: any) => p?.type === "immediate"
                  ) &&
                    Object.values(payments).some(
                      (p: any) => p?.type === "periodic"
                    ) && (
                      <Col span={24}>
                        <CardItem>
                          <Typography>
                            Selecione a forma de pagamento para os demais
                            locadores
                          </Typography>
                        </CardItem>
                      </Col>
                    )}

                  {(!hasPeriodicProvider ||
                    Object.values(payments).some(
                      (p: any) => p?.type === "immediate"
                    )) && (
                    <Col span={24}>
                      <CardItem title="Forma de pagamento">
                        <Row gutter={[8, 8]} style={{ marginTop: -10 }}>
                          {paymentMethods
                            .filter((pm) => pm.type === "immediate")
                            .map((paymentMethod) => {
                              const isSelected = Object.values(payments).some(
                                (item) => item.id === paymentMethod.id
                              );

                              return (
                                <Col key={paymentMethod.id} span={24}>
                                  <Button
                                    block
                                    icon={<FaCreditCard className="fdp-icon" />}
                                    onClick={() => {
                                      const updated = Object.keys(cart).reduce(
                                        (acc: any, providerId) => {
                                          const current = payments[providerId];

                                          // só atualiza se o tipo for immediate
                                          if (current?.type === "periodic") {
                                            acc[providerId] = current;
                                          } else {
                                            // mantém o que já estava
                                            acc[providerId] = {
                                              id: paymentMethod.id,
                                              type: "immediate",
                                            };
                                          }

                                          return acc;
                                        },
                                        {}
                                      );

                                      setPayments(updated);
                                    }}
                                    size="large"
                                    style={{ justifyContent: "start" }}
                                    type={isSelected ? "primary" : "default"}
                                  >
                                    {paymentMethod.name}
                                  </Button>
                                </Col>
                              );
                            })}
                        </Row>
                      </CardItem>
                    </Col>
                  )}
                </>
              ) : (
                <Col span={24}>
                  <CardItem>
                    <Typography>
                      Adicione ao menos um produto ao carrinho
                    </Typography>
                  </CardItem>
                </Col>
              )}
              <Col span={24}>
                <CardItem>
                  <Button
                    block
                    disabled={
                      Object.values(payments).some((item) => item.id === 0) ||
                      cart.length === 0
                    }
                    onClick={onFinish}
                    size="large"
                    type="primary"
                  >
                    Realizar pagamento
                  </Button>
                </CardItem>
              </Col>
            </Row>
          </Col>
        </Row>
      )}
      <Modal
        footer={null}
        open={modalCard}
        title={
          selectType === "CREDIT_CARD"
            ? "Cartão de crédito"
            : "Cartão de débito"
        }
      >
        <Form form={form} layout="vertical" onFinish={onPay}>
          <Row gutter={[8, 0]}>
            <Col span={24} style={{ marginTop: 10, marginBottom: 16 }}>
              <Cards
                cvc={cvc}
                expiry={expiry || ""}
                focused={focus}
                locale={{ valid: "Validade" }}
                name={name}
                number={number}
                placeholders={{ name: "NOME TITULAR" }}
              />
            </Col>
            <Col span={24}>
              <Form.Item
                label="Número do Cartão"
                name="card_number"
                rules={[{ required: true, message: "Campo obrigatório" }]}
              >
                <InputMaskCorrect
                  autoComplete="off"
                  mask={"9999 9999 9999 9999"}
                  maskChar={""}
                  onChange={(e) => setNumber(e.target.value)}
                  onFocus={() => setFocus("number")}
                >
                  {() => <Input maxLength={19} />}
                </InputMaskCorrect>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="Nome do Titular"
                name="holder_name"
                rules={[{ required: true, message: "Campo obrigatório" }]}
              >
                <Input
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocus("name")}
                />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                label="Vencimento"
                name="expiry_month"
                rules={[{ required: true, message: "Campo obrigatório" }]}
              >
                <InputMaskCorrect
                  autoComplete="off"
                  mask={"99/99"}
                  maskChar={""}
                  onChange={(e) => setExpiry(e.target.value)}
                  onFocus={() => setFocus("expiry")}
                >
                  {() => <Input maxLength={5} placeholder="MM/AA" />}
                </InputMaskCorrect>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="ccv"
                name="ccv"
                rules={[{ required: true, message: "Campo obrigatório" }]}
              >
                <InputMaskCorrect
                  autoComplete="off"
                  mask={"999"}
                  maskChar={""}
                  onChange={(e) => setCvc(e.target.value)}
                  onFocus={() => setFocus("cvc")}
                >
                  {() => <Input maxLength={3} placeholder="" />}
                </InputMaskCorrect>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[8, 8]} justify={"end"}>
            <Col>
              <Button block onClick={() => setModalCard(false)}>
                Cancelar
              </Button>
            </Col>
            <Col>
              <Button
                block
                htmlType="submit"
                loading={loadFinish}
                type="primary"
              >
                Pagar
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>
    </PageDefault>
  );
};

export default Cart;
