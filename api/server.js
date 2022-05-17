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

app.post('/get_ventas_producto', middleware.ensureAuthenticated, (req, res) => {
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
    C.id as id,
    C.nombre_producto as nombre,
    SUM (B.cantidad_unidades) as vendidos,
    C.precio_compra as compra,
    C.precio_venta as venta,
    ((C.precio_venta * SUM (B.cantidad_unidades)) - (C.precio_compra * SUM (B.cantidad_unidades))) as ganancias
    FROM (( public.productos as C LEFT JOIN public.detalle_venta as B ON C.id = B.id_producto)
    LEFT JOIN public.ventas as A ON A.id = B.id_venta)
  ${WHERE}
  GROUP BY C.id, C.nombre_producto, C.precio_compra, C.precio_venta
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

app.post('/get_ventas_cliente', middleware.ensureAuthenticated, (req, res) => {
  const { rutas, clientes, fechaInicial, fechaFinal } = req.body;
  let WHERE = '';
  const FILTERS = [];
  if (rutas) {
    FILTERS.push(` B.id_ruta = ${rutas}`);
  }
  if (clientes) {
    FILTERS.push(` A.id = ${clientes}`);
  }
  if (fechaInicial && fechaFinal) {
    FILTERS.push(` B.fecha_venta BETWEEN'${fechaInicial}' AND '${fechaFinal}'`);
  }
  if (rutas || clientes || (fechaInicial && fechaFinal)) {
    WHERE = ` WHERE ${FILTERS.join(' AND ')}`;
  }
  const client = getClient();
  client.connect();
  const query = `
  SELECT 
    A.nombre_tienda,
    SUM(C.cantidad_unidades) as cajas,
	  MAX(B.monto_venta) as ganancias
  FROM (((public.clientes as A LEFT JOIN public.ventas as B ON A.id = B.id_cliente)
    LEFT JOIN public.detalle_venta as C ON B.id = C.id_venta)
    LEFT JOIN public.productos as D ON D.id = C.id_producto)
  ${WHERE}
  GROUP BY A.nombre_tienda
  `;
  console.log(query);
  client.query(query)
    .then(data => {
      res.send(data.rows);
      client.end();
      console.log('SE CONSULTARON LAS VENTAS POR CLIENTE');
    })
    .catch(err => {
      console.log('ERROR AL CONSULTAR LAS VENTAS POR CLIENTE ->', err);
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

app.get('/get_usuarios', middleware.ensureAuthenticated, (req, res) => {
  const client = getClient();
  client.connect();
  client.query(`SELECT * FROM public.usuarios`)
    .then(data => {
      res.send(data.rows);
      client.end();
      console.log('SE CONSULTARON LOS USUARIOS');
    })
    .catch(err => {
      console.log('ERROR AL CONSULTAR LOS USUARIOS ->', err);
      res.send('');
      client.end();
   })
});

app.post('/update_usuario', middleware.ensureAuthenticated, (req, res) => {
  const user = req.body;
  const array = user.permisos.map(permiso => `'${permiso}'`).join(',');
  const client = getClient();
  client.connect();
  const queryString = `UPDATE public.usuarios 
    SET 
      password='${user.password}',
      nombre='${user.nombre}',
      mail='${user.mail}',
      permisos=ARRAY [ ${array} ]
    WHERE nombre_usuario='${user.nombre_usuario}'`;
  console.log(queryString);
  client.query(queryString)
    .then(() => {
      res.send({ status: true });
      console.log(`SE ACTUALIZO EL USUARIO.`);
    })
    .catch(err => {
      console.log('ERROR AL EDITAR USUARIO ->', err);
      res.send({ status: false });
      client.end();
   });
});

app.post('/add_usuario', middleware.ensureAuthenticated, (req, res) => {
  const user = req.body;
  const array = user.permisos.map(permiso => `'${permiso}'`).join(',');
  const client = getClient();
  client.connect();
  const queryString = `INSERT INTO public.usuarios(
    nombre_usuario, password, nombre, mail, permisos)
    VALUES ('${user.nombre_usuario}', '${user.password}', '${user.nombre}', '${user.mail}', ARRAY [ ${array} ])`;
  console.log(queryString);
  client.query(queryString)
    .then(() => {
      res.send({ status: true });
      console.log(`SE AGREGO EL USUARIO.`);
    })
    .catch(err => {
      console.log('ERROR AL AGREGO USUARIO ->', err);
      res.send({ status: false });
      client.end();
   });
});

app.post('/delete_user', middleware.ensureAuthenticated, (req, res) => {
  const user = req.body.nombre_usuario;
  const client = getClient();
  client.connect();
  const strQuery = `DELETE FROM public.usuarios WHERE id='${user}'`;
  client.query(strQuery)
    .then(data => {
      res.send({ status: true });
      client.end();
      console.log('SE ELIMINO EL USUARIO');
    })
    .catch(err => {
      console.log('ERROR AL ELIMINARON EL USUARIO ->', err);
      res.send({ status: false });
      client.end();
   })
});

app.post('/get_meta_mensual', middleware.ensureAuthenticated, (req, res) => {
  const filters = req.body.nombre_usuario;
  const client = getClient();
  client.connect();
  const strQuery = `SELECT 
  B.id,
	A.nombre,
	B.meta_cajas
	FROM public.categorias_generales AS A LEFT JOIN public.meta_categoria_general AS B ON A.id = B.id_categoria_general`;
  client.query(strQuery)
    .then(data => {
      res.send(data.rows);
      client.end();
      console.log('SE CONSULTO LA META MENSUAL USUARIO');
    })
    .catch(err => {
      console.log('ERROR AL CONSULTAR LA META MENSUAL ->', err);
      res.send({ status: false });
      client.end();
   })
});

app.post('/update_meta_mensual', middleware.ensureAuthenticated, (req, res) => {
  const filters = req.body;
  console.log(filters);
  const client = getClient();
  client.connect();
  const strQuery = `UPDATE public.meta_categoria_general
    SET meta_cajas=${filters.meta_cajas}
    WHERE id = ${filters.id}`;
  client.query(strQuery)
    .then(data => {
      res.send({ status: true });
      client.end();
      console.log('SE CONSULTO LA META MENSUAL USUARIO');
    })
    .catch(err => {
      console.log('ERROR AL CONSULTAR LA META MENSUAL ->', err);
      res.send({ status: false });
      client.end();
   })
});



app.listen(PORT,HOST, () => console.log('Server Running.....'));