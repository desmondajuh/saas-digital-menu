import { getPublicMenu } from "@/app/actions/menus";
import PublicMenuView from "@/features/landing/menu-view";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PublicMenuPage({ params }: Props) {
  const { slug } = await params;

  return <PublicMenuView slug={slug} />;
}
