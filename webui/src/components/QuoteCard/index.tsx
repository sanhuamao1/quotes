import { View, Text } from '@tarojs/components';
import './index.scss';

interface Tag {
  id: string;
  name: string;
}

interface QuoteCardProps {
  content: string;
  tags?: Tag[];
  updatedAt?: string;
  onClick?: () => void;
  onTagClick?: (tag: Tag) => void;
  onLongPress?: () => void;
  size?: 'small' | 'default';
}

export default function QuoteCard({
  content,
  tags,
  updatedAt,
  onClick,
  onTagClick,
  onLongPress,
  size = 'default',
}: QuoteCardProps) {
  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
  };

  return (
    <View
      className={`quote-card ${size === 'small' ? 'small' : ''}`}
      onClick={onClick}
      onLongPress={onLongPress}
    >
      <Text className="quote-content">{content}</Text>
      {((tags && tags.length > 0) || updatedAt) && (
        <View className="quote-footer">
          <View className="quote-tags">
            {tags?.map(tag => (
              <View
                key={tag.id}
                className="quote-tag"
                onClick={e => {
                  e.stopPropagation();
                  onTagClick?.(tag);
                }}
              >
                <Text>#{tag.name}</Text>
              </View>
            ))}
          </View>
          {updatedAt && <Text className="quote-time">{formatDate(updatedAt)}</Text>}
        </View>
      )}
    </View>
  );
}
