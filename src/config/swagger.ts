import swaggerJsdoc from 'swagger-jsdoc';
import type { Options as SwaggerOptions } from 'swagger-jsdoc';
import environment from './environment';

const swaggerOptions: SwaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SelfServe API',
      version: '1.0.0',
      description: 'API for hotel self-service platform',
      contact: {
        name: 'API Support',
        email: 'support@selfserve.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${environment.port}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        guestId: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Guest-ID',
          description: 'Guest unique identifier'
        },
        hotelId: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Hotel-ID',
          description: 'Hotel unique identifier'
        }
      }
    },
    tags: [
      {
        name: 'Guest Profile',
        description: 'Guest profile management'
      },
      {
        name: 'Guest Messages',
        description: 'Guest messages and announcements'
      },
      {
        name: 'Guest Feedback',
        description: 'Guest feedback and ratings'
      },
      {
        name: 'Dining',
        description: 'Dining requests management'
      },
      {
        name: 'Management',
        description: 'Hotel management endpoints'
      }
    ]
  },
  apis: [
    './src/api/**/*.ts', 
    './src/models/schema.ts',
    './src/types/*.ts'
  ]
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions); 