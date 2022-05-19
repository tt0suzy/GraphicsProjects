function MovingSphere(cen0, cen1, time0, time1, rad, material) {
    this.center0 = cen0;
    this.center1 = cen1;
    this.time0 = time0;
    this.time1 = time1;
    this.radius = rad;
    this.material = material;
}

MovingSphere.prototype = {
    center: function(time) {
        //center0 + ((time - time0) / (time1 - time0))*(center1 - center0);
        return (this.center0.add(this.center1.subtract(this.center0).multiply((time - this.time0) / (this.time1 - this.time0))));
    },

    hit: function (ray, tMin, tMax, hitRec) {
        const oc = ray.origin().subtract(this.center);
        const a = ray.direction().dot(ray.direction());
        const halfb = oc.dot(ray.direction());
        const c = oc.dot(oc) - this.radius * this.radius;
        const discriminant = halfb*halfb - a*c;
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
        let box0 = new AABB(
            this.center(time0).subtract(new Vector(this.radius, this.radius, this.radius)),
                       (time0).add(new Vector(this.radius, this.radius, this.radius)));
        let box1 = new AABB(
            this.center(time1).subtract(new Vector(this.radius, this.radius, this.radius)),
                       (time1).add(new Vector(this.radius, this.radius, this.radius)));

        outputBox.overwrite(surroundingBox(box0, box1));
        return true;
    }
};
