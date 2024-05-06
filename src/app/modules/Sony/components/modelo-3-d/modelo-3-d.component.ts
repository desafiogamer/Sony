import { AfterViewInit, Component, ElementRef } from '@angular/core';

//biblioteca
import * as THREE from 'three'

@Component({
  selector: 'app-modelo-3-d',
  standalone: true,
  imports: [],
  templateUrl: './modelo-3-d.component.html',
  styleUrl: './modelo-3-d.component.css'
})
export class Modelo3DComponent implements AfterViewInit {
  constructor(private elRef: ElementRef) { }

  ngAfterViewInit(): void {
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let rain: THREE.Points;
    let flash: THREE.PointLight;
    let cloudParticles: THREE.Mesh[] = [];

    const rainCount: number = 12000;

    function init() {
      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 700);
      camera.position.set(0, 0, 1);
      camera.rotation.set(1.16, -0.12, 0.27);

      const directionalLight = new THREE.DirectionalLight(0xffeedd);
      directionalLight.position.set(0, 0, 1);
      scene.add(directionalLight);

      flash = new THREE.PointLight(0x062d89, 80, 500, 0);
      flash.position.set(200, 300, 100);
      scene.add(flash);

      renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x11111f);
      document.body.appendChild(renderer.domElement);

      initRain();
      initClouds();

      animate();
    }

    function initRain() {
      const rainDropVertices = new Float32Array(rainCount * 3);
      const rainDropSizes = new Float32Array(rainCount);

      for (let i = 0; i < rainCount; i++) {
        rainDropVertices[i * 3] = Math.random() * 400 - 200;
        rainDropVertices[i * 3 + 1] = Math.random() * 500 - 250;
        rainDropVertices[i * 3 + 2] = Math.random() * 400 - 200;
        rainDropSizes[i] = 30;
      }

      const rainGeo = new THREE.BufferGeometry();
      rainGeo.setAttribute('position', new THREE.BufferAttribute(rainDropVertices, 3));
      rainGeo.setAttribute('size', new THREE.BufferAttribute(rainDropSizes, 1));

      const rainMaterial = new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 0.15,
        transparent: true
      });

      rain = new THREE.Points(rainGeo, rainMaterial);
      scene.add(rain);
    }

    function initClouds() {
      const loader = new THREE.TextureLoader();
      loader.load("assets/img/smoke.webp", function (texture) {
        const cloudGeo = new THREE.PlaneGeometry(500, 500);
        const cloudMaterial = new THREE.MeshLambertMaterial({
          map: texture,
          transparent: true
        });

        for (let p = 0; p < 25; p++) {
          const cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
          cloud.position.set(
            Math.random() * 700 - 400,
            500,
            Math.random() * 500 - 450
          );
          cloud.rotation.set(1.18, -0.12, Math.random() * Math.PI * 2);
          cloud.material.opacity = 0.1;
          cloudParticles.push(cloud);
          scene.add(cloud);
        }
      });
    }

    function animate() {
      requestAnimationFrame(animate);

      cloudParticles.forEach((cloud: THREE.Mesh) => {
        cloud.rotation.z -= 0.002;
      });

      rain.position.z -= 1;
      if (rain.position.z < -200) {
        rain.position.z = 0;
      }

      if (Math.random() > 0.90 || flash.power > 100) {
        if (flash.power < 100) {
          flash.position.set(
            Math.random() * 400,
            300 + Math.random() * 200,
            100
          );
        }
        flash.power = 50 + Math.random() * 500;
      }

      renderer.render(scene, camera);
    }

    init();
  }
}
