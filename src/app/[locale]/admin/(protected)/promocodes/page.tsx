import { getPromoCodes } from "./actions";
import PromoCodesClient from "./PromoCodesClient";

export const dynamic = "force-dynamic";

export default async function PromoCodesPage() {
  const promoCodes = await getPromoCodes();
  return <PromoCodesClient initialPromos={promoCodes} />;
}
