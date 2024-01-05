const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const jsonwebtoken = require("jsonwebtoken");


const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./my-uploads");
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({storage: storage});

const userUpload = multer({storage: storage});

const app = express();
const port = 8939;

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://ma180:pak123@atlascluster.ripldev.mongodb.net/E-Commerce").then(() => {
  console.log("db is connected");
});

const UsersSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  image: String,
});
// eslint-disable-next-line new-cap
const MyUsers = new mongoose.model("MyUsers", UsersSchema);
let Users = [];
app.post("/signup", userUpload.single("userImage"), async (req, res) => {
  const newUser = new MyUsers({
    name: req.body.userName,
    email: req.body.userEmail,
    password: req.body.password,
    image: req.file.filename,
  });
  try {
    await newUser.save();
  } catch (error) {
    console.log(error);
  }
});


app.post("/login", async (req, res) => {
  Users = await MyUsers.find();
  // eslint-disable-next-line max-len
  const findUser = Users.find((user) => user.email == req.body.userEmail && user.password == req.body.password);
  console.log("findUser", findUser);
  if (findUser) {
    jsonwebtoken.sign({email: findUser.userEmail}, "user ko login karo", {
      expiresIn: "1w",
    }, (error, token) => {
      res.json({
        myToken: token,
        findUser,
      });
    });
  }
});

app.post("/checkToken", (req, res) => {
  if (req.body.token) {
    // eslint-disable-next-line max-len
    jsonwebtoken.verify(req.body.token, "user ko login karo", (error, findUser) => {
      const user = Users.find((user) => user.userEmail == findUser.email);
      res.json(user);
      console.log(user);
    });
  }
});

const modalSchema = new mongoose.Schema({
  modal1: {
    type: String,
    require: false,
  },
  modal2: {
    type: String,
    require: false,
  },
  modal3: {
    type: String,
    require: false,
  },
  modal4: {
    type: String,
    require: false,
  },
});

const productsSchema = new mongoose.Schema({
  description: String,
  price: Number,
  modalSelection: String,
  modals: [modalSchema],
  image: String,
  forGender: String,
  withPic: String,
  withCharger: String,
});

// eslint-disable-next-line new-cap
const MyProduct = new mongoose.model("MyProduct", productsSchema);

app.post("/create-post", upload.single("userFile"), async (req, res) => {
  const modals = {
    modal1: req.body.modal1,
    modal2: req.body.modal2,
    modal3: req.body.modal3,
    modal4: req.body.modal4,
  };

  const newDoc = new MyProduct({
    description: req.body.description,
    price: req.body.price,
    modalSelection: req.body.modalSelection,
    modals: [modals],
    image: req.file.filename,
    forGender: req.body.forGender,
    withPic: req.body.withPic,
    withCharger: req.body.withCharger,
  });
  console.log(newDoc);
  try {
    await newDoc.save();
  } catch (error) {
    console.log(error);
  }
});

app.get("/get-posts", async (req, res) => {
  try {
    let Posts = [];
    Posts = await MyProduct.find();
    res.json(Posts);
    console.log(Posts);
  } catch (error) {
    console.log(error);
  }
});

app.get("/get-categories", async (req, res) => {
  try {
    let posts = [];
    posts = await MyProduct.find({modalSelection: req.query.param});
    res.json(posts);
    console.log(posts);
  } catch (error) {
    console.log(error);
  }
});
app.get("/get-genderCollection", async (req, res) => {
  try {
    let posts = [];
    posts = await MyProduct.find({forGender: req.query.param});
    res.json(posts);
    console.log(posts);
  } catch (error) {
    console.log(error);
  }
});


app.delete("/delete-posts", async (req, res)=>{
  try {
    await MyProduct.deleteOne({_id: req.query.id});
  } catch (error) {
    console.log(error);
  }
});

const OrderProducts = new mongoose.Schema({
  image: String,
  description: String,
  unitPrice: Number,
  totalPrice: Number,
  quantity: Number,
  modal: String,
});

const OrdersSchema = new mongoose.Schema({
  products: [OrderProducts],
  totalBill: String,
  firstName: String,
  lastName: String,
  phone: String,
  address: String,
  city: String,
  zipCode: String,
  states: String,
  country: String,
  deliveryMethod: String,
  paymentMethod: String,
  deliveryCharges: Number,
  userMail: String,
});

// eslint-disable-next-line new-cap
const OrderProduct = new mongoose.model("OrderProduct", OrdersSchema);

app.post("/replaceOrder", async (req, res)=>{
  const myItems = [];
  // eslint-disable-next-line new-cap
  req.body.myItem.forEach((item) => {
    const myProducts ={
      image: item.image,
      description: item.description,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      quantity: item.quantity,
      modal: item.modal,
    };
    myItems.push(myProducts);
  });

  const myOrder = new OrderProduct({
    products: myItems,
    totalBill: req.body.totalBill,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phone: req.body.phone,
    address: req.body.address,
    city: req.body.city,
    zipCode: req.body.zipCode,
    states: req.body.states,
    country: req.body.country,
    deliveryMethod: req.body.deliveryMethod,
    paymentMethod: req.body.paymentMethod,
    deliveryCharges: req.body.deliveryCharges,
    userMail: req.body.userMail,
  });

  try {
    await myOrder.save();
  } catch (error) {
    console.log(error);
  }
});

app.get("/get-orders", async (req, res)=>{
  try {
    let orders = [];
    orders = await OrderProduct.find({userMail: req.query.user});
    res.json(orders);
  } catch (error) {
    console.log(error);
  }
});


app.use(express.static("./my-uploads"));
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});


