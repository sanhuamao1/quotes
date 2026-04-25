import { useEffect, useMemo } from 'react';
import Taro from '@tarojs/taro';

import { View, Text, Input, ScrollView, PageContainer, Icon } from '@tarojs/components';
import QuoteCard from '../../components/QuoteCard';
import RecordDrawer from './RecordDrawer';
import { type Tag, Quote } from '../../types';
import Button from '../../components/Button';

import { deleteQuote } from '../../request';
import { useList } from '../../hooks/useList';
import { useDrawer } from '../../hooks/useDrawer';
import { useFilterStore } from '../../store/useFilterStore';
import TagSelectorButton from '../../components/TagSelectorButton';
import './index.scss';
import { useAddQuoteStore } from '../../store/useAddQuoteStore';

type Filter = {
  keyword?: string;
  tagIds?: string[];
};

export default function Browse() {
  const { keyword, updateKeyword, filteredTags, updateFilteredTags } = useFilterStore();
  const { updateContent, updateSelectedTags, handleReset } = useAddQuoteStore();

  const [showDrawer, updateShowDrawer] = useDrawer(false);

  const tagIds = useMemo(() => filteredTags.map(tag => tag.id), [filteredTags]);
  const { list, loading, loadingMore, hasMore, refresh, loadMore, setFilter } = useList<
    Filter,
    Quote
  >({ keyword, tagIds }, 'quotes');

  const handleSearchInput = (e: any) => {
    updateKeyword(e.detail.value);
  };

  const handleTagClick = (tag: Tag) => {
    updateFilteredTags([...new Set([tag, ...filteredTags])]);
  };

  const handleLongPress = (quote: Quote) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条摘抄吗？',
      confirmColor: '#e64340',
      success: async res => {
        if (res.confirm) {
          try {
            await deleteQuote(quote.id);
            Taro.showToast({ title: '删除成功', icon: 'success' });
            refresh();
          } catch (error) {
            console.error('删除失败:', error);
            Taro.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      },
    });
  };

  useEffect(() => {
    setFilter({ keyword, tagIds });
  }, [keyword, tagIds, setFilter]);

  const handleClose = () => {
    updateShowDrawer(false);
    handleReset();
  };

  return (
    <View className="browse-page">
      <View className="base-input-section">
        <View className="base-input round">
          <Icon size={18} type="search" className="icon" />
          <Input placeholder="搜索摘抄内容..." value={keyword} onInput={handleSearchInput} />
        </View>
      </View>
      <TagSelectorButton />

      <ScrollView
        className="quotes-list"
        scrollY
        scrollWithAnimation
        onScrollToLower={loadMore}
        lowerThreshold={100}
      >
        {list.map(quote => (
          <QuoteCard
            key={quote.id}
            content={quote.content}
            tags={quote.tags}
            updatedAt={quote.updatedAt}
            onTagClick={handleTagClick}
            onLongPress={() => handleLongPress(quote)}
            onClick={() => {
              updateShowDrawer(true);
              updateContent(quote.content);
              updateSelectedTags(quote.tags);
            }}
          />
        ))}

        {list.length > 0 && (
          <View className="load-more-tip">
            {loadingMore ? (
              <Text className="tip-text">加载中...</Text>
            ) : hasMore ? (
              <Text className="tip-text">上拉加载更多</Text>
            ) : (
              <Text className="tip-text">已经到底了</Text>
            )}
          </View>
        )}

        {list.length === 0 && !loading && (
          <View className="empty-state">
            <Text className="empty-text">暂无摘抄记录</Text>
            <Text className="empty-hint">点击下方 + 按钮添加第一条摘抄吧</Text>
          </View>
        )}
      </ScrollView>

      <Button
        circle
        className="fab-btn"
        width={80}
        height={80}
        onClick={() => updateShowDrawer(true)}
      >
        +
      </Button>

      <PageContainer show={showDrawer} round position="bottom" onClickOverlay={handleClose}>
        <RecordDrawer onClose={handleClose} onRefresh={refresh} />
      </PageContainer>
    </View>
  );
}
