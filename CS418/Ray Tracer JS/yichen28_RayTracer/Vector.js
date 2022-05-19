function Vector(x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
}

Vector.prototype = {
    negative: function () {
        return new Vector(-this.x, -this.y, -this.z);
    },
    add: function (v) {
        if (v instanceof Vector) return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
        else return new Vector(this.x + v, this.y + v, this.z + v);
    },
    subtract: function (v) {
        if (v instanceof Vector) return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
        else return new Vector(this.x - v, this.y - v, this.z - v);
    },
    multiply: function (v) {
        if (v instanceof Vector) return new Vector(this.x * v.x, this.y * v.y, this.z * v.z);
        else return new Vector(this.x * v, this.y * v, this.z * v);
    },
    divide: function (v) {
        if (v instanceof Vector) return new Vector(this.x / v.x, this.y / v.y, this.z / v.z);
        else return new Vector(this.x / v, this.y / v, this.z / v);
    },
    equals: function (v) {
        return this.x == v.x && this.y == v.y && this.z == v.z;
    },
    dot: function (v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    },
    cross: function (v) {
        return new Vector(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    },
    length: function () {
        return Math.sqrt(this.dot(this));
    },
    unit: function () {
        return this.divide(this.length());
    },
    x: function() {
        return this.x;
    },
    y: function() {
        return this.y;
    },
    z: function() {
        return this.z;
    },
    min: function () {
        return Math.min(Math.min(this.x, this.y), this.z);
    },
    max: function () {
        return Math.max(Math.max(this.x, this.y), this.z);
    },
    toAngles: function () {
        return {
            theta: Math.atan2(this.z, this.x),
            phi: Math.asin(this.y / this.length())
        };
    },
    nearZero: function () {
        const s = 1e-8;
        return Math.abs(this.x) < s && Math.abs(this.y) < s && Math.abs(this.z) < s;
    },
    angleTo: function (a) {
        return Math.acos(this.dot(a) / (this.length() * a.length()));
    },
    clone: function () {
        return new Vector(this.x, this.y, this.z);
    },
    init: function (x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    },
    overwrite: function (v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
    }
};

Vector.negative = function(a, b) {
    b.x = -a.x;
    b.y = -a.y;
    b.z = -a.z;
    return b;
};
Vector.add = function(a, b, c) {
    if (b instanceof Vector) {
        c.x = a.x + b.x;
        c.y = a.y + b.y;
        c.z = a.z + b.z;
    }
    else {
        c.x = a.x + b;
        c.y = a.y + b;
        c.z = a.z + b;
    }
    return c;
};
Vector.subtract = function(a, b, c) {
    if (b instanceof Vector) {
        c.x = a.x - b.x;
        c.y = a.y - b.y;
        c.z = a.z - b.z;
    }
    else {
        c.x = a.x - b;
        c.y = a.y - b;
        c.z = a.z - b;
    }
    return c;
};
Vector.multiply = function(a, b, c) {
    if (b instanceof Vector) {
        c.x = a.x * b.x;
        c.y = a.y * b.y;
        c.z = a.z * b.z;
    }
    else {
        c.x = a.x * b;
        c.y = a.y * b;
        c.z = a.z * b;
    }
    return c;
};
Vector.divide = function(a, b, c) {
    if (b instanceof Vector) {
        c.x = a.x / b.x;
        c.y = a.y / b.y;
        c.z = a.z / b.z;
    }
    else {
        c.x = a.x / b;
        c.y = a.y / b;
        c.z = a.z / b;
    }
    return c;
};
Vector.cross = function(a, b, c) {
    c.x = a.y * b.z - a.z * b.y;
    c.y = a.z * b.x - a.x * b.z;
    c.z = a.x * b.y - a.y * b.x;
    return c;
};
Vector.unit = function(a, b) {
    const length = a.length();
    b.x = a.x / length;
    b.y = a.y / length;
    b.z = a.z / length;
    return b;
};
Vector.min = function(a, b) {
    return new Vector(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.min(a.z, b.z));
};
Vector.max = function(a, b) {
    return new Vector(Math.max(a.x, b.x), Math.max(a.y, b.y), Math.max(a.z, b.z));
};

function randomInUnitSphere() {
    let p;
    do {
        p = (new Vector(Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0));
    } while (p.dot(p) >= 1.0);
    return p;
}

function randomInUnitDisk() {
    let p;
    do {
        p = (new Vector(Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0, 0));
    } while (p.dot(p) >= 1.0);
    return p;
}
