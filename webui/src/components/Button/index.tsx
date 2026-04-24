import { View, Text } from "@tarojs/components";
import "./index.scss";

interface ButtonProps {
  /** 按钮类型，默认为 primary */
  type?: "primary" | "default" | "ghost";
  /** 按钮宽度（rpx 或 px） */
  width?: string | number;
  /** 按钮高度（rpx 或 px） */
  height?: string | number;
  /** 点击事件 */
  onClick?: () => void;
  /** 子元素 */
  children: React.ReactNode;
  /** 禁用状态 */
  disabled?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 圆形按钮 */
  circle?: boolean;
}

export default function Button({
  type = "primary",
  width,
  height,
  onClick,
  children,
  disabled = false,
  className = "",
  circle = false,
}: ButtonProps) {
  const style: React.CSSProperties = {};

  if (width !== undefined) {
    style.width = typeof width === "number" ? `${width}rpx` : width;
  }
  if (height !== undefined) {
    style.height = typeof height === "number" ? `${height}rpx` : height;
  }

  return (
    <View
      className={`btn btn--${type}${circle ? " btn--circle" : ""}${disabled ? " btn--disabled" : ""} ${className}`}
      style={style}
      onClick={disabled ? undefined : onClick}
    >
      <Text className="btn__text">{children}</Text>
    </View>
  );
}
