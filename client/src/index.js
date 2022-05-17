import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createBrowserHistory } from 'history';


const history = createBrowserHistory();

import Inicio from './common/components/Inicio';
import Login from './common/components/Login';
import Inventario from './common/components/Inventario';
import VentasProducto from './common/components/VentasProducto';
import VentasCategoria from './common/components/VentasCategoria';
import VentasCliente from './common/components/VentasCliente';
import Cuadernillos from './common/components/Cuadernillos';
import Usuarios from './common/components/Usuarios';


import { store } from './state/store';

require('./common/stylesheets/general.scss');

ReactDOM.render((
  <Provider store={store}>
    <Router history={history} >
      <Routes>
        <Route path='/inicio' element={<Inicio />} />
        <Route path='/' element={<Login />} />
        <Route path='/cuadernillos' element={<Cuadernillos />} />
        <Route path='/login' element={<Login />} />
        <Route path='/inventario' element={<Inventario />} />
        <Route path='/ventas_producto' element={<VentasProducto />} />
        <Route path='/ventas_categoria' element={<VentasCategoria />} />
        <Route path='/ventas_cliente' element={<VentasCliente />} />
        <Route path='/usuarios' element={<Usuarios />} />
      </Routes>
    </Router>
    </Provider>
), document.getElementById('app'));
