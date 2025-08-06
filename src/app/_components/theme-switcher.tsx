"use client";

import styles from "./switch.module.css";
import { memo, useEffect, useState } from "react";

declare global {
  var updateDOM: () => void;
}

type ColorSchemePreference = "system" | "dark" | "light";

const STORAGE_KEY = "nextjs-blog-starter-theme";
const modes: ColorSchemePreference[] = ["system", "dark", "light"];

/** function to be injected in script tag for avoiding FOUC (Flash of Unstyled Content) */
export const NoFOUCScript = (storageKey: string) => {
  /* can not use outside constants or function as this script will be injected in a different context */
  const [SYSTEM, DARK, LIGHT] = ["system", "dark", "light"];

  /** Modify transition globally to avoid patched transitions */
  const modifyTransition = () => {
    const css = document.createElement("style");
    css.textContent = "*,*:after,*:before{transition:none !important;}";
    document.head.appendChild(css);

    return () => {
      /* Force restyle */
      getComputedStyle(document.body);
      /* Wait for next tick before removing */
      setTimeout(() => document.head.removeChild(css), 1);
    };
  };

  const media = matchMedia(`(prefers-color-scheme: ${DARK})`);

  /** function to add remove dark class */
  window.updateDOM = () => {
    const restoreTransitions = modifyTransition();
    const mode = localStorage.getItem(storageKey) ?? SYSTEM;
    const systemMode = media.matches ? DARK : LIGHT;
    const resolvedMode = mode === SYSTEM ? systemMode : mode;
    const classList = document.documentElement.classList;
    if (resolvedMode === DARK) classList.add(DARK);
    else classList.remove(DARK);
    document.documentElement.setAttribute("data-mode", mode);
    restoreTransitions();
  };
  
  // 只设置媒体查询监听器，不立即执行DOM更新
  media.addEventListener("change", window.updateDOM);
};

let updateDOM: () => void;

/**
 * Switch button to quickly toggle user preference.
 */
const Switch = () => {
  const [mode, setMode] = useState<ColorSchemePreference>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 延迟挂载，确保客户端hydration完成
    const timer = setTimeout(() => {
      setMounted(true);
      
      // 从localStorage读取保存的主题
      const storedMode = localStorage.getItem(STORAGE_KEY) as ColorSchemePreference;
      if (storedMode && modes.includes(storedMode)) {
        setMode(storedMode);
      }

      // 确保updateDOM函数可用
      if (window.updateDOM) {
        updateDOM = window.updateDOM;
        // 首次调用updateDOM来设置正确的主题
        updateDOM();
      }

      // 监听存储变化（多标签页同步）
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === STORAGE_KEY && e.newValue) {
          setMode(e.newValue as ColorSchemePreference);
        }
      };
      
      addEventListener("storage", handleStorageChange);
      
      return () => {
        removeEventListener("storage", handleStorageChange);
      };
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // 只有在完全挂载后才更新localStorage和DOM
    if (mounted && updateDOM) {
      localStorage.setItem(STORAGE_KEY, mode);
      updateDOM();
    }
  }, [mode, mounted]);

  const handleModeSwitch = () => {
    const index = modes.indexOf(mode);
    setMode(modes[(index + 1) % modes.length]);
  };

  // 在未挂载时渲染一个简单的占位符，避免布局偏移
  return (
    <button
      className={styles.switch}
      onClick={mounted ? handleModeSwitch : undefined}
      disabled={!mounted}
      style={!mounted ? { opacity: 0.5 } : undefined}
    />
  );
};

const Script = memo(() => (
  <script
    dangerouslySetInnerHTML={{
      __html: `(${NoFOUCScript.toString()})('${STORAGE_KEY}')`,
    }}
  />
));

/**
 * This component which applies classes and transitions.
 */
export const ThemeSwitcher = () => {
  return (
    <>
      <Script />
      <Switch />
    </>
  );
};
