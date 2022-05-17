import React, { useState, useEffect } from 'react';
import {
  Table, Input, InputNumber,
  Form, Button, Space,
  Divider, DatePicker,
  Select
} from 'antd';

import Container from './Container';

import { getVentasCliente, getRutas, getClientes } from '../helpers/api-helpers';

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

const VentasCliente = () => {
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
  const [ rutas, setRutas ] = useState([]);
  const [ clientes, setClientes ] = useState([]);
  const [ total, setTotal ] = useState(0);

  const isEditing = (record) => record.key === editingKey;
  const fetchData = () => {
    getVentasCliente({
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
      getRutas(),
      getClientes()
    ])
    .then(([ dataRutas, dataClientes]) => {
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
      title: 'Nombre cliente',
      dataIndex: 'nombre_tienda',
      key: 'nombre_tienda',
      sorter: {
        compare: (a, b) => a.nombre_tienda - b.nombre_tienda,
        multiple: 2,
      },
      editable: true
    },
    {
      title: 'Cajas vendidas',
      dataIndex: 'cajas',
      key: 'cajas',
      sorter: {
        compare: (a, b) => a.cajas - b.cajas,
        multiple: 3,
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

export default VentasCliente;