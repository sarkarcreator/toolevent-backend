import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { DigitalProduct, AffiliateItem, SupportedCountry, SupportedCurrency } from '../types';

export interface DBUser { id:string; email:string; passwordHash:string; name:string; role:'USER'|'ADMIN'; subscriptionTier:'FREE'|'REGISTERED'|'PRO'|'ENTERPRISE'; countryPreference:SupportedCountry; currencyPreference:SupportedCurrency; emailVerified:boolean; createdAt:string; }
export interface DBCalculation { id:string; userId?:string; toolType:string; title:string; country:SupportedCountry; currency:SupportedCurrency; inputs:Record<string,any>; results:Record<string,any>; notes?:string; createdAt:string; updatedAt:string; }
export interface DBSavedPlan { id:string; userId:string; title:string; eventType:string; country:SupportedCountry; city?:string; targetDate?:string; guestCount:number; budgetTotal:number; planData:any; createdAt:string; updatedAt:string; }
export interface DBOrder { id:string; userId?:string; customerEmail:string; customerName:string; currency:SupportedCurrency; totalAmount:number; status:'PENDING'|'PAID'|'FAILED'|'REFUNDED'|'CANCELLED'; paymentProvider:string; items:{productId:string;name:string;price:number}[]; createdAt:string; }
export interface DBAffiliateClick { id:string; affiliateId:string; slug:string; referer?:string; country?:string; createdAt:string; }
export interface DBAIUsage { id:string; userId?:string; action:string; tokensUsed:number; createdAt:string; }
export interface DBContactMessage { id:string; name:string; email:string; subject:string; message:string; isRead:boolean; createdAt:string; }
export interface DBBlogPost { id:string; slug:string; title:string; excerpt:string; content:string; category:string; author:string; readTime:string; tags:string[]; publishedAt:string; isPublished:boolean; }

const calcOut=(x:any):DBCalculation=>({...x,createdAt:new Date(x.createdAt).toISOString(),updatedAt:new Date(x.updatedAt).toISOString()});
const planOut=(x:any):DBSavedPlan=>({...x,createdAt:new Date(x.createdAt).toISOString(),updatedAt:new Date(x.updatedAt).toISOString()});
const blogOut=(x:any):DBBlogPost=>({...x,tags:Array.isArray(x.tags)?x.tags:[],publishedAt:new Date(x.publishedAt).toISOString()});

