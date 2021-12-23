import * as THREE from "https://cdn.skypack.dev/three";
import { PointerLockControls } from "/modules/PointerLockControls.js";
import { FontLoader } from '/modules/FontLoader.js';
import { CSS3DRenderer, CSS3DObject } from "/modules/CSS3DRenderer.js";

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
const GRAVITY = 1

const vertex = new THREE.Vector3();
const color = new THREE.Color();
const pointer = new THREE.Vector2();

let player;
let players = []
let otherPlayer

let crosshair;
let labelRenderer;
let iFrame;
let arrow
let labels = []
let meshes = []
let cameraLookDir

let gridHelper
let sendmouse
let frameIndex
var socket;

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

            case 'KeyE':
                var mouse = { x: 1, y: 1 };
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

                cameraLookDir = function (camera) {
                    var vector = new THREE.Vector3(0, 0, -1);
                    vector.applyEuler(camera.rotation, camera.rotation.order);
                    return vector;
                }
                console.log('Camera Vec', cameraLookDir(camera))


                arrow = new THREE.ArrowHelper(cameraLookDir(camera), camera.position, 10, Math.random() * 0xffffff);
                scene.add(arrow);


                //Raycast
                raycaster = new THREE.Raycaster();
                raycaster.setFromCamera(pointer, camera);
                const intersects = raycaster.intersectObjects(scene.children, false);

                if (intersects.length > 0) {
                    //console.log(intersects)
                    let not_found = true;
                    intersects.forEach(element => {
                        if (element.object.type == "Mesh" && not_found) {
                            not_found = false;
                            console.log("Raycast found Label, ", element)
                            console.log("Raycase found label.userdata.url", element.object.userData.url)
                            iFrame = createFrame("Sunshine_Policy",
                                camera.position.x + cameraLookDir(camera).x,
                                camera.position.y + cameraLookDir(camera).y,
                                camera.position.z + cameraLookDir(camera).z)

                        }
                        // console.log(element.object.type)

                    });
                } else {

                    INTERSECTED = null;
                }

                break;

            case 'KeyF':
                scene.remove(arrow)
                meshes.forEach((element) => {
                    scene.remove(element)
                })
                labels.forEach((element) => {
                    scene.remove(element)
                })
                scene.remove(iFrame)

                let DOMFrames = document.getElementsByClassName('label')
                for (let item of DOMFrames) {
                    item.remove()
                }
                console.log("Removed DOM Frames, ", DOMFrames)
                break;
            case 'KeyG':
                console.log("Pressed G Key")
                mouseDragged()
                break;

        }

    };


    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, - 1, 0), 0, 10);


    //CONFIG
    const CONFIG_FP = 'static/config.json'
    const FONT_TYPEFACE = '/modules/helvetiker_regular.typeface.json'
    const EDGE_OPACITY = .1//.05
    const SCALE = 10


    //Main script
    let populate = function (CONFIG_FP) {
        fetch(CONFIG_FP)
            .then(response => response.json())
            .then(config => {

                //Log Config
                console.log('Configuration: ', config)
                //Plot Config
                plot(config)
            });

        let plot = (config) => {

            //For Each Graph
            config['graphs'].forEach((graph_config) => {
                console.log('graph', graph_config)
                //Load Graph
                fetch(graph_config.filepath)
                    .then(response => response.json())
                    .then(DATA => {
                        //Logging
                        console.log(`Raw Data for ${graph_config.name}:`, DATA)

                        //Plot Nodes and Edges
                        dotPlot(DATA, graph_config)
                        edgePlot(DATA)

                        //Plot Text
                        const loader = new FontLoader();

                        loader.load(FONT_TYPEFACE, function (font) {
                            try {
                                for (let i = 0; i <= DATA.nodes.length; i += 1) {
                                    let label = DATA.nodes[i]['label']
                                    
                                    let size = .4//DATA.nodes[i]['attributes']['importance']//.2
                                    let x = graph_config['origin'][0] + DATA.nodes[i]['x'] / SCALE
                                    let y = graph_config['origin'][1] + DATA.nodes[i]['y'] / SCALE
                                    let z = 1//let z = graph_config['origin'][2] + DATA.nodes[i]['z'] / SCALE
                                    // let z = DATA.nodes[i]['z'] / SCALE
                                    let userData = { url: "Sunshine_Policy" }

                                    labelPlot(font, label, size, x, y, z, { url: "Sunshine_Policy" })
                                }
                            } catch {
                                console.log('Error, unable to load label (probably an out of bounds error)')

                            }


                            gridHelper = new THREE.GridHelper(250);
                            gridHelper.position.x = graph_config['origin'][0]
                            gridHelper.position.y = graph_config['origin'][1] - 200
                            gridHelper.position.z = graph_config['origin'][2]
                            console.log(gridHelper)
                            scene.add(gridHelper);


                        })
                    });

            });

        }

    }
    populate(CONFIG_FP)

    //Custom Shader
    let uniforms = {
        pointTexture: { value: new THREE.TextureLoader().load("/static/spark1.png") }
    };
    //Custom Shader
    const shaderMaterial = new THREE.ShaderMaterial({

        uniforms: uniforms,
        vertexShader: document.getElementById('vertexshader').textContent,
        fragmentShader: document.getElementById('fragmentshader').textContent,

        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        vertexColors: true

    });

    //Plot Dots
    var db = {}
    let dotPlot = function (DATA, graph_config) {
        const vertices = [];
        const colors = [];
        const sizes = [];
        const geometry = new THREE.BufferGeometry();
        for (let i = 0; i <= DATA.nodes.length; i += 1) {
            try {
                //Push Node XY Data
                let _x = graph_config['origin'][0] + DATA.nodes[i]['x'] / SCALE
                let _y = graph_config['origin'][1] + DATA.nodes[i]['y'] / SCALE
                let _z = 0//let _z = graph_config['origin'][2] + DATA.nodes[i]['z'] / SCALE
                vertices.push(_x)
                vertices.push(_y)
                vertices.push(_z)
                //vertices.push(DATA.nodes[i]['z'] / SCALE)//vertices.push(0 / SCALE)

                sizes.push(DATA.nodes[i]['size'] ** 2);

                // const color = new THREE.Color("rgb(255, 0, 0)");
                const color = new THREE.Color(DATA.nodes[i]['color']);


                colors.push(color.r, color.g, color.b);


                //Create Hash for Edges
                db[DATA.nodes[i]['label']] = { x: _x, y: _y, z: _z }

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


    //Plot Edges
    let edgePlot = function (DATA, graph_config) {

        const points = [];
        for (let i = 0; i <= DATA.edges.length; i += 1) {
            // console.log(db[DATA.edges[i]['source']])
            try {
                points.push(
                    new THREE.Vector3(
                        db[DATA.edges[i]['source']]['x'],
                        db[DATA.edges[i]['source']]['y'],
                        0));
                //db[DATA.edges[i]['source']]['z']).multiplyScalar(1 / SCALE));
                points.push(
                    new THREE.Vector3(
                        db[DATA.edges[i]['target']]['x'],
                        db[DATA.edges[i]['target']]['y'],
                        0));
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


    let labelPlot = function (font, label, size, x, y, z, userData) {
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
        text.userData = userData
        scene.add(text);

    }

    let createCrosshair = function (_x, _y, _z) {
        let mat = new THREE.MeshBasicMaterial({
            wireframe: true,
            transparent: false,
            depthTest: false,
            side: THREE.DoubleSide
        });
        let geo = new THREE.BoxGeometry(.01, .01, .01)
        let mesh = new THREE.Mesh(geo, mat)
        mesh.position.x = _x
        mesh.position.y = _y
        mesh.position.z = _z
        return mesh
    }

    crosshair = createCrosshair(camera.position.x, camera.position.y, camera.position.z)
    scene.add(crosshair)

    // let createPlayer = function (_x, _y, _z, size_scale) {
    //     let mat = new THREE.MeshPhongMaterial({
    //         wireframe: false,
    //         transparent: false,
    //         depthTest: false,
    //         side: THREE.DoubleSide
    //     });
    //     let geo = new THREE.BoxGeometry(size_scale, size_scale, size_scale)
    //     let mesh = new THREE.Mesh(geo, mat)
    //     mesh.position.x = _x
    //     mesh.position.y = _y
    //     mesh.position.z = _z
    //     return mesh
    // }
    // player = createPlayer(0, 0, 0)
    // camera.add(player)
    // scene.add(player)



    let createFrame = function (url, _x, _y, _z) {
        let mat = new THREE.MeshBasicMaterial({
        });
        let geo = new THREE.BoxGeometry(.5, .5, .5)
        let mesh = new THREE.Mesh(geo, mat)
        mesh.position.x = _x
        mesh.position.y = _y
        mesh.position.z = _z

        var url = `https://en.wikipedia.org/wiki/${url}`
        var html = [

            '<div style="width:' + 0 + 'px; height:' + 0 + 'px;">',
            '<iframe src="' + url + '" width="' + 800 + '" height="' + 800 + '">',
            '</iframe>',
            '</div>'

        ].join('\n');

        scene.add(mesh)

        let frameScale = new THREE.Vector3(.01, .01, .01)

        const frameDiv = document.createElement('div');
        frameDiv.className = 'label';
        frameDiv.innerHTML = html;
        frameDiv.style.marginTop = '-1em';
        const frameLabel = new CSS3DObject(frameDiv);
        frameLabel.scale.set(frameScale.x, frameScale.y, frameScale.z)
        console.log('frameLabel', frameLabel)
        // frameLabel.position.set(_x, _y, _z);
        frameLabel.position.x = -1
        frameLabel.position.y = 17
        frameLabel.position.z = -4
        mesh.add(frameLabel);

        meshes.push(mesh)
        labels.push(frameLabel)
        return mesh

    }


    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);


    labelRenderer = new CSS3DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    document.body.appendChild(labelRenderer.domElement);




    // // Start a socket connection to the server
    // // Some day we would run this server somewhere else
    // socket = io.connect('http://localhost:3000');

    // // We make a named event called 'mouse' and write an
    // // anonymous callback function
    // socket.on('mouse',
    //     // When we receive data
    //     function (data) {
    //         console.log("mouse: " + data.x + " " + data.y + " " + data.z);
            
    //         if (players.length == 0){
    //             otherPlayer = createPlayer(data.x, data.y, data.z)
    //             scene.add(otherPlayer)
    //         }
            
    //         otherPlayer.position.x = data.x
    //         otherPlayer.position.y = data.y
    //         otherPlayer.position.z = data.z
     
    //     });
    // socket.on('msg',
    //     // When we receive data
    //     function (data) {
    //         console.log('msg:', data)


    //     }
    // );

    // function mouseDragged() {
    //     //Crosshair
    //     cameraLookDir = function (camera) {
    //         var vector = new THREE.Vector3(0, 0, -1);
    //         vector.applyEuler(camera.rotation, camera.rotation.order);
    //         return vector;
    //     }
    //     let __x = camera.position.x + 2 * cameraLookDir(camera).x
    //     let __y = camera.position.y + 2 * cameraLookDir(camera).y
    //     let __z =  camera.position.z + 2 * cameraLookDir(camera).z

    //     sendmouse(__x, __y, __z);
    // }

    // // Function for sending to the socket
    // sendmouse = function(xpos, ypos, zpos) {
    //     // We are sending!
    //     console.log("sendmouse: " + xpos + " " + ypos + " " + zpos);

    //     // Make a little object with  and y
    //     var data = {
    //         x: xpos,
    //         y: ypos,
    //         z: zpos
    //     };

    //     // Send that object to the socket
    //     socket.emit('mouse', data);
    // }




    //Zoom
    window.addEventListener('wheel', (event) => {
        event.preventDefault(); /// prevent scrolling

        let zoom = camera.zoom; // take current zoom value
        zoom += event.deltaY * -0.01; /// adjust it
        zoom = Math.min(Math.max(.125, zoom), 4); /// clamp the value

        camera.zoom = zoom /// assign new zoom value
        camera.updateProjectionMatrix(); /// make the changes take effect
    }, { passive: false });

    window.addEventListener('click', function (event) {
        console.log("In Double Click")
        var mouse = { x: 1, y: 1 };
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        // Controls
        controls.lock();
    })


    window.addEventListener('resize', onWindowResize);
    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

    }


}


frameIndex = 0;
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

        controls.moveRight(- velocity.x * delta);
        controls.moveForward(- velocity.z * delta);
        controls.moveUp(velocity.y * delta);

        gridHelper.rotation.y += .0005

    }

    // if (frameIndex % 5 ==0){
    //     sendmouse(player.position.x , player.position.y , player.position.z );
    // }



    prevTime = time;

    //Crosshair
    cameraLookDir = function (camera) {
        var vector = new THREE.Vector3(0, 0, -1);
        vector.applyEuler(camera.rotation, camera.rotation.order);
        return vector;
    }
    crosshair.position.x = camera.position.x + 2 * cameraLookDir(camera).x
    crosshair.position.y = camera.position.y + 2 * cameraLookDir(camera).y
    crosshair.position.z = camera.position.z + 2 * cameraLookDir(camera).z

    // player.position.x = camera.position.x -  cameraLookDir(camera).x
    // player.position.y = camera.position.y -  cameraLookDir(camera).y
    // player.position.z = camera.position.z -  cameraLookDir(camera).z

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);

    frameIndex ++;

}

