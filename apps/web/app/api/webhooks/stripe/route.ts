import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    // This is a placeholder for the Stripe webhook handler.
    // You will need to verify the signature and handle events like 'checkout.session.completed'.

    const body = await request.text()
    // console.log('Received Stripe Webhook:', body)

    return NextResponse.json({ received: true })
}
