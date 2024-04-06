import { ItemStatus, Item } from "./types";

export function createItem(content: string = ""): Item {
  return { title: content, status: ItemStatus.Active };
}
