// react libraries
import { useEffect, useState } from "react";
import { Button, Card, Checkbox, Col, Collapse, Input, Modal, Row, Typography, message } from "antd";
import parse from "html-react-parser";

// components
import CardItem from "../../../components/CardItem";
import SelectSearch from "../../../components/SelectSearch";
import LoadItem from "../../../components/LoadItem";

// services
import { GET_API, POST_API, POST_CATCH, verifyConfig } from "../../../services";

const Region = () => {
  
  // state
  const [regioes, setRegioes] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [cidades, setCidades] = useState<any[]>([]);
  const [loadCheck, setLoadCheck] = useState<boolean>(false);
  const [loadSend, setLoadSend] = useState<boolean>(false);
  const [loadData, setLoadData] = useState<boolean>(true);
  const [modal, setModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [regioesSelect, setRegioesSelect] = useState<any>({
    "Acre": [], "Alagoas": [], "Amazonas": [], "Amapá": [], "Bahia": [], "Ceará": [], "Distrito Federal": [], "Espírito Santo": [], "Goiás": [],
    "Maranhão": [], "Minas Gerais": [], "Mato Grosso do Sul": [], "Mato Grosso": [], "Pará": [], "Paraíba": [], "Pernambuco": [], "Piauí": [],
    "Paraná": [], "Rio de Janeiro": [], "Rio Grande do Norte": [], "Rondônia": [], "Roraima": [], "Rio Grande do Sul": [], "Santa Catarina": [],
    "Sergipe": [], "São Paulo": [], "Tocantins": [],
  });

  const [searchFilter, setSearchFilter] = useState<string>("");
  const [stateFilter, setStateFilter] = useState<any>(null);

  // CARREGA DADOS
  const load = () => {
    setLoadData(true)
    GET_API("/me").then((rs) => rs.json()).then((res) => {
      GET_API("/city_user/" + res.data.id).then((rs) => rs.json()).then((res) => {
        setRegioes(res.data);
        setRegioesSelect({ ...regioesSelect, ...res.select });
      }).catch(POST_CATCH).finally(() => setLoadData(false));
    }).catch(POST_CATCH);
  };

  const onRender = () => {

    if (searchFilter.length < 3 && !stateFilter) {
      setCidades([]);
      return null;
    }

    setLoading(true);
    let url = stateFilter
      ? `/city_search?search=${searchFilter}&state_id=${stateFilter}`
      : `/city_search?search=${searchFilter}`;

    GET_API(url).then((response) => {
      response.json().then((res) => {
        setCidades(res.data);
        setSummary(res.summary);
      });
    }).catch(POST_CATCH).finally(() => setLoading(false));

  };

  const onModal = () => setModal(!modal);

  const onSelectOne = (item: any, value: any) => {
    setLoadCheck(true);
    if (value) regioesSelect[item.state_only_name].push(item.id);
    else regioesSelect[item.state_only_name].splice( regioesSelect[item.state_only_name].indexOf(item.id), 1 );
    setTimeout(() => {
      setLoadCheck(false);
    }, 500);
  };

  const onSelectAll = (item: any, value: any) => {
    var temp: any = cidades.filter(function (obj) {
      return obj.state === item.state;
    })[0];
    setLoadCheck(true);
    if (value) temp.list.map((v: any) => regioesSelect[item.state].includes(v.id) ? null : regioesSelect[item.state].push(v.id) );
    else regioesSelect[item.state] = [];
    setTimeout(() => {
      setLoadCheck(false);
    }, 500);
  };

  const onSend = () => {
    setLoadSend(true);
    POST_API("/city_user", { data: JSON.stringify(regioesSelect) }).then((rs) => {
      if (rs.ok) {
        message.success("Salvo com sucesso!");
        setModal(false)
        load();
      } else Modal.warning({ title: "Algo deu errado", content: rs.statusText });
    }).catch(POST_CATCH).finally(() => setLoadSend(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <CardItem title="Cidades de atuação">
      { loadData ? <LoadItem type="alt" /> : regioes?.length > 0 ? (
        <Collapse size="small">
          {regioes.map((v: any, i: any) => (
            <Collapse.Panel header={v.label} key={v.key}>
              {parse(v.children as string)}
            </Collapse.Panel>
          ))}
        </Collapse>
      ) : (
        <Typography>Nenhuma cidade cadastrada</Typography>
      )}
      { verifyConfig(['conf.cdd.edit']) ? (
        <Button onClick={onModal} type="primary" style={{ marginTop: "1em" }}>
          Adicionar Região
        </Button>
      ) : null}
      <Modal title="Adicionar Cidade" open={modal} onCancel={onModal} cancelText="Fechar" okText="Salvar" maskClosable={false} onOk={onSend} confirmLoading={loadSend}>
        <Row gutter={[8, 8]} style={{ flexWrap: "nowrap" }}>
          <Col flex={"10em"}>
            <SelectSearch
              effect={""}
              placeholder="Estado"
              url="/state"
              value={stateFilter}
              change={(v: any) => setStateFilter(v?.value)}
              labelField={["acronym", "name"]}
            />
          </Col>
          <Col flex={"auto"}>
            <Input.Search
              placeholder="Pesquisar cidade..."
              onSearch={onRender}
              style={{ marginBottom: "0.6em" }}
              value={searchFilter}
              onChange={(v: any) => setSearchFilter(v.target.value)}
              loading={loading}
            />
          </Col>
        </Row>
        <Row gutter={[8, 8]}>
          {cidades?.length > 0 ? (
            cidades.map((v: any, i: any) => (
              <Col span={24} key={i}>
                <Card size="small" hoverable title={
                  loadCheck ? (
                    <Checkbox 
                      checked={ regioesSelect[v.state].length === Number(summary[v.state].QTDE) }
                      indeterminate={ regioesSelect[v.state].length > 0 && regioesSelect[v.state].length !== Number(summary[v.state].QTDE) }
                      onClick={(value: any) => onSelectAll(v, value.target.checked) }
                    >
                      {v.state}
                    </Checkbox>
                  ) : (
                    <Checkbox
                      checked={ regioesSelect[v.state].length === Number(summary[v.state].QTDE) }
                      indeterminate={ regioesSelect[v.state].length > 0 && regioesSelect[v.state].length !==   Number(summary[v.state].QTDE) }
                      onClick={(value: any) => onSelectAll(v, value.target.checked) }
                    >
                      {v.state}
                    </Checkbox>
                  )
                }>
                  <Row gutter={[4, 4]}>
                    {v.list.map((v1: any, i1: any) => (
                      <Col key={i1}>
                        {loadCheck ? (
                          <Checkbox checked={regioesSelect[v.state].includes(v1.id)} onClick={(value: any) => onSelectOne(v1, value.target.checked) }>
                            {v1.NAME}
                          </Checkbox>
                        ) : (
                          <Checkbox checked={regioesSelect[v.state].includes(v1.id)} onClick={(value: any) => onSelectOne(v1, value.target.checked) }>
                            {v1.NAME}
                          </Checkbox>
                        )}
                      </Col>
                    ))}
                  </Row>
                </Card>
              </Col>
            ))
          ) : (
            <Typography>Nenhuma cidade encontrada</Typography>
          )}
        </Row>
      </Modal>
    </CardItem>
  );
};

export default Region;
