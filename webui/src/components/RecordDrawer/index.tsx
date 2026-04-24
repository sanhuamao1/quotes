import { useState } from "react";
import { View, Textarea, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import TagSelector from "../TagSelector";
import Button from "../Button";
import { createQuote } from "../../request";
import { useAppStore } from "../../store/useAppStore";
import "./index.scss";

interface RecordDrawerProps {
  onClose: () => void;
  onRefresh: () => void;
}

export default function RecordDrawer({
  onClose,
  onRefresh,
}: RecordDrawerProps) {
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<any[]>([]);
  const [newTagNames, setNewTagNames] = useState<string[]>([]);
  const { fetchTags } = useAppStore();

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

      if (newTagNames.length > 0) {
        fetchTags(true);
      }
      onRefresh();
      setContent("");
      setSelectedTags([]);
      setNewTagNames([]);
      onClose();
    } catch (error) {
      console.error("保存失败:", error);
    }
  };

  return (
    <View className="drawer-content">
      <View className="input-section">
        <Textarea
          className="content-input"
          placeholder="在这里记录..."
          value={content}
          focus
          onInput={(e) => {
            setContent(e.detail.value);
          }}
          maxlength={300}
        />
        <View className="tag-section-title">
          {selectedTags
            .map((tag) => `#${tag.name}`)
            .map((item) => (
              <Text key={item}>{item}</Text>
            ))}
          {newTagNames
            .map((name) => `#${name}`)
            .map((item) => (
              <Text key={item}>{item}</Text>
            ))}
        </View>
      </View>

      <TagSelector
        selectedTags={selectedTags}
        newTagNames={newTagNames}
        onSelectedTagsChange={setSelectedTags}
        onNewTagNamesChange={setNewTagNames}
      />

      <Button onClick={handleSave} disabled={!content.trim()}>
        保存
      </Button>
    </View>
  );
}
