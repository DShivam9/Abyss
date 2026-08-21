import * as THREE from "three";

export function createCleanAbyssLogoShape(): THREE.Shape {
  const relCommands = [
    [50, 7.5234],
    [2.2461, 29.645],
    [5.9648, -15.68],
    [-5.2891, 24.566],
    [0.089844, 1.0898],
    [37.09, -22.633],
    [-27.855, 22.355],
    [20.266, -5.3906],
    [-24.645, 10.09],
    [42.133, 11.113],
    [-39.566, -5.5469],
    [21.109, 12.812],
    [-25.188, -11.445],
    [15.898, 34.777],
    [-19.363, -30.055],
    [3.1523, 22.242],
    [-7.2656, -24.844],
    [-21.031, 32.656],
    [14.41, -31.531],
    [-16.945, 14.586],
    [17.043, -19.578],
    [-42.254, 5.9141],
    [36.457, -9.6016],
    [-24.191, -3.6328],
    [29.801, 0.89844],
    [-32.168, -25.82],
    [28.945, 17.656],
    [-11.887, -17.145],
    [19.934, 22.055],
    [0.097656, 0.066406]
  ];

  const scale = 0.046;
  const shape = new THREE.Shape();
  let curX = relCommands[0][0];
  let curY = relCommands[0][1];

  shape.moveTo((curX - 50) * scale, -(curY - 50) * scale);

  for (let i = 1; i < relCommands.length; i++) {
    curX += relCommands[i][0];
    curY += relCommands[i][1];
    shape.lineTo((curX - 50) * scale, -(curY - 50) * scale);
  }

  shape.closePath();
  return shape;
}

export function createLiquidMercuryStudioEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const envScene = new THREE.Scene();
  
  const envGeo = new THREE.SphereGeometry(90, 32, 16);
  const envMat = new THREE.MeshBasicMaterial({ color: 0x050508, side: THREE.BackSide });
  envScene.add(new THREE.Mesh(envGeo, envMat));

  const topSoftbox = new THREE.Mesh(
    new THREE.CircleGeometry(50, 24),
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
  );
  topSoftbox.position.set(0, 60, 0);
  topSoftbox.rotation.x = Math.PI / 2;
  envScene.add(topSoftbox);

  const frontSoftbox = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
  );
  frontSoftbox.position.set(0, 0, 55);
  frontSoftbox.lookAt(0, 0, 0);
  envScene.add(frontSoftbox);

  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const bar = new THREE.Mesh(
      new THREE.PlaneGeometry(28, 95),
      new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
    );
    bar.position.set(Math.cos(angle) * 55, (i % 2 === 0 ? 15 : -15), Math.sin(angle) * 55);
    bar.lookAt(0, 0, 0);
    envScene.add(bar);
  }

  const horizStrip = new THREE.Mesh(
    new THREE.RingGeometry(45, 52, 32),
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
  );
  horizStrip.position.set(0, 0, 0);
  horizStrip.rotation.x = Math.PI / 2;
  envScene.add(horizStrip);

  const pmremGen = new THREE.PMREMGenerator(renderer);
  const envMap = pmremGen.fromScene(envScene, 0.04).texture;
  pmremGen.dispose();
  return envMap;
}
