// react libraries
import { useEffect, useState } from "react";
import { Card, Checkbox, Col, Row, Typography } from "antd";

// interface
interface TeamFormInterface {
  PERMISSIONS:any,
  per: string[],
  setPer: Function
}

const TeamFormPermission = ({ PERMISSIONS, per, setPer } : TeamFormInterface ) => {

  // state
  const [ perLoad, setPerLoad ] = useState<boolean>(false);

  // select permission
  const onSelect = (value:string) => {

    var temp = per;

    if (temp.includes(value)) temp.splice(temp.indexOf(value), 1)
    else temp.push(value)

    setPer(temp)
    setPerLoad(!perLoad)

  }

  // select line permission
  const onSelectLine = (event:any, index:number) => {

    var temp = per;
    const list = [ "list", "add", "edit", "del", "rec", "trash" ];

    if (event.target.checked) {
      list.forEach((item:string) => {
        if (!temp.includes(`${PERMISSIONS[index].key}.${item}`) && PERMISSIONS[index].ignore.indexOf(`${item}`) === -1) temp.push(`${PERMISSIONS[index].key}.${item}`)
      })
    } else {
      list.forEach((item:string) => {
        if (temp.indexOf(`${PERMISSIONS[index].key}.${item}`) !== -1) temp.splice(temp.indexOf(`${PERMISSIONS[index].key}.${item}`), 1)
      })
    }

    setPer(temp)
    setPerLoad(!perLoad)

  }

  // reload checkbox
  const MyCheckbox = ({permission, name}:{permission:string, name:string}) => {
    return perLoad ? <Checkbox checked={per.includes(permission)} onChange={() => onSelect(permission)}>{name}</Checkbox> : <Checkbox checked={per.includes(permission)} onChange={() => onSelect(permission)}>{name}</Checkbox>
  }

  useEffect(() => {
    setPerLoad(!perLoad)
  }, [per])

  return (
    <Card style={{overflowY: 'auto'}} className="permission-table" size="small" title={
      <Row style={{flexWrap: 'nowrap'}}>
        <Typography>Permissões</Typography>
      </Row>
    }>
      { PERMISSIONS.map((v:any, i:any) => (
        <Row key={i} style={{flexWrap: 'nowrap'}}>
          <Col flex={'auto'} style={{minWidth: '180px'}}>
            <Typography><Checkbox checked={ per.filter(item => item.includes(`${v.key}`)).length === 6 - v.ignore.length } indeterminate={ per.filter(item => item.includes(`${v.key}`)).length > 0 && per.filter(item => item.includes(`${v.key}`)).length < 6 - v.ignore.length } onChange={(e) => onSelectLine(e, i)}>{v.label}</Checkbox></Typography>          </Col>
          <Col flex={'100px'}>
            { v.ignore.indexOf('list') === -1 ? <MyCheckbox permission={`${v.key}.list`} name="Lista" /> : '-' } 
          </Col>
          <Col flex={'100px'}>
            { v.ignore.indexOf('add') === -1 ? <MyCheckbox permission={`${v.key}.add`} name="Novo" />  : '-' } 
          </Col>
          <Col flex={'100px'}>
            { v.ignore.indexOf('edit') === -1 ? <MyCheckbox permission={`${v.key}.edit`} name="Editar" />  : '-' } 
          </Col>
          <Col flex={'100px'}>
            { v.ignore.indexOf('del') === -1 ? <MyCheckbox permission={`${v.key}.del`} name="Deletar" />  : '-' } 
          </Col>
          <Col flex={'100px'}>
            { v.ignore.indexOf('trash') === -1 ? <MyCheckbox permission={`${v.key}.trash`} name="Lixeira" />  : '-' } 
          </Col>
          <Col flex={'100px'}>
            { v.ignore.indexOf('rec') === -1 ? <MyCheckbox permission={`${v.key}.rec`} name="Recuperar" />  : '-' } 
          </Col>
        </Row>
      )) }
    </Card>
  );
};

export default TeamFormPermission;
