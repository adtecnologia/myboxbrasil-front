// BIBLIOTECAS REACT
import { useEffect, useState } from "react";
import { Col, Modal, Row, Tag, Typography } from "antd";
import { Document, Page } from 'react-pdf';
import { BlobProvider, PDFViewer } from '@react-pdf/renderer';

// SERVIÇOS
import { GET_API, POST_API, POST_CATCH, PageDefaultProps, getToken } from "../../../../services";

// COMPONENTES
import PageDefault from "../../../../components/PageDefault";
import CardItem from "../../../../components/CardItem";
import Table from "../../../../components/Table";
import LoadItem from "../../../../components/LoadItem";
import { IoDocumentAttachOutline, IoLinkOutline, IoLinkSharp } from "react-icons/io5";

const EmAnaliseList = ({ type, path } : PageDefaultProps ) => {

    // ESTADOS DO COMPONENTE
    const [ action ] = useState(false);
    const [ modal, setModal ] = useState(false);
    const [ loading, setLoading ] = useState(true);
    const [ file, setFile ] = useState<any>('');

    const openPDF = (id:number) => {
        setLoading(true)
        GET_API(`/mtr/${id}/pdf`).then(rs => {
            if (!rs.ok) {
                Modal.warning({ title: "Algo deu errado", content: rs.statusText });
            }
            return rs.blob()
        }).then((res) => {
            let base64String:any = ''
            let reader = new FileReader();
            reader.readAsDataURL(res);
            reader.onloadend = () => {
                base64String = reader.result;
                setFile(base64String.substr(base64String.indexOf(',') + 1));
                setModal(true)
            };
        }).catch(POST_CATCH).finally(() => setLoading(false))
    }

    // DEFINE COLUNAS DA TABELA
    const column = [
        { title: 'Data Chegada', dataIndex: 'DATETIME_UPDATE_FORMAT', table: 'order_location_products.date_analysis', width: '180px', sorter: true, align: 'center', render: (item:any) => (
            <Row style={{width: '100%'}}>
                <Col span={24}>
                    <Typography style={{textAlign: 'center'}}>{item.date_analysis_format}</Typography>
                    <Typography><center><Tag color={item.product.status.color} style={{margin: 0}}>{item.product.status.name}</Tag></center></Typography>
                </Col>
            </Row>
        ) },
        { title: 'MTR', dataIndex: 'DATETIME_UPDATE_FORMAT', table: 'order_location_products.date_analysis', width: '180px', sorter: false, align: 'center', render: (item:any) => (
            <Row style={{width: '100%'}}>
                <Col span={24}>
                    <Typography style={{textAlign: 'center', cursor: 'pointer'}} onClick={() => openPDF(item.mtr.id)}><IoDocumentAttachOutline size={30}/> <br /><span style={{color: 'var(--color02)'}}>#{item.mtr.id}</span></Typography>
                </Col>
            </Row>
        ) },
        { title: 'Gerador', dataIndex: 'CLIENT_NAME', table: 'client.NAME', width: 'auto', minWidth: '250px', sorter: false, align: 'left', render: (item:any) => (
            <Row style={{width: '100%'}}>
                <Col span={24}>
                    <Typography>{item.order_locations.client.name}</Typography>
                    <Typography style={{color: 'var(--color02)'}}>{item.order_locations.client.document_number}</Typography>
                </Col>
            </Row>
        ) },
        { title: 'Transportador', dataIndex: 'CLIENT_NAME', table: 'client.NAME', width: '350px', sorter: false, align: 'left', render: (item:any) => (
            <Row style={{width: '100%'}}>
                <Col span={24}>
                    <Typography>{item.order_locations.provider.name}</Typography>
                    <Typography style={{color: 'var(--color02)'}}>{item.order_locations.provider.document_number}</Typography>
                </Col>
            </Row>
        ) },
        { title: 'Código Caçamba', dataIndex: 'CODE', table: 'stationary_bucket.CODE', width: '180px', sorter: true, align: 'center', render: (item:any) => (
            <Row style={{width: '100%'}}>
                <Col span={24}>
                    <Typography style={{textAlign: 'center'}}>{item.product.code}</Typography>
                    <Typography style={{color: 'var(--color02)', textAlign: 'center'}}>Modelo {item.product.stationary_bucket_group.stationary_bucket_type.name}</Typography>
                </Col>
            </Row>
        ) }
    ]

    return (
        <PageDefault valid={`anl.list`} items={[
            { title: 'Em Análise' }
        ]}>
            <Row gutter={[16,16]}>
                <Col md={24} xs={24}>
                    <CardItem>
                        <Table
                            column={column}
                            path={'order_location_product'}
                            type={type}
                            action={action}
                            defaultFilter={{ status: 'EA' }}
                        />
                    </CardItem>
                </Col>
            </Row>
            <Modal width={'100%'} style={{top: 20}} open={modal} onCancel={() => setModal(false)} destroyOnClose footer={false}>
                <Row>
                    <Col span={24}>
                        <object>
                            <embed id="pdfID" type="text/html" width="100%" height="600" src={`data:application/pdf;base64,${file}`} />
                        </object>
                    </Col>
                </Row>
            </Modal>
        </PageDefault>
    )

}

export default EmAnaliseList;