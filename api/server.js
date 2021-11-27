const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

const PORT = 9117;
const HOST = '0.0.0.0';

app.get('/', (req, res) => {
  res.send('Hi There')
});

app.listen(PORT,HOST);