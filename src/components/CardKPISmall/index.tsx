// BIBLIOTECAS REACT
/** biome-ignore-all lint/suspicious/noExplicitAny: ignorar */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: ignorar */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: ignorar */
/** biome-ignore-all lint/nursery/noNoninteractiveElementInteractions: ignorar */
import { Col, Row, Tooltip, Typography } from 'antd';

// CSS
import './styles.css';
import type { MouseEventHandler } from 'react';
import { IoWarning } from 'react-icons/io5';
import { Oval } from 'react-loader-spinner';

// INTERFACE
interface CardKPIInterface {
  title: string;
  icon: any;
  value: any;
  onClick?: MouseEventHandler;
  type?: string;
  alert?: boolean;
  alertOnClick?: MouseEventHandler;
  alertText?: string;
  alertValue?: number;
}

const CardKPI = ({
  title,
  icon,
  value,
  onClick,
  type,
  alert,
  alertOnClick,
  alertText,
  alertValue,
}: CardKPIInterface) => {
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
                <Row align={'middle'} gutter={[8, 8]}>
                  <Col>
                    <Typography className="card-kpi-small-value">
                      {value}
                    </Typography>
                  </Col>
                  {alert &&
                    alertValue !== undefined &&
                    alertValue > 0 &&
                    alertText && (
                      <Col>
                        <Tooltip placement="top" title={alertText}>
                          <IoWarning
                            color="orange"
                            onClick={alertOnClick}
                            size={25}
                            style={{ marginTop: 8, cursor: 'pointer' }}
                          />
                        </Tooltip>
                      </Col>
                    )}
                </Row>
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
