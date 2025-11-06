import { Avatar, Badge, Button, Col, Dropdown, MenuProps, Modal, Row, Typography } from "antd"
import { RiNotification2Line } from "react-icons/ri"
import { delConfig, delToken, GET_API, getProfileName, getProfileType, POST_CATCH } from "../../services"
import { Link, useNavigate } from "react-router-dom"
import { IoCartOutline, IoIdCardOutline, IoLogOutOutline, IoSettingsOutline } from "react-icons/io5"
import { useEffect, useState } from "react"
import detectUrlChange from "detect-url-change";
import { ExclamationCircleOutlined } from "@ant-design/icons";


const NavbarTopRigth = () => {

    // router
    const navigate = useNavigate();

    const [user, setUser]         = useState<any>(null);
    const [notf, setNotf]         = useState<number>(0);
    const [dropNotf, setDropNotf] = useState<MenuProps["items"]>([ { key: "*", label: <Typography className="painel-drop-title">Notificações</Typography>, disabled: true,},]);

    // sair do sistema
    const onLogOut = () => {
        Modal.confirm({
            title: "Sair do sistema?",
            icon: <ExclamationCircleOutlined />,
            cancelText: "Não",
            okText: "Sim",
            onOk() {
                detectUrlChange.removeAllListeners()
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
        GET_API(`/me`).then((rs) => {
            if (rs.ok) return rs.json();
            else Modal.warning({ title: "Algo deu errado", content: rs.statusText });
        }).then((res) => {
            setUser({
                id: res.data.id,
                name: res.data.name,
                photo: res.data.photo,
                profile: getProfileName(),
            });
            GET_API('/notification?page=1&per_page=6&sort=-id&status=unread').then((rs) => {
                if (rs.ok) return rs.json();
                else Modal.warning({ title: "Algo deu errado", content: rs.statusText });
            }).then((res) => {
                var temp = [ { key: "*", label: <Typography className="painel-drop-title">Notificações</Typography>, disabled: true } ];
                if (res.meta.total === 0) {
                    temp.push( { key: '-', label: <span>Nenhuma notificação</span>, disabled: true} )
                } else {
                    res.data.map((item:any) => {
                        temp.push( { key: item.id, label: <Link className="painel-drop-text" to={item.url}>{item.message}</Link>, disabled: false} )
                    })
                }
                setNotf(res.meta.total)
                setDropNotf(temp)
            })
        }).catch(POST_CATCH);
    }, [])

    return (
        <Row gutter={[8, 8]} align={"middle"} className="map-user">
            <Col className="col-button-nav">
                <Dropdown menu={{ items: dropNotf }} arrow>
                    <Badge className="painel-head-badge" style={{zIndex: 10}} size="small" count={notf}>
                        <Button className="painel-head-button">
                            <RiNotification2Line onClick={() => navigate('notificacoes')} />
                        </Button>
                    </Badge>
                </Dropdown>
            </Col>
            { getProfileType() === "CUSTOMER" || getProfileType() === "LEGAL_CUSTOMER" || getProfileType() === "CUSTOMER_EMPLOYEE" ? (
                <Col>
                    <Link to="/painel/carrinho">
                        <Button className="painel-head-button">
                            <IoCartOutline />
                        </Button>
                    </Link>
                </Col>
            ) : null}
            <Col>
            <Dropdown trigger={["click", "hover"]} arrow menu={{
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
                        style: { display: ( getProfileType() === "CITY" || getProfileType() === "TAX") ? 'none' : 'block' }
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
            }}>
                <Row gutter={[4, 4]} className="painel-head-user">
                <Col>
                    <Avatar shape="square" className="painel-head-avatar" src={user?.photo} />
                </Col>
                <Col className="painel-head-text">
                    <Typography className={"painel-head-typeuser"}>
                        {user?.profile}
                    </Typography>
                    <Typography className={"painel-head-nameuser" }>
                        {user?.name}
                    </Typography>
                </Col>
                </Row>
            </Dropdown>
            </Col>
        </Row>
    )

}

export default NavbarTopRigth