"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Send, ArrowLeft, Paperclip, MoreVertical, Phone, Video } from "lucide-react"
import { cn } from "@/lib/utils"

export default function MensajesPage() {
  const [selectedChat, setSelectedChat] = useState(1)
  const [messageInput, setMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // Mock data for conversations
  const conversations = [
    {
      id: 1,
      nombre: "María González",
      ultimoMensaje: "Perfecto, nos vemos mañana a las 2pm",
      timestamp: "Hace 5 min",
      unread: 0,
      online: true,
      avatar: "/portrait-thoughtful-woman.png",
    },
    {
      id: 2,
      nombre: "Carlos Ruiz",
      ultimoMensaje: "Te envío el material de apoyo",
      timestamp: "Hace 1 hora",
      unread: 2,
      online: false,
      avatar: "/portrait-carlos.png",
    },
    {
      id: 3,
      nombre: "Ana Martínez",
      ultimoMensaje: "¿Puedes ayudarme con ese ejercicio?",
      timestamp: "Hace 3 horas",
      unread: 0,
      online: true,
      avatar: "/ana-abstract-geometric.png",
    },
    {
      id: 4,
      nombre: "Diego López",
      ultimoMensaje: "Gracias por la sesión de hoy",
      timestamp: "Ayer",
      unread: 0,
      online: false,
      avatar: "/diego.jpg",
    },
    {
      id: 5,
      nombre: "Laura Sánchez",
      ultimoMensaje: "¿Tienes disponibilidad el viernes?",
      timestamp: "Hace 2 días",
      unread: 1,
      online: false,
      avatar: "/portrait-of-a-woman.png",
    },
  ]

  // Mock data for messages in the selected conversation
  const messages = [
    {
      id: 1,
      senderId: 1,
      senderName: "María González",
      content: "Hola Juan, ¿cómo estás?",
      timestamp: "10:30 AM",
      isOwn: false,
    },
    {
      id: 2,
      senderId: 0,
      senderName: "Tú",
      content: "Hola María, muy bien gracias. ¿Y tú?",
      timestamp: "10:32 AM",
      isOwn: true,
    },
    {
      id: 3,
      senderId: 1,
      senderName: "María González",
      content: "Bien también. Quería confirmar nuestra sesión de mañana.",
      timestamp: "10:33 AM",
      isOwn: false,
    },
    {
      id: 4,
      senderId: 0,
      senderName: "Tú",
      content: "Claro, ¿a las 2pm como habíamos quedado?",
      timestamp: "10:35 AM",
      isOwn: true,
    },
    {
      id: 5,
      senderId: 1,
      senderName: "María González",
      content: "Perfecto, nos vemos mañana a las 2pm",
      timestamp: "10:36 AM",
      isOwn: false,
    },
  ]

  const selectedConversation = conversations.find((c) => c.id === selectedChat)

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      console.log("[v0] Sending message:", messageInput)
      // Here you would add the message to the messages array
      setMessageInput("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-red-600">
              <ArrowLeft className="h-5 w-5" />
              <span>Volver al Dashboard</span>
            </Link>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Univyy</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Card className="border-gray-200 overflow-hidden">
          <div className="flex h-[calc(100vh-200px)]">
            {/* Conversations Sidebar */}
            <div className="w-full md:w-96 border-r border-gray-200 flex flex-col">
              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar conversaciones..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 border-gray-300"
                  />
                </div>
              </div>

              {/* Conversation List */}
              <ScrollArea className="flex-1">
                <div className="divide-y divide-gray-100">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedChat(conversation.id)}
                      className={cn(
                        "w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left",
                        selectedChat === conversation.id && "bg-red-50 hover:bg-red-50",
                      )}
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={conversation.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-red-100 text-red-600">
                            {conversation.nombre
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.online && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 truncate">{conversation.nombre}</h4>
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{conversation.timestamp}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 truncate">{conversation.ultimoMensaje}</p>
                          {conversation.unread > 0 && (
                            <Badge className="ml-2 bg-red-600 hover:bg-red-700 text-white flex-shrink-0">
                              {conversation.unread}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col hidden md:flex">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedConversation.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-red-100 text-red-600">
                            {selectedConversation.nombre
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        {selectedConversation.online && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedConversation.nombre}</h3>
                        <p className="text-xs text-gray-600">
                          {selectedConversation.online ? "En línea" : "Desconectado"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="text-gray-600">
                        <Phone className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-gray-600">
                        <Video className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-gray-600">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div key={message.id} className={cn("flex", message.isOwn ? "justify-end" : "justify-start")}>
                          <div className={cn("flex gap-2 max-w-[70%]", message.isOwn && "flex-row-reverse")}>
                            {!message.isOwn && (
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage src={selectedConversation.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="bg-red-100 text-red-600 text-xs">
                                  {selectedConversation.nombre
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                            )}

                            <div>
                              <div
                                className={cn(
                                  "rounded-2xl px-4 py-2",
                                  message.isOwn
                                    ? "bg-red-600 text-white rounded-br-sm"
                                    : "bg-gray-100 text-gray-900 rounded-bl-sm",
                                )}
                              >
                                <p className="text-sm leading-relaxed">{message.content}</p>
                              </div>
                              <span
                                className={cn(
                                  "text-xs text-gray-500 mt-1 block",
                                  message.isOwn ? "text-right" : "text-left",
                                )}
                              >
                                {message.timestamp}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex items-end gap-2">
                      <Button variant="ghost" size="icon" className="text-gray-600 flex-shrink-0">
                        <Paperclip className="h-5 w-5" />
                      </Button>

                      <div className="flex-1 relative">
                        <Input
                          type="text"
                          placeholder="Escribe un mensaje..."
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="border-gray-300 pr-12 resize-none"
                        />
                      </div>

                      <Button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim()}
                        className="bg-red-600 hover:bg-red-700 text-white flex-shrink-0"
                        size="icon"
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-1">Selecciona una conversación</p>
                    <p className="text-sm">Elige un chat de la lista para comenzar</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
