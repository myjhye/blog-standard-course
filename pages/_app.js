// next.js에서 모든 페이지에 공통 적용되는 최상위 컴포넌트

import '../styles/globals.css'
import { UserProvider } from '@auth0/nextjs-auth0/client';

function MyApp({ Component, pageProps }) {

  // 커스텀 레이아웃
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <UserProvider>
      {getLayout(<Component {...pageProps} />, pageProps)}
    </UserProvider>
  )
}

export default MyApp
