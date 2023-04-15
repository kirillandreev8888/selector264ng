// ==UserScript==
// @name        ShikimoriAddToList
// @namespace   Violentmonkey Scripts
// @match       https://shikimori.one/*
// @match       https://shikimori.me/*
// @grant       none
// @version     1.3
// @author      uspdd
// @description 19.11.2022, 18:51:05
// @downloadURL https://raw.githubusercontent.com/kirillandreev8888/selector264ng/master/shikimori.user.js
// ==/UserScript==
window.addEventListener('load', function() {
  const interval = setInterval(() => {
    if (document.querySelector('.c-image .b-add_to_list')){
      clearInterval(interval);
      addButton();
    }
  }, 100);
}, false);

const addButton = () => {
  document.querySelector('.c-image .b-add_to_list').insertAdjacentHTML(
    'beforeend',
    `
      <br>
      <a style="margin-top: 0.5em !important" href="http://selector264.web.app/add?parseFromShikimori=${window.location.href}">
          <div class="trigger">
              <div class="text add-trigger"
                   data-status="planned">
                  <img height="25px"
                       width="25px"
                       src="https://selector264.web.app/assets/logo.svg"
                       style="
                      position: absolute;
                  "><span class="status-name"
                        data-text="Добавить в список"
                        style="
                      padding-left: 30px;
                  "></span>
              </div>
          </div>
      </a>
      `,
  );
}
