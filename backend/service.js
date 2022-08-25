const express = require('express')
const app = express();
const bodyParser = require('body-parser')
const ejs = require('ejs')
const path = require('path')
const {createPool} = require('mysql')
const session = require('express-session')
const bcrypt = require('bcryptjs')


const conn = createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "dataStore"
})
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.json())
app.use(session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false
}))


app.use('/images', express.static(path.resolve(__dirname, '/images')))
app.use('/css', express.static(path.resolve(__dirname, '/css')))
app.use('/js', express.static(path.resolve(__dirname, '/js')))

app.get('/', (req, res) => {
    res.render('index', {
        title: "Home"
    })
})
app.get('/', (req, res) => {
    res.render('cart', {
        title: "cart"
    })
})

app.get('/', (req, res) => {
    res.render('product', {
        title: "Product"
    })
})
app.get('/', (req, res) => {
    res.render('productDetails', {
        title: "ProductDetails"
    })
})
app.get('/register', (req, res) => {
    var existUser = req.session.existUser
    req.session.existUser = ""
    res.render('register', {
        title: "Registration", _existUser: existUser
    })
})
app.get('/login', (req, res) => {
    
    var addUserSession = req.session.addUser
    var noUser = req.session.noUser
    var wrongPassword = req.session.wrongPassword
    req.session.wrongPassword = ""
    req.session.noUser = ""
    req.session.addUser = ""
    res.render('login', {
        title: "Login", sessionData: addUserSession, _noUser: noUser, wrongPassword: wrongPassword
    })
})
app.post('/register', async (req, res) => {
    const {name, email, password} = req.body
    const hashed = await bcrypt.hash(password, 10)
    const sql = `INSERT INTO users(name, email, password) VALUES('${name}', '${email}', '${hashed}')`;
    conn.query(sql, (err, result) => {
        if(!err) {
            req.session.addUser = `${name} added.`
            res.redirect('/login')
        }
    })
})
app.post('/login', async (req, res) => {
    const {email, password} = req.body
    const sql = `SELECT * FROM users WHERE email='${email}'`;
    conn.query(sql , async (err, result) => {
        if(!err && !result.length) {
            req.session.noUser = "This User Not Exist"
            res.redirect('/login')
        }
        const passwordVerify = await bcrypt.compare(password, result[0].password)
        if(!passwordVerify) {
            req.session.wrongPassword = "Password Mismatched"
            res.redirect('/login')
        }
        res.redirect("/")
    })
    conn.query
})

app.listen(5000, () => {
    console.log(`Server Connected At Port 5000`)
})