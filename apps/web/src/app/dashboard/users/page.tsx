import PageContainer from '@/components/layout/page-container';
import UserListingPage from '@/features/users/components/user-listing';
import { searchParamsCache } from '@/lib/searchparams';
import type { SearchParams } from 'nuqs/server';
import { UserFormSheetTrigger } from '@/features/users/components/user-form-sheet';

export const metadata = {
  title: 'Dashboard: Users'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function UsersPage(props: PageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      pageTitle='Usuarios'
      pageDescription='Gestión de usuarios del estudio'
      pageHeaderAction={<UserFormSheetTrigger />}
    >
      <UserListingPage />
    </PageContainer>
  );
}
