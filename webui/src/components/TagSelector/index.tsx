import {
  View,
  Text,
  Input,
  ScrollView,
  PageContainer,
} from "@tarojs/components";
import { useState, useMemo } from "react";
import Taro, { useLoad } from "@tarojs/taro";
import { getTags } from "../../request";
import "./index.scss";
import { useRecordStore } from "../../store/recordContext";
import { type Tag } from "../../types";

export default function TagSelector() {
  const [visible, setVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const { newTagNames, selectedTags, updateSelectedTags, updateNewTagNames } =
    useRecordStore();

  // 加载所有标签
  useLoad(() => {
    loadTags();
  });

  const loadTags = async () => {
    try {
      const tags = await getTags();
      setAllTags(tags);
    } catch (error) {
      console.error("加载标签失败:", error);
      Taro.showToast({ title: "加载标签失败", icon: "none" });
    }
  };

  // 过滤已选标签
  const filteredTags = useMemo(() => {
    if (!inputValue) return allTags;
    return allTags.filter((tag) =>
      tag.name.toLowerCase().includes(inputValue.toLowerCase()),
    );
  }, [allTags, inputValue]);

  // 切换标签选中状态
  const toggleTag = (tag: Tag) => {
    const exists = selectedTags.find((t) => t.id === tag.id);
    if (exists) {
      updateSelectedTags(selectedTags.filter((t) => t.id !== tag.id));
    } else {
      updateSelectedTags([...selectedTags, tag]);
    }
  };

  // 移除标签
  const removeTag = (tagId: string) => {
    const updated = selectedTags.filter((t) => t.id !== tagId);
    updateSelectedTags(updated);
  };

  // 移除新建标签
  const removeNewTag = (name: string) => {
    const updated = newTagNames.filter((n) => n !== name);
    updateNewTagNames(updated);
  };

  // 添加新标签
  const handleAddNewTag = () => {
    const name = inputValue.trim();
    if (!name) return;

    // 检查是否已存在
    const existsInAll = allTags.find((t) => t.name === name);
    if (existsInAll) {
      toggleTag(existsInAll);
      setInputValue("");
      return;
    }

    // 检查是否已在新建列表中
    if (newTagNames.includes(name)) {
      setInputValue("");
      return;
    }

    const updated = [...newTagNames, name];
    updateNewTagNames(updated);
    setInputValue("");
  };

  // 确认选择
  const handleConfirm = () => {
    setVisible(false);
  };

  return (
    <>
      {/* 标签显示区域 */}
      <View className="input-section" onClick={() => setVisible(true)}>
        <Text className="section-label">标签</Text>
        <View className="tags-display">
          {selectedTags.length === 0 && newTagNames.length === 0 ? (
            <Text className="tags-placeholder">点击添加标签...</Text>
          ) : (
            <View className="tags-list">
              {selectedTags.map((tag) => (
                <View key={tag.id} className="selected-tag">
                  <Text>{tag.name}</Text>
                </View>
              ))}
              {newTagNames.map((name) => (
                <View key={name} className="selected-tag">
                  <Text>{name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* 标签选择器弹窗 */}
      <PageContainer
        show={visible}
        onLeave={() => setVisible(false)}
        onClickOverlay={() => setVisible(false)}
        round
        className="tag-selector"
      >
        {/* 头部 */}
        <View className="tag-selector-header">
          <Text className="tag-selector-title">选择标签</Text>
          <Text
            className="tag-selector-close"
            onClick={() => setVisible(false)}
          >
            ×
          </Text>
        </View>

        {/* 已选标签 */}
        {(selectedTags.length > 0 || newTagNames.length > 0) && (
          <View className="tag-selector-section">
            <Text className="tag-selector-section-title">已选标签</Text>
            <View className="tag-selector-selected-list">
              {selectedTags.map((tag) => (
                <View key={tag.id} className="tag-item tag-item--selected">
                  <Text>{tag.name}</Text>
                  <Text
                    className="tag-remove"
                    onClick={() => removeTag(tag.id)}
                  >
                    ×
                  </Text>
                </View>
              ))}
              {newTagNames.map((name) => (
                <View key={name} className="tag-item tag-item--selected">
                  <Text>{name}</Text>
                  <Text
                    className="tag-remove"
                    onClick={() => removeNewTag(name)}
                  >
                    ×
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 添加新标签 */}
        <View className="tag-selector-section">
          <Text className="tag-selector-section-title">添加标签</Text>
          <View className="tag-selector-input-wrap">
            <Input
              className="tag-selector-input"
              placeholder="搜索或输入新标签..."
              value={inputValue}
              onInput={(e) => setInputValue(e.detail.value)}
              onConfirm={handleAddNewTag}
            />
            <View className="tag-selector-add-btn" onClick={handleAddNewTag}>
              <Text>+</Text>
            </View>
          </View>
        </View>

        {/* 所有标签 */}
        <View className="tag-selector-section tag-selector-section--all">
          <Text className="tag-selector-section-title">所有标签</Text>
          <ScrollView className="tag-selector-all-list" scrollY>
            {filteredTags.map((tag) => {
              const isSelected = selectedTags.find((t) => t.id === tag.id);
              return (
                <View
                  key={tag.id}
                  className={`tag-item ${isSelected ? "tag-item--active" : ""}`}
                  onClick={() => toggleTag(tag)}
                >
                  <Text>
                    {isSelected ? "✓" : ""} {tag.name}
                  </Text>
                </View>
              );
            })}
            {filteredTags.length === 0 && (
              <Text className="tag-selector-empty">
                无匹配标签，按+添加新标签
              </Text>
            )}
          </ScrollView>
        </View>

        {/* 底部确认按钮 */}
        <View className="tag-selector-footer">
          <View className="tag-selector-confirm-btn" onClick={handleConfirm}>
            <Text>确认 ({selectedTags.length + newTagNames.length})</Text>
          </View>
        </View>
      </PageContainer>
    </>
  );
}
