// react libraries
import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, Col, Modal, Popover, Row, Tag } from "antd";

// components
import Table from "../../../../components/Table";
import CardItem from "../../../../components/CardItem";
import PageDefault from "../../../../components/PageDefault";
import { TableNewButton, TableReturnButton, TableTrEditButton, TableTrPassword, TableTrPhotoButton, TableTrRecoverButton, TableTrTrashButton, TableTrashButton } from "../../../../components/Table/buttons";

// services
import { getProfileType, PageDefaultProps, POST_API, POST_CATCH } from "../../../../services";
import { TbUser } from "react-icons/tb";

const TenantList = ({ type, path, permission }: PageDefaultProps) => {

  // states
  const [action, setAction] = useState<boolean>(false);

  const onChange = (item: any, field: string) => {
    Modal.confirm({
      title: 'Atenção',
      content: `Deseja alterar o valor para ${item[field] === 1 ? 'NÃO' : 'SIM'}?`,
      okText: 'Sim',
      cancelText: 'Não',
      onOk: () => {
        POST_API(`/${path}`, { [field]: item[field] === 1 ? 0 : 1 }, item.id)
          .then((rs) => {
            if (rs.ok) setAction(!action);
            else
              Modal.warning({
                title: 'Algo deu errado',
                content: rs.statusText,
              });
          })
          .catch(POST_CATCH);
      },
    });
  };

  // table columns
  const column = [
    { title: "Logo", dataIndex: "photo", table: "photo", width: "60px", sorter: false, align: "center", render: (item: any) => (
      <Row justify={"center"} style={{ width: "100%" }}>
        <Avatar src={item.photo ? item.photo : null} />
      </Row>
    )},
    { title: "Nome", dataIndex: "name", table: "name", width: "auto", minWidth: "200px", sorter: true, align: "left", render: null },
    { title: "CPF/CNPJ", dataIndex: "document_number", table: "document_number", width: "200px", sorter: true, align: "center", render: null },
    { title: "Cidade", dataIndex: "address.city.name", table: "cities.name", width: "150px", sorter: true, align: "center", render: null },
    { title: "Estado", dataIndex: "address.city.state.name", table: "states.name", width: "100px", sorter: true, align: "center", render: null },
    {
      title: 'Boleto consolidado',
      dataIndex: 'banking_consolidated',
      table: 'banking_consolidated',
      width: '200px',
      sorter: true,
      align: 'center',
      render: (item: any) => (
        <Row justify={'center'} style={{ width: '100%' }}>
          <Tag
            // color={item.banking_consolidated_color}
            color='green'
            onClick={() => onChange(item, 'banking_consolidated')}
            style={{
              margin: 0,
              width: '100%',
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            Sim
            {/* {item.banking_consolidated_name} */}
          </Tag>
        </Row>
      ),
    },
    { title: "Ações", dataIndex: null, width: "120px", hide: getProfileType() === 'CITY', sorter: false, align: "center", render: (item: any) => (
      <Row justify={"center"} style={{ width: "100%" }}>
        <Col>
          <Link to={`${item.id}/clientes-especiais`}>
            <Popover content="Clientes especiais" trigger="hover">
              <TbUser className="actions-button" size={18} />
            </Popover>
          </Link>
        </Col>
        <TableTrPhotoButton type={type} permission={permission} item={item} action={() => setAction(!action)} />
        <TableTrEditButton type={type} permission={permission} item={item} />
        <TableTrTrashButton type={type} permission={permission} item={item} action={() => setAction(!action)} path="user" />
        <TableTrRecoverButton type={type} permission={permission} item={item} action={() => setAction(!action)} path="user" />
        {/* <TableTrPassword type={type} permission={permission} item={item} action={() => setAction(!action)} path="user" /> */}
      </Row>
    )},
  ];

  return (
    <PageDefault valid={`${permission}.${type}`} items={[
        { title: <Link to={type === "list" ? "#" : ".."}>Locatários</Link> },
        { title: type === "list" ? "Lista" : "Lixeira" },
    ]} options={
      <Row justify={"end"} gutter={[8, 8]}>
        <TableNewButton type={type} permission={permission} />
        <TableTrashButton type={type} permission={permission} />
        <TableReturnButton type={type} permission={permission} />
      </Row>
    }>
      <Row gutter={[16, 16]}>
        <Col md={24} xs={24}>
          <CardItem>
            <Table
              column={column}
              path={path}
              type={type}
              action={action}
              useFilter={ getProfileType() === 'ADMIN' || getProfileType() === "ADMIN_EMPLOYEE" ? [
                {
                  type: "search",
                  name: "state",
                  label: "Estado",
                  url: "/state",
                  labelField: ["acronym", "name"],
                },
                {
                  type: "search",
                  name: "city",
                  label: "Cidade",
                  url: "/city",
                  labelField: "name",
                },
              ] : []}
            />
          </CardItem>
        </Col>
      </Row>
    </PageDefault>
  );
};

export default TenantList;
