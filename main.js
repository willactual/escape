// JavaScript Document
/*jshint esversion: 6*/

// Import Three JS
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Clock,
  Raycaster,
  Color,
  Vector3,
  Sphere,
} from './_core/three.module.js';

import { GLTFLoader } from './_core/GLTFLoader.js';
import { OrbitControls } from './_core/OrbitControls.js';
import { PointerLockControls } from './_core/PointerLockControls.js';

import Room from './room.js';
import Lights from './lights.js';

/*----------------------------------- MAIN FUNCTION -----------------------------------*/

(function() {
// Set our main variables
let scene,
  renderer,
  camera,
  mixer,
  mainRoom,
  roomLights,
  controls,
  clock = new Clock(),
  loaderAnim = document.getElementById('js-loader'),
  prevTime = performance.now(),
  moveForward = false,
  moveBackward = false,
  moveLeft = false,
  moveRight = false,
  canJump = false;
  
  const velocity = new Vector3();
  const direction = new Vector3();
  
  const inDevMode = false;
//  const inDevMode = true;
//  const seeHelpers = true;
  const seeHelpers = false;
  
  /*-------------------- Init Function --------------------*/
  function init() {

    const canvas = document.querySelector('#canvas');
    const backgroundColor = 0x000012;

    // Init the scene
    scene = new Scene();
    scene.background = new Color(backgroundColor);

    // Init the renderer
    renderer = new WebGLRenderer({ canvas, antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // Add a camera
    camera = new PerspectiveCamera(
      65, // FOV
      window.innerWidth / window.innerHeight, // Size Ratio
      0.1,  // Near clipping
      1000  // Far clipping
    );
    camera.position.z = -4.6; // 30 units back
    camera.position.x = 3.8;
    camera.position.y = 1.5; // 3 units down
    
    const setCameraVector = new Vector3( 0, 0, 1 );
    camera.lookAt( setCameraVector );
    
    /*-------------------- Developing or playing --------------------*/
    if (inDevMode) {
    
      document.getElementById( 'blocker' ).style.display = 'none';
      
      controls = new OrbitControls( camera, renderer.domElement );
      controls.update();
    
    } else {
    /* First Person init */
      controls = new PointerLockControls( camera, renderer.domElement );

      // Initial instruction overlay
      const blocker = document.getElementById( 'blocker' );
      const instructions = document.getElementById( 'instructions' );

      instructions.addEventListener( 'click', function () {

        controls.lock();

      } );

      // Initial instruction overlay event listeners
      controls.addEventListener( 'lock', function () {

        instructions.style.display = 'none';
        blocker.style.display = 'none';

      } );

      controls.addEventListener( 'unlock', function () {

        blocker.style.display = 'block';
        instructions.style.display = '';

      } );

      scene.add( controls.getObject() );

      // Keyboard event functions
      const onKeyDown = function ( event ) {

        switch ( event.key ) {
          case 'ArrowUp':
          case 'w':
            moveForward = true;
            break;

          case 'ArrowLeft':
          case 'a':
            moveLeft = true;
            break;

          case 'ArrowDown':
          case 's':
            moveBackward = true;
            break;

          case 'ArrowRight':
          case 'd':
            moveRight = true;
            break;

          case ' ':
            if ( canJump === true ) velocity.y += 100;
            canJump = false;
            break;
        }
      };

      const onKeyUp = function ( event ) {

        switch ( event.key ) {
          case 'ArrowUp':
          case 'w':
            moveForward = false;
            break;

          case 'ArrowLeft':
          case 'a':
            moveLeft = false;
            break;

          case 'ArrowDown':
          case 's':
            moveBackward = false;
            break;

          case 'ArrowRight':
          case 'd':
            moveRight = false;
            break;
        }
      };

      document.addEventListener( 'keydown', onKeyDown, false );
      document.addEventListener( 'keyup', onKeyUp, false );
    }
    // Add room to scene
    mainRoom = new Room(scene, camera, seeHelpers);
    // Add lights to scene
    roomLights = new Lights(scene, seeHelpers);

    loaderAnim.remove();
  }

  /*-------------------- Update Function --------------------*/

  function update() {
    // Animate update
    requestAnimationFrame(update);
    
    if (mixer) {
      mixer.update(clock.getDelta());
    }
    
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    const time = performance.now();
    
    if (!inDevMode) {
      // Allows first-person view control
      
      if ( controls.isLocked === true ) {
        //Old position of camera
        const oldPosition = new Vector3();
        oldPosition.copy(controls.getObject().position);

        // Movement calculations
        const delta = ( time - prevTime ) / 1000;

        velocity.x -= velocity.x * 100.0 * delta;
        velocity.z -= velocity.z * 100.0 * delta;

        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        direction.z = Number( moveForward ) - Number( moveBackward );
        direction.x = Number( moveRight ) - Number( moveLeft );
        direction.normalize(); // this ensures consistent movements in all directions

        if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
        if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;

        controls.moveRight( - velocity.x * delta );
        controls.moveForward( - velocity.z * delta );
        controls.getObject().position.y += ( velocity.y * delta ); // new behavior

        if ( controls.getObject().position.y <= 2 ) {
          // Jumped
          velocity.y = 0;
          controls.getObject().position.y = 1.5;

          canJump = true;

        }

        // Camera sphere for collision detection
        const sphere = new Sphere(controls.getObject().position, 0.7);
//        const sphere = new Sphere(controls.getObject().position, 0.1);

        mainRoom.objects.forEach(obj => {
          // Iterate 3d objects in room
          if (sphere.intersectsBox(obj.collider) && obj.name !== "floor") {
            // If collision detected, camera position reverted to previous
            controls.getObject().position.copy(oldPosition);

            // Stop movement, stops jitter
            velocity.x = 0;
            velocity.z = 0;
          }
        });
      }

    }
    
    prevTime = time;

    renderer.render(scene, camera);
  }

  /*-------------------- Resize Function --------------------*/
  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let canvasPixelWidth = canvas.width / window.devicePixelRatio;
    let canvasPixelHeight = canvas.height / window.devicePixelRatio;

    const needResize =
      canvasPixelWidth !== width || canvasPixelHeight !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  /*-------------------- Initialize Functions --------------------*/
  init();

  update();

})();
