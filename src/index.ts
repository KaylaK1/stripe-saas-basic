import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import "dotenv/config";

// Strip Instantiation
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);





// Routes for Web API
const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.post('/', (c) => {
  return c.text('Post Request')
})

const port = 3000
console.log(`Server is running on port ${port}`)

// Start the Node Server with the Hono Web Framework
serve({
  fetch: app.fetch,
  port
})
