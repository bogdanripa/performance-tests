import https from 'https';
import { lookup } from 'dns/promises';

const test = async (lang) => {
  console.log('START ' + lang);
  const host = process.env[`GENEZIO_CHILD_URL_${lang}`];
  const hostIp = (await lookup(host)).address;
  console.log("Calling " + host + " / " + hostIp);

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