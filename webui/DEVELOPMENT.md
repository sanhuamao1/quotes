# 词摘 - 前端开发说明书

## 一、技术栈

- **框架**: Taro 4.2.0 + React 18
- **语言**: TypeScript
- **样式**: SCSS
- **构建工具**: Vite
- **状态管理**: Zustand（推荐）或 React Context + Hooks

---

## 二、目录规范

```
webui/
├── config/                 # Taro配置文件
├── request/                # API请求封装
│   ├── index.ts           # API接口定义
│   └── wrapper.ts         # 请求拦截器封装
├── src/
│   ├── app.ts             # 应用入口
│   ├── app.config.ts      # 全局配置
│   ├── app.scss           # 全局样式
│   ├── pages/             # 页面目录
│   │   ├── index/         # 记录页（首页）
│   │   ├── browse/        # 浏览页
│   │   ├── tags/          # 标签页
│   │   └── profile/       # 我的页面
│   ├── components/        # 公共组件
│   │   ├── TabBar/        # 底部导航
│   │   ├── TagInput/      # 标签输入组件
│   │   ├── TagSelector/   # 标签选择抽屉
│   │   ├── QuoteCard/     # 摘抄卡片
│   │   ├── SearchBar/     # 搜索栏
│   │   └── TagCloud/      # 标签云
│   ├── hooks/             # 自定义Hooks
│   │   ├── useQuotes.ts   # 摘抄相关操作
│   │   ├── useTags.ts     # 标签相关操作
│   │   └── useStats.ts    # 统计数据
│   ├── store/             # 状态管理
│   │   └── index.ts       # Zustand store
│   ├── utils/             # 工具函数
│   │   ├── date.ts        # 日期格式化
│   │   └── storage.ts     # 本地存储
│   └── constants/         # 常量定义
│       └── index.ts       # 全局常量
├── types/                 # 全局类型定义
└── DEVELOPMENT.md         # 本文件
```

---

## 三、类型定义

### 3.1 数据类型 (types/index.ts)

```typescript
// 摘抄
export interface Quote {
  id: string;
  content: string;
  tags: Tag[];
  createdAt: string;
  updatedAt?: string;
}

// 创建摘抄请求
export interface CreateQuoteRequest {
  content: string;
  tagIds: string[];
  newTags?: string[]; // 新建的标签名称
}

// 更新摘抄请求
export interface UpdateQuoteRequest {
  id: string;
  content?: string;
  tagIds?: string[];
}

// 标签
export interface Tag {
  id: string;
  name: string;
  count?: number; // 使用次数
  color?: string; // 标签颜色
}

// 统计数据
export interface Stats {
  totalQuotes: number;
  totalTags: number;
}

// 摘抄列表查询参数
export interface QuoteQueryParams {
  keyword?: string;
  tagIds?: string[];
  page?: number;
  pageSize?: number;
}
```

---

## 四、API封装规则

### 4.1 请求封装 (request/wrapper.ts)

```typescript
import Taro from "@tarojs/taro";

const BASE_URL = "http://localhost:3000/api";

interface RequestOptions<T = any> {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  data?: T;
  header?: Record<string, string>;
}

interface ApiResponse<T = any> {
  code: number;
  data: T;
  message?: string;
}

export async function request<T = any>(options: RequestOptions): Promise<T> {
  const { url, method = "GET", data, header = {} } = options;

  // 获取token（如需要）
  const token = Taro.getStorageSync("token");

  try {
    const res = await Taro.request<ApiResponse<T>>({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...header,
      },
    });

    if (res.statusCode >= 200 && res.statusCode < 300) {
      return res.data.data;
    }

    throw new Error(res.data.message || `请求失败: ${res.statusCode}`);
  } catch (error) {
    Taro.showToast({
      title: error.message || "网络错误",
      icon: "none",
    });
    throw error;
  }
}
```

### 4.2 API接口定义 (request/index.ts)

