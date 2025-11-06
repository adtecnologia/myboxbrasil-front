// BIBLIOTECAS REACT
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Col, Image, Input, List, message, Modal, Rate, Row, Select, Switch, Typography } from "antd";
import { ThreeCircles } from "react-loader-spinner";

// COMPONENTES
import PageDefault from "../../../components/PageDefault";
import CardItem from "../../../components/CardItem";
import LoadItem from "../../../components/LoadItem";
import DrawerEndereco from "../../../components/DrawerEndereco";
import { TableReturnButton } from "../../../components/Table/buttons";

// SERVIÇOS
import { DELETE_API, GET_API, IMAGE_NOT_FOUND, POST_API, POST_CATCH, getToken } from "../../../services";

// ICONES
import { FaMinus, FaPlus } from "react-icons/fa6";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const CarrinhoView = () => {

    // RESPONSAVEL PELA ROTA
    const navigate = useNavigate()
    
    const { ID } = useParams()

    const [ cacamba, setCacamba ] = useState<any>(null)
    const [ typeLocal, setTypeLocal ] = useState<'E'|'I'|''>('')
    const [ address, setAddress ] = useState<any>(null)
    const [ load, setLoad ] = useState<boolean>(false)
    const [ cacambaLoading, setCacambaLoading ] = useState<boolean>(true)
    const [ image, setImage ] = useState<any>(null)

    const [ edit, setEdit ] = useState<boolean>(false)
    const [ compare, setCompare ] = useState<number>(1)

    const [ qtde, setQtde ] = useState<number>(1)
    const [ total, setTotal ] = useState<number>(0)

    const [ open, setOpen ] = useState<boolean>(false)
    const onOpen = () => setOpen(!open)

    const [ residueSelect, setResidueSelect ] = useState<any[]>([]);
    const [ residueNameSelect, setResidueNameSelect ] = useState<any[]>([]);
    const [ residuBlockOthers, setResidueBlockOthers ] = useState<boolean>(false);
    const [ residuBlockD, setResidueBlockD ] = useState<boolean>(false);
    const [ residuBlockC, setResidueBlockC ] = useState<boolean>(false);
    const [ residueOpen, setResidueOpen ] = useState<boolean>(false)
    const onResidueOpen = () => setResidueOpen(!residueOpen)

    // CARREGA ENDEREÇO ATIVO
    const loadAddress = () => {
        GET_API("/address?default=1")
        .then((rs) => rs.json())
        .then((res) => {
            if (res.data.length === 0) {
            setOpen(true)
            } else {
            setAddress(res.data[0])
            }
        });
    };

    // CARREGA MODELO
    const onView = () => {
        setCacambaLoading(true)
        setResidueSelect([])
        setResidueNameSelect([])
        GET_API(`/cart_product/${ID}`)
        .then((rs) => {
          if (!rs.ok) {
            Modal.warning({ title: "Algo deu errado", content: rs.statusText });
          }
          return rs.json();
        })
        .then(async (res) => {
            setAddress(res.data.address)
            setTypeLocal(res.data.type_local)
            setQtde(Number(res.data.quantity))
            setEdit(true)
            setCompare(0)
            res.data.residues.map((residue:any) => {
                onResidue(residue)
            })
            if (!(res.data.product.gallery.length > 0)) {
                res.data.product.gallery = [ { url: IMAGE_NOT_FOUND } ]
            }
            setImage(res.data.product.gallery[0].url)
            setCacamba(res.data.product)
        }).finally(() => setCacambaLoading(false))
    } 

    const onResidue = (item: any) => {
        var temp = residueSelect
        var name = residueNameSelect
        if (temp.includes(item.id)) {
          temp.splice(temp.indexOf(item.id), 1)
          name.splice(name.indexOf(item.name), 1)
        } else {
          temp.push(item.id)
          name.push(item.name)
        }
        setResidueSelect(temp)
        setResidueNameSelect(name)
        onVerifyResidue()
    };

    const onAdd = () => {

        if (qtde !== 0) {
            if (address === null || typeLocal === '' || residueSelect.length === 0 ||  load) return false;
            
            setLoad(true)
            POST_API(`/cart_product`, {
                "quantity": qtde,
                "days": typeLocal === 'I' ? cacamba.days_internal : cacamba.days_external,
                "price": typeLocal === 'I' ? cacamba.price_internal : cacamba.price_external,
                "address_id": address?.id,
                "type_local": typeLocal,
                "residues": residueSelect
            }, ID )
            .then((rs) => {
                if (rs.ok) {
                    navigate('/painel/carrinho')
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
                    DELETE_API(`/cart_product/${ID}`).then((rs) => {
                        if (rs.ok) {
                        message.success({ content: 'Deletado com sucesso', key: "screen" });
                        navigate('/painel/carrinho')
                        } else {
                        Modal.warning({
                            title: "Algo deu errado",
                            content: "Não foi possível deletar registro.",
                        });
                        }
                    }).catch(POST_CATCH);
            }})
        }

    }

    useEffect(() => onView(), [ID])
    useEffect(() => loadAddress(), [ID])
    useEffect(() => {
        if ( typeLocal === 'I' ) setTotal(qtde*Number(cacamba.price_internal))
        if ( typeLocal === 'E' ) setTotal(qtde*Number(cacamba.price_external))
    }, [qtde, typeLocal])

    const onVerifyResidue = () => {
        setResidueBlockC(residueNameSelect.includes('Classe A1') || residueNameSelect.includes('Classe A2') || residueNameSelect.includes('Classe A3') || residueNameSelect.includes('Classe B') || residueNameSelect.includes('Classe D'));
        setResidueBlockD(residueNameSelect.includes('Classe A1') || residueNameSelect.includes('Classe A2') || residueNameSelect.includes('Classe A3') || residueNameSelect.includes('Classe B') || residueNameSelect.includes('Classe C'));
        setResidueBlockOthers(residueNameSelect.includes('Classe C') || residueNameSelect.includes('Classe D'));
    }

    useEffect(() => {
        onVerifyResidue()
    }, [residueSelect, residueNameSelect])

    return (
        <PageDefault valid={true} items={[
            { title: <Link to="/painel/carrinho">Carrinho</Link>, },
            { title: 'Caçamba' }
        ]} options={
            <Row justify={'end'} gutter={[8,8]}>
                <TableReturnButton type={'edit'} permission={true} />
            </Row>
        }>
            { cacambaLoading ? <LoadItem /> : (
                <Row gutter={[8,8]}>
                    <Col span={24}>
                        <CardItem>
                            <Row gutter={[16,8]}>
                                <Col xs={24} md={11} style={{overflow: 'hidden !important'}}>
                                    <Row gutter={[2,2]}>
                                        <Col span={4}>
                                            <Row gutter={[2,2]}>
                                                { cacamba.gallery.map((v:any, i:any) => (
                                                    <Col span={24} key={i}><Image preview={false} src={v.url} width={'100%'} style={{cursor: 'pointer', borderRadius: '8px'}} onClick={() => setImage(v.url)} /></Col>
                                                )) }
                                            </Row>
                                        </Col>
                                        <Col span={20}><Image src={image} width={'100%'} style={{borderRadius: '8px'}} /></Col>
                                    </Row>
                                </Col>
                                <Col xs={24} md={13}>
                                    <Typography onClick={() => navigate(`/painel/pedircacamba/fornecedor/${cacamba.provider_id}`)} className='card-cacamba-title'>{String(cacamba.provider_name).toLocaleUpperCase()}</Typography>
                                    <Typography className="cacamba-name">Modelo {cacamba.stationary_bucket_type.name}</Typography>
                                    <div className="cacamba-rate" style={{marginBottom: 38}}> {/*<Rate disabled style={{marginRight: 4}}/> (0)*/} </div>
                                    
                                    <Row gutter={[8,8]}>
                                        <Col md={9} xs={12}>
                                            <Typography className="cacamba-title">Detalhes</Typography>
                                            <Typography className="cacamba-desc"><span>Tipo de tampa:</span> {cacamba.type_lid_name}</Typography>
                                            <Typography className="cacamba-desc"><span>Cor:</span> {cacamba.color}</Typography>
                                            <Typography className="cacamba-desc"><span>Material:</span> {cacamba.material}</Typography>
                                        </Col>
                                        <Col md={9} xs={12}>
                                            <Typography className="cacamba-title">Dimensões</Typography>
                                            <Typography className="cacamba-desc"><span>Comprimento:</span> {cacamba.stationary_bucket_type.letter_a_name}</Typography>
                                            <Typography className="cacamba-desc"><span>Largura:</span> {cacamba.stationary_bucket_type.letter_b_name}</Typography>
                                            <Typography className="cacamba-desc"><span>Altura:</span> {cacamba.stationary_bucket_type.letter_c_name}</Typography>
                                        </Col>
                                        <Col md={6} xs={24}>                                            
                                            <Typography className="cacamba-title">Disponíveis</Typography>
                                            <Typography className="cacamba-desc">{cacamba.stock} cacambas</Typography>
                                            <Typography className="cacamba-link" style={{marginTop: 6}}>Ficha Técnica</Typography>
                                        </Col>
                                    </Row>

                                    <Typography className="cacamba-title">Escolher tipo de locação</Typography>
                                    <Row gutter={[8,8]}>
                                        <Col span={24}>
                                            <Select style={{width: '100%'}} defaultValue={typeLocal} onChange={setTypeLocal} placeholder="Selecione um tipo de locação">
                                                <Select.Option value={"I"}>Locação Interna | até {cacamba.days_internal} dias</Select.Option>
                                                <Select.Option value={'E'}>Locação Externa | até {cacamba.days_external} dias</Select.Option>
                                            </Select>
                                        </Col>
                                    </Row>

                                    <Typography className="cacamba-title">Escolher endereço de entrega</Typography>
                                    <Input readOnly value={`${address?.street}, ${address?.number} - ${address?.district} - ${address?.city.name} / ${address?.city.state.acronym}`} addonBefore={<Typography className="cacamba-address" onClick={onOpen}>{address === null ? 'Selecionar' : 'Mudar'} endereço</Typography>} />

                                    <Typography className="cacamba-title">Escolher classe de resíduo</Typography>
                                    <Input readOnly value={residueNameSelect.map((v:any) => v)} placeholder="Nenhuma classe selecionada" addonBefore={<Typography className="cacamba-address" onClick={onResidueOpen}>Escolher classes</Typography>} />
                                    <Modal width={'100%'} style={{top: 20}} title="Escolher classes de resíduos" open={residueOpen} onCancel={onResidueOpen} onOk={onResidueOpen} okText={'Fechar'} cancelButtonProps={{style: {display: 'none'}}} destroyOnClose={true}>
                                        <List
                                            size="small"
                                            itemLayout="horizontal"
                                            bordered
                                            dataSource={cacamba?.residues}
                                            renderItem={(item: any) => (
                                                <List.Item actions={[ 
                                                    <Switch
                                                        onChange={(v) => onResidue(item)}
                                                        defaultChecked={residueSelect.includes(item.id)}
                                                        disabled={ 
                                                            (item.name === 'Classe C' && residuBlockC) ||
                                                            (item.name === 'Classe D' && residuBlockD) ||
                                                            (item.name !== 'Classe C' && item.name !== 'Classe D' && residuBlockOthers)
                                                        }
                                                    />
                                                ]}>
                                                    <List.Item.Meta title={item.name} description={item.description} />
                                                </List.Item>
                                            )}
                                        />
                                    </Modal>
                                    

                                    { cacamba.stock > 0 ? (
                                        <Row gutter={[16,16]} className="cacamba-footer" align={'middle'}>
                                            <Col md={12} xs={8}>
                                                <Row gutter={[22,22]} align={'middle'} justify={'end'}>
                                                    <Col style={{height: 14}}><FaMinus className={`cacamba-plus ${qtde === compare ? 'disabled' : ''}`} onClick={() => setQtde(qtde === compare ? qtde : qtde-1)} /></Col>
                                                    <Col><Typography className="cacamba-qtde">{qtde}</Typography></Col>
                                                    <Col style={{height: 14}}><FaPlus className={`cacamba-plus ${qtde < Number(cacamba.stock) ? '' : 'disabled'}`} onClick={() => setQtde(qtde < Number(cacamba.stock) ? qtde+1 : qtde)} /></Col>
                                                </Row>
                                            </Col>
                                            <Col md={12} xs={16}>
                                                <div className={`carrinho-button ${ (address === null || typeLocal === '' || residueSelect.length === 0) && qtde !== 0 ? 'disabled' : '' }`} onClick={onAdd}>
                                                    <Typography className="carrinho-button-text">{ load ? <ThreeCircles visible={true} height="20" width="20" color={"#fff"} ariaLabel="grid-loading" wrapperClass="grid-wrapper" /> : edit ? (qtde > 0 ? 'Atualizar' : 'Remover') : 'Adicionar' }</Typography>
                                                    { qtde !== 0 ? <Typography className="carrinho-button-text">R$ {total.toFixed(2)}</Typography> : null }
                                                </div>
                                            </Col>
                                        </Row>
                                    ) : null }
                                    
                                </Col>
                            </Row>
                        </CardItem>
                    </Col>
                    <DrawerEndereco open={open} close={() => setOpen(false)} address={address} setAddress={setAddress} provider={cacamba?.provider_id} />
                </Row>
            ) }
        </PageDefault>
    )

}

export default CarrinhoView;