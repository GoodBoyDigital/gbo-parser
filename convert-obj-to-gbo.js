var fs = require('fs');
var objParser = require('./lib/objParser');
var packFormat = require('./lib/packFormat');
var getBounds = require('./lib/getBounds');

// load a model

var convertObjToGBO = function(objSource, out)
{
  //  var data = fs.readFileSync('../assets/03.obj', 'utf8')
    var data = fs.readFileSync(objSource, 'utf8')

    var objData = objParser(data);

    var wstream = fs.createWriteStream(out);

    var size = objData.position.length * 2;
    size += objData.uv.length * 2;
    size += objData.normals.length * 2;
    size += objData.indices.length * 2;
    size += 28;

    //size = 28

    // get bounds..
    var bounds = getBounds(objData.position);

    //prepare the length of the buffer to 4 bytes per float
    var buffer = new Buffer(size);

    var index = 0;

    var stream = {buffer, index};

    packFormat(objData, bounds, stream);


    var packCompressFloatData = function(stream, data)
    {
        var buffer = stream.buffer;
        var index = stream.index;

        for(var i = 0; i < data.length; i+=3)
        {

            //write the float in Little-Endian and move the offset
            var x = data[i];
            x -= bounds.minX;
            x /= bounds.sizeX;
            x *= 65535;

            buffer.writeUInt16LE(x|0 , index);
            index+=2

            var y = data[i+1];
            y -= bounds.minY;
            y /= bounds.sizeY;
            y *= 65535;

            buffer.writeUInt16LE(y|0 , index);
            index+=2

            var z = data[i+2];
            z -= bounds.minZ;
            z /= bounds.sizeZ;
            z *= 65535;

            buffer.writeUInt16LE(z|0 , index);
            index+=2

        }

        stream.index = index;
    }

    var packCompressUVData = function(stream, data)
    {
        var buffer = stream.buffer;
        var index = stream.index;

        for(var i = 0; i < data.length; i+=2){
            //write the float in Little-Endian and move the offset
            var u = data[i];
            u *= 65535;
            buffer.writeUInt16LE(u|0 , index);
            index+=2

            var v = data[i+1];
            v *= 65535;
            buffer.writeUInt16LE(v|0 , index);
            index+=2
        }

        stream.index = index;
    }

    var packCompressNormalData = function(stream, data)
    {
        var buffer = stream.buffer;
        var index = stream.index;

        for(var i = 0; i < data.length; i++){
            //write the float in Little-Endian and move the offset
            var n = data[i];
            n += 1;
            n /= 2;
            n *= 65535;
            buffer.writeUInt16LE(n|0 , index);
            index+=2
        }

       stream.index = index;

    }

    var packUintData = function(stream, data)
    {
        var buffer = stream.buffer;
        var index = stream.index;

        for(var i = 0; i < data.length; i++){

            //write the float in Little-Endian and move the offset
            buffer.writeUInt16LE(data[i], index);
            index += 2;
        }

        stream.index = index;
    }

    packCompressFloatData(stream, objData.position)

    packCompressUVData(stream, objData.uv)

    packCompressNormalData(stream, objData.normals)

    packUintData(stream, objData.indices)

    wstream.write(buffer);
    wstream.end();
}


module.exports = convertObjToGBO

