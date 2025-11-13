// BIBLIOTECAS REACT

import { ExclamationCircleOutlined } from "@ant-design/icons";
import {
  Button,
  type ButtonProps,
  Col,
  Modal,
  message,
  Popover,
  QRCode,
  Tooltip,
  Typography,
  Upload,
} from "antd";
import { LiaDumpsterSolid } from "react-icons/lia";

// ICONES
import {
  TbArrowBack,
  TbBarrierBlock,
  TbChecks,
  TbEdit,
  TbList,
  TbLockOpen,
  TbMapPinExclamation,
  TbPasswordUser,
  TbPhoto,
  TbQrcode,
  TbShoppingCart,
  TbTrash,
  TbX,
} from "react-icons/tb";
import { Link } from "react-router-dom";
// SERVIÇOS
import {
  DELETE_API,
  getProfileID,
  getToken,
  POST_API,
  POST_CATCH,
  UPLOAD_API,
  verifyConfig,
} from "../../services";

// LOGO
const logo = `${import.meta.env.VITE_URL_ASSETS}/1.png`;

import ImgCrop from "antd-img-crop";
import html2canvas from "html2canvas";

// INTERFACE
interface TableButtonInterface {
  type: "list" | "trash" | "add" | "edit";
  permission: string | boolean;
  item?: any;
  path?: string;
  action?: any;
  newId?: any;
  link?: string;
  buttonStyles?: ButtonProps;
}

export const TableNewButton = ({
  type,
  permission,
  link,
  buttonStyles,
}: TableButtonInterface) => {
  if (type === "list" && verifyConfig([`${permission}.add`])) {
    return (
      <Col>
        <Link to={link || "novo"}>
          <Button
            className="page-default-button-primary"
            size="small"
            type={"primary"}
          >
            adicionar
          </Button>
        </Link>
      </Col>
    );
  }
  return null;
};

export const TableNewDocButton = ({
  type,
  permission,
  link,
  buttonStyles,
}: TableButtonInterface) => {
  if (type === "list" && verifyConfig([`${permission}.add`])) {
    return (
      <Col>
        <Link to={link || "novo"}>
          <Button
            className="page-default-button-primary"
            size="small"
            type={"primary"}
          >
            atualizar documento
          </Button>
        </Link>
      </Col>
    );
  }
  return null;
};

export const TableTrashButton = ({
  type,
  permission,
  link,
  buttonStyles,
}: TableButtonInterface) => {
  if (type === "list" && verifyConfig([`${permission}.trash`])) {
    return (
      <Col>
        <Link to={link || "lixeira"}>
          <Button
            className="page-default-button"
            size="small"
            type={buttonStyles?.type || "default"}
          >
            lixeira
          </Button>
        </Link>
      </Col>
    );
  }
  return null;
};

export const TableReturnButton = ({
  type,
  permission,
  link,
  buttonStyles,
}: TableButtonInterface) => {
  if (
    ((type === "trash" || type === "add" || type === "edit") &&
      verifyConfig([`${permission}.list`])) ||
    permission === true
  ) {
    return (
      <Col>
        <Link to={link || ".."}>
          <Button
            className="page-default-button"
            size="small"
            type={buttonStyles?.type || "default"}
          >
            voltar
          </Button>
        </Link>
      </Col>
    );
  }
  return null;
};

export const TableTrEditButton = ({
  type,
  permission,
  item,
}: TableButtonInterface) => {
  if (type === "list" && verifyConfig([`${permission}.edit`])) {
    return (
      <Col>
        <Link to={String(item.id)}>
          <Popover content="Editar" trigger="hover">
            <TbEdit className="actions-button" size={18} />
          </Popover>
        </Link>
      </Col>
    );
  }
  return null;
};

