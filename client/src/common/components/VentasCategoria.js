import React, { useState, useEffect } from 'react';
import {
  Table, Input, InputNumber,
  Form, Space, Button,
  Divider, DatePicker,
  Select, Modal
} from 'antd';

import Container from './Container';
import ConfigurarMetaMensual from './ConfigurarMetaMensual';

import { getVentasProducto, getProductos, getRutas, getClientes } from '../helpers/api-helpers';

import { DownloadOutlined, SettingOutlined } from '@ant-design/icons';

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

const VentasCategoria = () => {
  const [ form ] = Form.useForm();
  const [ data, setData ] = useState([]);
  const [ filters, setFilters ] = useState({
    productSelectet: null,
    rutaSelected: null,
    fechaInicial: null,
    fechaFinal: null
  });
  const [ editingKey, setEditingKey ] = useState('');
  const [ rutas, setRutas ] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

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
      getRutas()
    ])
    .then(([ dataRutas]) => {
      setRutas(dataRutas.data);
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
      title: 'Cajas vendidas',
      dataIndex: 'vendidos',
      key: 'vendidos',
      sorter: true,
      editable: true
    },
    {
      title: 'Alcance',
      dataIndex: 'alcance',
      key: 'alcance',
      sorter: true,
      editable: true
    },
    {
      title: 'Faltantes del mes',
      dataIndex: 'faltantes',
      key: 'faltantes',
      sorter: true,
      editable: true
    },
    {
      title: 'Prcentaje avance',
      dataIndex: 'porcentaje',
      key: 'porcentaje',
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
      <Modal
        title='Configurar meta mensual'
        onCancel={() => setIsModalVisible(false)}
        visible={isModalVisible}
        footer={null}
        width={1000}
        >
         <ConfigurarMetaMensual rutas={rutas}/>
      </Modal>
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
        <Button type="primary" icon={<SettingOutlined />} size={'large'} onClick={() => setIsModalVisible(true)}>
          Configurar meta mensual
        </Button>
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
        />
      </Form>
    </Container>
  );
};

export default VentasCategoria;