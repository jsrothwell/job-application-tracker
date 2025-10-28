// Script to generate 500 sample job applications for testing pagination and visualization

const companies = [
  "Google",
  "Microsoft",
  "Apple",
  "Amazon",
  "Meta",
  "Netflix",
  "Tesla",
  "Spotify",
  "Uber",
  "Airbnb",
  "Stripe",
  "Figma",
  "Notion",
  "Slack",
  "Discord",
  "Zoom",
  "Dropbox",
  "Adobe",
  "Salesforce",
  "Oracle",
  "IBM",
  "Intel",
  "NVIDIA",
  "AMD",
  "Qualcomm",
  "Cisco",
  "VMware",
  "ServiceNow",
  "Snowflake",
  "Databricks",
  "Palantir",
  "Coinbase",
  "Square",
  "PayPal",
  "Shopify",
  "Twilio",
  "MongoDB",
  "Atlassian",
  "Zendesk",
  "HubSpot",
  "Okta",
  "Cloudflare",
  "Fastly",
  "Vercel",
  "GitHub",
  "GitLab",
  "Docker",
  "Kubernetes",
  "Red Hat",
  "Canonical",
  "Elastic",
  "Splunk",
  "New Relic",
  "Datadog",
  "PagerDuty",
  "Sentry",
  "Auth0",
  "Firebase",
  "Supabase",
  "PlanetScale",
  "Neon",
  "Upstash",
  "Railway",
  "Render",
  "Fly.io",
  "Heroku",
  "DigitalOcean",
  "Linode",
  "Vultr",
  "AWS",
  "Azure",
  "GCP",
  "Cloudinary",
  "Algolia",
  "Segment",
  "Mixpanel",
  "Amplitude",
  "Hotjar",
  "Intercom",
  "Crisp",
  "Linear",
  "Asana",
  "Monday.com",
  "Trello",
  "Jira",
  "Confluence",
  "Miro",
  "Figma",
  "Sketch",
  "InVision",
  "Framer",
  "Webflow",
  "Squarespace",
  "Wix",
  "WordPress",
  "Ghost",
  "Medium",
  "Substack",
  "ConvertKit",
  "Mailchimp",
]

const jobTitles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Software Engineer",
  "Senior Software Engineer",
  "Staff Software Engineer",
  "Principal Software Engineer",
  "Engineering Manager",
  "Senior Engineering Manager",
  "Director of Engineering",
  "VP of Engineering",
  "CTO",
  "Lead Developer",
  "Senior Developer",
  "Junior Developer",
  "React Developer",
  "Vue Developer",
  "Angular Developer",
  "Node.js Developer",
  "Python Developer",
  "Java Developer",
  "C# Developer",
  "Go Developer",
  "Rust Developer",
  "PHP Developer",
  "Ruby Developer",
  "Swift Developer",
  "Kotlin Developer",
  "Flutter Developer",
  "React Native Developer",
  "iOS Developer",
  "Android Developer",
  "DevOps Engineer",
  "Site Reliability Engineer",
  "Platform Engineer",
  "Infrastructure Engineer",
  "Cloud Engineer",
  "Security Engineer",
  "Data Engineer",
  "Machine Learning Engineer",
  "AI Engineer",
  "Data Scientist",
  "Product Manager",
  "Senior Product Manager",
  "Principal Product Manager",
  "VP of Product",
  "Product Owner",
  "UX Designer",
  "UI Designer",
  "Product Designer",
  "Senior Designer",
  "Design Lead",
  "Creative Director",
  "QA Engineer",
  "Test Engineer",
  "Automation Engineer",
  "Performance Engineer",
  "Release Engineer",
  "Technical Writer",
  "Developer Advocate",
  "Solutions Engineer",
  "Customer Success Engineer",
  "Support Engineer",
]

const locations = [
  "San Francisco, CA",
  "New York, NY",
  "Seattle, WA",
  "Austin, TX",
  "Boston, MA",
  "Los Angeles, CA",
  "Chicago, IL",
  "Denver, CO",
  "Atlanta, GA",
  "Miami, FL",
  "Portland, OR",
  "Nashville, TN",
  "Remote",
  "Remote (US)",
  "Remote (Global)",
  "Hybrid - San Francisco",
  "Hybrid - New York",
  "Hybrid - Seattle",
  "London, UK",
  "Berlin, Germany",
  "Amsterdam, Netherlands",
  "Paris, France",
  "Barcelona, Spain",
  "Dublin, Ireland",
  "Toronto, Canada",
  "Vancouver, Canada",
  "Sydney, Australia",
  "Melbourne, Australia",
  "Tokyo, Japan",
  "Singapore",
]

const statuses = ["applied", "interview", "offer", "rejected", "follow-up"]

const salaryRanges = [
  "$80k - $120k",
  "$90k - $130k",
  "$100k - $140k",
  "$110k - $150k",
  "$120k - $160k",
  "$130k - $170k",
  "$140k - $180k",
  "$150k - $200k",
  "$160k - $220k",
  "$170k - $240k",
  "$180k - $260k",
  "$200k - $300k",
  "$220k - $350k",
  "$250k - $400k",
  "$300k - $500k",
  "$350k - $600k",
  "$400k - $700k",
  "$450k - $800k",
]

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function generateJobApplication(id) {
  const company = getRandomElement(companies)
  const jobTitle = getRandomElement(jobTitles)
  const location = getRandomElement(locations)
  const status = getRandomElement(statuses)

  // Generate application date within last 6 months
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const applicationDate = getRandomDate(sixMonthsAgo, new Date())

  // Generate next action date (if applicable) within next 30 days
  const nextActionDate =
    Math.random() > 0.4 ? getRandomDate(new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) : null

  const salaryRange = Math.random() > 0.3 ? getRandomElement(salaryRanges) : null

  const hasJobUrl = Math.random() > 0.2
  const jobPostingUrl = hasJobUrl
    ? `https://${company.toLowerCase().replace(/\s+/g, "")}.com/careers/${jobTitle.toLowerCase().replace(/\s+/g, "-")}-${id}`
    : null

  const isPostingOnline = hasJobUrl ? Math.random() > 0.3 : null

  return {
    id: id.toString(),
    company,
    jobTitle,
    location,
    applicationDate: applicationDate.toISOString().split("T")[0],
    status,
    salaryRange,
    nextActionDate: nextActionDate ? nextActionDate.toISOString().split("T")[0] : undefined,
    jobPostingUrl,
    isPostingOnline,
  }
}

// Generate 500 applications
const applications = []
for (let i = 1; i <= 500; i++) {
  applications.push(generateJobApplication(i))
}

// Save to localStorage (simulating what would happen in the browser)
console.log("Generated 500 sample job applications:")
console.log(`- Total applications: ${applications.length}`)
console.log(`- Companies: ${new Set(applications.map((app) => app.company)).size} unique`)
console.log(`- Job titles: ${new Set(applications.map((app) => app.jobTitle)).size} unique`)
console.log(`- Locations: ${new Set(applications.map((app) => app.location)).size} unique`)

// Status distribution
const statusCounts = applications.reduce((acc, app) => {
  acc[app.status] = (acc[app.status] || 0) + 1
  return acc
}, {})
console.log("Status distribution:", statusCounts)

// Export the data
console.log("\nTo use this data, copy the following JSON and paste it into your browser console:")
console.log(
  "localStorage.setItem('job-applications-data', JSON.stringify(" + JSON.stringify(applications, null, 2) + "))",
)
console.log("\nThen refresh the page to see 500 applications!")
