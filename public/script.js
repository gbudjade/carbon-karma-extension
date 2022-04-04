const extractHostname = (url) => {
    let hostname = url.indexOf("//") > -1 ? url.split('/')[2] : url.split('/')[0];
  
    // find & remove port number
    hostname = hostname.split(':')[0];
    // find & remove "?"
    hostname = hostname.split('?')[0];
  
    return hostname;
  };
  
const setByteLengthPerOrigin = (origin, byteLength) => {
    chrome.storage.local.get(['stats', 'bytesPerYear', 'totalBytes'], function(items) {
        console.log('Settings retrieved', items);
        const stats = items.stats || null;
        const bytesPerYear = items.bytesPerYear || null;
        const totalBytes = items.totalBytes || 0;
        const statsJson = null === stats ? {} : JSON.parse(stats);
        const bytesPerYearJson = null === bytesPerYear ? {} : JSON.parse(bytesPerYear);

        const year = new Date().getFullYear();

        let bytePerOrigin = undefined === statsJson[origin] ? 0 : parseInt(statsJson[origin]);
        let currentYearBytes = undefined === bytesPerYearJson[year] ? 0 : parseInt(bytesPerYearJson[year]);
        statsJson[origin] = bytePerOrigin + byteLength;
        bytesPerYearJson[year] = currentYearBytes + byteLength;

        console.log(totalBytes);
        console.log(byteLength);
        console.log(bytesPerYearJson[year]);
        const updatedTotal = Number(totalBytes) + Number(byteLength);
        chrome.storage.local.set({'stats': JSON.stringify(statsJson), 'bytesPerYear': JSON.stringify(bytesPerYearJson), 'totalBytes': updatedTotal}, function() {
            console.log('Settings saved');
        });
      });

    // const stats = localStorage.getItem('stats');
    // const bytesPerYear = localStorage.getItem('bytesPerYear');
    // const totalBytes = localStorage.getItem('totalBytes') || 0;
    // localStorage.setItem('stats', JSON.stringify(statsJson));
    // localStorage.setItem('bytesPerYear', JSON.stringify(bytesPerYearJson));
    // localStorage.setItem('totalBytes', updatedTotal);
  };
  
const isChrome = () => {
    return (typeof(browser) === 'undefined');
  };
  
  const headersReceivedListener = (requestDetails) => {
    if (isChrome()) {
       const origin = extractHostname(!requestDetails.initiator ? requestDetails.url : requestDetails.initiator);
       const responseHeadersContentLength = requestDetails.responseHeaders.find(element => element.name.toLowerCase() === "content-length");
       const contentLength = undefined === responseHeadersContentLength ? {value: 0}
        : responseHeadersContentLength;
       const requestSize = parseInt(contentLength.value, 10);
       setByteLengthPerOrigin(origin, requestSize);
  
       return {};
    }
  
    let filter = browser.webRequest.filterResponseData(requestDetails.requestId);
  
    filter.ondata = event => {
      const origin = extractHostname(!requestDetails.originUrl ? requestDetails.url : requestDetails.originUrl);
      setByteLengthPerOrigin(origin, event.data.byteLength);
  
      filter.write(event.data);
    };
  
    filter.onstop = () => {
      filter.disconnect();
    };
  
    return {};
  };
  
  const setBrowserIcon = (type) => {
    // chrome.browserAction.setIcon({path: `icons/icon-${type}-48.png`});
  };
  
  const addOneMinute = () => {
    // let duration = localStorage.getItem('duration');
    // duration = null === duration ? 1 : 1 * duration + 1;
    // localStorage.setItem('duration', duration);
  };
  
  let addOneMinuteInterval;
  
  const handleMessage = (request) => {
    if ('start' === request.action) {
      setBrowserIcon('on');
  
      chrome.webRequest.onHeadersReceived.addListener(
        headersReceivedListener,
        {urls: ['<all_urls>']},
        ['responseHeaders']
      );
  
    //   if (!addOneMinuteInterval) {
    //     addOneMinuteInterval = setInterval(addOneMinute, 60000);
    //   }
  
      return;
    }
  
    if ('stop' === request.action) {
      setBrowserIcon('off');
      chrome.webRequest.onHeadersReceived.removeListener(headersReceivedListener);
  
      if (addOneMinuteInterval) {
        clearInterval(addOneMinuteInterval);
        addOneMinuteInterval = null;
      }
    }
  };
  
  chrome.runtime.onMessage.addListener(handleMessage);
  