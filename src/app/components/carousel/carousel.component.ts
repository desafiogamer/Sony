import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';

@Component({
  selector: 'app-carousel',
  standalone: true,
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit {
  @ViewChild('carouselContainer', { static: true }) carouselContainerRef!: ElementRef;

  images = [
    { url: 'assets/img/spiderinicio.webp', caption: 'Spider Man 2' },
    { url: 'assets/img/ghost-of-tsushima.webp', caption: 'Ghost of Tsushima' },
    { url: 'assets/img/forbidden.webp', caption: 'horizon Forbidden West' },
    { url: 'assets/img/the-last-of-us.webp', caption: 'The last of Us' },
    { url: 'assets/img/godrag.webp', caption: 'God of War Ragnarok' },
    { url: 'assets/img/death-stranding.webp', caption: 'Death Stranding' },
  ];

  radius = 250;
  width = 300;
  height = 200;
  reflectionOpacity = 0.2;
  reflectionHeightPer = 0.4;

  angleStep!: number;
  currentRotationY = 0;
  rotationSpeed = 0.001;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;

  private mouseDown = false;
  private startX = 0;
  private currentX = 0;
  private targetRotationY = 0;
  private prevMouseX = 0;

  private carouselupdate = false;
  private updatecamera = false;
  private prevmouse = { x: 0, y: 0 };
  private mouse = { x: 0, y: 0 };

  constructor() { }

  ngOnInit(): void {
    this.initScene();
    this.loadImages();
    this.animate();

    window.addEventListener('mousedown', this.onDocumentMouseDown.bind(this));
    window.addEventListener('mouseup', this.onDocumentMouseUp.bind(this));
    window.addEventListener('mousemove', this.onDocumentMouseMove.bind(this));
    window.addEventListener('mouseout', this.onDocumentMouseOut.bind(this));
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // Touch Events
    document.addEventListener('touchstart', this.onDocumentTouchStart.bind(this));
    document.addEventListener('touchmove', this.onDocumentTouchMove.bind(this));
    document.addEventListener('touchend', this.onDocumentTouchEnd.bind(this));
  }

  initScene(): void {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.position.z = 650;

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    const container = this.carouselContainerRef.nativeElement;
    container.appendChild(this.renderer.domElement);

    this.angleStep = (2 * Math.PI) / this.images.length;
  }

  onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  loadImages(): void {
    const textureLoader = new THREE.TextureLoader();
    const fontLoader = new FontLoader(); // Carregador de fontes definido aqui

    this.images.forEach((image, index) => {
      textureLoader.load(
        image.url,
        (texture) => {
          texture.generateMipmaps = true;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

          texture.needsUpdate = true;

          const material = new THREE.ShaderMaterial({
            uniforms: {
              map: { value: texture },
              saturation: { value: 1 }, // Ajuste o valor da saturação aqui
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

          // Criando o plano de imagem
          const plane = new THREE.Mesh(new THREE.PlaneGeometry(this.width, this.height, 3, 3), material);
          const angle = index * this.angleStep;
          plane.rotation.y = -angle - Math.PI / 2;
          plane.position.set(this.radius * Math.cos(angle), 0, this.radius * Math.sin(angle));
          plane.scale.x = -1;

          this.scene.add(plane);

          // Criando a posição para o texto, abaixo da imagem, mantendo a rotação da imagem
          const textPosition = new THREE.Vector3(
            plane.position.x,
            plane.position.y - this.height / 2 - 5, // Ajuste para posicionar o texto abaixo
            plane.position.z
          );

          // Adicionar reflexão da imagem
          this.addReflection(image.url, angle);

          // Adicionar descrição
          this.addDescriptionText(image.caption, plane, textPosition, fontLoader, this.width);
        },
        undefined,
        (error) => {
          console.error('Erro ao carregar a textura:', error);
        }
      );
    });
  }

  addDescriptionText(description: string, plane: THREE.Mesh, textPosition: THREE.Vector3, fontLoader: FontLoader, width: number): void {
  
    const fontMap: { [key: string]: string } = {
      helvetiker: 'assets/fonts/helvetiker_regular.typeface.json',
    };
  
    const fontPath = fontMap['helvetiker'];
    if (fontPath) {
      fontLoader.load(fontPath, (loadedFont) => {
  
        const size = Math.max(0.6 * (width / description.length), 5); // Garante que o tamanho mínimo seja 5
        const height = 2; // Altura fixa do texto
  
        const textGeometry = new TextGeometry(description, {
          size: size,
          depth: height,
          curveSegments: 2,
          font: loadedFont,
        });
  
        // Atualizar o bounding box da geometria
        textGeometry.computeBoundingBox();
        const boundingBox = textGeometry.boundingBox!;
        const textWidth = boundingBox.max.x - boundingBox.min.x;
  
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  
        // Centralizando o texto horizontalmente
        textMesh.position.set(-textWidth / 2, 0, 0); // Centraliza o texto dentro do container
  
        const textContainer = new THREE.Object3D();
        textContainer.add(textMesh);
  
        // Posicionando o texto abaixo da imagem
        textContainer.position.set(
          textPosition.x,
          textPosition.y + 10,
          textPosition.z
        );
  
        // Ajustar a rotação do texto para coincidir com o plano
        textContainer.rotation.set(0, plane.rotation.y + Math.PI, 0);
  
        // Adiciona o texto à cena
        this.scene.add(textContainer);
      });
    }
  }

  addReflection(imageUrl: string, angle: number): void {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(imageUrl, (texture) => {
      const canvas = document.createElement('canvas');
      const reflectH = this.height * this.reflectionHeightPer;
      canvas.width = this.width;
      canvas.height = reflectH;

      const cntx = canvas.getContext('2d');
      if (cntx) {
        cntx.save();
        cntx.globalAlpha = this.reflectionOpacity;
        cntx.translate(0, this.height - 1);
        cntx.scale(1, -1);
        cntx.drawImage(texture.image, 0, 0, this.width, this.height);
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

        const reflectionMesh = new THREE.Mesh(new THREE.PlaneGeometry(this.width, reflectH), reflectionMaterial);
        reflectionMesh.rotation.y = -angle - Math.PI / 2;
        reflectionMesh.position.set(this.radius * Math.cos(angle), -(this.height / 2), this.radius * Math.sin(angle));
        reflectionMesh.scale.x = 0.75;
        reflectionMesh.position.y -= 50;

        this.scene.add(reflectionMesh);
      }
    });
  }

  animate(): void {
    requestAnimationFrame(() => this.animate());
    this.render();
    this.renderer.render(this.scene, this.camera);
    TWEEN.update();
  }

  render(): void {
    if (this.carouselupdate) {
      this.scene.rotation.y += (this.targetRotationY - this.scene.rotation.y) * 0.05;
    }
    this.targetRotationY += 0.001

    if (this.updatecamera && Math.abs(this.mouse.y - this.prevmouse.y) > Math.abs(this.mouse.x - this.prevmouse.x)) {
      this.camera.position.z += (this.mouse.y - this.prevmouse.y) * 20;
    }

    this.updatecamera = false;
    this.carouselupdate = true;
  }

  onDocumentMouseDown(event: MouseEvent): void {
    event.preventDefault();
    this.mouseDown = true;
    this.startX = event.clientX;
    this.prevMouseX = this.startX;
  }

  onDocumentMouseMove(event: MouseEvent): void {
    if (!this.mouseDown) return;

    this.currentX = event.clientX;
    const deltaX = this.currentX - this.prevMouseX;
    this.targetRotationY += deltaX * 0.005;
    this.prevMouseX = this.currentX;
    this.carouselupdate = true;
  }

  onDocumentMouseUp(): void {
    this.mouseDown = false;
  }

  onDocumentMouseOut(): void {
    this.mouseDown = false;
  }

  onDocumentTouchStart(event: TouchEvent): void {
    if (event.touches.length === 1) {
      this.mouseDown = true;
      this.startX = event.touches[0].clientX;
      this.prevMouseX = this.startX;
    }
  }

  onDocumentTouchMove(event: TouchEvent): void {
    if (!this.mouseDown || event.touches.length !== 1) return;

    this.currentX = event.touches[0].clientX;
    const deltaX = this.currentX - this.prevMouseX;
    this.targetRotationY += deltaX * 0.005;
    this.prevMouseX = this.currentX;
    this.carouselupdate = true;
  }

  onDocumentTouchEnd(): void {
    this.mouseDown = false;
  }

}
