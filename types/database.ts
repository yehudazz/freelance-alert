export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          service_description: string | null
          skills: string[]
          bio: string | null
          reddit_username: string | null
          subscription_tier: 'free' | 'starter' | 'pro'
          subscription_status: 'active' | 'cancelled' | 'trialing'
          stripe_customer_id: string | null
          notification_email: string | null
          notification_phone: string | null
          notify_via_email: boolean
          notify_via_sms: boolean
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          service_description?: string | null
          skills?: string[]
          bio?: string | null
          reddit_username?: string | null
          subscription_tier?: 'free' | 'starter' | 'pro'
          subscription_status?: 'active' | 'cancelled' | 'trialing'
          stripe_customer_id?: string | null
          notification_email?: string | null
          notification_phone?: string | null
          notify_via_email?: boolean
          notify_via_sms?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          service_description?: string | null
          skills?: string[]
          bio?: string | null
          reddit_username?: string | null
          subscription_tier?: 'free' | 'starter' | 'pro'
          subscription_status?: 'active' | 'cancelled' | 'trialing'
          stripe_customer_id?: string | null
          notification_email?: string | null
          notification_phone?: string | null
          notify_via_email?: boolean
          notify_via_sms?: boolean
          created_at?: string
        }
        Relationships: []
      }
      keywords: {
        Row: {
          id: string
          user_id: string
          keyword: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          keyword: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          keyword?: string
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'keywords_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      monitored_subreddits: {
        Row: {
          id: string
          user_id: string
          subreddit_name: string
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          subreddit_name: string
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          subreddit_name?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'monitored_subreddits_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      leads: {
        Row: {
          id: string
          user_id: string
          platform: 'reddit' | 'hackernews'
          post_id: string
          post_title: string
          post_body: string | null
          post_url: string
          author_username: string | null
          subreddit: string | null
          lead_score: number | null
          score_reason: string | null
          has_budget_mentioned: boolean
          budget_amount: string | null
          urgency_level: 'low' | 'medium' | 'high' | null
          drafted_message: string | null
          drafted_email_subject: string | null
          status: 'new' | 'viewed' | 'sent' | 'dismissed'
          found_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform?: 'reddit' | 'hackernews'
          post_id: string
          post_title: string
          post_body?: string | null
          post_url: string
          author_username?: string | null
          subreddit?: string | null
          lead_score?: number | null
          score_reason?: string | null
          has_budget_mentioned?: boolean
          budget_amount?: string | null
          urgency_level?: 'low' | 'medium' | 'high' | null
          drafted_message?: string | null
          drafted_email_subject?: string | null
          status?: 'new' | 'viewed' | 'sent' | 'dismissed'
          found_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: 'reddit' | 'hackernews'
          post_id?: string
          post_title?: string
          post_body?: string | null
          post_url?: string
          author_username?: string | null
          subreddit?: string | null
          lead_score?: number | null
          score_reason?: string | null
          has_budget_mentioned?: boolean
          budget_amount?: string | null
          urgency_level?: 'low' | 'medium' | 'high' | null
          drafted_message?: string | null
          drafted_email_subject?: string | null
          status?: 'new' | 'viewed' | 'sent' | 'dismissed'
          found_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'leads_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string
          plan: 'starter' | 'pro'
          status: string
          current_period_end: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id: string
          plan: 'starter' | 'pro'
          status: string
          current_period_end: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_subscription_id?: string
          plan?: 'starter' | 'pro'
          status?: string
          current_period_end?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'subscriptions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Keyword = Database['public']['Tables']['keywords']['Row']
export type MonitoredSubreddit = Database['public']['Tables']['monitored_subreddits']['Row']
export type Lead = Database['public']['Tables']['leads']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']

export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type KeywordInsert = Database['public']['Tables']['keywords']['Insert']
export type MonitoredSubredditInsert = Database['public']['Tables']['monitored_subreddits']['Insert']
export type LeadInsert = Database['public']['Tables']['leads']['Insert']
export type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert']

export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type KeywordUpdate = Database['public']['Tables']['keywords']['Update']
export type MonitoredSubredditUpdate = Database['public']['Tables']['monitored_subreddits']['Update']
export type LeadUpdate = Database['public']['Tables']['leads']['Update']
export type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update']
