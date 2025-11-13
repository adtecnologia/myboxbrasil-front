// react libraries

import {
  Button,
  Col,
  Form,
  Image,
  Input,
  Modal,
  message,
  Row,
  Upload,
} from "antd";
import ImgCrop from "antd-img-crop";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { EquipmentTypePermissionEnum } from "@/enums/permissions/equipment-type-enum";
// services
import {
  cleanData,
  GET_API,
  getProfileID,
  getToken,
  type PageDefaultProps,
  POST_API,
  POST_CATCH,
  UPLOAD_API,
} from "@/services";
import CardItem from "../../../../components/CardItem";
import LoadItem from "../../../../components/LoadItem";
// components
import PageDefault from "../../../../components/PageDefault";
import { TableReturnButton } from "../../../../components/Table/buttons";

export default function EquipmentTypeForm({
  type,
  path,
  permission,
}: PageDefaultProps) {
  // router
  const navigate = useNavigate();

  // params
  const { ID } = useParams();

  // state
  const [load, setLoad] = useState(true);
  const [loadButton, setLoadButton] = useState(false);

  const [photoPreview, setPhotoPreview] = useState("");
  const [photo, setPhoto] = useState("");
  const [fileList, setFileList] = useState<any>([]);

  // form
  const [form] = Form.useForm();

  // valid params
  useEffect(() => {
    if (type === "add") {
      setLoad(false);
    } else {
      setLoad(true);
      GET_API(`/${path}/${ID}`)
        .then((rs) => {
          if (rs.ok) {
            return rs.json();
          }
          Modal.warning({ title: "Algo deu errado", content: rs.statusText });
        })
        .then((res) => {
          form.setFieldsValue(cleanData(res.data));
          setPhotoPreview(res.data.photo);
        })
        .catch(POST_CATCH)
        .finally(() => setLoad(false));
    }
  }, [type, path, form, ID]);

  // function save
  const onSend = (values: any) => {
    setLoadButton(true);
    if (photo) {
      values.photo = photo;
    }
    POST_API(`/${path}`, values, ID)
      .then((rs) => {
        if (rs.ok) {
          return rs.json();
        }
        Modal.warning({ title: "Algo deu errado", content: rs.statusText });
      })
      .then((_) => {
        message.success("Salvo com sucesso!");
        navigate("..");
      })
      .catch(POST_CATCH)
      .finally(() => setLoadButton(false));
  };

  return (
    <PageDefault
      items={[
        {
          title: (
            <Link to={type === "list" ? "#" : ".."}>Tipos de equipamento</Link>
          ),
        },
        { title: type === "add" ? "Novo" : "Editar" },
      ]}
      options={
        <Row gutter={[8, 8]} justify={"end"}>
          <TableReturnButton permission={permission} type={type} />
        </Row>
      }
      valid={EquipmentTypePermissionEnum.UPDATE}
    >
      <Row gutter={[16, 16]}>
        <Col md={24} xs={24}>
          {load ? (
            <LoadItem />
          ) : (
            <CardItem>
              <Form form={form} layout="vertical" onFinish={onSend}>
                <Row gutter={[8, 0]}>
                  <Col md={24} xs={24}>
                    <Form.Item
                      label="Tipo de equipamento"
                      name="name"
                      rules={[
                        { required: true, message: "Campo obrigatório!" },
                      ]}
                    >
                      <Input placeholder="Nome do tipo do equipamento" />
                    </Form.Item>
                  </Col>
                  <Col md={24} xs={24}>
                    <Form.Item label="Descrição" name="description">
                      <Input.TextArea placeholder="Descrição" rows={4} />
                    </Form.Item>
                  </Col>
                  <Col md={3} xs={24}>
                    <Image
                      src={
                        photoPreview
                          ? photoPreview
                          : "https://www.ladrilar.com.br/wp-content/uploads/2020/12/cinza-escuro.png"
                      }
                      width={"100%"}
                    />
                  </Col>
                  <Col md={21} xs={24}>
                    <Form.Item label="Foto" name="photo">
                      <ImgCrop>
                        <Upload
                          accept="image/jpeg,image/png"
                          action={UPLOAD_API}
                          fileList={fileList}
                          headers={{
                            Authorization: `Bearer ${getToken()}`,
                            Profile: getProfileID(),
                          }}
                          maxCount={1}
                          onChange={({ fileList: newFileList }) => {
                            setFileList(newFileList);
                            setPhoto(newFileList[0]?.response?.url);
                            setPhotoPreview(newFileList[0]?.response?.url_link);
                          }}
                        >
                          <Button>Selecionar foto</Button>
                        </Upload>
                      </ImgCrop>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Button
                      htmlType="submit"
                      loading={loadButton}
                      style={{ float: "right", marginLeft: 6 }}
                      type="primary"
                    >
                      Salvar
                    </Button>
                    <Link to={".."}>
                      <Button style={{ float: "right" }} type="default">
                        Cancelar
                      </Button>
                    </Link>
                  </Col>
                </Row>
              </Form>
            </CardItem>
          )}
        </Col>
      </Row>
    </PageDefault>
  );
}