```typescript
import { request } from "./wrapper";
import type {
  Quote,
  Tag,
  Stats,
  CreateQuoteRequest,
  UpdateQuoteRequest,
  QuoteQueryParams,
} from "@/types";

// ==================== 摘抄接口 ====================

/**
 * 获取摘抄列表
 * GET /quotes?keyword=xxx&tagIds=1,2&page=1&pageSize=20
 */
export const getQuotes = (params?: QuoteQueryParams): Promise<Quote[]> => {
  const queryParams = new URLSearchParams();
  if (params?.keyword) queryParams.append("keyword", params.keyword);
  if (params?.tagIds?.length)
    queryParams.append("tagIds", params.tagIds.join(","));
  if (params?.page) queryParams.append("page", String(params.page));
  if (params?.pageSize) queryParams.append("pageSize", String(params.pageSize));

  const query = queryParams.toString();
  return request({ url: `/quotes${query ? `?${query}` : ""}`, method: "GET" });
};

/**
 * 创建摘抄
 * POST /quotes
 */
export const createQuote = (data: CreateQuoteRequest): Promise<Quote> => {
  return request({ url: "/quotes", method: "POST", data });
};

/**
 * 获取单个摘抄
 * GET /quotes/:id
 */
export const getQuote = (id: string): Promise<Quote> => {
  return request({ url: `/quotes/${id}`, method: "GET" });
};

/**
 * 更新摘抄
 * PUT /quotes/:id
 */
export const updateQuote = (
  id: string,
  data: Partial<UpdateQuoteRequest>,
): Promise<Quote> => {
  return request({ url: `/quotes/${id}`, method: "PUT", data });
};

/**
 * 删除摘抄
 * DELETE /quotes/:id
 */
export const deleteQuote = (id: string): Promise<void> => {
  return request({ url: `/quotes/${id}`, method: "DELETE" });
};

// ==================== 标签接口 ====================

/**
 * 获取所有标签
 * GET /tags
 */
export const getTags = (): Promise<Tag[]> => {
  return request({ url: "/tags", method: "GET" });
};

/**
 * 获取标签下的摘抄
 * GET /tags/:id/quotes
 */
export const getQuotesByTag = (tagId: string): Promise<Quote[]> => {
  return request({ url: `/tags/${tagId}/quotes`, method: "GET" });
};

/**
 * 重命名标签
 * PUT /tags/rename
 */
export const renameTag = (oldName: string, newName: string): Promise<void> => {
  return request({
    url: "/tags/rename",
    method: "PUT",
    data: { oldName, newName },
  });
};

// ==================== 统计接口 ====================

/**
 * 获取统计数据
 * GET /stats
 */
export const getStats = (): Promise<Stats> => {
  return request({ url: "/stats", method: "GET" });
};
```

---

## 五、组件封装规则

### 5.1 组件命名规范

- 目录名：大驼峰（PascalCase），如 `TagSelector/`
- 文件名：index.tsx + index.scss
- 组件名：大驼峰，与目录名一致

### 5.2 标签选择抽屉组件 (components/TagSelector/)

**功能说明**: 在记录页点击标签区域后弹出的抽屉，支持选择已有标签和创建新标签

