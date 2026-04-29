import { View, Text } from '@tarojs/components';
import { formatDate } from '../../utils/format';
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
