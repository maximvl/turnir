import { ItemStatus, Item } from "./types";

export function createItem(index: string): Item {
  return { title: "", status: ItemStatus.Active, id: index };
}
