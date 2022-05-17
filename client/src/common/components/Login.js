import React, { useState } from 'react';
import { Form, Input, Button, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actionsCreators } from './../../state/index';

import { logIng } from './../helpers/api-helpers';

const Login = () => {
  const [message, setMessage] = useState({
    message: 'Usuario o contraseña incorrectos.',
    type: 'error',
    showIcon: false
  });
  const dispatch = useDispatch();
  const { setPermissions } = bindActionCreators(actionsCreators, dispatch);

  const navigate = useNavigate();
  const handleClose = () => setMessage({ ...message, showIcon: !message.showIcon});
  const onFinish = (values) => {
    const params = {
      user: values.username,
      password: values.password
    };
    logIng(params)
      .then(data => {
        if (data.data.status) {
          setPermissions(data.data.user[0].permisos);
          sessionStorage.setItem('tkn', data.data.token);
          navigate('/inicio', { replace: true });
        } else {
          setMessage({
            ...message,
            showIcon: true
          });
        }
      })
      .catch(data => {
        setMessage({
          ...message,
          showIcon: true,
          message: 'Intenta mas tarde.'
        });
        console.log(data);
      });
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div className='Login'>
      <Form
        name='basic'
        labelCol={{
          span: 8,
        }}
        wrapperCol={{
          span: 16,
        }}
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete='off'
      >
        <Form.Item
          label='Usuario'
          name='username'
          rules={[
            {
              required: true,
              message: 'Ingresa tu nombre de usuario!',
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label='Contraseña'
          name='password'
          rules={[
            {
              required: true,
              message: 'Ingresa tu contraseña!',
            },
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 16,
          }}
        >
          <Button type='primary' htmlType='submit'>
            Ingresar
          </Button>
        </Form.Item>
        { message.showIcon && <Alert message={message.message} type={message.type}  closable afterClose={handleClose} />}
      </Form>
      </div>
  );
};

export default Login;