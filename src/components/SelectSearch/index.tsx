// BIBLIOTECAS REACT

import { Select, Spin } from 'antd';
import { useEffect, useState } from 'react';

// SERVIÇOS
import { GET_API, getJsonValue, POST_CATCH } from '../../services';

// INTERFACE
interface SelectSearchInterface {
  url: string;
  change: any;
  value?: string;
  placeholder: string;
  disabled?: boolean;
  effect?: any;
  labelField?: string | Array<string>;
  valueField?: string;
  filter?: string;
}

function transformArray(data: any, valueField: any, labelFields: any) {
  return data.map((item: any) => {
    const value = item[valueField].toString();
    let label;

    if (Array.isArray(labelFields)) {
      label = `${getJsonValue(item, labelFields[0])}
       - ${getJsonValue(item, labelFields[1])}`;
    } else {
      label = item[labelFields];
    }

    return {
      value,
      label,
    };
  });
}

const SelectSearch = ({
  url,
  change,
  value,
  placeholder,
  disabled = false,
  effect = '',
  labelField,
  valueField = 'id',
  filter = '',
}: SelectSearchInterface) => {
  // ESTADOS DO COMPONENTE
  const [load, setLoad] = useState(false);
  const [options, setOptions] = useState([]);
  // BUSCAR DADOS
  const onSearch = (search: string) => {
    setLoad(true);
    setOptions([]);
    GET_API(`${url}?search=${search}${filter}`)
      .then((response) => {
        if (!response.ok) {
          POST_CATCH();
        }
        response.json().then((data) => {
          console.log(data.data, valueField, labelField);
          setOptions(
            data.data ? transformArray(data.data, valueField, labelField) : []
          );
        });
      })
      .finally(() => setLoad(false));
  };

  //DEFAULT VALUE
  useEffect(() => {
    if (effect !== null) {
      setLoad(true);
      // determinar a url de consulta por ID ou por search e filters (usado para buscar por cidade)
      if (effect.ID != undefined) {
        url += `?id=${effect.ID}`;
      }

      if (effect.search != undefined) {
        url = `${url}?search=${effect.search}`;
      }

      if (effect.filters != undefined) {
        Object.entries(effect.filters).forEach(([key, value]) => {
          if (value != undefined && value != null) {
            url += `&${key}=${value}`;
          }
        });
      }

      GET_API(url)
        .then((rs) => rs.json())
        .then((res) => {
          const arrayValues = res.data
            ? transformArray(res.data, 'id', labelField)
            : [];
          setOptions(arrayValues);
          if (arrayValues?.[0]) {
            change(arrayValues?.[0], []);
          }
        })
        .catch(POST_CATCH)
        .finally(() => setLoad(false));
    }
  }, [effect]);

  return (
    <Select
      allowClear
      disabled={disabled}
      filterOption={false}
      labelInValue
      notFoundContent={load ? <Spin size="small" /> : null}
      onChange={change}
      onFocus={() => onSearch('')}
      onSearch={onSearch}
      options={options}
      placeholder={placeholder}
      showSearch={true}
      style={{ width: '100%' }}
      value={value}
    />
  );
};

export default SelectSearch;
