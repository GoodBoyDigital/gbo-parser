# GBO Reader and Converter

### How to use:

To convert a file in a node js enviroment:

```
import {convertObjToGbo} from 'gbo-reader';

convertObjToGbo('./myObj.obj', './myGbo.gbo');

```

To read a file a js enviroment:

```
import {convertObjToGbo} from 'gbo-reader';

var oReq = new XMLHttpRequest();
oReq.open("GET", './myGbo.gbo', true);
oReq.responseType = "arraybuffer";

oReq.onload = oEvent => {

    var arrayBuffer = oReq.response;

    readGbo(arrayBuffer).then(o=>{

        var geometry = new PIXI.mesh.Geometry()
        .addAttribute('uv', o.uv, 2 )
        .addAttribute('position',  o.position, 3 )
        .addAttribute('normals',  o.normals, 3 )
        .addIndex(new Uint16Array(o.indices) );

    })
};

oReq.send()

```