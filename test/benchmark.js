'use strict';

var Benchmark = require('benchmark');
var fs = require('fs');
var glyphs = require('..');
var arialUnicode0255 = fs.readFileSync(__dirname + '/fixtures/arialunicode.0.255.pbf'),
    openSans0255 = fs.readFileSync(__dirname + '/fixtures/opensansbold.0.255.pbf'),
    dinoffcpro0255 = fs.readFileSync(__dirname + '/fixtures/dinoffcpro.0.255.pbf');

new Benchmark('glyphs.combine three fonts', function() {
    glyphs.combine([arialUnicode0255, openSans0255, dinoffcpro0255]);
})
.on('complete', function(event) {
    console.log(String(event.target));
})
.run();
