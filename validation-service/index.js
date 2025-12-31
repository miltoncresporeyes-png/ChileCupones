require('dotenv').config();
const puppeteer = require('puppeteer');
const axios = require('axios');

const API_URL = process.env.API_URL || (process.env.BACKEND_HOST ? `http://${process.env.BACKEND_HOST}/api/discounts` : 'http://localhost:3000/api/discounts');

async function validateDiscounts() {
  console.log('Starting validation process...');
  
  try {
    // 1. Fetch discounts
    const { data: discounts } = await axios.get(API_URL);
    console.log(`Found ${discounts.length} discounts to validate.`);

    // 2. Launch Browser
    const browser = await puppeteer.launch({ headless: "new" });
    
    for (const discount of discounts) {
      const page = await browser.newPage();
      // Set a realistic user agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      console.log(`Validating: ${discount.title} (${discount.url})`);
      
      let isValid = false;
      try {
        const response = await page.goto(discount.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        const status = response.status();
        
        // Simple validation: Check if status is 200-299
        if (status >= 200 && status < 300) {
          isValid = true;
        }
        
        // Advanced: Check for "Out of stock" or "Expired" text (Placeholder)
        // const content = await page.content();
        // if (content.includes('Agotado') || content.includes('Expirado')) isValid = false;

      } catch (err) {
        console.error(`Error accessing ${discount.url}: ${err.message}`);
        isValid = false;
      } finally {
        await page.close();
      }

      // 3. Update Status
      const id = discount._id || discount.externalId;
      try {
        await axios.patch(`${API_URL}/${id}/verify`, { verified: isValid });
        console.log(`-> Updated status for ${id}: ${isValid ? 'VERIFIED' : 'FAILED'}`);
      } catch (err) {
        console.error(`Failed to update status for ${id}: ${err.message}`);
      }
    }

    await browser.close();
    console.log('Validation complete.');

  } catch (err) {
    console.error('Validation service error:', err.message);
  }
}

// Run immediately then every hour
validateDiscounts();
// setInterval(validateDiscounts, 1000 * 60 * 60);
