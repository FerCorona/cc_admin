const axios = require('axios');

import { encodeParams } from './helpers';

const getTkn = () => localStorage.getItem('tkn');

export const baseURL = '/api';

export const headers = { 'Authorization': `Bearer ${getTkn()} `};

const instance = axios.create({
  baseURL,
  headers
});

const logIng = user => instance.post(`/login`, encodeParams(user));

const getProducts = () => instance.get(`/get_productos`);

const deleteProduct = product => instance.post(`/delete_product`, encodeParams(product));

const updateProducto = products => instance.post(`/update_producto`, encodeParams(products));

const getCategorias = () => instance.get(`/get_categorias`);

const getCuadernillos = () => instance.get(`/get_cuadernillos`);

export {
  getProducts,
  getCategorias,
  updateProducto,
  deleteProduct,
  logIng,
  getCuadernillos
};