/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: ignorar */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: ignorar */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: ignorar */
import { Image, Modal, Skeleton, Typography } from "antd";
import "./styles.css";

// INTERFACE
interface CardTypeInterface {
  item: any;
  typeProdSelect: any;
  setTypeProdSelect: any;
}

const CardType = ({
  item,
  typeProdSelect,
  setTypeProdSelect,
}: CardTypeInterface) => (
  <div
    className={`card-type ${typeProdSelect?.id === item.id ? "active" : ""} ${item?.disabled ? "disabled" : ""}`}
  >
    <div
      className="card-type-div"
      onClick={() => {
        if (item.disabled) {
          Modal.info({
            title:
              "Ainda não existem fornecedores para este equipamento na sua região.",
            okText: "Ok",
          });
          return;
        }
        setTypeProdSelect(item);
      }}
    >
      <Image
        alt={item.name}
        className="card-type-img"
        placeholder={<Skeleton.Avatar shape="square" />}
        preview={false}
        src={item.photo}
      />
      <Typography className="card-type-title">{item.name}</Typography>
    </div>
  </div>
);

export default CardType;
