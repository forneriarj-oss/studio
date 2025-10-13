
import { InventoryClient } from "./inventory-client";

export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Controle de Matérias-Primas</h1>
      <InventoryClient />
    </div>
  );
}
