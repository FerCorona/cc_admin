import React, { useState, useEffect } from 'react';
import {
  Table, Input, Tag,
  Popconfirm, Form, Space, Button,
  Typography, Divider, Alert, Skeleton,
  Modal, Select
} from 'antd';

import { getUsuarios, updateUsuarios, addUsuarios, deleteUsuario } from './../helpers/api-helpers';
import { permisos } from './../helpers/constants';
permisos

import Container from './Container';

import { UserAddOutlined } from '@ant-design/icons';

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const input = title !== 'Permisos' ? (
    <Form.Item
      name={dataIndex}
      style={{
        margin: 0,
      }}
      rules={[
        {
          required: true,
          message: `Ingrese  ${title}!`,
        },
      ]}
      >
          <Input />
      </Form.Item>
  ) : (
    <Form.Item
      name='permisos'
      label='Permisos'
      rules={[
        {
          required: true,
          message: 'Por favor selecciona los permisos para el usuarios!',
          type: 'array',
        },
      ]}
    >
      <Select mode='multiple' placeholder='Selecciona los permisos para el usuario'>
        {
          Object.keys(permisos).map(permiso => (
            <Option value={permiso}>{permisos[permiso]}</Option>
          ))
        }
      </Select>
    </Form.Item>
  );
  return (
    <td {...restProps}>
      {editing ? input : children}
    </td>
  );
};

