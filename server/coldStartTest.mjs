export const handler = async (event, context) => {
    console.log('START')
    const startTime = Date.now();
    const response = await fetch(process.env.GENEZIO_CHILD_URL);
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
  