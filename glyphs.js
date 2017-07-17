'use strict';

var glyph = exports.glyph = {};

glyph.read = function (pbf, end) {
    var start = pbf.pos;
    var obj = pbf.readFields(glyph._readField, {id: 0}, end);
    obj._buf = pbf.buf.subarray(start, end);
    return obj;
};
glyph._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.id = pbf.readVarint();
};

var fontstack = exports.fontstack = {};

fontstack.read = function (pbf, end) {
    return pbf.readFields(fontstack._readField, {name: "", range: "", glyphs: []}, end);
};
fontstack._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.name = pbf.readString();
    else if (tag === 2) obj.range = pbf.readString();
    else if (tag === 3) obj.glyphs.push(glyph.read(pbf, pbf.readVarint() + pbf.pos));
};
fontstack.write = function (obj, pbf) {
    if (obj.name) pbf.writeStringField(1, obj.name);
    if (obj.range) pbf.writeStringField(2, obj.range);
    if (obj.glyphs) for (var i = 0; i < obj.glyphs.length; i++) pbf.writeBytesField(3, obj.glyphs[i]._buf);
};

var glyphs = exports.glyphs = {};

glyphs.read = function (pbf, end) {
    return pbf.readFields(glyphs._readField, {stacks: []}, end);
};
glyphs._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.stacks.push(fontstack.read(pbf, pbf.readVarint() + pbf.pos));
};
glyphs.write = function (obj, pbf) {
    if (obj.stacks) for (var i = 0; i < obj.stacks.length; i++) pbf.writeMessage(1, fontstack.write, obj.stacks[i]);
};
