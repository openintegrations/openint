import '@openint/ui-v1/global.css'

export default function RootLayoutV1({children}: {children: React.ReactNode}) {
  // should this have a theme provivder?
  //    <ThemeProvider
  //    attribute="class"
  //    defaultTheme="system"
  //    enableSystem
  //    disableTransitionOnChange>
  //    {children}
  //  </ThemeProvider>

  // TODO Fix hydration error rather than suppress warning
  // https://nextjs.org/docs/messages/react-hydration-error#solution-3-using-suppresshydrationwarning

  return (
    <html
      lang="en"
      suppressHydrationWarning
      // This is the same as :root {} in css. However using :root {} from elsewhere allows for
      // better encapsulation
      // style={{
      //   '--background': '0deg 74.36% 26.56%',
      // }}
    >
      <head></head>
      <body className="bg-background">{children}</body>
    </html>
  )
}
