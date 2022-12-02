import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";

export interface CreateSceneClass {
  createScene: (engine: Engine, canvas: HTMLCanvasElement) => Promise<Scene>;
  preTasks?: Promise<unknown>[];
}

export interface CreateSceneModule {
  default: CreateSceneClass;
}

export const getSceneModuleWithName = (
  name = "main"
): Promise<CreateSceneClass> => {
  return import(`./scenes/${name}`).then((module: CreateSceneModule) => {
    return module.default;
  });
};
