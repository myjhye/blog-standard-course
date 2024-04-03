/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // tailwind css 적용할 파일 지정
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    // 'src' 디렉토리 사용 시 아래 경로도 포함
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    // tailwind 기본 테마 설정 확장
    extend: {
      fontFamily: {
        // 본문용 폰트, 헤딩용 폰트 설정 - css 변수 연결
        body: 'var(--font-dm-sans)',
        heading: 'var(--font-dm-serif)',
      },
    },
  },
  plugins: [],
};
