const DEFAULT_REQUEST_TIME_OUT = 15000;



function requestThrottleTime(retryCount) {

    throttleTime = 0;
    let randomDelay = Math.random() * 5000;
    switch (retryCount) {
        case 1:
            throttleTime = 1500 + randomDelay;
            break;
        case 2:
            throttleTime = 3000 + randomDelay;
            break;
        case 3:
            throttleTime = 4000 + randomDelay;
            break;
        case 4:
            throttleTime = 5000 + randomDelay;
            break;
        default:
            throttleTime = 5000 + randomDelay;
            break;

    }
    return throttleTime;

}

const reliableFetch = (URL, requestInit, callback, options) => {
    requestSender = new Promise((requestSuccess, requestRejecter) => {
        let count = 1;
        let enableRetry = options.enableRetry;
        let retryCount = options.retryCount ? options.retryCount : 1;
        let throttleEnable = options.backOff;

        const attempt = () => {
            reliableSender = new Promise((resolve, reject) => {
                requestProcessed = false;
                let requestTimer = setTimeout(() => {
                    if (enableRetry) {
                        requestProcessed = true;
                        reject('request timeout triggered');
                    }
                }, options.requestTimeout ? options.requestTimeout : DEFAULT_REQUEST_TIME_OUT);

                fetch(URL, requestInit).then((response) => {
                    return response.json()
                }).then((responseJson) => {
                    if (!requestProcessed) {
                        if (enableRetry)
                            clearTimeout(requestTimer);
                        resolve(responseJson);
                    }
                }).catch((error) => {
                    if (enableRetry)
                        clearTimeout(requestTimer);
                    reject(error);
                });
            });
            reliableSender.then((responseJson) => { requestSuccess(responseJson) }).catch((error) => {
                if (enableRetry && count <= retryCount) {
                    if (throttleEnable)
                        setTimeout(() => { attempt() }, requestThrottleTime(count++))
                } else {
                    requestRejecter('Request Failed | error : ' + error);
                }
            })
        }

        attempt();
    });

    requestSender.then((responseJson) => callback(responseJson, null)).catch((error) => {
        callback(null, error);
    });

}

module.exports = reliableFetch;