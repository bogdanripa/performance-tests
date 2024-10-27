import { GenezioDeploy, GenezioMethod } from "@genezio/types";
import { google } from 'googleapis';
import fetch from "node-fetch";

const SERVICE_ACCOUNT_FILE = './cs.json';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

// Load the service account credentials
const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_FILE,
  scopes: SCOPES,
});

const sheets = google.sheets({ version: 'v4', auth });

@GenezioDeploy()
export class BackendService {

  @GenezioMethod({ type: "cron", cronString: "*/20 * * * *" })
  async run(): Promise<void> {
    await this.testAllServices('Cold');
    await this.testAllServices('Warm');
    await this.testAllServices('Warm');
    await this.testAllServices('Warm');
  }
  
  private async testAllServices(range:string): Promise<void> {
    const promises = [];
    promises.push(this.test('AWS'));
    promises.push(this.test('AWS_PY'));
    promises.push(this.test('GENEZIO', 'DNS_JS'));
    promises.push(this.test('GENEZIO', 'IP_JS'));
    promises.push(this.test('GENEZIO', 'DNS_PY'));

    const times = await Promise.all(promises);
    const timesMap:any = {};
    times.forEach((time) => {
      timesMap[time.service] = time.time;
    });

    console.log(timesMap);

    try {
      await sheets.spreadsheets.values.append({
          spreadsheetId: SPREADSHEET_ID,
          range,
          valueInputOption: 'USER_ENTERED',
          insertDataOption: 'INSERT_ROWS',
          requestBody: {
              values: [
                  [this.toExcelDate(Date.now()), timesMap.AWS, timesMap.GENEZIO_DNS_JS, timesMap.GENEZIO_IP_JS, timesMap.AWS_PY, timesMap.GENEZIO_DNS_PY]
              ]
          }
      });
  
      console.log("Data added successfully");
    } catch (err) {
      console.error("Failed to append data", err);
    }
  }

  private async test(service: string, type:string|undefined=undefined): Promise<{service: string, time: number}> {
    let url = process.env[`${service}_URL`];
    if (!url) throw new Error(`${service} URL is not defined`);
    if (type)
      url += `?type=${type}`;
    const responseItime = await fetch(url)
    .then((res) => res.text())

    if (type) service = `${service}_${type}`;
    return {service, time: parseInt(responseItime)};
  }

  private toExcelDate(jsDate: number) {
    const excelEpoch = (new Date(1899, 11, 31)); // December 31, 1899
    const dayMilliseconds = 24 * 60 * 60 * 1000; // Total milliseconds in a day
  
    // Calculate difference in milliseconds and convert it to days
    const excelDate = (jsDate - excelEpoch.getTime()) / dayMilliseconds;
  
    // Add two days for the Excel leap year bug (Excel thinks 1900 was a leap year)
    return excelDate + 2;
  }
}
