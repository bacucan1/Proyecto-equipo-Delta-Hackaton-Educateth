import React, { useState } from "react";
import Link from "next/link";
import { CurrencyDollarIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { DocumentArrowUpIcon } from "@heroicons/react/24/solid";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { useGlobalState } from "~~/services/store/store";

/**
 * Site footer with icons in mobile
 */
export const Footer = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrency.price);

  return (
    <footer className="fixed bottom-0 left-0 w-full bg-transparent z-10">
      {/* Menu for large screens */}
      <div className="hidden md:flex flex-col md:flex-row justify-between items-center py-4 px-8">
        {/* Left Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 mb-4 sm:mb-0">
          {nativeCurrencyPrice > 0 && (
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <CurrencyDollarIcon className="h-5 w-5" />
              <span className="font-medium text-sm">{nativeCurrencyPrice.toFixed(3)} $</span>
            </div>
          )}
          <Link
            href="https://sepolia.arbiscan.io/address/0x4568da48b8642dab4addf8585f6b984817c5bbab"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary btn-sm font-normal gap-2 flex items-center"
            aria-label="View on Arbiscan"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
            <span className="text-xs sm:text-sm">View on Arbiscan</span>
          </Link>
          <Link
            href="https://github.com/bacucan1/Proyecto-equipo-Delta-Hackaton-Educateth"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary btn-sm font-normal gap-2 flex items-center"
            aria-label="View project on Github"
          >
            <DocumentArrowUpIcon className="h-5 w-5 text-gray-500" />
            <span className="text-xs sm:text-sm">Github</span>
          </Link>
        </div>

        {/* Center Section */}
        <div className="flex items-center gap-4 sm:gap-6">
          <SwitchTheme className="text-gray-700 dark:text-gray-300" aria-label="Switch theme" />
          <Link
            href="https://devpost.com/software/smartassist-8mjku6"
            target="_blank"
            rel="noreferrer"
            className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300"
            aria-label="Visit BuidlGuidl website"
          >
            Powered by <span className="font-semibold">Team Delta</span>
          </Link>
        </div>
      </div>

      {/* Icons for mobile */}
      <div className="md:hidden flex justify-end items-center p-4">
        <div className="flex gap-4 items-center" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <button className="text-gray-600 dark:text-gray-300">
            <DocumentArrowUpIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute bottom-16 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md space-y-4">
            {nativeCurrencyPrice > 0 && (
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <CurrencyDollarIcon className="h-5 w-5" />
                <span className="font-medium text-sm">{nativeCurrencyPrice.toFixed(3)} $</span>
              </div>
            )}
            <Link
              href="https://sepolia.arbiscan.io/address/0x4568da48b8642dab4addf8585f6b984817c5bbab"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-sm font-normal gap-2 flex items-center"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
              <span className="text-xs sm:text-sm">View on Arbiscan</span>
            </Link>
            <Link
              href="https://github.com/bacucan1/Proyecto-equipo-Delta-Hackaton-Educateth"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-sm font-normal gap-2 flex items-center"
            >
              <DocumentArrowUpIcon className="h-5 w-5 text-gray-500" />
              <span className="text-xs sm:text-sm">Github</span>
            </Link>
            <SwitchTheme className="text-gray-700 dark:text-gray-300" aria-label="Switch theme" />
            <Link
              href="https://devpost.com/software/smartassist-8mjku6"
              target="_blank"
              rel="noreferrer"
              className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Powered by <span className="font-semibold">Team Delta</span>
            </Link>
          </div>
        )}
      </div>
    </footer>
  );
};
