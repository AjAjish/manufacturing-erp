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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
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
            <div className="fixed inset-0 bg-slate-900/60" />
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
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 dark:bg-slate-950">
                  <div className="flex h-16 shrink-0 items-center">
                    <span className="text-xl font-bold text-slate-900 dark:text-white">Manufacturing ERP</span>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {filteredNavigation.map((item) => (
                            <li key={item.name}>
                              <Link
                                to={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={clsx(
                                  location.pathname.startsWith(item.href)
                                    ? 'bg-primary-50 text-primary-700 dark:bg-slate-800 dark:text-white'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800',
                                  'group flex gap-x-3 rounded-lg p-2 text-sm font-semibold transition'
                                )}
                              >
                                <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
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
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-slate-200/70 bg-white px-6 pb-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex h-16 shrink-0 items-center">
            <span className="text-xl font-bold text-slate-900 dark:text-white">Manufacturing ERP</span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {filteredNavigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={clsx(
                          location.pathname.startsWith(item.href)
                            ? 'bg-primary-50 text-primary-700 dark:bg-slate-800 dark:text-white'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800',
                          'group flex gap-x-3 rounded-lg p-2 text-sm font-semibold transition'
                        )}
                      >
                        <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto">
                <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
                  <UserCircleIcon className="h-8 w-8 text-slate-400" />
                  <span className="sr-only">Your profile</span>
                  <span aria-hidden="true">{user?.full_name || user?.email}</span>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200/70 bg-white/80 px-4 backdrop-blur sm:gap-x-6 sm:px-6 lg:px-8 dark:border-slate-800 dark:bg-slate-900/70">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-slate-600 hover:text-slate-900 lg:hidden dark:text-slate-300"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {filteredNavigation.find((n) => location.pathname.startsWith(n.href))?.name || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center gap-x-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <SunIcon className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <MoonIcon className="h-4 w-4" aria-hidden="true" />
                )}
                {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
              {/* User menu */}
              <Menu as="div" className="relative">
                <Menu.Button className="-m-1.5 flex items-center p-1.5">
                  <span className="sr-only">Open user menu</span>
                  <UserCircleIcon className="h-8 w-8 text-slate-400" />
                  <span className="hidden lg:flex lg:items-center">
                    <span className="ml-4 text-sm font-semibold leading-6 text-slate-900 dark:text-slate-100" aria-hidden="true">
                      {user?.first_name} {user?.last_name}
                    </span>
                    <ChevronDownIcon className="ml-2 h-5 w-5 text-slate-400" aria-hidden="true" />
                  </span>
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
                  <Menu.Items className="absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-slate-900/10 focus:outline-none dark:bg-slate-900">
                    <Menu.Item>
                      <div className="border-b border-slate-100 px-4 py-2 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                        <p className="font-medium text-slate-900 dark:text-slate-100">{user?.email}</p>
                        <p className="capitalize">{user?.role_display || user?.role}</p>
                      </div>
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={logout}
                          className={clsx(
                            active ? 'bg-slate-50 dark:bg-slate-800' : '',
                            'flex w-full items-center gap-x-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200'
                          )}
                        >
                          <ArrowRightOnRectangleIcon className="h-5 w-5" />
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
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}