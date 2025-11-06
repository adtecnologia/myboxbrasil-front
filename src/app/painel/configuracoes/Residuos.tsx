// react libraries
import { useEffect, useState } from "react";
import { Button, Col, List, message, Modal, Row, Typography } from "antd";

// services
import { DELETE_API, GET_API, POST_API, POST_CATCH, verifyConfig } from "../../../services";

// icons
import { TbCheck, TbTrash } from "react-icons/tb";
import { ExclamationCircleOutlined } from '@ant-design/icons';

// components
import CardItem from "../../../components/CardItem";
import Table from "../../../components/Table";
import LoadItem from "../../../components/LoadItem";

const Residue = () => {

    // state
    const [ residue, setResidue ]   = useState<any[]>([]);
    const [ loadSend, setLoadSend ] = useState<boolean>(true);
    const [ modal, setModal ]       = useState<boolean>(false);

    // table columns
    const column = [
        { title: 'Grupo de Resíduo', dataIndex: 'name', table: 'residues.name', width: 'auto', sorter: true, align: 'center', render: (item:any) => <Row style={{width: '100%'}}><Col span={24}>{item.name+' - '+item.description}</Col></Row> },
        { title: 'Ações', dataIndex: null, width: '60px', sorter: false, align: 'center', render: (item: any) => (
            <Row justify={'center'} style={{width: '100%'}}>
                <Col><TbCheck size={18} className="actions-button" onClick={() => onSend(item)}/></Col>
            </Row>
        ) },
    ]

    // load
    const load = () => {
        setLoadSend(true)
        GET_API('/me').then(rs => rs.json()).then(res => {
            GET_API('/residue_user/'+res.data.id).then(rs => rs.json()).then(res => {
                setResidue(res.data)
            }).catch(POST_CATCH).finally(() => setLoadSend(false))
        }).catch(POST_CATCH)
    }

    const onModal = () => setModal(!modal)

    const onSend = ( item:any ) => {
        if (residue.filter(r => r.id === item.id).length > 0) {
            message.warning('Esse resíduo já foi selecionado.')
            return;
        }
        
        Modal.confirm({
            title: 'Adicionar resíduo "'+item.name+' - '+item.description+'"?', icon: <ExclamationCircleOutlined />, cancelText: 'Não', okText: 'Sim',
            onOk() {
                POST_API('/residue_user', { residue_id: item.id }).then((rs) => {
                    if (rs.ok) {
                        load()
                        onModal()
                    } else Modal.warning({ title: "Algo deu errado", content: rs.statusText });
                }).catch(POST_CATCH);
            },
            onCancel() {},
        })
    }

    const onAction = (item:any) => {
        Modal.confirm({
            title: 'Deletar resíduo "'+item.name+' - '+item.description+'"?', icon: <ExclamationCircleOutlined />, cancelText: 'Não', okText: 'Sim',
            onOk() {
                DELETE_API(`/residue_user/${item.id}`).then((rs) => {
                    if (rs.ok) {
                        setTimeout(() => load(), 500)
                    } else Modal.warning({ title: "Algo deu errado", content: "Não foi possível deletar registro." });
                }).catch(POST_CATCH);
            },
            onCancel() {},
        })
    }

    useEffect(() => {
        load()
    }, [])

    return (
        <CardItem title="Resíduos">
            { loadSend ? <LoadItem type="alt" /> : residue.length > 0 ? (
                <List size="small"
                    itemLayout="horizontal"
                    dataSource={residue}
                    renderItem={item => (
                        <List.Item actions={ verifyConfig(['conf.rsd.edit']) ? [<TbTrash onClick={() => onAction(item)} size={18} className="actions-button"/>] : []}>
                            <List.Item.Meta
                                title={item.name}
                                description={item.description}
                            />
                        </List.Item>
                    )}
                />
            ) : <Typography>Nenhum resíduo cadastrado</Typography> }
            { verifyConfig(['conf.rsd.edit']) ? (
                <Button onClick={onModal} type="primary" style={{marginTop: '1em'}}>Adicionar Resíduo</Button>
            ) : null }
            <Modal width={'100%'} style={{top: 20}} title="Adicionar Resíduo" open={modal} onCancel={onModal} cancelText="Fechar" okText="Salvar" maskClosable={false} onOk={onSend}>
                <Table
                    column={column}
                    path={'residue'}
                    type={'list'}
                    action={null}
                />
            </Modal>
        </CardItem>
    )

}

export default Residue