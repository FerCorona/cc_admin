import React, { useState, useEffect } from 'react';
import {
  Form,
  Button,
  Upload
} from 'antd';

import Container from './Container';

import { getCuadernillos, baseURL, headers } from './../helpers/api-helpers';


import { UploadOutlined } from '@ant-design/icons';
const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 14,
  },
};

const normFile = (e) => {
  console.log('Upload event:', e);

  if (Array.isArray(e)) {
    return e;
  }

  return e && e.fileList;
};

const Cuadernillos = () => {
  const onFinish = () => {
    getCuadernillos()
      .then(data => console.log(data));
  };
  const onChange = (info) => {
    if (info.file.status !== 'uploading') {
    }
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  return (
    <Container extraClass={'Inicio'}>
      <div className='Cuadernillos'>
        <Form
          name="validate_other"
          {...formItemLayout}
          onFinish={onFinish}
        >
          <Form.Item
            name="productos"
            label="Ingrese PRODUCTOS"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            extra="Es el catalogo de productos"
          >
            <Upload
              name='productos'
              action={`${baseURL}/upload_file`}
              listType="picture"
              headers={{
                ...headers
              }}
              onChange={onChange}
              maxCount={1}
              >
              <Button icon={<UploadOutlined />}>Click para subir</Button>
            </Upload>
          </Form.Item>
          <Form.Item
            name="venta"
            label="Ingrese VENTA"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            extra="Es la venta del dia"
          >
            <Upload
              name='venta'
              action={`${baseURL}/upload_file`}
              listType="picture"
              headers={{
                ...headers
              }}
              onChange={onChange}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Click para subir</Button>
            </Upload>
          </Form.Item>
          <Form.Item
            wrapperCol={{
              span: 12,
              offset: 8,
            }}
          >
            <Button type="primary" htmlType="submit">
              Hacer Cuadernillo
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Container>
  );
};

export default Cuadernillos;