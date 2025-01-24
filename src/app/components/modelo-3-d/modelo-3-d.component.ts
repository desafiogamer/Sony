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

    const rainCount: number = 6000;

    function init() {
      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 700);
      camera.position.set(0, 0, 1);
      camera.rotation.set(1.16, -0.12, 0.27);

      const directionalLight:THREE.DirectionalLight = new THREE.DirectionalLight(0xffeedd);
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
      const RAIN_AREA_X = 150;
      const RAIN_AREA_Y = 500;
      const RAIN_AREA_Z = 200;
      const PARTICLE_SIZE = 0.1;
      const RAIN_COUNT = 2000;
    
      const rainDropVertices = new Float32Array(RAIN_COUNT * 3);
    
      for (let i = 0; i < RAIN_COUNT; i++) {
        rainDropVertices[i * 3] = Math.random() * RAIN_AREA_X - RAIN_AREA_X / 2; // X
        rainDropVertices[i * 3 + 1] = Math.random() * RAIN_AREA_Y - RAIN_AREA_Y / 2; // Y
        rainDropVertices[i * 3 + 2] = Math.random() * RAIN_AREA_Z - RAIN_AREA_Z / 2; // Z
      }
    
      const rainGeo = new THREE.BufferGeometry();
      rainGeo.setAttribute('position', new THREE.BufferAttribute(rainDropVertices, 3));
    
      const rainMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: PARTICLE_SIZE,
        transparent: true,
        opacity: 0.7, // Para um efeito de gota translúcida
      });
    
      rain = new THREE.Points(rainGeo, rainMaterial);
      scene.add(rain);
    }

    function animateRain() {
      // Obtemos os atributos da geometria
      const positionAttribute = rain.geometry.attributes['position'] as THREE.BufferAttribute;
    
      // Convertendo o array para manipulação
      const positions = positionAttribute.array as Float32Array;
    
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 2] -= 0.5; // Move para baixo em Z
    
        if (positions[i + 2] < -100) {
          positions[i + 2] = Math.random() * 200 + 100; // Reposiciona no topo
          positions[i] = Math.random() * 150 - 75; // X aleatório
          positions[i + 1] = Math.random() * 500 - 250; // Y aleatório
        }
    
        // Opcional: Pequeno deslocamento em X e Y para variações
        positions[i] += (Math.random() - 0.5) * 0.1;
        positions[i + 1] += (Math.random() - 0.5) * 0.1;
      }
    
      // Marca a geometria para atualização
      positionAttribute.needsUpdate = true;
    }

    function initClouds() {
      const loader: THREE.TextureLoader = new THREE.TextureLoader();
      loader.load("assets/img/smoke.webp", function (texture) {
        const cloudGeo = new THREE.PlaneGeometry(400, 400);
        const cloudMaterial = new THREE.MeshLambertMaterial({
          map: texture,
          transparent: true,
          depthWrite: false, // Evita o efeito "quadrado" visual
        });
    
        for (let p = 0; p < 20; p++) {
          const cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
          cloud.position.set(
            Math.random() * 700 - 350, // Limite ajustado para evitar bordas quadradas
            500 + Math.random() * 100, // Adiciona altura variável
            Math.random() * 500 - 450
          );
          cloud.rotation.set(1.18, -0.12, Math.random() * Math.PI * 2);
          cloud.material.opacity = Math.random() * 0.2 // Varia a opacidade inicial
          cloudParticles.push(cloud);
          scene.add(cloud);
        }
      });
    }

    function animateClouds() {
      cloudParticles.forEach((cloud: THREE.Mesh) => {
        cloud.rotation.z += 0.003; // Gira suavemente
    
        // Verifica se o material é MeshLambertMaterial
        const material = cloud.material;
        if (material instanceof THREE.MeshLambertMaterial) {
          // Adiciona variação suave de opacidade
          const newOpacity = material.opacity + (Math.random() - 0.5) * 0.01;
          material.opacity = Math.min(1, Math.max(0.2, newOpacity)); // Limita entre 0.2 e 1
        }
      });
    }

    function animate() {
      requestAnimationFrame(animate);

      cloudParticles.forEach((cloud: THREE.Mesh) => {
        cloud.rotation.z -= 0.002;
      });

      animateClouds();
      animateRain();
      
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
