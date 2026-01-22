/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: ignorar */
/** biome-ignore-all lint/complexity/noForEach: ignorar */
/** biome-ignore-all lint/style/noNestedTernary: ignorar */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: ignorar */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: ignorar */

import {
  Card,
  Col,
  Image,
  Input,
  Modal,
  Row,
  Select,
  Tabs,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import CardItem from "../../../components/CardItem";
import DrawerEndereco from "../../../components/DrawerEndereco";
import LoadItem from "../../../components/LoadItem";
// COMPONENTES
import PageDefault from "../../../components/PageDefault";

// SERVIÇOS
import {
  GET_API,
  IMAGE_NOT_FOUND,
  POST_API,
  POST_CATCH,
  verifyConfig,
} from "../../../services";

// CSS
import "./style.css";

// ICONES
import { FaMinus, FaPlus } from "react-icons/fa6";
import { ThreeCircles } from "react-loader-spinner";
import { TableReturnButton } from "../../../components/Table/buttons";

const PlaceOrderEquipment = () => {
  // RESPONSAVEL PELA ROTA
  const navigate = useNavigate();

  const { ID } = useParams<{ ID: any }>();

  const [equipamento, setEquipamento] = useState<any>(null);
  const [address, setAddress] = useState<any>(null);
  const [type, setType] = useState<any>(null);
  const [load, setLoad] = useState<boolean>(false);
  const [image, setImage] = useState<any>(null);

  const [qtde, setQtde] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  const [open, setOpen] = useState<boolean>(false);
  const onOpen = () => setOpen(!open);

  // CARREGA ENDEREÇO ATIVO
  const loadAddress = () => {
    GET_API("/address?active=1")
      .then((rs) => rs.json())
      .then((res) => {
        if (res.data.length === 0) {
          setOpen(true);
        } else {
          setAddress(res.data[0]);
        }
      });
  };

  // CARREGA MODELO
  const onView = () => {
    GET_API(`/equipment/${ID}`)
      .then((rs) => {
        if (!rs.ok) {
          Modal.warning({ title: "Algo deu errado", content: rs.statusText });
        }
        return rs.json();
      })
      .then((res) => {
        setEquipamento(res.data);
        if (!(res.data.gallery.length > 0)) {
          res.data.gallery = [{ url: IMAGE_NOT_FOUND }];
        }
        setImage(res.data.gallery[0].url);
      });
  };

  const onAdd = () => {
    if (address === null || load) {
      return false;
    }

    setLoad(true);
    POST_API("/cart_product", {
      product_id: ID,
      provider_id: equipamento.provider_id,
      quantity: qtde,
      days: getDays(),
      price: getPrice(),
      type_local: type,
      address_id: address?.id,
      productable_type: "Equipment",
    })
      .then((rs) => {
        if (rs.ok) {
          navigate("/painel/carrinho");
        } else {
          Modal.warning({ title: "Algo deu errado", content: rs.statusText });
        }
      })
      .catch(POST_CATCH)
      .finally(() => setLoad(false));
  };

  const getDays = () => {
    if (type === "day") {
      return 1;
    }
    if (type === "week") {
      return 7;
    }
    if (type === "fortnight") {
      return 15;
    }
    if (type === "month") {
      return 30;
    }
    return 0;
  };
  const getPrice = () => {
    if (type === "day") {
      return equipamento.rental_price_day;
    }
    if (type === "week") {
      return equipamento.rental_price_week;
    }
    if (type === "fortnight") {
      return equipamento.rental_price_fortnight;
    }
    if (type === "month") {
      return equipamento.rental_price_month;
    }
    return 0;
  };

  useEffect(() => onView(), [ID]);
  useEffect(() => loadAddress(), [ID]);
  useEffect(() => {
    if (equipamento) {
      if (type === "day") {
        setTotal(qtde * Number(equipamento.rental_price_day));
      } else if (type === "week") {
        setTotal(qtde * Number(equipamento.rental_price_week));
      } else if (type === "fortnight") {
        setTotal(qtde * Number(equipamento.rental_price_fortnight));
      } else if (type === "month") {
        setTotal(qtde * Number(equipamento.rental_price_month));
      } else {
        setTotal(0);
      }
    }
  }, [qtde, equipamento, type]);
  // useEffect(onCart, [ID])

  // biome-ignore lint/correctness/noNestedComponentDefinitions: ignorar
  const RenderHtml = ({ content }: { content: string }) => (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: ignorar
    <div dangerouslySetInnerHTML={{ __html: content }} />
  );

  return (
    <PageDefault
      items={[
        { title: <Link to="/painel/pedircacamba">Pedir Caçamba</Link> },
        { title: "Equipamento" },
      ]}
      options={
        <Row gutter={[8, 8]} justify={"end"}>
          <TableReturnButton permission={true} type={"edit"} />
        </Row>
      }
      valid={verifyConfig(["pdd.add"])}
    >
      {equipamento === null ? (
        <LoadItem />
      ) : (
        <Row gutter={[8, 8]}>
          <Col span={24}>
            <CardItem>
              <Row gutter={[16, 8]}>
                <Col md={11} style={{ overflow: "hidden !important" }} xs={24}>
                  <Row gutter={[2, 2]}>
                    <Col span={4}>
                      <Row gutter={[2, 2]}>
                        {equipamento.gallery.map((v: any) => (
                          <Col key={v.id} span={24}>
                            <Image
                              onClick={() => setImage(v.url)}
                              preview={false}
                              src={v.url}
                              style={{
                                cursor: "pointer",
                                borderRadius: "8px",
                                border:
                                  v.url === image
                                    ? "3px solid var(--color02)"
                                    : "none",
                              }}
                              width={"100%"}
                            />
                          </Col>
                        ))}
                      </Row>
                    </Col>
                    <Col span={20}>
                      <Image
                        src={image}
                        style={{ borderRadius: "8px" }}
                        width={"100%"}
                      />
                    </Col>
                  </Row>
                </Col>
                <Col md={13} xs={24}>
                  <Typography className="card-cacamba-title">
                    {String(equipamento.provider_name).toLocaleUpperCase()}
                  </Typography>
                  <Typography className="cacamba-name">
                    {equipamento.name}
                  </Typography>
                  <div className="cacamba-rate" style={{ marginBottom: 0 }}>
                    {" "}
                    {/*<Rate disabled style={{marginRight: 4}}/> (0)*/}{" "}
                  </div>

                  <Typography className="cacamba-title">
                    Periodo da locação
                  </Typography>
                  <Row gutter={[8, 8]}>
                    <Col span={24}>
                      <Select
                        onChange={setType}
                        placeholder="Selecione o período da locação"
                        style={{ width: "100%" }}
                      >
                        {equipamento.rental_price_day && (
                          <Select.Option value={"day"}>Diária</Select.Option>
                        )}
                        {equipamento.rental_price_week && (
                          <Select.Option value={"week"}>Semanal</Select.Option>
                        )}
                        {equipamento.rental_price_fortnight && (
                          <Select.Option value={"fortnight"}>
                            Quinzenal
                          </Select.Option>
                        )}
                        {equipamento.rental_price_month && (
                          <Select.Option value={"month"}>Mensal</Select.Option>
                        )}
                      </Select>
                    </Col>
                  </Row>

                  <Typography className="cacamba-title">
                    Escolher endereço de entrega
                  </Typography>
                  <Input
                    addonBefore={
                      <Typography className="cacamba-address" onClick={onOpen}>
                        {address === null ? "Selecionar" : "Mudar"} endereço
                      </Typography>
                    }
                    readOnly
                    value={`${address?.street}, ${address?.number} - ${address?.district} - ${address?.city.name} / ${address?.city.state.acronym}`}
                  />

                  {equipamento.stock > 0 && (
                    <Row
                      align={"middle"}
                      className="cacamba-footer"
                      gutter={[16, 16]}
                      style={{ marginTop: 30 }}
                    >
                      <Col md={12} xs={8}>
                        <Row align={"middle"} gutter={[22, 22]} justify={"end"}>
                          <Col style={{ height: 14 }}>
                            <FaMinus
                              className={`cacamba-plus ${qtde > 1 ? "" : "disabled"}`}
                              onClick={() => setQtde(qtde > 1 ? qtde - 1 : 1)}
                            />
                          </Col>
                          <Col>
                            <Typography className="cacamba-qtde">
                              {qtde}
                            </Typography>
                          </Col>
                          <Col style={{ height: 14 }}>
                            <FaPlus
                              className={`cacamba-plus ${qtde < Number(equipamento.stock) ? "" : "disabled"}`}
                              onClick={() =>
                                setQtde(
                                  qtde < Number(equipamento.stock)
                                    ? qtde + 1
                                    : qtde
                                )
                              }
                            />
                          </Col>
                        </Row>
                      </Col>
                      <Col md={12} xs={16}>
                        <div
                          className={`carrinho-button ${address === null || type === null ? "disabled" : ""}`}
                          onClick={onAdd}
                        >
                          <Typography className="carrinho-button-text">
                            {load ? (
                              <ThreeCircles
                                ariaLabel="grid-loading"
                                color={"#fff"}
                                height="20"
                                visible={true}
                                width="20"
                                wrapperClass="grid-wrapper"
                              />
                            ) : (
                              "Confirmar pedido"
                            )}
                          </Typography>
                          <Typography className="carrinho-button-text">
                            R$ {total.toFixed(2)}
                          </Typography>
                        </div>
                      </Col>
                    </Row>
                  )}

                  <Card style={{ marginTop: 30 }}>
                    <Tabs
                      centered
                      defaultActiveKey="1"
                      items={[
                        {
                          label: "Descrição",
                          key: "1",
                          children: (
                            <RenderHtml content={equipamento.description} />
                          ),
                        },
                        {
                          label: "Orientação Operacional",
                          key: "2",
                          children: (
                            <RenderHtml
                              content={equipamento.operational_orientation}
                            />
                          ),
                        },
                        {
                          label: "Orientação de Segurança",
                          key: "3",
                          children: (
                            <RenderHtml
                              content={equipamento.security_orientation}
                            />
                          ),
                        },
                      ]}
                    />
                  </Card>
                </Col>
              </Row>
            </CardItem>
          </Col>
          <DrawerEndereco
            address={address}
            close={() => setOpen(false)}
            open={open}
            provider={equipamento?.provider_id}
            setAddress={setAddress}
          />
        </Row>
      )}
    </PageDefault>
  );
};

export default PlaceOrderEquipment;
