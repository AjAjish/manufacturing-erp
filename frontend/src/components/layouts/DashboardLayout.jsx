import React, { Fragment, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Dialog, Transition, Menu } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  CubeIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentCheckIcon,
  TruckIcon,
  UsersIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  MoonIcon,
  SunIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import clsx from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: [] },
  { name: 'Orders', href: '/orders', icon: ClipboardDocumentListIcon, roles: [] },
  { name: 'Customers', href: '/customers', icon: UserGroupIcon, roles: ['admin', 'sales'] },
  { name: 'Materials', href: '/materials', icon: CubeIcon, roles: ['admin', 'production', 'engineering'] },
  { name: 'Production', href: '/production', icon: WrenchScrewdriverIcon, roles: ['admin', 'production'] },
  { name: 'Inspection', href: '/inspection', icon: ClipboardDocumentCheckIcon, roles: ['admin', 'quality'] },
  { name: 'Logistics', href: '/logistics', icon: TruckIcon, roles: ['admin', 'logistics'] },
  { name: 'Users', href: '/users', icon: UsersIcon, roles: ['admin'] },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const filteredNavigation = navigation.filter(
    (item) => item.roles.length === 0 || item.roles.includes(user?.role) || user?.is_admin
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-50 via-white to-accent-100/50 dark:from-accent-950 dark:via-accent-900/50 dark:to-accent-900">
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-accent-900/40 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white/95 backdrop-blur px-6 pb-4 dark:bg-accent-900/80">
                  <div className="flex h-16 shrink-0 items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-700">
                      <SparklesIcon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                      Manufacturing
                    </span>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-1">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {filteredNavigation.map((item) => (
                            <li key={item.name}>
                              <Link
                                to={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={clsx(
                                  location.pathname.startsWith(item.href)
                                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                                    : 'text-accent-600 hover:bg-accent-100/50 hover:text-accent-900 dark:text-accent-300 dark:hover:bg-accent-800/30',
                                  'group flex gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200'
                                )}
                              >
                                <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-accent-100/50 bg-white/80 backdrop-blur-md px-6 pb-4 dark:border-accent-800/30 dark:bg-accent-900/40">
          <div className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 shadow-lg">
              <SparklesIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              Manufacturing
            </span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-1">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {filteredNavigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={clsx(
                          location.pathname.startsWith(item.href)
                            ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 shadow-soft'
                            : 'text-accent-600 hover:bg-accent-100/50 hover:text-accent-900 dark:text-accent-300 dark:hover:bg-accent-800/30',
                          'group flex gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200'
                        )}
                      >
                        <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto">
                <div className="rounded-lg bg-accent-50/50 dark:bg-accent-800/20 px-3 py-3 border border-accent-100 dark:border-accent-800/50">
                  <div className="flex items-center gap-x-3">
                    <div className="flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600">
                        <span className="text-sm font-semibold text-white">
                          {user?.first_name?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-accent-900 dark:text-white truncate">
                        {user?.first_name || user?.email}
                      </p>
                      <p className="text-xs text-accent-600 dark:text-accent-400 truncate capitalize">
                        {user?.role_display || user?.role}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-accent-100/30 bg-white/70 backdrop-blur-md px-4 sm:gap-x-6 sm:px-6 lg:px-8 dark:border-accent-800/30 dark:bg-accent-900/30">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-accent-600 hover:text-accent-900 hover:bg-accent-100/50 rounded-lg transition lg:hidden dark:text-accent-300 dark:hover:bg-accent-800/50"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-bold text-accent-900 dark:text-white">
                {filteredNavigation.find((n) => location.pathname.startsWith(n.href))?.name || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center gap-x-3 lg:gap-x-4">
              <button
                type="button"
                onClick={toggleTheme}
                className={clsx(
                  'inline-flex items-center justify-center gap-x-2 rounded-lg border px-3 py-2 text-sm font-semibold shadow-soft transition-all duration-200',
                  theme === 'dark'
                    ? 'border-accent-700 bg-accent-900/50 text-accent-300 hover:bg-accent-800'
                    : 'border-accent-200 bg-white text-accent-700 hover:bg-accent-50'
                )}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <>
                    <SunIcon className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Light</span>
                  </>
                ) : (
                  <>
                    <MoonIcon className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Dark</span>
                  </>
                )}
              </button>
              {/* User menu */}
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center gap-x-2 rounded-lg border border-accent-200 bg-white/50 px-3 py-2 text-sm font-semibold text-accent-900 shadow-soft transition-all hover:bg-accent-50 dark:border-accent-700 dark:bg-accent-900/50 dark:text-accent-100 dark:hover:bg-accent-800/50">
                  <UserCircleIcon className="h-5 w-5" />
                  <span className="hidden lg:inline">{user?.first_name || 'User'}</span>
                  <ChevronDownIcon className="hidden lg:inline h-4 w-4 text-accent-500" aria-hidden="true" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-xl bg-white/95 backdrop-blur py-2 shadow-elevation ring-1 ring-accent-900/10 focus:outline-none dark:bg-accent-900/80 dark:ring-white/10">
                    <Menu.Item>
                      <div className="border-b border-accent-100 px-4 py-3 dark:border-accent-800/50">
                        <p className="font-semibold text-accent-900 dark:text-white">{user?.email}</p>
                        <p className="mt-1 text-xs font-medium text-accent-600 dark:text-accent-400 capitalize">
                          {user?.role_display || user?.role}
                        </p>
                      </div>
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={logout}
                          className={clsx(
                            active ? 'bg-accent-50 dark:bg-accent-800/50' : '',
                            'flex w-full items-center gap-x-2 px-4 py-2.5 text-sm font-semibold text-accent-700 dark:text-accent-300 transition-colors'
                          )}
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4" />
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}