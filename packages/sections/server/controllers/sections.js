'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Section = mongoose.model('Section'),
    User = mongoose.model('User'),
    _ = require('lodash'),
    slug = require('slug'),
    qr = require('qr-image');
//var util = require('util');

/**
 * Find section by id
 */
exports.section = function(req, res, next, slug) {
    
    Section.findOne({
        slug: slug
    }).populate('user', 'name username').exec(function(err, section) {
        if (err) return next(err);
        if (!section) return next(new Error('Failed to load section ' + slug));
        
        req.section = section;
        next();
    });
  /*Section.load(id, function(err, section) {
    if (err) return next(err);
    if (!section) return next(new Error('Failed to load section ' + id));
    req.section = section;
    next();
  });*/
};

/**
 * Find user by id
 */
exports.user = function(req, res, next, slug) {
    User.findOne({
        slug: slug
    }).exec(function(err, user) {
        if (err) return next(err);
        if (!user) return next(new Error('Failed to load user ' + slug));
        req.thisuser = user;
        next();
    });
};

/**
 * Create an section
 */
exports.create = function(req, res) {
    var section = new Section(req.body);
    
    if (req.body.title && 0 === req.body.title.indexOf('Unnamed')) {
        return res.json(500, {
            error: 'Cannot title the section Unnamed'
        });
    } else {
        Section.findOne({
            title: new RegExp('^Unnamed')
        }).sort('-created').exec(function(err, unnamed_section) {
            if (unnamed_section) {
                var seqno = parseInt(unnamed_section.title.replace('Unnamed', ''), 10);
                
                if (isNaN(seqno)) seqno = 1;
                else seqno += 1;
                
                section.title = 'Unnamed' + seqno;
            } else {
                section.title = 'Unnamed';
            }
                                
            section.slug = slug(section.title);
            section.user_slug = req.user.slug;
            //section.user = req.user;

            section.save(function(err) {
                if (err) {
                    console.log('[err]'+err);
                    return res.status(500).json({
                        error: 'Cannot save the section'
                    });
                }
                res.json(section);

            });
            
        });
        
    }
};

/**
 * Update an section
 */
exports.update = function(req, res) {
    var section = req.section;
    
    if (0 === req.body.title.indexOf('Unnamed')) {
        return res.json(500, {
            error: 'Cannot title the section Unnamed'
        });
    } else {
        section = _.extend(section, req.body);
        section.slug = slug(section.title);

        section.save(function(err) {
            if (err) {
                return res.json(500, {
                    error: 'Cannot update the section'
                });
            }
            res.json(section);
        });
    }
};

/**
 * Delete an section
 */
exports.destroy = function(req, res) {
    var section = req.section;

    section.remove(function(err) {
        if (err) {
            return res.json(500, {
                error: 'Cannot delete the section'
            });
        }
        res.json(section);

    });
};

/**
 * Show an section
 */
exports.show = function(req, res) {
    
    Section.findOne({
        slug: req.params.sectionSlug
    }).populate('user', 'name username').lean().exec(function(err, section) {
        if (err) return err;
        if (!section) return new Error('Failed to load section ' + req.params.sectionSlug);
        
        section.qr_code = qr.imageSync('http://localhost:3000/#!/sections/' + section.slug, { type: 'svg' });
        res.json(section);
    });
};

/**
 * Most recent Section
 */
exports.recentSection = function(req, res) {
    Section.findOne({
        user: req.thisuser._id
    }).sort('-created').populate('user', 'name username').exec(function(err, section) {
        if (err) {
            return res.json(500, {
                error: 'Cannot find the section'
            });
        }
        res.json(section);

    });
};

/**
 * List of Sections
 */
exports.all = function(req, res) {
    Section.find().sort('-created').populate('user', 'name username').exec(function(err, sections) {
        if (err) {
            return res.json(500, {
                error: 'Cannot list the sections'
            });
        }
        res.json(sections);

    });
};

/**
 * List of Sections
 */
exports.userAll = function(req, res) {
    Section.find({
        user_slug: req.thisuser.slug
    }).sort('-created').populate('user', 'name username').exec(function(err, sections) {
        if (err) {
            return res.json(500, {
                error: 'Cannot list the sections'
            });
        }
        res.json(sections);

    });
};


/**
 * Add Issue
 */
exports.createIssue = function(req, res) {   
    Section.findOne({
        slug: req.params.sectionSlug
    })
    .exec(function (err, section) {
        if (err) return err;
        if (!section) return new Error('Failed to load Section');
	    section.issues.push({
			title: req.body.title,
            slug: slug(req.body.title),
            user_slug: req.user.slug
		});
                                
        section.save(function(err) {
            if (err) {
                return res.status(500).json({
                    error: 'Cannot save the issue'
                });
            } else { 
                return res.jsonp(section);
            }
        });
    });
};

/**
 * Upvote Issue
 */
exports.upvoteIssue = function(req, res) {
    var this_i;
    
    for (var i in req.section.issues) {
        
        if (req.section.issues[i].slug === req.params.issueSlug) {
            this_i = i;
            break;
        }
    }
    
    var upvote_index;
    var downvote_index;
    if (req.section.issues[this_i].upvotes.length) {
        upvote_index = req.section.issues[this_i].upvotes.indexOf(req.user.slug);
    } else {
        upvote_index = -1;
    }
    if (req.section.issues[this_i].downvotes.length) {
        downvote_index = req.section.issues[this_i].downvotes.indexOf(req.user.slug);
    } else {
        downvote_index = -1;
    }
    
    if (upvote_index > -1) {
        return res.status(500).json({
            error: 'Already upvoted'
        });
    } else if (downvote_index > -1) {
        req.section.issues[this_i].downvotes.splice(downvote_index, 1);
        req.section.save(function(err, section) {
            if (err) {
                return res.status(500).json({
                    error: 'Cannot upvote issue'
                });
            } else { 
                return res.jsonp(section);
            }
        });
    } else {
        req.section.issues[this_i].upvotes.push(req.user.slug);
        req.section.save(function(err, section) {
            if (err) {
                return res.status(500).json({
                    error: 'Cannot upvote issue'
                });
            } else { 
                return res.jsonp(section);
            }
        });
    }
}; 

/**
 * Downvote Issue
 */
exports.downvoteIssue = function(req, res) {
    var this_i;
    
    for (var i in req.section.issues) {
        
        if (req.section.issues[i].slug === req.params.issueSlug) {
            this_i = i;
            break;
        }
    }
    
    var upvote_index;
    var downvote_index;
    if (req.section.issues[this_i].upvotes.length) {
        upvote_index = req.section.issues[this_i].upvotes.indexOf(req.user.slug);
    } else {
        upvote_index = -1;
    }
    if (req.section.issues[this_i].downvotes.length) {
        downvote_index = req.section.issues[this_i].downvotes.indexOf(req.user.slug);
    } else {
        downvote_index = -1;
    }
    
    if (downvote_index > -1) {
        return res.status(500).json({
            error: 'Already downvoted'
        });
    } else if (upvote_index > -1) {
        req.section.issues[this_i].upvotes.splice(upvote_index, 1);
        req.section.save(function(err, section) {
            if (err) {
                return res.status(500).json({
                    error: 'Cannot downvote issue'
                });
            } else { 
                return res.jsonp(section);
            }
        });
    } else {
        req.section.issues[this_i].downvotes.push(req.user.slug);
        req.section.save(function(err, section) {
            if (err) {
                return res.status(500).json({
                    error: 'Cannot downvote issue'
                });
            } else { 
                return res.jsonp(section);
            }
        });
    }
}; 
