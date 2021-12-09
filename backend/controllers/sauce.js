const Sauce = require('../models/Sauce');
const fs = require('fs');

//Return all sauces present in database
exports.getAllSauce = (req, res, next) => {
  Sauce.find()
      .then((sauces) => res.status(200).json(sauces))
      .catch(error => res.status(400).json({ error }));
};

//Return the requested sauce object
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch(error => res.status(500).json({ error }));
};

/**
 * Create a new sauce 
 * Set sauce with user input and initialize likes variables and arrays 
 */
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  const sauce = new Sauce({
      ...sauceObject,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      likes: 0,
      dislikes: 0,
      usersLiked: [],
      usersDisliked: [],
  });
  sauce.save()
      .then(() => res.status(200).json({ message: 'Sauce added'}))
      .catch(error => res.status(400).json({ error }));
};

/**
 * Modify the requested sauce 
 * First check for image in req
 * Delete server image and update sauce with user input and image if present
 * If no image found update sauce with user input only (image untouched) 
 */
exports.modifySauce = (req, res, next) => {
  var sauceObject
  if (req.file) {
    Sauce.findOne({ _id: req.params.id })
      .then(sauce => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          sauceObject = {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
          };
          Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Sauce updated' }))
            .catch(error => res.status(400).json({ error }));
          })
      })
      .catch(error => res.status(500).json({ error }));
  } else {
    sauceObject = { ...req.body };
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Sauce updated' }))
      .catch(error => res.status(400).json({ error }));
  }
};

//Delete the requested sauce and sauce image
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Sauce deleted' }))
            .catch(error => res.status(400).json({ error }));
      })
    })
    .catch(error => res.status(500).json({ error }));
};

//Evaluate the 3 likes case and update the sauce accordingly
exports.likeManager = (req, res, next) => {
  const like = req.body.like;
  switch (like) {
    //No precedent like and like button pressed
    //Increment sauce.like property and add userid to the sauce.usersLiked array
    case 1:
      Sauce.updateOne({ _id: req.params.id }, { $addToSet: { usersLiked: req.body.userId }, $inc: { likes: +1 }})
        .then(() => res.status(200).json({ message: 'Sauce liked '}))
        .catch(error => res.status(400).json({ error }));
      break;
    //User removed his like or dislike
    //Check for userid in usersLiked and usersDisliked arrays
    //Updates sauce properties depending on where userid was  
    case 0:
      Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
          if (sauce.usersLiked.includes( req.body.userId)) {
            Sauce.updateOne({ _id: req.params.id }, { $pull: { usersLiked: req.body.userId}, $inc: { likes: -1 }})
              .then(() => res.status(200).json({ message: 'Removed Like'}))
              .catch(error => res.status(400).json({ error }));
          }
          if (sauce.usersDisliked.includes( req.body.userId)) {
            Sauce.updateOne({ _id: req.params.id}, { $pull: { usersDisliked: req.body.userId}, $inc: { dislikes: -1 }})
              .then(() => res.status(200).json({ message: 'Removed Dislike' }))
              .catch(error => res.status(400).json({ error }));
          }
        })
        .catch(error => res.status(500).json({ error }));
      break;
    //Same as "case: 1" for dislike option
    case -1:
      Sauce.updateOne({ _id: req.params.id }, { $addToSet: { usersDisliked: req.body.userId }, $inc: { dislikes: +1 }})
        .then(() => res.status(200).json({ message: 'Sauce liked '}))
        .catch(error => res.status(400).json({ error }));
  }
};