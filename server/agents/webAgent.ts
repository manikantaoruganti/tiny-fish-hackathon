// import axios from "axios";

// export interface WebSnapshot {
//   url: string;
//   content: string;
//   contentLength: number;
//   timestamp: Date;
//   error?: string;
// }

// export async function fetchWebSnapshot(url: string): Promise<WebSnapshot> {
//   try {
//     const response = await axios.get(url, {
//       timeout: 10000,
//       headers: {
//         'User-Agent': 'DriftGuard-AI/1.0 (Web Monitor Bot)'
//       }
//     });

//     const htmlContent = response.data;
//     const textContent = extractTextContent(htmlContent);

//     return {
//       url,
//       content: textContent,
//       contentLength: textContent.length,
//       timestamp: new Date(),
//     };
//   } catch (error: any) {
//     return {
//       url,
//       content: '',
//       contentLength: 0,
//       timestamp: new Date(),
//       error: error.message || 'Failed to fetch website',
//     };
//   }
// }

// function extractTextContent(html: string): string {
//   const noScripts = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
//   const noStyles = noScripts.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
//   const noTags = noStyles.replace(/<[^>]+>/g, ' ');
//   const decoded = noTags.replace(/&nbsp;/g, ' ')
//     .replace(/&amp;/g, '&')
//     .replace(/&lt;/g, '<')
//     .replace(/&gt;/g, '>')
//     .replace(/&quot;/g, '"');
//   const normalized = decoded.replace(/\s+/g, ' ').trim();
  
//   return normalized.substring(0, 5000);
// }

// export function detectChanges(oldContent: string | null, newContent: string): boolean {
//   if (!oldContent) return false;
  
//   const oldNormalized = normalizeForComparison(oldContent);
//   const newNormalized = normalizeForComparison(newContent);
  
//   const similarity = calculateSimilarity(oldNormalized, newNormalized);
  
//   return similarity < 0.95;
// }

// function normalizeForComparison(text: string): string {
//   return text.toLowerCase()
//     .replace(/\s+/g, ' ')
//     .replace(/[^\w\s]/g, '')
//     .trim();
// }

// function calculateSimilarity(text1: string, text2: string): number {
//   if (text1 === text2) return 1.0;
//   if (!text1 || !text2) return 0.0;
  
//   const longer = text1.length > text2.length ? text1 : text2;
//   const shorter = text1.length > text2.length ? text2 : text1;
  
//   if (longer.length === 0) return 1.0;
  
//   const editDistance = levenshteinDistance(shorter.substring(0, 1000), longer.substring(0, 1000));
//   return (1000 - editDistance) / 1000;
// }

// function levenshteinDistance(str1: string, str2: string): number {
//   const matrix: number[][] = [];
  
//   for (let i = 0; i <= str2.length; i++) {
//     matrix[i] = [i];
//   }
  
//   for (let j = 0; j <= str1.length; j++) {
//     matrix[0][j] = j;
//   }
  
//   for (let i = 1; i <= str2.length; i++) {
//     for (let j = 1; j <= str1.length; j++) {
//       if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
//         matrix[i][j] = matrix[i - 1][j - 1];
//       } else {
//         matrix[i][j] = Math.min(
//           matrix[i - 1][j - 1] + 1,
//           matrix[i][j - 1] + 1,
//           matrix[i - 1][j] + 1
//         );
//       }
//     }
//   }
  
//   return matrix[str2.length][str1.length];
// }
import { chromium } from "playwright";

export interface WebSnapshot {
  url: string;
  content: string;
  contentLength: number;
  timestamp: Date;
  error?: string;
}

export async function fetchWebSnapshot(url: string): Promise<WebSnapshot> {

  let browser;

  try {

    browser = await chromium.launch({
      headless: true
    });

    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000
    });

    // wait for page render
    await page.waitForTimeout(2000);

    const textContent = await page.evaluate(() => {

      // remove scripts/styles
      const removeNodes = document.querySelectorAll("script,style,noscript");
      removeNodes.forEach(el => el.remove());

      const text = document.body.innerText || "";

      return text.replace(/\s+/g, " ").trim();

    });

    await browser.close();

    const normalized = textContent.substring(0, 5000);

    return {
      url,
      content: normalized,
      contentLength: normalized.length,
      timestamp: new Date()
    };

  } catch (error: any) {

    if (browser) await browser.close();

    return {
      url,
      content: "",
      contentLength: 0,
      timestamp: new Date(),
      error: error.message || "Agent failed to fetch website"
    };
  }
}

export function detectChanges(oldContent: string | null, newContent: string): boolean {

  if (!oldContent) return false;

  const oldNormalized = normalize(oldContent);
  const newNormalized = normalize(newContent);

  const similarity = calculateSimilarity(oldNormalized, newNormalized);

  return similarity < 0.95;
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "")
    .trim();
}

function calculateSimilarity(a: string, b: string) {

  if (a === b) return 1;

  const dist = levenshtein(a.substring(0, 1000), b.substring(0, 1000));

  return (1000 - dist) / 1000;
}

function levenshtein(a: string, b: string) {

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {

      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }

    }
  }

  return matrix[b.length][a.length];
}