// BIBLIOTECAS REACT
import { Modal } from 'antd';

var PATH = '';
export const setPath = (value: string) => {
  PATH = value;
};
export const getPath = () => {
  return PATH;
};

export const formatNumber = (value: number) => {
  return Number(Number(value).toFixed(2)).toLocaleString('pt-br');
};

export const IMAGE_NOT_FOUND =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4va2p2cHzlh7odpsjpGSAf7-ELPOzDzZ8iQ&s';

export const URL_API = import.meta.env.VITE_URL_API + '/api';
export const UPLOAD_API = import.meta.env.VITE_URL_API + '/api/upload';

export const CLASS_INPUT =
  'ant-input css-1898rw2 css-dev-only-do-not-override-1898rw2 ant-input-outlined';
export const CLASS_INPUT_LARGE =
  'ant-input ant-input-lg css-1898rw2 css-dev-only-do-not-override-1898rw2 ant-input-outlined';

export const POST_CATCH = () => {
  Modal.error({
    title: 'Erro crítico!',
    content:
      'Não foi possível estabelecer uma conexão com o servidor. Por favor, entre em contato com o suporte!',
  });
};

export const BLOCK_FORM_ENTER = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault();
  }
};

export const getUPLOADAPI = () => {
  return UPLOAD_API;
};

export const setToken = (value: string) => {
  localStorage.setItem('TOKEN', value);
};

export const getToken = () => {
  return localStorage.getItem('TOKEN');
};

export const setProfile = (value: string) => {
  localStorage.setItem('PROFILE', value);
};

export const getProfile = () => {
  return localStorage.getItem('PROFILE') ?? '0';
};

export const getProfileID = () => {
  return JSON.parse(getProfile()).id;
};

export const getProfileOwner = () => {
  return JSON.parse(getProfile()).owner;
};

export const getProfileName = () => {
  return JSON.parse(getProfile()).label;
};

export const getProfileType = (): any => {
  return JSON.parse(getProfile()).type;
};

export const delToken = () => {
  localStorage.removeItem('TOKEN');
};

export const setConfig = (value: string) => {
  localStorage.setItem('CONFIG', value);
};

export const getConfig = (): any => {
  return JSON.parse(localStorage.getItem('CONFIG') || '{}');
};

export const delConfig = () => {
  localStorage.removeItem('CONFIG');
};

export const POST_API = (
  url: string,
  data: any,
  ID: string | number | null = null
) => {
  function createFormData() {
    const form = new FormData();

    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined) form.append(key, data[key]);
    });

    return form;
  }

  if (ID == null) {
    return fetch(URL_API + url, {
      method: 'post',
      body: createFormData(),
      headers: {
        Authorization: 'Bearer ' + getToken(),
        Accept: 'application/json',
        Profile: getProfileID(),
      },
    });
  }
  return fetch(`${URL_API}${url}/${ID}?_method=PUT`, {
    method: 'post',
    body: createFormData(),
    headers: {
      Authorization: 'Bearer ' + getToken(),
      Accept: 'application/json',
      Profile: getProfileID(),
    },
  });
};

export const GET_API = (url: string) => {
  return fetch(URL_API + url, {
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + getToken(),
      Accept: 'application/json',
      Profile: getProfileID(),
    },
  });
};

export const DELETE_API = (url: string) => {
  return fetch(`${URL_API}${url}`, {
    method: 'delete',
    headers: {
      Authorization: 'Bearer ' + getToken(),
      Accept: 'application/json',
      Profile: getProfileID(),
    },
  });
};

export const COORDINATES = (address: string) => {
  var res = fetch(`https://photon.komoot.io/api/?lang=en&limit=5&q=${address}`);

  res
    .then((rs) => rs.json())
    .then((result) => {
      console.log(result);
    });
};

// VALIDA PERMISSAO
export const verifyConfig = (value: string[] | boolean[]) => {
  try {
    if (!Array.isArray(value)) value = [value, value];
    for (const v of value) {
      if (v === true) {
        return true;
      }
      if (getConfig().includes(v)) {
        return true;
      }
    }
    return false;
  } catch (error) {
    return false;
  }
};

export const getJsonValue = (data: any, param: any) => {
  try {
    const paramAsString: string = String(param); // Aqui estamos forçando a conversão para string

    const keys = paramAsString.split('.');
    let value = data;

    for (const key of keys) {
      value = value[key];
      if (value === undefined) {
        return; // Retorna undefined se a chave não existe
      }
    }

    return value;
  } catch (error) {
    return '';
  }
};

export function MaskCNPJ(event: any): any {
  var text = event.target.value;

  text = text.replace(/\D/g, '');
  text = text.replace(/(\d{2})(\d)/, '$1.$2');
  text = text.replace(/(\d{3})(\d)/, '$1.$2');
  text = text.replace(/(\d{3})(\d)/, '$1/$2');
  text = text.replace(/(\d{4})(\d{1,2})$/, '$1-$2');

  event.target.value = text;
}

export function MaskCPF(event: any): any {
  var text = event.target.value;

  text = text.replace(/\D/g, '');
  text = text.replace(/(\d{3})(\d)/, '$1.$2');
  text = text.replace(/(\d{3})(\d)/, '$1.$2');
  text = text.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

  event.target.value = text;
}

export function MaskCEP(event: any): any {
  var text = event.target.value;

  text = text.replace(/\D/g, '');
  text = text.replace(/(\d{5})(\d)/, '$1-$2');

  event.target.value = text;
}

export function MaskCodeResiduos(event: any): any {
  var text = event.target.value;

  text = text.replace(/\D/g, '');
  text = text.replace(/(\d{2})(\d)/, '$1 $2');
  text = text.replace(/(\d{2})(\d)/, '$1 $2');
  text = text.replace(/(\d{2})(\d)/, '$1 $2');

  event.target.value = text;
}

// PALETA DE COR
export const cor1 = '#0a3e35';
export const cor2 = '#6d9755';
export const cor3 = '#0c2c30';
export const cor4 = '#0c3f45';
export const cor5 = '#364446';

// INTERFACE
export interface PageDefaultProps {
  type: 'list' | 'trash' | 'add' | 'edit';
  path: string;
  permission: string;
}

export const cleanData = (res: any) => {
  const newData = Object.keys(res).reduce((acc: any, key: any) => {
    acc[key] = res[key] === null || res[key] === undefined ? '' : res[key];
    return acc;
  }, {});
  return newData;
};
