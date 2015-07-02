/* jshint node: true */
/* global beforeEach, afterEach, describe, it */

'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinon = require('sinon');

chai.use(chaiAsPromised);

// var should = chai.should();
chai.should();

describe('Formatter', function () {
  var Formatter = require('../');
  var formatter;
  var baseMicroformatData;
  var clock;

  beforeEach(function () {
    clock = sinon.useFakeTimers(1435674000000);

    formatter = new Formatter();
    baseMicroformatData = {
      'type': ['h-entry'],
      'properties': {
        'content': ['hello world'],
        'name': ['awesomeness is awesome'],
        'slug': ['awesomeness-is-awesome'],
        'published': [new Date(1435674841000)],
      },
    };
  });

  afterEach(function () {
    clock.restore();
  });

  describe('format', function () {

    it('should return a fully formatted page on sunny day content', function () {
      return formatter.format(baseMicroformatData).should.eventually.equal(
        '---\n' +
        'layout: post\n' +
        'date: \'2015-06-30T14:34:01.000Z\'\n' +
        'title: awesomeness is awesome\n' +
        'slug: awesomeness-is-awesome\n' +
        '---\n' +
        'hello world\n'
      );
    });

    it('should handle non-existing title', function () {
      delete baseMicroformatData.properties.name;

      return formatter.format(baseMicroformatData).should.eventually.equal(
        '---\n' +
        'layout: post\n' +
        'date: \'2015-06-30T14:34:01.000Z\'\n' +
        'slug: awesomeness-is-awesome\n' +
        '---\n' +
        'hello world\n'
      );
    });

    it('should handle non-existing slug', function () {
      baseMicroformatData.properties.slug = [];

      return formatter.format(baseMicroformatData).should.eventually.equal(
        '---\n' +
        'layout: post\n' +
        'date: \'2015-06-30T14:34:01.000Z\'\n' +
        'title: awesomeness is awesome\n' +
        '---\n' +
        'hello world\n'
      );
    });

    it('should handle non-existing content', function () {
      delete baseMicroformatData.properties.content;

      return formatter.format(baseMicroformatData).should.eventually.equal(
        '---\n' +
        'layout: post\n' +
        'date: \'2015-06-30T14:34:01.000Z\'\n' +
        'title: awesomeness is awesome\n' +
        'slug: awesomeness-is-awesome\n' +
        '---\n'
      );
    });

    it('should handle categories', function () {
      baseMicroformatData.properties.category = ['foo', 'bar'];

      return formatter.format(baseMicroformatData).should.eventually.equal(
        '---\n' +
        'layout: post\n' +
        'date: \'2015-06-30T14:34:01.000Z\'\n' +
        'title: awesomeness is awesome\n' +
        'slug: awesomeness-is-awesome\n' +
        'tags: foo bar\n' +
        '---\n' +
        'hello world\n'
      );
    });

  });

  describe('_formatSlug', function () {

    beforeEach(function () {
      delete baseMicroformatData.properties.slug;
    });

    it('should base slug on title', function () {
      return formatter._formatSlug(baseMicroformatData).should.equal('awesomeness-is-awesome');
    });

    it('should fall back to base slug on content', function () {
      delete baseMicroformatData.properties.name;
      return formatter._formatSlug(baseMicroformatData).should.equal('hello-world');
    });

    it('should ulimately return empty slug', function () {
      delete baseMicroformatData.properties.name;
      delete baseMicroformatData.properties.content;
      return formatter._formatSlug(baseMicroformatData).should.equal('');
    });

  });

  describe('formatFilename', function () {

    it('should use slug', function () {
      return formatter.formatFilename(baseMicroformatData).should.eventually.equal('_posts/2015-06-30-awesomeness-is-awesome.html');
    });

    it('should handle lack of slug', function () {
      baseMicroformatData.properties.slug = [];
      return formatter.formatFilename(baseMicroformatData).should.eventually.equal('_posts/2015-06-30.html');
    });

  });

  describe('formatURL', function () {

    it('should base URL on slug', function () {
      return formatter.formatURL(baseMicroformatData).should.eventually.equal('2015/06/awesomeness-is-awesome/');
    });

    it('should handle lack of slug', function () {
      baseMicroformatData.properties.slug = [];
      return formatter.formatURL(baseMicroformatData).should.eventually.equal('2015/06/');
    });

    it('should return absolute URL when requested', function () {
      return formatter.formatURL(baseMicroformatData, 'http://example.com/foo/').should.eventually.equal('http://example.com/foo/2015/06/awesomeness-is-awesome/');
    });

  });

  describe('preFormat', function () {

    it('should add published', function () {
      delete baseMicroformatData.properties.published;
      return formatter.preFormat(baseMicroformatData).should.eventually.have.deep.property('properties.published[0]').that.is.an.instanceOf(Date).and.eql(new Date());
    });

    it('should ensure slug', function () {
      delete baseMicroformatData.properties.slug;
      return formatter.preFormat(baseMicroformatData).should.eventually.have.deep.property('properties.slug[0]', 'awesomeness-is-awesome');
    });

    it('should handle missing slug', function () {
      delete baseMicroformatData.properties.name;
      delete baseMicroformatData.properties.content;
      delete baseMicroformatData.properties.slug;
      return formatter.preFormat(baseMicroformatData).should.eventually.have.deep.property('properties.slug').that.is.equal([]);
    });

  });

});
