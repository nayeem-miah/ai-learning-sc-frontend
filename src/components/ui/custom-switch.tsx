import React from "react";

interface CustomSwitchProps {
    checked?: boolean;
    onCheckedChange: (checked: boolean) => void;
}

export function CustomSwitch({ checked = false, onCheckedChange }: CustomSwitchProps) {
    return (
        <button
            onClick={() => onCheckedChange(!checked)}
            className={`w-11 h-6 rounded-full p-1 transition-all duration-300 ease-in-out focus:outline-none relative
                ${checked ? 'bg-[#D0AD6B]' : 'bg-[#D0AD6B]/20'}`}
        >
            <div
                className={`w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ease-out
                    ${checked ? 'translate-x-5 bg-black' : 'translate-x-0 bg-white'}`}
            />
        </button>
    );
}
