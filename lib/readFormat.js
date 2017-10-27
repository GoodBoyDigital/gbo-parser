// ObjLoader.js

'use strict';

// 4 units..
// size - uint
// indecies-size  - uint

// 6 floats
// minX - float
// maxX - float
// minY - float
// maxY - float
// minZ - float
// maxZ - float

var readFormat = function(out, stream)
{
    var index = stream.index;
    var buffer = stream.buffer;

    // size
    out.size = buffer.readUInt16LE(index);
    index+=2

    out.indexSize = buffer.readUInt16LE(index);
    index+=2

    var bounds = {};

    bounds.minX = buffer.readFloatLE( index );
    index+=4

    bounds.maxX = buffer.readFloatLE( index );
    index+=4

    bounds.minY = buffer.readFloatLE( index );
    index+=4

    bounds.maxY = buffer.readFloatLE( index );
    index+=4

    bounds.minZ = buffer.readFloatLE( index );
    index+=4

    bounds.maxZ = buffer.readFloatLE( index );
    index+=4

    out.bounds = bounds;

    stream.index = index;

    return out
}


module.exports = readFormat
