// react libraries
import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, Col, Row } from "antd";

// components
import Table from "../../../../components/Table";
import CardItem from "../../../../components/CardItem";
import PageDefault from "../../../../components/PageDefault";
import { TableNewButton, TableReturnButton, TableTrEditButton, TableTrPassword, TableTrPhotoButton, TableTrRecoverButton, TableTrTrashButton, TableTrashButton } from "../../../../components/Table/buttons";

// services
import { getProfileType, PageDefaultProps } from "../../../../services";

const TenantList = ({ type, path, permission }: PageDefaultProps) => {

  // states
  const [action, setAction] = useState<boolean>(false);

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
    { title: "Ações", dataIndex: null, width: "120px", hide: getProfileType() === 'CITY', sorter: false, align: "center", render: (item: any) => (
      <Row justify={"center"} style={{ width: "100%" }}>
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
