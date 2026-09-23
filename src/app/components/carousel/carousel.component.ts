import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild, inject } from '@angular/core';
import * as THREE from 'three';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

const FONT_PATH = 'assets/fonts/helvetiker_regular.typeface.json';

@Component({
  selector: 'app-carousel',
  standalone: true,
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements AfterViewInit, OnDestroy {
  @ViewChild('carouselContainer', { static: true }) carouselContainerRef!: ElementRef<HTMLElement>;

  private readonly zone = inject(NgZone);

  images = [
    { url: 'assets/img/carousel/spiderinicio.webp', caption: 'Spider Man 2' },
    { url: 'assets/img/carousel/ghost-of-tsushima.webp', caption: 'Ghost of Tsushima' },
    { url: 'assets/img/carousel/forbidden.webp', caption: 'Horizon Forbidden West' },
    { url: 'assets/img/carousel/the-last-of-us.webp', caption: 'The Last of Us' },
    { url: 'assets/img/carousel/godrag.webp', caption: 'God of War Ragnarok' },
    { url: 'assets/img/carousel/death-stranding.webp', caption: 'Death Stranding' },
  ];

  radius = 250;
  width = 300;
  height = 200;
  reflectionOpacity = 0.2;
  reflectionHeightPer = 0.4;

  angleStep!: number;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;

  private dragging = false;
  private prevPointerX = 0;
  private targetRotationY = 0;
  private frameId = 0;

  private resizeObserver?: ResizeObserver;
  private intersectionObserver?: IntersectionObserver;

  /** Só desenha quando o palco está na tela e a aba está visível. */
  private inViewport = true;

  private fontPromise?: Promise<Font>;
  private readonly disposables: Array<THREE.BufferGeometry | THREE.Material | THREE.Texture> = [];

  /** Rotação automática contínua enquanto ninguém arrasta. */
  private readonly autoSpin = 0.0012;

  ngAfterViewInit(): void {
    this.initScene();
    this.loadImages();

    // Loop de render fora do Angular: evita disparar change detection a 60fps.
    this.zone.runOutsideAngular(() => this.animate());

    const container = this.carouselContainerRef.nativeElement;
    container.addEventListener('pointerdown', this.onPointerDown);
    container.addEventListener('pointermove', this.onPointerMove);
    container.addEventListener('pointerup', this.onPointerUp);
    container.addEventListener('pointercancel', this.onPointerUp);
    container.addEventListener('pointerleave', this.onPointerUp);

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(container);

    this.intersectionObserver = new IntersectionObserver(
      ([entry]) => (this.inViewport = entry.isIntersecting),
      { threshold: 0 }
    );
    this.intersectionObserver.observe(container);

  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.frameId);
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();

    const container = this.carouselContainerRef.nativeElement;
    container.removeEventListener('pointerdown', this.onPointerDown);
    container.removeEventListener('pointermove', this.onPointerMove);
    container.removeEventListener('pointerup', this.onPointerUp);
    container.removeEventListener('pointercancel', this.onPointerUp);
    container.removeEventListener('pointerleave', this.onPointerUp);

    this.disposables.forEach(item => item.dispose());
    this.renderer?.dispose();
  }

  private get containerSize(): { width: number; height: number } {
    const el = this.carouselContainerRef.nativeElement;
    return {
      width: el.clientWidth || window.innerWidth,
      height: el.clientHeight || window.innerHeight
    };
  }

  initScene(): void {
    const { width, height } = this.containerSize;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, width / height, 1, 1000);
    this.camera.position.z = 650;

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    this.carouselContainerRef.nativeElement.appendChild(this.renderer.domElement);
    this.angleStep = (2 * Math.PI) / this.images.length;
  }

  private onResize = (): void => {
    if (!this.renderer) return;

    const { width, height } = this.containerSize;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  loadImages(): void {
    // Sem o cache, three.js rebaixa a mesma fonte/textura a cada chamada de load().
    THREE.Cache.enabled = true;

    // Uma requisição de fonte para as seis legendas, em paralelo com as texturas.
    this.fontPromise = new FontLoader().loadAsync(FONT_PATH);
    this.fontPromise.catch(() => undefined);

    const textureLoader = new THREE.TextureLoader();

    this.images.forEach((image, index) => {
      textureLoader.load(
        image.url,
        (texture) => {
          texture.generateMipmaps = true;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
          texture.needsUpdate = true;
          this.disposables.push(texture);

          const material = new THREE.ShaderMaterial({
            uniforms: {
              map: { value: texture },
              saturation: { value: 1.15 },
            },
            vertexShader: `
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.3);
              }
            `,
            fragmentShader: `
              uniform sampler2D map;
              uniform float saturation;
              varying vec2 vUv;

              void main() {
                vec4 color = texture2D(map, vUv);
                float avg = (color.r + color.g + color.b) / 3.0;
                vec3 saturated = mix(vec3(avg), color.rgb, saturation);
                gl_FragColor = vec4(saturated, color.a);
              }
            `,
            side: THREE.DoubleSide,
          });

          const geometry = new THREE.PlaneGeometry(this.width, this.height, 3, 3);
          this.disposables.push(geometry, material);

          const plane = new THREE.Mesh(geometry, material);
          const angle = index * this.angleStep;
          plane.rotation.y = -angle - Math.PI / 2;
          plane.position.set(this.radius * Math.cos(angle), 0, this.radius * Math.sin(angle));
          plane.scale.x = -1;

          this.scene.add(plane);

          const textPosition = new THREE.Vector3(
            plane.position.x,
            plane.position.y - this.height / 2 - 5,
            plane.position.z
          );

          // A imagem já está decodificada: o reflexo reaproveita em vez de rebaixar.
          this.addReflection(texture.image, angle);
          this.addDescriptionText(image.caption, plane, textPosition);
        },
        undefined,
        (error) => {
          console.error('Erro ao carregar a textura:', error);
        }
      );
    });
  }

  addDescriptionText(description: string, plane: THREE.Mesh, textPosition: THREE.Vector3): void {
    this.fontPromise?.then((loadedFont) => {
      const size = Math.max(0.6 * (this.width / description.length), 5);

      const textGeometry = new TextGeometry(description, {
        size: size,
        depth: 2,
        curveSegments: 2,
        font: loadedFont,
      });

      textGeometry.computeBoundingBox();
      const boundingBox = textGeometry.boundingBox!;
      const textWidth = boundingBox.max.x - boundingBox.min.x;

      const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
      this.disposables.push(textGeometry, textMaterial);

      const textMesh = new THREE.Mesh(textGeometry, textMaterial);
      textMesh.position.set(-textWidth / 2, 0, 0);

      const textContainer = new THREE.Object3D();
      textContainer.add(textMesh);
      textContainer.position.set(textPosition.x, textPosition.y + 10, textPosition.z);
      textContainer.rotation.set(0, plane.rotation.y + Math.PI, 0);

      this.scene.add(textContainer);
    });
  }

  addReflection(image: CanvasImageSource, angle: number): void {
    const canvas = document.createElement('canvas');
    const reflectH = this.height * this.reflectionHeightPer;
    canvas.width = this.width;
    canvas.height = reflectH;

    const cntx = canvas.getContext('2d');
    if (!cntx) return;

    cntx.save();
    cntx.globalAlpha = this.reflectionOpacity;
    cntx.translate(0, this.height - 1);
    cntx.scale(1, -1);
    cntx.drawImage(image, 0, 0, this.width, this.height);
    cntx.restore();

    cntx.globalCompositeOperation = 'destination-out';
    const gradient = cntx.createLinearGradient(0, 0, 0, reflectH);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 1.0)');
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
    cntx.fillStyle = gradient;
    cntx.fillRect(0, 0, this.width, 2 * reflectH);

    const reflectionTexture = new THREE.Texture(canvas);
    reflectionTexture.needsUpdate = true;

    const reflectionMaterial = new THREE.MeshBasicMaterial({
      map: reflectionTexture,
      side: THREE.DoubleSide,
      transparent: true,
    });

    const reflectionGeometry = new THREE.PlaneGeometry(this.width, reflectH);
    this.disposables.push(reflectionTexture, reflectionMaterial, reflectionGeometry);

    const reflectionMesh = new THREE.Mesh(reflectionGeometry, reflectionMaterial);
    reflectionMesh.rotation.y = -angle - Math.PI / 2;
    reflectionMesh.position.set(this.radius * Math.cos(angle), -(this.height / 2), this.radius * Math.sin(angle));
    reflectionMesh.scale.x = 0.75;
    reflectionMesh.position.y -= 50;

    this.scene.add(reflectionMesh);
  }

  animate(): void {
    this.frameId = requestAnimationFrame(() => this.animate());

    if (!this.inViewport || document.hidden) return;

    if (!this.dragging) this.targetRotationY += this.autoSpin;
    this.scene.rotation.y += (this.targetRotationY - this.scene.rotation.y) * 0.06;

    this.renderer.render(this.scene, this.camera);
  }

  private onPointerDown = (event: PointerEvent): void => {
    this.dragging = true;
    this.prevPointerX = event.clientX;
    this.carouselContainerRef.nativeElement.setPointerCapture?.(event.pointerId);
  };

  private onPointerMove = (event: PointerEvent): void => {
    if (!this.dragging) return;

    this.targetRotationY += (event.clientX - this.prevPointerX) * 0.005;
    this.prevPointerX = event.clientX;
  };

  private onPointerUp = (): void => {
    this.dragging = false;
  };
}
