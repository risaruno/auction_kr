'use client';
import { PageContainer } from '@toolpad/core/PageContainer';
import CustomDataGrid from '@/components/dashboard/CustomDataGrid';
import { rows, columns } from '@/app/mocks/gridOrdersData';

export default function OrdersPage() {
  return (
    <PageContainer>
      <CustomDataGrid rows={rows} columns={columns} />
    </PageContainer>
  );
}
