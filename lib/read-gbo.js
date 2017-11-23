
var readGbo = function(buffer)
{
    return new Promise((resolve, refject)=>{

    	var out = {};

    	var index = 0
    	var stream = {buffer,
    				  uint16:new Uint16Array(buffer),
    				  float32:new Float32Array(buffer),
    				  index};

        // first read format
        var format = {};

        format.size = stream.uint16[index++];
        format.indexSize = stream.uint16[index++];
        format.bounds = {};

        var bounds = format.bounds;

        index = 1;

        bounds.minX = stream.float32[index++]
	    bounds.maxX = stream.float32[index++]

	    bounds.minY = stream.float32[index++]
	    bounds.maxY = stream.float32[index++]

	    bounds.minZ = stream.float32[index++]
	    bounds.maxZ = stream.float32[index++]

	    bounds.sizeX = bounds.maxX - bounds.minX;
	    bounds.sizeY = bounds.maxY - bounds.minY;
	    bounds.sizeZ = bounds.maxZ - bounds.minZ;

	    // read the positions..
	    out.position = new Float32Array(format.size * 3);
	    out.uv = new Float32Array(format.size * 2);
	    out.normals = new Float32Array(format.size * 3);
	    out.indices = new Uint16Array(format.indexSize);

	    index = 14;

	    // unpack positions..
	    for (var i = 0; i < format.size * 3; i+=3)
	    {
	    	var x = (( stream.uint16[index++] / 65535 ) * bounds.sizeX ) + bounds.minX;
	    	var y = (( stream.uint16[index++] / 65535 ) * bounds.sizeY ) + bounds.minY;
	    	var z = (( stream.uint16[index++] / 65535 ) * bounds.sizeZ ) + bounds.minZ;

	    	out.position[i] = x;
	    	out.position[i+1] = y;
	    	out.position[i+2] = z;
	    }

	    // unpack uvs
	    for (var i = 0; i < format.size * 2; i+=2)
	    {
	    	var u = stream.uint16[index++] / 65535;
	    	var v = stream.uint16[index++] / 65535;

	    	out.uv[i] = u;
	    	out.uv[i+1] = v;
	    }

	    // unpack normals
	    for (var i = 0; i < format.size * 3; i++)
	    {
	    	var n =  ( ( stream.uint16[index++] / 65535 ) * 2) - 1;
	    	out.normals[i] = n;
	    }

	    for (var i = 0; i < format.indexSize; i++)
	    {
	    	out.indices[i] = stream.uint16[index++];
	    }

	    resolve(out);
    })

  //  var data = fs.readFileSync('../assets/03.obj', 'utf8')
}

module.exports = readGbo

