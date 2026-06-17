import { chromium } from 'playwright';

export async function internshalaScraper(role, location, stipend = null) {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
        const roleSlug = role.trim().toLowerCase().replace(/\s+/g, '-');
        const locationSlug = location.trim().toLowerCase().replace(/\s+/g, '-');

        let url = 'https://internshala.com/internships';
        if (!stipend) {
            url += `/${roleSlug}-internship-in-${locationSlug}/`;
        } else {
            url += `/${roleSlug}-internship-in-${locationSlug}/stipend-${stipend}`;
        }

        // Debug logs go to stderr so they don't pollute JSON output
        console.error(`Scraping: ${url}`);

        await page.goto(url);
        await page.waitForTimeout(2000);

        const jobs = [];
        const cards = await page.locator('.individual_internship').all();

        for (const card of cards) {
            const jobRole = await card.locator('h2.job-internship-name').innerText();
            const company = await card.locator('.company-name').innerText();
            const jobLocation = await card.locator('.locations a').innerText();
            const jobStipend = await card.locator('.stipend').innerText();
            const description = await card.locator('.about_job .text').innerText();
            let link = await card.locator('.job-title-href').getAttribute('href');
            link = 'https://internshala.com' + link;

            jobs.push({
                role: jobRole,
                company,
                location: jobLocation,
                stipend: jobStipend,
                description,
                link,
                source: 'internshala',
            });
        }

        return jobs;
    } finally {
        await browser.close();
    }
}

