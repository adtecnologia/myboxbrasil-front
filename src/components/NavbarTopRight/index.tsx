import { ExclamationCircleOutlined } from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Col,
  Dropdown,
  type MenuProps,
  Modal,
  Row,
  Typography,
} from "antd";
import detectUrlChange from "detect-url-change";
import { useEffect, useState } from "react";
import {
  IoCartOutline,
  IoIdCardOutline,
  IoLogOutOutline,
  IoSettingsOutline,
} from "react-icons/io5";
import { RiNotification2Line } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";
import {
  delConfig,
  delToken,
  GET_API,
  getProfileName,
  getProfileType,
  POST_CATCH,
} from "../../services";

const NavbarTopRigth = () => {
  // router
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [notf, setNotf] = useState<number>(0);
  const [dropNotf, setDropNotf] = useState<MenuProps["items"]>([
    {
      key: "*",
      label: (
        <Typography className="painel-drop-title">Notificações</Typography>
      ),
      disabled: true,
    },
  ]);

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
      onCancel() {},
    });
  };

  // função que roda assim que carregar o componente
  useEffect(() => {
    // verifica usuário logado
    GET_API("/me")
      .then((rs) => {
        if (rs.ok) return rs.json();
        Modal.warning({ title: "Algo deu errado", content: rs.statusText });
      })
      .then((res) => {
        setUser({
          id: res.data.id,
          name: res.data.name,
          photo: res.data.photo,
          profile: getProfileName(),
        });
        GET_API("/notification?page=1&per_page=6&sort=-id&status=unread")
          .then((rs) => {
            if (rs.ok) return rs.json();
            Modal.warning({ title: "Algo deu errado", content: rs.statusText });
          })
          .then((res) => {
            var temp = [
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
              });
            }
            setNotf(res.meta.total);
            setDropNotf(temp);
          });
      })
      .catch(POST_CATCH);
  }, []);

  return (
    <Row align={"middle"} className="map-user" gutter={[8, 8]}>
      <Col className="col-button-nav">
        <Dropdown arrow menu={{ items: dropNotf }}>
          <Badge
            className="painel-head-badge"
            count={notf}
            size="small"
            style={{ zIndex: 10 }}
          >
            <Button className="painel-head-button">
              <RiNotification2Line onClick={() => navigate("notificacoes")} />
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
                icon: <IoIdCardOutline color="var(--color01)" size={18} />,
              },
              {
                key: "configuracoes",
                label: <Link to="/painel/configuracoes">Configurações</Link>,
                icon: <IoSettingsOutline color="var(--color01)" size={18} />,
                style: {
                  display:
                    getProfileType() === "CITY" || getProfileType() === "TAX"
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
              <Typography className={"painel-head-typeuser"}>
                {user?.profile}
              </Typography>
              <Typography className={"painel-head-nameuser"}>
                {user?.name}
              </Typography>
            </Col>
          </Row>
        </Dropdown>
      </Col>
    </Row>
  );
};

export default NavbarTopRigth;
