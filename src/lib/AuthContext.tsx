import React, { createContext, useContext, useEffect, useState } from 'react'
import { authClient, dataClient } from './neon'

export interface User {
  id: string
  name: string
  email: string
  emailVerified?: boolean
  image?: string | null
  createdAt?: string | Date
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (data: { name: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>
  signIn: (data: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('nutriens_user')
    return saved ? JSON.parse(saved) : null
  })
  const [loading, setLoading] = useState(true)

  const refreshSession = async () => {
    try {
      const res = await authClient.getSession()
      if (res && res.data && res.data.user) {
        const u = res.data.user as unknown as User
        setUser(u)
        localStorage.setItem('nutriens_user', JSON.stringify(u))
      } else {
        setUser(null)
        localStorage.removeItem('nutriens_user')
      }
    } catch (err) {
      console.error('Erro ao verificar sessão:', err)
      setUser(null)
      localStorage.removeItem('nutriens_user')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshSession()
  }, [])

  const signUp = async ({ name, email, password }: { name: string; email: string; password: string }) => {
    try {
      // 1. Cadastrar usuário no Neon Auth
      const res = await authClient.signUp.email({
        name,
        email,
        password,
      })

      if (res.error) {
        return {
          success: false,
          error: res.error.message || 'Erro ao realizar o cadastro. Verifique os dados informados.',
        }
      }

      const rawUser = res.data?.user as any
      const newUser: User = rawUser ? {
        id: rawUser.id,
        name: rawUser.name || name,
        email: rawUser.email || email,
      } : {
        id: (res.data as any)?.id,
        name,
        email,
      }

      // 2. Garantir inserção do nutricionista na tabela public.nutricionistas
      try {
        await (dataClient as any).from('nutricionistas').upsert({
          id: newUser.id,
          nome: name,
          email: email,
        }, { onConflict: 'email' })
      } catch (dbErr) {
        console.warn('Nota de inserção na tabela nutricionistas:', dbErr)
      }

      setUser(newUser)
      localStorage.setItem('nutriens_user', JSON.stringify(newUser))
      return { success: true }
    } catch (err: any) {
      console.error('Falha no cadastro:', err)
      return {
        success: false,
        error: err?.message || 'Falha na conexão com o servidor de autenticação.',
      }
    }
  }

  const signIn = async ({ email, password }: { email: string; password: string }) => {
    try {
      const res = await authClient.signIn.email({
        email,
        password,
      })

      if (res.error) {
        let msg = 'Email ou senha incorretos. Por favor, tente novamente.'
        if (res.error.code === 'user_not_found') {
          msg = 'Não encontramos nenhuma conta com este email.'
        } else if (res.error.code === 'invalid_password' || res.error.code === 'invalid_credentials') {
          msg = 'Senha incorreta. Verifique suas credenciais.'
        } else if (res.error.message) {
          msg = res.error.message
        }
        return { success: false, error: msg }
      }

      const rawUser = res.data?.user as any
      const loggedUser: User = {
        id: rawUser.id,
        name: rawUser.name || 'Nutricionista',
        email: rawUser.email || email,
      }

      setUser(loggedUser)
      localStorage.setItem('nutriens_user', JSON.stringify(loggedUser))
      return { success: true }
    } catch (err: any) {
      console.error('Falha no login:', err)
      return {
        success: false,
        error: err?.message || 'Não foi possível conectar ao servidor. Verifique sua conexão.',
      }
    }
  }

  const signOut = async () => {
    try {
      await authClient.signOut()
    } catch (err) {
      console.error('Erro no logout:', err)
    } finally {
      setUser(null)
      localStorage.removeItem('nutriens_user')
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider')
  }
  return context
}
