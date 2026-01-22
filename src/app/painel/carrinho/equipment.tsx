/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: ignorar */
/** biome-ignore-all lint/complexity/noForEach: ignorar */
/** biome-ignore-all lint/style/noNestedTernary: ignorar */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: ignorar */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: ignorar */

import { ExclamationCircleOutlined } from "@ant-design/icons";
import {
  Card,
  Col,
  Image,
  Input,
  Modal,
  message,
  Row,
  Select,
  Tabs,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
// ICONES
import { FaMinus, FaPlus } from "react-icons/fa6";
import { ThreeCircles } from "react-loader-spinner";
import { Link, useNavigate, useParams } from "react-router-dom";
import CardItem from "../../../components/CardItem";
import DrawerEndereco from "../../../components/DrawerEndereco";
import LoadItem from "../../../components/LoadItem";
// COMPONENTES
import PageDefault from "../../../components/PageDefault";
import { TableReturnButton } from "../../../components/Table/buttons";
// SERVIÇOS
import {
  DELETE_API,
  GET_API,
  IMAGE_NOT_FOUND,
  POST_API,
  POST_CATCH,
} from "../../../services";

const CarrinhoEquipment = () => {
  // RESPONSAVEL PELA ROTA
  const navigate = useNavigate();

  const { ID } = useParams();

  const [equipamento, setEquipamento] = useState<any>(null);
  const [type, setType] = useState<any>(null);
  const [address, setAddress] = useState<any>(null);
  const [load, setLoad] = useState<boolean>(false);
  const [equipamentoLoading, setEquipamentoLoading] = useState<boolean>(true);
  const [image, setImage] = useState<any>(null);

  const [edit, setEdit] = useState<boolean>(false);
  const [compare, setCompare] = useState<number>(1);

  const [qtde, setQtde] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  const [open, setOpen] = useState<boolean>(false);
  const onOpen = () => setOpen(!open);

  // CARREGA ENDEREÇO ATIVO
  const loadAddress = () => {
    GET_API("/address?default=1")
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
    setEquipamentoLoading(true);
    GET_API(`/cart_product/${ID}`)
      .then((rs) => {
        if (!rs.ok) {
          Modal.warning({ title: "Algo deu errado", content: rs.statusText });
        }
        return rs.json();
      })
      .then((res) => {
        setAddress(res.data.address);
        setType(res.data.type_local);
        setQtde(Number(res.data.quantity));
        setEdit(true);
        setCompare(0);
        if (!(res.data.product.gallery.length > 0)) {
          res.data.product.gallery = [{ url: IMAGE_NOT_FOUND }];
        }
        setImage(res.data.product.gallery[0].url);
        setEquipamento(res.data.product);
      })
      .finally(() => setEquipamentoLoading(false));
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

  const onAdd = () => {
    if (qtde !== 0) {
      if (address === null || type === null || load) {
        return false;
      }

      setLoad(true);
      POST_API(
        "/cart_product",
        {
          quantity: qtde,
          days: getDays(),
          price: getPrice(),
          address_id: address?.id,
          type_local: type,
        },
        ID
      )
        .then((rs) => {
          if (rs.ok) {
            navigate("/painel/carrinho");
          } else {
            Modal.warning({ title: "Algo deu errado", content: rs.statusText });
          }
        })
        .catch(POST_CATCH)
        .finally(() => setLoad(false));
    } else {
      Modal.confirm({
        title: "Remover item do carrinho?",
        icon: <ExclamationCircleOutlined />,
        cancelText: "Não",
        okText: "Sim",
        onOk() {
          DELETE_API(`/cart_product/${ID}`)
            .then((rs) => {
              if (rs.ok) {
                message.success({
                  content: "Deletado com sucesso",
                  key: "screen",
                });
                navigate("/painel/carrinho");
              } else {
                Modal.warning({
                  title: "Algo deu errado",
                  content: "Não foi possível deletar registro.",
                });
              }
            })
            .catch(POST_CATCH);
        },
      });
    }
  };

  // biome-ignore lint/correctness/noNestedComponentDefinitions: ignorar
  const RenderHtml = ({ content }: { content: string }) => (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: ignorar
    <div dangerouslySetInnerHTML={{ __html: content }} />
  );

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
  }, [qtde, type]);

  return (
    <PageDefault
      items={[
        { title: <Link to="/painel/carrinho">Carrinho</Link> },
        { title: "Equipamento" },
      ]}
      options={
        <Row gutter={[8, 8]} justify={"end"}>
          <TableReturnButton permission={true} type={"edit"} />
        </Row>
      }
      valid={true}
    >
      {equipamentoLoading ? (
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
                              style={{ cursor: "pointer", borderRadius: "8px" }}
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
                        defaultValue={type}
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

                  {equipamento.stock > 0 ? (
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
                              className={`cacamba-plus ${qtde === compare ? "disabled" : ""}`}
                              onClick={() =>
                                setQtde(qtde === compare ? qtde : qtde - 1)
                              }
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
                          className={`carrinho-button ${(address === null || type === null) && qtde !== 0 ? "disabled" : ""}`}
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
                            ) : edit ? (
                              qtde > 0 ? (
                                "Atualizar"
                              ) : (
                                "Remover"
                              )
                            ) : (
                              "Adicionar"
                            )}
                          </Typography>
                          {qtde !== 0 ? (
                            <Typography className="carrinho-button-text">
                              R$ {total.toFixed(2)}
                            </Typography>
                          ) : null}
                        </div>
                      </Col>
                    </Row>
                  ) : null}

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

export default CarrinhoEquipment;
