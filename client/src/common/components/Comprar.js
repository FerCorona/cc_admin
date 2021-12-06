import React, { useState } from 'react';
import {
  Table, Input, InputNumber,
  Form, Tag, Space,
  Divider, DatePicker,
  Select
} from 'antd';

import Container from './Container';

const { RangePicker } = DatePicker;
const { Option } = Select;

const dataDummy = [
  {
    sku: '1493578',
    nombre: 'Coca Cola 600',
    vendidos: 13,
    compra: '166.90',
    venta: '196.90',
    ganancias: '500.00'
  },
  {
    sku: '1493578',
    nombre: 'Coca Cola 600',
    vendidos: 13,
    compra: '166.90',
    venta: '196.90',
    ganancias: '500.00'
  },
  {
    sku: '1493578',
    nombre: 'Coca Cola 600',
    vendidos: 13,
    compra: '166.90',
    venta: '196.90',
    ganancias: '500.00'
  },
  {
    sku: '1493578',
    nombre: 'Coca Cola 600',
    vendidos: 13,
    compra: '166.90',
    venta: '196.90',
    ganancias: '500.00'
  },
  {
    sku: '1493578',
    nombre: 'Coca Cola 600',
    vendidos: 13,
    compra: '166.90',
    venta: '196.90',
    ganancias: '500.00'
  }
];

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

const Comprar = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState(dataDummy);
  const [editingKey, setEditingKey] = useState('');

  const isEditing = (record) => record.key === editingKey;

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
      dataIndex: 'sku',
      key: 'sku',
      render: text => <a>{text}</a>,
      sorter: true
    },
    {
      title: 'Nombre Producto',
      dataIndex: 'nombre',
      key: 'nombre',
      sorter: true,
      editable: true
    },
    {
      title: 'Pronostico de compra',
      dataIndex: 'vendidos',
      key: 'vendidos',
      sorter: true,
      editable: true
    },
    {
      title: 'Precio compra',
      dataIndex: 'compra',
      key: 'compra',
      sorter: true,
      editable: true
    },
    {
      title: 'Precio venta',
      dataIndex: 'venta',
      key: 'venta',
      sorter: true,
      editable: true
    },
    {
      title: 'Ganancias',
      dataIndex: 'ganancias',
      key: 'ganancias',
      sorter: true,
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
        <RangePicker size='large' align='center' />
        <Select
          showSearch
          size='large'
          placeholder={'Selecciona un producto'}
          onSearch={() => {}}
          onChange={() => {}}
          allowClear
        >
          <Option key={'45647'}>Coca cola 600</Option>
          <Option key={'45647'}>Coca cola 500</Option>
          <Option key={'35647'}>Coca cola 2.5</Option>
        </Select>
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="Selecciona una ruta"
          onChange={() => {}}
          optionLabelProp="label"
          size='large'
        >
          <Option value="ruta-1" label="Ruta 1">
            <div className="demo-option-label-item">
              Ruta 1
            </div>
          </Option>
          <Option value="ruta-2" label="Ruta 2">
            <div className="demo-option-label-item">
              Ruta 2
            </div>
          </Option>
          <Option value="ruta-3" label="Ruta 3">
            <div className="demo-option-label-item">
              Ruta 3
            </div>
          </Option>
        </Select>
        <Select
          showSearch
          size='large'
          placeholder={'Selecciona un cliente'}
          onSearch={() => {}}
          onChange={() => {}}
          allowClear
        >
          <Option key={'45647'}>Cliente 1</Option>
          <Option key={'45647'}>Cliente 2</Option>
          <Option key={'35647'}>Cliente 3</Option>
        </Select>
      </Space>
      <Divider orientation='left'>Pronostico de compra</Divider>
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
          footer={() => <a>Total Pronostico Ganancias $ 34,789.00</a>}
        />
      </Form>
    </Container>
  );
};

export default Comprar;