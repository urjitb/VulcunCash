const express = require('express');
const exphbs = require('express-handlebars');
const api = require('./routes/api.js')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const Users = require('./models/users');
const { static } = require('express');
const path = require('path');
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const auth = require("./auth");
const adminAuth = require("./adminAuth");
const dotenv = require('dotenv').config();
const { body, validationResult } = require('express-validator');

var cookieParser = require('cookie-parser')


const authToken = process.env.authToken
const DB_URL = process.env.DB_URL

const conn = mongoose.connect(DB_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then((client) => {
    console.log('Connected to Database')

}).catch(error => { console.log(error) })

const app = express();

app.engine('.hbs', exphbs({
    extname: '.hbs',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials'
}));
app.set('view engine', '.hbs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api', api)
app.use(cookieParser())
app.use(static(path.join(__dirname, 'public')))


app.get('/', function (req, res, next) {
    res.render('home');
});

app.get('/register', function (req, res, next) {
    res.render('register');
});


app.post('/register', [
    body('email').isEmail().withMessage("Invalid email"),
    body('password').isLength({ min: 8 }).withMessage("Invalid password minimum characters: 8")
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {
        username,
        email,
        password
    } = req.body;

    Users.updateOne({ email }, { $set: { quote: ["testtt123"] } });
    //check if user already exists
    let user = await Users.findOne({
        email
    });

    if (user) {
        //console.log(user)
        return res.status(400).json({
            msg: "User Already Exists"

        });

    }
    //else add it to the Users model
    user = new Users({
        username,
        email,
        password,
        role: "user"
    });
    console.log("hashing")

    //hash password
    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(password, salt);
    console.log("saving")

    //save password

    await user.save().then((result) => { console.log(result) })
    const payload = {
        user: {
            id: user.id,
            role: "user"
        }
    };
    jwt.sign(
        payload,
        authToken, {
        expiresIn: '9h'
    },
        (err, token) => {
            if (err) throw err;
            res.cookie('token', token, {
                expires: new Date(Date.now() + 9 * 3600000),
                sameSite: true
            }).status(200).json({
                token
            });
        }
    );
})

app.post('/login', async (req, res) => {

    const { email, password } = req.body;

    let user = await Users.findOne({
        email
    });
    if (!user)
        return res.status(400).json({
            message: "User Not Exist"
        });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
        return res.status(400).json({
            message: "Incorrect Password !"
        });

    const payload = {
        user: {
            id: user.id,
            role: user.role
        }
    };
    console.log("payload = " + JSON.stringify(payload))
    jwt.sign(
        payload,
        authToken,
        {
            expiresIn: '9h'
        },
        (err, token) => {
            if (err) throw err;
            res.cookie('token', token, {
                expires: new Date(Date.now() + 9 * 3600000),
                sameSite: true
            }).status(200).redirect('/dashboard')
        }
    );
})

app.get("/dashboard", auth, async (req, res) => {
    try {
        const user = await Users.findById(req.user.id);
        res.render('dashboard', { User: user.toObject() });
    } catch (e) {
        res.send({ message: "Error in Fetching user" });
    }
});

app.get("/admin", adminAuth, async (req, res) => {
    try {
        const user = await Users.findById(req.user.id);
        res.render('admin');
        
    } catch (e) {

        res.send({ message: "Error in Fetching user" });
  
    }
});

app.listen(3001, () => console.log("Started at 3001"));