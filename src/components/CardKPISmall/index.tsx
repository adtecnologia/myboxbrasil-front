// BIBLIOTECAS REACT
import { Col, Row, Typography } from 'antd';

// CSS
import './styles.css';
import type { MouseEventHandler } from 'react';
import { Oval } from 'react-loader-spinner';

// INTERFACE
interface CardKPIInterface {
  title: string;
  icon: any;
  value: any;
  onClick?: MouseEventHandler;
  type?: string;
}

const CardKPI = ({ title, icon, value, onClick, type }: CardKPIInterface) => {
  return (
    <div
      className={`card-kpi-small ${onClick ? 'card-kpi-small-is-button' : ''} ${type}`}
      onClick={onClick}
    >
      <Row gutter={[12, 12]}>
        <Col span={24}>
          <Typography className="card-kpi-small-title">{title}</Typography>
        </Col>
        <Col span={24}>
          <Row
            align={value > -1 ? 'top' : 'middle'}
            justify={'space-between'}
            style={{ flexWrap: 'nowrap', width: '100%' }}
          >
            {value !== -1 ? (
              <Col>
                <Typography className="card-kpi-small-value">
                  {value}
                </Typography>
              </Col>
            ) : (
              <Col>
                <Oval
                  ariaLabel="oval-loading"
                  color="#ffffff"
                  height="30"
                  secondaryColor="#ffffff"
                  visible={true}
                  width="30"
                  wrapperClass=""
                  wrapperStyle={{}}
                />
              </Col>
            )}
            <Col>{icon}</Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default CardKPI;
