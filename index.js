'use strict';

var fs = require('fs');
var compile = require('pbf/compile');
var Pbf = require('pbf');
var schema = require('protocol-buffers-schema');

var proto = schema.parse(fs.readFileSync(__dirname + '/proto/glyphs.proto'));
var messages = compile(proto);

function decodeGlyphs(buffer) {
    return messages.glyphs.read(new Pbf(buffer));
}

function encodeGlyphs(glyphs) {
    var pbf = new Pbf();
    messages.glyphs.write(glyphs, pbf);
    return pbf.finish();
}

function debug(buffer, decode) {
    if (decode) buffer = decodeGlyphs(buffer);

    return JSON.stringify(buffer, function(k, v) {
        if (k !== 'bitmap') return v;
        return v ? Object.keys(v).length : v;
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
        var decoded = decodeGlyphs(buf);
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
        }
    }
    if (fontstack) result.stacks[0].name = fontstack;

    result.stacks[0].glyphs.sort(compareId);

    return encodeGlyphs(result);
}

function compareId(a, b) {
    return a.id - b.id;
}

module.exports = {
    combine: combine,
    debug: debug,
    encode: encodeGlyphs,
    decode: decodeGlyphs
};