```typescript
// components/TagSelector/index.tsx
import { View, Text, Input, ScrollView } from '@tarojs/components';
import { useState, useMemo } from 'react';
import Taro from '@tarojs/taro';
import './index.scss';

interface Tag {
  id: string;
  name: string;
}

interface TagSelectorProps {
  visible: boolean;
  selectedTags: Tag[];
  allTags: Tag[];
  onClose: () => void;
  onConfirm: (tags: Tag[], newTagNames: string[]) => void;
}

export default function TagSelector({
  visible,
  selectedTags,
  allTags,
  onClose,
  onConfirm,
}: TagSelectorProps) {
  const [selected, setSelected] = useState<Tag[]>(selectedTags);
  const [inputValue, setInputValue] = useState('');
  const [newTagNames, setNewTagNames] = useState<string[]>([]);

  // 过滤已选标签
  const filteredTags = useMemo(() => {
    if (!inputValue) return allTags;
    return allTags.filter(tag =>
      tag.name.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [allTags, inputValue]);

  // 切换标签选中状态
  const toggleTag = (tag: Tag) => {
    const exists = selected.find(t => t.id === tag.id);
    if (exists) {
      setSelected(selected.filter(t => t.id !== tag.id));
    } else {
      setSelected([...selected, tag]);
    }
  };

  // 移除标签
  const removeTag = (tagId: string) => {
    setSelected(selected.filter(t => t.id !== tagId));
  };

  // 移除新建标签
  const removeNewTag = (name: string) => {
    setNewTagNames(newTagNames.filter(n => n !== name));
  };

  // 添加新标签
  const handleAddNewTag = () => {
    const name = inputValue.trim();
    if (!name) return;

    // 检查是否已存在
    const existsInAll = allTags.find(t => t.name === name);
    if (existsInAll) {
      toggleTag(existsInAll);
      setInputValue('');
      return;
    }

    // 检查是否已在新建列表中
    if (newTagNames.includes(name)) {
      setInputValue('');
      return;
    }

    setNewTagNames([...newTagNames, name]);
    setInputValue('');
  };

  // 确认选择
  const handleConfirm = () => {
    onConfirm(selected, newTagNames);
    onClose();
  };

  if (!visible) return null;

  return (
    <View className='tag-selector-overlay' onClick={onClose}>
      <View className='tag-selector-drawer' onClick={e => e.stopPropagation()}>
        {/* 头部 */}
        <View className='tag-selector-header'>
          <Text className='tag-selector-title'>选择标签</Text>
          <Text className='tag-selector-close' onClick={onClose}>×</Text>
        </View>

        {/* 已选标签 */}
        {(selected.length > 0 || newTagNames.length > 0) && (
          <View className='tag-selector-section'>
            <Text className='tag-selector-section-title'>已选标签</Text>
            <View className='tag-selector-selected-list'>
              {selected.map(tag => (
                <View key={tag.id} className='tag-item tag-item--selected'>
                  <Text>{tag.name}</Text>
                  <Text className='tag-remove' onClick={() => removeTag(tag.id)}>×</Text>
                </View>
              ))}
              {newTagNames.map(name => (
                <View key={name} className='tag-item tag-item--new'>
                  <Text>{name}</Text>
                  <Text className='tag-remove' onClick={() => removeNewTag(name)}>×</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 添加新标签 */}
        <View className='tag-selector-section'>
          <Text className='tag-selector-section-title'>添加标签</Text>
          <View className='tag-selector-input-wrap'>
            <Input
              className='tag-selector-input'
              placeholder='搜索或输入新标签...'
              value={inputValue}
              onInput={e => setInputValue(e.detail.value)}
              onConfirm={handleAddNewTag}
            />
            <View className='tag-selector-add-btn' onClick={handleAddNewTag}>
              <Text>+</Text>
            </View>
          </View>
        </View>

        {/* 所有标签 */}
        <View className='tag-selector-section tag-selector-section--all'>
          <Text className='tag-selector-section-title'>所有标签</Text>
          <ScrollView className='tag-selector-all-list' scrollY>
            {filteredTags.map(tag => {
              const isSelected = selected.find(t => t.id === tag.id);
              return (
                <View
                  key={tag.id}
                  className={`tag-item ${isSelected ? 'tag-item--active' : ''}`}
                  onClick={() => toggleTag(tag)}
                >
                  <Text>{isSelected ? '✓' : ''} {tag.name}</Text>
                </View>
              );
            })}
            {filteredTags.length === 0 && (
              <Text className='tag-selector-empty'>无匹配标签，按+添加新标签</Text>
            )}
          </ScrollView>
        </View>

        {/* 底部确认按钮 */}
        <View className='tag-selector-footer'>
          <View className='tag-selector-confirm-btn' onClick={handleConfirm}>
            <Text>确认 ({selected.length + newTagNames.length})</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
```

```scss
// components/TagSelector/index.scss
@import "../../app.scss";

.tag-selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.tag-selector-drawer {
  width: 100%;
  max-height: 70vh;
  background: #fff;
  border-radius: 24px 24px 0 0;
  display: flex;
  flex-direction: column;
}

.tag-selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid #f0f0f0;
}

.tag-selector-title {
  font-size: 34px;
  font-weight: 600;
  color: #333;
}

.tag-selector-close {
  font-size: 48px;
  color: #999;
  line-height: 1;
}

.tag-selector-section {
  padding: 24px 32px;

  &--flexible {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}

.tag-selector-section-title {
  font-size: 26px;
  color: #666;
  margin-bottom: 16px;
  display: block;
}

.tag-selector-selected-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  padding: 12px 24px;
  border-radius: 32px;
  font-size: 28px;
  background: #f5f5f5;
  color: #666;

  &--selected {
    background: #8b7355;
    color: #fff;
  }

  &--new {
    background: #e8f5e9;
    color: #4caf50;
  }

  &--active {
    background: #f0e6dc;
    color: #8b7355;
  }
}

.tag-remove {
  margin-left: 12px;
  font-size: 24px;
  opacity: 0.8;
}

.tag-selector-input-wrap {
  display: flex;
  gap: 16px;
}

.tag-selector-input {
  flex: 1;
  height: 80px;
  padding: 0 24px;
  border: 2px solid #e0e0e0;
  border-radius: 16px;
  font-size: 28px;
}

.tag-selector-add-btn {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #8b7355;
  border-radius: 16px;
  color: #fff;
  font-size: 40px;
}

.tag-selector-all-list {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 16px;
}

.tag-selector-empty {
  width: 100%;
  text-align: center;
  color: #999;
  font-size: 28px;
  padding: 48px 0;
}

.tag-selector-footer {
  padding: 24px 32px;
  border-top: 1px solid #f0f0f0;
}

.tag-selector-confirm-btn {
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #8b7355;
  border-radius: 44px;
  color: #fff;
  font-size: 32px;
  font-weight: 500;
}
```

