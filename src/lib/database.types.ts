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
      notes: {
        Row: {
          id: string
          patient_id: string | null
          content: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          patient_id?: string | null
          content: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string | null
          content?: string
          status?: string
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          patient_id: string | null
          predicted_type: string
          confidence: number
          created_at: string
          risk_factor_count: number
        }
        Insert: {
          id?: string
          patient_id?: string | null
          predicted_type: string
          confidence: number
          created_at?: string
          risk_factor_count?: number
        }
        Update: {
          id?: string
          patient_id?: string | null
          predicted_type?: string
          confidence?: number
          created_at?: string
          risk_factor_count?: number
        }
      }
      ner_results: {
        Row: {
          id: string
          note_id: string | null
          entity_type: string
          entity_value: string
          start_index: number | null
          end_index: number | null
        }
        Insert: {
          id?: string
          note_id?: string | null
          entity_type: string
          entity_value: string
          start_index?: number | null
          end_index?: number | null
        }
        Update: {
          id?: string
          note_id?: string | null
          entity_type?: string
          entity_value?: string
          start_index?: number | null
          end_index?: number | null
        }
      }
      risk_factors: {
        Row: {
          id: string
          patient_id: string | null
          factor: string
        }
        Insert: {
          id?: string
          patient_id?: string | null
          factor: string
        }
        Update: {
          id?: string
          patient_id?: string | null
          factor?: string
        }
      }
      model_metrics: {
        Row: {
          id: number
          accuracy: number | null
          ner_coverage: number | null
          last_updated: string
        }
        Insert: {
          id?: number
          accuracy?: number | null
          ner_coverage?: number | null
          last_updated?: string
        }
        Update: {
          id?: number
          accuracy?: number | null
          ner_coverage?: number | null
          last_updated?: string
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