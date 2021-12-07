const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.getAllSauce = (req, res, next) => {
  Sauce.find()
      .then((sauces) => res.status(200).json(sauces))
      .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch(error => res.status(500).json({ error }));
}

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
      .then(() => res.status(200).json({ message: 'Objet modifié !'}))
      .catch(error => res.status(400).json({ error }));
  }
};

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

exports.likeManager = (req, res, next) => {
  const like = req.body.like;
  switch (like) {
    case 1:
      Sauce.updateOne({ _id: req.params.id }, { $addToSet: { usersLiked: req.body.userId }, $inc: { likes: +1 }})
        .then(() => res.status(200).json({ message: 'Sauce liked '}))
        .catch(error => res.status(400).json({ error }));
      break;
      
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

    case -1:
      Sauce.updateOne({ _id: req.params.id }, { $addToSet: { usersDisliked: req.body.userId }, $inc: { dislikes: +1 }})
        .then(() => res.status(200).json({ message: 'Sauce liked '}))
        .catch(error => res.status(400).json({ error }));
  }
};