import React, { useState } from 'react';
import {
  Form,
  Button,
  Upload,
  Alert
} from 'antd';

import Container from './Container';

import { saveFile } from './../helpers/helpers';
import { getCuadernillos, baseURL, headers } from './../helpers/api-helpers';


import { UploadOutlined } from '@ant-design/icons';
const formItemLayout = {
  labelCol: {
    span: 12,
  },
  wrapperCol: {
    span: 12,
  },
};

const Cuadernillos = () => {
  const [ message, setMessage ] = useState({
    message: 'Producto actualizado',
    type: 'success',
    showIcon: false
  });
  const [ form ] = Form.useForm();
  const onFinish = () => {
    getCuadernillos()
      .then(response => {
        const [ __first, filename, __third ] = response.headers['content-disposition'].split('"');
        saveFile(response.data, response.headers['content-type'], filename);
        setMessage({
          message: `Cuadernillo generado con éxito.`,
          type: 'success',
          showIcon: true
        })
      })
      .catch(() => setMessage({
        message: `Error al generar el cuadernillo intenta mas tarde, si el error continua comunicate con el administrador.`,
        type: 'error',
        showIcon: true
      }));
      form.resetFields();
  };
  const onChange = (info) => {
    console.log(info)
    if (info.file.status === 'done') {
      setMessage({
        message: `El archivo ${info.file.name} se cargó correctamente.`,
        type: 'success',
        showIcon: true
      });
    } else if (info.file.status === 'error') {
      setMessage({
        message: `Error al cargar el archivo ${info.file.name}.`,
        type: 'error',
        showIcon: true
      });
    }
  };
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };
  const handleClose = () => setMessage({ ...message, showIcon: !message.showIcon});

  return (
    <Container extraClass={'Inicio'}>
      { message.showIcon && <Alert message={message.message} type={message.type}  closable afterClose={handleClose} />}
      <div className='Cuadernillos'>
        <Form
          form={form}
          name="validate_other"
          {...formItemLayout}
          onFinish={onFinish}
        >
          <Form.Item
            name="productos"
            label="Ingrese PRODUCTOS"
            valuePropName="fileList"
            getValueFromEvent={e => normFile(e, 'productos')}
            extra="Es el catalogo de productos."
            rules={[
              {
                required: true,
                message: 'El archivo de productos es necesario.',
              }
            ]}
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
              beforeUpload={file => {
                const isCSV = file.type === 'text/csv';
                if (!isCSV) {
                  setMessage({
                    message: `El archivo ${file.name} no cuenta con el formato correcto (.csv).`,
                    type: 'error',
                    showIcon: true
                  });
                }
                return isCSV || Upload.LIST_IGNORE;
              }}
              >
              <Button icon={<UploadOutlined />}>Click para subir</Button>
            </Upload>
          </Form.Item>
          <Form.Item
            name="venta"
            label="Ingrese VENTA"
            valuePropName="fileList"
            getValueFromEvent={e => normFile(e, 'venta')}
            extra="Es la venta del dia."
            rules={[
              {
                required: true,
                message: 'El archivo de venta es necesario.',
              }
            ]}
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
              beforeUpload={file => {
                const isCSV = file.type === 'text/csv';
                if (!isCSV) {
                  setMessage({
                    message: `El archivo ${file.name} no cuenta con el formato correcto (.csv).`,
                    type: 'error',
                    showIcon: true
                  });
                }
                return isCSV || Upload.LIST_IGNORE;
              }}
            >
              <Button icon={<UploadOutlined />}>Click para subir</Button>
            </Upload>
          </Form.Item>
          <Form.Item
            wrapperCol={{
              span: 16,
              offset: 6
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