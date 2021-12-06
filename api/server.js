const express = require('express');
const cors = require('cors');
const service = require('./services');
const middleware = require('./middleware');
const { Client } = require('pg')
const config = require('./config');

const app = express();
const router = express.Router();
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(router);

const PORT = 9117;
const HOST = '0.0.0.0';

const connectionData = {
  connectionString: config.URI_POSTGRES,
  ssl: {
    rejectUnauthorized: false
  }
};
const getClient = () => new Client(connectionData);

router.post('/login', (req, res) => {
  const client = getClient();
  client.connect();
  const { user, password } = req.body;
  client.query(`SELECT * FROM public.usuarios where nombre_usuario='${user}' and password='${password}'`)
    .then(data => {
      if (data.rows.length > 0) {
        res.send({ token: service.createToken(user), user: data.rows, status: true });
        console.log(`USUARIO ${user} LOGEADO EXITOSAMENTE.`);
      } else {
        res.send({ status: false });
        console.log(`EL USARIO ${user} NO EXISTE.`);
      }
      client.end();
    })
    .catch(err => {
      console.log(err);
      client.end();
   });
});

app.get('/get_productos', middleware.ensureAuthenticated, (req, res) => {
  const client = getClient();
  client.connect();
  client.query('SELECT * FROM public.productos')
    .then(data => {
      res.send(data.rows);
      client.end();
      console.log('SE CONSULTARON LOS PRODUCTOS');
    })
    .catch(err => {
      console.log(err);
      client.end();
   });
});


app.post('/update_producto', middleware.ensureAuthenticated, (req, res) => {
  const data_updated = req.body.productos;
  const client = getClient();
  client.connect();
  data_updated.forEach(element => {
    const queryString = `UPDATE public.productos SET id_categoria=${element.id_categoria}, precio_compra=${element.precio_compra}, precio_venta=${element.precio_venta}, inventario=${element.inventario}, nombre_producto='${element.nombre_producto}' WHERE id=${element.id}`;
    client.query(queryString)
    .then(data => {
      res.send('OK');
      console.log(`SE ACTUALIZO EL PRODUCTO ${user}.`);
    })
    .catch(err => {
      console.log(err);
      res.send('');
   })
  });
});

app.get('/get_categorias', middleware.ensureAuthenticated, (req, res) => {
  const client = getClient();
  client.connect();
  client.query('SELECT * FROM public.categoria_productos')
    .then(data => {
      res.send(data.rows);
      client.end();
      console.log('SE CONSULTARON LAS CATEGORIAS');
    })
    .catch(err => {
      console.log(err);
      res.send('');
      client.end();
   })
});

app.listen(PORT,HOST);