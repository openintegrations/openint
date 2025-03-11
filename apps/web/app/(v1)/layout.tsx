import '@openint/ui-v1/global.css'

export default function RootLayoutV1({children}: {children: React.ReactNode}) {
  return (
    // TODO Fix hydration error rather than suppress warning
    // https://nextjs.org/docs/messages/react-hydration-error#solution-3-using-suppresshydrationwarning
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
      <body className="bg-transparent">{children}</body>
    </html>
  )
}
