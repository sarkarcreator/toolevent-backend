import { NextResponse } from 'next/server';

export async function GET() {
  const openApiSpec = {
    openapi: '3.0.3',
    info: {
      title: 'Toolbox.Events API Specification',
      version: '1.0.0',
      description:
        'Official REST API for Toolbox.Events — Free Tools for Planning Better Events. Supports multi-currency calculations, AI Event Planner, Saved Calculations, Template Store Orders, and Admin Metrics.',
      contact: {
        name: 'Toolbox.Events Support',
        email: 'support@toolbox.events',
        url: 'https://toolbox.events',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Primary API Server',
      },
    ],
    tags: [
      { name: 'Authentication', description: 'User registration, login, session, and JWT management' },
      { name: 'Calculators', description: 'Multi-currency pure mathematical event planning engines' },
      { name: 'AI Planner', description: 'Gemini-powered 12-section master event strategy generation' },
      { name: 'Calculations', description: 'User calculation persistence, updating, and retrieval' },
      { name: 'Products & Orders', description: 'Digital templates catalog and checkout processing' },
      { name: 'Affiliates', description: 'Affiliate referral endpoints and click tracking' },
      { name: 'Admin', description: 'Executive metrics and CMS operations' },
    ],
    paths: {
      '/api/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register a new user account',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password', 'name'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 },
                    name: { type: 'string' },
                    country: { type: 'string', enum: ['USA', 'UAE', 'UK'] },
                    currency: { type: 'string', enum: ['USD', 'AED', 'GBP'] },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'User created successfully with auth token' },
            400: { description: 'Validation error' },
            409: { description: 'Duplicate email' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Authenticate with email and password',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Authentication successful with JWT' },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/api/auth/me': {
        get: {
          tags: ['Authentication'],
          summary: 'Get current user session and AI credit balance',
          responses: {
            200: { description: 'Current authenticated user object' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/calculators/{type}': {
        post: {
          tags: ['Calculators'],
          summary: 'Execute a specific event planning calculation',
          parameters: [
            {
              name: 'type',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
                enum: [
                  'event-budget',
                  'event-profit',
                  'ticket-price',
                  'break-even',
                  'event-roi',
                  'wedding-budget',
                  'catering',
                  'event-staffing',
                  'guest',
                  'checklist',
                ],
              },
            },
          ],
          responses: {
            200: { description: 'Calculation successfully computed' },
          },
        },
      },
      '/api/ai/event-plan': {
        post: {
          tags: ['AI Planner'],
          summary: 'Generate a 12-section master event strategy using Gemini AI',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['eventType', 'guestCount', 'budget'],
                  properties: {
                    eventType: { type: 'string' },
                    country: { type: 'string', enum: ['USA', 'UAE', 'UK'] },
                    city: { type: 'string' },
                    guestCount: { type: 'number' },
                    budget: { type: 'number' },
                    currency: { type: 'string', enum: ['USD', 'AED', 'GBP'] },
                    eventDate: { type: 'string' },
                    goals: { type: 'string' },
                    style: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Complete structured event plan object returned' },
            429: { description: 'Rate limit exceeded' },
          },
        },
      },
      '/api/calculations': {
        get: {
          tags: ['Calculations'],
          summary: 'List saved calculations',
          responses: { 200: { description: 'List of calculations' } },
        },
        post: {
          tags: ['Calculations'],
          summary: 'Save a calculation',
          responses: { 200: { description: 'Calculation saved' } },
        },
      },
      '/api/products': {
        get: {
          tags: ['Products & Orders'],
          summary: 'List available digital template products',
          responses: { 200: { description: 'Product list' } },
        },
      },
      '/api/orders': {
        post: {
          tags: ['Products & Orders'],
          summary: 'Create and process template checkout order',
          responses: { 200: { description: 'Order created with download key' } },
        },
      },
      '/api/admin/stats': {
        get: {
          tags: ['Admin'],
          summary: 'Executive dashboard analytics and usage metrics',
          responses: { 200: { description: 'Aggregate statistics' } },
        },
      },
    },
  };

  return NextResponse.json(openApiSpec);
}
