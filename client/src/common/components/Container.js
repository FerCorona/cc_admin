import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { useSelector } from 'react-redux';
const { SubMenu } = Menu;

const { Header, Content, Footer } = Layout;

require('antd/dist/antd.css');

const modulosList = {
  inicio: {
    name: 'Inicio',
    to: '/inicio'
  },
  cuadernillos: {
    name: 'Cuadernillos',
    to: '/cuadernillos'
  },
  inventario: {
    name: 'Inventario',
    to: '/inventario'
  },
  ventas: {
    name: 'Ventas',
    subMenu: [
      {
        name: 'Ventas por producto',
        to: '/ventas_producto'
      },
      {
        name: 'Ventas por cliente',
        to: '/ventas_cliente'
      },
      {
        name: 'Ventas por categoria',
        to: '/ventas_categoria'
      }
    ]
  },
  usuarios: {
    name: 'Usuarios',
    to: '/usuarios'
  },
  salir: {
    name: 'Salir',
    to: '/login'
  }
}

const Container = ({ children, extraClass }) => {
  const navigate = useNavigate();
  const user = useSelector(state => state.user);
  const MODULOS = [];
  user.permissions.map(permission => MODULOS.push(modulosList[permission]));
  MODULOS.push(modulosList.salir)
  return(
    <Layout className='layout'>
        <Header>
          <div className='logo' />
          <Menu theme='dark' mode='horizontal'>
            {MODULOS.map((modulo, index_general) => {
              if (modulo.subMenu) {
                return (
                  <SubMenu key={index_general} title={modulo.name}>
                    {modulo.subMenu.map((subModulo, index_sub_menu) => (
                      <Menu.Item key={`${index_sub_menu}-sub-menu`} onClick={() => navigate(subModulo.to, { replace: true })}>{subModulo.name}</Menu.Item>
                    ))}
                  </SubMenu>
                );
              }
              if (modulo.name === 'Salir') {
                return <Menu.Item
                  key={`${index_general}-menu`}
                  onClick={() => {
                    sessionStorage.clear();
                    navigate(modulo.to, { replace: true });
                }}>{modulo.name}</Menu.Item>
              }
              return <Menu.Item key={`${index_general}-menu`} onClick={() => navigate(modulo.to, { replace: true })}>{modulo.name}</Menu.Item>;
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