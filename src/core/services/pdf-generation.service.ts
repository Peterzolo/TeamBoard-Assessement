import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PdfGenerationService {
  private readonly logger = new Logger(PdfGenerationService.name);

  /**
   * Generate PDF from HTML content using Puppeteer
   */
  async generatePdfFromHtml(
    htmlContent: string,
    options?: {
      format?: 'A4' | 'Letter';
      margin?: {
        top?: string;
        right?: string;
        bottom?: string;
        left?: string;
      };
      displayHeaderFooter?: boolean;
      headerTemplate?: string;
      footerTemplate?: string;
    },
  ): Promise<Buffer> {
    let browser: puppeteer.Browser | null = null;

    try {
      this.logger.log('🚀 Starting PDF generation with Puppeteer');

      // Launch browser
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      });

      const page = await browser.newPage();

      // Set content
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: options?.format || 'A4',
        margin: options?.margin || {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm',
        },
        displayHeaderFooter: options?.displayHeaderFooter || false,
        headerTemplate: options?.headerTemplate || '',
        footerTemplate: options?.footerTemplate || '',
        printBackground: true,
        preferCSSPageSize: true,
      });

      this.logger.log('✅ PDF generated successfully');
      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error(`❌ Failed to generate PDF: ${error.message}`);
      throw new Error(`PDF generation failed: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
        this.logger.log('🔒 Browser closed');
      }
    }
  }
}
