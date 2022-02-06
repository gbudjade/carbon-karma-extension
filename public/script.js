const extractHostname = (url) => {
    let hostname = url.indexOf("//") > -1 ? url.split('/')[2] : url.split('/')[0];
  
    // find & remove port number
    hostname = hostname.split(':')[0];
    // find & remove "?"
    hostname = hostname.split('?')[0];
  
    return hostname;
  };
  
const setByteLengthPerOrigin = (origin, byteLength) => {
    const stats = localStorage.getItem('stats');
    const bytesPerMonth = localStorage.getItem('bytesPerMonth');
    const totalBytes = localStorage.getItem('totalBytes') || 0;
    const statsJson = null === stats ? {} : JSON.parse(stats);
    const bytesPerMonthJson = null === bytesPerMonth ? {} : JSON.parse(bytesPerMonth);

    const month = new Date().getMonth();

    let bytePerOrigin = undefined === statsJson[origin] ? 0 : parseInt(statsJson[origin]);
    let currentMonthBytes = undefined === bytesPerMonthJson[month] ? 0 : parseInt(bytesPerMonthJson[month]);
    statsJson[origin] = bytePerOrigin + byteLength;
    bytesPerMonthJson[month] = currentMonthBytes + byteLength;

    console.log(totalBytes);
    console.log(byteLength);
    console.log(bytesPerMonthJson[month]);
    const updatedTotal = Number(totalBytes) + Number(byteLength);
  
    localStorage.setItem('stats', JSON.stringify(statsJson));
    localStorage.setItem('bytesPerMonth', JSON.stringify(bytesPerMonthJson));
    localStorage.setItem('totalBytes', updatedTotal);
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
    let duration = localStorage.getItem('duration');
    duration = null === duration ? 1 : 1 * duration + 1;
    localStorage.setItem('duration', duration);
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
  
      if (!addOneMinuteInterval) {
        addOneMinuteInterval = setInterval(addOneMinute, 60000);
      }
  
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
  