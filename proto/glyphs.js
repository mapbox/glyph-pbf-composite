'use strict';

// glyph ========================================

var glyph = exports.glyph = {};

glyph.read = function (pbf, end) {
    return pbf.readFields(glyph._readField, {}, end);
};
glyph._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.id = pbf.readVarint();
    else if (tag === 2) obj.bitmap = pbf.readBytes();
    else if (tag === 3) obj.width = pbf.readVarint();
    else if (tag === 4) obj.height = pbf.readVarint();
    else if (tag === 5) obj.left = pbf.readSVarint();
    else if (tag === 6) obj.top = pbf.readSVarint();
    else if (tag === 7) obj.advance = pbf.readVarint();
};
glyph.write = function (obj, pbf) {
    if (obj.id !== undefined) pbf.writeVarintField(1, obj.id);
    if (obj.bitmap !== undefined) pbf.writeBytesField(2, obj.bitmap);
    if (obj.width !== undefined) pbf.writeVarintField(3, obj.width);
    if (obj.height !== undefined) pbf.writeVarintField(4, obj.height);
    if (obj.left !== undefined) pbf.writeSVarintField(5, obj.left);
    if (obj.top !== undefined) pbf.writeSVarintField(6, obj.top);
    if (obj.advance !== undefined) pbf.writeVarintField(7, obj.advance);
};

// fontstack ========================================

var fontstack = exports.fontstack = {};

fontstack.read = function (pbf, end) {
    return pbf.readFields(fontstack._readField, {glyphs: []}, end);
};
fontstack._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.name = pbf.readString();
    else if (tag === 2) obj.range = pbf.readString();
    else if (tag === 3) obj.glyphs.push(glyph.read(pbf, pbf.readVarint() + pbf.pos));
};
fontstack.write = function (obj, pbf) {
    if (obj.name !== undefined) pbf.writeStringField(1, obj.name);
    if (obj.range !== undefined) pbf.writeStringField(2, obj.range);
    if (obj.glyphs !== undefined) for (var i = 0; i < obj.glyphs.length; i++) pbf.writeMessage(3, glyph.write, obj.glyphs[i]);
};

// glyphs ========================================

var glyphs = exports.glyphs = {};

glyphs.read = function (pbf, end) {
    return pbf.readFields(glyphs._readField, {stacks: []}, end);
};
glyphs._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.stacks.push(fontstack.read(pbf, pbf.readVarint() + pbf.pos));
};
glyphs.write = function (obj, pbf) {
    if (obj.stacks !== undefined) for (var i = 0; i < obj.stacks.length; i++) pbf.writeMessage(1, fontstack.write, obj.stacks[i]);
};
