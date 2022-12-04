import { FreeCamera, MeshBuilder, Scene, Vector3 } from "@babylonjs/core";

export const setupCamera = (scene: Scene) => {
  // This creates the canvas
  const canvas = scene.getEngine().getRenderingCanvas();

  // Check if camera/player grounded
  let grounded = false;

  // This creates the camera
  const camera = new FreeCamera("camera", new Vector3(0, 1.5, 0), scene);

  // This attaches the camera to the canvas
  camera.attachControl(canvas, true);
  // Set camera for first person controller
  camera.applyGravity = true;
  // Allow checking for collisions
  camera.checkCollisions = true;
  // Ellipsoid to provide camera a "body"
  camera.ellipsoid = new Vector3(0.2, 0.8, 0.2);
  // Camera clipping
  camera.minZ = 0.01;
  // Camera "walking" speed
  camera.speed = 0.3;
  // Reduce sensitivity on movement
  camera.angularSensibility = 5000;

  // Movement WSAD
  camera.keysUp.push(87);
  camera.keysLeft.push(65);
  camera.keysDown.push(83);
  camera.keysRight.push(68);

  // body mesh to trigger collisions with other meshes
  const bodyMesh = MeshBuilder.CreateBox("cameraBody", {
    height: 2,
    width: 1,
  });
  // hide the body mesh
  bodyMesh.isVisible = false;
  // parent the body mesh to the camera
  bodyMesh.parent = camera;

  // Jump
  scene.onKeyboardObservable.add((kbinfo) => {
    if (kbinfo.type === 1 && kbinfo.event.code === "Space") {
      if (grounded) {
        camera.cameraDirection.y += 0.5;
        grounded = false;
      }
    }
  });

  // When camera hits something
  camera.onCollide = (collidedMesh) => {
    grounded = true;
    if (collidedMesh.name === "deadzone") {
      camera.position = new Vector3(0, 1.5, 0);
    }
  };

  return camera;
};
