'use client'
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function RoomsPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  useEffect(() => {
    if (!id) {
      router.push('/notfound');
      return;
    }
  }, [id, router]);
  return (
    <div className='w-full h-full flex justify-center items-center'>
      <h1 className='text-2xl text-center'>Rooms : {id}</h1>
    </div>
  )
}
