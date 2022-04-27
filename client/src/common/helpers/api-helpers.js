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

const getInventario = () => instance.get(`/get_inventario`);

const deleteProduct = product => instance.post(`/delete_product`, encodeParams(product));

const updateProducto = products => instance.post(`/update_producto`, encodeParams(products));

const getCategorias = () => instance.get(`/get_categorias`);

const getCuadernillos = () => instance.get(`/get_cuadernillos`, { responseType: 'arraybuffer' });

const getVentas = params => instance.post(`/get_ventas`, encodeParams(params));

const getProductos = find => instance.get(`/get_productos`);

const getRutas = find => instance.get(`/get_rutas`);

const getClientes = find => instance.get(`/get_clientes`);

export {
  getInventario,
  getCategorias,
  updateProducto,
  deleteProduct,
  logIng,
  getCuadernillos,
  getVentas,
  getProductos,
  getRutas,
  getClientes
};