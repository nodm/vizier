import { useState } from 'react';
import vizierLogo from '/images/icon128.png';
import { isVizierContentResponseMessage } from './messages';

function App() {
  const [pageTitle, setPageTitle] = useState('');

  const handleContentRequest = async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
      });

      if (!tab.id) return;

      const response = await chrome.tabs.sendMessage(tab.id, {
        type: '@nodm/vizier/content-request',
      });

      if (!isVizierContentResponseMessage(response)) return;

      setPageTitle(response.data.title);
      console.log(response.data.content);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold">
        <img src={vizierLogo} alt="Vizier Chrome extension logo" /> Vizier
        Chrome extension
      </h1>
      <button
        className="relative bg-slate-900 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 text-sm text-white font-semibold h-12 px-6 rounded-lg flex items-center dark:bg-slate-700 dark:hover:bg-slate-600 transition-transform pointer-events-auto"
        onClick={handleContentRequest}
      >
        Request content
      </button>
      <h2 className="text-xl font-semibold">Page title: {pageTitle}</h2>
    </>
  );
}

export default App;