export const TableTrCacambaButton = ({
  type,
  permission,
  item,
}: TableButtonInterface) => {
  if (type === "list" && verifyConfig([`${permission}.list`])) {
    return (
      <Col>
        <Link to={String(item.id) + "/cacambas"}>
          <Popover content="Caçambas" trigger="hover">
            <LiaDumpsterSolid className="actions-button" size={23} />
          </Popover>
        </Link>
      </Col>
    );
  }
  return null;
};

export const TableTrLiberarAcessoButton = ({
  type,
  permission,
  item,
}: TableButtonInterface) => {
  if (type === "list" && verifyConfig([`${permission}.edit`])) {
    return (
      <Col>
        <Link to={String(item.id)}>
          <Popover content="Liberar acesso" trigger="hover">
            <TbLockOpen className="actions-button" size={18} />
          </Popover>
        </Link>
      </Col>
    );
  }
  return null;
};

export const TableTrCartButton = ({
  type,
  permission,
  item,
}: TableButtonInterface) => {
  if (type === "list" && verifyConfig([`${permission}.list`])) {
    return (
      <Col>
        <Link to={String(item.id) + "/itens"}>
          <Tooltip title="Caçambas">
            <TbShoppingCart className="actions-button" size={18} />
          </Tooltip>
        </Link>
      </Col>
    );
  }
  return null;
};

export const TableTrPhotoButton = ({
  type,
  permission,
  item,
  action,
}: TableButtonInterface) => {
  const onChangePic = (value: any) => {
    if (value.file.response?.url) {
      POST_API("/user", { photo: value.file.response?.url }, item.id)
        .then((rs) => {
          if (rs.ok) return rs.json();
          Modal.warning({ title: "Algo deu errado", content: rs.statusText });
        })
        .then(action())
        .catch(POST_CATCH);
    }
  };

  if (type === "list" && verifyConfig([`${permission}.edit`])) {
    return (
      <Col>
        <ImgCrop
          modalCancel="Cancelar"
          modalOk="Salvar"
          modalTitle="Atualizar imagem"
        >
          <Upload
            accept="image/jpg,image/jpeg,image/png"
            action={UPLOAD_API}
            headers={{
              Authorization: "Bearer " + getToken(),
              Profile: getProfileID(),
            }}
            maxCount={1}
            onChange={onChangePic}
            showUploadList={false}
          >
            <Tooltip title="Alterar logo">
              <TbPhoto className="actions-button" size={18} />
            </Tooltip>
          </Upload>
        </ImgCrop>
      </Col>
    );
  }

  return null;
};

export const TableTrGalleryButton = ({
  type,
  permission,
  item,
}: TableButtonInterface) => {
  if (type === "list") {
    return (
      <Col>
        <Link to={String(item.id) + "/galeria"}>
          <Tooltip title="Galeria">
            <TbPhoto className="actions-button" size={18} />
          </Tooltip>
        </Link>
      </Col>
    );
  }
  return null;
};

export const TableTrDetailButton = ({
  type,
  permission,
  item,
}: TableButtonInterface) => {
  if (type === "list") {
    return (
      <Col>
        <Tooltip title="Detalhes">
          <Link to={String(item.id) + "/detalhes"}>
            <TbList className="actions-button" size={18} />
          </Link>
        </Tooltip>
      </Col>
    );
  }
  return null;
};

export const TableTrMapButton = ({
  type,
  permission,
  item,
}: TableButtonInterface) => {
  if (type === "list") {
    return (
      <Col>
        <Tooltip title="Mapa">
          <Link to={String(item.id) + "/mapa"}>
            <TbMapPinExclamation className="actions-button" size={18} />
          </Link>
        </Tooltip>
      </Col>
    );
  }
  return null;
};

export const TableTrMapProductButton = ({
  type,
  permission,
  newId = null,
  item,
}: TableButtonInterface) => {
  if (type === "list") {
    return (
      <Col>
        <Tooltip title="Mapa">
          <Link
            to={
              newId
                ? String(newId) + "/mapa"
                : String(item.order_location_id) + "/mapa"
            }
          >
            <TbMapPinExclamation className="actions-button" size={18} />
          </Link>
        </Tooltip>
      </Col>
    );
  }
  return null;
};

