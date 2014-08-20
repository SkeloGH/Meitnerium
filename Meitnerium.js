Module(Helpers, 'Meitnerium')({
    prototype : {
        corners : [null, null, null, null, null, null, null, null],
        currentcorner : -1,
        transform: function transform(config){
            var c;
            if (config.targetCoords && config.targetElmt) {
                c                  = config.targetCoords;
                this.targetElmt    = config.targetElmt;
                this.corners       = [c.tl[0],c.tl[1],c.tr[0],c.tr[1],c.bl[0],c.bl[1],c.br[0],c.br[1]];
                this.update();
                if (typeof config.onTransform == "function"){
                    config.onTransform();
                }
            } else {
                return console.warn('not enough arguments on Meitnerium');
            }
        },
        adj: function adj(m) { // Compute the adjugate of m
            return [
                m[4]*m[8]-m[5]*m[7], m[2]*m[7]-m[1]*m[8], m[1]*m[5]-m[2]*m[4],
                m[5]*m[6]-m[3]*m[8], m[0]*m[8]-m[2]*m[6], m[2]*m[3]-m[0]*m[5],
                m[3]*m[7]-m[4]*m[6], m[1]*m[6]-m[0]*m[7], m[0]*m[4]-m[1]*m[3]
            ];
        },
        multmm: function multmm(a, b){ // multiply two matrices
            var c = Array(9), i, j, cij, k;
            for (i = 0; i != 3; ++i) {
                for (j = 0; j != 3; ++j) {
                    cij = 0;
                    for (k = 0; k != 3; ++k) {
                        cij += a[3*i + k]*b[3*k + j];
                    }
                    c[3*i + j] = cij;
                }
            }
            return c;
        },
        multmv: function multmv(m, v){ // multiply matrix and vector
            return [
                m[0]*v[0] + m[1]*v[1] + m[2]*v[2],
                m[3]*v[0] + m[4]*v[1] + m[5]*v[2],
                m[6]*v[0] + m[7]*v[1] + m[8]*v[2]
            ];
        },
        pdbg: function pdbg(m, v){
            var r = this.multmv(m, v);
            return r + " (" + r[0]/r[2] + ", " + r[1]/r[2] + ")";
        },
        basisToPoints: function basisToPoints(x1, y1, x2, y2, x3, y3, x4, y4) {
            var m = [
                x1, x2, x3,
                y1, y2, y3,
                 1,  1,  1
            ],
            v = this.multmv(this.adj(m), [x4, y4, 1]);
            return this.multmm(m, [
                v[0], 0, 0,
                0, v[1], 0,
                0, 0, v[2]
            ]);
        },
        general2DProjection: function general2DProjection(x1s, y1s, x1d, y1d, x2s, y2s, x2d, y2d, x3s, y3s, x3d, y3d, x4s, y4s, x4d, y4d){
            var s = this.basisToPoints(x1s, y1s, x2s, y2s, x3s, y3s, x4s, y4s),
                d = this.basisToPoints(x1d, y1d, x2d, y2d, x3d, y3d, x4d, y4d);
            return this.multmm(d, this.adj(s));
        },
        project: function project(m, x, y){
            var v = this.multmv(m, [x, y, 1]);
            return [v[0]/v[2], v[1]/v[2]];
        },
        transform2d: function transform2d(elt, x1, y1, x2, y2, x3, y3, x4, y4){
            var w = elt.offsetWidth,
                h = elt.offsetHeight,
                t = this.general2DProjection(0, 0, x1, y1, w, 0, x2, y2, 0, h, x3, y3, w, h, x4, y4);
            for(i = 0; i != 9; ++i) t[i] = t[i]/t[8];
            t = [   t[0], t[3], 0, t[6],
                    t[1], t[4], 0, t[7],
                    0   , 0   , 1, 0   ,
                    t[2], t[5], 0, t[8]];
            t = "matrix3d(" + t.join(", ") + ")";
            elt.style["-webkit-transform"] = t;
            elt.style["-moz-transform"] = t;
            elt.style["-o-transform"] = t;
            elt.style.transform = t;
        },
        update: function update(){
            var box = this.targetElmt,
                corners = this.corners;
            this.transform2d(box, corners[0], corners[1], corners[2], corners[3], corners[4], corners[5], corners[6], corners[7]);
        }
    }
});