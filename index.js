'use strict';

var protobuf = require('protocol-buffers');
var fs = require('fs');

var messages = protobuf(fs.readFileSync(__dirname + '/proto/glyphs.proto'));

function debug(buffer, decode) {
    if (decode) buffer = messages.glyphs.decode(buffer);

    return JSON.stringify(buffer, function(k, v) {
        if (k !== 'bitmap') return v;
        return v ? v.length : v;
    }, 2);
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

    buffers.forEach(function(buf) {
        var decoded = messages.glyphs.decode(buf);
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

    return messages.glyphs.encode(result);
}

module.exports = {
    combine: combine,
    debug: debug,
    encode: messages.glyphs.encode,
    decode: messages.glyphs.decode
};
