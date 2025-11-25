const { app } = require('@azure/functions');
const https = require('https');
const { lookup } = require('dns').promises;

const test = async (lang) => {
  console.log('START ' + lang);
  let host, path;

  if (lang == 'JS') {
    host = 'genezio-performance-test-evgfc2cwacf9dkdy.westeurope-01.azurewebsites.net';
    path = '/api/child-js';
  } else if (lang == 'PY') {
    host = 'child-py-f7b0erepgyhbhmex.westeurope-01.azurewebsites.net';
    path = '/api/childpy?code=aCT-WRGeRXMO1zdId9f_MHaUL1jIESkT8zHqqc6Z_HaNAzFu0z_pLw==';
  }

  const hostIp = (await lookup(host)).address;
  console.log("IP Calling " + host + " / " + hostIp);

  const options = {
    hostname: hostIp,
    port: 443, // Use the correct port for HTTPS, typically 443
    path, // Specify the endpoint path
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
  });``
}

app.http('parent-js', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        let lang = request.query.get('lang');
        return await test(lang);
    }
});
