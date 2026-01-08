// react libraries
import {
  Col,
  Row,
} from 'antd';
import { useEffect, useState } from 'react';
import { GiPayMoney, GiSwipeCard, GiTakeMyMoney } from 'react-icons/gi';
import CardKPISmall from '../../../../components/CardKPISmall';
// components
import PageDefault from '../../../../components/PageDefault';
// services
import {
  GET_API,
} from '../../../../services';
import { IoPeopleOutline } from 'react-icons/io5';

type AdminData = {
  sales_amount: string,
  total_fees: string,
  net_total: string,
  total_withdrawn: string,
  total_balance: string,
  blocked_balance: string,
  available_balance: string,
}

const stringToMoney = (value: string) => {
  return `R$ ${Number(value).toLocaleString('pt-br', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
}

const FinancialMinhaContaAdmin = () => {
  // state
  const [data, setData] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    GET_API('/me')
      .then((rs) => rs.json())
      .then((res) => {
        setData(res.data);
        setIsLoading(false);
      });
  }, []);

  return (
    <PageDefault
      items={[{ title: 'Minha conta' }]}
      valid={true}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={24} lg={8} xl={8}>
          <CardKPISmall
            icon={<GiPayMoney className="card-kpi-small-icon" />}
            title="Total"
            value={isLoading ? -1 : stringToMoney(data?.blocked_balance ?? '0') }
          />
        </Col>
        <Col xs={24} sm={12} md={12} lg={4} xl={4}>
          <CardKPISmall
            icon={<GiTakeMyMoney className="card-kpi-small-icon" />}
            title="Total disponível"
            value={isLoading ? -1 : stringToMoney(data?.blocked_balance ?? '0')}
          />
        </Col>
        <Col xs={24} sm={12} md={12} lg={4} xl={4}>
          <CardKPISmall
            icon={<IoPeopleOutline className="card-kpi-small-icon" />}
            title="Total locadores"
            value={isLoading ? -1 : stringToMoney(data?.blocked_balance ?? '0')}
          />
        </Col>
        <Col xs={24} sm={12} md={12} lg={4} xl={4}>
          <CardKPISmall
            icon={<IoPeopleOutline className="card-kpi-small-icon" />}
            title="Total destino final"
            value={isLoading ? -1 : stringToMoney(data?.blocked_balance ?? '0')}
          />
        </Col>
        <Col xs={24} sm={12} md={12} lg={4} xl={4}>
          <CardKPISmall
            icon={<GiSwipeCard className="card-kpi-small-icon" />}
            title="Descontos do gateway"
            value={isLoading ? -1 : stringToMoney(data?.blocked_balance ?? '0')}
          />
        </Col>
      </Row>
    </PageDefault>
  );
};

export default FinancialMinhaContaAdmin;
