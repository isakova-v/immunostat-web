import React from "react";

function FlaskIcon(props: React.ComponentPropsWithoutRef<"svg">) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M8.5 2h7" />
            <path d="M12 2v6.5" />
            <path d="m5 22 7-13.5 7 13.5H5Z" />
        </svg>
    );
}

export function Topbar() {
    return (
        <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6 shadow-sm z-10">
            <div className="flex items-center gap-2 font-semibold text-gray-900">
                <FlaskIcon className="h-5 w-5 text-black" />
                ImmunoStat Web
            </div>
            <div className="flex items-center gap-2">
                <button className="text-sm font-medium text-gray-500 hover:text-black transition-colors px-3 py-2 rounded-md hover:bg-gray-50">
                    Docs
                </button>
            </div>
        </header>
    );
}
