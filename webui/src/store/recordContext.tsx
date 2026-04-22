import { createContext, useContext, useState } from "react";
import type { Tag } from "../types";

interface State {
  content: string;
  selectedTags: Tag[];
  newTagNames: string[];
  visible: boolean;
}

interface Action {
  updateContent: (v: State["content"]) => void;
  updateSelectedTags: (v: State["selectedTags"]) => void;
  updateNewTagNames: (v: State["newTagNames"]) => void;
  updateVisible: (v: State["visible"]) => void;
}

export const RecordContext = createContext<State & Action>({
  content: "",
  selectedTags: [],
  newTagNames: [],
  visible: false,
  updateContent: () => {},
  updateSelectedTags: () => {},
  updateNewTagNames: () => {},
  updateVisible: () => {},
} as any);

export const useRecordStore = () => {
  return useContext(RecordContext);
};
