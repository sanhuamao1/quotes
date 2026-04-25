import { create } from 'zustand';
import type { Tag } from '../../types';

interface FilterState {
  keyword: string;
  filteredTags: Tag[];
  updateKeyword: (keyword: string) => void;
  updateFilteredTags: (tags: Tag[]) => void;
}

export const useFilterStore = create<FilterState>()(set => ({
  keyword: '',
  filteredTags: [],
  updateKeyword: keyword => set({ keyword }),
  updateFilteredTags: tags => set({ filteredTags: tags }),
}));
