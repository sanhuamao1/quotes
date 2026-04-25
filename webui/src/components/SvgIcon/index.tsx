import { Image, View, ViewProps } from '@tarojs/components';
import Taro from '@tarojs/taro';

export const COLORS = {
  primary: '#8b7355',
  light: '#f1e7dd',
  default: '#8a8a8a',
};

export type IconColor = keyof typeof COLORS;

export interface IconProps {
  type?: IconColor;
  size?: number;
  circleSize?: number;
  badge?: boolean;
  circle?: string;
  other?: object;
  style?: object;
  disabled?: boolean;
  onClick?: () => void;
}

// 定义一个名为 getColor 的函数，接收一个类型为 ColorType 的参数 type

const insertColor = (svgContent: string, color: string) => {
  const arr = svgContent.split(' ');
  arr.splice(1, 0, `fill="${color}"`);
  return arr.join(' ');
};

const svgToBase64 = (svgString: string) => {
  // 处理微信小程序兼容性问题
  const processedSvg = svgString.replace(/#/g, '%23').replace(/\n/g, '').replace(/\s+/g, ' ');

  return `data:image/svg+xml;utf8,${processedSvg}`;
};

const getColor = (type: IconColor) => {
  return COLORS[type];
};

const DynamicSvgIcon = (svgContent: string) => {
  return (props: IconProps & ViewProps) => {
    const {
      size = 1.3,
      circleSize = 2.4,
      type = 'primary',
      badge = false,
      circle,
      style = {},
      disabled = false,
      ...others
    } = props;

    const color = getColor(type);
    const coloredSvg = insertColor(svgContent, color);
    const src = svgToBase64(coloredSvg);

    return (
      <View
        className="dynamic-svg-icon"
        style={{
          ...(circle && {
            width: Taro.pxTransform(circleSize * 30),
            height: Taro.pxTransform(circleSize * 30),
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '50%',
            backgroundColor: getColor(circle as IconColor),
            boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
            ...(disabled && {
              opacity: 0.5,
            }),
          }),
          ...style,
        }}
        {...others}
      >
        {badge && <View className="badge"></View>}
        <Image
          src={src}
          style={{
            width: `${size * 16}px`,
            height: `${size * 16}px`,
          }}
        />
      </View>
    );
  };
};

export default DynamicSvgIcon;
