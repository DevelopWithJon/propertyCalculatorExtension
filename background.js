chrome.tabs.onUpdated.addListener((tabId, tab) => {

  if (tab.url && tab.url.includes("realtor.com/realestateandhomes-detail")) {
    const queryParameters = tab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
    });
    console.log("msg sent!");
}
});

async function request(url) {
  response = await fetch(url);
  jsonResp = await response.json();
  await chrome.storage.local.set({'data': jsonResp})
  return response;
};

chrome.runtime.onMessage.addListener((obj, sender, sendResponse) => {
  const { from, subject, url } = obj;
  if (from === "content"){
    response = request(url)
    sendResponse({statusCode: 200});
  }
});
