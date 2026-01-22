/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: ignorar */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: ignorar */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: ignorar */

// BIBLIOTECAS REACT
import { Avatar, Typography } from "antd";
import { useNavigate } from "react-router-dom";

// CSS
import "./styles.css";

// INTERFACE
interface CardEquipamentoCartInterface {
  item: any;
}

const CardEquipamentoCart = ({ item }: CardEquipamentoCartInterface) => {
  // RESPONSAVEL PELA ROTA
  const navigate = useNavigate();

  return (
    <div
      className="card-equipamento"
      onClick={() => navigate(`${item?.id}/equipamento`)}
      style={{ borderRadius: 0 }}
    >
      <div className="card-equipamento-div cart">
        <div className="card-equipamento-text-row">
          <Typography className="card-equipamento-name">
            {item?.product.name} <span />
          </Typography>
        </div>
        <Typography className="card-equipamento-subtitle">
          {item?.days} dia(s)
        </Typography>
        <Typography
          className="card-equipamento-subtitle"
          style={{ color: "var(--color01)" }}
        >
          Para {item?.address?.street}, {item?.address?.number} -{" "}
          {item?.address?.district} - {item?.address?.city.name} /{" "}
          {item?.address?.city.state.acronym}
        </Typography>

        <Typography className="card-equipamento-price-cart">
          {item?.quantity} x R$ {Number(item?.price).toLocaleString("pt-br")}
        </Typography>
      </div>
      <Avatar
        className="card-equipamento-avt cart"
        shape="square"
        src={item?.product.gallery?.[0]?.url}
      />
    </div>
  );
};

export default CardEquipamentoCart;
