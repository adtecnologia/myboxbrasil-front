import { Col, Row, Tabs, type TabsProps } from 'antd';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
// components
import CardItem from '@/components/CardItem';
import PageDefault from '@/components/PageDefault';
import { TableReturnButton } from '@/components/Table/buttons';
// services
import type { PageDefaultProps } from '@/services';
// tabs
import StationaryBucketGallery from './gallery';
import StationaryBucketForm from './info';
import StationaryBucketItensList from './itens';

export default function StationaryBucketTabs({
  type,
  permission,
}: PageDefaultProps) {
  const [selectedTab, setSelectedTab] = useState<string>('1');

  const tabs: TabsProps['items'] = useMemo(
    () => [
      {
        key: '1',
        label: 'Caçamba',
        children: (
          <StationaryBucketForm
            nextTab={() => setSelectedTab('2')}
            path="stationary_bucket_group"
            type={type}
          />
        ),
      },
      {
        key: '2',
        label: 'Galeria',
        children: (
          <StationaryBucketGallery
            backTab={() => setSelectedTab('1')}
            nextTab={() => setSelectedTab('3')}
            path="stationary_bucket_gallery"
            permission="cmb"
          />
        ),
        disabled: type === 'add',
      },
      {
        key: '3',
        label: 'Caçambas',
        children: (
          <StationaryBucketItensList
            backTab={() => setSelectedTab('2')}
            path="stationary_bucket"
            permission="cmb"
            type="list"
          />
        ),
        disabled: type === 'add',
      },
    ],
    [type]
  );

  return (
    <PageDefault
      items={[
        { title: <Link to={type === 'list' ? '#' : '..'}>Caçambas</Link> },
        { title: type === 'add' ? 'Novo' : 'Editar' },
      ]}
      options={
        <Row gutter={[8, 8]} justify={'end'}>
          <TableReturnButton permission={permission} type={type} />
        </Row>
      }
      valid={`${permission}.${type}`}
    >
      <Row gutter={[16, 16]}>
        <Col md={24} xs={24}>
          <CardItem>
            <Tabs
              activeKey={selectedTab}
              items={tabs}
              onTabClick={setSelectedTab}
            />
          </CardItem>
        </Col>
      </Row>
    </PageDefault>
  );
}
