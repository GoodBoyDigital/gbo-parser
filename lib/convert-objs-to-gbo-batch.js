var fs = require('fs-extra');
var objParser = require('./objParser');
var packFormat = require('./packFormat');
var getBounds = require('./getBounds');
const path = require('path');

// load a model
var createBatch = function()
{
    const mega = {
        buffer: [],
        indexBuffer: [],
        index: 0,
        vertIndex: 0,
    };

    return mega;
}

var createManifest = function()
{
    const manifest = {
        geometry:[]
    };

    return manifest;
}

const maxSize = 0xFFFF;
let idCount = 0;

var finish = function(currentBatch, manifest, out)
{
    const bufferFilePath = out + idCount + '.gb-buffer';

    
    manifest.size = currentBatch.buffer.length;
    manifest.indexSize = currentBatch.indexBuffer.length;
    
    manifest.buffer = path.basename(bufferFilePath);//'buffer' + idCount + '.gb-buffer';
    
    var buffer = new Buffer( (currentBatch.buffer.length * 4) + (currentBatch.indexBuffer.length * 2) );
    for(var i = 0; i < currentBatch.buffer.length; i++)
    {
        buffer.writeFloatLE( currentBatch.buffer[i], i * 4 );
    }
    
    const offset = currentBatch.buffer.length * 4;

    for(var i = 0; i < currentBatch.indexBuffer.length; i++)
    {
        buffer.writeUInt16LE( currentBatch.indexBuffer[i] | 0, offset + (i * 2) );
    }
    
    //var wstream = fs.createWriteStream(out + idCount + '.gbd');
    //wstream.write(buffer);
    //wstream.end();

    fs.outputFileSync(bufferFilePath, buffer);
    
    fs.outputFileSync(out + idCount + '.gb-map', JSON.stringify(manifest, null, 4));

    idCount++;
}

var convertObjsToGBOBatch = function(objs, out)//objSource, out)
{
    if(!objs.length)return;

    count = 0;
    
    let currentBatch = createBatch();
    
    let manifest = createManifest();

    var allBatchs = [manifest];

    //console.log(objs)
    objs.forEach(geometry => {
        
        const source = geometry.original;
        
        var data = fs.readFileSync(source, 'utf8');

        var objData = objParser(data);
        
        if (currentBatch.index + objData.indices.length > maxSize)
        {
            // finish batch..
            finish(currentBatch, manifest, out);

            currentBatch = createBatch();
            manifest = createManifest();
            
            allBatchs.push(manifest);

        }

        const statVert = currentBatch.vertIndex / 8;


        const megaData = currentBatch.buffer;
        const megaIndexData = currentBatch.indexBuffer;

        const count = objData.uv.length / 2;

        for (var i = 0; i < count; i++)
        {
            megaData[currentBatch.vertIndex++] = objData.uv[(i * 2)];
            megaData[currentBatch.vertIndex++] = objData.uv[(i * 2) + 1];

            megaData[currentBatch.vertIndex++] = objData.position[(i * 3)];
            megaData[currentBatch.vertIndex++] = objData.position[(i * 3) + 1];
            megaData[currentBatch.vertIndex++] = objData.position[(i * 3) + 2];

            megaData[currentBatch.vertIndex++] = objData.normals[(i * 3)];
            megaData[currentBatch.vertIndex++] = objData.normals[(i * 3) + 1];
            megaData[currentBatch.vertIndex++] = objData.normals[(i * 3) + 2];
        }

        const start = currentBatch.index;

        for (var i = 0; i < objData.indices.length; i++)
        {
            megaIndexData[i + start] = objData.indices[i] + statVert;
        }

        currentBatch.index += objData.indices.length;

        const geometryFrag = { file:geometry.outputFile, start, size: objData.indices.length };
        manifest.geometry.push(geometryFrag)

    })

    finish(currentBatch, manifest, out);

    return allBatchs;
}


module.exports = convertObjsToGBOBatch

