// ==UserScript==
// @name         FOFA Extract Hosts
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Extract hosts from FOFA search result
// @author       You
// @match        https://fofa.info/result?qbase64=*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  function findUrls() {
    const spans = document.querySelectorAll('span[data-clipboard-text]');
    const urls = new Set();

    for (const span of spans) {
      const style = window.getComputedStyle(span);
      if (style.display === 'none') continue;

      let text = span.dataset.clipboardText?.trim();
      if (!text) continue;

      // 去除 // 之前的部分
      const hostAndPath = text.includes('//')
        ? text.slice(text.lastIndexOf('//') + 2)
        : text;

      // 去除端口号
      const host = hostAndPath.split(':')[0];

      if (host) urls.add(host);
    }

    return urls.size > 0 ? [...urls].join('\n') + '\n' : '\n';
  }

  // 页面加载完成后执行
  setTimeout(() => {
    const result = findUrls();
    console.log('[FOFA Hosts Extracted]:\n', result);

    // 可选：弹出结果
    // alert('Extracted Hosts:\n' + result);

    // 可选：复制到剪贴板
    navigator.clipboard.writeText(result).then(() => {
      console.log('✅ Results copied to clipboard');
    });
  }, 2000); // 等待页面数据加载（可改为 MutationObserver 更精确）
})();
