import {theme} from '@chakra-ui/theme'
import { ChakraProvider } from '@chakra-ui/provider'
import createCache from '@emotion/cache'
import {CacheProvider, ThemeProvider} from '@emotion/react'
import { renderToString } from 'react-dom/server'
import _ from 'lodash'
import TestComponent from './TestComponent'
const edgeCases = ['colors','transition']
const colorEdgeCase = ['white','black','current','transparent']

const getEdgeCaseThemeKeys = (cssVariable) => {
  if (colorEdgeCase.some((substring) => cssVariable.includes(substring))){
    const colorEdgeCaseRegEx =  /--chakra-colors-(\w+)\)/
    const edgeCase = cssVariable.match(colorEdgeCaseRegEx)
    return `colors.${edgeCase[1]}`
  }
  const themeKeyRegEx = /--chakra-(\w+)-(\w+)-(.*)\)/
  const matchGroups = cssVariable.match(themeKeyRegEx)
  
  const themeKeys = matchGroups.slice(1,4).join('.')
  return themeKeys
}
const replaceVariables = (cssText,theme) => {
  const cssVariables = getCSSVariables(cssText)

 
  for(let cssVariable of cssVariables) {
   
  
    const themeKeys = getThemeKeys(cssVariable)
    const value = getValue(themeKeys,theme)
    cssText = cssText.replaceAll(cssVariable,value)
  }
  return cssText
}
const getCSSVariables = (cssText) => {
  const CSSVariableRegEx = /var\([^)]*\)/g
  return Array.from(new Set(cssText.match(CSSVariableRegEx)))
  
}
const getValue = (themeKeys,theme)=> {

  const value = _.get(theme,themeKeys)

  return value
}
const getThemeKeys = (cssVariable) => {
  let themeKeys = ''
  if (edgeCases.some((substring) => cssVariable.includes(substring))) {
    themeKeys= getEdgeCaseThemeKeys(cssVariable)  
  } else {
    const themeKeyRegEx = /--chakra-(\w+)-(\w+)/
    const matchGroups = cssVariable.match(themeKeyRegEx)
    themeKeys = matchGroups.slice(1,3).join(".")
  }
 
  return themeKeys
}
const chakraParser = ({component}) => {
  
 
  const cache = createCache({key: 'static', speedy: false})
  let cssText = ""
  cache.sheet = {
    insert: (rule) => {
      cssText += rule;
    }}
  const html = renderToString(
    <CacheProvider value={cache}>
      <ChakraProvider theme={theme}>
        {component}
      </ChakraProvider>
    </CacheProvider>
  )
  
 

  console.log(theme)
  console.log(replaceVariables(cssText,theme))
  console.log(html)
  
  return (
    <ChakraProvider theme={theme}>
      {component}
    </ChakraProvider>
  )
}

export default chakraParser