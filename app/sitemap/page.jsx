export async function sitemapURL({ res }) {
    const baseUrl = "https://informativejournal-backend.vercel.app/sitemap.xml";
    const response = await fetch(baseUrl);
    const xml = await response.text(); 
  
    res.setHeader("Content-Type", "application/xml");
    res.write(xml);
    res.end();
  
    return { props: {} };
  }
  
  export default function Sitemap() {
    return null; 
  }
  