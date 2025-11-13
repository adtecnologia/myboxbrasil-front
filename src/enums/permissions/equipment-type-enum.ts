const PREFIX = "equipment.type";

const EquipmentTypePermissionEnum = {
  STORE: `${PREFIX}.store`,
  UPDATE: `${PREFIX}.update`,
  DELETE: `${PREFIX}.delete`,
  SHOW: `${PREFIX}.show`,
  GET: `${PREFIX}.get`,
} as const;

type EquipmentTypePermissionEnum =
  (typeof EquipmentTypePermissionEnum)[keyof typeof EquipmentTypePermissionEnum];

export { EquipmentTypePermissionEnum };
