import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['ua', 'en'],
  defaultLocale: 'ua',
  localePrefix: 'as-needed' // Only prefix non-default locale or always prefix depending on preference
});

export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
