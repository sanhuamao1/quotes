import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Tags() {
  useLoad(() => {
    console.log('Tags page loaded.')
  })

  return (
    <View className='tags-page'>
      <Text className='title'>标签页</Text>
    </View>
  )
}
