import { View, Text, Input } from '@tarojs/components';
import { useState, useMemo, useEffect } from 'react';
import './index.scss';
import { type Tag as TagType } from '../../types';
import Tag from '../Tag';
import { useAppStore } from '../../store/useAppStore';
import { useDebounce } from '../../hooks/useDebounce';
import AddIcon from '../SvgIcon/AddIcon';
import Button from '../Button';

interface TagSelectorProps {
  selectedTags: TagType[];
  onSelectedTagsChange: (tags: TagType[]) => void;
  newTagNames?: string[];
  onNewTagNamesChange?: (names: string[]) => void;
  showCreate?: boolean;
  onClose: () => void;
}

export default function TagSelector({
  selectedTags,
  onSelectedTagsChange,
  newTagNames = [],
  onNewTagNamesChange,
  showCreate = true,
  onClose,
}: TagSelectorProps) {
  const [inputValue, setInputValue] = useState('');
  const debouncedInput = useDebounce(inputValue, 200);
  const { tags, fetchTags } = useAppStore();

  // 合并所有标签（已存在的 + 新增的）
  const combinedTags = useMemo(() => {
    const existingTags = tags;
    const newTags: TagType[] = newTagNames.map((name, index) => ({
      id: `new-${index}`,
      name,
    }));
    return [...existingTags, ...newTags];
  }, [tags, newTagNames]);

  // 过滤标签（使用防抖后的值）
  const filteredTags = useMemo(() => {
    if (!debouncedInput) return combinedTags.slice(0, 20);
    return combinedTags
      .filter(tag => tag.name.toLowerCase().includes(debouncedInput.toLowerCase()))
      .slice(0, 20);
  }, [combinedTags, debouncedInput]);

  useEffect(() => {
    fetchTags(true);
  }, []);

  // 切换标签选中状态
  const toggleTag = (tag: TagType) => {
    // 如果是新增的标签
    if (typeof tag.id === 'string') {
      removeNewTag(tag.name);
      return;
    }
    // 如果是已存在的标签
    const exists = selectedTags.find(t => t.id === tag.id);
    if (exists) {
      onSelectedTagsChange(selectedTags.filter(t => t.id !== tag.id));
    } else {
      onSelectedTagsChange([...selectedTags, tag]);
    }
  };

  // 移除新建标签
  const removeNewTag = (name: string) => {
    const updated = newTagNames.filter(n => n !== name);
    onNewTagNamesChange?.(updated);
  };

  // 添加新标签
  const handleAddNewTag = () => {
    const name = inputValue.trim();
    if (!name) return;

    // 检查是否已存在（包括已选和已有标签）
    const existsInAll = tags.find(t => t.name === name);
    if (existsInAll) {
      // 如果已存在但未选中，则选中它
      const isAlreadySelected = selectedTags.find(t => t.id === existsInAll.id);
      if (!isAlreadySelected) {
        onSelectedTagsChange([...selectedTags, existsInAll]);
      }
      setInputValue('');
      return;
    }

    if (!showCreate) {
      setInputValue('');
      return;
    }

    // 检查是否已在新建列表中
    if (newTagNames.includes(name)) {
      setInputValue('');
      return;
    }

    const updated = [...newTagNames, name];
    onNewTagNamesChange?.(updated);
    setInputValue('');
  };

  // 检查标签是否被选中
  const isTagSelected = (tag: TagType) => {
    if (typeof tag.id === 'string') {
      return true; // 新增标签默认就是"选中"状态
    }
    return selectedTags.some(t => t.id === tag.id);
  };
  const total = selectedTags.length + newTagNames.length;

  return (
    <View className="tag-selector-container">
      {/* 搜索和添加新标签 */}
      <View className="base-input-section">
        <View className="base-input">
          <Input
            placeholder={showCreate ? '搜索或输入新标签...' : '搜索标签...'}
            adjustPosition
            cursorSpacing={200}
            value={inputValue}
            onInput={e => setInputValue(e.detail.value)}
            onConfirm={handleAddNewTag}
          />
        </View>

        {showCreate && <AddIcon onClick={handleAddNewTag} size={1.6} />}
      </View>

      {/* 所有标签 */}
      <View className="tag-list-section">
        {filteredTags.map(tag => {
          const selected = isTagSelected(tag);
          return (
            <Tag key={tag.id} name={tag.name} checked={selected} onClick={() => toggleTag(tag)} />
          );
        })}
        {filteredTags.length === 0 && (
          <Text className="tag-empty-text">
            {showCreate ? '无匹配标签，点击 + 添加新标签' : '无匹配标签'}
          </Text>
        )}
      </View>
      {showCreate && <Button onClick={onClose}>保存{total !== 0 && ` (${total})`}</Button>}
    </View>
  );
}
