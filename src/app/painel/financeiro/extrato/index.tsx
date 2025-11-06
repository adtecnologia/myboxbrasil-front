// react libraries
import { useEffect, useState } from "react"
import { Button, Col, Collapse, Divider, Form, message, Modal, Popover, Row, Tag, Tooltip, Typography, Upload } from "antd"

// components
import PageDefault from "../../../../components/PageDefault"
import Filter from "../../../../components/Filter"
import LoadItem from "../../../../components/LoadItem";

// services
import { GET_API, getProfileID, getProfileType, getToken, getUPLOADAPI, POST_API } from "../../../../services";
import CardItem from "../../../../components/CardItem";
import Table from "../../../../components/Table";
import CardKPISmall from "../../../../components/CardKPISmall";
import { TbUserDollar } from "react-icons/tb";
import { IoDocument } from "react-icons/io5";
import { BsClock, BsClockFill } from "react-icons/bs";
import { HiDownload, HiReceiptTax } from "react-icons/hi";
import { Oval } from "react-loader-spinner";

const Financeiro = ( ) => {

    // state
    const [ saldoTotal, setSaldoTotal ] = useState<number|string>(-1)
    const [ saldoDisponivel, setSaldoDisponivel ] = useState<number|string>(-1)
    const [ saldoBloqueado, setSaldoBloqueado ] = useState<number|string>(-1)
    const [ totalLiquido, setTotalLiquido ] = useState<number|string>(-1)
    
    const [ action, setAction ] = useState<boolean>(false)
    const [ modal, setModal ] = useState<boolean>(false)
    const [ antLoad, setAntLoad ] = useState<boolean>(false)
    const [ antSendLoad, setAntSendLoad ] = useState<boolean>(false)
    const [ ant, setAnt ] = useState<any>(null)

    const [ balance, setBalance ] = useState<number>(0)
    
    const [ note, setNote ] = useState<any[]>([])
    const [ noteModal, setNoteModal ] = useState<boolean>(false)
    const [ noteLoading, setNoteLoading ] = useState<boolean>(false)

    const column:any = [
        { title: "Data e hora", dataIndex: "balance_operations.created_at", table: "balance_operations.created_at", width: "200px", sorter: false, align: "center", render: (item:any) => (
            <Row style={{width: '100%'}} justify={'center'}>
                <Col><Typography>{item.created_at}</Typography></Col>
            </Row>
        ) },
        { title: "Descrição", dataIndex: "balance_operations.breakdown", table: "balance_operations.breakdown", width: "auto", minWidth: '200px', sorter: false, align: "left", render: (item:any) => (
            <Row style={{width: '100%'}} justify={'start'}>
                <Col><Typography>{item.breakdown.description}</Typography></Col>
            </Row>
        ) },
        { title: "Tipo transação", dataIndex: "balance_operations.operation_type", table: "balance_operations.operation_type", width: "140px", sorter: false, align: "center", render: (item:any) => (
            <Row style={{width: '100%'}} justify={'center'}>
                <Col><Typography>{item.operation_type === 'DEBIT' ? 'Débito' : 'Crédito'}</Typography></Col>
            </Row>
        ) },
        { title: "Valor", dataIndex: "balance_operations.amount", table: "balance_operations.amount", width: "140px", sorter: false, align: "center", render: (item:any) => (
            <Row style={{width: '100%'}} justify={'end'}>
                <Col><Typography style={{display: 'flex', alignItems: 'center'}}>R$ {Number(item.amount).toLocaleString('pt-br', { maximumFractionDigits: 2 })}</Typography></Col>
            </Row>
        ) },
        { title: "Novo saldo", dataIndex: "balance_operations.balance", table: "balance_operations.balance", width: "140px", sorter: false, align: "center", render: (item:any) => (
            <Row style={{width: '100%'}} justify={'end'}>
                <Col><Typography style={{display: 'flex', alignItems: 'center'}}>R$ {Number(item.balance).toLocaleString('pt-br', { maximumFractionDigits: 2 })}</Typography></Col>
            </Row>
        ) },
    ]

    return (
        <PageDefault valid={true} items={[
            { title: 'Extrato' },
        ]} options={
            <Row gutter={[8,8]}>
                {/* <Col><Button  size="small">Baixar relatório</Button></Col> */}
            </Row>
        }>
            <Row gutter={[16,16]}>
                <Col span={24}>
                    <CardItem>
                        <Table
                            column={column}
                            path={'balance_operation'}
                            type={'list'}
                            action={action}
                            sorterActive={{order: 'DESC', selectColumn: 'balance_operations.created_at'}}
                            useFilter={[
                                {
                                    type: "select",
                                    name: "operationType",
                                    label: "Tipo de transação",
                                    items: [
                                        { value: 'DEBIT', label: 'Débito' },
                                        { value: 'CREDIT', label: 'Crédito' },
                                    ]
                                },
                                {
                                    type: "date",
                                    name: "dateStart",
                                    label: "Data (início)"
                                },
                                {
                                    type: "date",
                                    name: "dateEnd",
                                    label: "Data (final)"
                                },
                            ]}
                        />
                    </CardItem>
                </Col>
            </Row>
        </PageDefault>
    )

}

export default Financeiro