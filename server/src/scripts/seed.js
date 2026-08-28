/**
 * ===================================================================
 * StayWise — Demo/Interview Seed Data
 * ===================================================================
 * FOR DEVELOPMENT/DEMO ONLY.
 * Clears existing users, hostels, and reviews, then inserts realistic
 * demo data. Hostel ratings are derived from reviews using the
 * existing recalculateHostelRatings utility.
 *
 * Run:  npm run seed
 * ===================================================================
 */

import mongoose from 'mongoose';
import env from '../config/env.js';

import User from '../models/User.js';
import Hostel from '../models/Hostel.js';
import Review from '../models/Review.js';
import recalculateHostelRatings from '../utils/recalculateHostelRatings.js';

const MONGODB_URI = env.MONGODB_URI;

// ─── USERS ──────────────────────────────────────────────────────────
const usersData = [
  // Demo login: demo@staywise.com / Demo@1234
  { name: 'Demo User', email: 'demo@staywise.com', password: 'Demo@1234', role: 'user',
    preferences: { budgetPriority: 7, cleanlinessPriority: 8, locationPriority: 6, foodPriority: 5, safetyPriority: 7, maxBudget: 12000 } },
  { name: 'Ananya Sharma', email: 'ananya@test.com', password: 'Test@1234', role: 'user',
    preferences: { budgetPriority: 9, cleanlinessPriority: 5, locationPriority: 4, foodPriority: 8, safetyPriority: 6, maxBudget: 8000 } },
  { name: 'Rahul Verma', email: 'rahul@test.com', password: 'Test@1234', role: 'user',
    preferences: { budgetPriority: 3, cleanlinessPriority: 9, locationPriority: 8, foodPriority: 7, safetyPriority: 9, maxBudget: 20000 } },
  { name: 'Priya Patel', email: 'priya@test.com', password: 'Test@1234', role: 'user',
    preferences: { budgetPriority: 6, cleanlinessPriority: 7, locationPriority: 9, foodPriority: 4, safetyPriority: 8, maxBudget: 15000 } },
  { name: 'Vikram Singh', email: 'vikram@test.com', password: 'Test@1234', role: 'admin',
    preferences: { budgetPriority: 5, cleanlinessPriority: 6, locationPriority: 5, foodPriority: 6, safetyPriority: 5, maxBudget: 10000 } },
];

