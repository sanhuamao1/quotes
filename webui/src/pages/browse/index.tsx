import { View, Text, Input, ScrollView } from "@tarojs/components";
import { useState, useEffect } from "react";
import Taro from "@tarojs/taro";
import QuoteCard from "../../components/QuoteCard";
import { getQuotes, getTags, deleteQuote } from "../../request";
import type { Quote, Tag } from "../../types";
import "./index.scss";
import { useList } from "../../hooks/useList";

type Filter = {
  keyword?: string;
  tagIds?: string[];
};

export default function Browse() {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");

  // 使用自定义 Hook
  const {
    list,
    setList,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    refresh,
    loadMore,
    setFilter,
  } = useList<Filter, Quote>(
    { keyword: searchKeyword, tagIds: selectedTagIds },
    getQuotes,
  );

  // 处理搜索输入
  const handleSearchInput = (e: any) => {
    setSearchKeyword(e.detail.value);
  };

  // 点击标签跳转
  const handleTagClick = (tagId: string) => {
    Taro.navigateTo({
      url: `/pages/tags/detail?id=${tagId}`,
    });
  };

  // 长按卡片删除
  const handleLongPress = (quote: Quote) => {
    Taro.showModal({
      title: "确认删除",
      content: "确定要删除这条摘抄吗？",
      confirmColor: "#e64340",
      success: async (res) => {
        if (res.confirm) {
          try {
            await deleteQuote(quote.id);
            Taro.showToast({ title: "删除成功", icon: "success" });
            // 从列表中移除已删除的项
            setList((prev) => prev.filter((q) => q.id !== quote.id));
          } catch (error) {
            console.error("删除失败:", error);
            Taro.showToast({ title: "删除失败", icon: "none" });
          }
        }
      },
    });
  };

  // 初始化加载
  useEffect(() => {
    getTags().then(setAllTags).catch(console.error);
  }, []);

  useEffect(() => {
    setFilter({ keyword: searchKeyword, tagIds: selectedTagIds });
  }, [searchKeyword, selectedTagIds]);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  return (
    <View className="browse-page">
      {/* 搜索框 */}
      <View className="search-section">
        <View className="search-box">
          <View className="search-icon" />
          <Input
            className="search-input"
            placeholder="搜索摘抄内容..."
            value={searchKeyword}
            onInput={handleSearchInput}
            confirmType="search"
          />
        </View>
      </View>

      {/* 标签筛选 */}
      <View className="filter-section">
        <Text className="filter-label">标签筛选</Text>
        <ScrollView
          className="tag-filter-scroll"
          scrollX
          scrollWithAnimation
          showScrollbar={false}
        >
          <View className="tag-filter-list">
            {allTags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id);
              return (
                <View
                  key={tag.id}
                  className={`filter-tag ${isSelected ? "selected" : ""}`}
                  onClick={() => toggleTag(tag.id)}
                >
                  <Text className="filter-tag-text">{tag.name}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* 摘抄列表 */}
      <ScrollView
        className="quotes-list"
        scrollY
        scrollWithAnimation
        refresherEnabled
        refresherTriggered={refreshing}
        onRefresherRefresh={refresh}
        onScrollToLower={loadMore}
        lowerThreshold={100}
      >
        {list.map((quote) => (
          <QuoteCard
            key={quote.id}
            content={quote.content}
            tags={quote.tags}
            updatedAt={quote.updatedAt}
            onTagClick={handleTagClick}
            onLongPress={() => handleLongPress(quote)}
          />
        ))}

        {/* 加载更多提示 */}
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
            <Text className="empty-hint">去记录页添加第一条摘抄吧</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
