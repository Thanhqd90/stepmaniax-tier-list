"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";

interface NavItem {
  label?: string;
  name?: string;
  title?: string;
  href?: string;
  url?: string;
  link?: string;
  description?: string;
  [key: string]: any;
}

export function SiteNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [siteItems, setSiteItems] = useState<NavItem[]>([]);
  const [otherItems, setOtherItems] = useState<NavItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNavItems = async () => {
      try {
        const response = await fetch("https://smx.tools/directory.json");
        const data = await response.json();

        // Get current hostname to filter out this site
        const currentHostname =
          typeof window !== "undefined" ? window.location.hostname : "";

        const isCurrentSite = (item: NavItem): boolean => {
          const url = item.href || item.url || item.link || "";
          return url.includes(currentHostname) && currentHostname !== "";
        };

        // Keep sites and others separate for sectioned display
        const sites =
          (data.sites &&
            Array.isArray(data.sites) &&
            data.sites.filter(
              (item: NavItem) =>
                item &&
                (item.href || item.url || item.link) &&
                !isCurrentSite(item),
            )) ||
          [];

        const others =
          (data.others &&
            Array.isArray(data.others) &&
            data.others.filter(
              (item: NavItem) =>
                item &&
                (item.href || item.url || item.link) &&
                !isCurrentSite(item),
            )) ||
          [];

        setSiteItems(sites);
        setOtherItems(others);
      } catch (error) {
        console.error("Failed to fetch nav items:", error);
        setSiteItems([]);
        setOtherItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNavItems();
  }, []);

  const getItemName = (item: NavItem): string => {
    return item.label || item.name || item.title || "Untitled";
  };

  const getItemUrl = (item: NavItem): string => {
    return item.href || item.url || item.link || "#";
  };

  return (
    <>
      {/* Header */}
      <div className="hidden md:flex fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-800 z-50 h-16 flex items-center px-4 shadow-lg">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-800 rounded transition-colors"
          title="Toggle navigation"
        >
          {isOpen ? (
            <XMarkIcon className="w-6 h-6 text-white" />
          ) : (
            <Bars3Icon className="w-6 h-6 text-white" />
          )}
        </button>
        <Link href="/" className="ml-4 hover:opacity-80 transition-opacity">
          <h1 className="text-lg font-bold text-white">SMX Tier List Maker</h1>
        </Link>
      </div>

      {/* Drawer */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setIsOpen(false)}
          />
          {/* Drawer Panel */}
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-gray-900 border-r border-gray-800 z-40 overflow-y-auto pt-16">
            <div className="p-4">
              {/* Main Header */}
              <div className="mb-6 pb-4 border-b border-gray-800">
                <h2 className="text-sm font-bold text-white">
                  SMX Community Tools
                </h2>
              </div>

              {isLoading ? (
                <div className="text-gray-400 text-sm">Loading...</div>
              ) : (
                <>
                  {/* Sites Section */}
                  {siteItems.length > 0 && (
                    <div className="mb-6">
                      <div className="space-y-2">
                        {siteItems.map((item, idx) => (
                          <a
                            key={`site-${getItemUrl(item)}-${idx}`}
                            href={getItemUrl(item)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setIsOpen(false)}
                            className="block px-3 py-2 rounded hover:bg-gray-800 transition-colors text-white text-sm"
                          >
                            {getItemName(item)}
                            {item.description && (
                              <div className="text-xs text-gray-400 mt-1">
                                {item.description}
                              </div>
                            )}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Other Sites Section */}
                  {otherItems.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 pb-2 border-b border-gray-800">
                        Other Sites
                      </h3>
                      <div className="space-y-2">
                        {otherItems.map((item, idx) => (
                          <a
                            key={`other-${getItemUrl(item)}-${idx}`}
                            href={getItemUrl(item)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setIsOpen(false)}
                            className="block px-3 py-2 rounded hover:bg-gray-800 transition-colors text-white text-sm"
                          >
                            {getItemName(item)}
                            {item.description && (
                              <div className="text-xs text-gray-400 mt-1">
                                {item.description}
                              </div>
                            )}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {siteItems.length === 0 && otherItems.length === 0 && (
                    <div className="text-gray-400 text-sm">
                      No items available
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