const Usuarios = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [message, setMessage] = useState({
    message: 'Producto actualizado',
    type: 'success',
    showIcon: false
  });
  const [editingKey, setEditingKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchData = () => {
    getUsuarios()
    .then(productos => {
      setData(productos.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isEditing = (record) => record.id === editingKey;

  const edit = (record) => {
    form.setFieldsValue({
      ...record,
    });
    setEditingKey(record.id);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const eliminar = (nombre_usuario) => {
    setLoading(true);
    deleteUsuario({ nombre_usuario })
      .then(res => {
        if (res.data.status) {
          setMessage({
            message: 'Se elimino el usuario',
            type: 'success',
            showIcon: true
          });
          setLoading(false);
        } else {
          setMessage({
            message: 'Error al borrar usuario',
            type: 'error',
            showIcon: true
          });
        }
        setLoading(false);
        fetchData();
      })
      .catch(e => {
        console.log(e);
        setMessage({
          message: 'Intenta mas tarde',
          type: 'error',
          showIcon: true
         });
        setLoading(false);
      });
  };

  const save = async (key) => {
    setLoading(true);
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.id);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setData(newData);
        setEditingKey('');
        updateUsuarios({ ...item, ...row })
          .then(res => {
            if (res.data.status) {
              setMessage({ ...message, showIcon: true });
            } else{
              setMessage({
                message: 'Error al actualizar usuario',
                type: 'error',
                showIcon: true
              });
            }
            setLoading(false);
            fetchData();
          })
          .catch(() => {
            setMessage({
              message: 'Intenta mas tarde',
              type: 'error',
              showIcon: true
            });
            setLoading(false);
          });
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey('');
      }
    } catch (e) {
      setMessage({
        message: 'Error al actualizar',
        type: 'error',
        showIcon: true
      });
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Usuario',
      dataIndex: 'nombre_usuario',
      key: 'nombre_usuario',
      render: text => <a>{text}</a>,
      fixed: 'left',
      width: 100,
      sorter: {
        compare: (a, b) => a.nombre_usuario - b.nombre_usuario,
        multiple: 1,
      }
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      sorter: {
        compare: (a, b) => a.nombre - b.nombre,
        multiple: 2,
      },
      fixed: 'left',
      editable: true
    },
    {
      title: 'E-mail',
      dataIndex: 'mail',
      key: 'mail',
      sorter: {
        compare: (a, b) => a.mail - b.mail,
        multiple: 3,
      },
      editable: true
    },
    {
      title: 'Contraseña',
      dataIndex: 'password',
      key: 'password',
      sorter: {
        compare: (a, b) => a.password - b.password,
        multiple: 3,
      },
      editable: true
    },
    {
      title: 'Permisos',
      dataIndex: 'permisos',
      key: 'permisos',
      editable: true,
      render: tags => (
        <>
          {tags.map(tag => <Tag color={'geekblue'} key={tag}>{permisos[tag]}</Tag>)}
        </>
      )
    },
    {
      title: 'Editar',
      key: 'editar',
      dataIndex: 'editar',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <a
              href='javascript:;'
              onClick={() => save(record.id)}
              style={{
                marginRight: 8,
              }}
            >
              Guardar
            </a>
            <Popconfirm title='Estas seguro?' onConfirm={cancel}>
              <a>Cancelar</a>
            </Popconfirm>
          </span>
        ) : (
          <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
            <a>Editar</a>
            </Typography.Link>
        );
      }
    },
    {
      title: 'Eliminar',
      key: 'eliminar',
      dataIndex: 'eliminar',
      render: (_, record) => (
        <Popconfirm title='Estas seguro de eliminar el usuario?' onConfirm={() => eliminar(record.id)}>
          <a className='Eliminar'>Eliminar</a>
        </Popconfirm>
      )
    }
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record)
      })
    };
  });
  const handleClose = () => setMessage({ ...message, showIcon: !message.showIcon});

  const onFinish = (values) => {
    console.log('Success:', values);
    addUsuarios(values)
      .then(data => {
        setIsModalVisible(false);
        fetchData();
      })
      .catch(e => {
        setIsModalVisible(false);
      });
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };
  return (
    <Container >
      { loading ? <Skeleton active /> : (
        <div className='Usuarios'>
          { message.showIcon && <Alert message={message.message} type={message.type}  closable afterClose={handleClose} />}
          <Modal
            title='Agregar usuario'
            onCancel={() => setIsModalVisible(false)}
            visible={isModalVisible}
            footer={null}>
            <Form
              name='basic'
              labelCol={{
                span: 8,
              }}
              wrapperCol={{
                span: 16,
              }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
            >
              <Form.Item
                label='Nombre de usuario'
                name='nombre_usuario'
                rules={[
                  {
                    required: true,
                    message: 'Por favor ingrese el nombre de usuario!',
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
                    message: 'Por favor ingrese la contraseña!',
                  },
                ]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item
                label='Nombre'
                name='nombre'
                rules={[
                  {
                    required: true,
                    message: 'Por favor ingrese el nombre del usuario!',
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label='Correo electronico'
                name='mail'
                rules={[
                  {
                    type: 'email',
                    required: true,
                    message: 'Por favor ingrese el correo del usuario!',
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name='permisos'
                label='Permisos'
                rules={[
                  {
                    required: true,
                    message: 'Por favor selecciona los permisos para el usuarios!',
                    type: 'array',
                  },
                ]}
              >
                <Select mode='multiple' placeholder='Selecciona los permisos para el usuario'>
                  {
                    Object.keys(permisos).map(permiso => (
                      <Option value={permiso}>{permisos[permiso]}</Option>
                    ))
                  }
                </Select>
              </Form.Item>
              <Form.Item
                wrapperCol={{
                  offset: 8,
                  span: 16,
                }}
              >
                <Button
                  type='primary'
                  icon={<UserAddOutlined />}
                  size='large'
                  htmlType='submit'>
                  Agregar usuario
                </Button>
              </Form.Item>
            </Form>
          </Modal>
          <Space align='end' wrap>
            <Button
              type='primary'
              icon={<UserAddOutlined />}
              size='large'
              onClick={() => setIsModalVisible(true)}>
              Agregar usuario
            </Button>
          </Space>
          <Divider orientation='left'>Usuarios en plataforma</Divider>
          <Form form={form} component={false}>
            <Table
              components={{
                body: {
                  cell: EditableCell,
                },
              }}
              bordered
              dataSource={data}
              columns={mergedColumns}
              rowClassName='editable-row'
              pagination={{
                onChange: cancel
              }}
              scroll={{ x: 1500 }}
            />
          </Form>
        </div>
      )
      }
    </Container>
  );
};

export default Usuarios;