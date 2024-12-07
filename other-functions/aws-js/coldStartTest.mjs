import https from 'https';
import { lookup } from 'dns/promises';

const test = async (lang) => {
  console.log('START ' + lang);
  let host;

  if (lang == 'JS')
    host = 'vazbq2drvs2sqeqykso4yaprme0lagcc.lambda-url.eu-central-1.on.aws';
  else if (lang == 'PY')
    host = 'hkb5yvsujlc3audtlnsqnw7m4i0bprbt.lambda-url.eu-central-1.on.aws';

  const hostIp = (await lookup(host)).address;
  console.log("IP Calling " + host + " / " + hostIp);

  const options = {
    hostname: hostIp,
    port: 443, // Use the correct port for HTTPS, typically 443
    path: '/', // Specify the endpoint path
    method: 'GET',
    rejectUnauthorized: false, // Ignore invalid or self-signed certificates
    headers: {
      'host': host
    },
    servername: host
  };

  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const request = https.request(options, (res) => {
    
      // Accumulate data as it comes in
      res.on('data', () => {});
    
      // Log the response data once the entire response is received
      res.on('end', () => {
        const fetchTime = Date.now() - startTime;
        console.log(`DONE in ${fetchTime}`);
        resolve({
          statusCode: 200,
          body: `${fetchTime}`
        });
      });
    });
  
    // Log errors if they occur
    request.on('error', (error) => {
      console.log(error);
      reject({
        statusCode: 500,
        body: JSON.stringify({
          message: 'Request failed',
          error: error.toString()
        })
      })
    });

    // Send the request
    request.end();
  });
}

export const handler = async (event, context) => {
  let lang = event.queryStringParameters?.lang;
  return await test(lang);
}
