// Esperamos a que la página cargue un poco antes de inyectar el fondo
document.addEventListener("DOMContentLoaded", () => {
    
    // 1. CREAMOS EL CANVAS AUTOMÁTICAMENTE
    const canvas = document.createElement('canvas');
    canvas.id = 'bg-canvas';
    document.body.appendChild(canvas); // Lo metemos al final del body

    // 2. EL CÓDIGO MATEMÁTICO DEL RUIDO
    const SimplexNoise = (function() {
        const F2 = 0.5 * (Math.sqrt(3.0) - 1.0), G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
        function Noise() {
            this.p = new Uint8Array(256); this.perm = new Uint8Array(512); this.permMod12 = new Uint8Array(512);
            for (let i = 0; i < 256; i++) this.p[i] = Math.floor(Math.random() * 256);
            for (let i = 0; i < 512; i++) { this.perm[i] = this.p[i & 255]; this.permMod12[i] = (this.perm[i] % 12); }
        }
        Noise.prototype.noise2D = function(xin, yin) {
            let n0, n1, n2; const s = (xin + yin) * F2; const i = Math.floor(xin + s), j = Math.floor(yin + s);
            const t = (i + j) * G2, X0 = i - t, Y0 = j - t, x0 = xin - X0, y0 = yin - Y0;
            let i1 = x0 > y0 ? 1 : 0, j1 = x0 > y0 ? 0 : 1;
            const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2, x2 = x0 - 1.0 + 2.0 * G2, y2 = y0 - 1.0 + 2.0 * G2;
            const ii = i & 255, jj = j & 255;
            const g = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]];
            let t0 = 0.5 - x0*x0 - y0*y0; n0 = t0 < 0 ? 0 : Math.pow(t0, 4) * (g[this.permMod12[ii + this.perm[jj]]][0]*x0 + g[this.permMod12[ii + this.perm[jj]]][1]*y0);
            let t1 = 0.5 - x1*x1 - y1*y1; n1 = t1 < 0 ? 0 : Math.pow(t1, 4) * (g[this.permMod12[ii + i1 + this.perm[jj + j1]]][0]*x1 + g[this.permMod12[ii + i1 + this.perm[jj + j1]]][1]*y1);
            let t2 = 0.5 - x2*x2 - y2*y2; n2 = t2 < 0 ? 0 : Math.pow(t2, 4) * (g[this.permMod12[ii + 1 + this.perm[jj + 1]]][0]*x2 + g[this.permMod12[ii + 1 + this.perm[jj + 1]]][1]*y2);
            return 70.0 * (n0 + n1 + n2);
        };
        return Noise;
    })();

    const ctx = canvas.getContext('2d');
    const simplex = new SimplexNoise();

    let w, h, cols, rows, zOffset = 0;
    const config = { speed: 0.0006, scale: 0.0008, density: 25, thickness: 1.1, opacity: 0.7, step: 12 };

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        cols = Math.ceil(w / config.step) + 1;
        rows = Math.ceil(h / config.step) + 1;
    }
    window.addEventListener('resize', resize);
    resize();

    function draw() {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, h);
        const grid = new Float32Array(cols * rows);

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                grid[r * cols + c] = (simplex.noise2D(c * config.step * config.scale, r * config.step * config.scale + zOffset) + 1) * 0.5;
            }
        }

        ctx.lineWidth = config.thickness;
        for (let l = 1; l < config.density; l++) {
            const thresh = l / config.density;
            const alpha = (0.15 + (l / config.density) * 0.8) * config.opacity;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            for (let r = 0; r < rows - 1; r++) {
                for (let c = 0; c < cols - 1; c++) {
                    const x = c * config.step, y = r * config.step;
                    const vTL = grid[r * cols + c], vTR = grid[r * cols + (c + 1)], vBL = grid[(r + 1) * cols + c];
                    if ((vTL >= thresh && vTR < thresh) || (vTL < thresh && vTR >= thresh) || (vTL >= thresh && vBL < thresh) || (vTL < thresh && vBL >= thresh)) {
                        const tTop = (thresh - vTL) / (vTR - vTL || 0.0001);
                        const tLeft = (thresh - vTL) / (vBL - vTL || 0.0001);
                        if (tTop >= 0 && tTop <= 1 && tLeft >= 0 && tLeft <= 1) {
                            ctx.moveTo(x + tTop * config.step, y);
                            ctx.lineTo(x, y + tLeft * config.step);
                        }
                    }
                }
            }
            ctx.stroke();
        }
        zOffset += config.speed;
        requestAnimationFrame(draw);
    }
    draw();
});