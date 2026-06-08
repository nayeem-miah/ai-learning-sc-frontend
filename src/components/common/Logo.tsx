import Image from "next/image";
import logo from "/public/logo.png";

export default function Logo() {
    return (
        <Image
            src={logo}
            alt="Logo"
            className="w-44 md:w-60 h-auto"
            priority
        />
    );
}
