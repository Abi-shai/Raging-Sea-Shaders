import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import vertexShader from './shaders/RagingSea/vertex.glsl'
import fragmentShader from './shaders/RagingSea/fragment.glsl'
import { generateUUID } from 'three/src/math/MathUtils'

/**
 * Base
 */
// Debug
const gui = new dat.GUI({ width: 340, _closed: true })

// Debug folder for the waves effect
const waveControls = gui.addFolder('waveControls')
waveControls.open( false )

// Debug folder for the small waves effect
const smallWavesControls = gui.addFolder('smallWavesControls')
smallWavesControls.open( false)

// Debug folder for the waves surface color and depth effect
const wavesColorsAndShapesControls = gui.addFolder('wavesColorsAndShapes')
wavesColorsAndShapesControls.open( false)

const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Water
 */
// Geometry
const waterGeometry = new THREE.PlaneGeometry(2, 2, 550, 550)

// Color
debugObject.depthColor = '#022e50'
debugObject.surfaceColor = '#56adc7'

// Material
const waterMaterial = new THREE.ShaderMaterial(
    {

        vertexShader: vertexShader,
        fragmentShader: fragmentShader,

        // Customs shader Uniforms
        uniforms: 
        {
            uTime: { value: 0 },

            uWavesElevation: { value: 0.0897 },
            uWavesFrequency: { value: new THREE.Vector2(4, 6.7752) },
            uWavesSpeed: { value: 0.75},

            uSmallWavesElevation: { value: 0.20 },
            uSmallWavesFrequency: { value: 3.0 },
            uSmallWavesSpeed: { value: 0.2 },
            uSmallWavesIteration: { value: 8 },

            uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
            uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
            uColorOffset: { value: 0.9095 },
            uColorMultiplier: { value: 6.4658 }
        }
        
    }
)

// Debug
waveControls.add(waterMaterial.uniforms.uWavesElevation, 'value').min(0).max(1).step(0.0001).name("uWaves Elevation")
waveControls.add(waterMaterial.uniforms.uWavesFrequency.value, 'x').min(0).max(10).step(0.0001).name('Waves FrequencyX')
waveControls.add(waterMaterial.uniforms.uWavesFrequency.value, 'y').min(0).max(10).step(0.0001).name('Waves FrequencyY')
waveControls.add(waterMaterial.uniforms.uWavesSpeed, 'value').min(0.5).max(10).step(0.0001).name('Waves Speed')
wavesColorsAndShapesControls.addColor(debugObject, 'depthColor').name('Depth Color').onChange(
    () => {
        waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor)
    }
)
wavesColorsAndShapesControls.addColor(debugObject, 'surfaceColor').name('Surface Color').onChange(
    () => {
        waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor)
    }
)
wavesColorsAndShapesControls.add(waterMaterial.uniforms.uColorOffset, 'value').min(0).max(1).step(0.0001).name('Waves Color Offset')
wavesColorsAndShapesControls.add(waterMaterial.uniforms.uColorMultiplier, 'value').min(0).max(10).step(0.0001).name('Waves Color Multiplier')
smallWavesControls.add(waterMaterial.uniforms.uSmallWavesElevation, 'value').min(0).max(0.5).step(0.0001).name('Small Waves Elevation')
smallWavesControls.add(waterMaterial.uniforms.uSmallWavesFrequency, 'value').min(1).max(10).step(0.0001).name('Small Waves Frequency')
smallWavesControls.add(waterMaterial.uniforms.uSmallWavesSpeed, 'value').min(0.1).max(5).step(0.0001).name('Small Waves Speed')
smallWavesControls.add(waterMaterial.uniforms.uSmallWavesIteration, 'value').min(3).max(10).step(0.0001).name('Small Waves Iteration')


// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.rotation.x = - Math.PI * 0.5
scene.add(water)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(1, 1, 1)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update the wave shader
    waterMaterial.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()