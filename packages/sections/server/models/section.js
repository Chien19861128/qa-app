'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Section Schema
 */
var IssueSchema = new Schema({
    slug: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    answered: {
        type: Date
    },
    upvotes: {
        type: Array
    },
    downvotes: {
        type: Array
    },
    user_slug: {
        type: String,
        required: true
    }
});


var SectionSchema = new Schema({
    slug: {
        type: String,
        unique: true,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    title: {
        type: String,
        trim: true,
        default: 'Unnamed'
    },
    content: {
        type: String,
        trim: true
    },
    user_slug: {
        type: String,
        required: true
    },
	issues: [IssueSchema],
});

/**
 * Validations
 */

/**
 * Statics
 */
/*SectionSchema.statics.load = function(id, cb) {
   this.findOne({
        slug: slug
    }).populate('user', 'name username').exec(cb);
};*/

mongoose.model('Section', SectionSchema);
