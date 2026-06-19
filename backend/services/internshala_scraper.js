import { chromium } from 'playwright';
import cosineSimilarity from "compute-cosine-similarity";
import generateEmbedding from '../job_matching/generate_embeddings.js';

export async function internshalaScraper(role, location, stipend = null, skills_projects_embed) {
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

            // generate the embeddings for the description and role
            const jdText = (description || "") + " " + (jobRole || "");
            const jd_role_embeddings = await generateEmbedding(jdText);

            // cosine similarity between the skills and projects and the jd and role
            const similarity = cosineSimilarity(jd_role_embeddings, skills_projects_embed);

            console.log(`[Scraper] Similarity for ${jobRole} at ${company}: ${similarity.toFixed(2)}`);

            if (similarity > 0.60) {
                jobs.push({
                    role: jobRole,
                    company,
                    location: jobLocation,
                    stipend: jobStipend,
                    description,
                    link,
                    source: 'internshala',
                    similarityScore: similarity * 100
                });
            }
        }

        return jobs;

    } finally {
        await browser.close();
    }
}

