'use strict';

//Sections service used for sections REST endpoint
angular.module('mean.sections').factory('Sections', ['$resource',
  function($resource) {
    return $resource('sections/:sectionSlug', {
        sectionSlug: '@slug'
    }, {
	    query: {method:'GET', isArray:false},
        update: {
            method: 'PUT'
        }
    });
}]);

angular.module('mean.sections').factory('UserSections', ['$resource',
  function($resource) {
    return $resource(':userSlug/sections/', {
        sectionSlug: '@slug'
    }, {});
}]);

angular.module('mean.sections').factory('SectionIssues', ['$resource',
  function($resource) {
    return $resource('sections/:sectionSlug/issues', {
        sectionSlug: '@slug'
    }, {
	    get: {method:'GET', isArray:true},
        update: {method: 'PUT'}
    });
}]);

angular.module('mean.sections').factory('IssueAnswered', ['$resource',
  function($resource) {
    return $resource('sections/:sectionSlug/issues/:issueSlug/answered', {
        sectionSlug: '@sectionSlug',
        issueSlug: '@issueSlug'
    }, {
        update: {method: 'PUT'}
    });
}]);

angular.module('mean.sections').factory('IssueVotes', ['$resource',
  function($resource) {
    return $resource('sections/:sectionSlug/issues/:issueSlug/:voteType', {
        sectionSlug: '@sectionSlug',
        issueSlug: '@issueSlug',
        voteType: '@voteType'
    }, {
	    get: {method:'GET', isArray:true},
        update: {method: 'PUT'}
    });
}]);