export const TableTrQrCodeButton = ({ type, item }: TableButtonInterface) => {
  const onOpen = () => {
    Modal.confirm({
      title: item.code ? (
        <div className="i9-qrcode" id="myqrcode">
          <center>
            <img src={logo} width={100} />
          </center>
          <center>
            <QRCode bgColor="#FFF" size={300} value={item.code} />
          </center>
          <center>
            <Typography>{item.code}</Typography>
          </center>
        </div>
      ) : (
        "QRcode não cadastrado"
      ),
      icon: <></>,
      cancelText: "Fechar",
      okText: "Download",
      okButtonProps: { disabled: !item.code },
      onOk: () => {
        const div: any = document.getElementById("myqrcode");
        html2canvas(div).then((canvas) => {
          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/png");
          link.download = item.code + " QRCode.png";
          link.click();
          link.remove();
        });
      },
    });
  };

  if (type === "list") {
    return (
      <Col>
        <Tooltip title="QR Code">
          <TbQrcode className="actions-button" onClick={onOpen} size={18} />
        </Tooltip>
      </Col>
    );
  }
  return null;
};

export const TableTrTrashButton = ({
  type,
  permission,
  item,
  path,
  action,
}: TableButtonInterface) => {
  const onAction = () => {
    Modal.confirm({
      title: "Deletar registro?",
      icon: <ExclamationCircleOutlined />,
      cancelText: "Não",
      okText: "Sim",
      onOk() {
        message.open({
          type: "loading",
          content: "Deletando...",
          key: "screen",
        });
        DELETE_API(`/${path}/${item.id}`)
          .then((rs) => {
            if (rs.ok) {
              message.success({
                content: "Deletado com sucesso",
                key: "screen",
              });
              action();
            } else {
              Modal.warning({
                title: "Algo deu errado",
                content: "Não foi possível deletar registro.",
              });
            }
          })
          .catch(POST_CATCH);
      },
      onCancel() {},
    });
  };

  if (type === "list" && verifyConfig([`${permission}.del`])) {
    return (
      <Col>
        <Popover content="Deletar" trigger="hover">
          <TbTrash className="actions-button" onClick={onAction} size={18} />
        </Popover>
      </Col>
    );
  }
  return null;
};

export const TableTrCancelButton = ({
  type,
  permission,
  item,
  path,
  action,
}: TableButtonInterface) => {
  // AÇÃO DE DELETE
  const onAction = () => {
    Modal.confirm({
      title: "Cancelar pedido?",
      icon: <ExclamationCircleOutlined />,
      cancelText: "Não",
      okText: "Sim",
      onOk() {
        POST_API(`/${path}/cancel.php`, {
          token: getToken(),
          id: item.id,
          type: "del",
        })
          .then((rs) => rs.json())
          .then((res) => {
            if (res.return) {
              message.success({ content: res.msg, key: "screen" });
              action();
            } else {
              Modal.warning({ title: "Algo deu errado", content: res.msg });
            }
          })
          .catch(POST_CATCH);
      },
      onCancel() {},
    });
  };

  if (
    type === "list" &&
    verifyConfig([`${permission}.edit`]) &&
    item.STATUS == "AR"
  ) {
    return (
      <Col>
        <TbX className="actions-button" onClick={onAction} size={18} />
      </Col>
    );
  }
  return null;
};

