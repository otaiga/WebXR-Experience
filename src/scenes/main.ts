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

    // Get snow material
    const snowMat = scene.materials.find((mat) => mat.name === "Snow");

    // Setup Floor
    const groundFloors: AbstractMesh[] = [];

    const createSnowBall = () => {
      const sb = MeshBuilder.CreateSphere("snowball", { diameter: 0.3 });
      sb.physicsImpostor = new PhysicsImpostor(
        sb,
        PhysicsImpostor.SphereImpostor,
        {
          mass: 1,
          restitution: 0.9,
        },
        scene
      );
      sb.position = new Vector3(0, 1, -4);
      if (snowMat) {
        sb.material = snowMat;
      }
    };

    const ground = MeshBuilder.CreateGround("ground", {
      width: 100,
      height: 100,
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

    createSnowBall();

    await new Promise<null | WebXRDefaultExperience>(async (resolve) => {
      try {
        const xr = await enableXR(scene, groundFloors, pipeline);
        resolve(xr);
      } catch (err) {
        console.log("not able to offer VR");
        resolve(null);
      }
    });

    // window.addEventListener("keydown", async (ev) => {
    //   // debugger Ctrl+Alt+I
    //   if (ev.ctrlKey && ev.altKey && ev.code === "KeyI") {
    //     await runDebugger(scene);
    //   }
    // });

    return scene;
  };
}

export default new MainScreen();
