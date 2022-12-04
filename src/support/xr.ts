import {
  Scene,
  WebXRFeatureName,
  PhysicsImpostor,
  AbstractMesh,
  WebXRState,
  DefaultRenderingPipeline,
  Vector3,
  Ray,
  Animation,
  BezierCurveEase,
} from "@babylonjs/core";

export const enableXR = async (
  scene: Scene,
  floorMeshes: AbstractMesh[],
  pipeline?: DefaultRenderingPipeline
) => {
  // enable xr
  const xr = await scene.createDefaultXRExperienceAsync();

  // enable physics for xr
  xr.baseExperience.featuresManager.enableFeature(
    WebXRFeatureName.PHYSICS_CONTROLLERS,
    "latest",
    {
      xrInput: xr.input,
      physicsProperties: {
        restitution: 0.5,
        impostorSize: 0.1,
        impostorType: PhysicsImpostor.BoxImpostor,
      },
      enableHeadsetImpostor: true,
    }
  );

  // teleportation features
  xr.baseExperience.featuresManager.enableFeature(
    WebXRFeatureName.TELEPORTATION,
    "stable",
    {
      xrInput: xr.input,
      floorMeshes,
      pickBlockerMeshes: [],
    }
  );

  let observers: any = {};
  let meshesUnderPointer: any = {};
  const tmpVec = new Vector3();
  const tmpRay = new Ray(new Vector3(), new Vector3());
  let lastTimestamp = 0;
  const oldPos = new Vector3();

  xr.input.onControllerAddedObservable.add((inputSource) => {
    inputSource.onMotionControllerInitObservable.add((motionController) => {
      motionController.onModelLoadedObservable.add(async (_mc) => {
        const mesh = inputSource.grip;
        if (mesh && motionController.handedness === "left") {
          const xr_ids = motionController.getComponentIds();
          // get x button
          const xbuttonComponent = motionController.getComponent(xr_ids[3]);
          xbuttonComponent.onButtonStateChangedObservable.add(() => {
            if (xbuttonComponent.pressed) {
              console.log("X pressed!");
            }
          });
        }

        const squeeze = motionController.getComponentOfType("squeeze");
        if (squeeze) {
          squeeze.onButtonStateChangedObservable.add(() => {
            if (squeeze.changes.pressed) {
              if (squeeze.pressed) {
                inputSource.getWorldPointerRayToRef(tmpRay, true);
                tmpRay.direction.scaleInPlace(1.5);
                const position = inputSource.grip
                  ? inputSource.grip.position
                  : inputSource.pointer.position;
                let mesh = scene.meshUnderPointer;
                if (xr.pointerSelection.getMeshUnderPointer) {
                  mesh = xr.pointerSelection.getMeshUnderPointer(
                    inputSource.uniqueId
                  );
                }
                if (
                  mesh &&
                  mesh.physicsImpostor &&
                  mesh.name !== "Floor" &&
                  mesh.name !== "Ground"
                ) {
                  Animation.CreateAndStartAnimation(
                    "meshmove",
                    mesh,
                    "position",
                    30,
                    15,
                    mesh.position.clone(),
                    position.add(tmpRay.direction),
                    Animation.ANIMATIONLOOPMODE_CONSTANT,
                    new BezierCurveEase(0.3, -0.75, 0.7, 1.6),
                    () => {
                      if (!mesh) return;
                      meshesUnderPointer[inputSource.uniqueId] = mesh;
                      observers[inputSource.uniqueId] =
                        xr.baseExperience.sessionManager.onXRFrameObservable.add(
                          () => {
                            const delta =
                              xr.baseExperience.sessionManager
                                .currentTimestamp - lastTimestamp;
                            lastTimestamp =
                              xr.baseExperience.sessionManager.currentTimestamp;
                            inputSource.getWorldPointerRayToRef(tmpRay, true);
                            tmpRay.direction.scaleInPlace(1.5);
                            const position = inputSource.grip
                              ? inputSource.grip.position
                              : inputSource.pointer.position;
                            tmpVec.copyFrom(position);
                            tmpVec.addInPlace(tmpRay.direction);
                            tmpVec.subtractToRef(oldPos, tmpVec);
                            tmpVec.scaleInPlace(1000 / delta);
                            meshesUnderPointer[
                              inputSource.uniqueId
                            ].position.copyFrom(position);
                            meshesUnderPointer[
                              inputSource.uniqueId
                            ].position.addInPlace(tmpRay.direction);
                            oldPos.copyFrom(
                              meshesUnderPointer[inputSource.uniqueId].position
                            );
                            meshesUnderPointer[
                              inputSource.uniqueId
                            ].physicsImpostor.setLinearVelocity(Vector3.Zero());
                            meshesUnderPointer[
                              inputSource.uniqueId
                            ].physicsImpostor.setAngularVelocity(
                              Vector3.Zero()
                            );
                          }
                        );
                    }
                  );
                }
              } else {
                // throw the object
                if (
                  observers[inputSource.uniqueId] &&
                  meshesUnderPointer[inputSource.uniqueId]
                ) {
                  xr.baseExperience.sessionManager.onXRFrameObservable.remove(
                    observers[inputSource.uniqueId]
                  );
                  observers[inputSource.uniqueId] = null;
                  meshesUnderPointer[
                    inputSource.uniqueId
                  ].physicsImpostor.setLinearVelocity(tmpVec);
                }
              }
            }
          });
        }
      });
    });
  });

  xr.baseExperience.onStateChangedObservable.add((state) => {
    switch (state) {
      case WebXRState.IN_XR:
        // XR is initialized and already submitted one frame
        if (pipeline) {
          pipeline.cameras.push(xr.baseExperience.camera);
        }
      case WebXRState.ENTERING_XR:
      // xr is being initialized, enter XR request was made
      case WebXRState.EXITING_XR:
      // xr exit request was made. not yet done.
      case WebXRState.NOT_IN_XR:
      // either out or not yet in XR
    }
  });
  return xr;
};
