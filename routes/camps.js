var express = require('express');
var router = express.Router();
var Camps = require('../models/campModel');
var passport = require('passport');
var User = require('../models/userModel')
var LocalStrategy = require('passport-local');
var app = require('../app');
var middleware = require('../middleware');

// var camps = [
//   {name: "Salmon Creek", image: "https://www.nps.gov/zion/planyourvisit/images/South_CG_r_1.jpg"},
//   {name: "Rocky Ledge", image: "http://avaloncampground.com/wp-content/uploads/2013/07/Avalon-Campground-table-woods.png"},
//   {name: "Salmon Creek", image: "https://www.nps.gov/zion/planyourvisit/images/South_CG_r_1.jpg"},
//   {name: "Rocky Ledge", image: "http://avaloncampground.com/wp-content/uploads/2013/07/Avalon-Campground-table-woods.png"},
//   {name: "Salmon Creek", image: "https://www.nps.gov/zion/planyourvisit/images/South_CG_r_1.jpg"},
//   {name: "Rocky Ledge", image: "http://avaloncampground.com/wp-content/uploads/2013/07/Avalon-Campground-table-woods.png"},
//   {name: "Salmon Creek", image: "https://www.nps.gov/zion/planyourvisit/images/South_CG_r_1.jpg"},
//   {name: "Rocky Ledge", image: "http://avaloncampground.com/wp-content/uploads/2013/07/Avalon-Campground-table-woods.png"}
// ];

// GET camp page
router.get('/', function(req, res, next) {
  Camps.find({}, function(err, allCamps) {
    if (err) throw err;
    res.render('camps', { camps: allCamps});
  });
  // res.render('camps', { camps: camps});

});

// CREATE  new camp
router.post('/', middleware.isLoggedIn, function(req, res, next) {
  if (req.body.id) {
    Camps.findByIdAndUpdate(req.body.id, {
      name: req.body.name, image: req.body.image
    }, function(err, camp) {
      if (err) throw err;
      return res.send('success');
    });
  }
  else {
    // var newCamp = Camps({
    //   name: req.body.name,
    //   image: req.body.image,
    //   description: req.body.description
    // });
    // newCamp.save(function(err){
    //   if (err) {
    //     console.log(err);
    //   } else {
    //     res.redirect('/camps')
    //   }
    // });
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var author = {
      id: req.user._id,
      username: req.user.username
    }
    var newCamp = {name: name, image: image, description: description, author: author}
    //Create new campground and save to DB
    Camps.create(newCamp, function(err, newlyCreated){
      if(err){
        console.log(err);
      } else {
        //redirect back to campgrounds page
        console.log(newlyCreated);
        res.redirect("/camps");
      }
    });
    console.log('New campground saved!');
  }
});

// GET add new camp page
router.get('/new', middleware.isLoggedIn, function(req, res, next) {
  res.render('newcamp');
});

// SHOW - shows individual camps
router.get('/:id', function(req, res) {
  Camps.findById(req.params.id, function(err, camp) {
    if (err) {
      res.redirect('/');
    } else {
    res.render('camp', {camp: camp});
    }
  });
});

// UPDATE a camp
router.get('/:id/edit', middleware.checkCampgroundOwnership, function(req, res, next) {
  //Is user logged in? Does user own campground?
    Camps.findById(req.params.id, function(err, foundCamp) {
      res.render('editcamp', {camp: foundCamp});
    });
  });

// EDIT route
router.post('/:id', middleware.checkCampgroundOwnership, function(req, res){
  Camps.findByIdAndUpdate(req.params.id, req.body, function(err, updatedCamp){
    if(err){
      res.redirect("/camps");
    } else {
      res.redirect("/camps/" + req.params.id);
    }
  });
});

// DELETE a camp
router.post('/:id/delete', middleware.checkCampgroundOwnership, function(req, res, next){
  Camps.findByIdAndRemove({_id: req.params.id}).then(function(camp){
    res.redirect('/camps');
  });
});

// Middleware

// function checkCampgroundOwnership(req, res, next) {
//   //Is user logged in? Does user own campground?
//   if(req.isAuthenticated()){
//     Camps.findById(req.params.id, function(err, foundCamp) {
//       if (err) {
//         res.redirect('/camps')
//       } else {
//           if(foundCamp.author.id.equals(req.user._id)) {
//             next();
//           } else {
//             res.redirect('back');
//           }
//         }
//       });
//     } else {
//       res.redirect('back');
//     }
// }
//
// function isLoggedIn(req, res, next){
//   if(req.isAuthenticated()){
//     return next();
//   }
//   res.redirect('/login');
// }
module.exports = router;
