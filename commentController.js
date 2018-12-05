// add comment
// get all posts comments for post
// edit your comment
// delete your comment
// count comments

const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const { check, validationResult } = require('express-validator/check');
const router = express.Router();
const postController = require('./postController');


//add models
const Comment = require('../models/Comment');
const User = require('../models/User');

// check authorization
const authCheck = (req, res, next) => {
	if (req.session.user) {
		return next();
	}
	return res.status(401).send({ isLoggedIn: false });
};

// count users Comments +
const activityPlus = (req, res, next) => {
    User.findOneAndUpdate({_id : req.session.user._id}, {$inc : {'activity' : 1}})
    .then(() => {
        return next()
    })
    .catch(err => {
        return res.status(400).json({
            err
        });
    })
};

// count users Comments --
const activityMin = (req, res, next) => {
    User.findOneAndUpdate({_id : req.session.user._id}, {$inc : {'activity' : -1}})
    .then(() => {
        return next()
    })
    .catch(err => {
        return res.status(400).json({
            err
        });
    })
};

// validate comment
const validatecomment = [
    check('comment')
        .not()
        .isEmpty()
        .withMessage('Please writ your comment'),
];

 //Add Comment
 router.post('/addcomment', authCheck, validatecomment, activityPlus,(req, res) => {
     
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.mapped() });
    }
    const comment = new Comment(req.body);
    comment.user = req.session.user._id;
    // insert post ID from forntend 
    comment.save()
    .then(comment => {
        return res.json({
            ok: true,
            message: 'Your comment is successful'
        });
    })
    .catch(err => {
        return res.status(400).json({
            err
            //errors: { auth: { msg: 'Oooops... Something went wrong!' }}
        });
    });
});

// get all comments
router.get('/getallcomments', (req, res) => {
    Comment.find()
    .populate('user', { password: 0 })
    .sort({ createdAt: 'desc' })
    .then(comments => {
        res.json(comments);
    })
    .catch(err => res.json(err));
});


//get one Comment by id
router.get('/readcomment/:id', (req, res) => {
    Comment.findById({ _id: req.params.id })
    .populate('user', { password: 0 })
    .then(comment => {
        res.json(comment);
    })
    .catch(error => {
        res.json(error);
    });
});

// Edit Comment
router.put('/edit-comment/:id', authCheck, (req, res) => {
    // add user id check
    Comment.findByIdAndUpdate(req.params.id, req.body, {new: true})
    .then(comment => {
        return res.json(comment);
    })
    .catch(error => {
        res.json(error);
    });

});

// delete Comment
router.delete('/deletecomment/:id', authCheck,activityMin,(req, res) => {
    // add user id check
    Comment.findByIdAndRemove({ _id: req.params.id })
    .then(comment => {
        return res.json('Your Comment is deleted');
    })
    .catch(error => {
        res.json(error);
    });
});

module.exports = router;
