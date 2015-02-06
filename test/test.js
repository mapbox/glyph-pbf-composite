'use strict';

var glyphs = require('../index');
var tape = require('tape');
var fs = require('fs');
var queue = require('queue-async');
var zlib = require('zlib');
var AWS = require('aws-sdk');
AWS.config.region = 'us-east-1';
var S3 = new AWS.S3({ params: { Bucket: 'mapbox' } });

var openSans512 = fs.readFileSync(__dirname + '/fixtures/opensans.512.767.pbf'),
    arialUnicode512 = fs.readFileSync(__dirname + '/fixtures/arialunicode.512.767.pbf'),
    league512 = fs.readFileSync(__dirname + '/fixtures/league.512.767.pbf'),
    composite512 = fs.readFileSync(__dirname + '/fixtures/opensans.arialunicode.512.767.pbf'),
    triple512 = fs.readFileSync(__dirname + '/fixtures/league.opensans.arialunicode.512.767.pbf');

tape('compositing two pbfs', function(t) {
    var composite = glyphs.decode(glyphs.combine([openSans512, arialUnicode512]));
    var expected = glyphs.decode(composite512);

    t.ok(composite.stacks, 'has stacks');
    t.equal(composite.stacks.length, 1, 'has one stack');

    var stack = composite.stacks[0];

    t.ok(stack.name, 'is a named stack');
    t.ok(stack.range, 'has a glyph range');
    t.deepEqual(composite, expected, 'equals a server-composited stack');

    composite = glyphs.encode(composite);
    expected = glyphs.encode(expected);

    t.deepEqual(composite, expected, 're-encodes nicely');

    var recomposite = glyphs.decode(glyphs.combine([league512, composite])),
        reexpect = glyphs.decode(triple512);

    t.deepEqual(recomposite, reexpect, 'can add on a third for good measure');

    t.end();
});

tape('can composite only one pbf', function(t) {
    var composite = glyphs.decode(glyphs.combine([openSans512]));
    var expected = glyphs.decode(openSans512);

    t.deepEqual(composite, expected, 'doesn\'t break itself');

    t.end();
});

tape('can composite more than two', function(t) {
    var composite = glyphs.decode(glyphs.combine([league512, openSans512, arialUnicode512]));
    var expected = glyphs.decode(triple512);

    t.deepEqual(composite, expected, 'can composite three');
    t.end();
});

tape('can get these off S3', function(t) {
    var q = queue();
    var getFont = function(face, cb) {
        var params = {
            Key: 'glyphs/production/v1/mapbox/' + face + '/0-255.pbf'
        };

        S3.getObject(params, function(err, data) {
            if (err) return cb(err);
            zlib.gunzip(data.Body, function(err, res) {
                if (err) return cb(err);
                return cb(null, res);
            });
        });

    };

    var faces = ['Open Sans Regular', 'Arial Unicode MS Regular'];
    for (var i = 0; i < faces.length; i++) q.defer(getFont, faces[i]);


    q.awaitAll(function(err, fonts) {
        if (err) return err;
        console.log(fonts);

        t.equal(fonts.length, 2, 'they\'re both there');

        var composite = glyphs.combine(fonts);
        t.ok(composite, 'combined');

        t.end();
    });

});
