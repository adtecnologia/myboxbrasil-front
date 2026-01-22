// react libraries

import {
  Avatar,
  Button,
  Col,
  Form,
  Input,
  Modal,
  Popover,
  Row,
  Segmented,
  Tag,
} from "antd";
import { useEffect, useState } from "react";
import { TbShoppingCart } from "react-icons/tb";
import { Link } from "react-router-dom";
import CardItem from "../../../../components/CardItem";
import { InputMaskCorrect } from "../../../../components/InputMask";
import PageDefault from "../../../../components/PageDefault";
// components
import Table from "../../../../components/Table";
import {
  TableNewButton,
  TableReturnButton,
  TableTrashButton,
  TableTrEditButton,
  TableTrPhotoButton,
  TableTrRecoverButton,
  TableTrTrashButton,
} from "../../../../components/Table/buttons";
// services
import {
  getProfileType,
  type PageDefaultProps,
  POST_API,
  POST_CATCH,
  verifyConfig,
} from "../../../../services";

const TenantList = ({ type, path, permission }: PageDefaultProps) => {
  // states
  const [action, setAction] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [doc, setDoc] = useState<string>("cpf");

  // form
  const [form] = Form.useForm();

  useEffect(() => {
    if (!modalOpen) {
      form.resetFields();
      setDoc("cpf");
    }
  }, [modalOpen]);

  const _store = verifyConfig(["lct.add"]);
  const _update = verifyConfig(["lct.edit"]);
  const _minimum = verifyConfig(["cst.prc.mnm"]);
  const _delete = verifyConfig(["lct.del"]);
  const _trash = verifyConfig(["lct.trash"]);

  // submit do modal
  const onSubmit = async (values: any) => {
    await POST_API("/customer-minimum-prices", values)
      .then((rs) => {
        if (rs.ok) {
          setAction(!action);
          setModalOpen(false);
        } else {
          rs.json().then((res) => {
            Modal.warning({
              title: "Algo deu errado",
              content: res.message,
            });
          });
        }
      })
      .catch(POST_CATCH);
  };

  const onChange = (item: any, field: string) => {
    Modal.confirm({
      title: "Atenção",
      content: `Deseja alterar o valor para ${item[field] === 1 ? "NÃO" : "SIM"}?`,
      okText: "Sim",
      cancelText: "Não",
      onOk: () => {
        POST_API(`/${path}`, { [field]: item[field] === 1 ? 0 : 1 }, item.id)
          .then((rs) => {
            if (rs.ok) {
              setAction(!action);
            } else {
              Modal.warning({
                title: "Algo deu errado",
                content: rs.statusText,
              });
            }
          })
          .catch(POST_CATCH);
      },
    });
  };

  // table columns
  const column = [
    {
      title: "Logo",
      dataIndex: "photo",
      table: "photo",
      width: "60px",
      sorter: false,
      align: "center",
      render: (item: any) => (
        <Row justify={"center"} style={{ width: "100%" }}>
          <Avatar src={item.photo ? item.photo : null} />
        </Row>
      ),
    },
    {
      title: "Nome",
      dataIndex: "name",
      table: "name",
      width: "auto",
      minWidth: "200px",
      sorter: true,
      align: "left",
      render: null,
    },
    {
      title: "CPF/CNPJ",
      dataIndex: "document_number",
      table: "document_number",
      width: "200px",
      sorter: true,
      align: "center",
      render: null,
    },
    {
      title: "Cidade",
      dataIndex: "address.city.name",
      table: "cities.name",
      width: "150px",
      sorter: true,
      align: "center",
      render: null,
    },
    {
      title: "Estado",
      dataIndex: "address.city.state.name",
      table: "states.name",
      width: "100px",
      sorter: true,
      align: "center",
      render: null,
    },
    {
      title: "Boleto consolidado",
      dataIndex: "banking_consolidated",
      table: "banking_consolidated",
      width: "200px",
      sorter: true,
      align: "center",
      hide:
        getProfileType() === "SELLER" || getProfileType() === "LEGAL_SELLER",
      render: (item: any) => (
        <Row justify={"center"} style={{ width: "100%" }}>
          <Tag
            // color={item.banking_consolidated_color}
            color="green"
            onClick={() => onChange(item, "banking_consolidated")}
            style={{
              margin: 0,
              width: "100%",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            Sim
            {/* {item.banking_consolidated_name} */}
          </Tag>
        </Row>
      ),
    },
    {
      title: "Ações",
      dataIndex: null,
      width: "120px",
      hide: getProfileType() === "CITY",
      sorter: false,
      align: "center",
      render: (item: any) => (
        <Row justify={"center"} style={{ width: "100%" }}>
          {_minimum && (
            <Col>
              <Link to={`${item.id}/clientes-especiais`}>
                <Popover content="Clientes especiais" trigger="hover">
                  <TbShoppingCart className="actions-button" size={18} />
                </Popover>
              </Link>
            </Col>
          )}
          {_update && (
            <TableTrPhotoButton
              action={() => setAction(!action)}
              item={item}
              permission={permission}
              type={type}
            />
          )}
          {_update && (
            <TableTrEditButton
              item={item}
              permission={permission}
              type={type}
            />
          )}
          {_delete && (
            <TableTrTrashButton
              action={() => setAction(!action)}
              item={item}
              path="user"
              permission={permission}
              type={type}
            />
          )}
          {_delete && (
            <TableTrRecoverButton
              action={() => setAction(!action)}
              item={item}
              path="user"
              permission={permission}
              type={type}
            />
          )}
        </Row>
      ),
    },
  ];

  return (
    <PageDefault
      items={[
        {
          title: (
            <Link to={type === "list" ? "#" : ".."}>
              {getProfileType() === "SELLER" ||
              getProfileType() === "LEGAL_SELLER"
                ? "Clientes"
                : "Locatários"}
            </Link>
          ),
        },
        { title: type === "list" ? "Lista" : "Lixeira" },
      ]}
      options={
        <Row gutter={[8, 8]} justify={"end"}>
          {_minimum && (
            <Col>
              <Button
                className="page-default-button-primary"
                onClick={() => setModalOpen(true)}
                size="small"
                type={"primary"}
              >
                adicionar
              </Button>
            </Col>
          )}
          {_store && <TableNewButton permission={permission} type={type} />}
          {_trash && <TableTrashButton permission={permission} type={type} />}
          <TableReturnButton permission={permission} type={type} />
        </Row>
      }
      valid={`${permission}.${type}`}
    >
      <Row gutter={[16, 16]}>
        <Col md={24} xs={24}>
          <CardItem>
            <Table
              action={action}
              column={column}
              path={path}
              type={type}
              useFilter={
                getProfileType() === "ADMIN" ||
                getProfileType() === "ADMIN_EMPLOYEE"
                  ? [
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
                    ]
                  : []
              }
            />
          </CardItem>
        </Col>
      </Row>

      {/* Modal de adicionar locatário */}
      <Modal
        cancelText="Cancelar"
        okText="Adicionar cliente"
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        onOk={form.submit}
        open={modalOpen}
        title="Adicionar cliente"
      >
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <Segmented
            block
            onChange={(v) => setDoc(v as string)}
            options={[
              { label: "Pessoa física", value: "cpf" },
              { label: "Pessoa jurídica", value: "cnpj" },
            ]}
            style={{ marginBottom: 6 }}
            value={doc}
          />
          <Form.Item
            name="document_number"
            rules={[{ required: true, message: "Campo obrigatório!" }]}
          >
            <InputMaskCorrect
              mask={doc === "cpf" ? "999.999.999-99" : "99.999.999/9999-99"}
              maskChar={""}
            >
              {() => (
                <Input
                  maxLength={doc === "cpf" ? 14 : 18}
                  placeholder={doc === "cpf" ? "Digite o CPF" : "Digite o CNPJ"}
                />
              )}
            </InputMaskCorrect>
          </Form.Item>
        </Form>
      </Modal>
    </PageDefault>
  );
};

export default TenantList;
