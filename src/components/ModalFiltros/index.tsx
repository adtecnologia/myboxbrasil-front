// BIBLIOTECAS REACT
import { Button, Col, Modal, Popover, Row, Slider, Tag, Typography } from "antd";
import { useEffect, useState } from "react";

// ICONES
import { IoClose } from "react-icons/io5";
import { AiOutlineClear } from "react-icons/ai";
import { BsCurrencyDollar, BsPinMap, BsSortDownAlt, BsStar } from "react-icons/bs";

// CSS
import './style.css';
import { GET_API } from "../../services";

// INTERFACE
interface ModalFiltrosInterface {
    open: boolean,
    close: any,
    action?: Function,
    disabled?: string
}

const ModalFiltros = ( { open, close, action = () => {}, disabled } : ModalFiltrosInterface ) => {

    // ESTADOS DO COMPONENTE
    const [ tab, setTab ] = useState<number>(1)

    const [ typeLocalI, setTypeLocalI ] = useState<boolean>(true)
    const [ typeLocalE, setTypeLocalE ] = useState<boolean>(true)

    const [ order, setOrder ] = useState<'O'|'PE'|'PI'|'A'|'D'>('O')

    const [ typeLid, setTypeLid ] = useState<'A'|'C'|'S'|''>('')

    const [ priceE, setPriceE ] = useState<number[]>([0, 10000])
    const [ priceI, setPriceI ] = useState<number[]>([0, 10000])

    const [ residue, setResidue ] = useState<any[]>([])
    const [ residueSelect, setResidueSelect ] = useState<any[]>([])
    const [ loadResidue, setLoadResidue ] = useState<boolean>(false)

    const [ model, setModel ] = useState<any[]>([])
    const [ modelSelect, setModelSelect ] = useState<any[]>([])

    const onClear = () => {
        setTypeLocalE(true)
        setTypeLocalI(true)
        setOrder('O')
        setTypeLid('')
        setPriceE([0, 10000])
        setPriceI([0, 10000])
        setResidueSelect([])
        setModelSelect([])
    }

    const onResidue = () => {
        GET_API('/residue').then(rs => rs.json()).then(res => {
            setResidue(res.data)
        })
    }

    const onModel = () => {
        GET_API('/stationary_bucket_type').then(rs => rs.json()).then(res => {
            setModel(res.data)
        })
    }

    const onResidueSelect = (val: any) => {

        setLoadResidue(true)

        var temp = residueSelect
        if (temp.includes(val)) {
            temp.splice(temp.indexOf(val), 1)
        } else {
            temp.push(val)
        }

        setResidueSelect(temp)
        setTimeout(() => {
            setLoadResidue(false)
        }, 500);
        
    } 

    const onSend = () => {
        action({
            residue: residueSelect,
            model: modelSelect,
            type_local: typeLocalE && typeLocalI ? '' : typeLocalE ? 'E' : typeLocalI ? 'I' : '',
            sorter: order,
            priceE: priceE,
            type_lid: typeLid
        })
    }

    useEffect(() => {
        onResidue()
        onModel()
    }, [open])

    return (
        <Modal open={open} footer={false} closable={false} style={{top: 10}}>
            <Row justify={'space-between'} align={'middle'} gutter={[8,16]}>
                <Col style={{height: 19.6}}><IoClose className="mf-icones" onClick={close} /></Col>
                <Col><Typography className="mf-titulo">Filtros</Typography></Col>
                <Col style={{height: 19.6}}><AiOutlineClear onClick={onClear} className="mf-icones" /></Col>
                <Col span={24}>
                    <div className="mf-tab">
                        <div className={`mf-tab-item ${tab === 1 ? 'active' : ''}`} onClick={() => setTab(1)}><Typography>Básicos</Typography></div>
                        <div className={`mf-tab-item ${tab === 2 ? 'active' : ''}`} onClick={() => setTab(2)}><Typography>Resíduos</Typography></div>
                    </div>
                    { tab === 1 ? (
                        <Row gutter={[18,18]}>
                            {/* { disabled !== 'model' ? (
                                <Col span={24}>
                                    <Typography className="mf-title">Modelo</Typography>
                                    <Row gutter={[4,4]}>
                                        { model.map((v:any, i:any) =>
                                            <Col key={i}><Tag onClick={() => setModelSelect(v.id)} className={`mf-tag ${modelSelect == v.id ? 'active' : ''}`}>{v.name}</Tag></Col>
                                        ) }
                                    </Row>
                                </Col>
                            ) : null }
                            { disabled !== 'type_local' ? (
                                <Col span={24}>
                                    <Typography className="mf-title">Tipo de locação</Typography>
                                    <Row gutter={[4,4]} key={'type'}>
                                        <Col><Tag className={`mf-tag ${typeLocalE ? 'active' : ''}`} onClick={() => setTypeLocalE(!typeLocalE)}>Locação Externa</Tag></Col>
                                        <Col><Tag className={`mf-tag ${typeLocalI ? 'active' : ''}`} onClick={() => setTypeLocalI(!typeLocalI)}>Locação Interna</Tag></Col>
                                    </Row>
                                </Col>
                            ) : null } */}
                            <Col span={24}>
                                <Typography className="mf-title">Tipo de tampa</Typography>
                                <Row gutter={[4,4]}>
                                    <Col><Tag className={`mf-tag ${typeLid === 'S' ? 'active' : ''}`} onClick={() => setTypeLid('S')}>Sem Tampa</Tag></Col>
                                    <Col><Tag className={`mf-tag ${typeLid === 'C' ? 'active' : ''}`} onClick={() => setTypeLid('C')}>Tampa Corrediça</Tag></Col>
                                    <Col><Tag className={`mf-tag ${typeLid === 'A' ? 'active' : ''}`} onClick={() => setTypeLid('A')}>Tampa Articulada</Tag></Col>
                                </Row>
                            </Col>
                            <Col span={24}>
                                <Typography className="mf-title">Ordenar por</Typography>
                                <Row gutter={[4,4]} justify={'space-between'}>
                                    <Col onClick={() => setOrder('O')}><div className={`mf-bt-ordem ${ order === 'O' ? 'active' : '' }`}><BsSortDownAlt className="mf-ic-ordem"/></div><br/><Typography className={`mf-tx-ordem ${ order === 'O' ? 'active' : '' }`}>Padrão</Typography></Col>
                                    <Col onClick={() => setOrder('PE')}><div className={`mf-bt-ordem ${ order === 'PE' ? 'active' : '' }`}><BsCurrencyDollar className="mf-ic-ordem"/></div><br/><Typography className={`mf-tx-ordem ${ order === 'PE' ? 'active' : '' }`}>Menor Preço</Typography></Col>
                                    <Col onClick={() => setOrder('PI')}><div className={`mf-bt-ordem ${ order === 'PI' ? 'active' : '' }`}><BsCurrencyDollar className="mf-ic-ordem"/></div><br/><Typography className={`mf-tx-ordem ${ order === 'PI' ? 'active' : '' }`}>Maior Preço</Typography></Col>
                                    {/* <Col onClick={() => setOrder('A')}><div className={`mf-bt-ordem ${ order === 'A' ? 'active' : '' }`}><BsStar className="mf-ic-ordem"/></div><br/><Typography className={`mf-tx-ordem ${ order === 'A' ? 'active' : '' }`}>Avaliação</Typography></Col> */}
                                    <Col onClick={() => setOrder('D')}><div className={`mf-bt-ordem ${ order === 'D' ? 'active' : '' }`}><BsPinMap className="mf-ic-ordem"/></div><br/><Typography className={`mf-tx-ordem ${ order === 'D' ? 'active' : '' }`}>Menor Distância</Typography></Col>
                                </Row>
                            </Col>
                            <Col span={24}>
                                <Typography className="mf-title">Preço</Typography>
                                <Typography className="mf-subtitle">entre R$ {priceE[0]} e R$ {priceE[1]}</Typography>
                                <div className="mf-sl-div"> <Typography className="mf-sl-mark">R$ 0,00</Typography> <Typography className="mf-sl-mark">R$ 10.000,00</Typography> </div>
                                <Slider value={priceE} range={true} onChange={setPriceE} min={0} max={10000} styles={{ track: { background: 'var(--color02)' } }} />
                            </Col>
                            {/* <Col span={24}>
                                <Typography className="mf-title">Preço Interno</Typography>
                                <Typography className="mf-subtitle">entre R$ {priceI[0]} e R$ {priceI[1]}</Typography>
                                <div className="mf-sl-div"> <Typography className="mf-sl-mark">R$ 0,00</Typography> <Typography className="mf-sl-mark">R$ 10.000,00</Typography> </div>
                                <Slider value={priceI} range={true} onChange={setPriceI} min={0} max={10000} styles={{ track: { background: 'var(--color02)' } }} />
                            </Col> */}
                        </Row>
                    ) : tab === 2 ? (
                        <Row gutter={[8,8]}>
                            <Col span={24} key={'reside'}>
                                <Typography className="mf-title">Selecionar resíduos</Typography>
                                <Row gutter={[4,4]}>
                                    { residue.map((v:any, i:any) =>
                                        loadResidue ? <Col><Popover overlayStyle={{width: 300}} title={v.name} content={v.description}><Tag onClick={() => onResidueSelect(Number(v.id))} className={`mf-tag ${residueSelect.includes(Number(v.id)) ? 'active' : ''}`}>{v.name}</Tag></Popover></Col> : <Col><Popover overlayStyle={{width: 300}} title={v.name} content={v.description}><Tag onClick={() => onResidueSelect(Number(v.id))} className={`mf-tag ${residueSelect.includes(Number(v.id)) ? 'active' : ''}`}>{v.name}</Tag></Popover></Col>
                                    ) }
                                </Row>
                            </Col>
                        </Row>
                    ) : null }
                </Col>
                <Col span={24}>
                    <Button block type="primary" size="large" onClick={onSend}>Ver resultados</Button>
                </Col>
            </Row>
        </Modal>
    )

}

export default ModalFiltros;