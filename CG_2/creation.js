const fs = require("fs");

const X = 0, Y = 1, Z = 2;

class V3 {
    static create(x, y, z) {
        const v = new Float32Array(3);
        v[X] = x;
        v[Y] = y;
        v[Z] = z;
        return v;
    }

    static subtract(u, v, dest) {
        dest = dest || new Float32Array(3);
        dest[X] = u[X] - v[X];
        dest[Y] = u[Y] - v[Y];
        dest[Z] = u[Z] - v[Z];
        return dest;
    }

    static cross(u, v, dest) {
        dest = dest || new Float32Array(3);
        dest[X] = u[Y] * v[Z] - u[Z] * v[Y];
        dest[Y] = u[Z] * v[X] - u[X] * v[Z];
        dest[Z] = u[X] * v[Y] - u[Y] * v[X];
        return dest;
    }

    static normalize(v, dest) {
        dest = dest || new Float32Array(3);
        const size = Math.sqrt(v[X]*v[X] + v[Y]*v[Y] + v[Z]*v[Z]);
        if (size > 0) {
            dest[X] = v[X] / size;
            dest[Y] = v[Y] / size;
            dest[Z] = v[Z] / size;
        } else {
            dest[X] = dest[Y] = dest[Z] = 0;
        }
        return dest;
    }
}

let n = 8;
let h = 6.0;
let rb = 1.0;
let rt = 0.8;

if (process.argv.length >= 3) n = parseInt(process.argv[2]);
if (process.argv.length >= 4) h = parseFloat(process.argv[3]);
if (process.argv.length >= 5) rb = parseFloat(process.argv[4]);
if (process.argv.length >= 6) rt = parseFloat(process.argv[5]);

let vertices = [];
let normals = [];
let faces = [];

function addV(x,y,z){
  vertices.push(`v ${x.toFixed(4)} ${y.toFixed(4)} ${z.toFixed(4)}`);
}

function addN(x,y,z){
  let v = V3.normalize(V3.create(x,y,z));
  normals.push(`vn ${v[0].toFixed(4)} ${v[1].toFixed(4)} ${v[2].toFixed(4)}`);
}

function getV(i){
  return vertices[i-1].split(" ").slice(1).map(Number);
}

function faceNormal(a,b,c){
    let p1=getV(a), p2=getV(b), p3=getV(c);
    let u = V3.subtract(V3.create(...p2), V3.create(...p1));
    let v = V3.subtract(V3.create(...p3), V3.create(...p1));
    let n = V3.cross(u, v);
    return V3.normalize(n);
}

addV(0,0,0);
addV(0,h,0);

for(let i=0;i<n;i++){
  let a = 2*Math.PI*i/n;
  addV(Math.cos(a)*rb,0,Math.sin(a)*rb);
  addV(Math.cos(a)*rt,h,Math.sin(a)*rt);
}

for(let i=0;i<n;i++){
  addN(0,-1,0);
  addN(0,1,0);

  let j=(i+1)%n;
  let b1=3+2*i;
  let b2=3+2*j;
  let t1=4+2*i;
  let t2=4+2*j;

  let p1=getV(b1), p2=getV(b2);
  let cx=(p1[0]+p2[0])*0.5;
  let cz=(p1[2]+p2[2])*0.5;

  addN(cx,0,cz);
  addN(cx,0,cz);

  let ni = normals.length-3;
  faces.push(`f ${b2}//${ni} 1//${ni} ${b1}//${ni}`);

  ni = normals.length-2;
  faces.push(`f ${t1}//${ni} 2//${ni} ${t2}//${ni}`);

  let n3 = faceNormal(b1,b2,t2);
  addN(n3[0], n3[1], n3[2]);
  let ni3 = normals.length;
  faces.push(`f ${b1}//${ni3} ${b2}//${ni3} ${t2}//${ni3}`);

  let n4 = faceNormal(b1,t2,t1);
  addN(n4[0], n4[1], n4[2]);
  let ni4 = normals.length;
  faces.push(`f ${b1}//${ni4} ${t2}//${ni4} ${t1}//${ni4}`);
}

let obj = vertices.join("\n") + "\n\n" + normals.join("\n") + "\n\n" + faces.join("\n");
let filename = `building_${n}_${h}_${rb}_${rt}.obj`;

fs.writeFileSync(filename,obj);
