// react libraries
import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, Button, Checkbox, Col, Row, Tooltip, Typography } from "antd";

// components
import PageDefault from "../../../components/PageDefault";
import CardItem from "../../../components/CardItem";
import Table from "../../../components/Table";
import { TbCheck } from "react-icons/tb";
import { POST_API } from "../../../services";

const Notifications = () => {
  
  // state
  const [action, setAction] = useState(false);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<number[]>([]);

  // read
  const onRead = (id:any) => {
    POST_API(`/notification`, { status: 'read' }, id).then(() => {
      setAction(!action)
    })
  }

  const onReadAll = () => {
    setLoading(true)
    list.map((item) => {
      POST_API(`/notification`, { status: 'read' }, item).then(() => {
        setAction(!action)
      })
    })
    setTimeout(() => {
      setLoading(false)
      setList([])
      setAction(!action)
    }, list.length*150);
  }

  const selectAll = (e:any) => {
    var lista = window.document.getElementsByClassName('ant-checkbox-input')
    if (e.target.checked) {
      var temp = []
      for (let item of lista) {
        if (Number(item.id) > 0) {
          temp.push(Number(item.id))
        }
      }
      setList(temp)
    } else {
      setList([])
    }
  }

  // table columns
  const column = [
    { title: <Row style={{width: '100%'}} justify={'center'}><Col><Checkbox onClick={selectAll} /></Col></Row>, dataIndex: "", table: "", width: "50px", sorter: false, align: "center", render: (item:any) => (
      <Row style={{width: '100%'}} justify={'center'}>
        <Col><Checkbox className="checkboxone" id={item.id} checked={list.includes(item.id)} onChange={(e) => {
          if (e.target.checked) setList([...list, item.id])
          else setList(list.filter((i:any) => i !== item.id))
        }} /></Col>
      </Row>
    ) },
    { title: "Notificação", dataIndex: "-created_at", table: "-created_at", width: "auto", minWidth: '200px', sorter: false, align: "left", render: (item:any) => (
      <Link to={item.url}><Typography className="dsh-item-link">{item.message}</Typography></Link>
    ) },
    { title: "De", dataIndex: "user_from.name", table: "user_from.name", width: "100px", sorter: false, align: "center", render: (item:any) => (
      <Row style={{width: '100%'}} justify={'center'}>
        <Col><Tooltip title={item.user_from.name}><Avatar src={item.user_from.photo} /></Tooltip></Col>
      </Row>
    ) },
    { title: "Data e hora", dataIndex: "created_at", table: "created_at", width: "140px", sorter: false, align: "center", render: null },
    { title: "Ações", dataIndex: null, width: "60px", sorter: false, align: "center", render: (item: any) => (
      <Row justify={"center"} style={{ width: "100%" }}>
        <Col><Tooltip title="Marcar commo lida"><TbCheck onClick={() => onRead(item.id)} size={18} className="actions-button" /></Tooltip></Col>
      </Row>
    )},
  ];

  return (
    <PageDefault valid={true} items={[
        { title: <Link to={'#'}>Notificações</Link> }
    ]} options={
      <Row justify={"end"} gutter={[8, 8]}>
        <Col>
          <Button
            size="small"
            
            type="default"
            className="page-default-button"
            disabled={!list.length}
            onClick={onReadAll}
            loading={loading}
          >
            marcar como lido
          </Button>
      </Col>
      </Row>
    }>
      <Row gutter={[16, 16]}>
        <Col md={24} xs={24}>
          <CardItem>
            <Table
              column={column}
              path={'notification'}
              type={'list'}
              action={action}
              defaultFilter={{status: 'unread'}}
            />
          </CardItem>
        </Col>
      </Row>
    </PageDefault>
  );
};

export default Notifications;