export const TableTrRecuseButton = ({
  type,
  permission,
  item,
  path,
  action,
}: TableButtonInterface) => {
  // AÇÃO DE DELETE
  const onAction = () => {
    Modal.confirm({
      title: "Recusar pedido?",
      icon: <ExclamationCircleOutlined />,
      cancelText: "Não",
      okText: "Sim",
      onOk() {
        POST_API(`/${path}/recuse.php`, {
          token: getToken(),
          id: item.id,
          type: "del",
        })
          .then((rs) => rs.json())
          .then((res) => {
            if (res.return) {
              message.success({ content: res.msg, key: "screen" });
              action();
            } else {
              Modal.warning({ title: "Algo deu errado", content: res.msg });
            }
          })
          .catch(POST_CATCH);
      },
      onCancel() {},
    });
  };

  if (
    type === "list" &&
    verifyConfig([`${permission}.edit`]) &&
    item.STATUS == "AR"
  ) {
    return (
      <Col>
        <TbBarrierBlock
          className="actions-button"
          onClick={onAction}
          size={18}
        />
      </Col>
    );
  }
  return null;
};

export const TableTrAcceptButton = ({
  type,
  permission,
  item,
  path,
  action,
}: TableButtonInterface) => {
  // AÇÃO DE DELETE
  const onAction = () => {
    Modal.confirm({
      title: "Aceitar pedido?",
      icon: <ExclamationCircleOutlined />,
      cancelText: "Não",
      okText: "Sim",
      onOk() {
        POST_API(`/${path}/accept.php`, {
          token: getToken(),
          id: item.id,
          type: "del",
        })
          .then((rs) => rs.json())
          .then((res) => {
            if (res.return) {
              message.success({ content: res.msg, key: "screen" });
              action();
            } else {
              Modal.warning({ title: "Algo deu errado", content: res.msg });
            }
          })
          .catch(POST_CATCH);
      },
      onCancel() {},
    });
  };

  if (
    type === "list" &&
    verifyConfig([`${permission}.edit`]) &&
    item.STATUS == "AR"
  ) {
    return (
      <Col>
        <TbChecks className="actions-button" onClick={onAction} size={18} />
      </Col>
    );
  }
  return null;
};

export const TableTrRecoverButton = ({
  type,
  permission,
  item,
  path,
  action,
}: TableButtonInterface) => {
  // AÇÃO DE RECOVER
  const onAction = () => {
    Modal.confirm({
      title: "Recuperar registro?",
      icon: <ExclamationCircleOutlined />,
      cancelText: "Não",
      okText: "Sim",
      onOk() {
        POST_API(`/${path}`, { recover: 1 }, item.id)
          .then((rs) => {
            if (rs.ok) {
              return rs.json();
            }
            Modal.warning({
              title: "Algo deu errado",
              content: rs.statusText,
            });
          })
          .then((data) => {
            message.success({ content: "Registro recuperado", key: "screen" });
            action();
          })
          .catch(POST_CATCH);
      },
      onCancel() {},
    });
  };

  if (type === "trash" && verifyConfig([`${permission}.rec`])) {
    return (
      <Col>
        <Tooltip title="Recuperar">
          <TbArrowBack
            className="actions-button"
            onClick={onAction}
            size={18}
          />
        </Tooltip>
      </Col>
    );
  }
  return null;
};

export const TableTrPassword = ({
  type,
  item,
  path,
  action,
}: TableButtonInterface) => {
  // AÇÃO RESTAURAR SENHA
  const onAction = () => {
    Modal.confirm({
      title: "Restaurar senha?",
      icon: <ExclamationCircleOutlined />,
      cancelText: "Não",
      okText: "Sim",
      onOk() {
        POST_API(`/${path}/recpass.php`, { token: getToken(), id: item.id })
          .then((rs) => rs.json())
          .then((res) => {
            if (res.return) {
              message.success({ content: res.msg, key: "screen" });
              action();
            } else {
              Modal.warning({ title: "Algo deu errado", content: res.msg });
            }
          })
          .catch(POST_CATCH);
      },
      onCancel() {},
    });
  };

  if (type === "list") {
    return (
      <Col>
        <Tooltip title="Redefinir senha">
          <TbPasswordUser
            className="actions-button"
            onClick={onAction}
            size={18}
          />
        </Tooltip>
      </Col>
    );
  }
  return null;
};
