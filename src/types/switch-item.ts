import { Mesh } from "three";

export interface SwitchItem {
  name: string;
  mesh: Mesh;
  isConfigured: boolean;
  switchType: string;
}
