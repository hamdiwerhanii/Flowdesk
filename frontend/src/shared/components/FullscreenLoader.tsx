import { Spinner } from "./ui/spinner";

export default function FullscreenLoader() {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <Spinner className='size-7' />
    </div>
  );
}
