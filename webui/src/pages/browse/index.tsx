import { useState, useEffect, useMemo } from "react";
import Taro from "@tarojs/taro";

import {
  View,
  Text,
  Input,
  ScrollView,
  PageContainer,
  Icon,
} from "@tarojs/components";
import QuoteCard from "../../components/QuoteCard";
import RecordDrawer from "../../components/RecordDrawer";
import { type Tag as TagType } from "../../types";
import Button from "../../components/Button";

import { deleteQuote } from "../../request";
import type { Quote } from "../../types";
import { useList } from "../../hooks/useList";
import { useAppStore } from "../../store/useAppStore";
import TagSelectorButton from "../../components/TagSelectorButton";
import "./index.scss";

const ACTION = {
  EMPTY: 0,
  ADD_QUOTE: 1,
  SELECT_TAG: 2,
};

type Filter = {
  keyword?: string;
  tagIds?: string[];
};

export default function Browse() {
  const { selectedTags, updateSelectedTags } = useAppStore();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [drawerType, setDrawerType] = useState(ACTION.EMPTY);

  const tagIds = useMemo(
    () => selectedTags.map((tag) => tag.id),
    [selectedTags],
  );

  const { list, loading, loadingMore, hasMore, refresh, loadMore, setFilter } =
    useList<Filter, Quote>({ keyword: searchKeyword, tagIds }, "quotes");

  const handleSearchInput = (e: any) => {
    setSearchKeyword(e.detail.value);
  };

  const handleTagClick = (tag: TagType) => {
    updateSelectedTags([...new Set([tag, ...selectedTags])]);
  };

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
            refresh();
          } catch (error) {
            console.error("删除失败:", error);
            Taro.showToast({ title: "删除失败", icon: "none" });
          }
        }
      },
    });
  };

  useEffect(() => {
    setFilter({ keyword: searchKeyword, tagIds });
  }, [searchKeyword, tagIds]);

  const handleClose = () => {
    setDrawerType(ACTION.EMPTY);
    Taro.showTabBar();
  };

  return (
    <View className="browse-page">
      <View className="search-section">
        <View className="base-input-section">
          <View className="base-input round">
            <Icon size={18} type="search" className="icon" />
            <Input
              placeholder="搜索摘抄内容..."
              value={searchKeyword}
              onInput={handleSearchInput}
            />
          </View>
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
        onClick={() => {
          setDrawerType(ACTION.ADD_QUOTE);

          Taro.hideTabBar();
        }}
      >
        +
      </Button>

      <PageContainer
        show={drawerType !== ACTION.EMPTY}
        round
        position="bottom"
        onAfterLeave={handleClose}
        onClickOverlay={handleClose}
      >
        {drawerType === ACTION.ADD_QUOTE && (
          <RecordDrawer onClose={handleClose} onRefresh={refresh} />
        )}
      </PageContainer>
    </View>
  );
}
