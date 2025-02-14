import Link from 'next/link';
import Image from 'next/image';
import { Typewriter } from 'nextjs-simple-typewriter';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b rounded-lg">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Left side - Text Content */}
          <div className="flex-1 text-left">
            <h1 className="text-5xl font-bold mb-4 text-black">
              Welcome To RSpace!
            </h1>
            <div className="h-20">
              <span className="text-4xl font-bold text-black">
                <Typewriter
                  words={[
                    'Get More Productive',
                    'Take Control Of Your Life',
                    'Enjoy The Experience',
                  ]}
                  loop={0}
                  cursor
                  cursorStyle="|"
                  typeSpeed={70}
                  deleteSpeed={50}
                  delaySpeed={1000}
                />
              </span>
            </div>
            <p className="text-xl text-black font-medium mb-8">
              Transform your ideas into task chunks that help you organize
            </p>
            <div className="space-x-4">
              <Link
                href="/sign-in"
                className="bg-black hover:bg-gray-900 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Get Started
              </Link>
              {/* <Link
                href="/demo"
                aria-disabled={true}
                className="border-2 border-black text-black hover:bg-black hover:text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Quick Demo
              </Link> */}
            </div>
          </div>

          {/* Right side - Image */}
          <div className="flex-1 relative h-[300px] w-full overflow-visible">
            <div className="relative w-full h-full transform perspective-1000 rotate-y-6 hover:rotate-y-0 transition-transform duration-500">
              <Image
                src="/demo/demo.png"
                alt="Demo background"
                fill
                priority
                className="object-contain rounded-lg shadow-2xl"
                sizes="(max-width: 1280px) 100vw, 100vw"
                quality={90}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-bold mb-4 text-black">
              Innovative Design
            </h3>
            <p className="text-gray-800">
              Create detailed tasks and view them in several views like Kanban,
              Calendar and Charts.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-bold mb-4 text-black">
              Powerful Features
            </h3>
            <p className="text-gray-800">
              Add members to your workspaces and form a collaborative
              Environment
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-bold mb-4 text-black">Ease Of Use</h3>
            <p className="text-gray-800">
              Enjoy the simplistic design and ease of use.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
