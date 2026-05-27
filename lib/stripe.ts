import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});

interface CreateCheckoutSessionArgs {
  eventId: string;
  bookingId: string;
  price: number;
  eventTitle: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Stripe Checkout セッションを作成
 *
 * @returns Checkout の URL
 */
export async function createCheckoutSession({
  eventId,
  bookingId,
  price,
  eventTitle,
  customerEmail,
  successUrl,
  cancelUrl,
}: CreateCheckoutSessionArgs): Promise<{ url: string; sessionId: string }> {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "jpy",
          product_data: {
            name: eventTitle,
          },
          unit_amount: price,
        },
        quantity: 1,
      },
    ],
    customer_email: customerEmail,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      event_id: eventId,
      booking_id: bookingId,
    },
  });

  if (!session.url) {
    throw new Error("Stripe Checkout URL was not returned");
  }

  return { url: session.url, sessionId: session.id };
}
