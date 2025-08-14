// ==UserScript==
// @name         FOFA Extract Hosts & IPs
// @namespace    https://github.com/steven20027/tmscripts
// @version      1.1
// @description  Extract hosts and IPs from FOFA search result with smooth notification
// @author       You
// @match        https://fofa.info/result?qbase64=*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  /**
   * 提取 data-clipboard-text 中的 host（去协议、去端口）
   */
  function findUrls() {
    const spans = document.querySelectorAll(
      'span[data-clipboard-text]:not([style*="display: none"]):not([style*="display:none"])'
    );

    const values = Array.from(spans)
      .map((span) => {
        let text = span.dataset.clipboardText || "";

        const index = text.lastIndexOf("//");
        text = index >= 0 ? text.slice(index + 2) : text;
        return text.split(":")[0];
      })
      .filter((text) => text !== "") // 可选：去掉空字符串
      .filter((text, index, array) => array.indexOf(text) === index); // 去重

    return values;
  }

  /**
   * 提取 div.hsxa-meta-data-item > p:not(.hsxa-one-line) > a.hsxa-jump-a 的文本（IP）
   */
  function findIps() {
    const links = document.querySelectorAll(
      'div.hsxa-meta-data-item p:not(.hsxa-one-line) a[class="hsxa-jump-a"]'
    );
    const texts = [];
    for (const link of links) {
      const style = window.getComputedStyle(link);
      if (style.display === "none") continue; // 排除实际 display: none 的元素

      const text = link.textContent.trim();
      if (text && !texts.includes(text)) {
        texts.push(text);
      }
    }

    return texts;
  }

  /**
   * 显示美观的 toast 通知
   */
  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    Object.assign(toast.style, {
      position: "fixed",
      top: "20px",
      right: "50%",
      maxWidth: "90%",
      backgroundColor: type === "success" ? "#a7bcd1" : "#f44336",
      color: "white",
      padding: "12px 16px",
      borderRadius: "6px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      fontSize: "14px",
      zIndex: "999999",
      transition: "opacity 0.3s ease",
      fontFamily: "Arial, sans-serif",
      lineHeight: "1.4",
      wordBreak: "break-all",
    });

    toast.textContent = message;

    document.body.appendChild(toast);

    // 3.5 秒后淡出
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.5s ease";
      setTimeout(() => document.body.removeChild(toast), 500);
    }, 3500);
  }

  /**
   * 主执行函数
   */
  function extractAndCopy() {
    const hosts = findUrls();
    const ips = findIps();
    const allItems = [...hosts, ...ips];
    const result = allItems.join("\n");

    if (result) {
      navigator.clipboard.writeText(result).then(
        () => {
          const count = allItems.length;
          showToast(`已复制 ${count} 个地址到剪贴板！`, "success");
        },
        () => {
          showToast("复制失败，请手动复制。", "error");
        }
      );
    } else {
      showToast("未找到任何地址。", "error");
    }

    console.log("[FOFA Extracted]:\n", result);
  }

  /**
   * 使用 MutationObserver 监听页面内容加载
   */
  const observer = new MutationObserver((mutations, obs) => {
    // 尝试查找一个标志性元素，比如结果表格或分页控件
    const resultElements =
      document.querySelector(".hsxa-meta-data-item") ||
      document.querySelector("span[data-clipboard-text]");

    if (resultElements) {
      extractAndCopy();
      obs.disconnect(); // 执行一次后停止观察
    }
  });

  // 开始监听 body 的子元素和后代变化
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
