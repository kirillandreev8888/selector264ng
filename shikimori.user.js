// ==UserScript==
// @name        ShikimoriAddToList
// @namespace   Violentmonkey Scripts
// @match       https://shikimori.one/*
// @match       https://shikimori.io/*
// @match       https://shikimori.me/*
// @grant       none
// @version     1.4
// @author      uspdd
// @description 16.06.2026, 15:13:26
// @downloadURL https://raw.githubusercontent.com/kirillandreev8888/selector264ng/master/shikimori.user.js
// @run-at      document-start
// ==/UserScript==

(function() {
  'use strict';

  const addButton = (target) => {
    if (target.querySelector('.my-custom-selector-btn')) return;

    const cleanUrl = encodeURIComponent(window.location.href);

    target.insertAdjacentHTML(
      'beforeend',
      `
      <br class="my-custom-selector-btn">
      <a class="my-custom-selector-btn" style="margin-top: 0.5em !important; display: block;" target="_blank" href="http://selector264.web.app/add?parseFromShikimori=${cleanUrl}">
          <div class="trigger">
              <div class="text add-trigger" data-status="planned">
                  <img height="25px" width="25px" src="https://selector264.web.app/assets/logo.svg" style="position: absolute;">
                  <span class="status-name" data-text="Добавить в список" style="padding-left: 30px;"></span>
              </div>
          </div>
      </a>
      `
    );
  };

  const observer = new MutationObserver(() => {
    const target = document.querySelector('.c-image .b-add_to_list');
    if (target) {
      addButton(target);
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
