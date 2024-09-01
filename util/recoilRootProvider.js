'use client'

import { RecoilRoot } from 'recoil'
export default function RecoilRootProvider({children}
) {
    return <RecoilRoot>{children}</RecoilRoot>
}