import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import Stripe from 'stripe';
import { HTTPException } from 'hono/http-exception';
import "dotenv/config";

// Strip Instantiation
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);


// Routes for Web API
const app = new Hono()

app.get('/success', (c) => {
  return c.text('Success!')
})

app.get('/cancel', (c) => {
  return c.text('Canceled!')
})

// Hardcoded Product Test
// Callback with context argument
app.post('/checkout', async (c) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1Q3UMgHHxosx5eaLBLMokL6T',
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    });

    return c.json(session);
  } catch (error: any) {
    console.error(error);
    throw new HTTPException(500, { message: error?.message });
  }
});




// Start the Node Server with the Hono Web Framework
const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
