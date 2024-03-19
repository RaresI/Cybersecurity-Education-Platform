const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const methodOverride = require('method-override');

const userRoutes = require('./routes/users');
const { isLoggedIn } = require('./middleware');


mongoose.connect('mongodb://localhost:27017/proiect', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("CONNECTION OPEN")
    })
    .catch(err => {
        console.log("OH NO ERROR")
        console.log(err)
    })

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();


app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))


app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))


const sessionConfig = {
    secret: 'thishouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes);

app.get('/', (req,res) => {
    res.render('home')
})

app.get('/courses', isLoggedIn, (req, res) => {
    res.render('security/courses')
})

app.get('/challenges', isLoggedIn, (req, res) => {
    res.render('security/challenges')
})

app.get('/cyberbasics', isLoggedIn, (req, res) => {
    res.render('security/cyberbasics')
})

app.get('/ransom', isLoggedIn, (req, res) => {
    res.render('security/ransom')
})

app.get('/networking', isLoggedIn, (req, res) => {
    res.render('security/networking')
})

app.get('/news', (req, res) => {
    res.render('security/news')
})

app.get('/about', (req, res) => {
    res.render('security/about')
})

app.get('/formCourse', (req, res) => {
    res.render('users/formCourse')
})

app.get('/enroll', (req, res) => {
    res.render('security/enroll')
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not Found', 404))
})

app.use((err, req, res, next) => {
    const {statusCode = 500, message = 'Smth went wrong'} = err;
    res.status(statusCode).send(message);
})


app.listen(3000, () => {
    console.log('Serving on 3000')
})