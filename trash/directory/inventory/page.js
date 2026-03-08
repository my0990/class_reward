'use client'
import dynamic from 'next/dynamic'
const DynamicComponentWithNoSSR = dynamic(
    () => import('./components/inventoryTemplate'), // dynamic import 할 컴포넌트를 불러오고,
    { ssr: false } // SSR 옵션을 false로 설정해준다.
  )
export default async function Inventory(){

    return(
        <DynamicComponentWithNoSSR  />
    )
}