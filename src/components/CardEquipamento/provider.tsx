// BIBLIOTECAS REACT
import { Avatar, Col, Row, Typography } from 'antd';
// ICONES
import { IoStar } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

// CSS
import './styles.css';

// INTERFACE
interface CardCacambaProviderInterface {
  item: any;
  action?: any;
}

const CardCacambaProvider = ({
  item,
  action = () => {},
}: CardCacambaProviderInterface) => {
  // RESPONSAVEL PELA ROTA
  const navigate = useNavigate();

  return (
    <div
      className={`card-cacamba ${item?.stock ? '' : 'soldout'}`}
      onClick={() => navigate(`/painel/pedirlocacao/cacamba/${item?.id}`)}
    >
      <div className="card-cacamba-div">
        <div className="card-cacamba-text-row">
          <Typography className="card-cacamba-name">
            Modelo {item?.stationary_bucket_type.name} <span />
          </Typography>
          <Typography className="card-cacamba-subtitle" />
        </div>
        <Typography className="card-cacamba-subtitle desc">
          {item?.type_lid_name} • Cor {item?.color} • {item?.material}
        </Typography>
        <Row
          className="card-cacamba-subtitle desc"
          gutter={[6, 6]}
          style={{ flexWrap: 'nowrap', overflowX: 'auto' }}
        >
          {item?.residues.map((v: any, i: any) => (
            <Col>
              <span className="card-tag" key={i}>
                {v.name}
              </span>
            </Col>
          ))}
        </Row>
        <Typography className="card-cacamba-price hidden">
          {item?.price_external > 0 ? (
            <>
              <span>Locação externa: </span>
              {item?.price_external_name}
            </>
          ) : null}{' '}
          {item?.price_internal > 0 ? (
            <>
              <span>Locação interna: </span>
              {item?.price_internal_name}
            </>
          ) : null}
        </Typography>
        <div className="card-cacamba-price-row">
          {item?.price_external > 0 ? (
            <Typography className="card-cacamba-price">
              <span>Locação externa</span>
              <br />
              {item?.price_external_name}
            </Typography>
          ) : null}
          {item?.price_internal > 0 ? (
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

export default CardCacambaProvider;
