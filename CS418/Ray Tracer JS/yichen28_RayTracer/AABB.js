function AABB(a, b) {
    if(a !== undefined)
        this.minumum = a;
    else 
        this.minumum = new Vector(0, 0, 0);
    if(b !== undefined)
        this.maximum = b;
    else
        this.maximum = new Vector(0, 0, 0);
}
    

AABB.prototype = {
    max: function() {
        return this.maximum;
    },
    min: function() {
        return this.minumum;
    },
    overwrite: function (v) {
        this.minumum = v.minumum;
        this.maximum = v.maximum;
    },
    // Andrew Kensler's Optimization
    hit: function(ray, tMin, tMax) {
        for (let a = 0; a < 3; a++) {
            let invD = 1.0 / ray.direction()[a];
            let t0 = (this.minumum[a] - ray.origin()[a]);
            let t1 = (this.maximum[a] - ray.origin()[a]);
            if(invD < 0.0)
                [t0, t1] = [t1, t0];
            tMin = t0 > tMin ? t0 : tMin;
            tMax = t1 < tMax ? t1 : tMax;
            if(tMax <= tMin)
                return false;
        }
        return true;
        // for (let a = 0; a < 3; a++) {
        //     let t0 = Math.min(this.minumum[a].subtract(ray.orig[a]).divide(ray.dir[a]),
        //     this.maximum[a].subtract(ray.orig[a]).divide(ray.dir[a]));
        //     let t1 = Math.max(this.minumum[a].subtract(ray.orig[a]).divide(ray.dir[a]),
        //     this.maximum[a].subtract(ray.orig[a]).divide(ray.dir[a]));
        //     tMin.overwrite(Math.max(t0, tMin));
        //     tMax.overwrite(Math.min(t1, tMax));
        //     if(tMax <= tMin)
        //         return false;
        // }
        // return true;
    },

};

function surroundingBox(box0, box1) {
    console.log(box0.min());
    let small = new Vector(Math.min(box0.min().x, box1.min().x),
                         Math.min(box0.min().y, box1.min().y),
                         Math.min(box0.min().z, box1.min().z));

    let big = new Vector(Math.max(box0.min().x, box1.max().x),
                         Math.max(box0.min().y, box1.max().y),
                         Math.max(box0.min().z, box1.max().z));
    return new AABB(small, big);
}