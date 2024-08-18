import { isVizierContentRequestMessage, isVizierMessage } from './messages';

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (!isVizierMessage(request)) return;

  if (isVizierContentRequestMessage(request)) {
    const title = document.title;
    const content = document.body.innerText;

    sendResponse({
      type: '@nodm/vizier/content-response',
      data: { title, content },
    });
  }
});
