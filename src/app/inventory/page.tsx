import { getRawMaterials } from "@/lib/data";
import { InventoryClient } from "./inventory-client";

export default function InventoryPage() {
  const products = getRawMaterials();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Controle de Matérias-Primas</h1>
      <InventoryClient initialProducts={products} />
    </div>
  );
}
