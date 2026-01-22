// CSS
import "./styles.css";

// COMPONENTES
import LoadItem from "../LoadItem";
import CardEquipamentoCart from "./cart";
import CardEquipamentoProvider from "./provider";
import CardEquipamentoShop from "./shop";

// INTERFACE
interface CardEquipamentoInterface {
  item: any;
  action?: any;
  type: "shop" | "cart" | "provider";
}

const CardEquipamento = ({
  item,
  type,
  action = () => null,
}: CardEquipamentoInterface) => {
  if (type === "shop") {
    return <CardEquipamentoShop {...{ item }} />;
  }
  if (type === "cart") {
    return <CardEquipamentoCart item={item} />;
  }
  if (type === "provider") {
    return <CardEquipamentoProvider action={action} item={item} />;
  }

  return <LoadItem title="Componente inválido" />;
};

export default CardEquipamento;
