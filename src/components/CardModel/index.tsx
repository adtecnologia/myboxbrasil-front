/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: ignorar */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: ignorar */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: ignorar */
import { Image, Modal, Skeleton, Typography } from "antd";
import "./styles.css";

// INTERFACE
interface CardModelInterface {
  item: any;
  modelSelect: any;
  setModelSelect: any;
}

const CardModel = ({
  item,
  modelSelect,
  setModelSelect,
}: CardModelInterface) => (
  <div className={`card-model ${modelSelect?.id === item.id ? "active" : ""}`}>
    <div
      className="card-model-div"
      onClick={() => {
        if (!item.has_provider) {
          Modal.info({
            title:
              "Ainda não existem fornecedores que atuam com o modelo de caçamba " +
              String(item.name).toLowerCase() +
              " na sua região.",
            okText: "Ok",
          });
          return;
        }
        setModelSelect(item);
      }}
    >
      <Image
        alt={item.name}
        className="card-model-img"
        placeholder={<Skeleton.Avatar shape="square" />}
        preview={false}
        src={item.photo}
      />
      <Typography className="card-model-title">{item.name}</Typography>
    </div>
  </div>
);

export default CardModel;
