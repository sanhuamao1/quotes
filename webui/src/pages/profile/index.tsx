import { View, Text } from '@tarojs/components';
import { useState } from 'react';
import Taro, { useLoad } from '@tarojs/taro';
import { type Tag } from '../../types';
import Modal from '../../components/Modal';
import TagSelector from '../../components/TagSelector';
import { exportQuotes } from '../../request';
import './index.scss';

export default function Profile() {
  const [showExport, setShowExport] = useState(false);
  const [exportTags, setExportTags] = useState<Tag[]>([]);
  const [exporting, setExporting] = useState(false);

  useLoad(() => {
    console.log('Profile page loaded.');
  });

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const tagIds = exportTags.map(t => t.id);
      await exportQuotes(tagIds);
      setShowExport(false);
      setExportTags([]);
      Taro.showToast({ title: '导出成功', icon: 'success' });
    } catch {
      Taro.showToast({ title: '导出失败', icon: 'none' });
    } finally {
      setExporting(false);
    }
  };

  return (
    <View className="profile-page">
      <View className="config-section">
        <View className="config-list">
          <View className="config-item">
            <Text className="config-item__label">导入数据</Text>
            <Text className="config-item__arrow">›</Text>
          </View>
          <View className="config-item" onClick={() => setShowExport(true)}>
            <Text className="config-item__label">导出数据</Text>
            <Text className="config-item__arrow">›</Text>
          </View>
        </View>
      </View>

      <Modal visible={showExport} onClose={() => setShowExport(false)}>
        <TagSelector
          selectedTags={exportTags}
          onSelectedTagsChange={setExportTags}
          action="EXPORT"
          onClose={handleExport}
        />
      </Modal>
    </View>
  );
}
