// react libraries
import { useEffect, useState } from "react";
import { Button, Col, InputNumber, Modal, Row, Typography } from "antd";

// services
import { GET_API, POST_API, POST_CATCH } from "../../../services";

// components
import CardItem from "../../../components/CardItem";
import Filter from "../../../components/Filter";
import { Oval } from "react-loader-spinner";
import { FiTarget } from "react-icons/fi";

const Meta = () => {

    // state
    const [ano, setAno] = useState({ label: new Date().getFullYear(), value: new Date().getFullYear()})
    const [value, setValue] = useState<any>(-1)
    const [id, setId] = useState<number|null>(null)

    // filter
    const anos = [{label: '2023', value: '2023'}, {label: '2024', value: '2024'}, {label: '2025', value: '2025'}]

    // function save
    const save = (val:string) => {
        if (val) {
            setValue(-1)
            POST_API('/goal', { goal: val.replace(',', '.'), year: ano.value }, id).then(rs => {
                load()
                if (!rs.ok) Modal.warning({ title: "Algo deu errado", content: 'Não foi possível salvar meta.' })
            }).catch(POST_CATCH)
        }
    }

    // function load
    const load = () => {
        setValue(-1)
        GET_API(`/goal?year=${ano.value}`).then(rs => rs.json()).then(res => {
            if (res.data[0]?.goal) { 
                setId(res.data[0]?.id) 
                setValue(res.data[0]?.goal) 
            } else { 
                setValue(0)
                setId(null)
            }
        }).catch(POST_CATCH)
    }

    useEffect(() => load(), [ano])

    return (
        <div className='card-meta'>
             <Row gutter={[12,12]}>
                <Col flex={'auto'}>
                    <Typography className='card-meta-title'>Meta</Typography>
                </Col>
                <Col flex={'60px'}>
                    <Typography className='card-meta-title'><Filter type="alt" name='' state={ano} setState={setAno} list={anos} /></Typography>
                </Col>
               <Col span={24}>
                    <Row justify={'space-between'} align={ value > -1 ? 'top' : 'middle'} style={{flexWrap: 'nowrap', width: '100%'}}>
                        { value !== -1 ? (
                            <Col><Typography.Paragraph editable={{ onChange: save,  }} className='card-meta-value'>R$ {Number(value).toLocaleString('pt-br')}</Typography.Paragraph></Col>
                        ) : (
                            <Col>
                                <Oval
                                    visible={true}
                                    height="30"
                                    width="30"
                                    color="#ffffff"
                                    secondaryColor="#ffffff"
                                    ariaLabel="oval-loading"
                                    wrapperStyle={{}}
                                    wrapperClass=""
                                />
                            </Col>
                        ) }
                        <Col><FiTarget className="card-meta-icon" /></Col>
                    </Row>
                </Col>
            </Row>
        </div>
    )

}

export default Meta