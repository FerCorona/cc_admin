import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

import { logIng } from './../helpers/api-helpers';

const Login = () => {
  const navigate = useNavigate();
  const onFinish = (values) => {
    const params = {
      user: values.username,
      password: values.password
    };
    logIng(params)
      .then(data => {
        if (data.data.status) {
          localStorage.setItem('nombre_usuario', JSON.stringify(data.data.user));
          localStorage.setItem('tkn', data.data.token);
          navigate('/inicio', { replace: true });
        }
      })
      .catch(data => console.log(data));
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
      </Form>
      </div>
  );
};

export default Login;