import {
  Camera,
  CannonJSPlugin,
  CubeTexture,
  DefaultRenderingPipeline,
  HemisphericLight,
  Scene,
  Texture,
  Vector3,
} from "@babylonjs/core";
import * as CANNON from "cannon";

export const setupEnvironment = (scene: Scene, camera: Camera) => {
  // Set the physics engine
  window.CANNON = CANNON;

  const envText = CubeTexture.CreateFromPrefilteredData(
    "assets/textures/canary_wharf.env",
    scene
  );

  // // Fix orientation of the skybox texture
  envText.coordinatesMode = Texture.SKYBOX_MODE;

  // Creates default HDR environment
  scene.createDefaultEnvironment({
    skyboxTexture: envText,
    skyboxSize: 200,
    environmentTexture: "assets/textures/canary_wharf.env",
  });

  // add glow layer
  // const gl = new GlowLayer("glow", scene);
  // gl.intensity = 0.2;

  // setup pipeline
  const pipeline = new DefaultRenderingPipeline(
    "defaultPipeline", // The name of the pipeline
    false, // Do you want the pipeline to use HDR texture?
    scene, // The scene instance
    [camera] // The list of cameras to be attached to
  );
  pipeline.samples = 4;
  pipeline.fxaaEnabled = true;
  pipeline.sharpenEnabled = true;
  pipeline.sharpen.edgeAmount = 0.9;
  pipeline.bloomEnabled = true;
  pipeline.glowLayerEnabled = true;

  if (pipeline.glowLayer) {
    pipeline.glowLayer.intensity = 0.4;
  }

  // add a little light
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.8;

  // setup physics
  const gravityVector = new Vector3(0, -9.81, 0);
  scene.enablePhysics(gravityVector, new CannonJSPlugin());
  scene.collisionsEnabled = true;

  // Set gravity for objects with collisions
  scene.gravity = new Vector3(0, -0.1, 0);
  return pipeline;
};
