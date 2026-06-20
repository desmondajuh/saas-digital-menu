import { getEstablishment } from "@/app/actions/establishments";
import SettingsView from "@/features/dashboard/views/establishment-settings-view";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SettingsPage({ params }: Props) {
  const { id } = await params;

  const establishment = await getEstablishment(id);

  if (!establishment) {
    return <div className="text-center py-12">Establishment not found</div>;
  }

  return <SettingsView establishmentId={establishment.id} />;
}
