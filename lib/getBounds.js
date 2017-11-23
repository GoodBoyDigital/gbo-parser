// ObjLoader.js

'use strict';


function getBounds(position)
{
    var verts = position;

    var minX = Infinity;
    var maxX = -Infinity;

    var minY = Infinity;
    var maxY = -Infinity;

    var minZ = Infinity;
    var maxZ = -Infinity;

    for (var i = 0; i < verts.length; i+=3)
    {
        var x = verts[i];
        var y = verts[i+1];
        var z = verts[i+2];
        if(x < minX)minX = x;
        if(x > maxX)maxX = x;

        if(y < minY)minY = y;
        if(y > maxY)maxY = y;

        if(z < minZ)minZ = z;
        if(z > maxZ)maxZ = z;

    };

    var sizeX = maxX - minX;
    var sizeY = maxY - minY;
    var sizeZ = maxZ - minZ;

    return {
        minX,
        maxX,
        minY,
        maxY,
        minZ,
        maxZ,
        sizeX,
        sizeY,
        sizeZ,
    };
}

module.exports = getBounds
