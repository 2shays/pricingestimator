import puppeteer from 'puppeteer';
import { parse } from 'node-html-parser';

export interface ScrapedContent {
  url: string;
  title: string;
  description: string;
  companyName: string;
  productName: string;
  features: string[];
  pricingInfo: string[];
  content: string;
  metaData: {
    headings: string[];
    images: string[];
    links: string[];
  };
}

export class URLScraperService {
  private browser: any = null;

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        executablePath: 'chromium',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-gpu',
          '--single-process',
        ],
      });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async scrapeURL(url: string): Promise<ScrapedContent> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();

    try {
      // Set user agent to avoid bot detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Navigate to the URL with timeout
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Wait for content to load
      await page.waitForTimeout(2000);

      // Extract content
      const content = await page.evaluate(() => {
        // Remove script and style elements
        const scripts = document.querySelectorAll('script, style, noscript');
        scripts.forEach(el => el.remove());

        return {
          title: document.title,
          html: document.documentElement.outerHTML,
          textContent: document.body.innerText || '',
        };
      });

      await page.close();

      // Parse HTML content
      const root = parse(content.html);
      
      // Extract structured data
      const result = this.extractStructuredData(url, content, root);
      
      return result;
    } catch (error) {
      await page.close();
      console.error(`Error scraping ${url}:`, error);
      
      // Return basic fallback data
      return {
        url,
        title: this.extractDomainName(url),
        description: `Professional software solution from ${this.extractDomainName(url)}`,
        companyName: this.extractDomainName(url),
        productName: 'Professional Software',
        features: [],
        pricingInfo: [],
        content: '',
        metaData: {
          headings: [],
          images: [],
          links: [],
        },
      };
    }
  }

  private extractStructuredData(url: string, content: any, root: any): ScrapedContent {
    // Extract meta information
    const title = content.title || '';
    const metaDescription = root.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    
    // Extract headings
    const headings = root.querySelectorAll('h1, h2, h3').map((h: any) => h.text.trim()).filter((text: string) => text.length > 0);
    
    // Extract features (look for common patterns)
    const features = this.extractFeatures(content.textContent, headings);
    
    // Extract pricing information
    const pricingInfo = this.extractPricingInfo(content.textContent);
    
    // Extract company and product names
    const { companyName, productName } = this.extractNames(url, title, headings);
    
    // Clean and prepare content
    const cleanContent = this.cleanTextContent(content.textContent);
    
    return {
      url,
      title,
      description: metaDescription || this.generateDescription(cleanContent),
      companyName,
      productName,
      features,
      pricingInfo,
      content: cleanContent,
      metaData: {
        headings,
        images: root.querySelectorAll('img').map((img: any) => img.getAttribute('src')).filter(Boolean),
        links: root.querySelectorAll('a').map((a: any) => a.getAttribute('href')).filter(Boolean),
      },
    };
  }

  private extractFeatures(content: string, headings: string[]): string[] {
    const features: string[] = [];
    
    // Look for feature patterns
    const featurePatterns = [
      /features?:?\s*([^.]*)/gi,
      /benefits?:?\s*([^.]*)/gi,
      /capabilities?:?\s*([^.]*)/gi,
      /includes?:?\s*([^.]*)/gi,
    ];
    
    featurePatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const feature = match.replace(/^(features?|benefits?|capabilities?|includes?):?\s*/i, '').trim();
          if (feature.length > 10 && feature.length < 100) {
            features.push(feature);
          }
        });
      }
    });
    
    // Extract from headings that might be features
    headings.forEach(heading => {
      if (heading.length > 10 && heading.length < 80 && 
          /^(feature|benefit|capability|solution|tool|platform)/i.test(heading)) {
        features.push(heading);
      }
    });
    
    // Return unique features
    return Array.from(new Set(features)).slice(0, 10);
  }

  private extractPricingInfo(content: string): string[] {
    const pricing: string[] = [];
    
    // Look for pricing patterns
    const pricingPatterns = [
      /\$[\d,]+(?:\.\d{2})?(?:\s*\/?\s*(?:month|mo|year|yr|user|seat))?/gi,
      /(?:starts?|from|starting)\s+(?:at\s+)?\$[\d,]+/gi,
      /pricing:?\s*([^.]*\$[^.]*)/gi,
      /plans?:?\s*([^.]*\$[^.]*)/gi,
    ];
    
    pricingPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleanMatch = match.trim();
          if (cleanMatch.length < 100) {
            pricing.push(cleanMatch);
          }
        });
      }
    });
    
    return Array.from(new Set(pricing)).slice(0, 5);
  }

  private extractNames(url: string, title: string, headings: string[]): { companyName: string; productName: string } {
    const domain = this.extractDomainName(url);
    
    // Try to extract company name from domain
    let companyName = domain.replace(/\.(com|io|net|org|co)$/, '');
    companyName = companyName.charAt(0).toUpperCase() + companyName.slice(1);
    
    // Try to extract product name from title or first heading
    let productName = title;
    if (headings.length > 0) {
      productName = headings[0];
    }
    
    // Clean product name
    productName = productName.replace(new RegExp(companyName, 'gi'), '').trim();
    if (!productName || productName.length < 3) {
      productName = 'Professional Software';
    }
    
    return { companyName, productName };
  }

  private extractDomainName(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return 'Unknown Company';
    }
  }

  private cleanTextContent(content: string): string {
    return content
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.,!?$%-]/g, '')
      .trim()
      .slice(0, 2000); // Limit content length
  }

  private generateDescription(content: string): string {
    const sentences = content.split('.').filter(s => s.trim().length > 20);
    return sentences.slice(0, 2).join('. ') + '.';
  }
}

export const urlScraperService = new URLScraperService();