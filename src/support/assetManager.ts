import {
  AssetsManager,
  BinaryFileAssetTask,
  ContainerAssetTask,
  CubeTextureAssetTask,
  ILoadingScreen,
  ImageAssetTask,
  MeshAssetTask,
  TextureAssetTask,
} from "@babylonjs/core";
import { CustomLoadingScreen } from "./customLoader";

export interface AssetsObject {
  containers: {
    [key: string]: ContainerAssetTask;
  };
  models: {
    [key: string]: MeshAssetTask;
  };
  sounds: {
    [key: string]: BinaryFileAssetTask;
  };
  textures: { [key: string]: TextureAssetTask };
  images: { [key: string]: ImageAssetTask };
  cubeTextures: { [key: string]: CubeTextureAssetTask };
}

export const loadAllAssets = (
  assetsManager: AssetsManager,
  loadingScreen?: ILoadingScreen | CustomLoadingScreen
): Promise<AssetsObject> =>
  new Promise((resolve) => {
    let cubeTextures: string[] = [];
    let images: string[] = [];
    let textures: string[] = [];
    let sounds: string[] = [];
    let containerModels: string[] = [];
    let models: string[] = ["snowScene.glb"];

    const assetsContainer: AssetsObject = {
      models: {},
      containers: {},
      textures: {},
      images: {},
      sounds: {},
      cubeTextures: {},
    };

    for (const model of models) {
      const modelTask = assetsManager.addMeshTask(
        model,
        "",
        `${window.location.href}assets/models/`,
        model
      );
      modelTask.onSuccess = (task) => {
        assetsContainer.models[model] = task;
      };

      modelTask.onError = (err) => {
        console.log("model load err: ", err);
      };
    }

    for (const container of containerModels) {
      const containerTask = assetsManager.addContainerTask(
        container,
        "",
        `${window.location.href}assets/models/`,
        container
      );
      containerTask.onSuccess = (task) => {
        assetsContainer.containers[container] = task;
      };

      containerTask.onError = (err) => {
        console.log("container model load err: ", err);
      };
    }

    for (const cubeText of cubeTextures) {
      const cubeTextureTask = assetsManager.addCubeTextureTask(
        cubeText,
        `${window.location.href}assets/textures/${cubeText}`,
        undefined,
        undefined,
        undefined,
        true
      );
      cubeTextureTask.onSuccess = (task) => {
        assetsContainer.cubeTextures[cubeText] = task;
      };

      cubeTextureTask.onError = (err) => {
        console.log("cube texture load err: ", err);
      };
    }

    for (const sound of sounds) {
      const binaryTask = assetsManager.addBinaryFileTask(
        sound,
        `${window.location.href}assets/sounds/${sound}`
      );
      binaryTask.onSuccess = (task) => {
        assetsContainer.sounds[sound] = task;
      };

      binaryTask.onError = (err) => {
        console.log("sound load err: ", err);
      };
    }

    for (const texture of textures) {
      const textTask = assetsManager.addTextureTask(
        texture,
        `${window.location.href}assets/textures/${texture}`,
        false,
        false
      );
      textTask.onSuccess = (task) => {
        assetsContainer.textures[texture] = task;
      };

      textTask.onError = (err) => {
        console.log("texture load err: ", err);
      };
    }

    for (const image of images) {
      const imageTask = assetsManager.addImageTask(
        image,
        `${window.location.href}assets/images/${image}`
      );
      imageTask.onSuccess = (task) => {
        assetsContainer.images[image] = task;
      };

      imageTask.onError = (err) => {
        console.log("texture load err: ", err);
      };
    }

    assetsManager.onProgress = (remainingCount, totalCount) => {
      if (!loadingScreen) {
        return;
      }
      const loaded = totalCount - remainingCount;
      const percent = Number((loaded / totalCount) * 100).toFixed(0);
      loadingScreen.loadingUIText = `${
        totalCount - remainingCount
      } of ${totalCount} loaded`;
      if (loadingScreen instanceof CustomLoadingScreen) {
        loadingScreen.progress = `${percent}%`;
      }
    };
    assetsManager.onFinish = (_tasks) => {
      resolve(assetsContainer);
    };
    assetsManager.load();
  });
