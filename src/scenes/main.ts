import {
  AssetsManager,
  Engine,
  Scene,
  AbstractMesh,
  WebXRDefaultExperience,
  Vector3,
} from "@babylonjs/core";
import { CreateSceneClass } from "../createScene";
import { loadAllAssets } from "../support/assetManager";
import { setupCamera } from "../support/camera";
import { setupEnvironment } from "../support/environment";
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

    // Setup Camera
    const camera = setupCamera(scene);
    camera.rotation.y = -Math.PI;

    // Setup a pipeline
    const pipeline = setupEnvironment(scene, camera);

    // Setup Floor
    const groundFloors: AbstractMesh[] = [];
    const floorAsset = assets.models["floor.glb"];
    for (const mesh of floorAsset.loadedMeshes) {
      mesh.checkCollisions = true;
      mesh.position.y += 0.2;
      groundFloors.push(mesh);
    }

    await new Promise<null | WebXRDefaultExperience>(async (resolve) => {
      try {
        const xr = await enableXR(scene, groundFloors, pipeline);
        resolve(xr);
      } catch (err) {
        console.log("not able to offer VR");
        resolve(null);
      }
    });

    // engine.hideLoadingUI();

    return scene;
  };
}

export default new MainScreen();
