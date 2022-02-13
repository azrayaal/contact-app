const { render } = require("ejs");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");

// VALIDATOR //////////
const { body, validationResult, check } = require("express-validator");

// FLASH MODULES //////////
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

// call connection that using mongoose from db.j //////////
require("./utils/db.js");
// call model
const Contact = require("./models/contact");
const { findOne } = require("./models/contact");

// panggil app express //////////
const app = express();
const port = 3000;

// ///////////////////////////////////////////////////////////////////////////////////

// SET UP METHOD OVERDRIVE
app.use(methodOverride("_method"));

// SET UP EJS
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// FLASH CONFIGURATION
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

// RUN express
app.listen(port, () => {
  console.log(`Mongo Contact APP | listening at http://localhost:${port}`);
});

// root dir
// HOME PAGE ///////////////////////////////////////////////////////////
app.get("/", (req, res) => {
  res.render("index", {
    layout: "layouts/main-layout",
    nama: "azra yazid",
    title: "HOME",
  });
});

// ABOUT PAGE ///////////////////////////////////////////////////////////////
app.get("/about", (req, res) => {
  res.render("about", {
    title: "about",
    layout: "layouts/main-layout",
  });
});

// CONTACT PAGE  ////////////////////////////////////////////////////////////

// main contact page
app.get("/contact", async (req, res) => {
  const contacts = await Contact.find();

  res.render("contact", {
    title: "contact",
    layout: "layouts/main-layout",
    contacts,
    msg: req.flash("msg"),
  });
});

// ADD CONTACT
app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    title: "add-contact",
    layout: "layouts/main-layout",
  });
});

// process add data contact
app.post(
  "/contact",
  [
    body("nama").custom(async (value) => {
      const duplikat = await Contact.findOne({ nama: value });
      if (duplikat) {
        throw new Error("Nama contact sudah terdaftar");
      }
      return true;
    }),
    check("email", "Email tidak valid!").isEmail(),
    check("nohp", "No HP tidak valid!").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("add-contact", {
        title: "form tambah data contact",
        layout: "layouts/main-layout",
        errors: errors.array(),
      });
    } else {
      Contact.insertMany(req.body, (err, result) => {
        req.flash("msg", "Data berhasil ditambahkan!");
        res.redirect("/contact");
      });
    }
  }
);

// DELETE CONTACT

app.delete("/contact", (req, res) => {
  Contact.deleteOne({ nama: req.body.nama }).then((err, result) => {
    req.flash("msg", "Data berhasil dihapus!");
    res.redirect("contact");
  });
});

// PROCESS EDIT CONTACT
// FORM EDIT CONTACT
app.get("/contact/edit/:nama", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });

  res.render("edit-contact", {
    title: "form ubah data",
    layout: "layouts/main-layout",
    contact,
  });
});

// porcess edit contact
app.put(
  "/contact",
  [
    body("nama").custom(async (value, { req }) => {
      const duplikat = await Contact.findOne({ nama: value });
      if (value !== req.body.oldNama && duplikat) {
        throw new Error("Nama contact sudah terdaftar");
      }
      return true;
    }),
    check("email", "Email tidak valid!").isEmail(),
    check("nohp", "No HP tidak valid!").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("edit-contact", {
        title: "form ubah data contact",
        layout: "layout/main-layout",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      Contact.updateOne(
        { _id: req.body._id },
        {
          $set: {
            nama: req.body.nama,
            email: req.body.email,
            nohhp: req.body.nohp,
          },
        }
      ).then((err, result) => {
        req.flash("msg", "Data berhasil diubah!");
        res.redirect("/contact");
      });
    }
  }
);

// DETAIL CONTACT
app.get("/contact/:nama", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });

  res.render("detail", {
    title: "detail",
    layout: "layouts/main-layout",
    contact,
  });
});
