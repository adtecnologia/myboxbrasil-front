const PREFIX = "equipment";

const EquipmentPermissionEnum = {
  STORE: `${PREFIX}.store`,
  UPDATE: `${PREFIX}.update`,
  DELETE: `${PREFIX}.delete`,
  SHOW: `${PREFIX}.show`,
  GET: `${PREFIX}.get`,
} as const;

type EquipmentPermissionEnum =
  (typeof EquipmentPermissionEnum)[keyof typeof EquipmentPermissionEnum];

export { EquipmentPermissionEnum };
