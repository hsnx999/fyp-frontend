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
          date_of_birth: string | null
          phone_number: string | null
          email_address: string | null
          address: string | null
          medical_history_summary: string | null
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
          date_of_birth?: string | null
          phone_number?: string | null
          email_address?: string | null
          address?: string | null
          medical_history_summary?: string | null
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
          date_of_birth?: string | null
          phone_number?: string | null
          email_address?: string | null
          address?: string | null
          medical_history_summary?: string | null
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
          analysis_id: string | null
          risk_scores_json: Json | null
          critical_findings: boolean | null
          status: string | null
        }
        Insert: {
          id?: string
          patient_id?: string | null
          predicted_type: string
          confidence: number
          created_at?: string
          risk_factor_count?: number
          analysis_id?: string | null
          risk_scores_json?: Json | null
          critical_findings?: boolean | null
          status?: string | null
        }
        Update: {
          id?: string
          patient_id?: string | null
          predicted_type?: string
          confidence?: number
          created_at?: string
          risk_factor_count?: number
          analysis_id?: string | null
          risk_scores_json?: Json | null
          critical_findings?: boolean | null
          status?: string | null
        }
      }
      ct_analysis_results: {
        Row: {
          id: string
          patient_id: string
          analysis_id: string
          image_url: string | null
          prediction_type: string
          confidence: number
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          analysis_id: string
          image_url?: string | null
          prediction_type: string
          confidence: number
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          analysis_id?: string
          image_url?: string | null
          prediction_type?: string
          confidence?: number
          created_at?: string
        }
      }
      clinical_notes_results: {
        Row: {
          id: string
          patient_id: string
          analysis_id: string
          notes_content: string
          extracted_entities_json: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          analysis_id: string
          notes_content: string
          extracted_entities_json?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          analysis_id?: string
          notes_content?: string
          extracted_entities_json?: Json | null
          created_at?: string
        }
      }
      medications_treatments: {
        Row: {
          id: string
          patient_id: string
          analysis_id: string
          medication_name: string
          dosage: string | null
          start_date: string | null
          end_date: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          analysis_id: string
          medication_name: string
          dosage?: string | null
          start_date?: string | null
          end_date?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          analysis_id?: string
          medication_name?: string
          dosage?: string | null
          start_date?: string | null
          end_date?: string | null
          notes?: string | null
          created_at?: string
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
      get_trend_data: {
        Args: {
          start_date: string
          trend_interval: string
        }
        Returns: {
          date: string
          patients: number
          reports: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}