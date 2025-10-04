"use client"
import { AuthForm } from '@/components/auth-form'
import LoginForm from '@/components/login-form'
import React, { useEffect, useState } from 'react'
import { useRouter } from "next/navigation"

const Login = () => {
    const [isAuthenticated, setIsAuthenticated] = React.useState(false)
    const [username, setUsername] = React.useState("")

    if (!isAuthenticated) {
        return (
            <AuthForm
                onSuccess={(user) => {
                    setUsername(user)
                    setIsAuthenticated(true)
                }}
            />
        )
    }
    return (
        <div>
            <AuthForm onSuccess={(user) => {
                setUsername(user)
                setIsAuthenticated(true)
            }} />
        </div>
    )
}

export default Login