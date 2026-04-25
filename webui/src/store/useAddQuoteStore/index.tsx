import { create } from 'zustand';

interface AddQuoteState {
  isAdd: boolean;
  id: number;
  updateId: (id: number) => void;
  content: string;
  selectedTags: any[];
  newTagNames: string[];
  setIsAdd: (isAdd: boolean) => void;
  updateContent: (content: string) => void;
  updateSelectedTags: (tags: any[]) => void;
  updateNewTagNames: (names: string[]) => void;
  handleReset: () => void;
}

export const useAddQuoteStore = create<AddQuoteState>()(set => ({
  isAdd: true,
  id: 0,
  updateId: id => set({ id }),
  content: '',
  selectedTags: [],
  newTagNames: [],
  setIsAdd: isAdd => set({ isAdd }),
  updateContent: content => set({ content }),
  updateSelectedTags: tags => set({ selectedTags: tags }),
  updateNewTagNames: names => set({ newTagNames: names }),
  handleReset: () => set({ content: '', selectedTags: [], newTagNames: [], isAdd: true }),
}));
