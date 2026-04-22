import { View, Textarea, Button } from "@tarojs/components";
import { useState, useContext } from "react";
import Taro from "@tarojs/taro";
import TagSelector from "../../components/TagSelector";
import { createQuote } from "../../request";
import "./index.scss";
import { RecordContext, useRecordStore } from "../../store/recordContext";

const Index = () => {
  const { content, updateContent } = useRecordStore();
  const { selectedTags, newTagNames, updateSelectedTags, updateNewTagNames } =
    useContext(RecordContext);

  // 保存摘抄
  const handleSave = async () => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      Taro.showToast({ title: "请输入摘抄内容", icon: "none" });
      return;
    }

    try {
      await createQuote({
        content: trimmedContent,
        tags: [...selectedTags.map((t) => t.name), ...newTagNames],
      });

      Taro.showToast({ title: "保存成功", icon: "success" });

      // 重置表单
      updateContent("");
      updateSelectedTags([]);
      updateNewTagNames([]);
    } catch (error) {
      console.error("保存失败:", error);
    }
  };

  return (
    <View className="record-page">
      {/* 摘抄输入区 */}
      <View className="input-section">
        <Textarea
          className="content-input"
          placeholder="在这里记录..."
          value={content}
          focus
          onInput={(e) => {
            updateContent(e.detail.value);
          }}
          maxlength={300}
        />
      </View>

      {/* 标签选择器（包含显示和选择功能） */}
      <TagSelector />

      <Button
        className="save-btn"
        onClick={handleSave}
        disabled={!content.trim()}
      >
        保存
      </Button>
    </View>
  );
};

export default () => {
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<any[]>([]);
  const [newTagNames, setNewTagNames] = useState<string[]>([]);
  return (
    <RecordContext.Provider
      value={{
        content,
        selectedTags,
        newTagNames,
        visible: false,
        updateContent: (v) => setContent(v),
        updateSelectedTags: (v) => setSelectedTags(v),
        updateNewTagNames: (v) => setNewTagNames(v),
        updateVisible: () => {},
      }}
    >
      <Index />
    </RecordContext.Provider>
  );
};