// ─── HOSTELS ────────────────────────────────────────────────────────
const hostelsData = [
  // --- DELHI (4) ---
  { name: 'Greenview Boys Hostel', type: 'hostel', description: 'Well-maintained boys hostel in Kamla Nagar, walking distance to Delhi University north campus. Clean rooms, regular housekeeping, and a spacious common area.',
    location: { address: '23, Mall Road, Kamla Nagar', city: 'delhi', area: 'kamla nagar', latitude: 28.6862, longitude: 77.2074 },
    pricing: { monthlyRent: 7500, securityDeposit: 15000 },
    roomTypes: [{ name: 'Double', occupancy: 2, price: 7500 }, { name: 'Triple', occupancy: 3, price: 5500 }],
    gender: 'male', amenities: ['wifi', 'laundry', 'water purifier', 'common room', 'power backup'],
    images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80'],
    availability: { status: 'available', bedsAvailable: 8 } },

  { name: 'Lakshmi Girls PG', type: 'pg', description: 'Safe and comfortable PG accommodation for girls near Saket metro. Home-cooked meals, 24/7 security, and a quiet study environment.',
    location: { address: '14-B, Press Enclave Marg', city: 'delhi', area: 'saket', latitude: 28.5245, longitude: 77.2166 },
    pricing: { monthlyRent: 12000, securityDeposit: 24000 },
    roomTypes: [{ name: 'Single', occupancy: 1, price: 12000 }, { name: 'Double', occupancy: 2, price: 9000 }],
    gender: 'female', amenities: ['wifi', 'meals', 'ac', 'laundry', 'security', 'power backup', 'water purifier'],
    images: ['https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&q=80'],
    availability: { status: 'available', bedsAvailable: 3 } },

  { name: 'Metro Stay Co-Living', type: 'pg', description: 'Modern co-living space near Rajiv Chowk with furnished rooms, high-speed internet, and weekly room cleaning. Ideal for working professionals and students.',
    location: { address: '7, Barakhamba Road', city: 'delhi', area: 'connaught place', latitude: 28.6328, longitude: 77.2197 },
    pricing: { monthlyRent: 16000, securityDeposit: 16000 },
    roomTypes: [{ name: 'Single', occupancy: 1, price: 16000 }, { name: 'Double', occupancy: 2, price: 11000 }],
    gender: 'coed', amenities: ['wifi', 'ac', 'gym', 'laundry', 'security', 'parking', 'housekeeping'],
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80'],
    availability: { status: 'limited', bedsAvailable: 2 } },

  { name: 'Scholars Den Hostel', type: 'hostel', description: 'Budget-friendly hostel near IIT Delhi campus. Basic but clean accommodation with mess facility serving three meals a day.',
    location: { address: '45, Haus Khas Village', city: 'delhi', area: 'hauz khas', latitude: 28.5494, longitude: 77.2001 },
    pricing: { monthlyRent: 6000, securityDeposit: 6000 },
    roomTypes: [{ name: 'Triple', occupancy: 3, price: 6000 }, { name: 'Four-Bed', occupancy: 4, price: 4500 }],
    gender: 'male', amenities: ['wifi', 'meals', 'laundry', 'water purifier'],
    images: ['https://images.unsplash.com/photo-1595599512605-1c444a1be8c5?w=600&q=80'],
    availability: { status: 'available', bedsAvailable: 12 } },

  // --- BANGALORE (4) ---
  { name: 'Nest PG for Women', type: 'pg', description: 'Premium women\'s PG in the heart of Koramangala. Fully furnished rooms, organic meals, yoga room, and 24/7 CCTV surveillance.',
    location: { address: '80 Feet Road, 4th Block', city: 'bangalore', area: 'koramangala', latitude: 12.9352, longitude: 77.6245 },
    pricing: { monthlyRent: 14000, securityDeposit: 28000 },
    roomTypes: [{ name: 'Single', occupancy: 1, price: 14000 }, { name: 'Double', occupancy: 2, price: 10000 }],
    gender: 'female', amenities: ['wifi', 'meals', 'ac', 'gym', 'laundry', 'security', 'power backup', 'parking'],
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80'],
    availability: { status: 'available', bedsAvailable: 5 } },

  { name: 'TechPad Hostel', type: 'hostel', description: 'Affordable hostel for tech students and interns near Electronic City. Decent rooms, good connectivity, and a small coworking area.',
    location: { address: '12, Neeladri Road', city: 'bangalore', area: 'electronic city', latitude: 12.8456, longitude: 77.6603 },
    pricing: { monthlyRent: 6500, securityDeposit: 6500 },
    roomTypes: [{ name: 'Double', occupancy: 2, price: 6500 }, { name: 'Triple', occupancy: 3, price: 5000 }],
    gender: 'male', amenities: ['wifi', 'power backup', 'water purifier', 'common room'],
    images: ['https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=600&q=80'],
    availability: { status: 'available', bedsAvailable: 10 } },

  { name: 'Comfort Zone PG', type: 'pg', description: 'Well-located PG near Indiranagar metro. Spacious rooms with attached bathrooms, daily housekeeping, and North Indian meals.',
    location: { address: '100 Feet Road, CMH Road', city: 'bangalore', area: 'indiranagar', latitude: 12.9784, longitude: 77.6408 },
    pricing: { monthlyRent: 13000, securityDeposit: 26000 },
    roomTypes: [{ name: 'Single', occupancy: 1, price: 13000 }, { name: 'Double', occupancy: 2, price: 9500 }],
    gender: 'coed', amenities: ['wifi', 'meals', 'ac', 'laundry', 'housekeeping', 'water purifier', 'power backup'],
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80'],
    availability: { status: 'limited', bedsAvailable: 1 } },

  { name: 'Campus Edge Hostel', type: 'hostel', description: 'Student hostel a short bus ride from PES University. Functional rooms, vegetarian mess, and a quiet campus-like feel.',
    location: { address: '26, Bannerghatta Road', city: 'bangalore', area: 'bannerghatta road', latitude: 12.9003, longitude: 77.5977 },
    pricing: { monthlyRent: 5500, securityDeposit: 5500 },
    roomTypes: [{ name: 'Triple', occupancy: 3, price: 5500 }, { name: 'Four-Bed', occupancy: 4, price: 4000 }],
    gender: 'male', amenities: ['wifi', 'meals', 'laundry', 'water purifier', 'study room'],
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80'],
    availability: { status: 'full', bedsAvailable: 0 } },

  // --- PUNE (4) ---
  { name: 'Oxford Girls Hostel', type: 'hostel', description: 'Popular girls hostel in the university area. Clean environment, strict curfew, homely food, and a helpful warden.',
    location: { address: '15, FC Road, Deccan', city: 'pune', area: 'deccan', latitude: 18.5167, longitude: 73.8414 },
    pricing: { monthlyRent: 8000, securityDeposit: 16000 },
    roomTypes: [{ name: 'Double', occupancy: 2, price: 8000 }, { name: 'Triple', occupancy: 3, price: 6500 }],
    gender: 'female', amenities: ['wifi', 'meals', 'laundry', 'security', 'water purifier', 'power backup'],
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80'],
    availability: { status: 'available', bedsAvailable: 6 } },

  { name: 'Zenith Co-Living', type: 'pg', description: 'Upscale co-living near Hinjewadi IT Park. Modern interiors, gym access, rooftop lounge, and regular social events for residents.',
    location: { address: '3, Rajiv Gandhi Infotech Park', city: 'pune', area: 'hinjewadi', latitude: 18.5912, longitude: 73.7389 },
    pricing: { monthlyRent: 15000, securityDeposit: 15000 },
    roomTypes: [{ name: 'Single', occupancy: 1, price: 15000 }, { name: 'Double', occupancy: 2, price: 10500 }],
    gender: 'coed', amenities: ['wifi', 'ac', 'gym', 'meals', 'laundry', 'housekeeping', 'security', 'rooftop lounge', 'parking'],
    images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80'],
    availability: { status: 'available', bedsAvailable: 7 } },

  { name: 'Kothrud Student Hostel', type: 'hostel', description: 'No-frills boys hostel near MIT Pune. Affordable rates, basic vegetarian mess, and a study-friendly atmosphere.',
    location: { address: '88, Paud Road', city: 'pune', area: 'kothrud', latitude: 18.5089, longitude: 73.8074 },
    pricing: { monthlyRent: 5000, securityDeposit: 5000 },
    roomTypes: [{ name: 'Triple', occupancy: 3, price: 5000 }, { name: 'Four-Bed', occupancy: 4, price: 3800 }],
    gender: 'male', amenities: ['wifi', 'meals', 'water purifier'],
    images: ['https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80'],
    availability: { status: 'available', bedsAvailable: 15 } },

  { name: 'Sakura Ladies PG', type: 'pg', description: 'Charming PG for women in Viman Nagar. Japanese-inspired minimal interiors, healthy meal plan, and a peaceful garden.',
    location: { address: '5, Datta Mandir Road', city: 'pune', area: 'viman nagar', latitude: 18.5679, longitude: 73.9143 },
    pricing: { monthlyRent: 11000, securityDeposit: 22000 },
    roomTypes: [{ name: 'Single', occupancy: 1, price: 11000 }, { name: 'Double', occupancy: 2, price: 8000 }],
    gender: 'female', amenities: ['wifi', 'meals', 'ac', 'laundry', 'security', 'garden', 'housekeeping'],
    images: ['https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80'],
    availability: { status: 'limited', bedsAvailable: 2 } },

  // --- HYDERABAD (4) ---
  { name: 'Gateway Mens Hostel', type: 'hostel', description: 'Centrally located hostel near JNTU with air-cooled rooms, evening snacks, and a cricket ground nearby.',
    location: { address: '40, Kukatpally Housing Board', city: 'hyderabad', area: 'kukatpally', latitude: 17.4947, longitude: 78.3996 },
    pricing: { monthlyRent: 6000, securityDeposit: 6000 },
    roomTypes: [{ name: 'Double', occupancy: 2, price: 6000 }, { name: 'Triple', occupancy: 3, price: 4500 }],
    gender: 'male', amenities: ['wifi', 'meals', 'water purifier', 'power backup', 'common room'],
    images: ['https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&q=80'],
    availability: { status: 'available', bedsAvailable: 9 } },

  { name: 'Hitech City PG', type: 'pg', description: 'Professional co-living in the IT corridor. Furnished rooms, meal plans, high-speed broadband, and shuttle to major tech parks.',
    location: { address: '22, Madhapur Main Road', city: 'hyderabad', area: 'madhapur', latitude: 17.4486, longitude: 78.3908 },
    pricing: { monthlyRent: 13500, securityDeposit: 27000 },
    roomTypes: [{ name: 'Single', occupancy: 1, price: 13500 }, { name: 'Double', occupancy: 2, price: 9000 }],
    gender: 'coed', amenities: ['wifi', 'meals', 'ac', 'laundry', 'gym', 'housekeeping', 'shuttle', 'parking'],
    images: ['https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=600&q=80'],
    availability: { status: 'available', bedsAvailable: 4 } },

  { name: 'Ameerpet Girls Hostel', type: 'hostel', description: 'Safe and affordable girls hostel in the coaching hub of Ameerpet. Two meals included, curfew at 9 PM, and warden on premises.',
    location: { address: '8, SR Nagar Cross Roads', city: 'hyderabad', area: 'ameerpet', latitude: 17.4375, longitude: 78.4483 },
    pricing: { monthlyRent: 7000, securityDeposit: 14000 },
    roomTypes: [{ name: 'Double', occupancy: 2, price: 7000 }, { name: 'Triple', occupancy: 3, price: 5500 }],
    gender: 'female', amenities: ['wifi', 'meals', 'security', 'water purifier', 'power backup'],
    images: ['https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=600&q=80'],
    availability: { status: 'available', bedsAvailable: 4 } },

  { name: 'Gachibowli Elite PG', type: 'pg', description: 'Premium PG near ISB and UoH. Fully AC rooms, multi-cuisine meals, rooftop gym, and excellent security infrastructure.',
    location: { address: '15, Nanakramguda Road', city: 'hyderabad', area: 'gachibowli', latitude: 17.4401, longitude: 78.3489 },
    pricing: { monthlyRent: 18000, securityDeposit: 36000 },
    roomTypes: [{ name: 'Single', occupancy: 1, price: 18000 }, { name: 'Double', occupancy: 2, price: 13000 }],
    gender: 'coed', amenities: ['wifi', 'meals', 'ac', 'gym', 'laundry', 'security', 'housekeeping', 'power backup', 'parking', 'swimming pool'],
    images: ['https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=600&q=80'],
    availability: { status: 'limited', bedsAvailable: 1 } },

  // --- MUMBAI (4) ---
  { name: 'Andheri West Student Hostel', type: 'hostel', description: 'Busy but affordable hostel near Andheri station. Convenient location for college students commuting across Mumbai.',
    location: { address: '19, Juhu Lane', city: 'mumbai', area: 'andheri west', latitude: 19.1197, longitude: 72.8464 },
    pricing: { monthlyRent: 9000, securityDeposit: 18000 },
    roomTypes: [{ name: 'Double', occupancy: 2, price: 9000 }, { name: 'Triple', occupancy: 3, price: 7000 }],
    gender: 'male', amenities: ['wifi', 'laundry', 'water purifier', 'power backup'],
    images: ['https://images.unsplash.com/photo-1600566753086-00f18f6b5eb0?w=600&q=80'],
    availability: { status: 'available', bedsAvailable: 6 } },

  { name: 'Powai Lake PG', type: 'pg', description: 'Serene PG overlooking Powai Lake, close to IIT Bombay. AC rooms, healthy meals, and a reading lounge with lake views.',
    location: { address: '3, Hiranandani Gardens', city: 'mumbai', area: 'powai', latitude: 19.1176, longitude: 72.9060 },
    pricing: { monthlyRent: 17000, securityDeposit: 34000 },
    roomTypes: [{ name: 'Single', occupancy: 1, price: 17000 }, { name: 'Double', occupancy: 2, price: 12000 }],
    gender: 'coed', amenities: ['wifi', 'meals', 'ac', 'laundry', 'gym', 'housekeeping', 'security', 'reading lounge'],
    images: ['https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80'],
    availability: { status: 'available', bedsAvailable: 3 } },

  { name: 'Dadar Ladies Hostel', type: 'hostel', description: 'Trusted women\'s hostel in central Mumbai. Strict security, home-style Maharashtrian meals, and easy access to local trains.',
    location: { address: '58, Senapati Bapat Marg', city: 'mumbai', area: 'dadar', latitude: 19.0178, longitude: 72.8478 },
    pricing: { monthlyRent: 10000, securityDeposit: 20000 },
    roomTypes: [{ name: 'Double', occupancy: 2, price: 10000 }, { name: 'Triple', occupancy: 3, price: 7500 }],
    gender: 'female', amenities: ['wifi', 'meals', 'laundry', 'security', 'water purifier', 'power backup'],
    images: ['https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=600&q=80'],
    availability: { status: 'available', bedsAvailable: 5 } },

  { name: 'BKC Executive PG', type: 'pg', description: 'High-end co-living in Bandra-Kurla Complex. Designed for young professionals and MBA students. Concierge, coworking space, and rooftop bar.',
    location: { address: '1, BKC Connector Road', city: 'mumbai', area: 'bandra kurla complex', latitude: 19.0596, longitude: 72.8656 },
    pricing: { monthlyRent: 22000, securityDeposit: 44000 },
    roomTypes: [{ name: 'Single', occupancy: 1, price: 22000 }, { name: 'Double', occupancy: 2, price: 15000 }],
    gender: 'coed', amenities: ['wifi', 'meals', 'ac', 'gym', 'laundry', 'housekeeping', 'security', 'coworking', 'parking', 'concierge'],
    images: ['https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=600&q=80'],
    availability: { status: 'limited', bedsAvailable: 1 } },
];

