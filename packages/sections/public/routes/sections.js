'use strict';

//Setting up route
angular.module('mean.sections').config(['$stateProvider', function($stateProvider) {
    // Check if the user is connected
    var checkLoggedin = function($q, $timeout, $http, $location, $injector) {
        // Initialize a new promise
        var deferred = $q.defer();

        // Make an AJAX call to check if the user is logged in
        $http.get('/loggedin').success(function(user) {
            // Authenticated
            if (user !== '0') {
                
                $timeout(deferred.resolve);
            }
            // Not Authenticated
            else {
                $timeout(deferred.reject);
                var Auth = $injector.get('Auth');
                Auth.saveAttemptUrl();
                $location.url('/auth/login');
            }
        });

        return deferred.promise;
    };
    
    //var checkAttemptedUrl = function($q, $injector) {
    //    var Auth = $injector.get('Auth');
    //    Auth.redirectToAttemptedUrl();
    //};
      
    // states for my app
    $stateProvider
    .state('all sections', {
        url: '/',
        templateUrl: 'sections/views/list.html',
        /*resolve: {
            loggedin: checkAttemptedUrl
        }*/
    })
    .state('user sections', {
        url: '/:userSlug/sections',
        templateUrl: 'sections/views/list-userall.html',
        resolve: {
            loggedin: checkLoggedin
        }
    })
    .state('edit section', {
        url: '/sections/:sectionSlug/edit',
        templateUrl: 'sections/views/edit.html',
        resolve: {
            loggedin: checkLoggedin
        }
    })
    .state('section by id', {
        url: '/sections/:sectionSlug',
        templateUrl: 'sections/views/view.html'
        //resolve: {
        //    loggedin: checkLoggedin
        //}
    });
}]);
