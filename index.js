'use strict';

var Pbf = require('pbf');
var Glyphs = require('./proto/glyphs.js').glyph;

function debug(buffer, parse) {
    if (parse) {
        var pbf = new Pbf(buffer);
        buffer = decode(pbf);
    }

    return JSON.stringify(buffer, function(k, v) {
        if (k !== 'bitmap') return v;
        return v ? v.length : v;
    }, 2);
}

function encode(obj) {
    var pbf = new Pbf();
    Glyphs.write(obj, pbf);
    return pbf.finish();
}

function decode(buffer) {
    var pbf = new Pbf(buffer);
    return Glyphs.read(pbf);
}

/**
 * Combine any number of glyph (SDF) PBFs.
 * Returns a re-encoded PBF with the combined
 * font faces, composited using array order
 * to determine glyph priority.
 * @param {array} buffers An array of SDF PBFs.
 */
function combine(buffers, fontstack) {
    var result,
        coverage = {};

    buffers.forEach(function(buffer) {
        var decoded = decode(buffer);
        var glyphs = decoded.stacks[0].glyphs;
        if (!result) {
            glyphs.forEach(function(glyph) {
                coverage[glyph.id] = true;
            });
            result = decoded;
        } else {
            glyphs.forEach(function(glyph) {
                if (!coverage[glyph.id]) {
                    result.stacks[0].glyphs.push(glyph);
                    coverage[glyph.id] = true;
                }
            });
            result.stacks[0].name += ', ' + decoded.stacks[0].name;
        }
    });
    if (fontstack) result.stacks[0].name = fontstack;

    result.stacks[0].glyphs.sort(function(a, b) { return a.id - b.id; });

    return encode(result);
}

module.exports = {
    combine: combine,
    debug: debug,
    encode: encode,
    decode: decode
};
