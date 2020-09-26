import * as THREE from "three";
import * as CANNON from "cannon";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect.js';

const COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
const GEOMETRIES = [
    function() {return {geo: new THREE.BoxGeometry(1,1,1), shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5))}},
    function() {return {geo: new THREE.SphereGeometry(0.5, 16, 16), shape: new CANNON.Sphere(0.5)}}
];

function randInt(upTo) {
    return Math.floor(Math.random() * upTo);
}
function init(){
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    var playerCtl = {fwd: false, back: false, left: false, right: false};

    // Scene Lighting
    scene.fog = new THREE.Fog( 0x000000, 0, 500 );
    var ambient = new THREE.AmbientLight( 0xeeeeee );
    scene.add( ambient );
    var light = new THREE.PointLight( 0xffffff, 1, 100 );
    light.position.set( 10, 30, 20 );
    light.castShadow = true;
    scene.add( light );

    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    var effect = new OutlineEffect( renderer, { defaultThickness: 0.001 } );

    var world = new CANNON.World();
    world.gravity.set(0,-9.82,0);

    var playerGeo = new THREE.BoxGeometry(3,3,3)
    var playerMat = new THREE.MeshPhongMaterial({color: 'gray'});
    var playerMesh = new THREE.Mesh(playerGeo, playerMat);
    playerGeo.castShadow=true;
    scene.add(playerMesh);
    var playerBod = new CANNON.Body({
        mass:20,
        position: new CANNON.Vec3(0,5,0),
        shape: new CANNON.Box(new CANNON.Vec3(1.5, 1.5, 1.5))
    });
    world.addBody(playerBod);
    playerBod.mesh = playerMesh;
    

    // Create Cube
    function spawnCube(x,y,z){
        var g = GEOMETRIES[randInt(GEOMETRIES.length)]();
        var geometry = g.geo;
        var material = new THREE.MeshPhongMaterial( { color: COLORS[Math.floor((Math.random() * COLORS.length))] } ); 
        var cube = new THREE.Mesh( geometry, material );
        cube.castShadow = true;
        scene.add( cube )
        var body = new CANNON.Body({
            mass: 1,
            position: new CANNON.Vec3(x,y,z),
            shape: g.shape
        })
        world.addBody(body);
        body.mesh = cube;
    }
    setInterval(function(){ spawnCube(Math.random(),15,Math.random()) },500);

    // Create a plane
    var groundBody = new CANNON.Body({
        mass: 0, // mass == 0 makes the body static
        position: new CANNON.Vec3(0,2,0)
    });
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2); // rotate up 
    var groundShape = new CANNON.Plane();
    groundBody.addShape(groundShape);
    world.addBody(groundBody);
    var geometry = new THREE.PlaneGeometry( 1000, 1000, 50, 50 );
    var groundMaterial = new THREE.MeshPhongMaterial( { color: 0xe0e0f0, reflectivity: 1.0 } );
    var groundMesh = new THREE.Mesh( geometry, groundMaterial );
    groundMesh.receiveShadow = true;
    groundMesh.position.copy(groundBody.position)
    groundMesh.quaternion.copy(groundBody.quaternion)
    scene.add( groundMesh );

    var timestep = 1.0 / 60.0; 

    camera.position.set(5,10,-10);
    camera.lookAt(new THREE.Vector3(0,0,0));

    var controls = new OrbitControls( camera, renderer.domElement );
	controls.minDistance = 10;
	controls.maxDistance = 100;

    function updatePhysics(){
        world.step(timestep);
        world.bodies.forEach( b => {
            if(b.mesh != undefined){
                b.mesh.position.copy(b.position)
                b.mesh.quaternion.copy(b.quaternion)
            }
        })                    
    }

    function updatePlayer() {
        if (playerCtl.fwd) {
            playerBod.position.z += 0.1;
            
        }
        if (playerCtl.back) {
            playerBod.position.z -= 0.1;
            
        }
        if (playerCtl.left) {
            playerBod.position.x += 0.1;
            
        }
        if (playerCtl.right) {
            playerBod.position.x -= 0.1;
            
        }
        if (playerCtl.up) {
            playerBod.position.y += 0.1;
        }
    }

    
    window.addEventListener("keydown", function(e) {
        
        switch(e.key) {
            case 'i':
                playerCtl.fwd = true;
            break;
            case 'k':
                playerCtl.back = true;
            break;
            case 'j':
                playerCtl.left = true;
            break;
            case 'l':
                playerCtl.right = true;
                break;
            case ' ':
                playerCtl.up = true;
            break;
        }
    });
    window.addEventListener("keyup", function(e) {
        
        switch(e.key) {
            case 'i':
                playerCtl.fwd = false;
            break;
            case 'k':
                playerCtl.back = false;
            break;
            case 'j':
                playerCtl.left = false;
            break;
            case 'l':
                playerCtl.right = false;
            break;
            case ' ':
                playerCtl.up = false;
                break;
        }
    });


    function animate() {
        requestAnimationFrame( animate );            
        updatePhysics();
        updatePlayer();
    	effect.render( scene, camera );
    }
    animate();

}

init();