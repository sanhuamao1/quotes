import { useState } from 'react';
import { View, Text } from '@tarojs/components';
import { useFilterStore } from '../../../store/useFilterStore';
import TagSelector from '../../../components/TagSelector';
import Modal from '../../../components/Modal';
import { TagIcon, CloseIcon } from '../../../components/SvgIcon';
import './index.scss';

export const TagSelectorButton = () => {
  const { filteredTags, updateFilteredTags } = useFilterStore();
  const [showModal, setShowModal] = useState(false);
  const tagCount = filteredTags.length;
  const handleClear = () => { updateFilteredTags([]); };

  const renderContent = () => {
    if (tagCount === 0) {
      return <Text className="tag-selector-btn__text">标签</Text>;
    }

    const displayText = filteredTags.slice(0, 2).map(tag => `#${tag.name}`);
    return (
      <>
        {displayText.map(text => (
          <Text key={text} className="tag-selector-btn__text">{text}</Text>
        ))}
        {tagCount > 2 && (
          <View className="tag-selector-btn__badge">
            <Text className="tag-selector-btn__badge-text">{tagCount}</Text>
          </View>
        )}
      </>
    );
  };

  return (
    <View className="tag-selector-wrapper">
      <View
        className={`tag-selector-btn ${tagCount > 0 ? 'tag-selector-btn--active' : ''}`}
        onClick={() => setShowModal(true)}
      >
        <TagIcon type={tagCount > 0 ? 'light' : 'default'} size={1} />
        {renderContent()}
      </View>
      {tagCount > 0 && <CloseIcon onClick={handleClear} />}

      <Modal visible={showModal} onClose={() => setShowModal(false)}>
        <TagSelector
          selectedTags={filteredTags}
          onSelectedTagsChange={updateFilteredTags}
          action="SEARCH"
          onClose={() => setShowModal(false)}
        />
      </Modal>
    </View>
  );
};

export default TagSelectorButton;