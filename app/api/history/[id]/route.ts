import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { deleteFromR2 } from "@/lib/r2";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const image = await db.generatedImage.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!image) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete from R2 if stored
  if (image.storageKey) {
    await deleteFromR2(image.storageKey);
  }

  await db.generatedImage.delete({ where: { id: image.id } });

  return NextResponse.json({ success: true });
}