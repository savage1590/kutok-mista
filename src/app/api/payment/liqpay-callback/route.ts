import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import crypto from "crypto";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const data = formData.get("data") as string;
    const signature = formData.get("signature") as string;

    if (!data || !signature) {
      return NextResponse.json({ error: "Missing data or signature" }, { status: 400 });
    }

    const privateKey = process.env.LIQPAY_PRIVATE_KEY || '';
    
    // Verify signature
    const expectedSignature = crypto
      .createHash('sha1')
      .update(privateKey + data + privateKey)
      .digest('base64');

    if (signature !== expectedSignature) {
      console.error("Invalid LiqPay signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Decode base64 data
    const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf8'));
    const orderId = decodedData.order_id;
    const status = decodedData.status;

    if (!orderId) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    // LiqPay Success statuses
    const isSuccess = status === 'success' || status === 'wait_accept';
    const paymentStatus = isSuccess ? 'paid' : (status === 'error' || status === 'failure' ? 'failed' : 'pending');

    // Update DB
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ payment_status: paymentStatus })
      .eq('id', orderId);

    if (updateError) {
      console.error("Error updating order payment status:", updateError);
      return NextResponse.json({ error: "Database update failed" }, { status: 500 });
    }

    // If paid, send telegram notification update
    if (isSuccess) {
      try {
        const botToken = "8934355636:AAFcNT63FcEwRMoPxrK_fuGY9HOU9apcVf8";
        const groupId = "-1003945954990";
        const text = `✅ ЗАМОВЛЕННЯ #${orderId.slice(0, 8)} ОПЛАЧЕНО!\n\nОплата через LiqPay успішно отримана.`;
        
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: groupId, text })
        });
      } catch (err) {
        console.error("Failed to send telegram payment notification", err);
      }
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("LiqPay webhook error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
