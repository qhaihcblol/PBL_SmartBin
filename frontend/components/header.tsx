import Link from "next/link"
import { Recycle, Users } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Recycle className="h-6 w-6 text-primary" />
            </div>
            <span className="hidden text-xl font-bold sm:inline-block">Smart Waste Recognition</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <TeamMembersDropdown />
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}

function TeamMembersDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden md:inline-block">Team Members</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px]">
        <DropdownMenuLabel>Project Team</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex flex-col items-start">
          <span className="font-medium">Trương Quang Hải</span>
          <span className="text-xs text-muted-foreground">102220013</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex flex-col items-start">
          <span className="font-medium">Nguyễn Khả Hào</span>
          <span className="text-xs text-muted-foreground">102220014</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex flex-col items-start">
          <span className="font-medium">Trần Phi Hùng</span>
          <span className="text-xs text-muted-foreground">102220020</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
