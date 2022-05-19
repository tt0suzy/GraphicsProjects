function Sphere(cen, rad, material) {
    this.center = cen;
    this.radius = rad;
    this.material = material;
}

Sphere.prototype = {
    hit: function (ray, tMin, tMax, hitRec) {
        const oc = ray.origin().subtract(this.center);
        const a = ray.direction().dot(ray.direction());
        const halfb = oc.dot(ray.direction());
        const c = oc.dot(oc) - this.radius * this.radius;
        const discriminant = halfb*halfb - a*c;
        const outwardNormal = (hitRec.p.subtract(this.center)).divide(this.radius);
        let theta = Math.acos(-outwardNormal.y);
        let phi = Math.atan2(-outwardNormal.z, outwardNormal.x) + 3.1415926535897932385;
        hitRec.u = phi / (2 * 3.1415926535897932385);
        hitRec.v = theta / (3.1415926535897932385);
        if (discriminant > 0) {
            const sqrtd = Math.sqrt(discriminant);
            let root = (-halfb - sqrtd) / a;
            if (root < tMax && root > tMin) {
                hitRec.t = root;
                hitRec.p = ray.at(hitRec.t);
                hitRec.normal = (hitRec.p.subtract(this.center).divide(this.radius));
                hitRec.material = this.material;
                return true;
            }
            root = (-halfb + sqrtd) / a;
            if (root < tMax && root > tMin) {
                hitRec.t = root;
                hitRec.p = ray.at(hitRec.t);
                hitRec.normal = (hitRec.p.subtract(this.center).divide(this.radius));
                hitRec.material = this.material;
                return true;
            }
        }
        return false;
    },
    boundingBox: function(time0, time1, outputBox) {
        let box = new AABB(this.center.subtract(new Vector(this.radius, this.radius, this.radius)), this.center.add(new Vector(this.radius, this.radius, this.radius)));
        // console.log(this.center.subtract(new Vector(this.radius, this.radius, this.radius)));
        // console.log(box.min());
        // console.log(this.center.add(new Vector(this.radius, this.radius, this.radius)));
        // console.log(box.max());
        outputBox.overwrite(box);
        // outputBox.minimum = this.center.subtract(new Vector(this.radius, this.radius, this.radius));
        // outputBox.maximum = this.center.add(new Vector(this.radius, this.radius, this.radius));
        return true;
    }
};

// function getSphereUV(p, u, v) {
//     let theta = Math.acos(-p.y);
//     let phi = Math.atan2(-p.z, p.x) + 
//     u = phi / (2*pi);
//     v = theta / pi;
// }
