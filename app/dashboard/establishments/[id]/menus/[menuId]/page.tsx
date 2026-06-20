import { getMenuById, getMenuItems, createMenuItem } from "@/app/actions/menus";
import MenuView from "@/features/dashboard/views/menu-view";

type Props = {
  params: Promise<{
    id: string;
    menuId: string;
  }>;
};

export default async function MenuPage({ params }: Props) {
  const { id } = await params;
  const { menuId } = await params;

  // const {menu} = getMenuById(menuId)
  // const {menuItems} = getMenuItems(menuId)

  // if (!menu) {
  //   return <div className="text-center py-12">Menu not found</div>
  // }

  return <MenuView id={id} menuId={menuId} />;
}
