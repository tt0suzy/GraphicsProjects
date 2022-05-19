function BVHNode(list, time0, time1, start, end) {
       
    this.time0 = time0;
    this.time1 = time1;
    if(start===undefined) {
        this.start = 0;
        this.objects = list.objects;
        this.end = this.objects.length;

    }
        
    else{
        this.start = start;
        this.objects = list;
        this.end = end;
    }
    let axis = Math.floor(Math.random() * 3);
    
    let objectSpan = this.end - this.start;
    if(objectSpan == 1) {
        this.left = this.objects[start];
        this.right = this.objects[start];
    }
    else if(objectSpan == 2) {
        let compare = 0;
        if(axis == 0)
            compare = boxXCompare(this.objects[start], this.objects[start + 1])
        if(axis == 1)
            compare = boxYCompare(this.objects[start], this.objects[start + 1])
        if(axis == 2)
            compare = boxZCompare(this.objects[start], this.objects[start + 1])
        if(compare < 0) {
            this.left = this.objects[start];
            this.right = this.objects[start + 1];
        }
        else {
            this.left = this.objects[start + 1];
            this.rigt = this.objects[start];
        }
    }
    else {
        console.log(this.objects)
        if(axis == 0)
            this.objects = this.objects.sort(boxXCompare);
        else if(axis == 1)
            this.objects = this.objects.sort(boxYCompare);
        else if(axis == 2)
            this.objects = this.objects.sort(boxZCompare);
        let mid = Math.floor(this.start + objectSpan / 2);
        console.log(this.objects)
        this.left = new BVHNode(this.objects, this.time0, this.time1, this.start, mid);
        this.right = new BVHNode(this.objects, this.time0, this.time1, mid, this.end);
    }
    let boxLeft = new AABB();
    let boxRight = new AABB();

    if(!this.left.boundingBox(this.time0, this.time1, boxLeft)
        ||!this.right.boundingBox(this.time0, this.time1, boxRight))
        console.log("No bounding box in bvh_node constructor.\n");
    // console.log(boxLeft);
    this.box = surroundingBox(boxLeft, boxRight);

}

BVHNode.prototype = {
    hit: function (ray, tMin, tMax, hitRec) {
        if(!this.box.hit(ray, tMin, tMax, hitRec))
            return false;
        let hitLeft = this.left.hit(ray, tMin, tMax, hitRec);
        let hitRight = this.left.hit(ray, tMin, hitLeft ? hitRec.t : tMax, hitRec);
        return hitLeft || hitRight;
    },
    boundingBox: function (time0, time1, outputBox) {
        outputBox.overwrite(this.box);
        return true;
    }
}


// function boxCompare(a, b, axis) {
//     let boxA = new AABB();
//     let boxB = new AABB();

//     if (!a.boundingBox(0,0, boxA) || !b.boundingBox(0,0, boxB))
//         console.log("No bounding box in bvh_node constructor.\n");
//     if(axis == 0) {
//         if(boxA.min().x < boxB.min().x)
//             return -1;
//         else if(boxA.min().x > boxB.min().x)
//             return 1;
//         return 0;
//     }
//     if(axis == 1) {
//         if(boxA.min().y < boxB.min().y)
//             return -1;
//         else if(boxA.min().y > boxB.min().y)
//             return 1;
//         return 0;
//     }
//     if(axis == 2) {
//         if(boxA.min().z < boxB.min().z)
//             return -1;
//         else if(boxA.min().z > boxB.min().z)
//             return 1;
//         return 0;
//     }
// }

function boxXCompare (a, b) {
    let boxA = new AABB();
    let boxB = new AABB();

    if (!a.boundingBox(0,0, boxA) || !b.boundingBox(0,0, boxB))
        console.log("No bounding box in bvh_node constructor.\n");
    if(boxA.min().x < boxB.min().x)
        return -1;
    else if(boxA.min().x > boxB.min().x)
        return 1;
    else
        return 0;
    // return boxCompare(a, b, 0);
}

function boxYCompare (a, b) {
    let boxA = new AABB();
    let boxB = new AABB();

    if (!a.boundingBox(0,0, boxA) || !b.boundingBox(0,0, boxB))
        console.log("No bounding box in bvh_node constructor.\n");
    if(boxA.min().y < boxB.min().y)
        return -1;
    else if(boxA.min().y > boxB.min().y)
        return 1;
    else
        return 0;
}

function boxZCompare (a, b) {
    let boxA = new AABB();
    let boxB = new AABB();

    if (!a.boundingBox(0,0, boxA) || !b.boundingBox(0,0, boxB))
        console.log("No bounding box in bvh_node constructor.\n");
    if(boxA.min().z < boxB.min().z)
        return -1;
    else if(boxA.min().z > boxB.min().z)
        return 1;
    else
        return 0;
}