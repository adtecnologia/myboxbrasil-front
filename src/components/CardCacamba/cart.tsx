// BIBLIOTECAS REACT
import { Avatar, Col, Row, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

// CSS
import './styles.css';

// INTERFACE
interface CardCacambaCartInterface {
  item: any;
  action?: any;
}

const CardCacambaCart = ({
  item,
  action = () => {},
}: CardCacambaCartInterface) => {
  // RESPONSAVEL PELA ROTA
  const navigate = useNavigate();

  return (
    <div className="card-cacamba" style={{borderRadius: 0}} onClick={() => navigate(`${item?.id}`)}>
      <div className="card-cacamba-div cart">
        
        <div className="card-cacamba-text-row">
          <Typography className="card-cacamba-name">
            Modelo {item?.product.stationary_bucket_type.name} <span />
          </Typography>
        </div>
        <Typography className="card-cacamba-subtitle">
          {item?.product.type_lid_name} • Cor {item?.product.color} •{' '}
          {item?.product.material} • {item?.days} dias
        </Typography>
        <Typography
          className="card-cacamba-subtitle"
          style={{ color: 'var(--color01)' }}
        >
          Para {item?.address?.street}, {item?.address?.number} -{' '}
          {item?.address?.district} - {item?.address?.city.name} /{' '}
          {item?.address?.city.state.acronym}
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
        <Typography className="card-cacamba-price-cart">
          {item?.quantity} x R$ {Number(item?.price).toLocaleString('pt-br')}
        </Typography>
      </div>
      <Avatar
        className="card-cacamba-avt cart"
        shape="square"
        src={item?.product.gallery?.[0]?.url}
      />
    </div>
  );
};

export default CardCacambaCart;
