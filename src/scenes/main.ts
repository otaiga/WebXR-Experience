import {
  AssetsManager,
  Engine,
  Scene,
  AbstractMesh,
  WebXRDefaultExperience,
  Vector3,
  PhysicsImpostor,
  MeshBuilder,
} from "@babylonjs/core";
import { CreateSceneClass } from "../createScene";
import { loadAllAssets } from "../support/assetManager";
import { setupCamera } from "../support/camera";
import { runDebugger } from "../support/debugger";
import { setupEnvironment } from "../support/environment";
import { createSnowBall } from "../support/utils";
import { enableXR } from "../support/xr";

export class MainScreen implements CreateSceneClass {
  createScene = async (
    engine: Engine,
    _canvas: HTMLCanvasElement
  ): Promise<Scene> => {
    // Create scene
    const scene = new Scene(engine);

    // Create AssetManager
    const assetManager = new AssetsManager(scene);

    engine.displayLoadingUI();
    // Load up all assets
    const assets = await loadAllAssets(assetManager, engine.loadingScreen);

    const snowScene = assets.models["snowScene.glb"];
    if (snowScene) {
      for (const mesh of snowScene.loadedMeshes) {
        mesh.checkCollisions = true;
      }
    }

    // Setup Camera
    const camera = setupCamera(scene);
    camera.rotation.y = -Math.PI;

    // Setup a pipeline
    const pipeline = setupEnvironment(scene, camera);

    // Get snow material
    const snowMat = scene.materials.find((mat) => mat.name === "Snow");

    // Setup Floor
    const groundFloors: AbstractMesh[] = [];

    const ground = MeshBuilder.CreateGround("ground", {
      width: 50,
      height: 50,
      subdivisions: 20,
    });
    ground.receiveShadows = true;
    ground.position = new Vector3(0, 0, 0);
    ground.checkCollisions = true;
    ground.physicsImpostor = new PhysicsImpostor(
      ground,
      PhysicsImpostor.BoxImpostor,
      {
        mass: 0,
        friction: 0.8,
        restitution: 0.5,
        disableBidirectionalTransformation: true,
      },
      scene
    );
    groundFloors.push(ground);
    if (snowMat) {
      ground.material = snowMat;
    }

    const deadZone = MeshBuilder.CreateGround("deadzone", {
      width: 200,
      height: 200,
      subdivisions: 20,
    });

    deadZone.checkCollisions = true;
    deadZone.position = new Vector3(0, -1, 0);
    deadZone.isVisible = false;

    createSnowBall(scene);

    await new Promise<null | WebXRDefaultExperience>(async (resolve) => {
      try {
        const xr = await enableXR(scene, groundFloors, pipeline);
        resolve(xr);
      } catch (err) {
        console.log("not able to offer VR");
        resolve(null);
      }
    });

    window.addEventListener("keydown", async (ev) => {
      // debugger Ctrl+Alt+I
      if (ev.ctrlKey && ev.altKey && ev.code === "KeyI") {
        await runDebugger(scene);
      }
    });

    return scene;
  };
}

export default new MainScreen();
