import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/registry/default/ui/button';
import { GithubButton } from '@/registry/default/ui/github-button';
import { siteConfig } from '@/config/site';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { CommandMenu } from '@/components/command-menu';
import { Icons } from '@/components/icons';
import { MainNav } from '@/components/main-nav';
import { MobileNav } from '@/components/mobile-nav';
import { ModeSwitcher } from '@/components/mode-switcher';

// Custom hook to fetch GitHub stars
function useGithubStars(repo = 'keenthemes/reui') {
  const [stars, setStars] = useState<number>(siteConfig.githubStars);

  useEffect(() => {
    const fetchStars = async () => {
      try {
        const response = await fetch(`https://api.github.com/repos/${repo}`);
        if (response.ok) {
          const data = await response.json();
          if (data?.stargazers_count) {
            console.log('GitHub stars fetched:', data.stargazers_count);
            setStars(data.stargazers_count);
          }
        }
      } catch (error) {
        console.error('Error fetching GitHub stars:', error);
      }
    };

    fetchStars();
  }, [repo]);

  return stars;
}

export function SiteHeader() {
  const pathname = usePathname();
  const githubStars = useGithubStars('keenthemes/reui');

  const handleSocialClick = (platform: string) => {
    trackEvent({
      name: `site_header_${platform}_link_click`,
      properties: {
        platform,
        category: 'engagement',
        label: `Header ${platform} Click`,
      },
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60 dark:border-border">
      <div
        className={cn(
          'flex h-16 items-center justify-between gap-4',
          pathname.includes('blocks') ? 'container-fluid' : 'container',
        )}
      >
        <MobileNav />

        <div className="hidden lg:flex items-center gap-3.5">
          <Link href="/" className="mr-10 flex items-center gap-2">
            <Image
              src="/brand/logo-text-light.svg"
              alt={siteConfig.name}
              width={75}
              height={0}
              className="dark:hidden shrink-0"
            />
            <Image
              src="/brand/logo-text-dark.svg"
              alt={siteConfig.name}
              width={75}
              height={0}
              className="hidden dark:inline-block shrink-0"
            />
          </Link>
          <MainNav />
        </div>

        <div className="flex items-center gap-3 justify-end">
          <div className="hidden md:block">
            <CommandMenu />
          </div>

          <nav className="flex items-center gap-1">
            <GithubButton
              key={`github-${githubStars}`}
              variant="outline"
              targetStars={githubStars}
              initialStars={0}
              separator={true}
              fixedWidth={true}
              className="h-8 px-2.5"
              repoUrl="https://github.com/keenthemes/reui"
            />
            <Button variant="ghost" mode="icon" size="sm" className="ms-1.5 size-8 text-foreground ">
              <Link
                href={siteConfig.links.twitter}
                target="_blank"
                rel="noreferrer"
                onClick={() => handleSocialClick('twitter')}
              >
                <Icons.twitter />
                <span className="sr-only">X</span>
              </Link>
            </Button>
            <ModeSwitcher />
          </nav>
        </div>
      </div>
    </header>
  );
}