const PRODUCTS:DigitalProduct[]=[
{id:'prod_01',slug:'ultimate-event-budget-planner',name:'Ultimate Event Budget Planner',category:'Budget & Finance',description:'Professional multi-currency Excel & Google Sheets model with dynamic contingency, vendor payment milestones, and real-time variance dashboard.',features:['5 Multi-tab spreadsheets (Summary, Line Items, Variance, Cashflow, Invoices)','Built-in currency switchers for USD, AED, and GBP','Automatic contingency calculations and overspend alerts','Print-ready PDF summaries and client presentation templates'],priceUSD:29,priceAED:105,priceGBP:23,badge:'Best Seller',fileDownloadKey:'ultimate_event_budget_planner_v2.xlsx',isActive:true},
{id:'prod_02',slug:'wedding-budget-planner',name:'Wedding Budget Planner Pro',category:'Weddings',description:'Comprehensive wedding budget toolkit customized for USA, UK, and UAE weddings with industry spend benchmarks and vendor payment schedules.',features:['Over 140 pre-categorized wedding expense line items','Industry benchmark comparison gauges (Venue, Decor, Attire)','Payment due date tracker with automatic calendar alerts','Guest RSVP & seating budget link'],priceUSD:39,priceAED:140,priceGBP:31,badge:'Popular',fileDownloadKey:'wedding_budget_planner_pro.xlsx',isActive:true},
{id:'prod_03',slug:'corporate-event-planner',name:'Corporate Event Planner',category:'Corporate',description:'Corporate-grade event management toolkit with stakeholder reporting, ROI models, RFP vendor comparison matrices, and run-of-show templates.',features:['Executive board summary dashboard','Vendor RFP scoring matrix','Sponsorship tiered package calculator','Minute-by-minute master run of show'],priceUSD:49,priceAED:180,priceGBP:39,badge:'Executive',fileDownloadKey:'corporate_event_planner_bundle.xlsx',isActive:true},
{id:'prod_04',slug:'conference-planner',name:'Conference Planner & Stage Flow',category:'Conferences',description:'Full scale conference planning system covering multi-track speaker management, AV production run sheets, registration logistics, and sponsor tiers.',features:['Multi-stage agenda and speaker scheduler','AV technician cue sheet and teleprompter script tracker','Catering break and dietary distribution model','Sponsor booth floorplan inventory manager'],priceUSD:49,priceAED:180,priceGBP:39,fileDownloadKey:'conference_planner_toolkit.xlsx',isActive:true},
{id:'prod_05',slug:'event-profit-planner',name:'Event Profit & Ticket Yield Planner',category:'Profit & Revenue',description:'Advanced financial modeling tool to optimize ticket tier pricing, simulate attendance elasticity, and maximize gross profit margins.',features:['Multi-tier ticket pricing simulator (Early Bird, GA, VIP)','Payment processor and platform fee deduction models','Break-even sensitivity curve with capacity ceilings','Sponsorship & Merchandise margin calculations'],priceUSD:35,priceAED:129,priceGBP:28,fileDownloadKey:'event_profit_planner.xlsx',isActive:true},
{id:'prod_06',slug:'event-roi-planner',name:'Event ROI & Value Calculator',category:'Corporate',description:'B2B event ROI analysis tool to calculate direct revenue, pipeline generation, customer acquisition cost (CAC), and multi-touch brand attribution.',features:['Sales pipeline attribution formula','Cost per qualified lead (CPL) analytics','Post-event stakeholder ROI slide deck template','Comparative year-over-year event efficiency matrix'],priceUSD:35,priceAED:129,priceGBP:28,fileDownloadKey:'event_roi_planner.xlsx',isActive:true},
{id:'prod_07',slug:'event-planning-checklist',name:'Event Planning Master Checklist',category:'Checklists & Ops',description:'A comprehensive 300+ item operational timeline from 12 months out to post-event teardown, fully editable in Excel, Notion, and PDF.',features:['Timeline segmented into 9 distinct planning phases','Role delegation tags and progress completion meters','Emergency contingency and vendor risk checklist','Post-event invoice and vendor reconciliation sheet'],priceUSD:19,priceAED:70,priceGBP:15,fileDownloadKey:'event_planning_checklist_master.xlsx',isActive:true},
{id:'prod_08',slug:'complete-event-planning-bundle',name:'Complete Event Planning Bundle (All 7 Planners)',category:'Bundles',description:'Get all 7 professional event planning tools, financial models, checklists, and templates in one complete master bundle at a 60% discount.',features:['Includes all 7 standalone planners and toolkits','Lifetime updates and future template releases','Bonus: 50+ Event contract clause templates & vendor RFPs','Priority email support and setup consultation guide'],priceUSD:99,priceAED:360,priceGBP:79,badge:'Best Value (Save 60%)',fileDownloadKey:'complete_event_planning_bundle_master.zip',isActive:true}
];
const AFFILIATES:AffiliateItem[]=[
{id:'aff_01',slug:'rsvpify',name:'RSVPify',company:'RSVPify LLC',category:'Registration & RSVP',targetUrl:'https://rsvpify.com',description:'End-to-end event management, customized RSVP workflows, and online ticket sales.',commission:'Up to 25% recurring',country:'GLOBAL',clicksCount:142},
{id:'aff_02',slug:'jotform',name:'Jotform Event Forms',company:'Jotform Inc.',category:'Event Forms',targetUrl:'https://jotform.com',description:'Powerful custom registration forms, waiver signatures, and vendor intake forms.',commission:'30% recurring',country:'GLOBAL',clicksCount:89},
{id:'aff_03',slug:'eventbrite',name:'Eventbrite Organizers',company:'Eventbrite Inc.',category:'Ticketing & Discovery',targetUrl:'https://eventbrite.com',description:'Global ticketing platform and attendee discovery marketplace for ticketed events.',commission:'Tiered partner rate',country:'GLOBAL',clicksCount:210},
{id:'aff_04',slug:'canva',name:'Canva Pro for Events',company:'Canva Pty Ltd',category:'Marketing & Design',targetUrl:'https://canva.com',description:'Design luxury invitations, name badges, social banners, and event print collateral.',commission:'$36 per new subscriber',country:'GLOBAL',clicksCount:175},
{id:'aff_05',slug:'asana',name:'Asana Event Operations',company:'Asana Inc.',category:'Project Management',targetUrl:'https://asana.com',description:'Keep your entire event staff, volunteers, and vendors on schedule in real time.',commission:'20% commission',country:'GLOBAL',clicksCount:64}
];
const BLOGS=[
{id:'blog_01',slug:'how-to-create-an-event-budget',title:'How to Create a Rock-Solid Event Budget (With Free Formulas & Checklist)',excerpt:'A step-by-step masterclass in allocating venue, catering, AV production, and contingency funds without nasty surprise costs.',content:'Planning an event without a rigorous budget is like sailing a ship without a compass.\n\n### 1. The Rule of Seven Categories\nProfessional event planners group expenses into core buckets.\n\n### 2. Factoring the Hidden Costs\nAlways account for local taxes, venue service fees, overtime and processing charges.\n\n### 3. Calculate with Toolbox.Events\nUse our Event Budget Calculator to benchmark guest counts and budgets.',category:'Budgeting',author:'Elena Rostova, Lead Event Strategist',readTime:'6 min read',tags:['Budgeting','Planning','Corporate','Conferences']},
{id:'blog_02',slug:'how-much-should-i-charge-for-event-tickets',title:'How Much Should You Charge for Event Tickets? The Complete Pricing Strategy',excerpt:'Learn the mathematical formula to price your event tickets, cover all fixed fees, and guarantee your desired profit margin.',content:'Setting the right ticket price is a delicate balance of covering costs, capturing perceived value, and driving ticket velocity.\n\n### The Pricing Math\nUse fixed costs, per-attendee cost, target profit and payment fees to establish a sustainable ticket price.\n\n### The Tiered Pricing Secret\nStructure Early Bird, General Admission and VIP tiers.',category:'Ticketing & Profit',author:'David Chen, Event Finance Director',readTime:'5 min read',tags:['Ticketing','Pricing','Profit','ROI']},
{id:'blog_03',slug:'dubai-wedding-budget-guide',title:'Dubai Wedding Budget Guide 2026: Realistic Costs in AED & Luxury Planning',excerpt:'Everything you need to know about wedding venue fees, luxury floral arrangements, municipality taxes, and catering rates across the UAE.',content:'Dubai is one of the premier luxury destination wedding hubs in the world. Planning a wedding in the UAE involves unique cost structures that differ from western markets.\n\n### Key UAE Cost Factors\nVenue, VAT, service fees and regional decor should all be considered.',category:'Weddings',author:'Noor Al-Mansoor, Dubai Event Planner',readTime:'7 min read',tags:['Weddings','Dubai','UAE','Luxury']},
{id:'blog_04',slug:'how-to-calculate-event-roi',title:'How to Calculate Event ROI & Prove Business Value to Executives',excerpt:'Turn fuzzy event metrics into hard revenue, pipeline attribution, and cost-per-lead statistics that your CFO will love.',content:'Executives no longer greenlight corporate events for vanity. Every investment must show clear return on investment.\n\n### The Simple ROI Formula\nCompare net return against total investment to quantify event ROI.\n\n### Measuring Indirect Pipeline\nInclude sourced and accelerated pipeline value after the event.',category:'Analytics',author:'David Chen, Event Finance Director',readTime:'6 min read',tags:['ROI','Corporate','Analytics','B2B']}
];

