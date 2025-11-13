// BIBLIOTECAS REACT
import { Image, Skeleton, Typography } from "antd";

// CSS
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
