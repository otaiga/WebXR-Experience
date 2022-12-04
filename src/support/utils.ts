import {
  AbstractMesh,
  MeshBuilder,
  PhysicsImpostor,
  Scene,
  SixDofDragBehavior,
  Vector3,
} from "@babylonjs/core";

export const createSixDegreesOfDrag = (mesh: AbstractMesh) => {
  const sixdof = new SixDofDragBehavior();
  sixdof.onDragStartObservable.add(() => {
    if (mesh.physicsImpostor) {
      mesh.physicsImpostor.sleep();
    }
  });
  sixdof.onDragEndObservable.add(() => {
    if (mesh.physicsImpostor) {
      mesh.physicsImpostor.wakeUp();
    }
  });
  return sixdof;
};

export const createSnowBall = (scene?: Scene) => {
  const snowMat = scene?.materials.find((mat) => mat.name === "Snow");
  const sb = MeshBuilder.CreateSphere("snowball", { diameter: 0.3 });
  sb.checkCollisions = true;
  sb.physicsImpostor = new PhysicsImpostor(
    sb,
    PhysicsImpostor.SphereImpostor,
    {
      mass: 1,
      restitution: 0.9,
    },
    scene
  );
  sb.position = new Vector3(0, 0.4, -4);
  if (snowMat) {
    sb.material = snowMat;
  }
  sb.addBehavior(createSixDegreesOfDrag(sb));
};
