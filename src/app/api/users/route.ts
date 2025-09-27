import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; 
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  try {
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { email, firstName, lastName, role } = body;

    const newUser = await prisma.user.create({
      data: {
        id: userId,
        email,
        role,
        first_name: firstName,
        last_name: lastName,
      },
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    console.error("Error saving user to Neon:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
