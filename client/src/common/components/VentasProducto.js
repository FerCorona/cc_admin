import React, { useState, useEffect } from 'react';
import {
  Table, Input, InputNumber,
  Form, Button, Space,
  Divider, DatePicker,
  Select
} from 'antd';

import Container from './Container';

import { getVentasProducto, getProductos, getRutas, getClientes } from '../helpers/api-helpers';

import { DownloadOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Option } = Select;



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

const VentasProducto = () => {
  const [ form ] = Form.useForm();
  const [ data, setData ] = useState([]);
  const [ filters, setFilters ] = useState({
    productSelectet: null,
    rutaSelected: null,
    clienteSelected: null,
    fechaInicial: null,
    fechaFinal: null
  });
  const [ editingKey, setEditingKey ] = useState('');
  const [ productos, setProductos ] = useState([]);
  const [ rutas, setRutas ] = useState([]);
  const [ clientes, setClientes ] = useState([]);
  const [ total, setTotal ] = useState(0);

  const isEditing = (record) => record.key === editingKey;
  const fetchData = () => {
    getVentasProducto({
      productos: filters.productSelectet,
      rutas: filters.rutaSelected,
      clientes: filters.clienteSelected,
      fechaInicial: filters.fechaInicial,
      fechaFinal: filters.fechaFinal
    })
    .then(data => {
      setData(data.data);
      setTotal(data.data.map(venta => venta.ganancias).reduce((a, b) => a + b))
    });
  };
  useEffect(() => {
    fetchData()
  }, [ filters ]);
  useEffect(() => {
    Promise.all([
      getProductos(),
      getRutas(),
      getClientes()
    ])
    .then(([ dataProductos, dataRutas, dataClientes]) => {
      setProductos(dataProductos.data);
      setRutas(dataRutas.data);
      setClientes(dataClientes.data);
    });
  }, []);
  const edit = (record) => {
    form.setFieldsValue({
      name: '',
      age: '',
      address: '',
      ...record,
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setData(newData);
        setEditingKey('');
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const columns = [
    {
      title: 'SKU',
      dataIndex: 'id',
      key: 'id',
      render: text => <a>{text}</a>,
      sorter: {
        compare: (a, b) => a.id - b.id,
        multiple: 1,
      }
    },
    {
      title: 'Nombre Producto',
      dataIndex: 'nombre',
      key: 'nombre',
      sorter: {
        compare: (a, b) => a.nombre - b.nombre,
        multiple: 2,
      },
      editable: true
    },
    {
      title: 'Cajas vendidas',
      dataIndex: 'vendidos',
      key: 'vendidos',
      sorter: {
        compare: (a, b) => a.vendidos - b.vendidos,
        multiple: 3,
      },
      editable: true
    },
    {
      title: 'Precio compra',
      dataIndex: 'compra',
      key: 'compra',
      sorter: {
        compare: (a, b) => a.compra - b.compra,
        multiple: 4,
      },
      editable: true
    },
    {
      title: 'Precio venta',
      dataIndex: 'venta',
      key: 'venta',
      sorter: {
        compare: (a, b) => a.venta - b.venta,
        multiple: 5,
      },
      editable: true
    },
    {
      title: 'Ganancias',
      dataIndex: 'ganancias',
      key: 'ganancias',
      sorter: {
        compare: (a, b) => a.ganancias - b.ganancias,
        multiple: 6,
      },
      editable: true
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
        inputType: (col.dataIndex === 'compra' || col.dataIndex === 'venta') ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record)
      })
    };
  });

  return (
    <Container extraClass={'Ventas'} >
      <Space className={'MarginTop'} split={<Divider type="vertical" />} wrap>
        <RangePicker
          size='large'
          align='center'
          onChange={(_, date) => setFilters({ ...filters, fechaInicial: date[0], fechaFinal: date[1] })} />
        <Select
          size='large'
          placeholder={'Selecciona un producto'}
          onChange={change => {
            setFilters({ ...filters, productSelectet: change })
          }}
          allowClear
        >
          {productos.map(producto => <Option key={producto.id}>{producto.nombre_producto}</Option>)}
        </Select>
        <Select
          style={{ width: '100%' }}
          placeholder="Selecciona una ruta"
          onChange={change => {
            setFilters({ ...filters, rutaSelected: change })
          }}
          size='large'
          allowClear
        >
          {rutas.map(ruta => (
            <Option value={ruta.id} label={ruta.nombre}>
              <div className="demo-option-label-item">
                {ruta.nombre}
              </div>
          </Option>
          ))}
        </Select>
        <Select
          size='large'
          placeholder={'Selecciona un cliente'}
          onChange={change => {
            setFilters({ ...filters, clienteSelected: change })
          }}
          allowClear
        >
          {
            clientes.map(cliente => <Option key={cliente.id}>{cliente.nombre}</Option>)
          }
        </Select>
        <Button type="primary" icon={<DownloadOutlined />} size={'large'}>
          Descargar reporte
        </Button>
      </Space>
      <Divider orientation='left'>Ventas</Divider>
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
          footer={() => <a>Total Ganancias $ {total}</a>}
        />
      </Form>
    </Container>
  );
};

export default VentasProducto;