let seedPromise: Promise<void> | undefined;

async function seedDatabase() {
  const email = process.env.ADMIN_EMAIL || 'admin@toolbox.events';
  const password = process.env.ADMIN_PASSWORD || 'Admin123!';

  if (
    !(await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    }))
  ) {
    await prisma.user.create({
      data: {
        id: 'usr_admin_01',
        email,
        passwordHash: await bcrypt.hash(password, 10),
        name: 'System Admin',
        role: 'ADMIN',
        subscriptionTier: 'PRO',
        countryPreference: 'USA',
        currencyPreference: 'USD',
        emailVerified: true,
      },
    });
  }

  for (const p of PRODUCTS) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        category: p.category,
        description: p.description,
        features: p.features as any,
        priceUSD: p.priceUSD,
        priceAED: p.priceAED,
        priceGBP: p.priceGBP,
        badge: p.badge,
        fileDownloadKey: p.fileDownloadKey,
        isActive: p.isActive,
      },
      create: {
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: p.category,
        description: p.description,
        features: p.features as any,
        priceUSD: p.priceUSD,
        priceAED: p.priceAED,
        priceGBP: p.priceGBP,
        badge: p.badge,
        fileDownloadKey: p.fileDownloadKey,
        isActive: p.isActive,
      },
    });
  }

  for (const a of AFFILIATES) {
    await prisma.affiliate.upsert({
      where: { slug: a.slug },
      update: {
        name: a.name,
        company: a.company,
        category: a.category,
        targetUrl: a.targetUrl,
        description: a.description,
        commission: a.commission,
        country: a.country,
        isActive: true,
      },
      create: {
        id: a.id,
        slug: a.slug,
        name: a.name,
        company: a.company,
        category: a.category,
        targetUrl: a.targetUrl,
        description: a.description,
        commission: a.commission,
        country: a.country,
        isActive: true,
        clicksCount: a.clicksCount,
      },
    });
  }

  for (const b of BLOGS) {
    await prisma.blogPost.upsert({
      where: { slug: b.slug },
      update: {
        title: b.title,
        excerpt: b.excerpt,
        content: b.content,
        category: b.category,
        author: b.author,
        readTime: b.readTime,
        tags: b.tags as any,
        isPublished: true,
      },
      create: {
        id: b.id,
        slug: b.slug,
        title: b.title,
        excerpt: b.excerpt,
        content: b.content,
        category: b.category,
        author: b.author,
        readTime: b.readTime,
        tags: b.tags as any,
        isPublished: true,
      },
    });
  }

  const settings = {
    heroHeadline: 'Plan Your Event With Confidence',
    heroSubheading:
      'Free calculators, AI planning tools, budgets, profit calculators and professional event templates for the USA, UAE and UK.',
    aiFreeTierMonthlyLimit: 3,
    aiRegisteredMonthlyLimit: 15,
    aiProMonthlyLimit: 100,
    allowRegistration: true,
  };

  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value: value as any },
      create: { key, value: value as any },
    });
  }
}

