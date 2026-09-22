import { AfterViewInit, Component, NgZone, OnDestroy, inject } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-modelo-3-d',
  standalone: true,
  imports: [],
  templateUrl: './modelo-3-d.component.html',
  styleUrls: ['./modelo-3-d.component.css']
})
export class Modelo3DComponent implements AfterViewInit, OnDestroy {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private rainGroup!: THREE.Group;
  private flash!: THREE.PointLight;
  private cloudParticles: THREE.Mesh[] = [];

  private readonly zone = inject(NgZone);
  private frameId = 0;

  ngAfterViewInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.frameId);
    window.removeEventListener('resize', this.onResize);
    this.renderer?.domElement.remove();
    this.renderer?.dispose();
  }

  private onResize = (): void => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  private init(): void {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      1,
      700
    );
    this.camera.position.set(0, 0, 1);
    this.camera.rotation.set(1.16, -0.12, 0.27);

    const directionalLight = new THREE.DirectionalLight(0xffeedd);
    directionalLight.position.set(0, 0, 1);
    this.scene.add(directionalLight);

    this.flash = new THREE.PointLight(0x062d89, 80, 500, 0);
    this.flash.position.set(200, 300, 100);
    this.scene.add(this.flash);

    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'low-power' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setClearColor(0x07070f);
    this.renderer.domElement.id = 'bg-canvas';
    document.body.appendChild(this.renderer.domElement);

    this.rainGroup = this.initRain();
    this.initClouds();

    window.addEventListener('resize', this.onResize);

    // Fundo animado nao precisa de change detection a cada frame.
    this.zone.runOutsideAngular(() => this.animate());
  }

  private initRain(): THREE.Group {
    const RAIN_COUNT = 2000;
    const rainGroup = new THREE.Group();
    const rainMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.5,
      shininess: 50,
    });

    for (let i = 0; i < RAIN_COUNT; i++) {
      const dropGeometry = new THREE.SphereGeometry(0.05, 8, 8);
      dropGeometry.scale(3, 8, 3);

      const rainDrop = new THREE.Mesh(dropGeometry, rainMaterial);
      rainDrop.position.set(
        Math.random() * 200 - 100,
        Math.random() * 500 - 250,
        Math.random() * 200 - 100
      );
      rainGroup.add(rainDrop);
    }

    this.scene.add(rainGroup);
    return rainGroup;
  }

  private animateRain(): void {
    this.rainGroup.children.forEach((drop) => {
      drop.position.y -= 1.5;

      if (drop.position.y < -100) {
        drop.position.y = Math.random() * 200 + 100;
        drop.position.x = Math.random() * 200 - 100;
        drop.position.z = Math.random() * 200 - 100;
      }
    });
  }

  private initClouds(): void {
    const loader = new THREE.TextureLoader();
    loader.load('assets/img/smoke.webp', (texture) => {
      const cloudGeo = new THREE.PlaneGeometry(400, 400);
      const cloudMaterial = new THREE.MeshLambertMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
      });
  
      for (let p = 0; p < 30; p++) {
        const cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
        
        // Valores personalizados para posição
        const x = Math.random() * 800 - 380; // Ajuste de X
        const y = 400 + Math.random() * 100; // Ajuste de Y
        const z = Math.random() * 500 - 450; // Ajuste de Z
        cloud.position.set(x, y, z);
  
        cloud.rotation.set(1.18, -0.12, Math.random() * Math.PI * 2);
  
        // Opacidade inicial personalizada
        cloud.material.opacity = Math.random() * 0.2;
  
        this.cloudParticles.push(cloud);
        this.scene.add(cloud);
      }
    });
  }
  
  private animateClouds(): void {
    this.cloudParticles.forEach((cloud) => {
      // Tornar o movimento mais lento
      cloud.rotation.z += 0.001; // Reduzido para 0.001 para movimento mais lento
  
      // Controle da opacidade com suavidade
      const material = cloud.material;
      if (material instanceof THREE.MeshLambertMaterial) {
        const newOpacity = material.opacity + (Math.random() - 0.5) * 0.005; // Mais lento e controlado
        material.opacity = Math.min(1, Math.max(0.2, newOpacity)); // Mantém limite de opacidade entre 0.2 e 1
      }
    });
  }

  private animate(): void {
    this.frameId = requestAnimationFrame(() => this.animate());

    this.animateClouds();
    this.animateRain();

    if (Math.random() > 0.90 || this.flash.power > 100) {
      if (this.flash.power < 100) {
        this.flash.position.set(
          Math.random() * 400,
          300 + Math.random() * 200,
          100
        );
      }
      this.flash.power = 50 + Math.random() * 500;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
