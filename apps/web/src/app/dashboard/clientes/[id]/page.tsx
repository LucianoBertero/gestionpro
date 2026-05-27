import { ClienteLegajoView } from '@/features/clientes/components/cliente-legajo-view';

export const metadata = {
  title: 'Dashboard: Legajo Cliente',
};

type PageProps = { params: Promise<{ id: string }> };

export default async function ClienteLegajoPage(props: PageProps) {
  const params = await props.params;
  const id = Number(params.id);

  return <ClienteLegajoView id={id} />;
}
