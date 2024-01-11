
var express = require('express');
var router = express.Router();
const path = require('path');
const sqlite3 = require("sqlite3").verbose();
const database = path.join(__dirname, "/database", "adminDB.db");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const db = new sqlite3.Database(database, (err) => {
  if (err) return err;
});
require('dotenv').config();
const Productsimg = "CREATE TABLE imagenes (id INTEGER PRIMARY KEY AUTOINCREMENT,producto_id INTEGER NOT NULL,url TEXT NOT NULL,destacado BOOLEAN NOT NULL,FOREIGN KEY (producto_id) REFERENCES productos (id));"
const CategoryProduct = "CREATE TABLE categorias (id INTEGER PRIMARY KEY AUTOINCREMENT,nombre TEXT NOT NULL);";
const Products = "CREATE TABLE productos (id INTEGER PRIMARY KEY AUTOINCREMENT,nombre TEXT NOT NULL,codigo TEXT NOT NULL,precio NUMERIC NOT NULL,software TEXT NOT NULL,pantalla TEXT NOT NULL,descripcion TEXT NOT NULL,categoria_id INTEGER NOT NULL,FOREIGN KEY (categoria_id) REFERENCES categorias (id))";
const Clients = "CREATE TABLE clientes(id INTEGER PRIMARY KEY AUTOINCREMENT,nombreCliente TEXT NOT NULL,direccion TEXT NOT NULL,usuario VARCHAR(255),pass VARCHAR(255))";
const Cart = "CREATE TABLE ventas(cliente_id TEXT NOT NULL,producto_id TEXT NOT NULL, cantidad TEXT NOT NULL,total_pagado TEXT NOT NULL,fecha TEXT NOT NULL,ip_cliente VARCHAR(255),FOREIGN KEY (cliente_id) REFERENCES clientes(id),FOREIGN KEY (producto_id) REFERENCES productos(id));"

db.run(CategoryProduct, (err) => {
  db.run(Productsimg, (err) => {
    db.run(Products, (err) => {
      db.run(Clients, (err) => {
        db.run(Cart, (err) => {
          if (err) {
            console.log(err)
          }
        })
      })
    })
  })
})

rutaProtegida = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const tokenAuthorized = await promisify(jwt.verify)(req.cookies.jwt, 'token');
      if (tokenAuthorized) {
        return next();
      }
      req.user = row.id;
    } catch (error) {
      console.log(error);
      return next();
    }
  } else {
    res.redirect("/clientWeblogin");
  }
};

rutaProtegidaLogin = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const tokenAuthorized = await promisify(jwt.verify)(req.cookies.jwt, 'token');
      if (tokenAuthorized) {
        res.redirect("/clientWeb");
      }
    } catch (error) {
      console.log(error);
      res.redirect("/clientWeb");
    }
  } else {
    return next();
  }
};



/*Vista interfaz administrativa*/
router.get("/admin", (req, res) => {
  db.all(`SELECT * FROM productos`, [], (err, queryProduct) => {
    db.all(`SELECT * FROM categorias`, [], (err, queryCategory) => {
      db.all(`SELECT * FROM imagenes`, [], (err, queryImg) => {
        res.render('admin', {
          Product: queryProduct,
          Productcategory: queryCategory,
          Productimg: queryImg
        })
      })
    })
  })
})
router.get('/addProduct', (req, res) => {
  db.all(`SELECT * FROM categorias`, [], (err, queryCategory) => {
    res.render('addProduct', {
      Productcategory: queryCategory
    })
  })
})
router.post('/addProduct', (req, res) => {
  const destacado = 1;
  const { name, code, price, software, screen, description, idCategory } = req.body;
  db.run(`INSERT INTO productos(nombre,codigo,precio,software,pantalla,descripcion,categoria_id)
  VALUES (?,?,?,?,?,?,?)`, [name, code, price, software, screen, description, idCategory], (err) => {
    db.get(`SELECT * FROM productos`, (err, feid) => {
      db.run(`INSERT INTO imagenes (producto_id,url,destacado) VALUES (?,?,?)`, [feid.id, 'https://upload.wikimedia.org/wikipedia/commons/0/0a/No-image-available.png', destacado], (err) => {
        err ? console.log(err) : res.redirect('/admin');
      })
    })
  })
})

router.get("/addCategory", (req, res) => {
  db.all(`SELECT * FROM categorias`, [], (err, queryCategory) => {
    res.render("addCategory", {
      Productcategory: queryCategory
    })
  })
})


router.post("/addCategory", (req, res) => {
  const { categoryProduct } = req.body;
  db.run(`INSERT INTO categorias (nombre) VALUES (?);`, [categoryProduct], (err) => {
    err ? console.log(err) : res.redirect('/admin')
  })
})



