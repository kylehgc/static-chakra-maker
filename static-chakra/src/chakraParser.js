import {theme} from '@chakra-ui/theme'
import { ChakraProvider } from '@chakra-ui/provider'
import createCache from '@emotion/cache'
import {CacheProvider, ThemeProvider} from '@emotion/react'
import { renderToString } from 'react-dom/server'
import _ from 'lodash'
import TestComponent from './TestComponent'
import { anatomy }  from "@chakra-ui/theme-tools"

const edgeCases = ['colors','transition']
const colorEdgeCase = ['white','black','current','transparent']

// Given an object like { "colors": { "gray":{ 500: leaf }},
// Give me back an array of objects containing leaves 
// and paths to the leaf, dash-separated.
// Ex: leaves = [{ "leaf": "#0000", "path": "colors-gray-500"}]
// 
// for leafObj in leaves:
//   cssString.replaceAll("var(--chakra-" + leafObj.path + ")", leafObj.leaf)





const getEdgeCaseThemeKeys = (cssVariable) => {
  if (colorEdgeCase.some((substring) => cssVariable.includes(substring))){
    const colorEdgeCaseRegEx =  /--chakra-colors-(\w+)\)/
    const edgeCase = cssVariable.match(colorEdgeCaseRegEx)
    return `colors.${edgeCase[1]}`
  }
  const themeKeyRegEx = /--chakra[-(\w+)]+\)/g
  const matchGroups = cssVariable.match(themeKeyRegEx)
  
  const themeKeys = matchGroups.slice(1).join('.')
  return themeKeys
}
const replaceVariables = (cssText,theme,objectPairs) => {
  const cssVariables = getCSSVariables(cssText)
  console.log("css variables", cssVariables)
 
  for(let cssVariable of cssVariables) {
   
    
    console.log(cssVariable)
    const value = getValue(cssVariable,objectPairs)
    
    cssText = cssText.replaceAll(cssVariable, value)
  }
  return cssText
}
const getCSSVariables = (cssText) => {
  const CSSVariableRegEx = /var\([^)]*\)/g
  return Array.from(new Set(cssText.match(CSSVariableRegEx)))
  
}
const getValue = (cssVariable,objectPairs)=> {
  const valueKey = cssVariable.slice(4,cssVariable.length-1)
  console.log(valueKey)
  const value = objectPairs[valueKey] 
  console.log(value)
  return value
}
const getThemeKeys = (cssVariable) => {
  let themeKeys
  if (edgeCases.some((substring) => cssVariable.includes(substring))) {
    themeKeys = getEdgeCaseThemeKeys(cssVariable)  
  } else {
    const themeKeyRegEx = /--chakra-(\w+)-(\w+)/
    const matchGroups = cssVariable.match(themeKeyRegEx)

    
    //We need the match groups only.  The first element in a 0 indexed array is the full string
    //We need to create a key.key string of the themekeys so lodash can access the properties
    themeKeys = matchGroups.slice(1).join(".")
  }
 
  return themeKeys
}



const getObjectPairs = (pathSoFar, property) => {
  let results ={}
  
  for(const key of Object.keys(property)){
    if(Array.isArray(property[key])) {
      Object.assign(results,{[pathSoFar+"-"+key]: property[key] })
    } else if(typeof property[key] !== 'object' && property[key] !== null) {
  
      Object.assign(results,{[pathSoFar+"-"+key]: property[key] })
    } else {
      Object.assign(results,getObjectPairs(pathSoFar+"-"+key,property[key]))
    }
    
    
  }
  return results
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
  
 
  const objectPairs = getObjectPairs("--chakra",theme)

 
  console.log(replaceVariables(cssText,theme,objectPairs))
  console.log(html)
  
  return (
    <ChakraProvider theme={theme}>
      {component}
    </ChakraProvider>
  )
}

export default chakraParser