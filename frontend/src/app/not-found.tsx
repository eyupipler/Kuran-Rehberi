import Link from 'next/link';
import { EmptyState } from '@/components/ui';
import { SearchIcon } from '@/components/ui/icons';

export default function NotFound() {
  return (
    <EmptyState
      icon={<SearchIcon className="h-10 w-10" />}
      title="Sayfa bulunamadı"
      description="Aradığınız adres taşınmış veya hiç var olmamış olabilir."
      action={
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <Link href="/" className="text-accent hover:underline">
            Ana sayfa
          </Link>
          <Link href="/surahs" className="text-accent hover:underline">
            Sureler
          </Link>
          <Link href="/search" className="text-accent hover:underline">
            Arama
          </Link>
        </div>
      }
    />
  );
}
