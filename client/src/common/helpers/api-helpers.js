const axios = require('axios');

import { encodeParams } from './helpers';

const TKN = sessionStorage.getItem('tkn');

export const baseURL = '/api';

export const headers = { 'Authorization': `Bearer ${TKN} `};

const instance = axios.create({
  baseURL,
  headers
});

instance.interceptors.response.use(response => {
  return response;
}, error => {
  const status = error.response?.status || 500;
  if (status === 401) {
    window.location = window.location.protocol + '//' + window.location.host + '/login'
  } else {
    return Promise.reject(error);
  }
 return error;
});

const logIng = user => instance.post(`/login`, encodeParams(user));

const getInventario = () => instance.get(`/get_inventario`);

const deleteProduct = product => instance.post(`/delete_product`, encodeParams(product));

const updateProducto = products => instance.post(`/update_producto`, encodeParams(products));

const getCategorias = () => instance.get(`/get_categorias`);

const getCuadernillos = () => instance.get(`/get_cuadernillos`, { responseType: 'arraybuffer' });

const getVentasProducto = params => instance.post(`/get_ventas_producto`, encodeParams(params));

const getVentasCliente = params => instance.post(`/get_ventas_cliente`, encodeParams(params));

const getProductos = find => instance.get(`/get_productos`);

const getRutas = find => instance.get(`/get_rutas`);

const getClientes = find => instance.get(`/get_clientes`);

const getUsuarios = () => instance.get(`/get_usuarios`);

const updateUsuarios = params => instance.post(`/update_usuario`, encodeParams(params));

const addUsuarios = params => instance.post(`/add_usuario`, encodeParams(params));

const deleteUsuario = params => instance.post(`/delete_user`, encodeParams(params));

const getMetaMensual = params => instance.post(`/get_meta_mensual`, encodeParams(params));

const updateMetaMensual = params => instance.post(`/update_meta_mensual`, encodeParams(params));

export {
  getInventario,
  getCategorias,
  updateProducto,
  deleteProduct,
  logIng,
  getCuadernillos,
  getVentasProducto,
  getProductos,
  getRutas,
  getClientes,
  getVentasCliente,
  getUsuarios,
  updateUsuarios,
  addUsuarios,
  deleteUsuario,
  getMetaMensual,
  updateMetaMensual
};