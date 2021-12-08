const axios = require('axios');

import { encodeParams } from './helpers';

const getTkn = () => localStorage.getItem('tkn');

const instance = axios.create({
  baseURL: '/api',
  headers: {'Authorization': `Bearer ${getTkn()}`}
});

const getProducts = () => instance.get(`/get_productos`);

const getCategorias = () => instance.get(`/get_categorias`);

const updateProducto = products => instance.post(`/update_producto`, encodeParams(products));

const logIng = user => instance.post(`/login`, encodeParams(user));

const isAuth = user => instance.post(`/auth`);

export {
  isAuth,
  getProducts,
  getCategorias,
  updateProducto,
  logIng
};