/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: ignorar */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: ignorar */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: ignorar */
import { Avatar, Typography } from "antd";
import { useNavigate } from "react-router-dom";

// CSS
import "./styles.css";

// INTERFACE
interface CardEquipamentoShopInterface {
  item: any;
}

const CardEquipamentoShop = ({ item }: CardEquipamentoShopInterface) => {
  // RESPONSAVEL PELA ROTA
  const navigate = useNavigate();

  return (
    <div
      className={`card-equipamento ${item?.stock ? "" : "soldout"}`}
      onClick={() =>
        item?.stock
          ? navigate(`/painel/pedirlocacao/equipamento/${item?.id}`)
          : {}
      }
    >
      <div className={"card-equipamento-div"}>
        <Typography className="card-equipamento-title">
          <Avatar
            className="card-equipamento-title-avt"
            src={item?.provider_photo}
          />
          {String(item?.provider_name).toLocaleUpperCase()}
        </Typography>
        <div className="card-equipamento-text-row">
          <Typography className="card-equipamento-name">
            {item?.name} <span />
          </Typography>
        </div>
        <Typography className="card-equipamento-subtitle desc">
          {item?.equipment_type?.name}
        </Typography>
        <div className="card-equipamento-price-row">
          <span>Alugueis de</span>
          <Typography className="card-equipamento-price">
            R$ {item?.rental_price_day} a R${item?.rental_price_month}
          </Typography>
        </div>
      </div>
      <Avatar
        className="card-equipamento-avt"
        shape="square"
        src={item?.gallery?.[0]?.url}
      />
    </div>
  );
};

export default CardEquipamentoShop;
