"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

const mockUsers = [
  {
    id: 1,
    nombre: "Juan Díaz",
    email: "juan.diaz@universidad.edu",
    rol: "alumno" as const,
    avatar: "/abstract-geometric-shapes.png",
    iniciales: "JD",
  },
  {
    id: 2,
    nombre: "Pedro Martínez",
    email: "pedro.martinez@universidad.edu",
    rol: "asesor" as const,
    avatar: "/hombre-estudiante.png",
    iniciales: "PM",
  },
]

interface UserSelectorProps {
  onUserChange?: (user: (typeof mockUsers)[0]) => void
}

export function UserSelector({ onUserChange }: UserSelectorProps) {
  const [currentUser, setCurrentUser] = useState(mockUsers[0])

  useEffect(() => {
    // Load saved user from localStorage on mount
    const savedUser = localStorage.getItem("univyy-current-user")
    if (savedUser) {
      const user = JSON.parse(savedUser)
      setCurrentUser(user)
    }
  }, [])

  const handleUserChange = (user: (typeof mockUsers)[0]) => {
    setCurrentUser(user)
    localStorage.setItem("univyy-current-user", JSON.stringify(user))
    onUserChange?.(user)

    // Redirigir según el rol
    if (user.rol === "alumno") {
      window.location.href = "/dashboard"
    } else {
      window.location.href = "/dashboard-asesor"
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            className="flex items-center gap-3 bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all h-auto py-3 px-4"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={currentUser.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-red-100 text-red-600">{currentUser.iniciales}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold text-gray-900">{currentUser.nombre}</span>
              <span className="text-xs text-gray-500 capitalize">{currentUser.rol}</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="text-xs text-gray-500 uppercase tracking-wide">
            Cambiar Usuario (Demo)
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {mockUsers.map((user) => (
            <DropdownMenuItem key={user.id} onClick={() => handleUserChange(user)} className="cursor-pointer p-4">
              <div className="flex items-center gap-3 w-full">
                <Avatar className="h-12 w-12 ring-2 ring-gray-100">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-red-100 text-red-600 font-semibold">{user.iniciales}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{user.nombre}</span>
                    {currentUser.id === user.id && <Check className="h-5 w-5 text-red-600 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  <Badge
                    variant="secondary"
                    className={`mt-1.5 text-xs ${
                      user.rol === "asesor" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                    }`}
                  >
                    {user.rol === "alumno" ? "Alumno" : "Asesor"}
                  </Badge>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function getCurrentUser() {
  if (typeof window === "undefined") return mockUsers[0]

  const savedUser = localStorage.getItem("univyy-current-user")
  if (savedUser) {
    return JSON.parse(savedUser)
  }
  return mockUsers[0]
}
