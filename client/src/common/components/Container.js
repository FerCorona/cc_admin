import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';

const { Header, Content, Footer } = Layout;

require('antd/dist/antd.css');

const MODULOS = [
  {
    name: 'Inicio',
    to: '/inicio'
  },
  {
    name: 'Cuadernillos',
    to: '/cuadernillos'
  },
  {
    name: 'Inventario',
    to: '/inventario'
  },
  {
    name: 'Ventas',
    to: '/ventas'
  },
  {
    name: 'Comprar',
    to: '/comprar'
  },
  {
    name: 'Refrigeradores',
    to: '/refrigeradores'
  }
];

const Container = ({ children, extraClass }) => {
  const navigate = useNavigate();
  return(
    <Layout className='layout'>
        <Header>
          <div className='logo' />
          <Menu theme='dark' mode='horizontal'>
            {MODULOS.map((modulo, index) => {
              return <Menu.Item key={`${index}-menu`} onClick={() => navigate(modulo.to, { replace: true })}>{modulo.name}</Menu.Item>;
            })}
          </Menu>
        </Header>
        <Content style={{ padding: '0 50px' }}>
          <div className={`site-layout-content ${extraClass}`}>
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>Fernando Garcia Corona ©2021 All rights reserved.</Footer>
      </Layout>
  );
};

Container.defaultProps = {
  extraClass: ''
};

export default Container;