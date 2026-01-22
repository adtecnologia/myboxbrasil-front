// CSS
import "./styles.css";

// COMPONENTES
import LoadItem from "../LoadItem";
import CardCacambaCart from "./cart";
import CardCacambaProvider from "./provider";
import CardCacambaShop from "./shop";

// INTERFACE
interface CardCacambaInterface {
  item: any;
  action?: any;
  typeSelect?: string | null;
  residueSelect?: any[];
  type: "shop" | "cart" | "provider";
}

const CardCacamba = ({
  item,
  type,
  typeSelect,
  residueSelect,
  action = () => null,
}: CardCacambaInterface) => {
  if (type === "shop") {
    return <CardCacambaShop {...{ typeSelect, residueSelect, item }} />;
  }
  if (type === "cart") {
    return <CardCacambaCart action={action} item={item} />;
  }
  if (type === "provider") {
    return <CardCacambaProvider action={action} item={item} />;
  }

  return <LoadItem title="Componente inválido" />;
};

export default CardCacamba;
