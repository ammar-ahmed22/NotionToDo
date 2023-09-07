import dotenv from 'dotenv';
dotenv.config();
import { Client } from '@notionhq/client';
import { isFullPage, isFullDatabase } from '@notionhq/client';
import { PageObjectResponse, QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints';
import { add } from "date-fns"
import { parseResults, constructMessage } from './helpers';
import client from "twilio";

const notion = new Client({
  auth: process.env.NOTION_TOKEN
});

const twilio = client(process.env.TW_ACCOUNT_SID, process.env.TW_AUTH_TOKEN);

type FilterType = QueryDatabaseParameters["filter"];

const filter: FilterType = {
  and: [
    {
      property: "Due Date",
      date: {
        next_week: {}
      }
    },
    {
      property: "Deliverable",
      checkbox: {
        equals: true
      }
    },
    {
      property: "Status",
      status: {
        does_not_equal: "Done"
      }
    }
  ],
};

( async () => {
  const resp = await notion.databases.query({
    database_id: process.env.DATABASE_ID as string,
    filter,
  })

  const pageObjects: PageObjectResponse[] = [];
  resp.results.forEach(val => {
    if (val.object === "page" && isFullPage(val)) pageObjects.push(val);
  })

  const todos = parseResults(pageObjects);
  console.log(constructMessage(todos));
  await twilio.messages.create({
    body: constructMessage(todos),
    from: process.env.TW_PH_NUM,
    to: "+14168364386"
  });
})()