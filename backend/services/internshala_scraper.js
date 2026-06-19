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
        const extractedData = await page.$$eval('.individual_internship', (elements) => {
            return elements.map(el => {
                const jobRole = el.querySelector('.job-internship-name')?.innerText?.trim() || "";
                const company = el.querySelector('.company-name')?.innerText?.trim() || "";
                const jobLocation = el.querySelector('.locations a, .location_link')?.innerText?.trim() || "";
                const jobStipend = el.querySelector('.stipend')?.innerText?.trim() || "";
                const description = el.querySelector('.about_job, .job-description, .detail-row-1')?.innerText?.trim() || "";
                const linkAttr = el.querySelector('.job-title-href')?.getAttribute('href');
                const link = linkAttr ? 'https://internshala.com' + linkAttr : "";
                
                return { jobRole, company, jobLocation, jobStipend, description, link };
            });
        });

        for (const data of extractedData) {
            if (!data.jobRole || !data.link) continue;

            // generate the embeddings for the description and role
            const jdText = `${data.description} ${data.jobRole} ${data.company}`;
            const jd_role_embeddings = await generateEmbedding(jdText);

            // cosine similarity between the skills and projects and the jd and role
            const similarity = cosineSimilarity(jd_role_embeddings, skills_projects_embed);

            console.log(`[Scraper] Similarity for ${data.jobRole} at ${data.company}: ${similarity.toFixed(2)}`);

            if (similarity > 0.60) {
                jobs.push({
                    role: data.jobRole,
                    company: data.company,
                    location: data.jobLocation,
                    stipend: data.jobStipend,
                    description: data.description,
                    link: data.link,
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

