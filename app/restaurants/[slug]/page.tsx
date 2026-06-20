import { getEstablishmentBySlug } from '@/app/actions/establishments'
import { redirect } from 'next/navigation'

export default async function RestaurantRedirectPage({
  params,
}: {
  params: { slug: string }
}) {
  const establishment = await getEstablishmentBySlug(params.slug)

  if (!establishment) {
    return <div className="text-center py-12">Restaurant not found</div>
  }

  // Redirect to the menu page
  redirect(`/${establishment.slug}/menu`)
}
