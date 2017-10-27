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

var packFormat = function(objData, bounds, stream)
{
    var index = stream.index;
    var buffer = stream.buffer;

    // size
    buffer.writeUInt16LE((objData.position.length/3)|0, index);
    index+=2;

    buffer.writeUInt16LE(objData.indices.length, index);
    index+=2;

    buffer.writeFloatLE(bounds.minX, index);
    index+=4;

    buffer.writeFloatLE(bounds.maxX, index);
    index+=4;

    buffer.writeFloatLE(bounds.minY, index);
    index+=4;

    buffer.writeFloatLE(bounds.maxY, index);
    index+=4;

    buffer.writeFloatLE(bounds.minZ, index);
    index+=4;

    buffer.writeFloatLE(bounds.maxZ, index);
    index+=4;

    stream.index = index;
}


module.exports = packFormat
