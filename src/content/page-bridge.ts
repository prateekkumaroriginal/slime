const PAGE_CLICK_EVENT = 'slime:page-click';

document.addEventListener(PAGE_CLICK_EVENT, (event) => {
  const { selector } = (event as CustomEvent<{ selector?: unknown }>).detail;
  if (typeof selector !== 'string') return;

  try {
    const element = document.querySelector(selector);
    if (element instanceof HTMLElement) {
      element.click();
    }
  } catch {
    // The isolated content script validates the selector before dispatching.
  }
});
