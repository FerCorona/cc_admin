import React, { useState, useEffect } from 'react';
import {
  Table, Input, Tag,
  Popconfirm, Form, Space, Button,
  Typography, Divider, Alert, Skeleton,
  Select, DatePicker
} from 'antd';

import { getMetaMensual, updateMetaMensual } from './../helpers/api-helpers';
import { permisos } from './../helpers/constants';

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

const ConfigurarMetaMensual = ({ rutas }) => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [message, setMessage] = useState({
    message: 'Producto actualizado',
    type: 'success',
    showIcon: false
  });
  const [editingKey, setEditingKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState('todas');

  const fetchData = () => {
    getMetaMensual({
      ruta: selectedRoute,
      fecha: date
    })
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
        updateMetaMensual({ ...item, ...row })
          .then(res => {
            if (res.data.status) {
              setMessage({
                message: 'Meta del mes actualizada!',
                type: 'success',
                showIcon: false
              });
            } else{
              setMessage({
                message: 'Error al actualizar la meta mensual',
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
      console.log(e)
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      fixed: 'left',
      render: text => <a>{text}</a>,
      width: 130,
      sorter: {
        compare: (a, b) => a.id - b.id,
        multiple: 1,
      }
    },
    {
      title: 'Categoria',
      dataIndex: 'nombre',
      key: 'nombre',
      fixed: 'left',
      render: text => <a>{text}</a>,
      width: 130,
      sorter: {
        compare: (a, b) => a.nombre - b.nombre,
        multiple: 2,
      }
    },
    {
      title: 'Cajas a vender en el mes',
      dataIndex: 'meta_cajas',
      key: 'meta_cajas',
      sorter: {
        compare: (a, b) => a.meta_cajas - b.meta_cajas,
        multiple: 3,
      },
      editable: true,
      width: 300,
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
    <>
      { loading ? <Skeleton active /> : (
        <div className='MetaMensual'>
          { message.showIcon && <Alert message={message.message} type={message.type}  closable afterClose={handleClose} />}
          <Space  wrap>
            <Select
              style={{ width: '100%' }}
              placeholder="Selecciona una ruta"
              onChange={change => {
                setSelectedRoute(change)
              }}
              size='large'
              allowClear={false}
              defaultValue={'todas'}
            >
              <Option value={'todas'} label={'Todas'}>
                <div className="demo-option-label-item">
                  Todas
                </div>
              </Option>
              {rutas.map(ruta => (
                <Option value={ruta.id} label={ruta.nombre}>
                  <div className="demo-option-label-item">
                    {ruta.nombre}
                  </div>
              </Option>
              ))}
            </Select>
            <DatePicker onChange={setDate} picker="month" size='large' />
          </Space>
          <Divider orientation='left'>{'Configuracion de las categoria'}</Divider>
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
    </>
  );
};

export default ConfigurarMetaMensual;