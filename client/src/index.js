import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createBrowserHistory } from 'history';


const history = createBrowserHistory();

import Inicio from './common/components/Inicio';
import Login from './common/components/Login';
import Inventario from './common/components/Inventario';
import Ventas from './common/components/Ventas';
import Comprar from './common/components/Comprar';
import Cuadernillos from './common/components/Cuadernillos';

require('./common/stylesheets/general.scss');

ReactDOM.render((
  <Router history={history} >
    <Routes>
      <Route path='/inicio' element={<Inicio />} />
      <Route path='/' element={<Login />} />
      <Route path='/cuadernillos' element={<Cuadernillos />} />
      <Route path='/login' element={<Login />} />
      <Route path='/inventario' element={<Inventario />} />
      <Route path='/ventas' element={<Ventas />} />
      <Route path='/comprar' element={<Comprar />} />
    </Routes>
  </Router>
), document.getElementById('app'));