router.get("/editCategory", (req, res) => {
  db.all(`SELECT * FROM categorias`, [], (err, categoryView) => {
    res.render('editCategory', {
      Productcategory: categoryView
    })
  })
})


router.post("/editCategory/:id", (req, res) => {
  const { id } = req.params;
  db.run(`UPDATE categorias SET nombre = ? WHERE id = ?`, [req.body.categoryProduct, id], (err) => {
    err ? console.log(err) : res.redirect('/admin')
  })
})




router.get("/addImage/:id", (req, res) => {
  const id = req.params.id;
  db.all(`SELECT * FROM categorias`, [], (err, queryCategory) => {
    db.all(`SELECT * FROM productos WHERE id = ?`, id, (err, queryProduct) => {
      console.log(queryProduct);
      res.render("addImage", {
        Productcategory: queryCategory,
        idProduct: queryProduct
      })
    })
  })
})

router.post("/addImage/:id", (req, res) => {
  const destacado = 1;
  const id = req.params.id;
  const producto_id = id
  const img = req.body.imgProduct;
  db.run(`UPDATE imagenes SET producto_id = ?, url = ?, destacado = ? WHERE ( id = ?)`, [producto_id, img, destacado, id], (err) => {
    if (err) {
      console.log(err)
    } else {
      res.redirect('/admin');
    }
  })
})

router.get('/editProduct/:id', (req, res) => {
  const { id } = req.params;
  db.get(`SELECT * FROM productos WHERE id = ?`, id, (err, idProduct) => {
    db.all(`SELECT * FROM categorias`, [], (err, rowCategory) => {
      res.render('editProduct', {
        Products: idProduct,
        Productcategory: rowCategory
      })
    })
  })
})

router.post('/editProduct/:id', (req, res) => {
  const { id } = req.params;
  const { name, code, price, software, screen, description, idCategory } = req.body;
  console.log(description)
  db.run(`UPDATE productos SET nombre = ?, codigo = ?, precio = ?, software = ?, pantalla = ?, descripcion = ?, categoria_id = ? WHERE (id = ?)`,
    [name, code, price, software, screen, description, idCategory, id], (err) => {
      err ? console.log(err) : res.redirect('/admin');
    })
})


router.get('/deleteProduct/:id', (req, res) => {
  const { id } = req.params;
  sqlQuery = "DELETE FROM productos WHERE id = ?";
  db.run(sqlQuery, id, (err, prod) => {
    res.redirect('/admin')
  })
})

router.get('/', (req, res) => {
  res.render('index.ejs')
})



router.get("/clientWeb", (req, res) => {
  db.all(`SELECT * FROM productos`, [], (err, queryProduct) => {
    db.all(`SELECT * FROM categorias`, [], (err, queryCategory) => {
      db.all(`SELECT * FROM imagenes`, [], (err, queryImg) => {
        res.render('clientWeb', {
          Product: queryProduct,
          Productcategory: queryCategory,
          Productimg: queryImg
        })
      })
    })
  })
})


router.get('/clientWeb/:id', (req, res) => {
  const { id } = req.params;
  db.get(`SELECT * FROM productos WHERE id = ?`, [id], (err, queryProduct) => {
    db.all(`SELECT * FROM categorias`, [], (err, queryCategory) => {
      db.get(`SELECT * FROM imagenes WHERE producto_id = ?`, [id], (err, queryImg) => {
        res.render('clientwebid', {
          Product: queryProduct,
          Productcategory: queryCategory,
          Productimg: queryImg
        })
      })
    })
  })
})



router.get('/categoryid/:id', (req, res) => {
  const { id } = req.params;
  const sqlCategory = "SELECT * FROM categorias"
  const sqlQuery = "SELECT productos.*, imagenes.url FROM productos LEFT JOIN imagenes ON productos.id = imagenes.producto_id WHERE productos.categoria_id = ?";
  db.all(sqlQuery, id, (err, product) => {
    db.all(sqlCategory, [], (err, category) => {
      res.render('clientWeb', {
        Product: product,
        Productcategory: category,
        Productimg: product
      })
    })
  })
})


router.post('/filterid', (req, res) => {
  const { name, procesador, software } = req.body;
  const sqlQuery = "SELECT productos.*, imagenes.url FROM productos LEFT JOIN imagenes ON productos.id = imagenes.producto_id WHERE productos.nombre = ? OR productos.pantalla = ? OR productos.software = ?"
  const sqlCategory = "SELECT * FROM categorias";
  db.all(sqlQuery, [name, procesador, software], (err, product) => {
    db.all(sqlCategory, [], (err, category) => {
      res.render('clientweb', {
        Product: product,
        Productcategory: category,
        Productimg: product
      })
    })
  })
})


router.post("/login", (req, res) => {
  const { user, password } = req.body;
  if (user == process.env.USER && password == process.env.USER_PASSWORD) {
    res.redirect('/admin');
  } else {
    res.redirect('/');
  }
})



