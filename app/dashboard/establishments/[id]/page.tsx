import { getEstablishment } from "@/app/actions/establishments";
import { getMenus } from "@/app/actions/menus";
import EstablishmentView from "@/features/dashboard/views/establishment-view";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EstablishmentPage({ params }: Props) {
  const { id } = await params;
  const establishmentData = await getEstablishment(id);
  const establishmentMenu = await getMenus(id);

  if (!establishmentData) {
    return <div className="text-center py-12">Establishment not found</div>;
  }

  return <EstablishmentView establishmentId={id} />;
}
