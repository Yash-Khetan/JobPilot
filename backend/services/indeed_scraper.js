// import { chromium } from "playwright";
// import cosineSimilarity from "compute-cosine-similarity";
// import generateEmbedding from '../job_matching/generate_embeddings.js';

// export async function indeedScraper(role, location, skills_projects_embed) {
//     const browser = await chromium.launchPersistentContext('C:\\playwright', {
//         channel: 'chrome',  
//         headless: true,
//         viewport: null,
//     });

//     const role_slug = role.replaceAll(' ', '+');
//     const location_slug = location.replaceAll(' ', '+');

//     const page = await browser.newPage();
//     let pageCount = 0;
//     const jobs = [];

//     while (pageCount < 2) {
//         console.log('SCRAPING LIST ITEMS');
//         await page.goto(`https://www.indeed.com/jobs?q=${role_slug}&l=${location_slug}&radius=25&start=${pageCount * 10}`);
//         await page.waitForTimeout(10000);

//         const vacancies = await page.locator('.cardOutline').elementHandles();
//         for (const vacancy of vacancies) {
//             const item = {};
//             const titleEl = await vacancy.$('h2');
//             const linkEl = await vacancy.$('a');

//             item.Title = titleEl ? await titleEl.innerText() : '';
//             item.URL = linkEl ? 'https://www.indeed.com' + await linkEl.getAttribute('href') : '';

//             jobs.push(item);
//         }

//         pageCount++;
//     }

//     const allItems = [];
//     for (const job of jobs) {
//         console.log('SCRAPING DETAILS PAGE');

//         await page.goto(job.URL);
//         await page.waitForTimeout(2000);

//         const item = {
//             Title: job.Title,
//             CompanyName: '',
//             Location: '',
//             Stipend: '',
//             Description: '',
//         };

//         const companyName = page.getByTestId('inlineHeader-companyName');
//         if (await companyName.count() > 0) {
//             item.CompanyName = await companyName.innerText();
//         }

//         const companyLocation = page.getByTestId('inlineHeader-companyLocation');
//         if (await companyLocation.count() > 0) {
//             item.Location = await companyLocation.innerText();
//         }

//         const salaryInfo = page.getByTestId('jobsearch-OtherJobDetailsContainer');
//         if (await salaryInfo.count() > 0) {
//             item.Stipend = await salaryInfo.innerText();
//         }

//         const description = page.locator('#jobDescriptionText');
//         if (await description.count() > 0) {
//             item.Description = await description.innerText();
//         }

//         allItems.push(item);
//     }

//     await browser.close();
//     return allItems;
// }

// (async () => {
//     const jobs = await scrapeIndeed("backend developer", "mumbai");
//     console.log(JSON.stringify(jobs, null, 2));
// })();