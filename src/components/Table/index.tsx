// BIBLIOTECAS REACT

import {
  Badge,
  Button,
  Col,
  Drawer,
  Input,
  InputNumber,
  Modal,
  Pagination,
  Popover,
  Row,
  Select,
  Skeleton,
  Spin,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';

// ICONES
import { IoMdArrowDropdown, IoMdArrowDropup } from 'react-icons/io';
import { IoFilter } from 'react-icons/io5';

// SERVIÇOS
import { GET_API, getJsonValue } from '../../services';

// CSS
import './styles.css';

// COMPONENTES
import SelectSearch from '../SelectSearch';

// INTERFACE
interface TableInterface {
  column: any[];
  path: string;
  type: string;
  action: any;
  useFilter?: any[];
  defaultFilter?: any;
  getList?: any;
  sorterActive?: any;
}

function Table({
  column,
  path,
  type,
  action,
  useFilter = [],
  defaultFilter = [],
  getList = () => {},
  sorterActive = null,
}: TableInterface) {
  // ESTADOS DO COMPONENTE
  const [data, setData] = useState([]);
  const [load, setLoad] = useState([]);
  const [filt, setFilt] = useState(false);
  const [verify, setVerify] = useState(false);
  const [filtLoad, setFiltLoad] = useState(false);
  const [selectColumn, setSelectColumn] = useState(
    sorterActive
      ? sorterActive.selectColumn
      : column[0].sorter
        ? column[0].table
        : column[1].table
  );
  const [onSearch, setOnSearch] = useState(true);
  const [search, setSearch] = useState('');
  const [order, setOrder] = useState(sorterActive ? sorterActive.order : 'ASC');
  const [current, setCurrent] = useState(1);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(10);
  const [filterValues, setFilterValues] = useState({});

  // BUSCA DADOS DA TABELA
  const renderTable = async (
    filter: any,
    pagination: any,
    sorter: any,
    search: any,
    setData: any,
    setTotal: any,
    setLoad: any
  ) => {
    setLoad(true);

    let url = `/${path}?page=${pagination.current}&per_page=${
      pagination.page
    }&search=${search}&sort=${
      sorter.order == 'ASC'
        ? '' + sorter.selectColumn
        : '-' + sorter.selectColumn
    }`;

    Object.entries(filter).forEach(([key, value]) => {
      if (value != undefined && value != null) {
        url += `&${key}=${value}`;
      }
    });

    Object.entries(defaultFilter).forEach(([key, value]) => {
      if (value != undefined && value != null) {
        url += `&${key}=${value}`;
      }
    });

    if (type === 'trash') {
      url += '&trash=true';
    }

    await GET_API(url)
      .then((response) => {
        if (!response.ok) {
          Modal.warning({ title: 'Algo deu errado' });
        }
        response
          .json()
          .then((res) => {
            setData(res.data);
            setTotal(res.meta.total);
            setLoad(false);
            getList(res.data);
          })
          .catch((error) => {});
      })
      .catch((error) => {});
  };

  // ORDENAR TABELA
  const setSelectColumnOrder = (value: string, sorter: string) => {
    if (sorter) {
      if (value === selectColumn) {
        setOrder(order === 'ASC' ? 'DESC' : 'ASC');
      } else {
        setOrder('ASC');
      }
      setSelectColumn(value);
    }
  };

  useEffect(() => {
    verifyFilter();
    renderTable(
      filterValues,
      { current, total, page },
      { selectColumn, order },
      search,
      setData,
      setTotal,
      setLoad
    );
  }, [
    filterValues,
    current,
    page,
    selectColumn,
    order,
    onSearch,
    type,
    action,
  ]);

  useEffect(() => {
    setCurrent(1);
  }, [type, action]);

  const onFilter = () => {
    setFilt(false);
    renderTable(
      filterValues,
      { current, total, page },
      { selectColumn, order },
      search,
      setData,
      setTotal,
      setLoad
    );
  };

  const verifyFilter = () => {
    var temp: Object = filterValues;
    Object.keys(temp).map((v) => {
      setVerify(temp[v as keyof typeof filterValues] !== '');
    });
  };

  const onClear = () => {
    var temp: any = filterValues;
    Object.keys(temp).map((v, i) => {
      temp[v] = '';
    });
    setFilterValues(temp);
    setFiltLoad(true);
    setTimeout(() => {
      setFiltLoad(false);
      onFilter();
    }, 500);
  };

  return (
    <div className="table-content">
      <Row align={'middle'}>
        <Col md={12} xs={4}>
          <Typography className="table-summary">Total:</Typography>
          <Typography className="table-summary-value">{total}</Typography>
        </Col>
        <Col md={12} xs={20}>
          <Row align={'middle'} gutter={[4, 4]} justify="end">
            <Col>
              <Input.Search
                className="input-search"
                onChange={(v) => setSearch(v.target.value)}
                onSearch={() => setOnSearch(!onSearch)}
                placeholder="Pesquisar..."
                style={{ width: 200 }}
                value={search}
              />
            </Col>
            {/* <Col><Button onClick={() => Modal.warning({ title: 'Ops...', content: 'Recurso indisponível' })} size="small" type="text" className="site-nav-menu"><SiMicrosoftexcel size={20} /></Button></Col> */}
            {useFilter.length > 0 ? (
              <Col>
                <Popover content="Filtros">
                  <Badge dot={verify}>
                    <Button
                      className="site-nav-menu"
                      onClick={() => setFilt(true)}
                      shape="circle"
                      size="small"
                      type="text"
                    >
                      <IoFilter size={20} />
                    </Button>
                  </Badge>
                </Popover>
              </Col>
            ) : null}
          </Row>
        </Col>
        <Col className="table" span={24}>
          <Row className="table-header">
            {column.map((v, i) =>
              v.hide ? null : (
                <Col
                  className={
                    selectColumn === v.table
                      ? 'table-header-col active'
                      : 'table-header-col'
                  }
                  flex={v.width}
                  key={i}
                  onClick={() => setSelectColumnOrder(v.table, v.sorter)}
                  style={{ minWidth: v.minWidth }}
                >
                  <Typography className="table-header-col-title">
                    {v.title}
                  </Typography>
                  {v.sorter ? (
                    <IoMdArrowDropdown
                      className={
                        order === 'DESC' && selectColumn === v.table
                          ? 'table-header-col-order-down active'
                          : 'table-header-col-order-down'
                      }
                    />
                  ) : null}
                  {v.sorter ? (
                    <IoMdArrowDropup
                      className={
                        order === 'ASC' && selectColumn === v.table
                          ? 'table-header-col-order-up active'
                          : 'table-header-col-order-up'
                      }
                    />
                  ) : null}
                </Col>
              )
            )}
          </Row>
          {load ? (
            <Row className="table-body">
              <Col className="table-body-col" flex="auto">
                <Typography className="table-body-col-nodata">
                  <Spin />
                </Typography>
              </Col>
            </Row>
          ) : data.length > 0 ? (
            data.map((v: any, i) => (
              <Row className="table-body" key={i}>
                {column.map((cv, ci) =>
                  cv.hide ? null : (
                    <Col
                      className="table-body-col"
                      flex={cv.width}
                      key={ci}
                      style={{ minWidth: cv.minWidth, maxWidth: cv.width }}
                    >
                      {cv.render === null ? (
                        <Typography
                          className="table-header-col-title"
                          style={{ textAlign: cv.align }}
                        >
                          {getJsonValue(v, cv.dataIndex)}
                        </Typography>
                      ) : (
                        cv.render(v)
                      )}
                    </Col>
                  )
                )}
              </Row>
            ))
          ) : (
            <Row className="table-body">
              <Col className="table-body-col" flex="auto">
                <Typography className="table-body-col-nodata">
                  Nenhum registro encontrado
                </Typography>
              </Col>
            </Row>
          )}
        </Col>
      </Row>
      <Row justify={'space-between'} style={{ marginTop: 10 }}>
        <InputNumber
          defaultValue={page}
          max={100}
          min={1}
          onBlur={(v: any) =>
            setPage(
              v.target.value > 0 && v.target.value <= 100 ? v.target.value : 10
            )
          }
          size="small"
          style={{ width: 150, textAlign: 'right' }}
          suffix=" / página"
        />
        <Pagination
          current={current}
          defaultCurrent={current}
          onChange={(page, size) => {
            setCurrent(page);
            setPage(size);
          }}
          pageSize={page}
          showSizeChanger={false}
          size="small"
          total={total}
        />
      </Row>
      <Drawer onClose={() => setFilt(false)} open={filt} title="Filtros">
        <Row gutter={[18, 18]}>
          {useFilter &&
            useFilter.map((v, i) => (
              <Col key={i} span={v.type === 'date' ? 12 : 24}>
                <Typography style={{ fontSize: '0.9em' }}>{v.label}</Typography>
                {filtLoad ? (
                  <Skeleton.Input active block />
                ) : v.type === 'search' ? (
                  <SelectSearch //pesquisa as opções
                    change={(t: any) =>
                      setFilterValues({ ...filterValues, [v.name]: t?.value })
                    }
                    labelField={v.labelField}
                    placeholder={v.label}
                    url={v.url}
                    value={filterValues[v as keyof typeof filterValues]}
                  />
                ) : v.type === 'date' ? (
                  <Input
                    onChange={(t: any) =>
                      setFilterValues({
                        ...filterValues,
                        [v.name]: t.target.value,
                      })
                    }
                    type="date"
                    value={filterValues[v as keyof typeof filterValues]}
                  />
                ) : (
                  <Select
                    allowClear
                    onChange={(t: any) =>
                      setFilterValues({ ...filterValues, [v.name]: t })
                    }
                    placeholder={v.label}
                    style={{ width: '100%' }}
                    value={filterValues[v as keyof typeof filterValues]}
                  >
                    {v.items.map((v: any, i: any) => (
                      <Select.Option key={i} value={v.value}>
                        {v.label}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Col>
            ))}
          <Col span={12}>
            <Button block onClick={onClear} type="default">
              Limpar Filtros
            </Button>
          </Col>
          <Col span={12}>
            <Button block onClick={onFilter} type="primary">
              Filtrar
            </Button>
          </Col>
        </Row>
      </Drawer>
    </div>
  );
}

export default Table;
