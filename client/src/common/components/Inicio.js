import React, { Component } from 'react';
import { DatePicker, Space, Divider, Col, Row } from 'antd';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import faker from 'faker';
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
import axios from 'axios';

import Container from './Container';

const { RangePicker } = DatePicker;

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true
    },
  },
};

const labels = ['Ranking'];

export const data = {
  labels,
  datasets: [
    {
      label: 'Producto 1',
      data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
      backgroundColor: 'rgba(255, 191, 0, 1)',
    },
    {
      label: 'Producto 2',
      data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
      backgroundColor: 'rgba(192, 192, 192, 1)',
    },
    {
      label: 'Producto 3',
      data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
      backgroundColor: 'rgba(176, 99, 4, 1)',
    }
  ],
};


class Inicio extends Component {
  constructor() {
    super();
    this.state = {};
  }
  componentDidMount() {
    axios.get('/api')
      .then(res => console.log(res));
  }
  render() {
    return(
      <Container extraClass={'Inicio'}>
        <Space className={'MarginTop'}>
          <RangePicker size='large' align='center' />
        </Space>
        <Row>
          <Col xs={24} lg={12}>
            <Divider orientation='left'>Ranking producto (Grafica)</Divider>
            <Bar options={options} data={data} />
          </Col>
          <Col xs={24} lg={12}>
            <Divider orientation='left'>Ranking ruta (Grafica)</Divider>
            <Bar options={options} data={data} />
          </Col>
        </Row>
        <Row>
          <Col xs={24} lg={12}>
            <Divider orientation='left'>Ranking cliente (Grafica)</Divider>
            <Bar options={options} data={data} />
          </Col>
        </Row>
      </Container>
    );
  }
}

export default Inicio;