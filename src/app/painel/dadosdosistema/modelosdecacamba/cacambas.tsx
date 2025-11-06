// react libraries
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Col, Row, Tag } from "antd";

// services
import { PageDefaultProps } from "../../../../services";

// components
import Table from "../../../../components/Table";
import CardItem from "../../../../components/CardItem";
import PageDefault from "../../../../components/PageDefault";
import { TableNewButton, TableReturnButton, TableTrCacambaButton, TableTrEditButton, TableTrRecoverButton, TableTrTrashButton, TableTrashButton } from "../../../../components/Table/buttons";

const StationaryBucketModelItensList = ({ type, path, permission }: PageDefaultProps) => {
  
  // state
  const [action, setAction] = useState(false);

  // params
	const { ID } = useParams();

  // table columns
  const column = [
	{ title: 'Código', dataIndex: 'code', table: 'code', width: '300px', sorter: true, align: 'center', render: null },
    { title: 'Locador', dataIndex: 'stationary_bucket_group.provider_name', table: 'stationary_bucket_groups.id', width: 'auto', minWidth: '200px', sorter: false, align: 'left', render: null },
	{ title: 'Situação', dataIndex: 'status_name', table: 'status', width: '200px', sorter: true, align: 'center', render: (item:any) => (
		<Row justify={'center'} style={{width: '100%'}}>
			<Tag color={item.status.color}>{item.status.name}</Tag>
		</Row>
	) },
  ];

  return (
    <PageDefault valid={`${permission}.${type}`} items={[
      { title:  <Link to={type === "list" ? "#" : ".."}>Modelos de Caçamba</Link> },
      { title: "Caçambas" },
    ]} options={
      <Row justify={"end"} gutter={[8, 8]}>
        <TableReturnButton type={type} permission={permission} />
      </Row>
    }>
      <Row gutter={[16, 16]}>
        <Col md={24} xs={24}>
          <CardItem>
            <Table defaultFilter={{type: ID}} column={column} path={'stationary_bucket'} type={type} action={action} />
          </CardItem>
        </Col>
      </Row>
    </PageDefault>
  );
};

export default StationaryBucketModelItensList;
