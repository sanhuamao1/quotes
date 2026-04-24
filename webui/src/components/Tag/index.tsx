import { View, Text } from "@tarojs/components";
import "./index.scss";

interface TagProps {
  name: string;
  selected?: boolean;
  checked?: boolean;
  onClick?: () => void;
}

export default function Tag({
  name,
  selected = false,
  checked = false,
  onClick,
}: TagProps) {
  return (
    <View
      className={`tag-pill ${checked ? "tag-pill--checked" : ""} ${selected ? "tag-pill--selected" : ""}`}
      onClick={onClick}
    >
      <Text className="tag-pill-text">#{name}</Text>
    </View>
  );
}