// ─── REVIEW TEMPLATES ───────────────────────────────────────────────
// Each review targets a hostel index [0..19] with specific ratings and text
// mentioning aspects useful for AI analysis demo
const reviewTemplates = [
  // Hostel 0 — Greenview Boys Hostel (Delhi) — decent all-round
  { hostelIdx: 0, userIdx: 1, ratings: { cleanliness: 4, food: 3, location: 5, safety: 4, staff: 4, valueForMoney: 4, overall: 4 },
    text: 'Greenview is right next to DU north campus, so the location is unbeatable. Rooms are cleaned daily and the common area is spacious. Food from the mess is average — mostly dal and rice, nothing exciting. Staff is cooperative and the warden is approachable. Good value for the rent.' },
  { hostelIdx: 0, userIdx: 2, ratings: { cleanliness: 3, food: 3, location: 5, safety: 4, staff: 3, valueForMoney: 4, overall: 4 },
    text: 'Great location if you study at DU. The rooms are okay but could use better mattresses. The wifi works well most of the time. Food is basic hostel fare — do not expect restaurant quality. Safety is fine, there is a gate and a guard at night.' },
  { hostelIdx: 0, userIdx: 3, ratings: { cleanliness: 4, food: 2, location: 5, safety: 4, staff: 4, valueForMoney: 3, overall: 4 },
    text: 'Location is the biggest plus — you can walk to campus in 5 minutes. Cleanliness is maintained, and the staff responds quickly to complaints. However, the mess food has gone downhill recently. They need a better cook. Overall, still one of the better options near DU.' },

  // Hostel 1 — Lakshmi Girls PG (Delhi) — strong safety + food
  { hostelIdx: 1, userIdx: 3, ratings: { cleanliness: 4, food: 5, location: 4, safety: 5, staff: 5, valueForMoney: 4, overall: 5 },
    text: 'Lakshmi PG feels like a second home. The aunty who cooks makes incredible rajma chawal and dal makhani. Security is very tight — biometric entry and CCTV everywhere. The rooms are spacious and well-furnished. Slightly pricey but worth every rupee for the safety and food quality.' },
  { hostelIdx: 1, userIdx: 1, ratings: { cleanliness: 5, food: 5, location: 3, safety: 5, staff: 4, valueForMoney: 3, overall: 4 },
    text: 'The food here is genuinely home-cooked and delicious. The PG is very clean and well-maintained. Safety measures are excellent — I feel completely secure even returning late from the library. The only downside is it is a 10-minute walk from the metro, not super convenient.' },

  // Hostel 2 — Metro Stay (Delhi) — modern, mixed
  { hostelIdx: 2, userIdx: 0, ratings: { cleanliness: 5, food: 3, location: 5, safety: 4, staff: 3, valueForMoney: 3, overall: 4 },
    text: 'Metro Stay is modern and well-designed. The location in CP is fantastic — everything is walkable. Rooms are spotlessly clean with good AC. Food is outsourced and mediocre for the price. Staff can be slow to respond to maintenance requests. Premium pricing but you are paying for location.' },
  { hostelIdx: 2, userIdx: 4, ratings: { cleanliness: 5, food: 2, location: 5, safety: 4, staff: 4, valueForMoney: 2, overall: 3 },
    text: 'Very premium location and the interiors look great. But at 16k per month, the food should be much better — we mostly order from outside. The gym is tiny and often crowded. Cleaning is top-notch though. For the price, I expected more amenities and better meal quality.' },

  // Hostel 3 — Scholars Den (Delhi) — budget, good food
  { hostelIdx: 3, userIdx: 1, ratings: { cleanliness: 3, food: 4, location: 4, safety: 3, staff: 3, valueForMoney: 5, overall: 4 },
    text: 'Best value hostel near IIT Delhi. The mess serves three proper meals and the food is surprisingly good for the price. Rooms are basic but functional. Cleanliness could improve — the bathrooms need more frequent cleaning. If you are on a tight budget, this is the place.' },
  { hostelIdx: 3, userIdx: 4, ratings: { cleanliness: 2, food: 4, location: 4, safety: 3, staff: 3, valueForMoney: 5, overall: 3 },
    text: 'You get what you pay for at 6000 a month, and honestly the food is better than hostels charging twice as much. The dal, sabzi and roti are consistently decent. But the rooms are cramped, the washrooms need renovation, and there is no proper maintenance schedule. Great for budget students.' },

  // Hostel 4 — Nest PG (Bangalore) — premium, strong cleanliness + safety
  { hostelIdx: 4, userIdx: 0, ratings: { cleanliness: 5, food: 5, location: 4, safety: 5, staff: 5, valueForMoney: 4, overall: 5 },
    text: 'Nest PG is easily the best PG I have stayed in. The rooms are immaculate, the organic meals are nutritious and tasty, and the yoga room is a wonderful touch. CCTV coverage and the security guard make me feel very safe. Koramangala location is great for restaurants and nightlife.' },
  { hostelIdx: 4, userIdx: 3, ratings: { cleanliness: 5, food: 4, location: 4, safety: 5, staff: 4, valueForMoney: 3, overall: 5 },
    text: 'Everything about this PG screams quality. Spotless rooms, great security, and the gym is well-equipped. The food is mostly good but sometimes repetitive. It is on the expensive side but you are getting premium facilities. The area is vibrant with plenty of cafes nearby.' },
  { hostelIdx: 4, userIdx: 1, ratings: { cleanliness: 5, food: 4, location: 5, safety: 5, staff: 5, valueForMoney: 3, overall: 5 },
    text: 'I have recommended Nest PG to every girl who asks about accommodation in Bangalore. The cleanliness standards are hotel-level. Staff is warm and responsive. Safety is the number one priority here and it shows. The only con is the pricing, but safety and comfort have no price.' },

  // Hostel 5 — TechPad (Bangalore) — budget, average
  { hostelIdx: 5, userIdx: 2, ratings: { cleanliness: 3, food: 2, location: 3, safety: 3, staff: 3, valueForMoney: 4, overall: 3 },
    text: 'TechPad is functional for the price. Electronic City is far from central Bangalore but good if you intern at Infosys or Wipro. Rooms are basic with decent wifi. No meals provided so you rely on nearby dhabas. The coworking space is a nice touch for working on assignments.' },
  { hostelIdx: 5, userIdx: 0, ratings: { cleanliness: 3, food: 1, location: 2, safety: 3, staff: 3, valueForMoney: 4, overall: 3 },
    text: 'If budget is your main concern, TechPad works. But the location in Electronic City is isolated — getting to the city centre takes over an hour. No food is provided, which is a hassle. Rooms are clean enough but nothing impressive. Wifi is reliable which is the main positive.' },

  // Hostel 6 — Comfort Zone PG (Bangalore) — good food + location
  { hostelIdx: 6, userIdx: 4, ratings: { cleanliness: 4, food: 5, location: 5, safety: 4, staff: 4, valueForMoney: 4, overall: 4 },
    text: 'Comfort Zone lives up to its name. The North Indian food is genuinely delicious — the paneer dishes are outstanding. Indiranagar location means great metro access and plenty of restaurants. Rooms are spacious with attached bathrooms. Daily housekeeping keeps everything tidy.' },
  { hostelIdx: 6, userIdx: 1, ratings: { cleanliness: 4, food: 4, location: 5, safety: 3, staff: 4, valueForMoney: 3, overall: 4 },
    text: 'Love the Indiranagar location — metro is a 5-minute walk. Food is home-style and very good. Rooms are comfortable with decent furniture. Only concern is the building entrance could use better security — anyone can walk in during the day. Otherwise a solid PG experience.' },

  // Hostel 7 — Campus Edge (Bangalore) — full, decent
  { hostelIdx: 7, userIdx: 2, ratings: { cleanliness: 3, food: 4, location: 3, safety: 4, staff: 4, valueForMoney: 5, overall: 4 },
    text: 'Campus Edge is perfect for PES students on a budget. The vegetarian mess is surprisingly good with variety in dal and sabzi. Location requires a bus ride but the hostel arranges a shuttle during exam season. Very affordable and the study room is a lifesaver during finals.' },
  { hostelIdx: 7, userIdx: 3, ratings: { cleanliness: 3, food: 3, location: 3, safety: 4, staff: 3, valueForMoney: 5, overall: 3 },
    text: 'Good budget option. The food is okay — standard South Indian breakfast and North Indian meals. The building is old and cleanliness is average. But at 5500 a month with meals included, you really cannot complain. The study room with AC is the best feature.' },

  // Hostel 8 — Oxford Girls (Pune) — good food + safety
  { hostelIdx: 8, userIdx: 3, ratings: { cleanliness: 4, food: 5, location: 5, safety: 5, staff: 4, valueForMoney: 4, overall: 5 },
    text: 'Oxford Girls Hostel is THE place to stay near FC Road. The warden is strict but caring — she makes sure every girl is safe. The food is wonderful, especially the Maharashtrian thali on Sundays. Location is perfect for Fergusson and BMCC students. Highly recommend.' },
  { hostelIdx: 8, userIdx: 1, ratings: { cleanliness: 4, food: 4, location: 5, safety: 5, staff: 5, valueForMoney: 4, overall: 4 },
    text: 'Stayed here for two years and it felt like home. The staff genuinely cares about the girls. Food is home-style and nutritious. FC Road location means everything is accessible. The 9 PM curfew can be annoying but honestly it is the safest hostel I know in Pune.' },

  // Hostel 9 — Zenith Co-Living (Pune) — premium
  { hostelIdx: 9, userIdx: 0, ratings: { cleanliness: 5, food: 4, location: 3, safety: 4, staff: 4, valueForMoney: 3, overall: 4 },
    text: 'Zenith is more like a boutique hotel than a PG. The interiors are beautiful, the rooftop lounge is perfect for weekend hangouts, and the gym is well-maintained. Food is good but not exceptional for the price. Hinjewadi location is great if you work in IT but far from the main city.' },
  { hostelIdx: 9, userIdx: 2, ratings: { cleanliness: 5, food: 3, location: 2, safety: 5, staff: 4, valueForMoney: 3, overall: 4 },
    text: 'The facilities here are excellent — AC rooms, modern furniture, great gym. Security is top-notch with keycard access. But Hinjewadi is quite isolated and the food, while decent, does not justify the premium pricing. Best suited for IT professionals who work nearby.' },

  // Hostel 10 — Kothrud Student Hostel (Pune) — cheapest
  { hostelIdx: 10, userIdx: 4, ratings: { cleanliness: 2, food: 3, location: 4, safety: 3, staff: 2, valueForMoney: 5, overall: 3 },
    text: 'At 5000 per month, Kothrud Hostel is the cheapest option near MIT Pune. The food is basic vegetarian — edible but not exciting. Rooms are crowded and the cleanliness is below average. Staff is minimal. But if you just need a bed and meals while studying, it does the job.' },
  { hostelIdx: 10, userIdx: 2, ratings: { cleanliness: 2, food: 3, location: 4, safety: 3, staff: 3, valueForMoney: 5, overall: 3 },
    text: 'Purely functional accommodation. The mess serves dal-rice-roti three times a day — nothing more, nothing less. Bathrooms are shared and not cleaned often enough. But the location near MIT campus and the incredibly low rent make it a practical choice for students on a tight budget.' },

  // Hostel 11 — Sakura Ladies PG (Pune)
  { hostelIdx: 11, userIdx: 3, ratings: { cleanliness: 5, food: 4, location: 4, safety: 4, staff: 5, valueForMoney: 4, overall: 4 },
    text: 'Sakura PG has a unique aesthetic — the Japanese-inspired minimalism makes the rooms feel calm and spacious. The garden is perfect for evening walks. Food is healthy with a focus on balanced nutrition. The staff is wonderful and treats everyone like family. Viman Nagar is well-connected.' },
  { hostelIdx: 11, userIdx: 0, ratings: { cleanliness: 5, food: 5, location: 3, safety: 4, staff: 4, valueForMoney: 4, overall: 5 },
    text: 'The healthiest PG food I have ever had. They actually plan the menu with a nutritionist. The rooms are beautifully maintained and the garden gives a peaceful vibe. Slightly away from the main Pune areas but the auto-rickshaw connectivity is decent. Great for girls who value clean living.' },

  // Hostel 12 — Gateway Mens (Hyderabad)
  { hostelIdx: 12, userIdx: 4, ratings: { cleanliness: 3, food: 4, location: 4, safety: 3, staff: 3, valueForMoney: 4, overall: 4 },
    text: 'Gateway is a solid option near JNTU. The biryani on Fridays is legendary among the hostel residents. The cricket ground nearby is a big plus for sports lovers. Rooms are air-cooled which helps in Hyderabad summers. Cleanliness is acceptable but the corridors could be maintained better.' },
  { hostelIdx: 12, userIdx: 1, ratings: { cleanliness: 3, food: 4, location: 4, safety: 3, staff: 4, valueForMoney: 4, overall: 4 },
    text: 'Good hostel for engineering students at JNTU. The mess food is decent with proper Hyderabadi flavour — biryani, haleem during Ramadan, and regular meals are tasty. The common room has a TV and carrom board. Location in Kukatpally is convenient with metro access. Rooms need better fans.' },

  // Hostel 13 — Hitech City PG (Hyderabad)
  { hostelIdx: 13, userIdx: 0, ratings: { cleanliness: 4, food: 4, location: 5, safety: 4, staff: 4, valueForMoney: 3, overall: 4 },
    text: 'Hitech City PG is perfect if you work in Madhapur IT corridor. The shuttle service to tech parks is incredibly convenient. Rooms are well-furnished with good AC. Food offers both South and North Indian options. The gym is decent. Pricey but the location premium is justified.' },
  { hostelIdx: 13, userIdx: 2, ratings: { cleanliness: 4, food: 3, location: 5, safety: 4, staff: 3, valueForMoney: 3, overall: 4 },
    text: 'Great location in the heart of Hyderabad IT hub. Furnished rooms with fast internet — perfect for someone working in tech. The shuttle to nearby offices is a unique perk. Food is okay but not memorable. The laundry service is efficient. Overall a professional living experience.' },

  // Hostel 14 — Ameerpet Girls Hostel (Hyderabad)
  { hostelIdx: 14, userIdx: 3, ratings: { cleanliness: 3, food: 4, location: 5, safety: 5, staff: 4, valueForMoney: 4, overall: 4 },
    text: 'Ameerpet is the coaching capital of Hyderabad and this hostel is right in the middle of it. Two meals are included and the food is tasty home-style cooking. Security is very good with a warden who checks on us regularly. The 9 PM curfew is strict but understandable for safety.' },
  { hostelIdx: 14, userIdx: 1, ratings: { cleanliness: 3, food: 3, location: 5, safety: 5, staff: 4, valueForMoney: 4, overall: 4 },
    text: 'If you are preparing for competitive exams in Ameerpet, this hostel is perfectly located. Walking distance to all major coaching centres. The security setup gives peace of mind to parents. Meals are included and satisfactory. Rooms are a bit small but adequate for studying.' },

  // Hostel 15 — Gachibowli Elite PG (Hyderabad) — premium
  { hostelIdx: 15, userIdx: 2, ratings: { cleanliness: 5, food: 5, location: 4, safety: 5, staff: 5, valueForMoney: 3, overall: 5 },
    text: 'Gachibowli Elite is the best PG I have experienced in Hyderabad. The rooms are fully AC with premium mattresses. Multi-cuisine meals mean you never get bored. The rooftop gym overlooking the city is amazing. Security is military-grade with biometric access. Expensive but worth every rupee if you can afford it.' },
  { hostelIdx: 15, userIdx: 4, ratings: { cleanliness: 5, food: 4, location: 4, safety: 5, staff: 4, valueForMoney: 2, overall: 4 },
    text: 'Premium facilities — swimming pool, gym, great food, spotless rooms. Near ISB and University of Hyderabad which is convenient. The only issue is the price at 18k per month, which is steep for most students. But for those who prioritize comfort and safety, this is the gold standard in Hyderabad.' },

  // Hostel 16 — Andheri West (Mumbai)
  { hostelIdx: 16, userIdx: 4, ratings: { cleanliness: 3, food: 2, location: 5, safety: 3, staff: 3, valueForMoney: 3, overall: 3 },
    text: 'Location is the main selling point — 10-minute walk from Andheri station gives you access to all of Mumbai. But the hostel itself is cramped and noisy. No meals provided so you eat outside or cook. The building is old and maintenance is reactive. Acceptable for Mumbai prices but just barely.' },
  { hostelIdx: 16, userIdx: 1, ratings: { cleanliness: 3, food: 1, location: 5, safety: 3, staff: 3, valueForMoney: 3, overall: 3 },
    text: 'You are paying 9000 mostly for the Andheri location. The rooms are functional but nothing special. No food is the biggest inconvenience — eating out in Mumbai adds up fast. The wifi is decent and there is power backup. It is Mumbai so you adjust your expectations for the price.' },

  // Hostel 17 — Powai Lake PG (Mumbai) — premium, good all-round
  { hostelIdx: 17, userIdx: 0, ratings: { cleanliness: 5, food: 5, location: 4, safety: 5, staff: 5, valueForMoney: 3, overall: 5 },
    text: 'Powai Lake PG is a gem. The lake view from the reading lounge is peaceful and perfect for studying. Rooms are well-furnished with excellent AC. The meals are diverse — they even accommodate dietary preferences. Near IIT Bombay which is ideal for engineering students. Very well-managed.' },
  { hostelIdx: 17, userIdx: 3, ratings: { cleanliness: 4, food: 4, location: 4, safety: 5, staff: 4, valueForMoney: 3, overall: 4 },
    text: 'Beautiful PG with great facilities. The Hiranandani area is safe and well-maintained. Food is good with both North and South Indian options. The gym is small but sufficient. Pricing is high for Mumbai standards but the quality matches. The reading lounge with the lake view is unique and calming.' },

  // Hostel 18 — Dadar Ladies Hostel (Mumbai)
  { hostelIdx: 18, userIdx: 1, ratings: { cleanliness: 4, food: 5, location: 5, safety: 5, staff: 4, valueForMoney: 4, overall: 5 },
    text: 'Dadar Ladies Hostel has the best Maharashtrian food I have tasted outside of my home. The varan bhaat, usal pav, and misal are incredible. Central Mumbai location means you can reach anywhere by local train. Security is strict — no male visitors and proper ID checks. Perfect for girls new to Mumbai.' },
  { hostelIdx: 18, userIdx: 3, ratings: { cleanliness: 3, food: 5, location: 5, safety: 5, staff: 4, valueForMoney: 4, overall: 4 },
    text: 'The food alone makes this hostel worth it. Authentic Maharashtrian home cooking that you will not find anywhere else. Dadar station is a 5-minute walk, giving incredible connectivity. The building is old but the warden keeps it clean and safe. Strong recommendation for girls studying in Mumbai.' },

  // Hostel 19 — BKC Executive PG (Mumbai) — most expensive
  { hostelIdx: 19, userIdx: 2, ratings: { cleanliness: 5, food: 4, location: 5, safety: 5, staff: 5, valueForMoney: 2, overall: 4 },
    text: 'BKC Executive PG is more like a serviced apartment than a PG. The concierge service, coworking space, and rooftop are impressive. Everything is immaculate. The BKC location is excellent for anyone in finance or consulting. At 22k it is extremely expensive but the lifestyle experience is unmatched.' },
  { hostelIdx: 19, userIdx: 0, ratings: { cleanliness: 5, food: 4, location: 5, safety: 5, staff: 4, valueForMoney: 2, overall: 4 },
    text: 'Top-tier accommodation — feels like living in a hotel. The rooftop socializing area is great for networking with other young professionals. Coworking space saves you a WeWork membership. Security is excellent. The only issue is the price — at 22k per month it is clearly targeted at those with corporate budgets, not typical students.' },
];

