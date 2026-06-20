import NewMenuView from "@/features/dashboard/views/new-menu-view";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function NewMenuPage({ params }: Props) {
  const { id } = await params;

  return <NewMenuView establishmentId={id} />;
}