### 5.3 摘抄卡片组件 (components/QuoteCard/)

```typescript
// components/QuoteCard/index.tsx
import { View, Text } from '@tarojs/components';
import './index.scss';

interface Tag {
  id: string;
  name: string;
}

interface QuoteCardProps {
  content: string;
  tags: Tag[];
  createdAt: string;
  onClick?: () => void;
  onTagClick?: (tagId: string) => void;
}

export default function QuoteCard({
  content,
  tags,
  createdAt,
  onClick,
  onTagClick,
}: QuoteCardProps) {
  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
  };

  return (
    <View className='quote-card' onClick={onClick}>
      <Text className='quote-content'>{content}</Text>
      <View className='quote-footer'>
        <View className='quote-tags'>
          {tags.map(tag => (
            <View
              key={tag.id}
              className='quote-tag'
              onClick={e => {
                e.stopPropagation();
                onTagClick?.(tag.id);
              }}
            >
              <Text>{tag.name}</Text>
            </View>
          ))}
        </View>
        <Text className='quote-time'>{formatDate(createdAt)}</Text>
      </View>
    </View>
  );
}
```

```scss
// components/QuoteCard/index.scss
.quote-card {
  background: #fff;
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.quote-content {
  font-size: 32px;
  line-height: 1.8;
  color: #333;
  display: block;
  margin-bottom: 24px;
}

.quote-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quote-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.quote-tag {
  padding: 8px 20px;
  background: #f5f0eb;
  border-radius: 24px;
  font-size: 24px;
  color: #8b7355;
}

.quote-time {
  font-size: 24px;
  color: #999;
}
```

---

## 六、页面开发规范

### 6.1 记录页 (pages/index/index.tsx)

```typescript
import { View, Text, Textarea, Button } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro, { useLoad } from '@tarojs/taro';
import TagSelector from '@/components/TagSelector';
import { createQuote, getTags } from '@/request';
import type { Tag } from '@/types';
import './index.scss';

export default function Index() {
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [newTagNames, setNewTagNames] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useLoad(() => {
    loadTags();
  });

  // 加载所有标签
  const loadTags = async () => {
    try {
      const tags = await getTags();
      setAllTags(tags);
    } catch (error) {
      console.error('加载标签失败:', error);
    }
  };

  // 保存摘抄
  const handleSave = async () => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      Taro.showToast({ title: '请输入摘抄内容', icon: 'none' });
      return;
    }

    setLoading(true);
    try {
      await createQuote({
        content: trimmedContent,
        tagIds: selectedTags.map(t => t.id),
        newTags: newTagNames,
      });

      Taro.showToast({ title: '保存成功', icon: 'success' });

      // 重置表单
      setContent('');
      setSelectedTags([]);
      setNewTagNames([]);

      // 刷新标签列表（新标签会被创建）
      loadTags();
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理标签选择确认
  const handleTagConfirm = (tags: Tag[], newTags: string[]) => {
    setSelectedTags(tags);
    setNewTagNames(newTags);
  };

  // 显示已选标签文本
  const getSelectedTagsText = () => {
    const allNames = [
      ...selectedTags.map(t => t.name),
      ...newTagNames,
    ];
    if (allNames.length === 0) return '点击添加标签...';
    return allNames.join(' · ');
  };

  return (
    <View className='record-page'>
      {/* 摘抄输入区 */}
      <View className='input-section'>
        <Text className='section-label'>摘抄内容</Text>
        <Textarea
          className='content-input'
          placeholder='在这里记录触动你的文字...'
          value={content}
          onInput={e => setContent(e.detail.value)}
          maxlength={2000}
          autoHeight
        />
      </View>

      {/* 标签选择区 */}
      <View className='input-section' onClick={() => setSelectorVisible(true)}>
        <Text className='section-label'>标签</Text>
        <View className='tags-display'>
          {selectedTags.length === 0 && newTagNames.length === 0 ? (
            <Text className='tags-placeholder'>点击添加标签...</Text>
          ) : (
            <View className='tags-list'>
              {selectedTags.map(tag => (
                <View key={tag.id} className='selected-tag'>
                  <Text>{tag.name}</Text>
                </View>
              ))}
              {newTagNames.map(name => (
                <View key={name} className='selected-tag selected-tag--new'>
                  <Text>{name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* 保存按钮 */}
      <Button
        className='save-btn'
        onClick={handleSave}
        loading={loading}
        disabled={loading || !content.trim()}
      >
        保存
      </Button>

      {/* 标签选择抽屉 */}
      <TagSelector
        visible={selectorVisible}
        selectedTags={selectedTags}
        allTags={allTags}
        onClose={() => setSelectorVisible(false)}
        onConfirm={handleTagConfirm}
      />
    </View>
  );
}
```

