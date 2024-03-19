const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');

const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    next();
};

router.get('/register', isLoggedIn, (req, res) => {
    res.render('users/register');
});

router.post('/register', isLoggedIn, catchAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to CyberEdu!');
            res.redirect('/');
        })
    } catch (e) {
        req.flash('error', e.message = "Wrong");
        res.redirect('register');
    }
}));

router.get('/formCourse', (req, res) => {
    res.render('users/formCourse');
});

router.post('/formCourse', catchAsync(async (req, res, next) => {
    try {
        res.redirect('enroll');
    } catch (e) {
        req.flash('error', e.message = "Wrong");
        res.redirect('formCourse');
    }
}))

router.get('/login', isLoggedIn, (req, res) => {
    res.render('users/login');
});

router.post('/login', isLoggedIn, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'Welcome Back!');
    const redirectUrl = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
});

router.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
    });
    req.flash('success', 'Goodbye!');
    res.redirect('/');
});

module.exports = router;