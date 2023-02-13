chrome.tabs.onUpdated.addListener((tabId, tab) => {
  console.log("test")

  if (tab.url && tab.url.includes("realtor.com/realestateandhomes-detail")) {
    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
      apikey: "test",
    });

    console.log("msg sent!");
}
});

async function request(url, subject) {
  let response;
  let jsonResp 

  await chrome.storage.local.clear();

  if (subject === "mortgage rate requests") {
  response = await fetch(url);
  jsonResp = await response.json();
  
  await chrome.storage.local.set({'json': jsonResp})
  }
  else if (subject === "estimate rent requests") {
    console.log(subject)
    response = await fetch(url);
    jsonResp = await response.json();
    
    await chrome.storage.local.set({data: jsonResp})
  }
  
};

chrome.runtime.onMessage.addListener((obj, sender, sendResponse) => {
  const { from, subject, url } = obj;
  if (from === "content" && (subject === "mortgage rate requests" || subject === "estimate rent requests")){
    response = request(url, subject);
    sendResponse({statusCode: 200});
  }
});
