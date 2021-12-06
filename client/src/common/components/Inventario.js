import React, { useState, useEffect } from 'react';
import {
  Table, Input, InputNumber,
  Popconfirm, Form, Tag, Space,
  Typography, Divider, Alert
} from 'antd';

import { getProducts, getCategorias, updateProducto } from './../helpers/api-helpers';
import { colorCategorias } from './../helpers/constants';

import Container from './Container';

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
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
  return (
    <td {...restProps}>
      {editing ? (
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
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const Inventario = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  const [message, setMessage] = useState({
    message: 'Producto actualizado',
    type: 'success',
    showIcon: false
  });

  useEffect(() => {
    Promise.all([
      getProducts(),
      getCategorias()
    ])
    .then(([ productos, categoria]) => {
      setData(productos.data);
      setCategorias(categoria.data);
      
    });
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

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.id);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setData(newData);
        setEditingKey('');
        updateProducto({ productos: [ { ...item, ...row } ] })
          .then(() => setMessage({ ...message, showIcon: true }))
          .catch(() => setMessage({
            message: 'Error al actualizar',
            type: 'error',
            showIcon: true
          }));
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log(errInfo)
      setMessage({
        message: 'Error al actualizar',
        type: 'error',
        showIcon: true
      });
    }
  };

  const findCategoriaName = id => categorias.find(cate => cate.id === id);

  const columns = [
    {
      title: 'SKU',
      dataIndex: 'id',
      key: 'id',
      render: text => <a>{text}</a>,
      fixed: 'left',
      width: 100,
      sorter: {
        compare: (a, b) => a.id - b.id,
        multiple: 1,
      }
    },
    {
      title: 'Nombre Producto',
      dataIndex: 'nombre_producto',
      key: 'nombre_producto',
      sorter: {
        compare: (a, b) => a.nombre_producto - b.nombre_producto,
        multiple: 2,
      },
      fixed: 'left',
      editable: true
    },
    {
      title: 'Precio compra',
      dataIndex: 'precio_compra',
      key: 'precio_compra',
      sorter: {
        compare: (a, b) => a.precio_compra - b.precio_compra,
        multiple: 3,
      },
      editable: true
    },
    {
      title: 'Precio venta',
      dataIndex: 'precio_venta',
      key: 'precio_venta',
      sorter: {
        compare: (a, b) => a.precio_venta - b.precio_venta,
        multiple: 3,
      },
      editable: true
    },
    {
      title: 'Inventario actual',
      dataIndex: 'inventario',
      key: 'inventario',
      sorter: {
        compare: (a, b) => a.inventario - b.inventario,
        multiple: 4,
      },
      editable: true
    },
    {
      title: 'Categoria',
      key: 'id_categoria',
      dataIndex: 'id_categoria',
      render: id => {
        const item = findCategoriaName(id);
        const categoriaName = !!item > 0 ? item.nombre_categoria : 'desconocido';
        return (
          <Tag color={colorCategorias[categoriaName] || 'red'} key={id}>
            {categoriaName}
          </Tag>
        );
      },
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
            Editar
          </Typography.Link>
        );
      }
    },
    {
      title: 'Eliminar',
      key: 'eliminar',
      dataIndex: 'eliminar',
      render: (text, record) => (
        <Space size='middle'>
          <a>Eliminar</a>
        </Space>
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
        inputType: (col.dataIndex === 'precio_compra' || col.dataIndex === 'precio_venta') ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record)
      })
    };
  });
  const handleClose = () => setMessage({ ...message, showIcon: !message.showIcon});
  return (
    <Container >
      { message.showIcon && <Alert message={message.message} type={message.type}  closable afterClose={handleClose} />}
      <Divider orientation='left'>Inventario de productos</Divider>
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
    </Container>
  );
};

export default Inventario;