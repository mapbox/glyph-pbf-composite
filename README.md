# glyph-pbf-composite

Combine glyph (SDF) PBFs on the fly.


### `combine(buffers)`

Combine any number of glyph (SDF) PBFs.
Returns a re-encoded PBF with the combined
font faces, composited using array order
to determine glyph priority.

### Parameters

| parameter | type  | description           |
| --------- | ----- | --------------------- |
| `buffers` | array | An array of SDF PBFs. |


## Installation

Requires [nodejs](http://nodejs.org/).

```sh
$ npm install glyph-pbf-composite
```

## Tests

```sh
$ npm test
```

