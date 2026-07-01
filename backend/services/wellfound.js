import { chromium } from 'playwright';

export async function wellfound(role, location) {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
        let url = "";
        if (location == "remote") {
            url = 'https://wellfound.com/role/r'
        }
        else {
            url = 'https://wellfound.com/role/l';
        }
        const roleSlug = role.trim().toLowerCase().replace(/\s+/g, '-');
        const locationSlug = location.trim().toLowerCase().replace(/\s+/g, '-');
        if (location.toLowerCase() == "remote") {
            url = url + '/' + roleSlug;
        }
        else {
            url = url + '/' + roleSlug + '/' + locationSlug;
        }
        // Debug logs go to stderr so they don't pollute JSON output
        console.error(`Scraping: ${url}`);

        await page.goto(url);
        await page.waitForTimeout(2000);

        const jobs = [];
        const cards = await page.locator('.my-4.w-full').all();

        for (const card of cards) {
            const jobRole = await card.locator('a[href*="/jobs/"]').textContent();
            const company = await card.locator('h2').textContent();
            const jobLocation = await card.locator('span.pl-1.text-xs').nth(1).textContent();
            const jobStipend = await card.locator('span.pl-1.text-xs').first().textContent();
            let link = await card.locator('a[href*="/jobs/"]').getAttribute('href');
            link = `https://wellfound.com${link}`;
            const description = null

            jobs.push({
                role: jobRole,
                company,
                location: jobLocation,
                stipend: jobStipend,
                description,
                link,
                source: 'wellfound',
            });
        }

        return jobs;
    } finally {
        await browser.close();
    }
}

wellfound()