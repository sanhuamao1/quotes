import { useDidShow } from '@tarojs/taro';
import { View, Text, Icon, Input, ScrollView, PageContainer } from '@tarojs/components';
import { useState, useMemo, useCallback } from 'react';
import { useDrawer } from '../../hooks/useDrawer';
import { useAppStore } from '../../store/useAppStore';
import type { Tag, Quote } from '../../types';
import QuoteCard from '../../components/QuoteCard';
import { getQuotes } from '../../request';
import './index.scss';

const TAG_COLORS = [
  '#8b7355',
  '#a0896b',
  '#7c6a54',
  '#b8a48c',
  '#6b5e4e',
  '#9a8b7a',
  '#c4a882',
  '#7a6a5a',
  '#d4b896',
  '#8a7a6a',
];

type FilterKey = 'all' | 'recent' | 'popular';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'recent', label: '最近使用' },
  { key: 'popular', label: '热门' },
];

export default function Tags() {
  const { tags, fetchTags } = useAppStore();
  const [keyword, setKeyword] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const [showDrawer, updateShowDrawer] = useDrawer();
  const [tagName, setTagName] = useState('');
  const [list, setList] = useState<Quote[]>([]);

  useDidShow(() => {
    fetchTags(true);
  });

  const handleSearchInput = useCallback((e: any) => {
    setKeyword(e.detail.value);
  }, []);

  const handleFilterChange = useCallback((key: FilterKey) => {
    setActiveFilter(key);
  }, []);

  const handleTagClick = useCallback(async (tag: Tag) => {
    setTagName(tag.name);
    await getQuotes({ tagIds: [tag.id] }).then(data => {
      setList(data.list);
    });
    updateShowDrawer(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    updateShowDrawer(false);
  }, []);

  const displayTags = useMemo(() => {
    let result = [...tags];

    if (keyword.trim()) {
      const q = keyword.trim().toLowerCase();
      result = result.filter(t => t.name.toLowerCase().includes(q));
    }

    switch (activeFilter) {
      case 'recent':
        result = [...result]
          .sort((a, b) => {
            const aDate = (a as any).lastUsedAt || '';
            const bDate = (b as any).lastUsedAt || '';
            return String(bDate).localeCompare(String(aDate));
          })
          .slice(0, 12);
        break;
      case 'popular':
        result = [...result].sort((a, b) => (b.count || 0) - (a.count || 0)).slice(0, 12);
        break;
      default:
        break;
    }

    return result;
  }, [tags, keyword, activeFilter]);

  return (
    <View className="tags-page">
      {/* Search + total count */}
      <View className="search-section">
        <View className="base-input-section">
          <View className="base-input round">
            <Icon size={18} type="search" className="icon" />
            <Input placeholder="搜索标签..." value={keyword} onInput={handleSearchInput} />
          </View>
          <Text className="total-count">{tags.length} 个</Text>
        </View>
      </View>

      {/* Quick filters */}
      <View className="filter-bar">
        {FILTERS.map(f => (
          <View
            key={f.key}
            className={`filter-chip ${activeFilter === f.key ? 'active' : ''}`}
            onClick={() => handleFilterChange(f.key)}
          >
            <Text>{f.label}</Text>
          </View>
        ))}
      </View>

      {/* Tags grid */}
      <ScrollView className="tags-scroll" scrollY>
        {displayTags.length > 0 ? (
          <View className="tags-grid">
            {displayTags.map((tag, idx) => {
              const color = TAG_COLORS[idx % TAG_COLORS.length];
              return (
                <View
                  key={tag.id}
                  className="tag-card"
                  style={{ animationDelay: `${idx * 0.04}s` }}
                  onClick={() => handleTagClick(tag)}
                >
                  <View className="tag-dot" style={{ backgroundColor: color }} />
                  <Text className="tag-name">{tag.name}</Text>
                  <Text className="tag-count">{tag.count || 0}</Text>
                </View>
              );
            })}
          </View>
        ) : (
          <View className="empty-state">
            <Text className="empty-title">没有匹配的标签</Text>
            <Text className="empty-desc">试试其他搜索词</Text>
          </View>
        )}
      </ScrollView>

      {/* Tag Quotes Drawer */}
      <PageContainer show={showDrawer} round position="bottom" onClickOverlay={handleCloseDrawer}>
        <View className="tag-drawer">
          <View className="tag-drawer-header">
            <Text className="tag-drawer-title">#{tagName}</Text>
            <View className="tag-drawer-close" onClick={handleCloseDrawer}>
              <Text className="tag-drawer-close-icon">×</Text>
            </View>
          </View>
          <ScrollView className="tag-drawer-scroll" scrollY lowerThreshold={100}>
            <View className="flow">
              {list.map(quote => (
                <QuoteCard key={quote.id} content={quote.content} size="small" />
              ))}
            </View>
          </ScrollView>
        </View>
      </PageContainer>
    </View>
  );
}
