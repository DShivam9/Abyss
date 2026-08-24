/**
 * 2D Value Noise generator with octaves and stretching for organic patterns.
 */
export class ValueNoise2D {
  private grid: number[];

  constructor(seed: number = Math.random()) {
    this.grid = new Array(256 * 256);
    // Simple LCG pseudo-random generator based on seed
    let s = seed;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    for (let i = 0; i < 256 * 256; i++) {
      this.grid[i] = rand();
    }
  }

  // Base value noise at (x, y)
  noise(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);

    // Smoothstep interpolation
    const u = xf * xf * (3.0 - 2.0 * xf);
    const v = yf * yf * (3.0 - 2.0 * yf);

    const n00 = this.grid[Y * 256 + X];
    const n10 = this.grid[Y * 256 + ((X + 1) & 255)];
    const n01 = this.grid[((Y + 1) & 255) * 256 + X];
    const n11 = this.grid[((Y + 1) & 255) * 256 + ((X + 1) & 255)];

    const x1 = n00 + u * (n10 - n00);
    const x2 = n01 + u * (n11 - n01);

    return x1 + v * (x2 - x1);
  }

  // Fractal Brownian Motion (FBM) combining multiple octaves
  fbm(x: number, y: number, octaves: number = 3): number {
    let value = 0;
    let amplitude = 0.5;
    let frequency = 1.0;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      value += this.noise(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= 0.5;
      frequency *= 2.0;
    }

    return value / maxValue;
  }
}