router.get('/clientWeblogin', (req, res) => {
  res.render('clientWebLogin');
})

router.post('/clientWeblogin', (req, res) => {
  const { user, password } = req.body;
  db.get(`SELECT * FROM clientes WHERE usuario = ? AND pass = ?`, [user, password], (err, row) => {
    if (row) {
      const id = row.id;
      console.log(row)
      const token = jwt.sign({ id: id }, 'token');
      res.cookie("jwt", token);
      res.redirect('/clientWeb');
    }
    else {
      console.log('Datos incorrectos');
      res.redirect('/clientWebLogin');
    }
  })
})


router.get('/clientWebRegister', (req, res) => {
  res.render('clientWebRegister',{
    recaptcha:process.env.PUBLIC
  });
})

router.post('/clientWebRegister', async (req, res) => {
  const user = req.body.user;
  const pass = req.body.password;
  const nombrecliente = req.body.nombrecliente;
  const direccion = req.body.direccion
  const llavesecreta = process.env.PRIVATE;
  const gRecaptchaResponse = req.body['g-recaptcha-response'];
  const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${llavesecreta}&response=${gRecaptchaResponse}`, {
    method: 'POST',
  });
  const captcha = await response.json();

  if (captcha.success) {
    db.get(`SELECT * FROM clientes WHERE usuario = ?`, [user], (err, row) => {
      if (row) {
        res.redirect('/registerclient')
      } else {
        db.get(`INSERT INTO clientes(nombreCliente,direccion,usuario,pass) VALUES(?,?,?,?)`, [nombrecliente, direccion, user, pass], (err, rows) => {
          if (err) {
            console.log(err)
          } else {
            res.redirect('/clientWebLogin')
          }
        })
      }
    })
  } else {
    res.status(500).send('¡No se verifico el captcha!');
  }

})


router.post('/clientWeb/carrito/:id', rutaProtegida, (req, res) => {
  const id = req.params.id;
  const cantidad = req.body.cantidad;
  const total = req.body.total;
  const totalapagar = cantidad * total

  const query = "SELECT * FROM productos WHERE id = ?";
  db.get(query, [id], (err, product) => {
    db.get(`SELECT * FROM imagenes WHERE producto_id = ?`, id, (err, img) => {
      res.render('clientWebCarrito', {
        Product: product,
        Productimg: img,
        Cantidad: cantidad,
        Total: totalapagar
      })
    }
    )
  })
})


router.post('/clientWeb/carrito/buy/:id', async (req, res) => {
  const id = req.params.id;
  const tarjeta = req.body.tarjeta;
  const cvv = req.body.cvv;
  const fecha = req.body.fecha;
  const totalpagado = req.body.totalpagado;
  const cant = req.body.cantidad;
  const año = fecha.split('-')[0];
  const mes = fecha.split('-')[1];
  const fechaC = new Date();
  const fechaHoy = fechaC.toString();
  const ipClient = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
  try {
    const response = await fetch('https://fakepayment.onrender.com/payments', {

      method: 'POST',
      headers: {
        'Authorization': `Bearer ` + process.env.FAKEPAYMENT,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: totalpagado,
        "card-number": tarjeta,
        cvv: cvv,
        "expiration-month": mes,
        "expiration-year": año,
        "full-name": "APPROVED",
        currency: "USD",
        description: "Transsaction Successfull",
        reference: "payment_id:30"
      })
    });
    const data = await response.json();
    if (data.success == true) {
      const tokenAuthorized = await promisify(jwt.verify)(req.cookies.jwt, 'token');
      const client_id = tokenAuthorized.id;

      db.run(`INSERT INTO ventas(cliente_id,producto_id,cantidad,total_pagado,fecha,ip_cliente) VALUES(?,?,?,?,?,?)`, [client_id, id, cant, totalpagado, fechaHoy, ipClient], (err, row) => {
        if (err) {
          console.log(err)
        } else {
          res.redirect('/clientWeb');
        }
      })
    }

  } catch (error) {
    console.log(error)
  }
})



router.get('/clients', (req, res) => {
  db.all(`SELECT * FROM categorias`, [], (err, categorys) => {
    db.all(`SELECT productos.*, clientes.*, ventas.total_pagado, ventas.cantidad FROM productos JOIN ventas ON productos.id = ventas.producto_id JOIN clientes ON clientes.id = ventas.cliente_id;`, (err, query) => {
      if (err) {
        console.log(err)
      } else {
        res.render('clients', {
          Product: query,
          Productcategory: categorys,
        })
      }
    })
  })
})

router.get('/logout', async (req, res) => {
  res.clearCookie("jwt");
  return res.redirect("/clientWebLogin");
});

module.exports = router;
