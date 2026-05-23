import { OrbitControls } from 'three/examples/jsm/Addons.js'
import './style.css'
import * as THREE from 'three'
import Lenis from "lenis"
import vertexShader from './shaders/vertexShader.glsl'
import fragmentShader from './shaders/fragmentShader.glsl'
import gsap from 'gsap'

history.scrollRestoration = "manual";

class Experience {
    constructor(options) {
        this.clock = new THREE.Clock()
        this.container = options.dom
        this.width = this.container.offsetWidth
        this.height = this.container.offsetHeight
        this.scrollY = 0
        this.mouse = new THREE.Vector2()
        this.raycaster  = new THREE.Raycaster()

        this.images = [...document.querySelectorAll('img')]

        // Setup
        this.setupScene()
        this.setupCamera()
        this.setupRenderer()
        this.setupLenis()
        this.mouseMovement()
        // this.setupOrbitControls()
        this.setupResize()

        this.createImage()
        this.positionImages()

        // Add Objects
        // this.addObjects()

        this.tick()
    }
    setupScene() {
        this.scene = new THREE.Scene()
        // this.scene.background = new THREE.Color('#010101')
    }

    setupCamera() {
        this.cameraDistance = 600

        this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000)
        this.camera.position.z = this.cameraDistance

        this.camera.fov = 2 * Math.atan(this.height / 2 / this.cameraDistance) * 180 / Math.PI
        this.camera.updateProjectionMatrix()
    }

    setupLenis() {
        this.lenis = new Lenis()
        
        this.lenis.on("scroll", (e) => {
            this.scrollY = e.animatedScroll
        })
    }

    mouseMovement() {
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / this.width) * 2 - 1
            this.mouse.y = -(e.clientY / this.height) * 2 + 1

            this.raycaster.setFromCamera(this.mouse, this.camera)

            const intersect = this.raycaster.intersectObjects(this.scene.children)

            if(intersect.length > 0) {

                let object = intersect[0].object

                object.material.uniforms.uMouseHover.value = intersect[0].uv
            }
        })        
    }

    createImage() {
        this.imageInfo = this.images.map((img) => {
            let info = img.getBoundingClientRect()

            const material = new THREE.ShaderMaterial({
                uniforms: {
                    uTime: {
                        value: 0
                    },
                    uTexture: {
                        value: new THREE.TextureLoader().load(img.src)
                    },
                    uImageRatio: {
                        value: img.naturalWidth / img.naturalHeight,
                    },
                    uPlaneRatio: {
                        value: info.width / info.height
                    },
                    uMouseHover: {
                        value: new THREE.Vector2(0.5, 0.5)
                    },
                    uHover: {
                        value: 0
                    }
                },
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                side: THREE.DoubleSide,
            })

            img.addEventListener('mouseenter', () => {
                gsap.to(material.uniforms.uHover, {
                    value: 1,
                    duration: 0.5
                })
            })
            img.addEventListener('mouseleave', () => {
                gsap.to(material.uniforms.uHover, {
                    value: 0,
                    duration: 0.5
                })
            })
                
            const mesh = new THREE.Mesh(
                new THREE.PlaneGeometry(info.width, info.height, 50, 50),
                material
            )
                
            this.scene.add(mesh)

            return {
                img: img,
                mesh: mesh,
                top: info.top,
                material: material,
                left: info.left,
                width: info.width,
                height: info.height
            }
        })
    }

    positionImages() {
        this.imageInfo.forEach((img) => {
            img.mesh.position.x = img.width / 2 + img.left - this.width / 2
            img.mesh.position.y = - img.height / 2 - img.top + this.height / 2
        })
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        })
        this.renderer.setSize(this.width, this.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.container.appendChild(this.renderer.domElement)
    }

    setupOrbitControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.controls.enableDamping = true
    }

    setupResize() {
        window.addEventListener('resize', this.resize.bind(this))
    }
    resize() {
        this.width = this.container.offsetWidth
        this.height = this.container.offsetHeight

        this.camera.fov = 2 * Math.atan(this.height / 2 / this.cameraDistance) * 180 / Math.PI
        this.camera.aspect = this.width / this.height
        this.camera.updateProjectionMatrix()

        this.renderer.setSize(this.width, this.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        
        this.imageInfo.forEach((img) =>{
            let info = img.img.getBoundingClientRect()
            
            img.top = info.top,
            img.left = info.left,
            img.width = info.width,
            img.height = info.height

            img.mesh.geometry.dispose()
            img.mesh.geometry = new THREE.PlaneGeometry(info.width, info.height, 50, 50)

            img.material.uniforms.uPlaneRatio.value = info.width / info.height
        })

        this.positionImages()
    }

    addObjects() {
        this.geometry = new THREE.PlaneGeometry(1, 1, 50, 50)
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: {
                    value: 0
                }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            side: THREE.DoubleSide,
        })
        
        this.cube = new THREE.Mesh(this.geometry, this.material)
        this.scene.add(this.cube)
    }

    tick() {
        this.time = this.clock.getElapsedTime()

        
        this.lenis.raf(this.time * 1000)
        
        this.imageInfo.forEach((img) => {
            img.mesh.position.y = - img.height / 2 - img.top + this.height / 2 + this.scrollY
            img.material.uniforms.uTime.value = this.time
        })

        // this.controls.update()

        this.renderer.render(this.scene, this.camera)
        
        requestAnimationFrame(this.tick.bind(this))
    }
}

new Experience({dom: document.querySelector('.container')})
