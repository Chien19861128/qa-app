'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Section = mongoose.model('Section');

/**
 * Globals
 */
var user;
var section;

/**
 * Test Suites
 */
describe('<Unit Test>', function() {
  describe('Model Section:', function() {
    beforeEach(function(done) {
      user = new User({
        name: 'Full name',
        email: 'test@test.com',
        username: 'user',
        password: 'password'
      });

      user.save(function() {
        section = new Section({
          title: 'Section Title',
          content: 'Section Content',
          user: user
        });

        done();
      });
    });

    describe('Method Save', function() {
      it('should be able to save without problems', function(done) {
        return section.save(function(err) {
          should.not.exist(err);
          section.title.should.equal('Section Title');
          section.content.should.equal('Section Content');
          section.user.should.not.have.length(0);
          section.created.should.not.have.length(0);
          done();
        });
      });

      it('should be able to show an error when try to save without title', function(done) {
        section.title = '';

        return section.save(function(err) {
          should.exist(err);
          done();
        });
      });

      it('should be able to show an error when try to save without content', function(done) {
        section.content = '';

        return section.save(function(err) {
          should.exist(err);
          done();
        });
      });

      it('should be able to show an error when try to save without user', function(done) {
        section.user = {};

        return section.save(function(err) {
          should.exist(err);
          done();
        });
      });

    });

    afterEach(function(done) {
      section.remove();
      user.remove();
      done();
    });
  });
});
