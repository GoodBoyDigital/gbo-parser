var fs = require('fs');
var assert = require('assert');
var chai = require('chai');

var convertObjToGBO = require('../lib/convert-obj-to-gbo');
var objParser = require('../lib/objParser.js');
var packFormat = require('../lib/packFormat.js');
var readFormat = require('../lib/readFormat.js');
var getBounds = require('../lib/getBounds.js');
var readGbo = require('../lib/read-gbo.js');

var objFile = './test/cube.obj'
var gboFile = './test/cube.gbo'


//var objFile = './test/girl.obj'
//var gboFile = './test/girl.gbo'

var data = fs.readFileSync(objFile, 'utf8')
var objData = objParser(data);

describe('obj converting', function()
{
    describe('should convert from obj to gbo', function()
	{
        it('should measure bounds correctly', function()
        {
          //  return;
            var bounds = getBounds(objData.position);

            assert.equal(bounds.minX, -0.5);
            assert.equal(bounds.maxX, 0.5);
            assert.equal(bounds.minY, -0.5);
            assert.equal(bounds.maxY, 0.5);
            assert.equal(bounds.minZ, -0.5);
            assert.equal(bounds.maxZ, 0.5);

            assert.equal(bounds.sizeX, 1);
            assert.equal(bounds.sizeY, 1);
            assert.equal(bounds.sizeZ, 1);

        });

        it('pack format correctly', function()
        {
         //   return;
            var bounds = getBounds(objData.position);

            var buffer = new Buffer(36);
            var index = 0;

            var stream = {buffer, index};

            packFormat( objData, bounds, stream );

            assert.equal(stream.index, 28);

            // lets read

            stream.index = 0;

            var format = readFormat({}, stream);
            bounds = format.bounds;

            assert.equal(format.size, 24);
            assert.equal(format.indexSize, 36);

            assert.equal(bounds.minX, -0.5);
            assert.equal(bounds.maxX, 0.5);
            assert.equal(bounds.minY, -0.5);
            assert.equal(bounds.maxY, 0.5);
            assert.equal(bounds.minZ, -0.5);
            assert.equal(bounds.maxZ, 0.5);
        });

        it('from obj to gbo', function()
        {

        });

        it('from obj to gbo', function()
		{
            convertObjToGBO(objFile, gboFile);
        });

        it('read gbo', function()
        {
            var gbo = fs.readFileSync(gboFile);
            function toArrayBuffer(buf) {
                var ab = new ArrayBuffer(buf.length);
                var view = new Uint8Array(ab);
                for (var i = 0; i < buf.length; ++i) {
                    view[i] = buf[i];
                }
                return ab;
            }

            var ab = toArrayBuffer(gbo);

            readGbo(ab).then(out=>{

                var compareData = function(one, two)
                {
                  //  console.log(one, two)
                    assert.equal(one.length, two.length)

                    for (var i = 0; i < one.length; i++) {
                       // console.log(i + ' : ' + one[i] + ' : ' + two[i])
                        chai.assert.approximately(one[i], two[i], 0.01);
                    }
                }

                compareData(out.position, objData.position)
                compareData(out.uv, objData.uv)
                compareData(out.normals, objData.normals)
                compareData(out.indices, objData.indices)



            })
            .catch(e=>{
                console.log(e);
            })

        });

    });
});


