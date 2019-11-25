'use strict';

var protobuf = require('protocol-buffers');
var fs = require('fs');
var path = require('path');

var messages = protobuf(fs.readFileSync(path.join(__dirname, './proto/glyphs.proto')));

function debug(buffer, decode) {
    if (decode) buffer = messages.glyphs.decode(buffer);

    return JSON.stringify(buffer, function(k, v) {
        if (k !== 'bitmap') return v;
        return v ? v.data.length : v;
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

    if (!buffers || buffers.length === 0) return;

    for (var i = 0, j; i < buffers.length; i++) {
        var buf = buffers[i];
        var decoded = messages.glyphs.decode(buf);
        var glyphs = decoded.stacks[0].glyphs;
        if (!result) {
            for (j = 0; j < glyphs.length; j++) {
                coverage[glyphs[j].id] = true;
            }
            result = decoded;
        } else {
            for (j = 0; j < glyphs.length; j++) {
                var glyph = glyphs[j];
                if (!coverage[glyph.id]) {
                    result.stacks[0].glyphs.push(glyph);
                    coverage[glyph.id] = true;
                }
            }
            result.stacks[0].name += ', ' + decoded.stacks[0].name;

            if (result.stacks[0].ascender !== decoded.stacks[0].ascender) {
                result.stacks[0].ascender = 0;
            }
            if (result.stacks[0].descender !== decoded.stacks[0].descender) {
                result.stacks[0].descender = 0;
            }
        }
    }
    if (fontstack) result.stacks[0].name = fontstack;

    result.stacks[0].glyphs.sort(compareId);

    return messages.glyphs.encode(result);
}

function compareId(a, b) {
    return a.id - b.id;
}

module.exports = {
    combine: combine,
    debug: debug,
    encode: messages.glyphs.encode,
    decode: messages.glyphs.decode
};