```scss
// pages/index/index.scss
.record-page {
  min-height: 100vh;
  background: #faf8f5;
  padding: 32px;
}

.input-section {
  margin-bottom: 40px;
}

.section-label {
  font-size: 28px;
  color: #666;
  margin-bottom: 16px;
  display: block;
}

.content-input {
  width: 100%;
  min-height: 400px;
  padding: 24px;
  background: #fff;
  border-radius: 20px;
  font-size: 32px;
  line-height: 1.8;
  color: #333;
  box-sizing: border-box;
}

.tags-display {
  min-height: 88px;
  padding: 24px;
  background: #fff;
  border-radius: 20px;
  display: flex;
  align-items: center;
}

.tags-placeholder {
  font-size: 28px;
  color: #999;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.selected-tag {
  padding: 12px 24px;
  background: #f5f0eb;
  border-radius: 32px;
  font-size: 26px;
  color: #8b7355;

  &--new {
    background: #e8f5e9;
    color: #4caf50;
  }
}

.save-btn {
  width: 100%;
  height: 96px;
  line-height: 96px;
  background: #8b7355;
  color: #fff;
  font-size: 32px;
  border-radius: 48px;
  margin-top: 48px;

  &[disabled] {
    opacity: 0.6;
  }

  &::after {
    border: none;
  }
}
```

### 6.2 页面配置 (pages/index/index.config.ts)

```typescript
export default definePageConfig({
  navigationBarTitleText: "记录",
  navigationBarBackgroundColor: "#faf8f5",
  navigationBarTextStyle: "black",
  backgroundColor: "#faf8f5",
});
```

---

## 七、状态管理 (store/index.ts)

```typescript
import { create } from "zustand";
import type { Quote, Tag, Stats } from "@/types";

interface AppState {
  // 数据
  quotes: Quote[];
  tags: Tag[];
  stats: Stats | null;

  // 筛选状态
  selectedTagIds: string[];
  searchKeyword: string;

  // Actions
  setQuotes: (quotes: Quote[]) => void;
  addQuote: (quote: Quote) => void;
  removeQuote: (id: string) => void;
  setTags: (tags: Tag[]) => void;
  setStats: (stats: Stats) => void;
  setSelectedTagIds: (ids: string[]) => void;
  setSearchKeyword: (keyword: string) => void;

  // 派生数据
  filteredQuotes: () => Quote[];
}

export const useAppStore = create<AppState>((set, get) => ({
  quotes: [],
  tags: [],
  stats: null,
  selectedTagIds: [],
  searchKeyword: "",

  setQuotes: (quotes) => set({ quotes }),

  addQuote: (quote) =>
    set((state) => ({
      quotes: [quote, ...state.quotes],
    })),

  removeQuote: (id) =>
    set((state) => ({
      quotes: state.quotes.filter((q) => q.id !== id),
    })),

  setTags: (tags) => set({ tags }),

  setStats: (stats) => set({ stats }),

  setSelectedTagIds: (ids) => set({ selectedTagIds: ids }),

  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),

  filteredQuotes: () => {
    const { quotes, selectedTagIds, searchKeyword } = get();
    return quotes.filter((quote) => {
      // 标签筛选
      if (selectedTagIds.length > 0) {
        const quoteTagIds = quote.tags.map((t) => t.id);
        const hasAllTags = selectedTagIds.every((id) =>
          quoteTagIds.includes(id),
        );
        if (!hasAllTags) return false;
      }
      // 关键词搜索
      if (searchKeyword) {
        return quote.content
          .toLowerCase()
          .includes(searchKeyword.toLowerCase());
      }
      return true;
    });
  },
}));
```

