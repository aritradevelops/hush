'use client'
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q');
  const router = useRouter();
  useEffect(() => {
    if (!q) {
      router.push('/notfound');
      return;
    }
  }, [q, router]);
  return (
    <div className='w-full h-full flex justify-center items-center'>
      <h1 className='text-2xl text-center'>Search Page: {q}</h1>
    </div>
  )
}
