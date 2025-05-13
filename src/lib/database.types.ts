export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string
          name: string
          age: number
          gender: string
          status: string
          diagnosis: string
          last_visit: string
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          age: number
          gender: string
          status: string
          diagnosis: string
          last_visit?: string
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          age?: number
          gender?: string
          status?: string
          diagnosis?: string
          last_visit?: string
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}