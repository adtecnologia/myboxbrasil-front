// BIBLIOTECAS REACT
import { Avatar, Col, Row, Tag, Typography } from 'antd';
// ICONES
import { IoStar } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

// CSS
import './styles.css';
import { FiMapPin } from 'react-icons/fi';

// INTERFACE
interface CardCacambaShopInterface {
  item: any;
  typeLocal: any;
  action?: any;
}

const CardCacambaShop = ({
  item,
  typeLocal,
  action = () => {},
}: CardCacambaShopInterface) => {
  // RESPONSAVEL PELA ROTA
  const navigate = useNavigate();

  return (
    <div
      className={`card-cacamba ${item?.stock ? '' : 'soldout'}`}
      onClick={() =>
        item?.stock
          ? navigate(`/painel/pedirlocacao/cacamba/${item?.id}/${typeLocal}`)
          : {}
      }
    >
      <div className={'card-cacamba-div'}>
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
            <Col>
              <span className="card-tag" key={i}>
                {v.name}
              </span>
            </Col>
          ))}
        </Row>
        <Typography className="card-cacamba-price hidden">
          {typeLocal === 'E' ? (
            <>
              <span>Locação externa: </span>
              {item?.price_external_name}
            </>
          ) : null}{' '}
          {typeLocal === 'I' ? (
            <>
              <span>Locação interna: </span>
              {item?.price_internal_name}
            </>
          ) : null}
        </Typography>
        <div className="card-cacamba-price-row">
          {typeLocal === 'E' ? (
            <Typography className="card-cacamba-price">
              <span>Locação externa</span>
              <br />
              {item?.price_external_name}
            </Typography>
          ) : null}
          {typeLocal === 'I' ? (
            <Typography className="card-cacamba-price">
              <span>Locação interna</span>
              <br />
              {item?.price_internal_name}
            </Typography>
          ) : null}
          {/* { item?.type_local === 'B' || item?.type_local === "E" ?  }
                    { item?.type_local === 'B' || item?.type_local === "I" ? <Typography className='card-cacamba-price'><span>Locação interna</span><br/>{item?.price_internal_name}</Typography> : null } */}
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
