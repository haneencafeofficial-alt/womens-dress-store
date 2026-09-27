import { db } from "@/db";
import { dressOrders, type StoredOrderItem } from "@/db/schema";
import { dresses, shippingThresholdCents, standardShippingCents } from "@/lib/dresses";

function invalid(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return invalid("Please check your order details and try again.");
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return invalid("Please check your order details and try again.");
  }

  const body = payload as Record<string, unknown>;
  const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const shippingAddress =
    typeof body.shippingAddress === "string" ? body.shippingAddress.trim() : "";

  if (customerName.length < 2 || customerName.length > 120) {
    return invalid("Please enter your name.");
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return invalid("Please enter a valid email address.");
  }
  if (shippingAddress.length < 8 || shippingAddress.length > 500) {
    return invalid("Please enter a complete shipping address.");
  }
  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 40) {
    return invalid("Your bag is empty or has too many items.");
  }

  const lineItems: StoredOrderItem[] = [];

  for (const candidate of body.items) {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      return invalid("One of the items in your bag could not be verified.");
    }

    const item = candidate as Record<string, unknown>;
    const productId = typeof item.productId === "string" ? item.productId : "";
    const size = typeof item.size === "string" ? item.size : "";
    const quantity = item.quantity;
    const product = dresses.find((dress) => dress.id === productId);

    if (
      !product ||
      !product.sizes.includes(size) ||
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 10
    ) {
      return invalid("One of the items in your bag could not be verified.");
    }

    lineItems.push({
      productId: product.id,
      productName: product.name,
      size,
      quantity,
      unitPriceCents: product.priceCents,
    });
  }

  const subtotalCents = lineItems.reduce(
    (sum, item) => sum + item.unitPriceCents * item.quantity,
    0,
  );
  const shippingCents = subtotalCents >= shippingThresholdCents ? 0 : standardShippingCents;
  const totalCents = subtotalCents + shippingCents;

  try {
    const [savedOrder] = await db
      .insert(dressOrders)
      .values({
        customerName,
        email,
        shippingAddress,
        lineItems,
        subtotalCents,
        shippingCents,
        totalCents,
      })
      .returning({ id: dressOrders.id });

    return Response.json(
      {
        ok: true,
        orderReference: savedOrder.id.replaceAll("-", "").slice(0, 8).toUpperCase(),
        totalCents,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Unable to save dress order:", error);
    return Response.json(
      { error: "We couldn't place your order just now. Please try again." },
      { status: 500 },
    );
  }
}
