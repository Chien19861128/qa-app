'use strict';

angular.module('mean.sections').controller('SectionsController', ['$scope', '$stateParams', '$location', '$sce', '$timeout', 'Global', 'Sections', 'UserSections', 'SectionIssues', 'IssueVotes',
  function($scope, $stateParams, $location, $sce, $timeout, Global, Sections, UserSections, SectionIssues, IssueVotes) {
    $scope.global = Global.getData();
    $scope.autorefresh=true;
      
    $scope.hasAuthorization = function(section) {
        if (!section || !section.user_slug) return false;
        return $scope.global.isAdmin || section.user_slug === $scope.global.user.slug;
    };

    $scope.create = function(isValid) {
        if (isValid) {
            var section = new Sections({
                title: this.title
            });
            section.$save(function(response) {
                $location.path('sections/' + response.slug);
            });

            this.title = '';
        } else {
            $scope.submitted = true;
        }
    };

    $scope.createIssue = function(isValid) {
        if (isValid) {
            var issue = new SectionIssues({
                slug: $stateParams.sectionSlug,
                title: this.newIssue
            });
            issue.$save(function(response) {
                window.location.reload();
                //$location.path('sections/' + response.slug);
            });

            this.title = '';
        } else {
            $scope.submitted = true;
        }
    };

    $scope.upvoteIssue = function(issueSlug) {
        var issue_votes = new IssueVotes({
            sectionSlug: $stateParams.sectionSlug,
            issueSlug: issueSlug,
            voteType: 'upvotes'
        });
        issue_votes.$save(function(response) {
            window.location.reload();
        });
    };

    $scope.downvoteIssue = function(issueSlug) {
        var issue_votes = new IssueVotes({
            sectionSlug: $stateParams.sectionSlug,
            issueSlug: issueSlug,
            voteType: 'downvotes'
        });
        issue_votes.$save(function(response) {
            window.location.reload();
        });
    };

    $scope.remove = function(section) {
        if (section) {
            section.$remove();

            for (var i in $scope.sections) {
                if ($scope.sections[i] === section) {
                    $scope.sections.splice(i, 1);
                }
            }
        } else {
            $scope.section.$remove(function(response) {
                $location.path('sections');
            });
        }
    };

    $scope.update = function(isValid) {
        if (isValid) {
            var section = $scope.section;
            if (!section.updated) {
                section.updated = [];
            }
            section.updated.push(new Date().getTime());

            section.$update(function() {
                $location.path('sections/' + section.slug);
            });
        } else {
            $scope.submitted = true;
        }
    };

    $scope.find = function() {
        Sections.query(function(sections) {
            $scope.sections = sections;
        });
    };

    $scope.findUserAll = function() {
        UserSections.query(function(sections) {
            $scope.sections = sections;
        });
    };

    $scope.findOne = function(autorefresh, isauto) {
        Sections.get({
            sectionSlug: $stateParams.sectionSlug
        }, function(section) {
            var up_count;
            var down_count;
            
            for (var i in section.issues) {
                if (typeof section.issues[i].upvotes !== 'undefined') 
                    up_count = section.issues[i].upvotes.length;
                else 
                    up_count = 0;
                if (typeof section.issues[i].downvotes !== 'undefined') 
                    down_count = section.issues[i].downvotes.length;
                else 
                    down_count = 0;
                
                section.issues[i].popularity = up_count - down_count;
                
                if (up_count > 0 && section.issues[i].upvotes.indexOf($scope.global.user.slug) > -1) 
                    section.issues[i].can_upvote = false;
                else 
                    section.issues[i].can_upvote = true;
                if (down_count > 0 && section.issues[i].downvotes.indexOf($scope.global.user.slug) > -1) 
                    section.issues[i].can_downvote = false;
                else 
                    section.issues[i].can_downvote = true;
            }
            //console.log('[autorefresh]'+autorefresh);
            if (false===autorefresh) 
                $scope.autorefresh=false;
            else 
                $scope.autorefresh=true;
            if (!isauto) 
                $scope.section = section;
            else 
                $scope.section.issues = section.issues;
            $scope.section.qr_code = $sce.trustAsHtml(section.qr_code);
        });
        
        if ($scope.autorefresh===true) 
            $timeout(function() { $scope.findOne($scope.autorefresh, true); }, 10 * 1000);
    };

    $scope.findSectionIssues = function() {
        Sections.get({
            sectionSlug: $stateParams.sectionSlug
        }, function(issues) {
            $scope.issues = issues;
        });
    };
}]);
