// JavaScript Document
/*jshint esversion: 6*/

import {
  MeshPhongMaterial,
  TextureLoader,
  Box3,
  Box3Helper,
} from './_core/three.module.js';

import { GLTFLoader } from './_core/GLTFLoader.js';

export default class Room {

  constructor(scene, camera, seeHelpers) {
    this.seeHelpers = seeHelpers;
    this.initialize(scene, camera);
  }

  initialize(scene, camera) {
    let model = undefined;
    
    this.camera = camera;
    this.objects = []; // Array of room objects
    
    this.txtPathStart = 'file:///C:/Users/1383396987E/Documents/development/threejs/room/_v2/images/';
    
    // Copy of this to use in nested funtion below
    let that = this;

    let loaderPath = `${this.txtPathStart}room.gltf`;
    // Load room
    let loader = new GLTFLoader();
    loader.load(
      
      loaderPath,

      function(gltf) {
        model = gltf.scene;

        model.traverse(obj => {
          if (obj.isMesh) {
            // Meshed objects in room
            obj.castShadow = true;
            obj.receiveShadow = true;

            // Add box to object for collision detection
            obj.collider = new Box3();
            obj.collider.setFromObject(obj);
            // Helper to see collision detection box
            if (that.seeHelpers) {
              const helper = new Box3Helper( obj.collider, 0xffff00 );
              scene.add( helper );
            }

            /* Use different texture depending on object */
            that.setTextures(obj);

            // Add object to room array
            that.objects.push(obj);
          }
        });

        // Add model to scene
        scene.add(model);

      },
      undefined,
      function(error) {
        console.error(error);
      }
    );
  }
  
  setTextures(obj) {
    
    let txtPathMid = 'COL/';
    let obj_txt;
    
    switch(obj.name.slice(0,4)) {
//      case 'cabi':
//        obj_txt = new TextureLoader().load(`${this.txtPathStart}${txtPathMid}wood.png`);
//        break;
        
      case 'cabi':
      case 'desk':
      case 'isle':
        obj_txt = new TextureLoader().load(`${this.txtPathStart}${txtPathMid}wood.png`);
        break;
        
      case 'door':
        obj_txt = new TextureLoader().load(`${this.txtPathStart}${txtPathMid}door3.png`);
        break;
        
      case 'floo':
        obj_txt = new TextureLoader().load(`${this.txtPathStart}${txtPathMid}floor.png`);
        break;
        
//      case 'isle':
//        obj_txt = new TextureLoader().load(`${this.txtPathStart}${txtPathMid}wood.png`);
//        break;
        
      case 'spot':
        obj_txt = new TextureLoader().load(`${this.txtPathStart}${txtPathMid}spot.png`);
        break;
        
      case 'wall':
        if (obj.name === 'wall6') {
          obj_txt = new TextureLoader().load(`${this.txtPathStart}${txtPathMid}wall6.png`);
        } else {
          obj_txt = new TextureLoader().load(`${this.txtPathStart}${txtPathMid}wall.png`);
        }
        break;
        
      default:
        obj_txt = new TextureLoader().load(`${this.txtPathStart}${txtPathMid}room_w_details_COL3.png`);
        break;
    }
    
    obj_txt.flipY = false;

    let obj_mtl = new MeshPhongMaterial({
      map: obj_txt,
        color: 0xffffff,
      skinning: true
    });
    
    obj.material = obj_mtl;
  }
}
