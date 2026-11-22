import type { Metadata } from 'next'
import { ServicesPageContent } from '@/components/services/ServicesPageContent'
import { fetchServices, servicesHeroImage } from '@/lib/content-services'

export const metadata: Metadata = {
  title: 'Услуги',
  description: 'PR-стратегия, публикации в СМИ, сопровождение, коллаборации и мероприятия.',
}

export const revalidate = 300

export default async function ServicesPage() {
  const services = await fetchServices()

  return <ServicesPageContent services={services} defaultImage={servicesHeroImage} />
}
