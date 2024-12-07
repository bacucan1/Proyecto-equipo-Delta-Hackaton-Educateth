import React from "react";
import Link from "next/link";
import { hardhat } from "viem/chains";
import { CurrencyDollarIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { DocumentArrowUpIcon } from "@heroicons/react/24/solid";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useGlobalState } from "~~/services/store/store";

/**
 * Site footer
 */
export const Footer = () => {
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrency.price);
  const { targetNetwork } = useTargetNetwork();

  return (
    <footer className="fixed bottom-0 left-0 w-full bg-transparent z-10">
      <div className="flex flex-col md:flex-row justify-between items-center py-4 px-6">
        {/* Left Section */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          {nativeCurrencyPrice > 0 && (
            <div className="flex items-center gap-2">
              <CurrencyDollarIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              <span className="text-gray-700 dark:text-gray-200 font-medium">{nativeCurrencyPrice.toFixed(3)} $</span>
            </div>
          )}
          <Link
            href="https://etherscan.io/"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary btn-sm font-normal gap-2 flex items-center"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
            <span>View on Arbiscan</span>
          </Link>
          <Link
            href="https://github.com/bacucan1/Proyecto-equipo-Delta-Hackaton-Educateth"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary btn-sm font-normal gap-2 flex items-center"
          >
            <DocumentArrowUpIcon className="h-6 w-6 text-gray-500" />
            <span>Github</span>
          </Link>
        </div>

        {/* Center Section */}
        <div className="flex items-center">
          <SwitchTheme className="mr-4" aria-label="Switch theme" />
          <Link
            href="https://buidlguidl.com/"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Powered by <span className="font-bold">Team Delta</span>
          </Link>
        </div>
      </div>
    </footer>
  );
};
