import { Scene } from "@babylonjs/core";

let importedDebugger = false;
export const runDebugger = async (scene: Scene) => {
  if (!importedDebugger) {
    await import("@babylonjs/core/Debug/debugLayer");
    await import("@babylonjs/inspector");
    importedDebugger = true;
  }
  if (scene.debugLayer?.isVisible()) {
    scene.debugLayer?.hide();
  } else {
    try {
      await scene.debugLayer?.show();
    } catch (err) {
      console.log(err);
    }
  }
};
