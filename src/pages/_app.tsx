import type { AppProps } from 'next/app'

import { extendTheme, ThemeConfig, ChakraProvider } from '@chakra-ui/react'
import { ApolloProvider } from '@apollo/client'
import { useApollo } from '../lib/apollo'

const config: ThemeConfig = {
  initialColorMode: 'dark',
}
const extendedTheme = extendTheme({
  config,
  styles: {
    global: {
      html: {},
    },
  },
})

function MyApp({ Component, pageProps }: AppProps) {
  const apolloClient = useApollo(pageProps)
  return (
    <ChakraProvider theme={extendedTheme}>
      <ApolloProvider client={apolloClient}>
        <Component {...pageProps} />
      </ApolloProvider>
    </ChakraProvider>
  )
}
export default MyApp
