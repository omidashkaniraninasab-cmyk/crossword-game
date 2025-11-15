export const metadata = {
  title: 'Crossword Game',
  description: 'یک بازی کراسورد سرور-محور',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  )
}