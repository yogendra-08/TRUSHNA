
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-response.ts';
import '@/ai/flows/generate-image-flow.ts';
import '@/ai/tools/web-search-tool.ts'; // Import the new tool
