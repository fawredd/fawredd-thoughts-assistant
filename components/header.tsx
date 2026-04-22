"use client"

import Link from "next/link"
import { SignOutButton, useUser } from "@clerk/nextjs"
import { Menu, X, LogOut, Settings, User } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

export function Header() {
    const { isSignedIn, user } = useUser()
    const [isOpen, setIsOpen] = useState(false)
    const { language } = useLanguage()
    const trans = t[language]

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-sm font-bold tracking-tight text-primary">
                            Fawredd - <span className="text-muted-foreground font-small md:font-medium">Thoughts</span>
                        </span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-4">
                    <LanguageToggle />
                    <ThemeToggle />

                    {isSignedIn ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-muted p-0 overflow-hidden border">
                                    {user.imageUrl ? (
                                        <img
                                            src={user.imageUrl}
                                            alt={user.fullName || "User"}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <User className="h-5 w-5" />
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.fullName}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user.primaryEmailAddress?.emailAddress}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/profile" className="cursor-pointer">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>{trans.header_profile}</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/settings" className="cursor-pointer">
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>{trans.header_settings}</span>
                                    </Link>
                                </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
                                    <SignOutButton>
                                        <div className="flex w-full items-center">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>{trans.header_logout}</span>
                                        </div>
                                    </SignOutButton>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button asChild variant="default" size="sm" className="rounded-full px-6">
                            <Link href="/sign-in">Login</Link>
                        </Button>
                    )}
                </div>

                {/* Mobile Navigation */}
                <div className="flex md:hidden items-center gap-2">
                    <LanguageToggle />
                    <ThemeToggle />
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="flex flex-col w-[300px] sm:w-[400px]">
                            <SheetHeader className="text-left border-b pb-4">
                                <SheetTitle className="text-xl font-bold">Menu</SheetTitle>
                            </SheetHeader>

                            <div className="flex flex-col gap-4 mt-6 flex-1">
                                {isSignedIn && (
                                    <div className="flex items-center gap-3 px-2 mb-4">
                                        <div className="h-12 w-12 rounded-full bg-muted overflow-hidden border">
                                            {user.imageUrl ? (
                                                <img src={user.imageUrl} alt={user.fullName || "User"} className="h-full w-full object-cover" />
                                            ) : (
                                                <User className="h-full w-full p-2" />
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="font-semibold">{user.fullName}</p>
                                            <p className="text-sm text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
                                        </div>
                                    </div>
                                )}

                                <nav className="flex flex-col gap-2">
                                    <Link
                                        href="/"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center px-4 py-3 text-lg font-medium rounded-xl hover:bg-accent transition-colors"
                                    >
                                        {trans.header_home}
                                    </Link>
                                    <Link
                                        href="/profile"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center px-4 py-3 text-lg font-medium rounded-xl hover:bg-accent transition-colors"
                                    >
                                        {trans.header_profile}
                                    </Link>
                                    <Link
                                        href="/settings"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center px-4 py-3 text-lg font-medium rounded-xl hover:bg-accent transition-colors"
                                    >
                                        {trans.header_settings}
                                    </Link>
                                </nav>
                            </div>

                            <div className="mt-auto border-t pt-4">
                                {isSignedIn ? (
                                    <div className="px-2">
                                        <SignOutButton>
                                            <Button variant="destructive" className="w-full justify-start rounded-xl">
                                                <LogOut className="mr-2 h-4 w-4" />
                                                {trans.header_logout}
                                            </Button>
                                        </SignOutButton>
                                    </div>
                                ) : (
                                    <div className="px-2">
                                        <Button asChild className="w-full rounded-xl">
                                            <Link href="/sign-in">Login</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}
