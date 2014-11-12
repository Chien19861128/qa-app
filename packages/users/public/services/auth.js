'use strict';

//where we will store the attempted url
angular.module('mean.users').value('redirectToUrlAfterLogin', { url: '/' });

angular.module('mean.users').factory('Auth', ['$location', 'redirectToUrlAfterLogin', function ($location, redirectToUrlAfterLogin) {
    return {
        getAttemptedUrl: function() {
            return redirectToUrlAfterLogin.url;
        },
        saveAttemptUrl: function() {
            if($location.path().toLowerCase() !== '/auth/login') {
                redirectToUrlAfterLogin.url = $location.path();
            }
            else
                redirectToUrlAfterLogin.url = '/';
        },
        redirectToAttemptedUrl: function() {
            $location.path(redirectToUrlAfterLogin.url);
        }
    };
}]);
