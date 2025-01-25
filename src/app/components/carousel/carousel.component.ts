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
    { url: 'assets/img/spiderinicio.jpg', caption: 'Image 1 Caption', alt: 'Image 1' },
    { url: 'assets/img/ghost-of-tsushima.jpg', caption: 'Image 2 Caption', alt: 'Image 2' },
    { url: 'assets/img/forbidden.png', caption: 'Image 3 Caption', alt: 'Image 3' },
    { url: 'assets/img/the-last-of-us.jpg', caption: 'Image 4 Caption', alt: 'Image 4' },
    { url: 'assets/img/godrag.jpg', caption: 'Image 5 Caption', alt: 'Image 5' },
    { url: 'assets/img/death-stranding.png', caption: 'Image 6 Caption', alt: 'Image 6' },
  ];

  radius = 200;
  width = 150;
  height = 100;
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

  constructor() {}

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
    window.addEventListener('touchstart', this.onTouchStart.bind(this));
    window.addEventListener('touchend', this.onTouchEnd.bind(this));
    window.addEventListener('touchmove', this.onTouchMove.bind(this));
  }

  initScene(): void {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.position.z = 500;

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    const container = this.carouselContainerRef.nativeElement;
    container.appendChild(this.renderer.domElement);

    const light = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(light);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(50, 50, 50);
    this.scene.add(pointLight);

    this.angleStep = (2 * Math.PI) / this.images.length;
  }

  onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  loadImages(): void {
    const textureLoader = new THREE.TextureLoader();
    const loader = new FontLoader();
  
    this.images.forEach((image, index) => {
      textureLoader.load(
        image.url,
        (texture) => {
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
  
          const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
          const plane = new THREE.Mesh(new THREE.PlaneGeometry(this.width, this.height, 3, 3), material);
          
          const angle = index * this.angleStep;
          plane.rotation.y = -angle - Math.PI / 2;
          plane.position.set(this.radius * Math.cos(angle), 0, this.radius * Math.sin(angle));
          plane.scale.x = -1;
  
          this.scene.add(plane);
  
          loader.load('assets/fonts/helvetiker_regular.typeface.js', (font) => {
            let size = 0.6 * (this.width / image.caption.length);
            let height = 2;
  
            const text3d = new TextGeometry(image.caption, {
              size: size,
              height: height,
              curveSegments: 2,
              font: font,
            });
  
            const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const text = new THREE.Mesh(text3d, textMaterial);
  
            const textContainer = new THREE.Object3D();
            textContainer.add(text);
  
            text.position.x = 0;
            text.position.y = plane.position.y - size - 0.5 * this.height - 5;
            text.position.z = plane.position.z + 2;
  
            text.scale.set(1, 1, 1);
  
            this.scene.add(textContainer);
  
            this.addDescriptionText(image.caption, plane.position, loader, font);
          });
  
          this.addReflection(image.url, angle);
        },
        undefined,
        (error) => {
          console.error('Erro ao carregar a textura:', error);
        }
      );
    });
  }

  addDescriptionText(description: string, planePosition: THREE.Vector3, loader: FontLoader, font: any): void {
    loader.load('assets/fonts/helvetiker_regular.typeface.js', (font) => {
      let size = 0.4 * (this.width / description.length); 
      let height = 1;
  
      const text3d = new TextGeometry(description, {
        size: size,
        height: height,
        curveSegments: 2,
        font: font,
      });
  
      const textMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });
      const text = new THREE.Mesh(text3d, textMaterial);
  
      const textContainer = new THREE.Object3D();
      textContainer.add(text);
  
      text.position.x = planePosition.x;
      text.position.y = planePosition.y - 1.2 * this.height;
      text.position.z = planePosition.z;
  
      text.scale.set(1, 1, 1);
  
      this.scene.add(textContainer);
    });
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
        reflectionMesh.scale.x = -1;
        reflectionMesh.position.y -= 50;

        this.scene.add(reflectionMesh);
      } else {
        console.error('Falha ao obter o contexto 2D do canvas');
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

    if (this.updatecamera && Math.abs(this.mouse.y - this.prevmouse.y) > Math.abs(this.mouse.x - this.prevmouse.x)) {
      this.camera.position.z += (this.mouse.y - this.prevmouse.y) * 20;
    }

    this.updatecamera = false;
    this.carouselupdate = true;
  }

  // Mouse events
  onDocumentMouseDown(event: MouseEvent): void {
    this.mouseDown = true;
    this.startX = event.clientX;
  }

  onDocumentMouseUp(event: MouseEvent): void {
    this.mouseDown = false;
    this.targetRotationY += (this.currentX - this.startX) * 0.005;
    this.currentRotationY = this.targetRotationY;
  }

  onDocumentMouseMove(event: MouseEvent): void {
    if (this.mouseDown) {
      this.currentX = event.clientX;
      const deltaX = this.currentX - this.startX;
      this.targetRotationY = this.currentRotationY + deltaX * this.rotationSpeed;
    }
  }

  onDocumentMouseOut(): void {
    this.mouseDown = false;
  }

  // Touch events
  onTouchStart(event: TouchEvent): void {
    this.mouseDown = true;
    this.startX = event.touches[0].clientX;
  }

  onTouchEnd(event: TouchEvent): void {
    this.mouseDown = false;
    this.targetRotationY += (this.currentX - this.startX) * 0.005;
    this.currentRotationY = this.targetRotationY;
  }

  onTouchMove(event: TouchEvent): void {
    if (this.mouseDown) {
      this.currentX = event.touches[0].clientX;
      const deltaX = this.currentX - this.startX;
      this.targetRotationY = this.currentRotationY + deltaX * this.rotationSpeed;
    }
  }
}
