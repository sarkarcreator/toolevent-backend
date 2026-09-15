import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { DigitalProduct, AffiliateItem, SupportedCountry, SupportedCurrency } from '../types';

export interface DBUser { id:string; email:string; passwordHash:string; name:string; role:'USER'|'ADMIN'; subscriptionTier:'FREE'|'REGISTERED'|'PRO'|'ENTERPRISE'; countryPreference:SupportedCountry; currencyPreference:SupportedCurrency; emailVerified:boolean; createdAt:string; }
export interface DBCalculation { id:string; userId?:string; toolType:string; title:string; country:SupportedCountry; currency:SupportedCurrency; inputs:Record<string,any>; results:Record<string,any>; notes?:string; isPublic:boolean; createdAt:string; updatedAt:string; }
export interface DBSavedPlan { id:string; userId:string; title:string; eventType:string; country:SupportedCountry; city?:string; targetDate?:string; guestCount:number; budgetTotal:number; planData:any; createdAt:string; updatedAt:string; }
export interface DBOrder { id:string; userId?:string; customerEmail:string; customerName:string; currency:SupportedCurrency; totalAmount:number; status:'PENDING'|'PAID'|'FAILED'|'REFUNDED'|'CANCELLED'; paymentProvider:string; items:{productId:string;name:string;price:number}[]; createdAt:string; }
export interface DBAffiliateClick { id:string; affiliateId:string; slug:string; referer?:string; country?:string; createdAt:string; }
export interface DBAIUsage { id:string; userId?:string; action:string; tokensUsed:number; createdAt:string; }
export interface DBContactMessage { id:string; name:string; email:string; subject:string; message:string; isRead:boolean; createdAt:string; }
export interface DBBlogPost { id:string; slug:string; title:string; excerpt:string; content:string; category:string; author:string; readTime:string; tags:string[]; publishedAt:string; isPublished:boolean; }