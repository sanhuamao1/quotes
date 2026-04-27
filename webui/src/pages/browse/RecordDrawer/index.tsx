import { useState } from 'react';
import { View, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import TagSelector from '../../../components/TagSelector';
import Modal from '../../../components/Modal';
import { createQuote, updateQuote } from '../../../request';
import { useAddQuoteStore } from '../../../store/useAddQuoteStore';
import { useAppStore } from '../../../store/useAppStore';
import './index.scss';
import TagIcon from '../../../components/SvgIcon/TagIcon';
import SaveIcon from '../../../components/SvgIcon/SaveIcon';

interface RecordDrawerProps {
  onClose: () => void;
  onRefresh: () => void;
}

export default function RecordDrawer({ onClose, onRefresh }: RecordDrawerProps) {
  const {
    content,
    selectedTags,
    newTagNames,
    updateContent,
    updateSelectedTags,
    updateNewTagNames,
    handleReset,
    isAdd,
    id,
  } = useAddQuoteStore();
  const [showTagselector, setShowTagSelector] = useState(false);
  const { fetchTags } = useAppStore();

  const handleSave = async () => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      Taro.showToast({ title: '请输入摘抄内容', icon: 'none' });
      return;
    }

    try {
      if (isAdd) {
        await createQuote({
          content: trimmedContent,
          tagIds: selectedTags.map(t => t.id),
          newTagsName: newTagNames,
        });
        Taro.showToast({ title: '保存成功', icon: 'success' });
      } else {
        await updateQuote(id, {
          content: trimmedContent,
          tagIds: selectedTags.map(t => t.id),
          newTagsName: newTagNames,
        });
        Taro.showToast({ title: '保存成功', icon: 'success' });
      }

      if (newTagNames.length > 0) {
        fetchTags(true);
      }
      onRefresh();
      handleReset();
      onClose();
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  return (
    <View className="drawer-content">
      <Textarea
        className="content-input"
        placeholder="在这里记录..."
        adjustKeyboardTo="bottom"
        cursorSpacing={40}
        focus={!showTagselector}
        value={content}
        onInput={e => {
          updateContent(e.detail.value);
        }}
        maxlength={300}
      />

      <Modal visible={showTagselector} onClose={() => setShowTagSelector(false)}>
        <TagSelector
          selectedTags={selectedTags}
          onSelectedTagsChange={updateSelectedTags}
          newTagNames={newTagNames}
          onNewTagNamesChange={updateNewTagNames}
          onClose={() => setShowTagSelector(false)}
        />
      </Modal>

      <View className="footer">
        <View className="tag-show">
          <View style={{ display: 'flex', gap: '12px' }}>
            {selectedTags
              .map(tag => `#${tag.name}`)
              .map(item => (
                <View key={item}>{item}</View>
              ))}
            {newTagNames
              .map(name => `#${name}`)
              .map(item => (
                <View key={item}>{item}</View>
              ))}
          </View>
          <TagIcon
            size={1.4}
            type={showTagselector ? 'primary' : 'default'}
            onClick={() => setShowTagSelector(!showTagselector)}
          />
        </View>
        <SaveIcon onClick={handleSave} size={1.4} />
      </View>

      {/*  */}
    </View>
  );
}
