import * as THREE from "https://cdn.skypack.dev/three";
// import * as THREE from '/modules/three';
// import * as THREE from "/build/three.module.js"
import { OrbitControls } from "https://cdn.skypack.dev/three/examples/jsm/controls/OrbitControls";
import { PointerLockControls } from "/modules/PointerLockControls.js";
import { FontLoader } from '/modules/FontLoader.js';


let camera, scene, renderer, controls;
const objects = [];
let raycaster;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;
let canJump = false;
let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const color = new THREE.Color();
let GRAVITY = 1

init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.y = 10;


    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0000f);
    scene.fog = new THREE.Fog(0xffffff, 100, 750);

    const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
    light.position.set(0.5, 1, 0.75);
    scene.add(light);

    controls = new PointerLockControls(camera, document.body);


    const blocker = document.getElementById('blocker');
    const instructions = document.getElementById('instructions');

    const gridHelper = new THREE.GridHelper(50);
    scene.add(gridHelper);


    instructions.addEventListener('click', function () {
        // Controls
        controls.lock();

    });

    controls.addEventListener('lock', function () {
        instructions.style.display = 'none';
        blocker.style.display = 'none';

    });

    controls.addEventListener('unlock', function () {
        blocker.style.display = 'block';
        instructions.style.display = '';

    });

    scene.add(controls.getObject());

    const onKeyDown = function (event) {

        switch (event.code) {

            case 'ArrowUp':
            case 'KeyW':
                moveForward = true;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = true;
                break;

            case 'ArrowDown':
            case 'KeyS':
                moveBackward = true;
                break;

            case 'ArrowRight':
            case 'KeyD':
                moveRight = true;
                break;

            case 'Space':
                // if (canJump === true) velocity.y += 10;
                // canJump = true;
                moveUp = true
                break;
            case 'ShiftLeft':
                // if (canJump === true) velocity.y -= 10;
                // canJump = true;
                moveDown = true
                break;


        }

    };

    const onKeyUp = function (event) {

        switch (event.code) {

            case 'ArrowUp':
            case 'KeyW':
                moveForward = false;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = false;
                break;

            case 'ArrowDown':
            case 'KeyS':
                moveBackward = false;
                break;

            case 'ArrowRight':
            case 'KeyD':
                moveRight = false;
                break;
            case 'Space':
                // if (canJump === true) velocity.y += 50;
                // velocity.y -= 10;
                // canJump = false;
                moveUp = false
                break;
            case 'ShiftLeft':
                // velocity.y -= 10;
                // canJump = false;
                moveDown = false
                break;

        }

    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, - 1, 0), 0, 10);

    let placeText = function (font, label, size, x, y, z) {
        //Define
        const color = 0x0f66ff;
        const matLite = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide
        });

        //Generate
        const message = label;
        const shapes = font.generateShapes(message, size);
        const geometry = new THREE.ShapeGeometry(shapes);

        //Center
        geometry.computeBoundingBox();
        const xMid = - 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
        geometry.translate(xMid, 0, 0);
        //Reloc
        geometry.translate(x, y, z + 1);
        //Add
        const text = new THREE.Mesh(geometry, matLite);
        scene.add(text);

    }


    let CONFIG = 'static/config.json'
    fetch(CONFIG)
    .then(response => response.json())
    .then(DATA => {
        console.log('Configuration: ', DATA)
    });
    //CONFIG
    const g_dwarf = "static/dwarf.json"
    const t_financial = "static/financial_data.json"
    const g_dwarfAttribute = "static/dwarfAttribute.json"
    const g_sunshine = "static/sunshine.json"
    const g_sunshineAttribute = "static/sunshineAttribute.json"
    const FONT_TYPEFACE = '/modules/helvetiker_regular.typeface.json'
    const EDGE_OPACITY = .1//.05
    const SCALE = 10

    // Grabs internal static files 
    fetch(g_sunshineAttribute)
        .then(response => response.json())
        .then(DATA => {

            //Logging
            console.log('Raw Data:', DATA)

            //Plot Nodes and Edges
            dotPlot(DATA)
            edgePlot(DATA)

            //Plot  Text
            const loader = new FontLoader();
            loader.load(FONT_TYPEFACE, function (font) {
                for (let i = 0; i <= DATA.nodes.length; i += 1) {
                    let label = DATA.nodes[i]['label']
                    let size = DATA.nodes[i]['attributes']['importance']//.2
                    let x = DATA.nodes[i]['x'] / SCALE
                    let y = DATA.nodes[i]['y'] / SCALE
                    let z = 0
                    // let z = DATA.nodes[i]['z'] / SCALE


                    placeText(font, label, size, x, y, z)
                }
            })

        });


    // // Grabs internal static files 
    // fetch(g_dwarfAttribute)
    //     .then(response => response.json())
    //     .then(DATA => {
    //         console.log(DATA)
    //         dotPlot(DATA)
    //         edgePlot(DATA)

    //         //Label Text
    //         const loader = new FontLoader();
    //         loader.load(FONT_TYPEFACE, function (font) {
    //             for (let i = 0; i <= DATA.nodes.length; i += 1) {
                
    //                 let label = DATA.nodes[i]['label']
    //                 let size = DATA.nodes[i]['attributes']['importance']//.2
    //                 let x = DATA.nodes[i]['x'] / SCALE
    //                 let y = DATA.nodes[i]['y'] / SCALE
    //                 let z = 0
    //                 // let z = DATA.nodes[i]['z'] / SCALE
    //                 // console.log(label,x)
    //                 placeText(font, label, size, x, y, z)
    //             }
    //         })

    //     });


    let uniforms = {
        pointTexture: { value: new THREE.TextureLoader().load("/static/spark1.png") }
    };

    const shaderMaterial = new THREE.ShaderMaterial({

        uniforms: uniforms,
        vertexShader: document.getElementById('vertexshader').textContent,
        fragmentShader: document.getElementById('fragmentshader').textContent,

        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        vertexColors: true

    });


    var db = {}
    let dotPlot = function (DATA) {
        const vertices = [];
        const colors = [];
        const sizes = [];
        const geometry = new THREE.BufferGeometry();
        for (let i = 0; i <= DATA.nodes.length; i += 1) {
            try {
                //Push Node XY Data
                vertices.push(DATA.nodes[i]['x'] / SCALE)
                vertices.push(DATA.nodes[i]['y'] / SCALE)
                vertices.push(0 / SCALE)
                //vertices.push(DATA.nodes[i]['z'] / SCALE)//vertices.push(0 / SCALE)
               
                sizes.push(DATA.nodes[i]['size'] ** 2);
                
                // const color = new THREE.Color("rgb(255, 0, 0)");
                const color = new THREE.Color(DATA.nodes[i]['color']);


                colors.push(color.r, color.g, color.b);

            
                //Create Hash for Edges
                db[DATA.nodes[i]['label']] = { x: DATA.nodes[i]['x'], y: DATA.nodes[i]['y'], z: DATA.nodes[i]['z'] }

            } catch (error) {
                console.log("undefined!!")
            }
        }
        // console.log(db)
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1).setUsage(THREE.DynamicDrawUsage));
    


        // // let material = new THREE.PointsMaterial({ size: NODE_SIZE, sizeAttenuation: true, alphaTest: 0.5, transparent: true, vertexColors: true });
        // let material = new THREE.PointsMaterial({ size: NODE_SIZE, sizeAttenuation: true, alphaTest: 0.5, transparent: true });
        // material.color.setHSL(.6, 0.8, 0.9);
        const particles = new THREE.Points(geometry, shaderMaterial);
        scene.add(particles);
    }


    let edgePlot = function (DATA) {

        const points = [];
        for (let i = 0; i <= DATA.edges.length; i += 1) {
            // console.log(db[DATA.edges[i]['source']])
            try {
                points.push(
                    new THREE.Vector3(
                        db[DATA.edges[i]['source']]['x'],
                        db[DATA.edges[i]['source']]['y'],
                        0).multiplyScalar(1 / SCALE));
                //db[DATA.edges[i]['source']]['z']).multiplyScalar(1 / SCALE));
                points.push(
                    new THREE.Vector3(
                        db[DATA.edges[i]['target']]['x'],
                        db[DATA.edges[i]['target']]['y'],
                        0).multiplyScalar(1 / SCALE));
                //db[DATA.edges[i]['source']]['z']).multiplyScalar(1 / SCALE));

            } catch (error) {
                console.log("undefined!!")
            }
        }
        // console.log(points)


        const material = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 1,
            linecap: 'round', //ignored by WebGLRenderer
            linejoin: 'round', //ignored by WebGLRenderer
            transparent: true,
            opacity: EDGE_OPACITY
        })
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.LineSegments(geometry, material);
        scene.add(line);
    }


    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize);

    window.addEventListener('wheel', (event) => {
        event.preventDefault(); /// prevent scrolling

        let zoom = camera.zoom; // take current zoom value
        zoom += event.deltaY * -0.01; /// adjust it
        zoom = Math.min(Math.max(.125, zoom), 4); /// clamp the value

        camera.zoom = zoom /// assign new zoom value
        camera.updateProjectionMatrix(); /// make the changes take effect
    }, { passive: false });

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}



function animate() {

    requestAnimationFrame(animate);

    const time = performance.now();

    if (controls.isLocked === true) {

        raycaster.ray.origin.copy(controls.getObject().position);
        raycaster.ray.origin.y -= 10;

        const intersections = raycaster.intersectObjects(objects, false);

        const onObject = intersections.length > 0;

        const delta = (time - prevTime) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        velocity.y -= GRAVITY * velocity.y * 10.0 * delta; // 100.0 = mass

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.y = Number(moveUp) - Number(moveDown);
        direction.normalize(); // this ensures consistent movements in all directions

        if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;
        if (moveUp || moveDown) velocity.y -= direction.y * 400.0 * delta;

        // if (onObject === true) {

        //     velocity.y = Math.max(0, velocity.y);
        //     canJump = true;

        // }

        controls.moveRight(- velocity.x * delta);
        controls.moveForward(- velocity.z * delta);
        controls.moveUp(velocity.y * delta);

        // controls.getObject().position.y += (velocity.y * delta); // new behavior

        // if (controls.getObject().position.y < 10) {

        //     velocity.y = 0;
        //     controls.getObject().position.y = 10;

        //     canJump = true;

        // }

    }

    prevTime = time;

    renderer.render(scene, camera);

}

