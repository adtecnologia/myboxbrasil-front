// BIBLIOTECAS REACT
import { useState } from "react";
import { Link } from "react-router-dom";
import { Col, Row, Typography } from "antd";

// SERVIÇOS
import { PageDefaultProps } from "../../../../../services";

// COMPONENTES
import PageDefault from "../../../../../components/PageDefault";
import CardItem from "../../../../../components/CardItem";
import Table from "../../../../../components/Table";
import { TableNewButton, TableReturnButton, TableTrEditButton, TableTrRecoverButton, TableTrTrashButton, TableTrashButton } from "../../../../../components/Table/buttons";

const DestinoFinalList = ({ type, path, permission } : PageDefaultProps ) => {

    // ESTADOS DO COMPONENTE
    const [ action, setAction ] = useState(false);

    // DEFINE COLUNAS DA TABELA
    const column = [
        { title: 'Nome', dataIndex: 'NAME', table: 'address.NAME', width: '200px', sorter: true, align: 'left', render: null },
        { title: 'Endereço', dataIndex: 'STREET', table: 'address.STREET', width: 'auto', minWidth: '200px', sorter: true, align: 'left', render: (item:any) => <Typography>{item?.STREET}, {item?.NUMB} - {item?.DISTRICT}</Typography> },
        { title: 'Cidade', dataIndex: 'CITY_NAME', table: 'city.NAME', width: '200px', sorter: true, align: 'center', render: null },
        { title: 'Estado', dataIndex: 'STATE_ACRONYM', table: 'state.ACRONYM', width: '120px', sorter: true, align: 'center', render: null },
        { title: 'Ações', dataIndex: null, width: '100px', sorter: false, align: 'center', render: (item: any) => (
            <Row justify={'center'} style={{width: '100%'}}>
                <TableTrEditButton type={type} permission={permission} item={item} />
                <TableTrTrashButton type={type} permission={permission} item={item} action={() => setAction(!action)} path={path} />
                <TableTrRecoverButton type={type} permission={permission} item={item} action={() => setAction(!action)} path={path} />
            </Row>
        ) },
    ]

    return (
        <PageDefault valid={`${permission}.${type}`} items={[
            { title: <Link to={ type === 'list' ? '#' : '..' }>Destino Final</Link> },
            { title: type === 'list' ? 'Lista' : 'Lixeira' },
        ]} options={
            <Row justify={'end'} gutter={[8,8]}>
                <TableNewButton type={type} permission={permission} />
                <TableTrashButton type={type} permission={permission} />
                <TableReturnButton type={type} permission={permission} />
            </Row>
        }>
            <Row gutter={[16,16]}>
                <Col md={24} xs={24}>
                    <CardItem>
                        <Table
                            column={column}
                            path={path}
                            type={type}
                            action={action}
                            defaultFilter={{ PRINCIPAL: 'N' }}
                        />
                    </CardItem>
                </Col>
            </Row>
        </PageDefault>
    )

}

export default DestinoFinalList;