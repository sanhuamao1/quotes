import { createContext, useContext } from "react";
import type { Tag, Quote } from "../types";

interface State {
  tags: Tag[];
  quotes: Quote[];
  page: number;
  pageSize: number;
  filter: {
    keyword: string;
    tags: string[];
  };
}

interface Action {
  updateTags: (v: State["tags"]) => void;
  updateQuotes: (v: State["quotes"]) => void;
  updatePage: (v: State["page"]) => void;
  updatePageSize: (v: State["pageSize"]) => void;
  updateFilter: (v: State["filter"]) => void;
}

export const BrowseContext = createContext<State & Action>({
  tags: [],
  quotes: [],
  page: 1,
  pageSize: 8,
  filter: {
    keyword: "",
    tags: [],
  },
  updateFilter: () => {},
  updateTags: () => {},
  updateQuotes: () => {},
  updatePage: () => {},
  updatePageSize: () => {},
} as any);

export const useBrowseStore = () => {
  return useContext(BrowseContext);
};
