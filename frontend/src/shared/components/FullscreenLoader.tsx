import { Spinner } from "@/shared/components/Spinner";

export default function FullscreenLoader() {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <Spinner className='size-7' />
    </div>
  );
}
