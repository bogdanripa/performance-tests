import https from 'https';

const withDNS = async (lang) => {
  console.log('START')
  const startTime = Date.now();
  const response = await fetch('https://' + process.env[`GENEZIO_CHILD_URL_${lang}`]);
  const fetchTime = Date.now() - startTime;
  if (!response.ok) {
    throw new Error('Network response was not ok ' + response.statusText);
  }
  console.log(`DONE in ${fetchTime}`);
  return {
    statusCode: 200,
    body: `${fetchTime}`
  };
}

const withoutDNS = async (lang) => {
  console.log('START')

  const options = {
    hostname: '162.19.138.177', // Replace with the IP address
    port: 443, // Use the correct port for HTTPS, typically 443
    path: '/', // Specify the endpoint path
    method: 'GET',
    rejectUnauthorized: false, // Ignore invalid or self-signed certificates
    headers: {
      'host': process.env[`GENEZIO_CHILD_URL_${lang}`]
    },
    servername: process.env[`GENEZIO_CHILD_URL_${lang}`]
  };

  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const request = https.request(options, (res) => {
      let data = '';
    
      // Accumulate data as it comes in
      res.on('data', (chunk) => {
        data += chunk;
      });
    
      // Log the response data once the entire response is received
      res.on('end', () => {
        const fetchTime = Date.now() - startTime;
        console.log(`DONE in ${fetchTime}`);
        console.log('Response:', data);
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
  let type = event.queryStringParameters?.type;
  let lang = type.replace(/.*_/, '');
  type = type.replace(/_.*/, '');
  if (type == 'DNS')
    return await withDNS(lang);
  else
    return await withoutDNS(lang);
}

//f2:             31e2ad04-1061-46a3-96f5-c1c081df329b.eu-central-1.cloud.genez.io
// child: https://8414bc61-6e26-4320-85c6-c332d704e4f8.eu-central-1.cloud.genez.io
// new child:     cb6484d6-29a0-4b0c-ac6c-dfcf6330e764.eu-central-1.cloud.genez.io
