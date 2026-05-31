import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic'; // Ensure it doesn't cache, we want to ping the server

export async function GET() {
  try {
    // A lightweight query to keep Supabase connection warm
    await supabase.from('settings').select('id').limit(1);
    
    return NextResponse.json({ 
      status: "ok", 
      time: new Date().toISOString() 
    });
  } catch (error) {
    return NextResponse.json({ 
      status: "error",
      message: "Database ping failed" 
    }, { status: 500 });
  }
}
