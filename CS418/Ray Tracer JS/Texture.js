function SolidColor(c) {
    this.color = c;
}

SolidColor.prototype = {
    value: function(u, v, p) {
        return this.color;
    }
}

function CheckerTexture(c1, c2) {
    this.even = new SolidColor(c1);
    this.odd = new SolidColor(c2);
}

CheckerTexture.prototype = {
    value: function(u, v, p) {
        let sines = Math.sin(p.x * 10) * Math.sin(p.y * 10) * Math.sin(p.z * 10);
        if(sines < 0) 
            return this.odd.value(u, v, p);
        else
            return this.even.value(u, v, p);
    }
}