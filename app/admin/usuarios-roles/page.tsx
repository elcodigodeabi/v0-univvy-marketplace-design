"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Search, AlertCircle, Loader2 } from "lucide-react"

interface User {
  id: string
  email: string
  full_name: string
  role: "alumno" | "asesor" | "administrador"
  created_at: string
}

export default function UsuariosRolesPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<"todos" | "alumno" | "asesor" | "administrador">("todos")
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    let filtered = users
    if (searchQuery) {
      filtered = filtered.filter(
        (u) =>
          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    if (roleFilter !== "todos") {
      filtered = filtered.filter((u) => u.role === roleFilter)
    }
    setFilteredUsers(filtered)
  }, [users, searchQuery, roleFilter])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/users")
      if (!response.ok) throw new Error("Error al cargar usuarios")
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      toast.error("Error al cargar usuarios")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: "alumno" | "asesor" | "administrador") => {
    try {
      setUpdatingId(userId)
      const response = await fetch("/api/admin/users/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      })
      if (!response.ok) throw new Error("Error al actualizar rol")
      
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
      toast.success(`Rol actualizado a ${newRole}`)
    } catch (error) {
      toast.error("Error al actualizar el rol")
      console.error(error)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div>
      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios y Roles</h1>
          <p className="text-sm text-gray-600">Verifica y ajusta los roles de usuarios (alumnos, asesores y administradores)</p>
        </div>
        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">{users.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Alumnos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{users.filter((u) => u.role === "alumno").length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Asesores</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">{users.filter((u) => u.role === "asesor").length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Administradores</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">
                {users.filter((u) => u.role === "administrador").length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Buscar y Filtrar</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar por email o nombre</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="search"
                  placeholder="ejemplo@correo.com"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-filter">Filtrar por rol</Label>
              <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as any)}>
                <SelectTrigger id="role-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los usuarios</SelectItem>
                  <SelectItem value="alumno">Solo alumnos</SelectItem>
                  <SelectItem value="asesor">Solo asesores</SelectItem>
                  <SelectItem value="administrador">Solo administradores</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuarios</CardTitle>
            <CardDescription>{filteredUsers.length} usuarios encontrados</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
 <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <AlertCircle className="mb-2 h-5 w-5" />
                <p>No se encontraron usuarios</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Nombre</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Rol Actual</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Cambiar Rol</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Registro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900">{user.email}</td>
                        <td className="px-4 py-3 text-gray-900">{user.full_name}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge
                            variant={user.role === "administrador" ? "outline" : "default"}
                            className={
                              user.role === "administrador"
                                ? "border-purple-300 text-purple-700"
                                : user.role === "asesor"
                                  ? "bg-red-600 hover:bg-red-600"
                                  : "bg-blue-600 hover:bg-blue-600"
                            }
                          >
                            {user.role === "administrador" ? "Administrador" : user.role === "asesor" ? "Asesor" : "Alumno"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Select
                            value={user.role}
                            onValueChange={(newRole) =>
                              updateUserRole(user.id, newRole as "alumno" | "asesor" | "administrador")
                            }
                            disabled={updatingId === user.id}
                          >
                            <SelectTrigger className="w-36">
                              {updatingId === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <SelectValue />}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="alumno">Alumno</SelectItem>
                              <SelectItem value="asesor">Asesor</SelectItem>
                              <SelectItem value="administrador">Administrador</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">
                          {new Date(user.created_at).toLocaleDateString("es-ES")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