// ─── MAIN SEED FUNCTION ────────────────────────────────────────────
async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing demo data
    console.log('🗑  Clearing existing data...');
    await Review.deleteMany({});
    await Hostel.deleteMany({});
    await User.deleteMany({});

    // 1. Create users
    console.log('👤 Creating users...');
    const users = await User.create(usersData);
    console.log(`   Created ${users.length} users`);

    // 2. Create hostels (all owned by admin user)
    console.log('🏠 Creating hostels...');
    const adminUser = users.find(u => u.role === 'admin') || users[4];
    const hostelsWithOwner = hostelsData.map(h => ({ ...h, createdBy: adminUser._id }));
    const hostels = await Hostel.create(hostelsWithOwner);
    console.log(`   Created ${hostels.length} hostels`);

    // 3. Create reviews
    console.log('📝 Creating reviews...');
    const reviewDocs = reviewTemplates.map(r => ({
      user: users[r.userIdx]._id,
      hostel: hostels[r.hostelIdx]._id,
      ratings: r.ratings,
      text: r.text,
    }));
    const reviews = await Review.create(reviewDocs);
    console.log(`   Created ${reviews.length} reviews`);

    // 4. Recalculate hostel ratings from reviews
    console.log('📊 Recalculating hostel ratings...');
    const hostelIdsWithReviews = [...new Set(reviewTemplates.map(r => r.hostelIdx))];
    for (const idx of hostelIdsWithReviews) {
      await recalculateHostelRatings(hostels[idx]._id);
    }
    console.log(`   Recalculated ratings for ${hostelIdsWithReviews.length} hostels`);

    // 5. Add some favorites for demo user
    const demoUser = users[0];
    demoUser.favorites = [hostels[4]._id, hostels[17]._id, hostels[1]._id];
    await demoUser.save();
    console.log('⭐ Added demo user favorites');

    // Summary
    console.log('\n══════════════════════════════════════════');
    console.log('  StayWise Demo Seed Complete');
    console.log('══════════════════════════════════════════');
    console.log(`  Users:   ${users.length}`);
    console.log(`  Hostels: ${hostels.length}`);
    console.log(`  Reviews: ${reviews.length}`);
    console.log('');
    console.log('  Demo Login:');
    console.log('    Email:    demo@staywise.com');
    console.log('    Password: Demo@1234');
    console.log('══════════════════════════════════════════\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
