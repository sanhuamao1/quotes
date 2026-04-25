import { View } from '@tarojs/components';
import './index.scss';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ visible, onClose, children }: ModalProps) {
  if (!visible) return null;

  return (
    <View className="modal-overlay" onClick={onClose}>
      <View className="modal-container" onClick={e => e.stopPropagation()}>
        {children}
      </View>
    </View>
  );
}
