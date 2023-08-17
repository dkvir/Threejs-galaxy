/* Demo JS */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { gsap } from 'gsap';
import { DoubleSide, EquirectangularRefractionMapping } from 'three';
import { AnimationUtils } from 'three';

const canvas = document.querySelector('.canvas');

let particlesGeometry,particlesMaterial, points;
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const orbit = new OrbitControls(camera, renderer.domElement);

const gui = new GUI({width:360})

// Camera positioning
camera.position.set(0, 0, 6);
orbit.autoRotate = true;

const parameters = {
  count: 100000,
  size: 0.02,
  radius: 5,
  branches: 2,
  spin: 1,
  randomness: 0.2,
  randomnessPower: 3,
  insideColor: '#ff6030',
  outsideColor: '#1b3984'
}

const generateParticles = ()=>{
  if(points){
    particlesGeometry.dispose();
    particlesMaterial.dispose();
    scene.remove(points);
  }
  particlesGeometry = new THREE.BufferGeometry()
  const positions = new Float32Array(parameters.count * 3)
  const colors = new Float32Array(parameters.count * 3)

  const colorInside = new THREE.Color(parameters.insideColor)
  const colorOutside = new THREE.Color(parameters.outsideColor)

  for(let i = 0; i < parameters.count; i++){

    //positions
    const i3 = i * 3

    const radius = Math.random() * parameters.radius
    const spinAngle = radius * parameters.spin
    const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2
    const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? -1 : 1 )
    const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? -1 : 1 )
    const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? -1 : 1 )

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX
    positions[i3 + 1] = randomY 
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

    //colors
    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / parameters.radius)

    colors[i3] = mixedColor.r
    colors[i3 + 1] = mixedColor.g
    colors[i3 + 2] = mixedColor.b

  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  particlesMaterial = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true
  })

  points = new THREE.Points(particlesGeometry, particlesMaterial)

  scene.add(points);
}

generateParticles();

gui.add(parameters, 'count').min(100).max(50000).step(100).onFinishChange(generateParticles)
gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateParticles)
gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateParticles)
gui.add(parameters, 'branches').min(3).max(10).step(1).onFinishChange(generateParticles)
gui.add(parameters, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateParticles)
gui.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateParticles)
gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateParticles)
gui.addColor(parameters, 'insideColor').onFinishChange(generateParticles)
gui.addColor(parameters, 'outsideColor').onFinishChange(generateParticles)


function animate() {
  renderer.render(scene, camera);
  orbit.update();
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', resizeEvent);

function resizeEvent() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
