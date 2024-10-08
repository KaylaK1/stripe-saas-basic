import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import Stripe from 'stripe';
import { HTTPException } from 'hono/http-exception';
import "dotenv/config";

// Strip Instantiation
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);


// Routes for Web API
const app = new Hono()

// Event responses from Stripe endpoint. 
// You select what event types you want to listen to 
app.post('/webhook', async (c) => {
  const rawBody = await c.req.text();
  // A signature sent from Stripe - it's combined with the rawBody and local secret
  // to determine authenticity
  const signature = c.req.header('stripe-signature');

  let event;
  try { // constructs and verifies the signature of an event
    event = stripe.webhooks.constructEvent(rawBody, signature!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error: any) {
    console.error(`Web hook signature verification failed: ${error.message}`);
    throw new HTTPException(400)
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log(session)

    // TODO Fullfill the purchase with business logic
  }
  
  return c.text('success');
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

app.get('/', (c) => {
  const html = `
    <!DOCTYPE html>
        <html>
            <head>
                <title>
                  Checkout
                </title>
                  <!-- Frontend Library to redirect users to Checkout Session -->
                  <script src="https://js.stripe.com/v3/"></script>
            </head>
            <body>
                <h1>Checkout</h1>
                <button id="checkoutButton">Checkout</button>

                <script>
                    const checkoutButton = document.getElementById('checkoutButton');
                    checkoutButton.addEventListener('click', async () => {
                        const response = await fetch('/checkout', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        });
                        const { id } = await response.json();
                        const stripe = Stripe('${process.env.STRIPE_PUBLISHABLE_KEY}');
                        await stripe.redirectToCheckout({ sessionId: id });
                    });
                </script>
            </body>
          </html>
    `;

    return c.html(html);
})

app.get('/success', (c) => {
  return c.text('checkout success');
})

// Start the Node Server with the Hono Web Framework
const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
