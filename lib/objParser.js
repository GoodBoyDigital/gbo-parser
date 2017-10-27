// ObjLoader.js

'use strict';

function flatten(array, size = 3)
{
    var flat = [];

    for (var i = 0; i < array.length; i++) {

        for (var j = 0; j < size; j++) {
            flat[(i * size) + j] = array[i][j];
        };
    };

    return new Float32Array( flat );

}

function compressObj(o)
{
    var stringified = [];

    for(var i = 0; i < o.indices.length; i++)
    {
        var index = o.indices[i];

        var pos = o.positions[index];
        var normals = o.normals[index];
        var coords = o.coords[index];

        stringified.push(pos.concat(normals).concat(coords).toString());
        //console.log(pos, normals, coords);
    }

    var positions = [];
    var normals = [];
    var coords = [];
    var indices = [];
    var seen = {};
    var indexHash = {};
    var indexCount = 0;

    for (var i = 0; i < stringified.length; i++)
    {
        var id = stringified[i]

        if(seen[id])
        {
            //console.log('duplicate found ' + i)
            indices.push(indexHash[id]);
        }
        else
        {
            seen[id] = id;
            //console.log('new found ' + i)
            positions.push(o.positions[i])
            normals.push(o.normals[i])
            coords.push(o.coords[i])

            indices.push(indexCount);

            indexHash[id] = indexCount;
            indexCount++;
        }

    }

    o.positions = positions;
    o.normals = normals;
    o.coords = coords;
    o.indices = indices;
}

function _generateMeshes(o) {

    compressObj(o);

    return {
        uv:flatten(o.coords, 2),
        position:flatten(o.positions, 3),
        normals:flatten(o.normals, 3),
        indices:new Uint16Array(o.indices)
    }
/*
    var geometry = new PIXI.mesh.Geometry()
    .addAttribute('uv', flatten(o.coords, 2), 2 )
    .addAttribute('position',  flatten(o.positions), 3 )
    .addAttribute('normals',  flatten(o.normals), 3 )
    .addIndex(new Uint16Array(o.indices) )

    geometry.drawCalls = o.groups;

    return geometry;
    */
}

