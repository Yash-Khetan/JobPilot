from playwright.sync_api import sync_playwright

def internshala_scraper(role, location, stipend):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        role = role
        location= location
        stipend = stipend
        role_slug = role.strip().lower().replace(" ", "-")
        location_slug = location.strip().lower().replace(" ", "-")
        url = "https://internshala.com/internships"
        if not stipend:
            url += f"/{role_slug}-internship-in-{location_slug}/"
        else:
            url += f"/{role_slug}-internship-in-{location_slug}/stipend-{stipend}"
        print(url)

        page.goto(url)
        page.wait_for_timeout(2000)

        print("Requested:", url)
        print("Actual:", page.url)

        jobs = []

        cards = page.locator(".individual_internship").all()
        for card in cards: 
            role = card.locator("h2.job-internship-name a").inner_text()
            company = card.locator(".company-name").inner_text()
            location = card.locator(".locations a").inner_text()
            stipend = card.locator(".stipend").inner_text()
            description = card.locator(".about_job .text").inner_text()
            link = card.locator(".job-title-href").get_attribute("href")
            link = "https://internshala.com" + link
            jobs.append({
                "role" : role,
                "company": company,
                "location": location,
                "stipend": stipend,
                "description": description,
                "link": link
            })

        return jobs 

        browser.close()

