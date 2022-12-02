import { Engine } from "@babylonjs/core/Engines/engine";
import { WebGPUEngine } from "@babylonjs/core/Engines/webgpuEngine";
import { getSceneModuleWithName } from "./createScene";
import { CustomLoadingScreen } from "./support/customLoader";
import "@babylonjs/core/Engines/WebGPU/Extensions/engine.uniformBuffer";
import "@babylonjs/loaders";
import "./styles.css";

const babylonInit = async (): Promise<void> => {
  // get the module to load
  const createSceneModule = await getSceneModuleWithName(
    location.search.split("scene=")[1]?.split("&")[0]
  );
  const engineType =
    location.search.split("engine=")[1]?.split("&")[0] || "webgl";
  // Execute the pretasks, if defined
  await Promise.all(createSceneModule.preTasks || []);
  // Get the canvas element
  const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
  let engine: Engine;
  // Generate the BABYLON 3D engine
  if (engineType === "webgpu") {
    const webGPUSupported = await WebGPUEngine.IsSupportedAsync;
    if (webGPUSupported) {
      const webgpu = (engine = new WebGPUEngine(canvas, {
        adaptToDeviceRatio: true,
        antialiasing: true,
      }));
      await webgpu.initAsync();
      engine = webgpu;
    } else {
      engine = new Engine(canvas, true);
    }
  } else {
    engine = new Engine(canvas, true);
  }

  engine.loadingScreen = new CustomLoadingScreen(canvas);

  // Create the scene
  const scene = await createSceneModule.createScene(engine, canvas);
  // Register a render loop to repeatedly render the scene
  engine.runRenderLoop(function () {
    scene.render();
  });

  // Watch for browser/canvas resize events
  window.addEventListener("resize", function () {
    engine.resize();
  });
};

babylonInit().then(() => {
  console.log("everything is initialized");
});
