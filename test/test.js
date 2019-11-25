'use strict';

var glyphs = require('../index');
var tape = require('tape');
var fs = require('fs');

var openSans512 = fs.readFileSync(__dirname + '/fixtures/opensans.512.767.pbf'),
    arialUnicode512 = fs.readFileSync(__dirname + '/fixtures/arialunicode.512.767.pbf'),
    league512 = fs.readFileSync(__dirname + '/fixtures/league.512.767.pbf'),
    composite512 = fs.readFileSync(__dirname + '/fixtures/opensans.arialunicode.512.767.pbf'),
    triple512 = fs.readFileSync(__dirname + '/fixtures/league.opensans.arialunicode.512.767.pbf'),
    lato512 = fs.readFileSync(__dirname + '/fixtures/lato.512.767.pbf'),
    latoLight512 = fs.readFileSync(__dirname + '/fixtures/latolight.512.767.pbf'),
    cascadiacode512 = fs.readFileSync(__dirname + '/fixtures/cascadiacode.512.767.pbf');

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

tape('compositing and providing fontstack string name', function(t) {
    var name = 'Open Sans Regular,Arial Unicode MS Regular';
    var composite_name = glyphs.decode(glyphs.combine([openSans512, arialUnicode512], name));
    var composite_noname = glyphs.decode(glyphs.combine([openSans512, arialUnicode512]));
    var expected = glyphs.decode(composite512);

    t.ok(composite_name.stacks, 'has stacks');
    t.equal(composite_name.stacks.length, 1, 'has one stack');

    t.deepEqual(composite_noname, expected);
    t.notEqual(composite_name, expected, 'not equal when provided non-spaced stack name');
    t.deepEqual(composite_name.stacks[0].glyphs, composite_noname.stacks[0].glyphs);
    t.deepEqual(composite_name.stacks[0].range, composite_noname.stacks[0].range);

    t.equal(composite_name.stacks[0].name, name, 'returns stacks with provided name');

    t.end();

});

tape('debug method shows decoded glyphs', function(t) {
    var something = glyphs.debug(openSans512, true);
    t.doesNotThrow(function() { JSON.parse(something); });
    t.equals(JSON.parse(something).stacks[0].glyphs.length, 16);

    var decoded = glyphs.debug(glyphs.decode(openSans512));
    t.doesNotThrow(function() { JSON.parse(decoded); });
    t.equals(JSON.parse(something).stacks[0].glyphs.length, 16);

    t.end();
});

tape('returns nothing when given nothing', function(t) {
    t.equals(glyphs.combine([]), undefined);
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

tape('ascender is set when available', function(t) {
    var cascadia = glyphs.decode(cascadiacode512);
    var lato = glyphs.decode(lato512);
    var latoLight = glyphs.decode(latoLight512);

    t.equal(cascadia.stacks[0].ascender, 23, 'ascender is set');
    t.equal(lato.stacks[0].ascender, 24, 'ascender is set');
    t.equal(latoLight.stacks[0].ascender, 24, 'ascender is set');
    t.end();
});

tape('descender is set when available', function(t) {
    var cascadia = glyphs.decode(cascadiacode512);
    var lato = glyphs.decode(lato512);
    var latoLight = glyphs.decode(latoLight512);

    t.equal(cascadia.stacks[0].descender, -6, 'descender is set');
    t.equal(lato.stacks[0].descender, -5, 'descender is set');
    t.equal(latoLight.stacks[0].descender, -5, 'descender is set');
    t.end();
});

tape('ascender is 0 when not set', function(t) {
    var decoded = glyphs.decode(openSans512);

    t.equal(decoded.stacks[0].ascender, 0, 'ascender is zero');
    t.end();
});

tape('descender is 0 when not set', function(t) {
    var decoded = glyphs.decode(openSans512);

    t.equal(decoded.stacks[0].descender, 0, 'descender is zero');
    t.end();
});

tape('ascender is set to value if all fonts have the same value', function(t) {
    var composite = glyphs.decode(glyphs.combine([lato512, latoLight512]));

    t.equal(composite.stacks[0].ascender, 24, 'ascender is set');
    t.end();
});

tape('descender is set to value if all fonts have the same value', function(t) {
    var composite = glyphs.decode(glyphs.combine([lato512, latoLight512]));

    t.equal(composite.stacks[0].descender, -5, 'descender is set');
    t.end();
});

tape('ascender is set to 0 if fonts have different values', function(t) {
    var composite = glyphs.decode(glyphs.combine([cascadiacode512, lato512]));

    t.equal(composite.stacks[0].ascender, 0, 'ascender is zero');
    t.end();
});

tape('descender is set to 0 if fonts have different values', function(t) {
    var composite = glyphs.decode(glyphs.combine([cascadiacode512, lato512]));

    t.equal(composite.stacks[0].descender, 0, 'descender is zero');
    t.end();
});
