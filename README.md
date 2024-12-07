##FaaS Performance tests

This repo is the source for the performnce tests for FaaS systems running on Genezio, AWS, Azure, vercel and Netlify.

How it works:

In the server/backend.ts file we have a function (run) that is called every hour at :13. The run function calls the measuring function (aka parent) on each enironment - once for cold starts and then 3 more times to measure warm starts.

Each measuring function runs in the same infrastructure / datacente as the measured function (aka child).

The clild function is the one we measure. We measure its executin time from the parent function.

You can find an example of a parent function in the server/coldStartTest.mjs file. You will see that it has the most basic response.

You can find an example of a child function in the server/coldStartTestChild.mjs file. This function measures the execution time of the child function, and returns the number of milliseconds it took the child function to execute.

Lastly, in the server/backend.ts file we add the test results to a google sheet.

We run multiple type tests. From the most basic hello world tests written in NodeJS or Python (columnd B-F in the google sheet) to a more complex NextJS application (a non-cached blog frontend) - columns G-I.

You can find the test results here:
https://docs.google.com/spreadsheets/d/1jnAeCcZ4OS-qygXAWexjrJJ9RO9Eo8zJs1fPxTRSZvI/edit?gid=0#gid=0

The "Cold" sheet represent cold start times, while the Warm sheet represent the warm times.

If you want to run this test, you will have to deploy the needed functions on each platform, and add the corresponding URLs as env variables in this repo.
