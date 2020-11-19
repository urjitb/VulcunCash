const express = require('express');
const exphbs = require('express-handlebars');
const api = require('./routes/api.js')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const Users = require('./models/users');
const { static } = require('express');
const path = require('path');
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
const auth = require("./auth");
const lpauth = require("./lpauth");
const adminAuth = require("./adminAuth");
const dotenv = require('dotenv').config();
const { body, validationResult } = require('express-validator');
const axios = require('axios').default;
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

var hbs = exphbs.create({
    extname: '.hbs',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
    // Specify helpers which are only registered on this instance.
    helpers: {
        foo: function (str) { return (parseFloat((parseFloat(str, 10) * 0.7 * 100)).toFixed(2)); },
        bar: function (str) { return (parseFloat(str, 10)).toFixed(2); },
        dollarToVc: function (str) { return (parseFloat(parseFloat(str, 10) * 100).toFixed(2)); },
        sysToHuman: function (str) {
            if (str === "apple") return "Apple Gift Card"
            else if (str === "google") return "Google Gift Card"
            else if (str === "amazon") return "Amazon Gift Card"
            else return "N/A"
        }
    }
});


app.engine('.hbs', hbs.engine)
app.set('view engine', '.hbs');
app.use(bodyParser.json());
app.set('trust proxy', true)
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api', api)
app.use(cookieParser())
app.use(static(path.join(__dirname, 'public'),{dotfiles: 'allow'}))


app.get('/', lpauth, async function (req, res, next) {
    try {
        const user = await Users.findById((req.user.id));
        res.render('landing1', { layout: 'landing', User: user.toObject() });
    }
    catch(e) {
        const user = ""
        res.render('landing1', { layout: 'landing', User: user });
    }
});

app.get('/vc1000', lpauth, async function (req, res, next) {

    try {
        const user = await Users.findById((req.user.id));
        res.render('landing1', { layout: 'landing', User: user.toObject() });
    }
    catch(e) {
        const user = ""
        res.render('landing1', { layout: 'landing',countdown: true, User: user });
    }

});

app.get('/login', function (req, res, next) {
    res.render('login', { layout: 'main' });
});

app.get('/register', function (req, res, next) {
    console.log("register page")
    res.render('register', { layout: 'main' });
});

app.get('/payments', auth, async function (req, res, next) {

    const user = await Users.findById(req.user.id);
    res.render('payments', { layout: 'loggedin', User: user.toObject() });

});

app.get('/postb', async (req, res) => {
    try {
        const { offer_id, payout, affid } = req.query
        console.log(affid)
        let user = await Users.findOne({
            affid: affid
        });


        console.log(offer_id)
        console.log(payout)

        user.updateOne({
            $inc: {
                balance: payout
            }
        }, function (err, user) {
            if (err) throw err
            console.log(user)
            console.log("update user complete")
        })
    } catch(e) { }
    res.status(200)

})

app.post('/register', [
    body('email').isEmail().withMessage("Invalid email"),
    body('password').isLength({ min: 8 }).withMessage("Invalid password minimum characters: 8")
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {
        email,
        password,
        fname,
        lname,
        country,
        state,
        wfrom,
        prefpayment,
        wexp

    } = req.body;

    let user = await Users.findOne({
        email
    });

    if (user) {
        //console.log(user)
        return res.status(400).json({
            msg: "User Already Exists"

        });

    }
    let affid = await Users.collection.countDocuments() + 10047
    console.log(affid)
    //else add it to the Users model
    user = new Users({
        email,
        password,
        fname,
        lname,
        country,
        state,
        wfrom,
        wexp,
        affid,
        prefpayment,
        role: "user",
        balance: 10.0
    });

    //hash password

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(password, salt);

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

function getDeviceType(ua) {
    if (/(ipad)|(android(?!.*mobi))/i.test(ua)) {
        return "ipad";
    }
    if (/(Android)/.test(ua)) return "android";
    else if (/(iPhone)/.test(ua)) return "iphone";
    return "desktop";
};

app.get("/dashboard", auth, async (req, res) => {
    try {
        let countryCode = 'NA'
        const user = await Users.findById(req.user.id);
        axios.get('https://geolocation-db.com/json/09ba3820-0f88-11eb-9ba6-e1dd7dece2b8/' + req.ip)
            .then(function (response) {
                console.log(user.affid)
                axios.get('https://mobverify.com/api/v1/?affiliateid=74530&country=' + 'US' + '&device=' + getDeviceType(req.get('User-Agent')) + '&ctype=15&aff_sub5=' + user.affid, function (data) {
                }).then(function (response) {

                    let RTET = 0.0
                    response.data.offers.forEach((offer) => {
                        RTET += parseFloat((offer.payout) * 0.7 * 100);
                    })
                    res.render('dashboard', { layout: 'loggedin.hbs', User: user.toObject(), ip: req.iq, offers: response.data, RTET: RTET.toFixed(2) });
                }).catch((response) = {

                })


            });

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

app.get("/tutorial", auth, async (req, res) => {
    try {
        
        const user = await Users.findById(req.user.id);
        res.render('tutorial',  { layout: 'loggedin.hbs', User: user.toObject() });

    } catch (e) {
        res.send({ message: "Error in Fetching user" });

    }
});

app.listen(3001, () => console.log("Started at 3001"));