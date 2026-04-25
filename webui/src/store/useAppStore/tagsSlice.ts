import { type Tag } from '../../types';
import { getTags } from '../../request';

// ---------- 类型定义 ----------
export interface TagsState {
  tags: Tag[];
  tagsLoading: boolean;
  tagsError: string | null;
  tagsFetched: boolean;
}

export interface TagsActions {
  fetchTags: (force?: boolean) => Promise<void>;
  resetTags: () => void;
}

export type TagsSlice = TagsState & TagsActions;

// ---------- 初始状态 ----------
export const initialTagsState: TagsState = {
  tags: [],
  tagsLoading: false,
  tagsError: null,
  tagsFetched: false,
};

// ---------- 创建 Tags Slice ----------
export const createTagsSlice = (set: any, get: any): TagsSlice => ({
  ...initialTagsState,

  fetchTags: async (force = false) => {
    // 已存在数据且非强制刷新，直接返回（避免重复请求）
    const { tagsFetched, tagsLoading } = get();
    if (!force && tagsFetched) return;
    // 防止并发重复请求
    if (tagsLoading) return;

    set({ tagsLoading: true, tagsError: null });
    try {
      const tags = await getTags();
      console.log('[tagsSlice] 获取标签成功:', tags.length, '个');
      set({
        tags,
        tagsLoading: false,
        tagsFetched: true,
      });
    } catch (error: any) {
      console.error('[tagsSlice] 获取标签失败:', error);
      set({
        tagsError: error?.message || '获取标签失败',
        tagsLoading: false,
        // 失败时不标记 fetched，以便下次重试
      });
    }
  },

  resetTags: () => {
    set(initialTagsState);
  },
});