---

## 八、全局样式 (app.scss)

```scss
// 全局变量
$primary-color: #8b7355;
$primary-light: #f5f0eb;
$bg-color: #faf8f5;
$text-primary: #333;
$text-secondary: #666;
$text-muted: #999;
$border-color: #e8e4df;

// 全局样式
page {
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
    Arial, sans-serif;
  color: $text-primary;
  background: $bg-color;
}

// 底部导航栏样式（自定义TabBar）
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: #fff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 32px;

  &.active {
    .tab-icon {
      background: $primary-color;
    }
    .tab-text {
      color: $primary-color;
    }
  }
}

.tab-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #ccc;
  margin-bottom: 8px;
}

.tab-text {
  font-size: 24px;
  color: $text-secondary;
}
```

---

## 九、路由配置 (app.config.ts)

```typescript
export default defineAppConfig({
  pages: [
    "pages/index/index", // 记录页
    "pages/browse/index", // 浏览页
    "pages/tags/index", // 标签页
    "pages/profile/index", // 我的页
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#faf8f5",
    navigationBarTitleText: "词摘",
    navigationBarTextStyle: "black",
    backgroundColor: "#faf8f5",
  },
  tabBar: {
    color: "#999",
    selectedColor: "#8b7355",
    backgroundColor: "#fff",
    borderStyle: "white",
    list: [
      {
        pagePath: "pages/index/index",
        text: "记录",
        iconPath: "assets/icons/record.png",
        selectedIconPath: "assets/icons/record-active.png",
      },
      {
        pagePath: "pages/browse/index",
        text: "浏览",
        iconPath: "assets/icons/browse.png",
        selectedIconPath: "assets/icons/browse-active.png",
      },
      {
        pagePath: "pages/tags/index",
        text: "标签",
        iconPath: "assets/icons/tag.png",
        selectedIconPath: "assets/icons/tag-active.png",
      },
      {
        pagePath: "pages/profile/index",
        text: "我的",
        iconPath: "assets/icons/profile.png",
        selectedIconPath: "assets/icons/profile-active.png",
      },
    ],
  },
});
```

---

## 十、开发流程

### 10.1 安装依赖

```bash
cd webui
npm install zustand  # 状态管理
```

### 10.2 开发命令

```bash
# H5开发
npm run dev:h5

# 微信小程序开发
npm run dev:weapp

# 构建H5
npm run build:h5

# 构建微信小程序
npm run build:weapp
```

### 10.3 开发顺序建议

1. **基础搭建**
   - 配置全局样式、变量
   - 搭建请求封装
   - 定义类型

2. **核心页面**
   - 记录页（首页）
   - TagSelector标签选择抽屉组件

3. **辅助页面**
   - 浏览页（列表+搜索+筛选）
   - 标签页（标签云+统计）
   - 我的页面（导出+设置）

4. **优化完善**
   - 空状态
   - 加载状态
   - 错误处理
   - 性能优化

---

## 十一、注意事项

1. **样式规范**
   - 使用rpx单位进行响应式适配
   - 配色遵循设计稿，主色 `#8b7355`
   - 保持足够的留白，突出文字内容

2. **性能优化**
   - 摘抄列表使用虚拟滚动（超过100条时）
   - 图片懒加载
   - 防抖处理搜索输入

3. **兼容性**
   - 微信小程序适配
   - H5适配
   - 安全区域适配（iPhone刘海屏）

4. **错误处理**
   - 网络请求统一错误提示
   - 表单验证友好提示
   - 边界情况处理（空数据、加载失败等）
