// JavaScript Document
/*jshint esversion: 6*/

import {
  Vector2,
  Vector3,
  Object3D,
  HemisphereLight,
  DirectionalLight,
  
  HemisphereLightHelper,
  DirectionalLightHelper,
  
  SpotLight,
  SpotLightHelper,
} from './_core/three.module.js';


export default class Lights {

  constructor(scene, seeHelpers) {
    this.scene = scene;
    this.seeHelpers = seeHelpers;
    this.initialize();
  }
  
  degrees_to_radians(degrees) {
    var pi = Math.PI;
    return degrees * (pi/180);
  }

  initialize() {
    let hemiLight = new HemisphereLight(0xffffff, 0xffffff, 0.1);
    hemiLight.position.set(0, 50, 0);
    // Add hemisphere light to scene
    this.scene.add(hemiLight);
    
    if (this.seeHelpers) {
      const hemiHelper = new HemisphereLightHelper( hemiLight, 5 );
      this.scene.add( hemiHelper );
    }
    
    // Lights on wall near door
//    this.addSpotLight(3.1, -5, -15, 10);
//    this.addSpotLight(scene, 3.2, -4.27, 20, 10);
//    this.addSpotLight(scene, 3.18, -3.4, 5, -50);
    this.addSpotLight(3.2, -2.28, -15, 10);
//    this.addSpotLight(scene, 3.2, -0.9, 2, 10);
//    this.addSpotLight(scene, 3.1, 0.25, -15, 0);
//    
//    // Lights on far wall
//    this.addSpotLight(scene, 3.2, 2.1, 2, 10);
//    this.addSpotLight(scene, 1.58, 2.1, -1, 10);
//    this.addSpotLight(scene, -0.2, 2.1, -5, 10);
    this.addSpotLight(-2.5, 2, -5, -20);
    
    
  }
  
  addSpotLight(x,z, tarX, tarZ) {
    /*
      x
      y
      tarX=to or from camera
      tarZ=left or right
    */
    let spotAngle = this.degrees_to_radians(130);
    //                                color, intensity,distance,angle
    const spotLight = new SpotLight( 0xE7EAFF, 0.4, 0, spotAngle);
    spotLight.position.set( x, 2.85, z );
    //                            left or right, up or down, back or front
    spotLight.target.position.set(tarX,-10,tarZ);

    spotLight.castShadow = true;
    spotLight.target.updateMatrixWorld();


    this.scene.add( spotLight );
    this.scene.add( spotLight.target );
    
    if (this.seeHelpers) {
      const spotLightHelper = new SpotLightHelper( spotLight );
      this.scene.add( spotLightHelper );
    }
  }
  
}