function parseObj(objStr)
{
	const lines = objStr.split('\n');

    const groups = [];
	const positions    = [];
	const coords       = [];
	const finalNormals = [];
	const vertices     = [];
	const normals      = [];
	const uvs          = [];
	const indices      = [];
	let count        = 0;
	let result;

	// v float float float
	const vertexPattern = /v( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;

	// vn float float float
	const normalPattern = /vn( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;

	// vt float float
	const uvPattern = /vt( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;

	// f vertex vertex vertex ...
	const facePattern1 = /f( +-?\d+)( +-?\d+)( +-?\d+)( +-?\d+)?/;

	// f vertex/uv vertex/uv vertex/uv ...
	const facePattern2 = /f( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))?/;

	// f vertex/uv/normal vertex/uv/normal vertex/uv/normal ...
	const facePattern3 = /f( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))?/;

	// f vertex//normal vertex//normal vertex//normal ...
	const facePattern4 = /f( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))?/;

    const mtlPattern = /usemtl/

    let lastMaterial = null;

    function parseVertexIndex(value)
    {
        const index = parseInt(value);
        return (index >= 0 ? index - 1 : index + vertices.length / 3) * 3;
    }

    function parseNormalIndex(value)
    {
        const index = parseInt(value);
        return (index >= 0 ? index - 1 : index + normals.length / 3) * 3;
    }

    function parseUVIndex(value)
    {
        const index = parseInt(value);
        return (index >= 0 ? index - 1 : index + uvs.length / 2) * 2;
    }

    function addVertex(a, b, c)
    {
        positions.push([vertices[a], vertices[a + 1], vertices[a + 2]]);
        positions.push([vertices[b], vertices[b + 1], vertices[b + 2]]);
        positions.push([vertices[c], vertices[c + 1], vertices[c + 2]]);

        indices.push(count * 3 + 0);
        indices.push(count * 3 + 1);
        indices.push(count * 3 + 2);

        count ++;
    }

    function addUV(a, b, c)
    {
        coords.push([uvs[a], uvs[a + 1]]);
        coords.push([uvs[b], uvs[b + 1]]);
        coords.push([uvs[c], uvs[c + 1]]);
    }

    function addNormal(a, b, c)
    {
        finalNormals.push([normals[a], normals[a + 1], normals[a + 2]]);
        finalNormals.push([normals[b], normals[b + 1], normals[b + 2]]);
        finalNormals.push([normals[c], normals[c + 1], normals[c + 2]]);
    }

    function addFace(a, b, c, d,  ua, ub, uc, ud,  na, nb, nc, nd)
    {
        let ia = parseVertexIndex(a);
        let ib = parseVertexIndex(b);
        let ic = parseVertexIndex(c);
        let id;

        if (d === undefined) {

            addVertex(ia, ib, ic);

        } else {

            id = parseVertexIndex(d);

            addVertex(ia, ib, id);
            addVertex(ib, ic, id);

        }

        if (ua !== undefined) {

            ia = parseUVIndex(ua);
            ib = parseUVIndex(ub);
            ic = parseUVIndex(uc);

            if (d === undefined) {

                addUV(ia, ib, ic);

            } else {

                id = parseUVIndex(ud);

                addUV(ia, ib, id);
                addUV(ib, ic, id);

            }

        }

        if (na !== undefined) {

            ia = parseNormalIndex(na);
            ib = parseNormalIndex(nb);
            ic = parseNormalIndex(nc);

            if (d === undefined) {

                addNormal(ia, ib, ic);

            } else {

                id = parseNormalIndex(nd);

                addNormal(ia, ib, id);
                addNormal(ib, ic, id);

            }

        }
    }

	for (let i = 0; i < lines.length; i ++) {
		let line = lines[i];
		line = line.trim();

		if (line.length === 0 || line.charAt(0) === '#') {

			continue;

		} else if ((result = vertexPattern.exec(line)) !== null) {

			vertices.push(
				parseFloat(result[1]),
				parseFloat(result[2]),
				parseFloat(result[3])
			);

		} else if ((result = normalPattern.exec(line)) !== null) {

			normals.push(
				parseFloat(result[1]),
				parseFloat(result[2]),
				parseFloat(result[3])
			);

		} else if ((result = uvPattern.exec(line)) !== null) {

			uvs.push(
				parseFloat(result[1]),
				1-parseFloat(result[2])
			);

		} else if ((result = facePattern1.exec(line)) !== null) {

			addFace(
				result[1], result[2], result[3], result[4]
			);

		} else if ((result = facePattern2.exec(line)) !== null) {

			addFace(
				result[2], result[5], result[8], result[11],
				result[3], result[6], result[9], result[12]
			);

		} else if ((result = facePattern3.exec(line)) !== null) {
			addFace(
				result[2], result[6], result[10], result[14],
				result[3], result[7], result[11], result[15],
				result[4], result[8], result[12], result[16]
			);

		} else if ((result = facePattern4.exec(line)) !== null) {
			addFace(
				result[2], result[5], result[8], result[11],
				undefined, undefined, undefined, undefined,
				result[3], result[6], result[9], result[12]
			);

		}
        else if(result = mtlPattern.exec(line))
        {
            if(lastMaterial !== line)
            {
                lastMaterial = line;

                let lastStart;

                if(groups.length)
                {
                    var lastGroup = groups[groups.length-1];

                    lastStart = lastGroup.start + indices.length;
                    lastGroup.size = indices.length - lastGroup.start;
                }
                else
                {
                    lastStart = 0;
                }

                groups.push({
                    start:indices.length,
                    size:0
                });

                console.log(indices.length);
                console.log("FOUND ONE!" + line)
            }
        }

        if(groups.length)
        {

            var lastGroup = groups[groups.length-1];
            lastGroup.size = indices.length - lastGroup.start;
        }

	}

//    console.log(groups)
	return _generateMeshes({
		positions:positions,
		coords:coords,
		normals:finalNormals,
		indices:indices,
        groups:groups
	});

}

module.exports = parseObj
