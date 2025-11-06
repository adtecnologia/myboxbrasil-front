// BIBLIOTECAS REACT
import { Col } from "antd";
import { Link, useNavigate } from "react-router-dom";

// SERVIÇOS
import { verifyConfig } from "../../services"

// CSS
import './styles.css'
import { useEffect, useState } from "react";
import { IoChevronDown, IoChevronForward } from "react-icons/io5";

// INTERFACE
interface MenuItemInterface {
    permission?: any,
    route?: string,
    url?: string,
    icon?: any,
    name: string,
    menu?: boolean,
    type?: 'menu' | 'group',
    children?: MenuItemInterface[]
}

const MenuItem = ( { permission, route, url, icon, name, type = 'menu', children, menu } : MenuItemInterface ): JSX.Element => {

    // RESPONSÁVEL PELA ROTA
    const navigate = useNavigate()

    // ESTADOS DO COMPONENTE
    const [ open, setOpen ] = useState(false)
    const [ visible, setVisible ] = useState(false)

    // VERIRIFICA SE GRUPO ESTA ATIVO
    useEffect(() => {
        children?.map((v:any) => {
            if (verifyConfig([v.permission]) || v.permission === true) setVisible(true)
            return null
        })
        var temp:any = [];
        children?.map((v:any, i) => {
            if (verifyConfig([v.permission]) || v.permission === true) {
                temp.push({ key: i, label: <Link to={`/painel/${v.route}`}>{v.name}</Link> })
            }
        })
    }, [])

    // CARREGA MENU
    if (type === 'menu' && (verifyConfig([permission]) || permission === true)) return (
        <Col span={24}>
            <div className={ url === route ? "painel-sidebar-btn active" : "painel-sidebar-btn" } onClick={() => navigate(`/painel/${route}`)}>
                <div className="painel-sidebar-btn-icon">{icon}</div>
                <div className="painel-sidebar-btn-text">{name}</div>
            </div>
        </Col>
    );

    // CARREGA DROPDOWN
    if (type === 'group' && (verifyConfig([permission]) || permission === true)) return (
        <Col span={24} className="painel-sidebar-btn-col">
            <div className="painel-sidebar-btn" onClick={() => setOpen(!open)}>
                <div className="painel-sidebar-btn-icon">{icon}</div>
                <div className="painel-sidebar-btn-text">{name}</div>
                <div className="painel-sidebar-btn-arrow">{ open ? <IoChevronDown/> : <IoChevronForward/> }</div>
            </div>
            { !menu ? (
                <div className="painel-sidebar-dropdown">
                    { children?.map((v:any, i) => (verifyConfig([v.permission]) || v.permission === true) ? (
                        <div key={`menuitem${i}`} className={ v.url === v.route ? "painel-sidebar-btn-drop active" : "painel-sidebar-btn-drop" } onClick={() => navigate(`/painel/${v.route}`)}>
                            <div className="painel-sidebar-btn-drop-text">{v.name}</div>
                        </div>
                    ) : null ) }
                </div>
            ) : null }
            { children?.map((v:any, i) => (verifyConfig([v.permission]) || v.permission === true) ? (
                <Col style={{ display: open && menu ? 'block' : 'none' }} span={24} key={`menuitem${i}`} className="painel-sidebar-col">
                    <div className={ v.url === v.route ? "painel-sidebar-btn-sub active" : "painel-sidebar-btn-sub" } onClick={() => navigate(`/painel/${v.route}`)}>
                        <div className="painel-sidebar-btn-icon"></div>
                        <div className="painel-sidebar-btn-text">{v.name}</div>
                    </div>
                </Col>
            ): null ) }
        </Col>
    );

    return <></>

}

export default MenuItem