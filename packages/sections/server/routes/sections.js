'use strict';

var sections = require('../controllers/sections');

// Section authorization helpers
var hasAuthorization = function(req, res, next) {
    if (!req.user.isAdmin && req.section.user.id !== req.user.id) {
        return res.send(401, 'User is not authorized');
    }
    next();
};

module.exports = function(Sections, app, auth) {

    app.route('/sections')
        .get(sections.all)
        .post(auth.requiresLogin, sections.create);
    app.route('/:userSlug/sections')
        .get(sections.userAll);
    app.route('/:userSlug/sections/latest')
        .get(sections.recentSection);
    app.route('/sections/:sectionSlug')
        .get(sections.show)
        .put(auth.requiresLogin, hasAuthorization, sections.update)
        .delete(auth.requiresLogin, hasAuthorization, sections.destroy);
    app.route('/sections/:sectionSlug/issues')
        //.get(sections.findIssues)
        .post(auth.requiresLogin, sections.createIssue);
    app.route('/sections/:sectionSlug/issues/:issueSlug/answered')
        .post(auth.requiresLogin, sections.answeredIssue);
    app.route('/sections/:sectionSlug/issues/:issueSlug/upvotes')
        .post(auth.requiresLogin, sections.upvoteIssue);
    app.route('/sections/:sectionSlug/issues/:issueSlug/downvotes')
        .post(auth.requiresLogin, sections.downvoteIssue);
    //app.route('/sections/:sectionSlug/issues/:issueSlug/downvotes')
    //    .post(auth.requiresLogin, sections.upvoteIssue);

    // Finish with setting up the articleId param
    app.param('sectionSlug', sections.section);
    app.param('userSlug', sections.user);
};
