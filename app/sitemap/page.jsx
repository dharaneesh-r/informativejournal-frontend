import axios from "axios";

export default async function handler(req, res) {
  const baseUrl = "https://informativejournal-backend.vercel.app/sitemap.xml";

  try {
    const response = await axios.get(baseUrl, {
      headers: {
        'Accept': 'application/xml'
      },
      responseType: 'text'
    });

    res.setHeader('Content-Type', 'application/xml');
    res.send(response.data);
  } catch (error) {
    console.error("Failed to fetch sitemap:", error);
  }
}