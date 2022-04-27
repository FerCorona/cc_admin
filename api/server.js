const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { Client } = require('pg');
const { spawn } = require('child_process');
const path = require('path');
const app = express();
const router = express.Router()

const service = require('./services');
const middleware = require('./middleware');
const config = require('./config');


app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(router);
app.use(fileUpload({ createParentPath: true }));
app.use(express.static('files'));


const PORT = 9117;
const HOST = '0.0.0.0';

const connectionData = {
  connectionString: config.URI_POSTGRES,
  ssl: {
    rejectUnauthorized: false
  }
};

const getClient = () => new Client(connectionData);

const getCSVPath = req => `csv/${req.headers.authorization.split('.')[1]}/`

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
      console.log('ERROR DE LOGEO ->', err);
      res.send({ status: false });
      client.end();
   });
});

app.get('/get_inventario', middleware.ensureAuthenticated, (req, res) => {
  const client = getClient();
  client.connect();
  client.query('SELECT * FROM public.productos')
    .then(data => {
      res.send(data.rows);
      client.end();
      console.log('SE CONSULTARON LOS PRODUCTOS');
    })
    .catch(err => {
      console.log('ERROR AL CONSULTAR PRODUCTOS ->', err);
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
    .then(() => {
      res.send({ status: true });
      console.log(`SE ACTUALIZO EL PRODUCTO ${element.id}.`);
    })
    .catch(err => {
      console.log('ERROR AL EDITAR PRODUCTO ->', err);
      res.send({ status: false });
      client.end();
   })
  });
});

app.post('/delete_product', middleware.ensureAuthenticated, (req, res) => {
  const product_to_delete = req.body.id_producto;
  const client = getClient();
  client.connect();
  const queryString = `DELETE FROM public.productos WHERE id=${product_to_delete}`;
  client.query(queryString)
    .then(() => {
      res.send({ status: true });
      console.log(`SE BORRO EL PRODUCTO ${product_to_delete}.`);
    })
    .catch(err => {
      console.log('ERROR AL BORRAR PRODUCTO ->', err);
      res.send({ status: false });
      client.end();
   });
});

app.post('/upload_file', middleware.ensureAuthenticated, (req, res) => {
  let file;
  let uploadPath;
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }
  file = req.files.productos ? req.files.productos : req.files.venta;
  uploadPath = `${getCSVPath(req)}${req.files.productos ? 'productos.csv' : 'venta.csv'}`;
  file.mv(uploadPath, function(err) {
    if (err){
      return res.status(500).send(err);
    }
    res.send({
      status: true
    });
  });
});

app.get('/get_cuadernillos', middleware.ensureAuthenticated, (req, res) => {
  let filePath = '';
  const generateCuadernillos = spawn('python3', ['libros.py', `${getCSVPath(req)}productos.csv`, `${getCSVPath(req)}venta.csv`, req.headers.authorization.split('.')[1] ]);
  generateCuadernillos.stdout.on('data', function (data) {
    filePath = `csv/${req.headers.authorization.split('.')[1]}/LIBRO.pdf`;
  });
  generateCuadernillos.stderr.on('data', (e) => {
    console.log(e.toString())
    console.error({
      status: false
    });
  });
  generateCuadernillos.on('close', (code) => {
    res.download(filePath);
    // spawn('rm', [ '-r', `csv/${req.headers.authorization.split('.')[1]}` ]).stdout.on('data', function (data) {
    //   console.log('ARCHIVOS BORRADOS');
    // });
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
      console.log('ERROR AL CONSULTAR CATEGORIAS ->', err);
      res.send('');
      client.end();
   })
});

app.post('/get_ventas', middleware.ensureAuthenticated, (req, res) => {
  const { productos, rutas, clientes, fechaInicial, fechaFinal } = req.body;
  let WHERE = '';
  const FILTERS = [];
  if (productos) {
    FILTERS.push(` B.id_producto = ${productos}`);
  }
  if (rutas) {
    FILTERS.push(` A.id_ruta = ${rutas}`);
  }
  if (clientes) {
    FILTERS.push(` A.id_cliente = ${clientes}`);
  }
  if (fechaInicial && fechaFinal) {
    FILTERS.push(` A.fecha_venta BETWEEN'${fechaInicial}' AND '${fechaFinal}'`);
  }
  if (productos || rutas || clientes || (fechaInicial && fechaFinal)) {
    WHERE = ` WHERE ${FILTERS.join(' AND ')}`;
  }
  const client = getClient();
  client.connect();
  const query = `
  SELECT 
    B.id_producto as sku,
    C.nombre_producto as nombre,
    SUM (B.cantidad_unidades) as vendidos,
    C.precio_compra as compra,
    C.precio_venta as venta,
    ((C.precio_venta * SUM (B.cantidad_unidades)) - (C.precio_compra * SUM (B.cantidad_unidades))) as ganancias
  FROM ((public.ventas as A INNER JOIN public.detalle_venta as B ON A.id = B.id_venta)
  INNER JOIN public.productos as C ON C.id = B.id_producto)
  ${WHERE}
  GROUP BY B.id_producto, C.nombre_producto, C.precio_compra, C.precio_venta
  `;
  console.log(query);
  client.query(query)
    .then(data => {
      res.send(data.rows);
      client.end();
      console.log('SE CONSULTARON LAS VENTAS');
    })
    .catch(err => {
      console.log('ERROR AL CONSULTAR LAS VENTAS ->', err);
      res.send('');
      client.end();
   })
});

app.get('/get_productos', middleware.ensureAuthenticated, (req, res) => {
  const client = getClient();
  client.connect();
  client.query(`SELECT id, nombre_producto FROM public.productos`)
    .then(data => {
      res.send(data.rows);
      client.end();
      console.log('SE CONSULTARON LOS PRODUCTOS');
    })
    .catch(err => {
      console.log('ERROR AL CONSULTAR LOS PRODUCTOS ->', err);
      res.send('');
      client.end();
   })
});

app.get('/get_rutas', middleware.ensureAuthenticated, (req, res) => {
  const client = getClient();
  client.connect();
  client.query(`SELECT id, nombre_ruta as nombre FROM public.rutas`)
    .then(data => {
      res.send(data.rows);
      client.end();
      console.log('SE CONSULTARON LAS RUTAS');
    })
    .catch(err => {
      console.log('ERROR AL CONSULTAR LAS RUTAS ->', err);
      res.send('');
      client.end();
   })
});

app.get('/get_clientes', middleware.ensureAuthenticated, (req, res) => {
  const client = getClient();
  client.connect();
  client.query(`SELECT id, nombre_tienda as nombre FROM public.clientes`)
    .then(data => {
      res.send(data.rows);
      client.end();
      console.log('SE CONSULTARON LOS CLIENTES');
    })
    .catch(err => {
      console.log('ERROR AL CONSULTAR LOS CLIENTES ->', err);
      res.send('');
      client.end();
   })
});

app.listen(PORT,HOST, () => console.log('Server Running.....'));