import { Button } from './ui/button';
import Link from 'next/link';
import Image from 'next/image';

const LandingPageNavbar = () => {
  return (
    <div className="flex flex-grow justify-between p-5">
      <div>
        {' '}
        <Link href="/">
          <Image src="/logo.svg" alt="logo" height={40} width={40} />
        </Link>
      </div>
      <div className="flex flex-row">
        <Button variant={'secondary'} size={'sm'} asChild>
          <Link href={'/sign-in'}>Sign In</Link>
        </Button>
      </div>
    </div>
  );
};

export default LandingPageNavbar;
