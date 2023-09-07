# Notion To Do
During my school semester's especially, I heavily rely on Notion to track all my due dates. Notion has many very lovely features for organizing tasks and I use it extensively for this purpose. The issue is, many times, I forget to check Notion and end up missing due dates or cutting them very close. However, I found that I check my messages the most often (mostly because my wife gets very upset when I don't respond to her texts in a timely manner). For this reason, I wrote this project to get my tasks from Notion and text me the upcoming deadlines for the week every morning at 7 am.

## How does it work?
1. Cron job scheduled on GitHub Actions to run this script every morning at 7 am
2. Notion API queries my to-do list on Notion to get all the incomplete tasks for the upcoming week (7 days)
3. The response is parsed to create an SMS string
4. Twilio API used to send me a text message