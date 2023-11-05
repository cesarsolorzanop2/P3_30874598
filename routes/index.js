
var express = require('express');
var router = express.Router();
const path = require('path');
const sqlite3 = require("sqlite3").verbose();
const database = path.join(__dirname, "/database", "adminDB.db");
const db = new sqlite3.Database(database, (err) => {
  if (err) return err;
});
require('dotenv').config()
const Productsimg = "CREATE TABLE images (id INTEGER PRIMARY KEY AUTOINCREMENT,producto_id INTEGER NOT NULL,url TEXT NOT NULL,destacado BOOLEAN NOT NULL,FOREIGN KEY (producto_id) REFERENCES productos (id));"
const CategoryProduct = "CREATE TABLE categorys (id INTEGER PRIMARY KEY AUTOINCREMENT,nombre TEXT NOT NULL);";
const Products = "CREATE TABLE products (id INTEGER PRIMARY KEY AUTOINCREMENT,nombre TEXT NOT NULL,codigo TEXT NOT NULL,precio NUMERIC NOT NULL,software TEXT NOT NULL,pantalla TEXT NOT NULL,descripcion TEXT NOT NULL,categoria_id INTEGER NOT NULL,FOREIGN KEY (categoria_id) REFERENCES categorias (id))";

db.run(CategoryProduct, (err) => {
  db.run(Productsimg, (err) => {
    db.run(Products, (err) => {
      if (err) {
        console.log(err)
      }
    })
  })
})

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
  console.log(idCategory)
  db.run(`INSERT INTO productos(nombre,codigo,precio,software,pantalla,descripcion,categoria_id)
  VALUES (?,?,?,?,?,?,?)`, [name, code, price, software, screen, description, idCategory], (err) => {
    console.log(err);
    db.run(`INSERT INTO imagenes (producto_id,url,destacado) VALUES (?,?,?)`, ['', 'https://upload.wikimedia.org/wikipedia/commons/0/0a/No-image-available.png', destacado], (err) => {
      err ? console.log(err) : res.redirect('/admin');
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



router.get("/editCategory", (req,res) => {
  db.all(`SELECT * FROM categorias`,[],(err,categoryView) => {
    res.render('editCategory',{
      Productcategory:categoryView
    })
  })
})


router.post("/editCategory/:id",(req,res) => {
  const { id } = req.params;
  db.run(`UPDATE categorias SET nombre = ? WHERE id = ?`,[req.body.categoryProduct,id],(err) => {
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

router.post('/editProduct/:id',(req,res) => {
  const { id } = req.params;
  const { name, code, price, software, screen, description, idCategory } = req.body;
  console.log(description)
  db.run(`UPDATE productos SET nombre = ?, codigo = ?, precio = ?, software = ?, pantalla = ?, descripcion = ?, categoria_id = ? WHERE (id = ?)`,
  [name, code, price, software, screen, description, idCategory,id],(err) => {
    err ? console.log(err):res.redirect('/admin');
  })
})

router.get('/',(req,res) => {
  res.render('index.ejs')
})

router.post("/login",(req,res) => {
  const { user,password } = req.body;
  if(user == process.env.USER && password == process.env.USER_PASSWORD){
    res.redirect('/admin');
  }else{
    res.redirect('/')
  }
})

module.exports = router;
