import { AfterViewInit, Component, NgZone, OnDestroy, inject } from '@angular/core';
import * as THREE from 'three';

/** Velocidade da chuva em unidades por segundo (independente da taxa de quadros). */
const RAIN_SPEED = 90;
const CLOUD_SPIN = 0.06;
/** Raios por segundo, em media. */
const FLASH_RATE = 6;

/**
 * O fundo e decorativo: 30fps bastam. Como todo movimento e calculado por
 * tempo decorrido, limitar a taxa nao produz solavanco.
 */
const FRAME_MS = 1000 / 30 - 2;

/**
 * Fracao da resolucao da tela em que a cena e desenhada. O canvas e esticado
 * por CSS ate o tamanho cheio; com chuva e nevoa a diferenca nao aparece, e o
 * custo de preenchimento cai pelo quadrado do fator.
 */
const RENDER_SCALE = 0.65;

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
  private flash!: THREE.PointLight;

  private rain!: THREE.InstancedMesh;
  /** Matrizes de instancia da chuva, escritas direto para evitar custo por gota. */
  private rainMatrices!: Float32Array;
  private cloudParticles: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshLambertMaterial>[] = [];

  private readonly zone = inject(NgZone);
  private frameId = 0;
  private lastTime = 0;
  private lastDraw = 0;
  private paused = false;
  private rainCount = 0;

  ngAfterViewInit(): void {
    // Sem animação de fundo para quem pediu menos movimento.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Sem GPU, cada quadro e rasterizado na CPU e trava a pagina inteira.
    if (!Modelo3DComponent.temGpu()) return;

    this.init();
  }

  /**
   * Detecta rasterizacao por software (SwiftShader, llvmpipe, Mesa generico),
   * comum em maquinas virtuais, navegadores headless e drivers desatualizados.
   */
  private static temGpu(): boolean {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') as WebGLRenderingContext | null;
      if (!gl) return false;

      const info = gl.getExtension('WEBGL_debug_renderer_info');
      const nome = info
        ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL) ?? '').toLowerCase()
        : '';

      // Libera o contexto de teste: o navegador so permite alguns por pagina.
      gl.getExtension('WEBGL_lose_context')?.loseContext();

      // Sem a extensao (navegadores que a bloqueiam) assume-se que ha GPU.
      if (!nome) return true;

      return !/swiftshader|llvmpipe|software|basic render|microsoft basic/.test(nome);
    } catch {
      return false;
    }
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.frameId);
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('visibilitychange', this.onVisibility);

    this.rain?.geometry.dispose();
    (this.rain?.material as THREE.Material)?.dispose();
    this.cloudParticles.forEach(cloud => cloud.material.dispose());
    this.cloudParticles[0]?.geometry.dispose();

    this.renderer?.domElement.remove();
    this.renderer?.dispose();
  }

  private onResize = (): void => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.applySize();
  };

  /** Desenha abaixo da resolucao da tela; o CSS estica o canvas de volta. */
  private applySize(): void {
    this.renderer.setSize(
      Math.round(window.innerWidth * RENDER_SCALE),
      Math.round(window.innerHeight * RENDER_SCALE),
      false
    );
  }

  /** Aba escondida não precisa desenhar nada. */
  private onVisibility = (): void => {
    this.paused = document.hidden;
    // Zera o relogio para nao aplicar um salto gigante ao voltar.
    this.lastTime = 0;
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
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(0x07070f);
    this.applySize();
    this.renderer.domElement.id = 'bg-canvas';
    document.body.appendChild(this.renderer.domElement);

    this.initRain();
    this.initClouds();

    window.addEventListener('resize', this.onResize);
    document.addEventListener('visibilitychange', this.onVisibility);

    // Fundo animado nao precisa de change detection a cada frame.
    this.zone.runOutsideAngular(() => this.animate(performance.now()));
  }

  /**
   * Toda a chuva em um único InstancedMesh: uma geometria, um material e uma
   * chamada de desenho por quadro, no lugar de milhares de Mesh individuais.
   */
  private initRain(): void {
    this.rainCount = window.innerWidth < 760 ? 900 : 2000;

    const dropGeometry = new THREE.SphereGeometry(0.05, 6, 4);
    dropGeometry.scale(3, 8, 3);

    const rainMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.5,
      shininess: 50,
    });

    this.rain = new THREE.InstancedMesh(dropGeometry, rainMaterial, this.rainCount);
    this.rain.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.rain.frustumCulled = false;

    // A escala ja esta na geometria, entao cada instancia e identidade + translacao.
    this.rainMatrices = this.rain.instanceMatrix.array as Float32Array;

    for (let i = 0; i < this.rainCount; i++) {
      const o = i * 16;
      this.rainMatrices[o] = 1;
      this.rainMatrices[o + 5] = 1;
      this.rainMatrices[o + 10] = 1;
      this.rainMatrices[o + 15] = 1;
      this.rainMatrices[o + 12] = Math.random() * 200 - 100;
      this.rainMatrices[o + 13] = Math.random() * 500 - 250;
      this.rainMatrices[o + 14] = Math.random() * 200 - 100;
    }

    this.rain.instanceMatrix.needsUpdate = true;
    this.scene.add(this.rain);
  }

  private animateRain(dt: number): void {
    const queda = RAIN_SPEED * dt;

    for (let i = 0; i < this.rainCount; i++) {
      const y = i * 16 + 13;
      this.rainMatrices[y] -= queda;

      if (this.rainMatrices[y] < -100) {
        this.rainMatrices[y] = Math.random() * 200 + 100;
        this.rainMatrices[y - 1] = Math.random() * 200 - 100;
        this.rainMatrices[y + 1] = Math.random() * 200 - 100;
      }
    }

    this.rain.instanceMatrix.needsUpdate = true;
  }

  private initClouds(): void {
    const loader = new THREE.TextureLoader();
    loader.load('assets/img/smoke.webp', (texture) => {
      // Planos grandes e translúcidos custam preenchimento: poucos bastam.
      const cloudGeo = new THREE.PlaneGeometry(400, 400);

      for (let p = 0; p < 8; p++) {
        // Material por nuvem, senão a opacidade de uma sobrescreve a das outras.
        const cloudMaterial = new THREE.MeshLambertMaterial({
          map: texture,
          transparent: true,
          depthWrite: false,
          opacity: Math.random() * 0.2,
        });

        const cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
        cloud.position.set(
          Math.random() * 800 - 380,
          400 + Math.random() * 100,
          Math.random() * 500 - 450
        );
        cloud.rotation.set(1.18, -0.12, Math.random() * Math.PI * 2);

        this.cloudParticles.push(cloud);
        this.scene.add(cloud);
      }
    });
  }

  private animateClouds(dt: number): void {
    for (const cloud of this.cloudParticles) {
      cloud.rotation.z += CLOUD_SPIN * dt;

      const newOpacity = cloud.material.opacity + (Math.random() - 0.5) * 0.6 * dt;
      cloud.material.opacity = Math.min(1, Math.max(0.2, newOpacity));
    }
  }

  private animate(now: number): void {
    this.frameId = requestAnimationFrame(time => this.animate(time));

    if (this.paused) return;
    if (now - this.lastDraw < FRAME_MS) return;
    this.lastDraw = now;

    // Tudo se move por segundo, nao por quadro: taxa irregular nao vira tranco.
    const dt = this.lastTime ? Math.min((now - this.lastTime) / 1000, 0.05) : 1 / 60;
    this.lastTime = now;

    this.animateClouds(dt);
    this.animateRain(dt);

    if (Math.random() < FLASH_RATE * dt || this.flash.power > 100) {
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
