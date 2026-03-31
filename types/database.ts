export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      subjects: {
        Row: {
          id: string
          user_id: string
          name: string
          semester: string
          color: string
          progress: number
          is_pinned: boolean
          exam_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          semester: string
          color: string
          progress?: number
          is_pinned?: boolean
          exam_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          semester?: string
          color?: string
          progress?: number
          is_pinned?: boolean
          exam_date?: string | null
          created_at?: string
        }
        Relationships: []
      }
      subject_resources: {
        Row: {
          id: string
          user_id: string
          subject_id: string
          title: string
          resource_type: Database["public"]["Enums"]["resource_type"]
          priority: Database["public"]["Enums"]["resource_priority"]
          unit_label: string | null
          topic_label: string | null
          url: string | null
          storage_bucket: string | null
          storage_path: string | null
          is_favorite: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject_id: string
          title: string
          resource_type: Database["public"]["Enums"]["resource_type"]
          priority?: Database["public"]["Enums"]["resource_priority"]
          unit_label?: string | null
          topic_label?: string | null
          url?: string | null
          storage_bucket?: string | null
          storage_path?: string | null
          is_favorite?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject_id?: string
          title?: string
          resource_type?: Database["public"]["Enums"]["resource_type"]
          priority?: Database["public"]["Enums"]["resource_priority"]
          unit_label?: string | null
          topic_label?: string | null
          url?: string | null
          storage_bucket?: string | null
          storage_path?: string | null
          is_favorite?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subject_resources_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          }
        ]
      }
      notes: {
        Row: {
          id: string
          user_id: string
          subject_id: string
          title: string
          content: string
          tags: string[]
          is_pinned: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject_id: string
          title: string
          content?: string
          tags?: string[]
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject_id?: string
          title?: string
          content?: string
          tags?: string[]
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          }
        ]
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          subject_id: string
          title: string
          due_date: string
          priority: Database["public"]["Enums"]["task_priority"]
          status: Database["public"]["Enums"]["task_status"]
          revision_round: number
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject_id: string
          title: string
          due_date: string
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          revision_round?: number
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject_id?: string
          title?: string
          due_date?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          revision_round?: number
          sort_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          }
        ]
      }
      videos: {
        Row: {
          id: string
          user_id: string
          subject_id: string
          title: string
          url: string
          total_videos: number
          completed_videos: number
          last_watched: string | null
          note_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject_id: string
          title: string
          url: string
          total_videos?: number
          completed_videos?: number
          last_watched?: string | null
          note_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject_id?: string
          title?: string
          url?: string
          total_videos?: number
          completed_videos?: number
          last_watched?: string | null
          note_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "videos_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          }
        ]
      }
      subject_checklists: {
        Row: {
          id: string
          user_id: string
          subject_id: string
          checklist_type: Database["public"]["Enums"]["checklist_type"]
          title: string
          unit_label: string | null
          is_completed: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject_id: string
          checklist_type?: Database["public"]["Enums"]["checklist_type"]
          title: string
          unit_label?: string | null
          is_completed?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject_id?: string
          checklist_type?: Database["public"]["Enums"]["checklist_type"]
          title?: string
          unit_label?: string | null
          is_completed?: boolean
          sort_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subject_checklists_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      resource_type:
        | "course_link"
        | "youtube_playlist"
        | "github_repo"
        | "drive_link"
        | "syllabus_pdf"
        | "pyq_pdf"
        | "ebook_pdf"
      resource_priority: "low" | "medium" | "high"
      checklist_type: "topic" | "revision" | "syllabus"
      task_priority: "low" | "medium" | "high"
      task_status: "todo" | "in_progress" | "completed"
    }
    CompositeTypes: Record<string, never>
  }
}
