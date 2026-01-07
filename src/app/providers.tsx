"use client";

import React from "react";
import { Provider } from "react-redux";
import { ConfigProvider, theme as antdTheme } from "antd";
import esES from "antd/locale/es_ES";
import enUS from "antd/locale/en_US";
import { I18nextProvider } from "react-i18next";

import { store } from "@/app/store";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { selectThemeMode, selectLang, uiActions } from "@/app/store/slices/uiSlice";
import { authActions } from "@/app/store/slices/authSlice";

import { i18n, initI18n } from "@/app/lib/i18n";
import GlobalLoading from "@/app/components/GlobalLoading";

function Inner({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectThemeMode); // "light" | "dark"
  const lang = useAppSelector(selectLang); // "es" | "en"

  // 1) Init i18n + hydrate ui/auth
  React.useEffect(() => {
    initI18n();

    if (typeof window !== "undefined") {
      try {
        const uiRaw = localStorage.getItem("ui");
        if (uiRaw) dispatch(uiActions.hydrate(JSON.parse(uiRaw)));

        const authRaw = localStorage.getItem("auth");
        if (authRaw) dispatch(authActions.hydrate(JSON.parse(authRaw)));
      } catch {
        // ignore
      }
    }
  }, [dispatch]);

  // 2) Keep i18n in sync with redux lang
  React.useEffect(() => {
    const run = async () => {
      initI18n();
      await i18n.changeLanguage(lang);
      if (typeof document !== "undefined") document.documentElement.lang = lang;
    };
    run();
  }, [lang]);

  // 3) Persist ui changes (lang/theme) so refresh keeps it
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("ui", JSON.stringify({ lang, theme: mode }));
  }, [lang, mode]);

  const algorithm = mode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm;
  const antdLocale = lang === "es" ? esES : enUS;

  return (
    <I18nextProvider i18n={i18n}>
      <ConfigProvider
        locale={antdLocale}
        theme={{
          algorithm,
          token: { colorPrimary: "#7C3AED", borderRadius: 12 },
        }}
      >
        <GlobalLoading />
        {children}
      </ConfigProvider>
    </I18nextProvider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <Inner>{children}</Inner>
    </Provider>
  );
}
