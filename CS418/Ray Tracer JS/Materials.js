function Material() {
}
Material.prototype = {
    scatter: function (ray, tMin, tMax, rec) {
    }
};


function LambertianMaterial(a) {
    if(a instanceof Vector)
        this.albedo = new SolidColor(a)
    else
        this.albedo = a;
}
LambertianMaterial.prototype = {
    scatter: function (rayIn, rec, attenuation, rayScattered) {
        let scatterDirection = rec.p.add(rec.normal).add(randomInUnitSphere());
        if (scatterDirection.nearZero())
            scatterDirection = rec.normal;
        rayScattered.overwrite(new Ray(rec.p, scatterDirection.subtract(rec.p)));
        attenuation.overwrite(this.albedo.value(rec.u, rec.v, rec.p));
        return true;
    }
};

function MetalMaterial(a, fuzz) {
    this.albedo = a;
    this.fuzz = fuzz > 1.0 ? 1.0 : fuzz;
}
MetalMaterial.prototype = {
    reflect: function (v, n) {
        return v.subtract( n.multiply(2.0 * v.dot(n)) );
    },
    scatter: function (rayIn, rec, attenuation, scattered) {
        let reflected = this.reflect(rayIn.direction().unit(), rec.normal);
        scattered.overwrite(new Ray(rec.p, reflected.add(randomInUnitSphere().multiply(this.fuzz))));
        attenuation.overwrite(this.albedo);
        return scattered.direction().dot(rec.normal) > 0;
    }
};

function DielectricMaterial(ri) {
    this.refractiveIndex = ri;
}
DielectricMaterial.prototype = {
    reflect: function (v, n) {
        return v.subtract( n.multiply(2.0 * v.dot(n)) );
    },
    refract: function (v, n, niOverNt, refracted) {
        let uv = v.unit();
        let dt = uv.dot(n);
        let discriminant = 1.0 - niOverNt*niOverNt*(1 - dt*dt);
        if (discriminant > 0) {
            refracted.overwrite( uv.subtract(n.multiply(dt)).multiply(niOverNt).subtract( n.multiply(Math.sqrt(discriminant)) ) );
            return true;
        } else {
            return false;
        }
    },
    schlick: function (cosine, refIndex) {
        let r0 = (1 - refIndex) / (1 + refIndex);
        r0 *= r0;
        return r0 + (1 - r0)*Math.pow(1-cosine, 5);
    },
    scatter: function (rayIn, rec, attenuation, rayScattered) {
        let outwardNormal = new Vector();
        let reflected = this.reflect(rayIn.direction(), rec.normal);
        let niOverNt = 0;
        attenuation.overwrite(new Vector(1.0, 1.0, 1.0));

        let refracted = new Vector();
        let reflectProb = 0;
        let cosine = 0;
        if (rayIn.direction().dot(rec.normal) > 0) {
            outwardNormal = rec.normal.negative();
            niOverNt = this.refractiveIndex;
            cosine = this.refractiveIndex * rayIn.direction().dot(rec.normal) / rayIn.direction().length();
        } else {
            outwardNormal.overwrite(rec.normal);
            niOverNt = 1.0 / this.refractiveIndex;
            cosine = -(rayIn.direction().dot(rec.normal)) / rayIn.direction().length();
        }

        if (this.refract(rayIn.direction(), outwardNormal, niOverNt, refracted)) {
            reflectProb = this.schlick(cosine, this.refractiveIndex);
        } else {
            rayScattered.overwrite( new Ray(rec.p, reflected) );
            reflectProb = 1.0;
        }

        if (Math.random() < reflectProb) {
            rayScattered.overwrite( new Ray(rec.p, reflected) );
        } else {
            rayScattered.overwrite( new Ray(rec.p, refracted) );
        }
        return true;
    }
};