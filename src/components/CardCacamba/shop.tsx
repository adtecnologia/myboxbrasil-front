/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: ignorar */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: ignorar */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: ignorar */
import { Avatar, Col, Row, Typography } from "antd";
import { useNavigate } from "react-router-dom";

// CSS
import "./styles.css";

// INTERFACE
interface CardCacambaShopInterface {
  item: any;
  typeSelect: string | null;
  residueSelect?: any[];
}

const CardCacambaShop = ({
  item,
  typeSelect,
  residueSelect,
}: CardCacambaShopInterface) => {
  // RESPONSAVEL PELA ROTA
  const navigate = useNavigate();

  return (
    <div
      className={`card-cacamba ${item?.stock ? "" : "soldout"}`}
      onClick={() =>
        item?.stock
          ? navigate(
              `/painel/pedirlocacao/cacamba/${item?.id}?tipoLocacao=${typeSelect}${residueSelect ? `&residuos=${residueSelect.map((r) => r.id).join(",")}` : ""}`
            )
          : {}
      }
    >
      <div className={"card-cacamba-div"}>
        <Typography className="card-cacamba-title">
          <Avatar
            className="card-cacamba-title-avt"
            src={item?.provider_photo}
          />
          {String(item?.provider_name).toLocaleUpperCase()}
        </Typography>
        <div className="card-cacamba-text-row">
          <Typography className="card-cacamba-name">
            Modelo {item?.stationary_bucket_type?.name} <span />
          </Typography>
        </div>
        <Typography className="card-cacamba-subtitle desc">
          {item?.type_lid_name} • Cor {item?.color} • {item?.material}
        </Typography>
        <Row className="card-cacamba-subtitle desc" gutter={[6, 6]}>
          {item?.residues.map((v: any, i: any) => (
            <Col key={i}>
              <span className="card-tag">{v.name}</span>
            </Col>
          ))}
        </Row>
        <Typography className="card-cacamba-price hidden">
          {item?.customer_seller_minimum_price > 0 && (
            <>
              <span>Preço especial: </span>
              {item?.customer_seller_minimum_price_name}
            </>
          )}
          {!item?.customer_seller_minimum_price && (
            <>
              {typeSelect === "E" && (
                <>
                  <span>Locação externa: </span>
                  {item?.price_external_name}
                </>
              )}{" "}
              {typeSelect === "I" && (
                <>
                  <span>Locação interna: </span>
                  {item?.price_internal_name}
                </>
              )}
            </>
          )}
        </Typography>
        <div className="card-cacamba-price-row">
          {typeSelect === "E" ? (
            <Typography className="card-cacamba-price">
              <span>Locação externa</span>
              <br />
              {item?.price_external_name}
            </Typography>
          ) : null}
          {typeSelect === "I" ? (
            <Typography className="card-cacamba-price">
              <span>Locação interna</span>
              <br />
              {item?.price_internal_name}
            </Typography>
          ) : null}
        </div>
      </div>
      <Avatar
        className="card-cacamba-avt"
        shape="square"
        src={item?.gallery?.[0]?.url}
      />
    </div>
  );
};

export default CardCacambaShop;
