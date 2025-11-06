// BIBLIOTECAS REACT
import { useState } from "react";
import { Col, Modal, Row, Typography } from "antd";

// SERVIÇOS
import { GET_API, PageDefaultProps } from "../../../../services";

// COMPONENTES
import PageDefault from "../../../../components/PageDefault";
import CardItem from "../../../../components/CardItem";
import Table from "../../../../components/Table";
import { IoDocumentAttachOutline } from "react-icons/io5";

const CdfPage = ({ type } : PageDefaultProps ) => {

    // ESTADOS DO COMPONENTE
    const [ action ] = useState(false);

    const [ modal, setModal ] = useState(false);
    const [ file, setFile ] = useState<any>('');

    const openPDF = (url:string, mtr:boolean = false) => {
        if (mtr) {
            setFile(url)
            setModal(true)
        } else {
            GET_API(`/cdf/${url}`).then((rs) => rs.json()).then(res => {
                setFile(res.data.link)
                setModal(true)
            })        
        }
    }

    // DEFINE COLUNAS DA TABELA
    const column = [
        { title: 'Identificação', dataIndex: 'DATETIME_UPDATE_FORMAT', table: 'mtrs.cdf_id', width: '180px', sorter: true, align: 'center', render: (item:any) => (
            <Row style={{width: '100%'}}>
                <Col span={24}>
                    <Typography style={{textAlign: 'center', cursor: 'pointer'}} onClick={() => openPDF(item.cdf_id)}><IoDocumentAttachOutline size={30}/> <br /><span style={{color: 'var(--color02)'}}>#{item.cdf_id}</span></Typography>
                </Col>
            </Row>
        ) },
        { title: 'MTR', dataIndex: 'DATETIME_UPDATE_FORMAT', table: 'mtrs.id', width: '180px', sorter: true, align: 'center', render: (item:any) => (
            <Row style={{width: '100%'}}>
                <Col span={24}>
                    <Typography style={{textAlign: 'center', cursor: 'pointer'}} onClick={() => openPDF(item.link, true)}><IoDocumentAttachOutline size={30}/> <br /><span style={{color: 'var(--color02)'}}>#{item.id}</span></Typography>
                </Col>
            </Row>
        ) },
        { title: 'Data emissão', dataIndex: 'DATETIME_UPDATE_FORMAT', table: 'mtrs.created_at', width: '180px', sorter: true, align: 'center', render: (item:any) => (
            <Row style={{width: '100%'}}>
                <Col span={24}>
                    <Typography style={{textAlign: 'center'}}>{item.start_date_format}</Typography>
                </Col>
            </Row>
        ) },
        { title: 'Ordem de locação', dataIndex: 'DATETIME_UPDATE_FORMAT', table: 'mtrs.created_at', width: '180px', sorter: false, align: 'center', render: (item:any) => (
            <Row style={{width: '100%'}}>
                <Col span={24}>
                    <Typography style={{textAlign: 'center'}}>#{item.order_location_product_id}</Typography>
                </Col>
            </Row>
        ) },
        { title: 'Gerador', dataIndex: 'CLIENT_NAME', table: 'client.NAME', width: 'auto', minWidth: '300px', sorter: false, align: 'left', render: (item:any) => (
            <Row style={{width: '100%'}}>
                <Col span={24}>
                    <Typography>{item.client.name}</Typography>
                </Col>
            </Row>
        ) }
    ]

    return (
        <PageDefault valid={`cdf.list`} items={[
            { title: 'CDF' }
        ]}>
            <Row gutter={[16,16]}>
                <Col md={24} xs={24}>
                    <CardItem>
                        <Table
                            column={column}
                            path={'mtr'}
                            type={type}
                            action={action}
                            defaultFilter={{ cdfFinalied: true }}
                        />
                    </CardItem>
                </Col>
                <Modal className="modalpdf" width={'100%'} style={{top: 20}} open={modal} onCancel={() => setModal(false)} destroyOnClose footer={false}>
                    <Row>
                        <Col span={24}>
                            <object>
                                <embed id="pdfID" type="text/html" width="100%" height="600" src={`${file}`} />
                            </object>
                        </Col>
                    </Row>
                </Modal>
            </Row>
        </PageDefault>
    )

}

export default CdfPage;