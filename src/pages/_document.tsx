import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document'

import { ColorModeScript } from '@chakra-ui/react'

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html>
        <Head>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <body>
          <ColorModeScript initialColorMode="dark" />

          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