async function ensureSeeded() {
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    const email = process.env.ADMIN_EMAIL || 'admin@toolbox.events';

    const [
      admin,
      productCount,
      affiliateCount,
      blogCount,
      settings,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { email },
        select: { id: true },
      }),
      prisma.product.count(),
      prisma.affiliate.count(),
      prisma.blogPost.count(),
      prisma.siteSetting.count(),
    ]);

    const seedComplete =
      !!admin &&
      productCount >= PRODUCTS.length &&
      affiliateCount >= AFFILIATES.length &&
      blogCount >= BLOGS.length &&
      settings >= 5;

    if (seedComplete) {
      return;
    }

    await seedDatabase();
  })().catch((error) => {
    seedPromise = undefined;
    throw error;
  });

  return seedPromise;
}

export const db={
 users:{
  findUnique:async({where}:{where:{email?:string;id?:string}})=>{await ensureSeeded();if(where.email)return prisma.user.findUnique({where:{email:where.email}});if(where.id)return prisma.user.findUnique({where:{id:where.id}});return null;},
  create:async({data}:{data:any})=>{await ensureSeeded();return prisma.user.create({data});},
  findMany:async()=>{await ensureSeeded();const rows=await prisma.user.findMany();return rows.map(({passwordHash,...u})=>u);},count:async()=>{await ensureSeeded();return prisma.user.count()}
 },
 calculations:{
  create:async({data}:{data:any})=>{await ensureSeeded();return calcOut(await prisma.calculation.create({data}));},
  findMany:async({where}:{where?:{userId?:string;toolType?:string}}={})=>{await ensureSeeded();return (await prisma.calculation.findMany({where})).map(calcOut);},
  findUnique:async({where}:{where:{id:string}})=>{await ensureSeeded();const x=await prisma.calculation.findUnique({where});return x?calcOut(x):null;},
  update:async({where,data}:{where:{id:string};data:any})=>{await ensureSeeded();return calcOut(await prisma.calculation.update({where,data}));},
  delete:async({where}:{where:{id:string}})=>{await ensureSeeded();await prisma.calculation.delete({where});return true;},count:async()=>{await ensureSeeded();return prisma.calculation.count()}
 },
 savedPlans:{
  create:async({data}:{data:any})=>{await ensureSeeded();return planOut(await prisma.savedPlan.create({data}));},
  findMany:async({where}:{where?:{userId?:string}}={})=>{await ensureSeeded();return (await prisma.savedPlan.findMany({where,orderBy:{createdAt:'desc'}})).map(planOut);},
  delete:async({where}:{where:{id:string}})=>{await ensureSeeded();await prisma.savedPlan.delete({where});return true;},count:async()=>{await ensureSeeded();return prisma.savedPlan.count()}
 },
 products:{findMany:async()=>{await ensureSeeded();return prisma.product.findMany({where:{isActive:true},orderBy:{createdAt:'asc'}});},findUnique:async({where}:{where:{slug?:string;id?:string}})=>{await ensureSeeded();if(where.slug)return prisma.product.findUnique({where:{slug:where.slug}});if(where.id)return prisma.product.findUnique({where:{id:where.id}});return null;},count:async()=>{await ensureSeeded();return prisma.product.count({where:{isActive:true}})}},
 orders:{
  create:async({data}:{data:any})=>{await ensureSeeded();const order:any=await prisma.order.create({data:{userId:data.userId,customerEmail:data.customerEmail,customerName:data.customerName,currency:data.currency,totalAmount:data.totalAmount,status:data.status,paymentProvider:data.paymentProvider,items:{create:(data.items||[]).map((i:any)=>({productId:i.productId,price:i.price,currency:data.currency}))}},include:{items:{include:{product:true}}}});return {...order,items:order.items.map((i:any)=>({productId:i.productId,name:i.product.name,price:i.price}))};},
  findMany:async({where}:{where?:{userId?:string;customerEmail?:string}}={})=>{await ensureSeeded();const rows:any[]=await prisma.order.findMany({where,include:{items:{include:{product:true}}},orderBy:{createdAt:'desc'}});return rows.map(o=>({...o,createdAt:o.createdAt.toISOString(),items:o.items.map((i:any)=>({productId:i.productId,name:i.product.name,price:i.price}))}));},
  findUnique:async({where}:{where:{id:string}})=>{await ensureSeeded();const o:any=await prisma.order.findUnique({where,include:{items:{include:{product:true}}}});return o?{...o,createdAt:o.createdAt.toISOString(),items:o.items.map((i:any)=>({productId:i.productId,name:i.product.name,price:i.price}))}:null;},count:async()=>{await ensureSeeded();return prisma.order.count();},totalRevenue:async()=>{await ensureSeeded();const rows=await prisma.order.findMany({where:{status:'PAID'},select:{totalAmount:true}});return rows.reduce((s,o)=>s+o.totalAmount,0)}
 },
 affiliates:{findMany:async()=>{await ensureSeeded();return prisma.affiliate.findMany({where:{isActive:true},orderBy:{name:'asc'}});},findUnique:async({where}:{where:{slug:string}})=>{await ensureSeeded();return prisma.affiliate.findUnique({where});},trackClick:async(slug:string,meta?:{referer?:string;country?:string})=>{await ensureSeeded();const a=await prisma.affiliate.findUnique({where:{slug}});if(!a)return null;await prisma.$transaction([prisma.affiliate.update({where:{id:a.id},data:{clicksCount:{increment:1}}}),prisma.affiliateClick.create({data:{affiliateId:a.id,referer:meta?.referer,country:meta?.country}})]);return {...a,clicksCount:a.clicksCount+1};},totalClicks:async()=>{await ensureSeeded();const rows=await prisma.affiliate.findMany({select:{clicksCount:true}});return rows.reduce((s,a)=>s+a.clicksCount,0)}},
 aiUsage:{record:async(userId:string|undefined,action:string,tokensUsed=250)=>{await ensureSeeded();return prisma.aIUsage.create({data:{userId,action,tokensUsed,model:process.env.PUBLICAI_MODEL||'swiss-ai/apertus-v1.5-8b'}});},getMonthlyCount:async(userId?:string)=>{await ensureSeeded();return prisma.aIUsage.count({where:{userId,createdAt:{gt:new Date(Date.now()-30*86400000)}}});},count:async()=>{await ensureSeeded();return prisma.aIUsage.count()}},
 blog:{findMany:async()=>{await ensureSeeded();return (await prisma.blogPost.findMany({where:{isPublished:true},orderBy:{publishedAt:'desc'}})).map(blogOut);},findUnique:async({where}:{where:{slug:string}})=>{await ensureSeeded();const b=await prisma.blogPost.findUnique({where});return b?blogOut(b):null;},count:async()=>{await ensureSeeded();return prisma.blogPost.count()}},
 contact:{create:async(data:any)=>{await ensureSeeded();return prisma.contactMessage.create({data});},findMany:async()=>{await ensureSeeded();return prisma.contactMessage.findMany({orderBy:{createdAt:'desc'}});},count:async()=>{await ensureSeeded();return prisma.contactMessage.count()}},
 settings:{get:async()=>{await ensureSeeded();const rows=await prisma.siteSetting.findMany();return Object.fromEntries(rows.map(r=>[r.key,r.value]));},update:async(updates:Record<string,any>)=>{await ensureSeeded();for(const [key,value] of Object.entries(updates))await prisma.siteSetting.upsert({where:{key},update:{value:value as any},create:{key,value:value as any}});return db.settings.get();}}
};
