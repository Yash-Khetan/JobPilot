import { chromium } from 'playwright';
import cosineSimilarity from "compute-cosine-similarity";
import generateEmbedding from '../job_matching/generate_embeddings.js';

export async function naukriScraper(role, location, skills_projects_embed) {
    const scrapeDoToken = process.env.SCRAPEDO_TOKEN;
    if (!scrapeDoToken) {
        throw new Error('[Naukri] SCRAPEDO_TOKEN is not set in environment variables');
    }

    const browser = await chromium.launch({
        headless: false,
        proxy: {
            server: 'http://proxy.scrape.do:8080',
            username: scrapeDoToken,
            password: '',
        },
        args: ['--ignore-certificate-errors'],
    });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        viewport: { width: 1366, height: 768 },
        ignoreHTTPSErrors: true,
    });
    const page = await context.newPage();

    try {
        const roleSlug = role.trim().toLowerCase().replace(/\s+/g, '-');
        const locationSlug = location.trim().toLowerCase().replace(/\s+/g, '-');

        console.log("formated the role adn the location");
        let page_count = 1;
        const url = `https://www.naukri.com/${roleSlug}-internship-jobs-in-${locationSlug}-${page_count}`;

        console.log(`[Naukri] Scraping: ${url}`);

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(5000);

        const tupleCount = await page.locator('.srp-jobtuple-wrapper').count();
        console.log(`[Naukri] Found ${tupleCount} job tuples on page`);

        // Extract job data from all job tuples on the page
        const extractedData = await page.$$eval('.srp-jobtuple-wrapper', (elements) => {
            return elements.map(el => {
                const tuple = el.querySelector('.cust-job-tuple');
                if (!tuple) return null;

                // Row 1: Title and link
                const titleAnchor = tuple.querySelector('h2 a.title');
                const jobRole = titleAnchor?.innerText?.trim() || "";
                const link = titleAnchor?.getAttribute('href') || "";

                // Row 2: Company name
                const company = tuple.querySelector('.comp-name')?.innerText?.trim() || "";

                // Row 3: Experience, Salary (if present), Location
                const experience = tuple.querySelector('.exp-wrap .exp span')?.innerText?.trim() || "";
                const salary = tuple.querySelector('.sal-wrap .sal span')?.innerText?.trim() || "";
                const jobLocation = tuple.querySelector('.loc-wrap .loc span')?.innerText?.trim() || "";

                // Row 4: Job description snippet
                const description = tuple.querySelector('.job-desc')?.innerText?.trim() || "";

                // Row 5: Skill tags
                const tagElements = tuple.querySelectorAll('.tags-gt .tag-li');
                const skills = Array.from(tagElements).map(t => t.innerText?.trim()).filter(Boolean);

                // Row 6: Posted date
                const postedDate = tuple.querySelector('.job-post-day')?.innerText?.trim() || "";

                return { jobRole, company, jobLocation, salary, experience, description, skills, link, postedDate };
            }).filter(Boolean);
        });

        console.log(`[Naukri] Extracted ${extractedData.length} job entries`);

        const jobs = [];

        for (const data of extractedData) {
            if (!data.jobRole || !data.link) continue;

            jobs.push({
                role: data.jobRole,
                company: data.company,
                location: data.jobLocation,
                stipend: data.salary || 'click on the link for more details!',
                description: data.description,
                link: data.link,
                source: 'naukri',
            });

        }
        return jobs;
    } finally {
        await browser.close();
    }
}