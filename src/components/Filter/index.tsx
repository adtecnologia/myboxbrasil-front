// react libraries
import { Col, Dropdown, Row } from "antd"

// css
import './styles.css'

// create menu fitler
const menu = (list: any[], callback: any) => {
    return list.map((item, index) => {
        return { key: `${index + 1}`, label: item.label, onClick: () => callback(item) }
    })
}

// interface
interface FilterInterface {
    name: string,
    state: any,
    setState: any,
    list: any[],
    type?: string
}

const Filter = ( { name, state, setState, list, type = 'normal' } : FilterInterface ) => {

    return (
        <Dropdown menu={{ items: menu(list, setState) }} >
            <Row align={'middle'} justify={'center'} className={`filter-btn-card ${type}`}>
                <Col style={{lineHeight: 1}}>{name ? `${name}:` : null} {state.label}</Col>
            </Row>
        </Dropdown>
    )
}

export default Filter