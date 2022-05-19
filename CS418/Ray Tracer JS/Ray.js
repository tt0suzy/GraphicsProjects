function Ray(origin, direction) {
    this.orig = origin;
    this.dir = direction;
}

Ray.prototype = {
    origin: function () {
        return this.orig;
    },
    direction: function () {
        return this.dir;
    },
    at: function (t) {
        return this.orig.add(this.dir.multiply(t));
    },
    overwrite: function (r) {
        this.orig = r.orig;
        this.dir = r.dir;
    }
};



function HitRecord() {
    this.t = 0.0;
    this.p = new Vector(0, 0, 0);
    this.normal = new Vector(0, 0, 0);
    this.material = new Material();
    this.u = 0.0;
    this.v = 0.0;
}
HitRecord.prototype = {
    overwrite: function (rec) {
        this.t = rec.t;
        this.p = rec.p;
        this.normal = rec.normal;
        this.material = rec.material;
    }
};


function HitableList() {
    this.objects = [];
}

HitableList.prototype = {
    hit: function (ray, tMin, tMax, rec) {
        let tempRec = new HitRecord();
        let hitAnything = false;
        let closestSoFar = tMax;
        for (let i = 0; i < this.objects.length; i++) {
            if (this.objects[i].hit(ray, tMin, closestSoFar, tempRec)) {
                hitAnything = true;
                closestSoFar = tempRec.t;
                rec.overwrite(tempRec);
            }
        }
        return hitAnything;
    },
    boundingBox: function (time0, time1, outputBox) {
        if(this.objects.length == 0) return false;
        let tempBox = new AABB();
        let firstBox = false;
        this.objects.forEach(object => {
            if(!object.boundingBox(time0, time1, tempBox)) return false;
            outputBox.overwrite(firstBox ? tempBox : surroundingBox(outputBox, tempBox));
            firstBox = false;
        });
        return true;
    } 
};


// function Material() {
// }
// Material.prototype = {
//     scatter: function (ray, tMin, tMax, rec) {
//     }
// };

// function LambertianMaterial(a) {
//     this.albedo = a;
// }
// LambertianMaterial.prototype = {
//     scatter: function (rayIn, rec, attenuation, rayScattered) {
//         let target = rec.p.add(rec.normal).add(randomInUnitSphere());
//         rayScattered.overwrite(new Ray(rec.p, target.subtract(rec.p)));
//         attenuation.overwrite(this.albedo);
//         return true;
//     }
// };



// function DielectricMaterial(ri) {
//     this.refractiveIndex = ri;
// }
// DielectricMaterial.prototype = {
//     reflect: function (v, n) {
//         return v.subtract( n.multiply(2.0 * v.dot(n)) );
//     },
//     refract: function (v, n, niOverNt, refracted) {
//         let uv = v.unit();
//         let dt = uv.dot(n);
//         let discriminant = 1.0 - niOverNt*niOverNt*(1 - dt*dt);
//         if (discriminant > 0) {
//             refracted.overwrite( uv.subtract(n.multiply(dt)).multiply(niOverNt).subtract( n.multiply(Math.sqrt(discriminant)) ) );
//             return true;
//         } else {
//             return false;
//         }
//     },
//     schlick: function (cosine, refIndex) {
//         let r0 = (1 - refIndex) / (1 + refIndex);
//         r0 *= r0;
//         return r0 + (1 - r0)*Math.pow(1-cosine, 5);
//     },
//     scatter: function (rayIn, rec, attenuation, rayScattered) {
//         let outwardNormal = new Vector();
//         let reflected = this.reflect(rayIn.direction(), rec.normal);
//         let niOverNt = 0;
//         attenuation.overwrite(new Vector(1.0, 1.0, 1.0));

//         let refracted = new Vector();
//         let reflectProb = 0;
//         let cosine = 0;

//         if (rayIn.direction().dot(rec.normal) > 0) {
//             outwardNormal = rec.normal.negative();
//             niOverNt = this.refractiveIndex;
//             cosine = this.refractiveIndex * rayIn.direction().dot(rec.normal) / rayIn.direction().length();
//         } else {
//             outwardNormal.overwrite(rec.normal);
//             niOverNt = 1.0 / this.refractiveIndex;
//             cosine = -(rayIn.direction().dot(rec.normal)) / rayIn.direction().length();
//         }

//         if (this.refract(rayIn.direction(), outwardNormal, niOverNt, refracted)) {
//             reflectProb = this.schlick(cosine, this.refractiveIndex);
//         } else {
//             rayScattered.overwrite( new Ray(rec.p, reflected) );
//             reflectProb = 1.0;
//         }

//         if (Math.random() < reflectProb) {
//             rayScattered.overwrite( new Ray(rec.p, reflected) );
//         } else {
//             rayScattered.overwrite( new Ray(rec.p, refracted) );
//         }
//         return true;
//     }
// };



