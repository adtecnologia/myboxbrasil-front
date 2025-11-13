import {
  Avatar,
  Badge,
  Button,
  Col,
  Divider,
  Menu,
  Row,
  Typography,
} from "antd";
import { IoCartOutline } from "react-icons/io5";
import { RiNotification2Line } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";
import { getProfileType } from "@/services";
import items from "./items";

interface SidebarComponentProps {
  menuMain: boolean;
  user: any;
  url: string;
  notf: number;
}

export default function SidebarComponent({
  menuMain,
  user,
  notf,
  url,
}: SidebarComponentProps) {
  const navigate = useNavigate();

  return (
    <Col
      className={menuMain ? "painel-sidebar active" : "painel-sidebar"}
      flex={"auto"}
    >
      <div className={"painel-sidebar-content"}>
        <Row
          align={"middle"}
          style={{ flexDirection: "column", padding: "0.6em 0.4em" }}
        >
          <Col>
            <Avatar
              className="painel-sidebar-avatar"
              src={user?.photo}
              style={{ transition: "0.2s" }}
            />
          </Col>
          <Col className="painel-sidebar-col">
            <Typography className="painel-sidebar-name">
              {user?.name}
            </Typography>
          </Col>
          <Col className="painel-sidebar-col">
            <Row align={"middle"} gutter={[8, 8]} style={{ marginTop: 8 }}>
              <Col>
                <Badge count={notf} size="small" style={{ zIndex: 10 }}>
                  <Button
                    className="painel-sidebar-button"
                    onClick={() => navigate("notificacoes")}
                  >
                    <RiNotification2Line />
                  </Button>
                </Badge>
              </Col>
              {(getProfileType() === "CUSTOMER" ||
                getProfileType() === "LEGAL_CUSTOMER" ||
                getProfileType() === "CUSTOMER_EMPLOYEE") && (
                <Col>
                  <Link to="/painel/carrinho">
                    <Button className="painel-sidebar-button">
                      <IoCartOutline />
                    </Button>
                  </Link>
                </Col>
              )}
            </Row>
          </Col>
        </Row>
        <Divider style={{ margin: "0px" }} />
        <Row className="painel-sidebar-scroll" style={{ marginTop: "0.4em" }}>
          {user !== null && (
            <Col span={24}>
              <Menu
                className="my-menu"
                defaultSelectedKeys={[url]}
                inlineCollapsed={!menuMain}
                items={items}
                mode="inline"
                onClick={(e) => navigate(e.key)}
                selectedKeys={[url]}
              />
            </Col>
          )}
        </Row>
      </div>
    </Col>
  );
}
