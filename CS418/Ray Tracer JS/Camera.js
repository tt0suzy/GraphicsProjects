function Camera(lookFrom, lookAt, vUp, vFov, aspect, aperture, focusDist) {
    this.lensRadius = aperture / 2;
    let theta = vFov * Math.PI / 180.0;
    let halfHeight = Math.tan(theta / 2);
    let halfWidth = aspect * halfHeight;

    this.origin = lookFrom;
    this.w = lookFrom.subtract(lookAt).unit();
    this.u = vUp.cross(this.w).unit();
    this.v = this.w.cross(this.u);

    this.lowerLeftCorner = this.origin.subtract( this.u.multiply(halfWidth * focusDist) ).subtract( this.v.multiply(halfHeight * focusDist) ).subtract(this.w.multiply(focusDist));
    this.horizontal = this.u.multiply(2 * halfWidth * focusDist);
    this.vertical = this.v.multiply(2 * halfHeight * focusDist);
}

Camera.prototype = {
    getRay: function (s, t) {
        let rd = randomInUnitDisk().multiply(this.lensRadius);
        let offset = this.u.multiply(rd.x).add(this.v.multiply(rd.y));
        return new Ray(this.origin.add(offset), this.lowerLeftCorner.add(this.horizontal.multiply(s)).add(this.vertical.multiply(t)).subtract(this.origin).subtract(offset));
    }
};