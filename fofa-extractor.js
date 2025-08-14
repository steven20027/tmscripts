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

  function findUrls(){
		const spans = document.querySelectorAll('span[data-clipboard-text]:not([style*="display: none"]):not([style*="display:none"])');

		const values = Array.from(spans)
		  .map(span => {
			let text = span.dataset.clipboardText || '';

			const index = text.lastIndexOf('//');
			text = index >= 0 ? text.slice(index + 2) : text;
			return text.split(':')[0];
		  })
		  .filter(text => text !== '')  // 可选：去掉空字符串
		  .filter((text, index, array) => array.indexOf(text) === index); // 去重

		return result;
	}

	function findIps() {
		const links = document.querySelectorAll('div.hsxa-meta-data-item p:not(.hsxa-one-line) a[class="hsxa-jump-a"]');
		const texts = [];
		for (const link of links) {
		  const style = window.getComputedStyle(link);
		  if (style.display === 'none') continue; // 排除实际 display: none 的元素

		  const text = link.textContent.trim();
		  if (text && !texts.includes(text)) {
			texts.push(text);
		  }
		}

		return result;
	}

  // 页面加载完成后执行
  setTimeout(() => {
    const result = [...findUrls(), ...findIps()].join('\n') ;
    console.log('[FOFA Hosts Extracted]:\n', result);

    // 可选：弹出结果
    // alert('Extracted Hosts:\n' + result);

    // 可选：复制到剪贴板
    navigator.clipboard.writeText(result).then(() => {
      console.log('✅ Results copied to clipboard');
    });
  }, 2000); // 等待页面数据加载（可改为 MutationObserver 更精确）
})();
