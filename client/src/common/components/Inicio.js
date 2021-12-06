import React, { Component } from 'react';
import { DatePicker, Space, Divider, Statistic, Card, Row, Col } from 'antd';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import faker from 'faker';

import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';


import Container from './Container';

const { RangePicker } = DatePicker;

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
    ChartJS.register(
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      Title,
      Tooltip,
      Legend
    );
    const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
    const data = {
      labels,
      datasets: [
        {
          label: 'Dataset 1',
          data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
        {
          label: 'Dataset 2',
          data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
      ],
    };
    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Chart.js Line Chart',
        },
      },
    };
    return(
      <Container extraClass={'Inicio'}>
        <Space className={'MarginTop'}>
          <RangePicker size='large' align='center' />
        </Space>
        <Divider orientation='left'>Perdidas y ganancias</Divider>
        <div className='site-statistic-demo-card'>
          <Row gutter={16}>
            <Col span={12}>
              <Card>
                <Statistic
                  title='Ganancias'
                  value={111.28}
                  precision={2}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<ArrowUpOutlined />}
                  suffix='%'
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card>
                <Statistic
                  title='Perdidas'
                  value={900.3}
                  precision={2}
                  valueStyle={{ color: '#cf1322' }}
                  prefix={<ArrowDownOutlined />}
                />
              </Card>
            </Col>
          </Row>
        </div>
        <Divider orientation='left'>Ranking producto (Grafica)</Divider>
          <Line options={options} data={data} />
        <Divider orientation='left'>Ranking ruta (Grafica)</Divider>
          <Line options={options} data={data} />
        <Divider orientation='left'>Ranking cliente (Grafica)</Divider>
          <Line options={options} data={data} />
      </Container>
    );
  }
}

export default Inicio;