import { View, Text } from '@tarojs/components';
import './index.scss';

interface EmptyStateProps {
  title: string;
  description?: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View className="empty-state">
      <Text className="empty-title">{title}</Text>
      {description && <Text className="empty-desc">{description}</Text>}
    </View>
  );
}
