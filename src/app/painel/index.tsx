/** biome-ignore-all lint/suspicious/noExplicitAny: ignorar */
import { ExclamationCircleOutlined } from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Col,
  Dropdown,
  Image,
  type MenuProps,
  Modal,
  message,
  notification,
  Row,
  Space,
  Typography,
} from "antd";
import detectUrlChange from "detect-url-change";
import React, { useEffect, useMemo, useState } from "react";
import {
  IoCartOutline,
  IoIdCardOutline,
  IoLogOutOutline,
  IoMenu,
  IoSettingsOutline,
} from "react-icons/io5";
import { RiNotification2Line } from "react-icons/ri";
import { Link, Outlet, useNavigate } from "react-router-dom";
// styles
import "./styles.css";
// images
const logo = `${import.meta.env.VITE_URL_ASSETS}/4.png`;

import PdfViewerComponent from "@/components/PdfComponent";
import SidebarComponent from "@/components/sidebar-component";
// services
import {
  delConfig,
  delToken,
  GET_API,
  getProfileName,
  getProfileOwner,
  getProfileType,
  getToken,
  POST_API,
  POST_CATCH,
  verifyConfig,
} from "../../services";

const Panel = () => {
  // router
  const navigate = useNavigate();

  // context
  const Context = React.createContext({ name: "Default" });
  const contextValue = useMemo(() => ({ name: "I9 Coleta" }), []);

  // notification
  const [api, contextHolder] = notification.useNotification();

  // states
  const [url, setUrl] = useState<string>(window.location.href.split("/")[4]);
  const [menuMain, setMenuMain] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [notf, setNotf] = useState<number>(0);

  const [sendTerm, setSendTerm] = useState<boolean>(false);
  const [modalTermos, setModalTermos] = useState<boolean>(false);
  const [modalPolitica, setModalPolitica] = useState<boolean>(false);
  const [termoData, setTermoData] = useState<any>();
  const [politicaData, setPoliticaData] = useState<any>();

  const [dropNotf, setDropNotf] = useState<MenuProps["items"]>([
    {
      key: "*",
      label: (
        <Typography className="painel-drop-title">Notificações</Typography>
      ),
      disabled: true,
    },
  ]);

  // carregar notificações
  const onLoadNotf = () => {
    GET_API("/notification?page=1&per_page=6&sort=-id&status=unread")
      .then((rs) => {
        if (rs.ok) {
          return rs.json();
        }
        Modal.warning({ title: "Algo deu errado", content: rs.statusText });
      })
      .then((res) => {
        const temp = [
          {
            key: "*",
            label: (
              <Typography className="painel-drop-title">
                Notificações
              </Typography>
            ),
            disabled: true,
          },
        ];
        if (res.meta.total === 0) {
          temp.push({
            key: "-",
            label: <span>Nenhuma notificação</span>,
            disabled: true,
          });
        } else {
          res.data.map((item: any) => {
            temp.push({
              key: item.id,
              label: (
                <Link className="painel-drop-text" to={item.url}>
                  {item.message}
                </Link>
              ),
              disabled: false,
            });
            return null;
          });
        }
        setNotf(res.meta.total);
        setDropNotf(temp);
      });
  };

  // sair do sistema
  const onLogOut = () => {
    Modal.confirm({
      title: "Sair do sistema?",
      icon: <ExclamationCircleOutlined />,
      cancelText: "Não",
      okText: "Sim",
      onOk() {
        detectUrlChange.removeAllListeners();
        delConfig();
        delToken();
        navigate("/login");
      },
    });
  };

  // mudar estado menu
  const onMenuMain = () => setMenuMain(!menuMain);

  // função que roda assim que carregar o componente
  useEffect(() => {
    // verifica usuário logado
    GET_API("/me")
      .then((rs) => {
        if (rs.ok) {
          return rs.json();
        }
        Modal.warning({ title: "Algo deu errado", content: rs.statusText });
      })
      .then((res) => {
        setUser({
          id: res.data.id,
          name: res.data.name,
          photo: res.data.photo,
          profile: getProfileName(),
        });
      })
      .catch(POST_CATCH);

    // carregar notificações
    onLoadNotf();

    verifyLgpd();
    // função que observa a mudança na rota para atualizar menu ativo
    detectUrlChange.on("change", (newUrl) => {
      const params = String(newUrl).split("/");
      setUrl(params[4]);
      setMenuMain(false);
      if (getToken() == null) {
        navigate("/login");
      }
    });
    // verificar carrinho
    if (verifyConfig(["dsh.cln"])) {
      POST_API("/cart", {})
        .then((rs) => rs.json())
        .then(() => {
          // if (res.return) {
          // }
        })
        .catch(POST_CATCH);
    }
  }, []);

  const verifyLgpd = () => {
    GET_API("/lgpd_acceptance/verify")
      .then((rs) => rs.json())
      .then((res) => {
        if (!res.term_of_use_accepted) {
          onAceiteTermos();
          return;
        }
        if (!res.privacy_policy_accepted) {
          onAceitePolitica();
          return;
        }
      });
  };

  const onSend = (values: any) => {
    setSendTerm(true);
    POST_API("/lgpd_acceptance", {
      ...values,
      id: values.type === "term_of_use" ? termoData.id : politicaData.id,
    })
      .then((rs) => rs.json())
      .then((res) => {
        message.success(res.message);
        verifyLgpd();
        setSendTerm(false);
        setModalPolitica(false);
        setModalTermos(false);
      });
  };

  const onAceiteTermos = () => {
    GET_API("/term_of_use/latest")
      .then((rs) => rs.json())
      .then((res) => {
        setModalTermos(true);
        setTermoData(res.data);
      });
  };

  const onAceitePolitica = () => {
    GET_API("/privacy_policy/latest")
      .then((rs) => rs.json())
      .then((res) => {
        setModalPolitica(true);
        setPoliticaData(res.data);
      });
  };

  // função que roda quando o valor do state user altera
  useEffect(() => {
    if (user) {
      // observa as notificações
      window.Echo.channel("notifications").listen(
        ".App\\Events\\Notification\\Created",
        (e: any) => {
          if (
            (getProfileType() === "SELLER_DRIVER" &&
              user.id === e.notification.user_to_id) ||
            (getProfileType() !== "SELLER_DRIVER" &&
              Number(getProfileOwner()) === e.notification.user_to_id)
          ) {
            // onLoadNotf()
            api.info({
              message: `Olá, ${user?.name}`,
              description: e.notification.message,
              placement: "bottomRight",
              key: e.notification.id,
              duration: 8,
              btn: (
                <Space>
                  <Button
                    onClick={() => {
                      POST_API(
                        "/notification",
                        { status: "read" },
                        e.notification.id
                      );
                    }}
                    type="default"
                  >
                    Marcar como lida
                  </Button>
                  <Button
                    onClick={() => navigate(e.notification.url)}
                    type="primary"
                  >
                    Abrir
                  </Button>
                </Space>
              ),
            });
          }
        }
      );
    }
  }, [user]);

  return (
    <Row className="painel">
      <Context.Provider value={contextValue}>
        {" "}
        {contextHolder}{" "}
      </Context.Provider>
      <div className="painel-logo">
        <Image className="painel-logo-img" preview={false} src={logo} />
      </div>
      <Col className="painel-head" span={24}>
        <Row
          align={"middle"}
          className="painel-head-row"
          justify={"space-between"}
        >
          <Col>
            <IoMenu className="painel-menu" onClick={onMenuMain} />
          </Col>
          <Col>
            <Row align={"middle"} gutter={[8, 8]}>
              <Col>
                <Dropdown arrow menu={{ items: dropNotf }}>
                  <Badge
                    className="painel-head-badge"
                    count={notf}
                    size="small"
                    style={{ zIndex: 10 }}
                  >
                    <Button className="painel-head-button">
                      <RiNotification2Line
                        onClick={() => navigate("notificacoes")}
                      />
                    </Button>
                  </Badge>
                </Dropdown>
              </Col>
              {getProfileType() === "CUSTOMER" ||
              getProfileType() === "LEGAL_CUSTOMER" ||
              getProfileType() === "CUSTOMER_EMPLOYEE" ? (
                <Col>
                  <Link to="/painel/carrinho">
                    <Button className="painel-head-button">
                      <IoCartOutline />
                    </Button>
                  </Link>
                </Col>
              ) : null}
              <Col>
                <Dropdown
                  arrow
                  menu={{
                    items: [
                      {
                        key: "perfil",
                        label: <Link to="/painel/meuperfil">Meu Perfil</Link>,
                        icon: (
                          <IoIdCardOutline color="var(--color01)" size={18} />
                        ),
                      },
                      {
                        key: "configuracoes",
                        label: (
                          <Link to="/painel/configuracoes">Configurações</Link>
                        ),
                        icon: (
                          <IoSettingsOutline color="var(--color01)" size={18} />
                        ),
                        style: {
                          display:
                            getProfileType() === "CITY" ||
                            getProfileType() === "TAX"
                              ? "none"
                              : "block",
                        },
                      },
                      {
                        key: "sair",
                        label: "Sair",
                        icon: <IoLogOutOutline color="#FFF" size={18} />,
                        style: {
                          backgroundColor: "var(--color04)",
                          color: "#FFF",
                        },
                        onClick: onLogOut,
                      },
                    ],
                  }}
                  trigger={["click", "hover"]}
                >
                  <Row className="painel-head-user" gutter={[4, 4]}>
                    <Col>
                      <Avatar
                        className="painel-head-avatar"
                        shape="square"
                        src={user?.photo}
                      />
                    </Col>
                    <Col className="painel-head-text">
                      <Typography className="painel-head-typeuser">
                        {user?.profile}
                      </Typography>
                      <Typography className="painel-head-nameuser">
                        {user?.name}
                      </Typography>
                    </Col>
                  </Row>
                </Dropdown>
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
      <Col className="painel-body" span={24}>
        <Row style={{ flexWrap: "nowrap" }}>
          <SidebarComponent {...{ user, menuMain, notf, url }} />
          <Col className="painel-content" flex={"auto"}>
            <Outlet />
          </Col>
        </Row>
      </Col>
      <Modal
        className="no-footer"
        closable={false}
        destroyOnHidden
        footer={false}
        open={modalTermos && termoData}
        style={{ top: 10 }}
      >
        <Typography className="title-termo">Termos de uso</Typography>
        <PdfViewerComponent fileUrl={termoData?.document} />
        <Row gutter={[8, 8]} justify={"center"} style={{ marginTop: 10 }}>
          <Col>
            <Button
              onClick={() =>
                Modal.warning({
                  title: "Atenção!",
                  content:
                    "Aceitar os termos de uso é obrigatório para utilizar nossos serviços. Sem essa concordância, não será possível continuar.",
                })
              }
              type="default"
            >
              Não concordo
            </Button>
          </Col>
          <Col>
            <Button
              loading={sendTerm}
              onClick={() => {
                const now = new Date();
                const formatted = now
                  .toISOString()
                  .slice(0, 19)
                  .replace("T", " ");
                setSendTerm(true);
                setTimeout(() => {
                  onSend({ type: "term_of_use", value: formatted });
                }, 1000);
              }}
              type="primary"
            >
              Declaro que li e concordo com os termos de uso
            </Button>
          </Col>
        </Row>
      </Modal>
      <Modal
        className="no-footer"
        closable={false}
        destroyOnHidden
        footer={false}
        open={modalPolitica && politicaData}
        style={{ top: 10 }}
      >
        <Typography className="title-termo">Política de privacidade</Typography>
        <PdfViewerComponent fileUrl={politicaData?.document} />
        <Row gutter={[8, 8]} justify={"center"} style={{ marginTop: 10 }}>
          <Col>
            <Button
              onClick={() =>
                Modal.warning({
                  title: "Atenção!",
                  content:
                    "Aceitar a política de privacidade é obrigatório para utilizar nossos serviços. Sem essa concordância, não será possível continuar.",
                })
              }
              type="default"
            >
              Não concordo
            </Button>
          </Col>
          <Col>
            <Button
              loading={sendTerm}
              onClick={() => {
                const now = new Date();
                const formatted = now
                  .toISOString()
                  .slice(0, 19)
                  .replace("T", " ");
                setSendTerm(true);
                setTimeout(() => {
                  onSend({ type: "privacy_policy", value: formatted });
                }, 1000);
              }}
              type="primary"
            >
              Declaro que li e concordo com a política de privacidade
            </Button>
          </Col>
        </Row>
      </Modal>
    </Row>
  );
};

export default Panel;
