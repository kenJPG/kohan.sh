import './style.css';

// 3D Torus Knot - the one visual flourish
class TorusKnot {
    private el: HTMLPreElement;
    private A: number = 0;
    private w: number = 80;
    private h: number = 28;
    private buf: string[] = [];
    private z: number[] = [];
    private visible: boolean = true;

    constructor(id: string) {
        this.el = document.getElementById(id) as HTMLPreElement;
        if (!this.el) return;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; })
            .observe(this.el);

        this.loop();
    }

    private resize(): void {
        this.w = window.innerWidth < 480 ? 50 : window.innerWidth < 768 ? 65 : 80;
        this.h = window.innerWidth < 480 ? 18 : window.innerWidth < 768 ? 22 : 28;
        this.buf = new Array(this.w * this.h).fill(' ');
        this.z = new Array(this.w * this.h).fill(0);
    }

    private render(): void {
        this.buf.fill(' ');
        this.z.fill(0);

        const R1 = 6, R2 = 12, K2 = 5;
        const K1 = this.w * K2 * 3 / (8 * (R1 + R2));

        for (let t = 0; t < 6.28; t += 0.07) {
            for (let p = 0; p < 6.28; p += 0.03) {
                const r = R2 + R1 * Math.cos(3 * t);
                const x = r * Math.cos(2 * t + this.A) + R1 * Math.cos(p + this.A) * 0.5;
                const y = r * Math.sin(2 * t + this.A) + R1 * Math.sin(p + this.A) * 0.5;
                const zz = K2 + R1 * Math.sin(3 * t) + R1 * Math.cos(p) * 0.3;

                const ooz = 1 / zz;
                const xp = Math.floor(this.w / 2 + K1 * ooz * x);
                const yp = Math.floor(this.h / 2 - K1 * ooz * y);
                const i = xp + yp * this.w;

                if (i >= 0 && i < this.w * this.h && ooz > this.z[i]) {
                    this.z[i] = ooz;
                    const L = Math.floor(8 * (Math.sin(p) * Math.cos(t) * 0.5 + 0.5));
                    this.buf[i] = '.,-~:;=!*#$@'[Math.max(0, Math.min(L, 11))];
                }
            }
        }

        let out = '';
        for (let i = 0; i < this.buf.length; i++) {
            if (i > 0 && i % this.w === 0) out += '\n';
            out += this.buf[i];
        }
        this.el.textContent = out;
        this.A += 0.03;
    }

    private loop(): void {
        if (this.visible) this.render();
        requestAnimationFrame(() => this.loop());
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    new TorusKnot('torusKnot');
});
