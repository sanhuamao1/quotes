import Taro, { useDidShow } from '@tarojs/taro';
import { View, Text, Icon, Input, ScrollView, PageContainer } from '@tarojs/components';
import { useState, useMemo, useCallback } from 'react';
import { useDrawer } from '../../hooks/useDrawer';
import { useAppStore } from '../../store/useAppStore';
import type { Tag, Quote } from '../../types';
import QuoteCard from '../../components/QuoteCard';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import { RenameIcon, DeleteIcon } from '../../components/SvgIcon';

import { getQuotes, deleteQuote, renameTag, deleteTag } from '../../request';
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
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [list, setList] = useState<Quote[]>([]);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renameInput, setRenameInput] = useState('');

  useDidShow(() => {
    fetchTags(true);
  });

  const handleSearchInput = useCallback((e: any) => {
    setKeyword(e.detail.value);
  }, []);

  const handleFilterChange = useCallback((key: FilterKey) => {
    setActiveFilter(key);
  }, []);

  const handleLongPress = (quote: Quote) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条摘抄吗？',
      confirmColor: '#e64340',
      success: async res => {
        if (res.confirm) {
          try {
            await deleteQuote(quote.id);
            handleFetch(quote.tags[0].id);
            Taro.showToast({ title: '删除成功', icon: 'success' });
          } catch (error) {
            console.error('删除失败:', error);
            Taro.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      },
    });
  };

  const handleFetch = async (id: number) => {
    await getQuotes({ tagIds: [id] }).then(data => {
      setList(data.list);
    });
  };

  const handleTagClick = useCallback((tag: Tag) => {
    setSelectedTag(tag);
    handleFetch(tag.id);
    updateShowDrawer(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    updateShowDrawer(false);
  }, []);

  const handleRenameConfirm = async () => {
    if (!selectedTag || !renameInput.trim() || renameInput.trim() === selectedTag.name) {
      setRenameModalVisible(false);
      return;
    }
    try {
      const data = await renameTag(selectedTag.id, renameInput.trim());
      setSelectedTag(data);
      setRenameModalVisible(false);
      Taro.showToast({ title: '重命名成功', icon: 'success' });
      fetchTags(true);
    } catch (error) {
      console.error('重命名失败:', error);
      Taro.showToast({ title: '重命名失败', icon: 'none' });
    }
  };

  const handleRenameCancel = useCallback(() => {
    setRenameModalVisible(false);
  }, []);

  const handleDeleteTag = () => {
    if (!selectedTag) return;
    Taro.showModal({
      title: '确认删除',
      content: `确定要删除标签 #${selectedTag.name} 吗？`,
      confirmColor: '#e64340',
      success: async res => {
        if (res.confirm) {
          try {
            await deleteTag(selectedTag.id);
            updateShowDrawer(false);
            fetchTags(true);
            Taro.showToast({ title: '删除成功', icon: 'success' });
          } catch (error) {
            console.error('删除标签失败:', error);
            Taro.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      },
    });
  };

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
          <EmptyState title="没有匹配的标签" description="试试其他搜索词" />
        )}
      </ScrollView>

      {/* Tag Quotes Drawer */}
      <PageContainer show={showDrawer} round position="bottom" onClickOverlay={handleCloseDrawer}>
        <View className="tag-drawer">
          <View className="tag-drawer-header">
            <View className="tag-drawer-header-left">
              <Text className="tag-drawer-title">#{selectedTag?.name}</Text>
              <RenameIcon
                onClick={() => {
                  setRenameInput(selectedTag?.name || '');
                  setRenameModalVisible(true);
                }}
              />
              <DeleteIcon onClick={handleDeleteTag} />
            </View>
            <View className="tag-drawer-close" onClick={handleCloseDrawer}>
              <Text className="tag-drawer-close-icon">×</Text>
            </View>
          </View>
          <ScrollView className="tag-drawer-scroll" scrollY lowerThreshold={100}>
            <View className="flow">
              {list.map(quote => (
                <QuoteCard
                  key={quote.id}
                  content={quote.content}
                  size="small"
                  onLongPress={() => handleLongPress(quote)}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      </PageContainer>

      {/* Rename Modal */}
      <Modal visible={renameModalVisible} onClose={handleRenameCancel}>
        <View className="rename-modal">
          <Text className="rename-modal-title">重命名标签</Text>
          <View className="base-input-section" style={{ marginBottom: 0 }}>
            <View className="base-input">
              <Input
                value={renameInput}
                onInput={e => setRenameInput(e.detail.value)}
                placeholder="输入新名称"
              />
            </View>
          </View>

          <View className="rename-modal-actions">
            <Button onClick={handleRenameCancel} type="default">
              取消
            </Button>
            <Button onClick={handleRenameConfirm}>确认</Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}
