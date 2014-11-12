'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Section = mongoose.model('Section'),
    User = mongoose.model('User'),
    _ = require('lodash'),
    //slug = require('slug'),
    uslug = require('uslug'),
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
    
    var d = new Date();
    var curr_utc_date = d.getUTCFullYear() + '-' + d.getUTCMonth() + '-' + d.getUTCDate()  + ' ' + d.getUTCHours() + ':' + d.getUTCMinutes() + ':' + d.getUTCSeconds();
        
    section.title = req.user.name + ' ' + curr_utc_date;
    section.slug = uslug(section.title);
    section.user_slug = req.user.slug;
            //section.user = req.user;

    section.save(function(err) {
        if (err) {
            return res.status(500).json({
                error: 'Cannot save the section'
            });
        }
        res.json(section);
    });
};

/**
 * Update an section
 */
exports.update = function(req, res) {
    var section = req.section;
    section = _.extend(section, req.body);
                                
    section.slug = uslug(section.title);

    section.save(function(err) {
        if (err) {
            return res.json(500, {
                error: 'Cannot update the section'
            });
        }
        res.json(section);
    });
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
        
        section.qr_code = qr.imageSync('http://askon.nodejitsu.com/#!/sections/' + section.slug, { type: 'svg' });
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
    
    var query = {};
    
    if (req.query.searchSection) {
        query = {
            title: new RegExp(req.query.searchSection, 'i')
        };
    }
    
    Section.find(query).sort('-created').populate('user', 'name username').limit(20).exec(function(err, sections) {
        if (err) {
            return res.json(500, {
                error: 'Cannot list the sections'
            });
        }
        var result = {
            attemptedUrl: req.session.attemptedUrl,
            sections: sections
        };
        
        req.session.attemptedUrl = '/';
        res.json(result);

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
        
        for (var i in section.issues) {
            if (section.issues[i].title === req.body.title) {
                section.error = 'Duplicate issue';
                return res.jsonp(section);
            }
        }
        
	    section.issues.push({
			title: req.body.title,
            slug: uslug(req.body.title),
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
 * Answered Issue
 */
exports.answeredIssue = function(req, res) {
    
    var this_i;
    
    for (var i in req.section.issues) {
        
        if (req.section.issues[i].slug === req.params.issueSlug) {
            this_i = i;
            break;
        }
    }
    
    if (req.user.slug===req.section.user_slug || req.user.slug===req.section.issues[this_i].user_slug) {
        req.section.issues[this_i].answered = new Date();
    
        req.section.save(function(err, section) {
            if (err) {
                return res.status(500).json({
                    error: 'Cannot mark issue answered'
                });
            } else { 
                return res.jsonp(section);
            }
        });
    } else {
        return res.status(500).json({
            error: 'Cannot mark issue answered'
        });
    }
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
