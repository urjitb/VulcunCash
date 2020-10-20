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
var cookieParser = require('cookie-parser')


const authToken = 'qwnelqwnelaksnje1k2n3k12n312931209he192heoje12j'
const DB_URL = "mongodb+srv://dahiwala:string32@cluster0.p83ya.mongodb.net/curdapp?retryWrites=true&w=majority"

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
app.use(express.static(path.join(__dirname, 'public')))


app.get('/', function (req, res, next) {
    Users.find({}).then((result) => {

        res.render('home', { users: result });
    })
});

app.post('/register', async (req, res) => {
    //get variables from form
    const {
        username,
        email,
        password
    } = req.body;

    //check if user already exists
    let user = await Users.findOne({
        email
    });

    if (user) {
        console.log(user)
        return res.status(400).json({
            msg: "User Already Exists"

        });

    }
    //else add it to the Users model
    user = new Users({
        username,
        email,
        password
    });
    console.log("hashing")
    //hash password
    const salt = await bcrypt.genSalt(10);
    console.log(salt)
    user.password = await bcrypt.hash(password, salt);
    console.log("saving")
    //save password
    console.log(user)
    await user.save().then((result) => { console.log(result) })
    const payload = {
        user: {
            id: user.id
        }
    };
    console.log(payload)
    jwt.sign(
        payload,
        authToken, {
        expiresIn: 10000
    },
        (err, token) => {
            if (err) throw err;
            res.status(200).json({
                token
            });
        }
    );
})

app.post('/login', async (req, res) => {

    const { email, password } = req.body;
    console.log(req.body)
    console.log(email)
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
            id: user.id
        }
    };
    console.log("payload = " + JSON.stringify(payload))
    jwt.sign(
        payload,
        authToken,
        {
            expiresIn: 3600
        },
        (err, token) => {
            if (err) throw err;
            res.status(200).json({
                token
            });
        }
    );
})

app.get("/me", auth, async (req, res) => {
    try {
        const user = await Users.findById(req.user.id);
        res.json(user);
    } catch (e) {
        res.send({ message: "Error in Fetching user" });
    }
});

app.post('/delete', (req, res) => {
    Users.deleteMany(req.body)
        .then((result) => {

            res.send(result)
        })
        .catch(error => {
            console.error(error)
            res.send(error)
        })
})

app.listen(3000, () => console.log("Started at 3000"));