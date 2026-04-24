import { View, Text } from "@tarojs/components";
import { useAppStore } from "../../store/useAppStore";
import "./index.scss";
import TagIcon from "../SvgIcon/TagIcon";
import CloseIcon from "../SvgIcon/CloseIcon";

export const TagSelectorButton = () => {
  const { updateSelectedTags, selectedTags } = useAppStore();
  const tagCount = selectedTags.length;
  const handleClear = () => {
    updateSelectedTags([]);
  };

  // 渲染标签内容
  const renderContent = () => {
    if (tagCount === 0) {
      // 状态1：未选择任何标签
      return (
        <>
          <Text className="tag-selector-btn__text">标签</Text>
        </>
      );
    }

    if (tagCount >= 1) {
      // 状态2：选择了1-2个标签，直接显示
      const displayText = selectedTags
        .slice(0, Math.min(tagCount, 2))
        .map((tag) => `#${tag.name}`);

      console.log("显示的标签：", displayText);
      return (
        <>
          {displayText.map((text) => (
            <Text key={text} className="tag-selector-btn__text">
              {text}
            </Text>
          ))}
          {tagCount > 2 && (
            <View className="tag-selector-btn__badge">
              <Text className="tag-selector-btn__badge-text">{tagCount}</Text>
            </View>
          )}
        </>
      );
    }
  };

  return (
    <View className="tag-selector-wrapper">
      <View
        className={`tag-selector-btn ${tagCount > 0 ? "tag-selector-btn--active" : ""}`}
      >
        <TagIcon type={tagCount > 0 ? "light" : "default"} />
        {renderContent()}
      </View>
      {tagCount > 0 && <CloseIcon onClick={handleClear} />}
    </View>
  );
};

export default TagSelectorButton;
