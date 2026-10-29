// server/utils/astrometryService.ts
import axios from 'axios';
import FormData from 'form-data';
import sizeOf from 'image-size'; // NEW: Import the image measurer

const API_KEY = 'nijapkedrqwlntli'; // <-- Make sure to paste your real key back in here!
const BASE_URL = 'http://nova.astrometry.net/api';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const solveImage = async (imageBuffer: Buffer, filename: string) => {
  try {
    console.log("Logging into Astrometry.net...");
    const loginPayload = JSON.stringify({ apikey: API_KEY });
    const loginRes = await axios.post(`${BASE_URL}/login`, `request-json=${encodeURIComponent(loginPayload)}`);
    const session = loginRes.data.session;

    if (!session) throw new Error("Astrometry login failed");

    console.log("Uploading image...");
    const form = new FormData();
    form.append('request-json', JSON.stringify({ session, allow_commercial_use: 'd', allow_modifications: 'd', publicly_visible: 'n' }));
    form.append('file', imageBuffer, { filename });

    const uploadRes = await axios.post(`${BASE_URL}/upload`, form, { 
      headers: {
        ...form.getHeaders(),
        'Connection': 'close' // Forces a clean connection
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 60000 // Gives the API 60 seconds to accept the file
    });
    const subid = uploadRes.data.subid;
    console.log(`Image submitted! Submission ID: ${subid}`);

    let jobId = null;
    console.log("Polling submission for Job ID...");
    for (let i = 0; i < 30; i++) {
      await delay(5000);
      const subRes = await axios.get(`${BASE_URL}/submissions/${subid}`);
      const validJobs = subRes.data.jobs?.filter((id: any) => id !== null);
      
      if (validJobs && validJobs.length > 0) {
        jobId = validJobs[0];
        console.log(`Job ID assigned: ${jobId}`);
        break;
      }
    }
    if (!jobId) throw new Error("Timeout waiting for Astrometry Job ID.");

    console.log("Polling Job status...");
    let jobSuccess = false;
    for (let i = 0; i < 40; i++) {
      await delay(5000);
      const jobRes = await axios.get(`${BASE_URL}/jobs/${jobId}`);
      if (jobRes.data.status === 'success') {
        jobSuccess = true;
        console.log("Plate solving complete!");
        break;
      } else if (jobRes.data.status === 'failure') {
        throw new Error("Astrometry failed to solve this image.");
      }
    }
    if (!jobSuccess) throw new Error("Timeout waiting for plate solving to finish.");

    // NEW: Get the real dimensions of the image you uploaded!
    const dimensions = sizeOf(imageBuffer);
    const imgWidth = dimensions.width || 1000;
    const imgHeight = dimensions.height || 1000;

    const annotationsRes = await axios.get(`${BASE_URL}/jobs/${jobId}/annotations`);
    const annotations = annotationsRes.data.annotations || [];

    const detectedObjects = annotations.map((ann: any, index: number) => {
      // NEW: We now divide the pixel coordinates by the REAL image width and height
      const xPercent = ann.pixelx / imgWidth;
      const yPercent = ann.pixely / imgHeight;
      
      // Calculate a realistic box size based on the image width
      const sizeRatio = Math.max(0.04, (ann.radius || 15) / imgWidth);

      return {
        id: `astro-det-${index}`,
        label: ann.names[0] || 'Unknown Celestial Object',
        japaneseLabel: '天体 (Deep Sky Object)',
        celestialClass: ann.type || 'Star/Nebula',
        confidence: 0.99,
        bbox: { 
          x: xPercent - (sizeRatio / 2), 
          y: yPercent - (sizeRatio / 2), 
          width: sizeRatio, 
          height: sizeRatio 
        },
        colorHex: '#85e3a8',
        astronomicalNotes: `Size (Arcminutes): ${(ann.radius || 15).toFixed(1)}' | Brightness: Varies by sensor depth.`,
        samuraiConstellationLore: 'A newly mapped territory in the celestial expanse, confirmed by the Astrometry.net oracle.',
      };
    });

    return { submissionId: subid, jobId, detections: detectedObjects };

  } catch (error) {
    console.error("Astrometry Error:", error);
    throw error;
  }
};