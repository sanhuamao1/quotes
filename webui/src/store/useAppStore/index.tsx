import { create } from "zustand";
import { createTagsSlice, type TagsSlice } from "./tagsSlice";

// ---------- 合并所有 Slice 类型 ----------
export type AppStore = TagsSlice;

// ---------- 创建 Store ----------
export const useAppStore = create<AppStore>()((set, get) => ({
  ...createTagsSlice(set, get),
}));
