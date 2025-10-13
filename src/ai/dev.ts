'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/appointment-summary-generator.ts';
import '@/ai/flows/price-suggester.ts';
import '@/ai/flows/recipe-suggester.ts';
