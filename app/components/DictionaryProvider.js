"use client";
import { createContext, useContext } from "react";

const DictionaryContext = createContext({});
export const useDictionary = () => useContext(DictionaryContext);

const LocaleConfigContext = createContext({});
export const useLocaleConfig = () => useContext(LocaleConfigContext);

export default function DictionaryProvider({ children, dictionary, localeConfig, locale }) {
  return (
    <DictionaryContext.Provider value={dictionary}>
      <LocaleConfigContext.Provider value={{ ...localeConfig, locale }}>
        {children}
      </LocaleConfigContext.Provider>
    </DictionaryContext.Provider>
  );
}
