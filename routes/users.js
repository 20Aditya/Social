const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');


//Bring In user model
let User = require('../models/user');

//Register form
router.get('/register',function(req,res){
  res.render('signup');
});


//Register Process
router.post('/register',function(req,res){
  const name = req.body.name;
  const email = req.body.email;
  const phone = req.body.phone;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;

  req.checkBody('name','Name is required').notEmpty();
  req.checkBody('email','Email is required').notEmpty();
  req.checkBody('email','Email is not valid').isEmail();
  req.checkBody('username','Username is required').notEmpty();
  req.checkBody('password','Password is required').notEmpty();
  req.checkBody('password2','Passwords do not match').equals(req.body.password);
  req.checkBody('phone', 'Phone is required').notEmpty();

  let errors = req.validationErrors();

  if(errors){
    res.render('signup',{
      errors:errors
    });
  }else {
    console.log(name);
    console.log(email);
    console.log(username);
    let newUser = new User({
      name:name,
      email:email,
      username:username,
      password:password,
      phone : phone
    });

    bcrypt.genSalt(10,function(err,salt){
      bcrypt.hash(newUser.password,salt,function(err,hash){
        if(err){
          console.log(err);
        }
        newUser.password = hash;
        newUser.save(function(err){
          if(err){
            console.log(err);
            return;
          }else{
            req.flash('success','You are now registered and can log in');
            res.redirect('/login');
          }
        });
      });
    });
  }

});


//login
router.get('/login',function(req,res){
  res.render('login');
});

router.post('/login',function(req,res,next){
  passport.authenticate('local', {
    successRedirect:'/',
    failureRedirect:'/login',
    failureFlash: true,
  })(req,res,next);
});


router.get('/logout',function(req,res){
  req.logout();
  req.flash('success','You are logged out');
  res.redirect('/login');
})


router.get('/profile',ensureAuthenticated,function(req,res){
  var name = req.user.name;
  res.render('profile',{
    name:name,
    email: req.user.email
  });
});


router.get('/followers',ensureAuthenticated,function(req,res) {
  res.render('followers');
});


router.get('/following',ensureAuthenticated,function(req,res) {
  res.render('following');
});



router.get('/chats',ensureAuthenticated,function(req,res) {
  res.render('chats');
});


function ensureAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    next();
  }else{
    req.flash('danger','Please Login');
    res.redirect('/login');
  }
}


module.exports = router;
